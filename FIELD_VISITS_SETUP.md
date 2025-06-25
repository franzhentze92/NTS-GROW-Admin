# Field Visits Management Setup Guide

This guide provides the steps to set up the database and storage for the Field Visits Management feature.

## 1. Set Up Supabase Storage

### Create a Storage Bucket
1. Navigate to your Supabase project.
2. Go to **Storage** from the sidebar.
3. Click on **Create a new bucket**.
4. For the **Bucket name**, enter `field-visits`.
5. Ensure the bucket is marked as **Public** (for easy image viewing).
6. Click **Create bucket**.

### Configure Storage Policies
1. After creating the bucket, navigate to its policies by clicking on the bucket and then on **Policies**.
2. Create the following policies:

**SELECT Policy (Public Read Access):**
- **Policy Name**: `Allow public read access`
- **Allowed operations**: `SELECT`
- **Target roles**: `anon`, `authenticated`
- **USING expression**: `bucket_id = 'field-visits'`

**INSERT Policy (Authenticated Upload):**
- **Policy Name**: `Allow authenticated users to upload`
- **Allowed operations**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `bucket_id = 'field-visits'`

**UPDATE Policy (Authenticated Update):**
- **Policy Name**: `Allow authenticated users to update`
- **Allowed operations**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'field-visits'`
- **WITH CHECK expression**: `bucket_id = 'field-visits'`

**DELETE Policy (Authenticated Delete):**
- **Policy Name**: `Allow authenticated users to delete`
- **Allowed operations**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'field-visits'`

## 2. Set Up Supabase Database

### Run the SQL Script
1. Navigate to your Supabase project.
2. Go to the **SQL Editor** from the sidebar.
3. Click on **New query**.
4. Copy the entire content of the `supabase_field_visits_setup.sql` file.
5. Paste the script into the SQL editor.
6. Click **Run** to execute the script.

This will:
- Create the `field_visits` table with all necessary columns
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create RLS policies for data access control
- Create a trigger to automatically update timestamps

## 3. Verify Setup

After completing the setup:

1. **Check Storage Bucket**: Go to Storage > Buckets and verify that `field-visits` bucket exists and is public.

2. **Check Database Table**: Go to Table Editor and verify that the `field_visits` table exists with all the expected columns.

3. **Test Image Upload**: Try creating a new field visit with image uploads to ensure everything works correctly.

## 4. Troubleshooting

### "Bucket not found" Error
If you still get "Bucket not found" errors:
1. Double-check that the bucket name is exactly `field-visits` (with hyphen)
2. Ensure the bucket is created and public
3. Verify that the storage policies are correctly configured
4. Check that your Supabase environment variables are correctly set

### Database Connection Issues
If you have database connection issues:
1. Verify your Supabase URL and API keys in `.env.local`
2. Check that the `field_visits` table was created successfully
3. Ensure RLS policies are properly configured

## 5. Features Available

Once set up, you'll have access to:
- **Comprehensive Field Visit Forms** with all agronomy measurements
- **Multiple Image Uploads** for each field visit
- **Dropdown Selections** for consultants, clients, farms, paddocks, crops, etc.
- **Advanced Soil and Plant Measurements** including:
  - Soil pH, texture, electroconductivity, paramagnetism
  - Plant height, fruiting status, chlorophyll readings
  - Sap analysis (pH, nitrate, calcium, magnesium, potassium, sodium, electroconductivity)
  - Penetrometer readings
- **Full CRUD Operations** (Create, Read, Update, Delete)
- **Search and Filter** capabilities
- **Analytics and Reporting** features 