-- Field Visits Storage Policies Setup
-- Run this script after creating the 'field-visits' bucket

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Policy for public read access (SELECT)
-- This allows anyone to view the uploaded images
CREATE POLICY "Allow public read access to field visit images" ON storage.objects
FOR SELECT USING (bucket_id = 'field-visits');

-- 2. Policy for authenticated users to upload images (INSERT)
-- This allows logged-in users to upload new images
CREATE POLICY "Allow authenticated users to upload field visit images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);

-- 3. Policy for authenticated users to update images (UPDATE)
-- This allows logged-in users to update their uploaded images
CREATE POLICY "Allow authenticated users to update field visit images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);

-- 4. Policy for authenticated users to delete images (DELETE)
-- This allows logged-in users to delete their uploaded images
CREATE POLICY "Allow authenticated users to delete field visit images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);

-- Alternative approach using RLS policies (if the above doesn't work)
-- Uncomment the following if the storage.policies table approach doesn't work

/*
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access to field visit images" ON storage.objects
FOR SELECT USING (bucket_id = 'field-visits');

-- Policy for authenticated upload
CREATE POLICY "Allow authenticated users to upload field visit images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);

-- Policy for authenticated update
CREATE POLICY "Allow authenticated users to update field visit images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);

-- Policy for authenticated delete
CREATE POLICY "Allow authenticated users to delete field visit images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'field-visits' 
    AND auth.role() = 'authenticated'
);
*/ 