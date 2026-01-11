-- ============================================
-- FIX: Subjects Not Showing for Students
-- ============================================

-- Step 1: Check all subject instances for semester 3
SELECT 
  id,
  subject_name,
  subject_code,
  semester,
  is_active,
  teacher_id,
  created_at
FROM subject_instances
WHERE semester = 3
ORDER BY created_at;

-- Step 2: Check student's semester
SELECT 
  id,
  name,
  email,
  semester,
  prn
FROM studentss
WHERE email = 'yuououi55@gmail.com';  -- Replace with your student's email

-- Step 3: Set is_active = true for all subject instances (if NULL or false)
UPDATE subject_instances 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- Step 4: Verify all semester 3 subjects are active
SELECT 
  id,
  subject_name,
  semester,
  is_active
FROM subject_instances
WHERE semester = 3;

-- Step 5: Test query - What student should see
-- Replace 'yuououi55@gmail.com' with your student's email
SELECT 
  si.id,
  si.subject_name,
  si.subject_code,
  si.semester,
  si.is_active,
  s.name as student_name,
  s.semester as student_semester
FROM subject_instances si
CROSS JOIN studentss s
WHERE s.email = 'yuououi55@gmail.com'
AND si.semester = s.semester
AND (si.is_active = true OR si.is_active IS NULL)
ORDER BY si.subject_name;

-- ============================================
-- COMMON ISSUES & FIXES
-- ============================================

-- Issue 1: is_active is NULL
-- Fix: Run Step 3 above

-- Issue 2: Semester data type mismatch
-- Check if semester is integer:
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'subject_instances' 
AND column_name = 'semester';

-- If it's text, convert (be careful - backup first!):
-- ALTER TABLE subject_instances 
-- ALTER COLUMN semester TYPE INTEGER USING semester::INTEGER;

-- Issue 3: Student semester doesn't match
-- Check and update student semester:
-- UPDATE studentss 
-- SET semester = 3 
-- WHERE email = 'yuououi55@gmail.com';

