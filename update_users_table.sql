-- Add address and phone_number columns to the users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- Note: The RLS policies for the 'users' table might need to be updated
-- to allow users to update their own new profile information.
-- Supabase Studio may have created default policies. If not, you can use these:

-- First, ensure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Allow individual user access to their own data"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Allow users to update their own data"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id); 