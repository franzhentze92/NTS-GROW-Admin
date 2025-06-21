# Documents Management Setup Guide

This guide provides the steps to set up the database and storage for the new Documents Management feature in the admin dashboard.

## 1. Set Up Supabase Database

### Run the SQL Script
1.  Navigate to your Supabase project.
2.  Go to the **SQL Editor** from the sidebar.
3.  Click on **New query**.
4.  Copy the entire content of the `supabase_documents_setup.sql` file.
5.  Paste the script into the SQL editor.
6.  Click **Run** to execute the script. This will create the `documents` table, set up indexes, and apply row-level security policies.

## 2. Set Up Supabase Storage

### Create a Storage Bucket
1.  In your Supabase project, go to **Storage** from the sidebar.
2.  Click on **Create a new bucket**.
3.  For the **Bucket name**, enter `document_uploads`.
4.  Ensure the bucket is **not** marked as Public.
5.  Click **Create bucket**.

### Configure Storage Policies
1.  After creating the bucket, navigate to its policies by clicking on the bucket and then on **Policies**.
2.  You will need to add policies to control access (SELECT, INSERT, UPDATE, DELETE).
3.  Use the example policies from the `supabase_documents_setup.sql` file as a starting point. Create a new policy for each required operation.

**Example: INSERT Policy**
*   **Policy Name**: `Allow authenticated users to upload`
*   **Allowed operation**: `INSERT`
*   **Target roles**: `authenticated`
*   **WITH CHECK expression**: `bucket_id = 'document_uploads'`

Create similar policies for `SELECT`, `UPDATE`, and `DELETE` as needed, adjusting the expressions to match your security requirements. For now, allowing all authenticated users to perform these actions on the `document_uploads` bucket is a good starting point. 