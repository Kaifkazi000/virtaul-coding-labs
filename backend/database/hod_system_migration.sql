-- ==========================================
-- HOD SYSTEM MIGRATION SCRIPT
-- ==========================================

-- 1. Create Master Subjects Table
-- This stores the core subject template (e.g., DBMS)
CREATE TABLE IF NOT EXISTS master_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    course_code TEXT UNIQUE,
    department TEXT DEFAULT 'CSE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Master Practicals Table
-- Practicals are now linked to Master Subjects
CREATE TABLE IF NOT EXISTS master_practicals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_subject_id UUID REFERENCES master_subjects(id) ON DELETE CASCADE,
    pr_no INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task TEXT,
    theory TEXT,
    sample_code TEXT,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Studentss Table for Batch & Promotion
ALTER TABLE studentss 
ADD COLUMN IF NOT EXISTS batch_name TEXT, -- 'A', 'B', 'C'
ADD COLUMN IF NOT EXISTS academic_year INT, -- e.g., 2024
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- 'active', 'failed', 'graduated'

-- 4. Create Subject Allotments Table
-- This links Subject + Teacher + Semester + Batch
CREATE TABLE IF NOT EXISTS subject_allotments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_subject_id UUID REFERENCES master_subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    batch_name TEXT NOT NULL, -- The specific batch this teacher handles
    academic_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(master_subject_id, teacher_id, semester, batch_name, academic_year)
);

-- 5. Add Role to Teachers (if not exists)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';

-- 6. Allotment Practical Status (Unlock per Batch)
CREATE TABLE IF NOT EXISTS allotment_practical_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allotment_id UUID REFERENCES subject_allotments(id) ON DELETE CASCADE,
    master_practical_id UUID REFERENCES master_practicals(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(allotment_id, master_practical_id)
);

-- ==========================================
-- INSTRUCTIONS TO ADD HOD MANUALLY:
-- ==========================================
-- 1. Create a user in Supabase Auth (Authentication -> Users -> Add User)
-- 2. Get the User ID (UUID) from the Auth list.
-- 3. Run the following SQL with that ID:
-- 
-- INSERT INTO teachers (auth_user_id, name, email, department, role)
-- VALUES ('USER_ID_HERE', 'HOD Admin', 'hod@college.edu', 'CSE', 'hod');
-- ==========================================
