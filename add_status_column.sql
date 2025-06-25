-- Add status column to field_visits table
ALTER TABLE field_visits 
ADD COLUMN status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled'));

-- Update existing records to have 'Completed' status if they have measurements
UPDATE field_visits 
SET status = 'Completed' 
WHERE soil_ph IS NOT NULL OR sap_ph IS NOT NULL OR plant_height IS NOT NULL;

-- Create index on status for better query performance
CREATE INDEX idx_field_visits_status ON field_visits(status); 