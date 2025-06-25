-- Fix RLS policy for field_visits table to work with mock authentication
-- This script will create policies that work with the mock user system

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'field_visits';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can view their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can update their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can delete their own field visits" ON field_visits;

-- For testing purposes, create a more permissive policy that allows all operations
-- This will allow the mock users to work with field visits
CREATE POLICY "Allow all operations for testing" ON field_visits
FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on the table if not already enabled
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'field_visits';

-- Also, let's make sure the users table has the mock users
INSERT INTO users (id, name, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Super Admin', 'superadmin@ntsgrow.com', 'super-admin'),
  ('22222222-2222-2222-2222-222222222222', 'Admin User', 'admin@ntsgrow.com', 'admin'),
  ('33333333-3333-3333-3333-333333333333', 'Agronomist', 'agronomist@ntsgrow.com', 'agronomist')
ON CONFLICT (id) DO NOTHING; 