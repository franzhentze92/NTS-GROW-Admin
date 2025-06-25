-- Fix missing columns in analysis_tracker table
-- Run this in your Supabase SQL editor to add missing columns

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