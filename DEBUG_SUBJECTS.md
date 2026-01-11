# Debug: Why Only One Subject Shows

## Possible Issues

### 1. `is_active` Column Issue
The backend filters by `is_active = true`. If your subject instances have:
- `is_active = false` → Won't show
- `is_active = NULL` → Won't show (before fix)
- `is_active = true` → Will show ✅

**Fix Applied:** Updated backend to show subjects where `is_active = true` OR `is_active IS NULL`

### 2. Semester Mismatch
Check if student's semester matches subject instances:

**Check Student Semester:**
```sql
SELECT id, name, semester 
FROM studentss 
WHERE email = 'your-student-email@example.com';
```

**Check Subject Instances:**
```sql
SELECT id, subject_name, semester, is_active 
FROM subject_instances 
WHERE semester = 3;
```

### 3. Data Type Mismatch
Semester might be stored as:
- String: `'3'` vs Integer: `3`

**Check:**
```sql
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'subject_instances' 
AND column_name = 'semester';
```

Should be `integer` or `int`.

## Quick Fixes

### Fix 1: Set is_active for all subject instances
```sql
-- Set all to active
UPDATE subject_instances 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;
```

### Fix 2: Check semester values
```sql
-- See all semester 3 subjects
SELECT id, subject_name, semester, is_active 
FROM subject_instances 
WHERE semester = 3;

-- If semester is stored as text, convert:
-- UPDATE subject_instances SET semester = CAST(semester AS INTEGER);
```

### Fix 3: Verify student semester
```sql
-- Check your student's semester
SELECT id, name, email, semester 
FROM studentss 
WHERE email = 'yuououi55@gmail.com';
```

## Test Query

Run this to see what should be showing:

```sql
-- Replace 3 with your student's semester
SELECT 
  si.id,
  si.subject_name,
  si.subject_code,
  si.semester,
  si.is_active,
  s.semester as student_semester
FROM subject_instances si
CROSS JOIN studentss s
WHERE s.email = 'yuououi55@gmail.com'
AND si.semester = s.semester
AND (si.is_active = true OR si.is_active IS NULL);
```

This shows all subjects that should appear for your student.

## Backend Logging

The backend now logs:
- How many subject instances found
- Student's semester

Check your backend console when loading the dashboard to see:
```
Found X subject instances for semester 3
```

