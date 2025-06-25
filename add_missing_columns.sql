-- Add missing columns to analysis_tracker table
-- Based on the current schema, these columns are missing:

-- Add sample_no column
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS sample_no TEXT;

-- Add step tracking fields
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS draft_by TEXT;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS draft_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS ready_check_by TEXT;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS ready_check_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS checked_by TEXT;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS checked_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS emailed_by TEXT;
ALTER TABLE public.analysis_tracker ADD COLUMN IF NOT EXISTS emailed_date TIMESTAMP WITH TIME ZONE;

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'analysis_tracker' 
ORDER BY ordinal_position; 