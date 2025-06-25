-- Migration script to update analysis_tracker table for four-step workflow
-- Run this after the initial table creation

-- Add step tracking columns
ALTER TABLE public.analysis_tracker 
ADD COLUMN IF NOT EXISTS draft_by TEXT,
ADD COLUMN IF NOT EXISTS draft_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ready_check_by TEXT,
ADD COLUMN IF NOT EXISTS ready_check_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_by TEXT,
ADD COLUMN IF NOT EXISTS checked_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emailed_by TEXT,
ADD COLUMN IF NOT EXISTS emailed_date TIMESTAMP WITH TIME ZONE;

-- Add PDF file path column
ALTER TABLE public.analysis_tracker 
ADD COLUMN IF NOT EXISTS pdf_file_path TEXT;

-- Add sample number column
ALTER TABLE public.analysis_tracker 
ADD COLUMN IF NOT EXISTS sample_no TEXT;

-- Update existing status values to match new enum
UPDATE public.analysis_tracker 
SET status = 'Ready to be Checked' 
WHERE status = 'Pending Check';

UPDATE public.analysis_tracker 
SET status = 'Checked Ready to be Emailed' 
WHERE status = 'Completed';

-- Add constraint for new status values
ALTER TABLE public.analysis_tracker 
DROP CONSTRAINT IF EXISTS analysis_tracker_status_check;

ALTER TABLE public.analysis_tracker 
ADD CONSTRAINT analysis_tracker_status_check 
CHECK (status IN ('Draft', 'Ready to be Checked', 'Checked Ready to be Emailed', 'Emailed'));

-- Add constraint for analysis_type if not exists
ALTER TABLE public.analysis_tracker 
DROP CONSTRAINT IF EXISTS analysis_tracker_analysis_type_check;

ALTER TABLE public.analysis_tracker 
ADD CONSTRAINT analysis_tracker_analysis_type_check 
CHECK (analysis_type IN ('soil', 'leaf'));

-- Update script to add missing columns to analysis_tracker table
-- Run this in your Supabase SQL editor if you're getting column not found errors

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add checked_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'checked_by') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN checked_by TEXT;
    END IF;

    -- Add checked_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'checked_date') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN checked_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add draft_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'draft_by') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN draft_by TEXT;
    END IF;

    -- Add draft_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'draft_date') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN draft_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add ready_check_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'ready_check_by') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN ready_check_by TEXT;
    END IF;

    -- Add ready_check_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'ready_check_date') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN ready_check_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add emailed_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'emailed_by') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN emailed_by TEXT;
    END IF;

    -- Add emailed_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'emailed_date') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN emailed_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add status_updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'status_updated_at') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    -- Add updated_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'analysis_tracker' AND column_name = 'updated_by') THEN
        ALTER TABLE public.analysis_tracker ADD COLUMN updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'analysis_tracker' 
ORDER BY ordinal_position;

-- Drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete analysis records" ON public.analysis_tracker;

-- Create the delete policy
CREATE POLICY "Users can delete analysis records" ON public.analysis_tracker
FOR DELETE TO authenticated
USING (auth.role() = 'authenticated'); 