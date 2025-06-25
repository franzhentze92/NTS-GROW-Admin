-- Temporarily disable RLS on field_visits table for testing
-- This will allow all operations without any restrictions

-- Disable RLS
ALTER TABLE field_visits DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'field_visits';

-- Note: This is for testing only. In production, you should re-enable RLS
-- with proper policies that work with your authentication system. 