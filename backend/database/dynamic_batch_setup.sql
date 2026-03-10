-- Standardize Students Table
DO $$ 
BEGIN
    -- Add email if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'email') THEN
        ALTER TABLE students ADD COLUMN email TEXT;
    END IF;

    -- Add roll_no if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'roll_no') THEN
        ALTER TABLE students ADD COLUMN roll_no TEXT;
    END IF;

    -- Add semester if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'semester') THEN
        ALTER TABLE students ADD COLUMN semester TEXT;
    END IF;

    -- Add auth_user_id if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'auth_user_id') THEN
        ALTER TABLE students ADD COLUMN auth_user_id UUID;
    END IF;

    -- Add admission_year if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'admission_year') THEN
        ALTER TABLE students ADD COLUMN admission_year INTEGER;
    END IF;

    -- Add department if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'department') THEN
        ALTER TABLE students ADD COLUMN department TEXT;
    END IF;

    -- Add batch_name if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'batch_name') THEN
        ALTER TABLE students ADD COLUMN batch_name TEXT;
    END IF;

    -- Add status if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'status') THEN
        ALTER TABLE students ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Standardize Subjects Table (Master Repo)

    -- subject_name should be the primary name field
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'name') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'subject_name') THEN
        ALTER TABLE subjects RENAME COLUMN name TO subject_name;
    END IF;
END $$;
