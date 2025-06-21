# Profile Settings & Pictures Setup Guide

This guide provides the steps to set up the database and storage for the new Profile Settings feature, including profile picture uploads.

## 1. Update User Table Schema

If you haven't already, run the following SQL script in your Supabase SQL Editor to add the necessary columns to your `users` table.

```sql
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
```

## 2. Set Up Supabase Storage for Profile Pictures

### Create a Storage Bucket
1.  In your Supabase project, go to **Storage** from the sidebar.
2.  Click on **Create a new bucket**.
3.  For the **Bucket name**, enter `profile-pictures`.
4.  Ensure the bucket is marked as **Public**.
5.  Click **Create bucket**.

### Configure Storage Policies
1.  After creating the bucket, navigate to its policies by clicking on the bucket and then on **Policies**.
2.  You will need to add policies to control access. Create a new policy for each required operation.

**SELECT Policy (Public Read Access):**
*   **Policy Name**: `Allow public read access`
*   **Allowed operations**: `SELECT`
*   **Target roles**: `anon`, `authenticated`
*   **USING expression**: `true`

**INSERT Policy (Authenticated Uploads):**
*   **Policy Name**: `Allow authenticated users to upload`
*   **Allowed operation**: `INSERT`
*   **Target roles**: `authenticated`
*   **WITH CHECK expression**: `bucket_id = 'profile-pictures'`

**UPDATE Policy (Authenticated Updates):**
*   **Policy Name**: `Allow authenticated users to update`
*   **Allowed operation**: `UPDATE`
*   **Target roles**: `authenticated`
*   **WITH CHECK expression**: `bucket_id = 'profile-pictures'` 