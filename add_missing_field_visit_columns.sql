-- Add missing columns to existing field_visits table
-- Run this script to add the new agronomy columns

-- Add new agronomy measurement columns
ALTER TABLE field_visits 
ADD COLUMN IF NOT EXISTS penetrometer NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS soil_electroconductivity NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS sap_electroconductivity NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS chlorophyll_reading NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS soil_paramagnetism NUMERIC(8,2);

-- Add missing basic columns if they don't exist
ALTER TABLE field_visits 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS farm TEXT,
ADD COLUMN IF NOT EXISTS paddock TEXT,
ADD COLUMN IF NOT EXISTS crop TEXT,
ADD COLUMN IF NOT EXISTS visit_reason TEXT,
ADD COLUMN IF NOT EXISTS soil_ph NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS soil_texture TEXT,
ADD COLUMN IF NOT EXISTS plant_height NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS fruiting TEXT,
ADD COLUMN IF NOT EXISTS sap_ph NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS sap_nitrate NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS sap_calcium NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS sap_magnesium NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS sap_potassium NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS sap_sodium NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS in_field_observations TEXT,
ADD COLUMN IF NOT EXISTS general_comments TEXT,
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Create indexes for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_field_visits_visit_date ON field_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_field_visits_consultant ON field_visits(consultant);
CREATE INDEX IF NOT EXISTS idx_field_visits_client ON field_visits(client);
CREATE INDEX IF NOT EXISTS idx_field_visits_crop ON field_visits(crop);
CREATE INDEX IF NOT EXISTS idx_field_visits_created_by ON field_visits(created_by);

-- Ensure RLS is enabled
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_field_visits_updated_at ON field_visits;
CREATE TRIGGER update_field_visits_updated_at BEFORE UPDATE ON field_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 