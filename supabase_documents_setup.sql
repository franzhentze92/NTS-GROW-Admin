-- Documents Management System Database Setup for Supabase

-- 1. Create a new storage bucket for document uploads
-- Go to your Supabase project > Storage > Buckets > Create a new bucket
-- Bucket name: document_uploads
-- Public: false (for restricted access)

-- 2. Create the documents table to store file metadata
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    file_type VARCHAR(50),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by_user_id ON documents(uploaded_by_user_id);

-- 4. Enable Row Level Security (RLS) on the documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the documents table
-- Allow all authenticated users to view all documents
CREATE POLICY "Allow authenticated users to view documents" 
ON documents FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to upload new documents
CREATE POLICY "Allow authenticated users to upload documents" 
ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by_user_id);

-- Allow users to update their own documents (or admins)
CREATE POLICY "Allow users to update their own documents" 
ON documents FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by_user_id) 
WITH CHECK (auth.uid() = uploaded_by_user_id);

-- Allow users to delete their own documents (or admins)
CREATE POLICY "Allow users to delete their own documents" 
ON documents FOR DELETE TO authenticated USING (auth.uid() = uploaded_by_user_id);

-- 6. Set up Storage policies for the 'document_uploads' bucket
-- Go to Storage > Policies > document_uploads and create policies.

-- Example Policy: Allow authenticated users to view their own files
-- This policy assumes filenames are stored in a path like 'public/user_id/filename'
-- You might need to adjust based on your file path strategy.
-- For simplicity, let's start with broader policies and refine later.

-- Policy Name: Allow select access to authenticated users
-- Allowed operations: SELECT
-- Target roles: authenticated
-- USING expression: (bucket_id = 'document_uploads')

-- Policy Name: Allow insert access to authenticated users
-- Allowed operations: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: (bucket_id = 'document_uploads')

-- 7. Create a trigger to update the 'updated_at' timestamp
-- This uses the function created in 'supabase_messaging_setup.sql'
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 