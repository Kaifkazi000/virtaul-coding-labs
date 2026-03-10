-- ==========================================
-- ACADEMIC OS REFINEMENT: PRACTICAL CONSOLIDATION
-- ==========================================

-- 1. RENAME TABLE TO MASTER_PRACTICALS
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'practicals') THEN
        ALTER TABLE practicals RENAME TO master_practicals;
    END IF;
END $$;

-- 2. ENSURE HISTORY TABLES EXIST (Already in blueprint, but verifying)
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

-- 3. RE-ENABLE RLS FOR NEW NAME
ALTER TABLE master_practicals ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES FOR MASTER_PRACTICALS
DROP POLICY IF EXISTS hod_manage_practicals ON master_practicals;
CREATE POLICY hod_manage_practicals ON master_practicals
FOR ALL USING (
    (SELECT role FROM teachers WHERE auth_user_id = auth.uid()) = 'hod'
);

DROP POLICY IF EXISTS everyone_view_practicals ON master_practicals;
CREATE POLICY everyone_view_practicals ON master_practicals
FOR SELECT USING (true);
