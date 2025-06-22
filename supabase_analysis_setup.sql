-- Supabase script for setting up the analysis tracker feature

-- 1. Create the analysis_tracker table with step tracking
-- This table will store all the information related to soil and leaf analysis tracking.
CREATE TABLE IF NOT EXISTS public.analysis_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT NOT NULL,
    consultant TEXT NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('soil', 'leaf')),
    crop TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ready to be Checked', 'Checked Ready to be Emailed', 'Emailed')),
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    eal_lab_no TEXT,
    test_count INTEGER,
    notes TEXT,
    pdf_file_path TEXT,
    sample_no TEXT,
    -- Step tracking fields
    draft_by TEXT,
    draft_date TIMESTAMP WITH TIME ZONE,
    ready_check_by TEXT,
    ready_check_date TIMESTAMP WITH TIME ZONE,
    checked_by TEXT,
    checked_date TIMESTAMP WITH TIME ZONE,
    emailed_by TEXT,
    emailed_date TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security (RLS)
-- This ensures that your data is secure and only accessible by authorized users.
ALTER TABLE public.analysis_tracker ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- These policies define the rules for who can access or modify the data.

-- Allow any authenticated user to view all analysis records.
CREATE POLICY "Users can view all analysis records" ON public.analysis_tracker
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow any authenticated user to create a new analysis record.
CREATE POLICY "Users can insert analysis records" ON public.analysis_tracker
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to update an existing analysis record.
CREATE POLICY "Users can update analysis records" ON public.analysis_tracker
FOR UPDATE USING (auth.role() = 'authenticated');

-- Only allow 'super-admin' role to delete records.
CREATE POLICY "Users can delete analysis records" ON public.analysis_tracker
FOR DELETE USING (auth.role() = 'authenticated');

-- Grant usage on schema to service_role to allow table creation
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.analysis_tracker TO service_role;
GRANT ALL ON SEQUENCE analysis_tracker_id_seq TO service_role; -- If you use a sequence for ID

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_tracker_status ON public.analysis_tracker(status);
CREATE INDEX IF NOT EXISTS idx_analysis_tracker_consultant ON public.analysis_tracker(consultant);
CREATE INDEX IF NOT EXISTS idx_analysis_tracker_client_name ON public.analysis_tracker(client_name);
CREATE INDEX IF NOT EXISTS idx_analysis_tracker_created_at ON public.analysis_tracker(created_at DESC); 