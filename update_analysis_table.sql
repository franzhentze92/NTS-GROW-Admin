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