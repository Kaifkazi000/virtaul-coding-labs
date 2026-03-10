-- ==========================================
-- ACADEMIC OS MIGRATION SCRIPT (PHASE 1)
-- ==========================================

-- 1. CONSOLIDATE STUDENT TABLES
-- Drop the basic/empty students table if it exists
DROP TABLE IF EXISTS students CASCADE;

-- Rename studentss to students
ALTER TABLE studentss RENAME TO students;

-- Align columns with Academic OS standards
ALTER TABLE students RENAME COLUMN name TO full_name;
ALTER TABLE students RENAME COLUMN academic_year TO admission_year;

-- Ensure constraints match requirements
ALTER TABLE students ALTER COLUMN prn SET NOT NULL;
ALTER TABLE students ADD CONSTRAINT unique_prn UNIQUE (prn);
ALTER TABLE students ADD CONSTRAINT current_year_check CHECK (current_year BETWEEN 1 AND 4);
ALTER TABLE students ADD CONSTRAINT semester_check CHECK (semester BETWEEN 1 AND 8);

-- 2. CREATE HISTORY TRACKING TABLES
CREATE TABLE IF NOT EXISTS failed_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prn VARCHAR(16) UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT,
    admission_year INT,
    stopped_year INT,
    stopped_semester INT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alumni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prn VARCHAR(16) UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT,
    admission_year INT,
    passout_year INT,
    final_batch CHAR(1),
    academic_history JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. REFACTOR MASTER REPOSITORY
ALTER TABLE master_subjects RENAME TO subjects;
ALTER TABLE subjects RENAME COLUMN name TO subject_name;

ALTER TABLE master_practicals RENAME TO practicals;
ALTER TABLE practicals RENAME COLUMN master_subject_id TO subject_id;
ALTER TABLE practicals RENAME COLUMN pr_no TO practical_no;
ALTER TABLE practicals RENAME COLUMN sample_code TO template_code;

ALTER TABLE subject_allotments RENAME TO allotments;
ALTER TABLE allotments RENAME COLUMN master_subject_id TO subject_id;

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allotments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 5. APPLY ROLE-BASED POLICIES
-- Students can only see their own profile
CREATE POLICY student_self_view ON students
FOR SELECT USING (prn = (auth.jwt() ->> 'prn'));

-- Teachers can only see students in their allotted batches
-- (Simplified for initial migration, will be refined in Phase 2)
CREATE POLICY teacher_batch_view ON students
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM allotments 
        WHERE allotments.batch_name = students.batch_name 
        AND allotments.teacher_id = (SELECT id FROM teachers WHERE auth_user_id = auth.uid())
    )
);

-- HOD has full access (Admin Bypass via Postgres Role or Policy)
CREATE POLICY hod_all_access ON students
FOR ALL USING (
    (SELECT role FROM teachers WHERE auth_user_id = auth.uid()) = 'hod'
);

COMMIT;
