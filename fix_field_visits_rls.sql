-- Fix RLS policy for field_visits table
-- This script will update the RLS policy to allow authenticated users to insert field visits

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'field_visits';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can view their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can update their own field visits" ON field_visits;
DROP POLICY IF EXISTS "Users can delete their own field visits" ON field_visits;

-- Create new policies that work with the current table structure
-- Policy for inserting field visits
CREATE POLICY "Users can insert their own field visits" ON field_visits
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy for viewing field visits (users can see their own)
CREATE POLICY "Users can view their own field visits" ON field_visits
FOR SELECT USING (auth.uid() = created_by);

-- Policy for updating field visits (users can update their own)
CREATE POLICY "Users can update their own field visits" ON field_visits
FOR UPDATE USING (auth.uid() = created_by);

-- Policy for deleting field visits (users can delete their own)
CREATE POLICY "Users can delete their own field visits" ON field_visits
FOR DELETE USING (auth.uid() = created_by);

-- Enable RLS on the table if not already enabled
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'field_visits'; 