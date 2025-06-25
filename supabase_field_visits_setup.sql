-- Field Visits Management System Database Setup for Supabase

-- 1. Create a new storage bucket for field visit images
-- Go to your Supabase project > Storage > Buckets > Create a new bucket
-- Bucket name: field-visits
-- Public: true (for easy image viewing)

-- 2. Create the field_visits table to store visit data
CREATE TABLE IF NOT EXISTS field_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_date DATE NOT NULL,
    consultant TEXT NOT NULL,
    client TEXT NOT NULL,
    address TEXT,
    farm TEXT,
    paddock TEXT,
    crop TEXT,
    visit_reason TEXT,
    soil_ph NUMERIC(4,2),
    soil_texture TEXT,
    plant_height NUMERIC(6,2),
    fruiting TEXT,
    sap_ph NUMERIC(4,2),
    sap_nitrate NUMERIC(6,2),
    sap_calcium NUMERIC(6,2),
    sap_magnesium NUMERIC(6,2),
    sap_potassium NUMERIC(6,2),
    sap_sodium NUMERIC(6,2),
    penetrometer NUMERIC(8,2),
    soil_electroconductivity NUMERIC(6,2),
    sap_electroconductivity NUMERIC(6,2),
    chlorophyll_reading NUMERIC(6,2),
    soil_paramagnetism NUMERIC(8,2),
    in_field_observations TEXT,
    general_comments TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_field_visits_visit_date ON field_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_field_visits_consultant ON field_visits(consultant);
CREATE INDEX IF NOT EXISTS idx_field_visits_client ON field_visits(client);
CREATE INDEX IF NOT EXISTS idx_field_visits_crop ON field_visits(crop);
CREATE INDEX IF NOT EXISTS idx_field_visits_created_by ON field_visits(created_by);

-- 4. Enable Row Level Security (RLS) on the field_visits table
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the field_visits table
-- Allow all authenticated users to view all field visits
CREATE POLICY "Allow authenticated users to view field visits" 
ON field_visits FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to create new field visits
CREATE POLICY "Allow authenticated users to create field visits" 
ON field_visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own field visits (or admins)
CREATE POLICY "Allow users to update their own field visits" 
ON field_visits FOR UPDATE TO authenticated USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own field visits (or admins)
CREATE POLICY "Allow users to delete their own field visits" 
ON field_visits FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 6. Create a trigger to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_field_visits_updated_at BEFORE UPDATE ON field_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Set up Storage policies for the 'field-visits' bucket
-- Go to Storage > Policies > field-visits and create policies.

-- Policy Name: Allow public read access to field visit images
-- Allowed operations: SELECT
-- Target roles: anon, authenticated
-- USING expression: (bucket_id = 'field-visits')

-- Policy Name: Allow authenticated users to upload field visit images
-- Allowed operations: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: (bucket_id = 'field-visits')

-- Policy Name: Allow authenticated users to update their own field visit images
-- Allowed operations: UPDATE
-- Target roles: authenticated
-- USING expression: (bucket_id = 'field-visits')
-- WITH CHECK expression: (bucket_id = 'field-visits')

-- Policy Name: Allow authenticated users to delete their own field visit images
-- Allowed operations: DELETE
-- Target roles: authenticated
-- USING expression: (bucket_id = 'field-visits') 