-- ==========================================
-- ACADEMIC OS MIGRATION SCRIPT (FINAL CLEAN-UP VERSION)
-- ==========================================

-- 1. CONSOLIDATE STUDENT TABLES
DO $$ 
BEGIN
    -- Rename studentss to students if it exists and students doesn't
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'studentss') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN
        ALTER TABLE studentss RENAME TO students;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'studentss') 
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN
        -- If both exist, we assume 'students' is the target. 
        -- We can drop 'studentss' if it's redundant (Uncomment next line if you are sure)
        -- DROP TABLE studentss CASCADE;
        RAISE NOTICE 'Both students and studentss exist. Please manually verify data and drop studentss.';
    END IF;

    -- Standardize Columns in students
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'name') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'full_name') THEN
        ALTER TABLE students RENAME COLUMN name TO full_name;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'academic_year') THEN
        ALTER TABLE students RENAME COLUMN academic_year TO admission_year;
    END IF;

    -- Add PRN if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'prn') THEN
        ALTER TABLE students ADD COLUMN prn VARCHAR(16) UNIQUE;
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

-- 3. REFACTOR MASTER REPOSITORY (Deep Clean)
DO $$ 
BEGIN
    -- master_subjects -> subjects
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_subjects') THEN
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') THEN
            ALTER TABLE master_subjects RENAME TO subjects;
        ELSE
            -- If both exist, just standardize 'subjects' and we'll deal with master_subjects manually or drop it
            RAISE NOTICE 'Table subjects already exists. Skipping rename of master_subjects.';
        END IF;
    END IF;
    
    -- Ensure columns in 'subjects' are correct
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'name') THEN
        ALTER TABLE subjects RENAME COLUMN name TO subject_name;
    END IF;

    -- master_practicals -> practicals
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_practicals') THEN
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'practicals') THEN
            ALTER TABLE master_practicals RENAME TO practicals;
        ELSE
            RAISE NOTICE 'Table practicals already exists. Skipping rename of master_practicals.';
        END IF;
    END IF;
    
    -- Ensure columns in 'practicals' are correct
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'practicals' AND column_name = 'master_subject_id') THEN
        ALTER TABLE practicals RENAME COLUMN master_subject_id TO subject_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'practicals' AND column_name = 'pr_no') THEN
        ALTER TABLE practicals RENAME COLUMN pr_no TO practical_no;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'practicals' AND column_name = 'sample_code') THEN
        ALTER TABLE practicals RENAME COLUMN sample_code TO template_code;
    END IF;

    -- subject_allotments -> allotments
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subject_allotments') THEN
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'allotments') THEN
            ALTER TABLE subject_allotments RENAME TO allotments;
        ELSE
            RAISE NOTICE 'Table allotments already exists. Skipping rename of subject_allotments.';
        END IF;
    END IF;
    
    -- Ensure columns in 'allotments' are correct
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'allotments' AND column_name = 'master_subject_id') THEN
        ALTER TABLE allotments RENAME COLUMN master_subject_id TO subject_id;
    END IF;
END $$;

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- We use a loop to enable RLS on all relevant tables safely
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['students', 'teachers', 'subjects', 'allotments', 'practicals', 'submissions']) LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = t) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        END IF;
    END LOOP;
END $$;

-- 5. APPLY ROLE-BASED POLICIES (Using DO blocks for safety)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN
        DROP POLICY IF EXISTS student_self_view ON students;
        CREATE POLICY student_self_view ON students FOR SELECT USING (prn = (auth.jwt() ->> 'prn'));

        DROP POLICY IF EXISTS teacher_batch_view ON students;
        CREATE POLICY teacher_batch_view ON students FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM allotments 
                WHERE allotments.batch_name = students.batch_name 
                AND allotments.teacher_id = (SELECT id FROM teachers WHERE auth_user_id = auth.uid())
            )
        );

        DROP POLICY IF EXISTS hod_all_access ON students;
        CREATE POLICY hod_all_access ON students FOR ALL USING (
            (SELECT role FROM teachers WHERE auth_user_id = auth.uid()) = 'hod'
        );
    END IF;
END $$;
