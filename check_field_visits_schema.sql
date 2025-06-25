-- Check current schema of field_visits table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'field_visits' 
ORDER BY ordinal_position;

-- Check if status column exists and its current definition
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'field_visits' AND column_name = 'status'; 