# Enhanced Database Schema - Virtual Coding Lab

## Updated Tables

### 1. `subject_instances` (Existing - No Changes)
```sql
CREATE TABLE subject_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  semester INT NOT NULL,
  teacher_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `practicals` (Enhanced)
```sql
CREATE TABLE practicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
  pr_no INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task TEXT,
  sample_code TEXT,
  theory TEXT,
  language TEXT NOT NULL,              -- Python, Java, C++, SQL, OS, OLAP
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- NEW: Batch unlock control
  is_enabled BOOLEAN DEFAULT false,    -- Teacher can enable for all students
  enabled_at TIMESTAMPTZ,              -- When teacher enabled it
  enabled_by UUID,                      -- Teacher who enabled it
  
  UNIQUE(subject_instance_id, pr_no)
);

-- Index for faster lookups
CREATE INDEX idx_practicals_subject_instance_id ON practicals(subject_instance_id);
CREATE INDEX idx_practicals_enabled ON practicals(is_enabled);
```

### 3. `submissions` (Enhanced)
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES studentss(id) ON DELETE CASCADE,
  subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
  practical_id UUID NOT NULL REFERENCES practicals(id) ON DELETE CASCADE,
  pr_no INT NOT NULL,
  
  -- Code & Execution
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  execution_status TEXT NOT NULL,       -- 'success' | 'failed' | 'timeout' | 'error'
  execution_output TEXT,                -- stdout
  execution_error TEXT,                  -- stderr
  execution_time_ms INT,                -- Execution time in milliseconds
  memory_used_kb INT,                    -- Memory used in KB
  
  -- Submission tracking
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One submission per student per practical
  UNIQUE(student_id, practical_id)
);

-- Indexes for performance
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_subject_instance_id ON submissions(subject_instance_id);
CREATE INDEX idx_submissions_practical_id ON submissions(practical_id);
CREATE INDEX idx_submissions_pr_no ON submissions(pr_no);
CREATE INDEX idx_submissions_status ON submissions(execution_status);
```

### 4. `studentss` (Existing - No Changes)
```sql
-- Already exists, no changes needed
```

## Unlock Logic Rules

### Sequential Unlock (Normal Mode)
- PR-1: Always unlocked (is_enabled = true by default for PR-1)
- PR-2: Unlocked if PR-1 has successful submission
- PR-3: Unlocked if PR-2 has successful submission
- ... and so on

### Batch Unlock (Teacher Mode)
- Teacher sets `is_enabled = true` for PR-X
- All students can access PR-X immediately
- Previous practical completion NOT required

### Combined Logic (Backend)
```javascript
// Pseudo-code for unlock check
function isPracticalUnlocked(studentId, practical) {
  // If teacher enabled it, always unlocked
  if (practical.is_enabled) return true;
  
  // PR-1 always unlocked
  if (practical.pr_no === 1) return true;
  
  // Check if previous practical has successful submission
  const previousPr = practical.pr_no - 1;
  const previousSubmission = getSubmission(studentId, previousPr);
  
  return previousSubmission?.execution_status === 'success';
}
```

## Migration SQL

If you have existing tables, run this:

```sql
-- Add enable/disable fields to practicals
ALTER TABLE practicals 
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false;

ALTER TABLE practicals 
ADD COLUMN IF NOT EXISTS enabled_at TIMESTAMPTZ;

ALTER TABLE practicals 
ADD COLUMN IF NOT EXISTS enabled_by UUID;

-- Set PR-1 to enabled by default
UPDATE practicals 
SET is_enabled = true 
WHERE pr_no = 1;

-- Add execution details to submissions
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS execution_time_ms INT;

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS memory_used_kb INT;

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS execution_error TEXT;

-- Remove old approval fields if they exist
ALTER TABLE submissions 
DROP COLUMN IF EXISTS submission_status;

ALTER TABLE submissions 
DROP COLUMN IF EXISTS teacher_feedback;

ALTER TABLE submissions 
DROP COLUMN IF EXISTS reviewed_by;

ALTER TABLE submissions 
DROP COLUMN IF EXISTS reviewed_at;
```
