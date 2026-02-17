-- Ensure foreign key constraints for the submissions and practicals tables

-- Check and add FK from submissions to studentss
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'submissions_student_id_fkey') THEN
        ALTER TABLE submissions ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES studentss(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add FK from submissions to practicals
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'submissions_practical_id_fkey') THEN
        ALTER TABLE submissions ADD CONSTRAINT submissions_practical_id_fkey FOREIGN KEY (practical_id) REFERENCES practicals(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add FK from submissions to subject_instances
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'submissions_subject_instance_id_fkey') THEN
        ALTER TABLE submissions ADD CONSTRAINT submissions_subject_instance_id_fkey FOREIGN KEY (subject_instance_id) REFERENCES subject_instances(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add FK from practicals to subject_instances
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'practicals_subject_instance_id_fkey') THEN
        ALTER TABLE practicals ADD CONSTRAINT practicals_subject_instance_id_fkey FOREIGN KEY (subject_instance_id) REFERENCES subject_instances(id) ON DELETE CASCADE;
    END IF;
END $$;
