-- Fix existing status column data and constraints
-- Update existing records to have 'Completed' status if they have measurements
UPDATE field_visits 
SET status = 'Completed' 
WHERE (soil_ph IS NOT NULL OR sap_ph IS NOT NULL OR plant_height IS NOT NULL)
AND (status IS NULL OR status = 'Scheduled');

-- Set default status for records that don't have any status
UPDATE field_visits 
SET status = 'Scheduled' 
WHERE status IS NULL;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%field_visits_status%'
    ) THEN
        ALTER TABLE field_visits 
        ADD CONSTRAINT field_visits_status_check 
        CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled'));
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_field_visits_status ON field_visits(status);

-- Show current status distribution
SELECT status, COUNT(*) as count
FROM field_visits 
GROUP BY status 
ORDER BY count DESC; 