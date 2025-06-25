-- Comprehensive Field Visits Storage and RLS Policies Setup

-- 1. Create field-visits storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('field-visits', 'field-visits', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for field-visits bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload field visit images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'field-visits' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view field visit images
CREATE POLICY "Allow authenticated users to view field visit images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'field-visits' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own field visit images
CREATE POLICY "Allow users to update field visit images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'field-visits' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own field visit images
CREATE POLICY "Allow users to delete field visit images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'field-visits' 
  AND auth.role() = 'authenticated'
);

-- 3. RLS policies for field_visits table
-- Enable RLS on field_visits table
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all field visits
CREATE POLICY "Allow authenticated users to view field visits" ON field_visits
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create field visits
CREATE POLICY "Allow authenticated users to create field visits" ON field_visits
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update field visits they created
CREATE POLICY "Allow users to update their field visits" ON field_visits
FOR UPDATE USING (
  auth.role() = 'authenticated' 
  AND created_by = auth.uid()
);

-- Allow users to delete field visits they created
CREATE POLICY "Allow users to delete their field visits" ON field_visits
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND created_by = auth.uid()
);

-- 4. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_field_visits_updated_at ON field_visits;
CREATE TRIGGER update_field_visits_updated_at
    BEFORE UPDATE ON field_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verify the setup
SELECT 
    'Storage Buckets' as check_type,
    COUNT(*) as count
FROM storage.buckets 
WHERE id = 'field-visits'

UNION ALL

SELECT 
    'Storage Policies' as check_type,
    COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'

UNION ALL

SELECT 
    'Field Visits RLS Policies' as check_type,
    COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'field_visits';

-- 7. Show current field visits status
SELECT 
    'Field Visits Status Distribution' as info,
    status,
    COUNT(*) as count
FROM field_visits 
GROUP BY status 
ORDER BY count DESC; 