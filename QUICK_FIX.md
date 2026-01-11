# Quick Fix for Practicals Table Error

## The Problem
Error: `null value in column "subject_id" of relation "practicals" violates not-null constraint`

This means your database table `practicals` still has the old `subject_id` column, but the code is trying to use `subject_instance_id`.

## Solution

### Option 1: Update Existing Table (If you have data)

Run this SQL in your Supabase SQL Editor:

```sql
-- 1. Add new column
ALTER TABLE practicals 
ADD COLUMN IF NOT EXISTS subject_instance_id UUID;

-- 2. If you have old data, you need to migrate it first
-- Otherwise, delete old practicals that use subject_id:
DELETE FROM practicals WHERE subject_instance_id IS NULL;

-- 3. Remove old foreign key (if exists)
ALTER TABLE practicals 
DROP CONSTRAINT IF EXISTS practicals_subject_id_fkey;

-- 4. Remove old column
ALTER TABLE practicals 
DROP COLUMN IF EXISTS subject_id;

-- 5. Add foreign key for new column
ALTER TABLE practicals
ADD CONSTRAINT practicals_subject_instance_id_fkey 
FOREIGN KEY (subject_instance_id) 
REFERENCES subject_instances(id) 
ON DELETE CASCADE;

-- 6. Make it NOT NULL
ALTER TABLE practicals
ALTER COLUMN subject_instance_id SET NOT NULL;

-- 7. Add unique constraint
ALTER TABLE practicals
ADD CONSTRAINT practicals_subject_instance_pr_unique 
UNIQUE (subject_instance_id, pr_no);
```

### Option 2: Fresh Start (If you have NO important data)

Run this SQL in Supabase SQL Editor:

```sql
-- Drop and recreate
DROP TABLE IF EXISTS practicals CASCADE;

CREATE TABLE practicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
  pr_no INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task TEXT,
  sample_code TEXT,
  theory TEXT,
  language TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_instance_id, pr_no)
);

-- Add index for performance
CREATE INDEX idx_practicals_subject_instance_id ON practicals(subject_instance_id);
```

## How to Run SQL in Supabase

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL from Option 1 or Option 2 above
5. Click "Run" (or press Ctrl+Enter)
6. Verify it worked - you should see "Success"

## Verify It Worked

Run this query to check:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'practicals'
ORDER BY ordinal_position;
```

You should see `subject_instance_id` and NOT see `subject_id`.

## After Migration

1. Restart your backend server
2. Try adding a practical again
3. It should work now! ✅

