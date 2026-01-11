-- ============================================
-- DATABASE MIGRATION SCRIPT
-- Fix practicals table to use subject_instance_id
-- ============================================

-- Step 1: Check if subject_id column exists and subject_instance_id doesn't
-- If your table has subject_id, run these commands:

-- Option A: If you have OLD data in practicals table with subject_id
-- 1. First, add the new column
ALTER TABLE practicals 
ADD COLUMN IF NOT EXISTS subject_instance_id UUID;

-- 2. Migrate data (if you have old subject_id values that need to be converted)
-- NOTE: This assumes you have a way to map old subject_id to subject_instance_id
-- If not, you may need to delete old data first
-- UPDATE practicals SET subject_instance_id = (SELECT id FROM subject_instances WHERE ...);

-- 3. Remove the old foreign key constraint (if exists)
ALTER TABLE practicals 
DROP CONSTRAINT IF EXISTS practicals_subject_id_fkey;

-- 4. Remove the old column
ALTER TABLE practicals 
DROP COLUMN IF EXISTS subject_id;

-- 5. Add foreign key constraint for subject_instance_id
ALTER TABLE practicals
ADD CONSTRAINT practicals_subject_instance_id_fkey 
FOREIGN KEY (subject_instance_id) 
REFERENCES subject_instances(id) 
ON DELETE CASCADE;

-- 6. Make subject_instance_id NOT NULL
ALTER TABLE practicals
ALTER COLUMN subject_instance_id SET NOT NULL;

-- 7. Add unique constraint (if not exists)
ALTER TABLE practicals
ADD CONSTRAINT practicals_subject_instance_pr_unique 
UNIQUE (subject_instance_id, pr_no);

-- ============================================
-- Option B: If you have a FRESH database (no old data)
-- Just drop and recreate the practicals table:
-- ============================================

-- DROP TABLE IF EXISTS practicals CASCADE;

-- CREATE TABLE practicals (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
--   pr_no INT NOT NULL,
--   title TEXT NOT NULL,
--   description TEXT,
--   task TEXT,
--   sample_code TEXT,
--   theory TEXT,
--   language TEXT NOT NULL,
--   created_by UUID NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(subject_instance_id, pr_no)
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check current table structure:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'practicals'
-- ORDER BY ordinal_position;

-- Check if subject_instance_id exists:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'practicals' 
-- AND column_name = 'subject_instance_id';

-- Check if subject_id still exists:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'practicals' 
-- AND column_name = 'subject_id';

