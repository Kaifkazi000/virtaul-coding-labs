# Database Schema for Virtual Coding Lab

## Required Tables

### 1. `studentss` (Already exists)
```sql
CREATE TABLE studentss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,  -- Supabase auth user id
  prn TEXT UNIQUE NOT NULL,
  roll TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  semester INT NOT NULL,              -- Used for auto-enrollment
  department TEXT,
  college_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `subject_instances` (Already exists)
```sql
CREATE TABLE subject_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name TEXT NOT NULL,         -- Java, Python, DBMS
  subject_code TEXT NOT NULL,         -- JAVA, PY
  semester INT NOT NULL,
  teacher_id UUID NOT NULL,           -- auth.users.id
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `practicals` (Already exists)
```sql
CREATE TABLE practicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
  pr_no INT NOT NULL,                 -- PR-1 to PR-10
  title TEXT NOT NULL,
  description TEXT,
  task TEXT,
  sample_code TEXT,
  theory TEXT,
  language TEXT NOT NULL,              -- Python, Java, SQL
  created_by UUID NOT NULL,           -- auth.users.id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_instance_id, pr_no)  -- Prevent duplicate PR numbers per instance
);
```

### 4. `submissions` ⭐ (NEW - REQUIRED)
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES studentss(id) ON DELETE CASCADE,
  subject_instance_id UUID NOT NULL REFERENCES subject_instances(id) ON DELETE CASCADE,
  practical_id UUID NOT NULL REFERENCES practicals(id) ON DELETE CASCADE,
  pr_no INT NOT NULL,                 -- Denormalized for easier queries
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  execution_status TEXT NOT NULL,     -- 'success' | 'failed'
  output TEXT,                        -- Execution output/error
  submission_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  teacher_feedback TEXT,
  reviewed_by UUID,                   -- auth.users.id (teacher)
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, practical_id)     -- One submission per student per practical
);
```

## Indexes (Recommended for Performance)

```sql
-- Fast lookups for student submissions
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_subject_instance_id ON submissions(subject_instance_id);
CREATE INDEX idx_submissions_practical_id ON submissions(practical_id);
CREATE INDEX idx_submissions_status ON submissions(submission_status);

-- Fast lookups for subject instances
CREATE INDEX idx_subject_instances_teacher_id ON subject_instances(teacher_id);
CREATE INDEX idx_subject_instances_semester ON subject_instances(semester);

-- Fast lookups for practicals
CREATE INDEX idx_practicals_subject_instance_id ON practicals(subject_instance_id);
```

## Row Level Security (RLS) Policies (Supabase)

### For `submissions` table:

```sql
-- Students can only see their own submissions
CREATE POLICY "Students can view own submissions"
  ON submissions FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM studentss 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Students can insert their own submissions
CREATE POLICY "Students can insert own submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM studentss 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Students can update their own pending submissions
CREATE POLICY "Students can update own pending submissions"
  ON submissions FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM studentss 
      WHERE auth_user_id = auth.uid()
    )
    AND submission_status = 'pending'
  );

-- Teachers can view submissions for their subject instances
CREATE POLICY "Teachers can view submissions for their instances"
  ON submissions FOR SELECT
  USING (
    subject_instance_id IN (
      SELECT id FROM subject_instances 
      WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can update submissions for their subject instances
CREATE POLICY "Teachers can review submissions"
  ON submissions FOR UPDATE
  USING (
    subject_instance_id IN (
      SELECT id FROM subject_instances 
      WHERE teacher_id = auth.uid()
    )
  );
```

## Important Notes

1. **Auto-enrollment**: No enrollment table needed. Students are auto-enrolled based on `studentss.semester === subject_instances.semester`.

2. **Submission Flow**:
   - Student executes code → `POST /api/submissions/execute`
   - If successful → Student submits → `POST /api/submissions`
   - Teacher reviews → `PATCH /api/submissions/:id/review`
   - On approval, student can proceed to next practical

3. **Data Isolation**: Each subject instance is isolated by `subject_instance_id`, ensuring semester data doesn't mix.

4. **Unique Constraints**: 
   - One submission per student per practical
   - One PR number per subject instance

