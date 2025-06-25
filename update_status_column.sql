-- Safe update script for field_visits status column
-- First, check if status column exists
DO $$
BEGIN
    -- Add status column only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_visits' AND column_name = 'status'
    ) THEN
        ALTER TABLE field_visits ADD COLUMN status TEXT DEFAULT 'Scheduled';
    END IF;
    
    -- Add check constraint only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%field_visits_status%'
    ) THEN
        ALTER TABLE field_visits 
        ADD CONSTRAINT field_visits_status_check 
        CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled'));
    END IF;
END $$;

-- Update existing records to have 'Completed' status if they have measurements
UPDATE field_visits 
SET status = 'Completed' 
WHERE (soil_ph IS NOT NULL OR sap_ph IS NOT NULL OR plant_height IS NOT NULL)
AND (status IS NULL OR status = 'Scheduled');

-- Create index on status for better query performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_field_visits_status ON field_visits(status);

-- Verify the current status of the table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'field_visits' 
ORDER BY ordinal_position; 