-- ==========================================
-- ACADEMIC OS MIGRATION SCRIPT (ROBUST VERSION)
-- ==========================================

-- 1. CONSOLIDATE STUDENT TABLES
-- We check if 'studentss' exists before renaming. 
-- If 'students' already exists, we skip the rename.

DO $$ 
BEGIN
    -- Rename studentss to students if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'studentss') THEN
        ALTER TABLE studentss RENAME TO students;
    END IF;

    -- Standardize Columns in students
    -- Check if 'name' exists before renaming to 'full_name'
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'name') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'full_name') THEN
        ALTER TABLE students RENAME COLUMN name TO full_name;
    END IF;

    -- Check if 'academic_year' exists before renaming to 'admission_year'
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'academic_year') THEN
        ALTER TABLE students RENAME COLUMN academic_year TO admission_year;
    END IF;

    -- Add missing constraints/columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'prn') THEN
        ALTER TABLE students ADD COLUMN prn VARCHAR(16) UNIQUE;
    ELSE
        -- Ensure it's UNIQUE if it already exists
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'students' AND indexname = 'unique_prn') THEN
            ALTER TABLE students ADD CONSTRAINT unique_prn UNIQUE (prn);
        END IF;
    END IF;
END $$;

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

-- 3. REFACTOR MASTER REPOSITORY (With Safety Checks)
DO $$ 
BEGIN
    -- master_subjects -> subjects
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_subjects') THEN
        ALTER TABLE master_subjects RENAME TO subjects;
        ALTER TABLE subjects RENAME COLUMN name TO subject_name;
    END IF;

    -- master_practicals -> practicals
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_practicals') THEN
        ALTER TABLE master_practicals RENAME TO practicals;
        ALTER TABLE practicals RENAME COLUMN master_subject_id TO subject_id;
        ALTER TABLE practicals RENAME COLUMN pr_no TO practical_no;
        ALTER TABLE practicals RENAME COLUMN sample_code TO template_code;
    END IF;

    -- subject_allotments -> allotments
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subject_allotments') THEN
        ALTER TABLE subject_allotments RENAME TO allotments;
        ALTER TABLE allotments RENAME COLUMN master_subject_id TO subject_id;
    END IF;
END $$;

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allotments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 5. APPLY ROLE-BASED POLICIES (Safety Check for Existing)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS student_self_view ON students;
    CREATE POLICY student_self_view ON students
    FOR SELECT USING (prn = (auth.jwt() ->> 'prn'));

    DROP POLICY IF EXISTS teacher_batch_view ON students;
    CREATE POLICY teacher_batch_view ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM allotments 
            WHERE allotments.batch_name = students.batch_name 
            AND allotments.teacher_id = (SELECT id FROM teachers WHERE auth_user_id = auth.uid())
        )
    );

    DROP POLICY IF EXISTS hod_all_access ON students;
    CREATE POLICY hod_all_access ON students
    FOR ALL USING (
        (SELECT role FROM teachers WHERE auth_user_id = auth.uid()) = 'hod'
    );
END $$;
