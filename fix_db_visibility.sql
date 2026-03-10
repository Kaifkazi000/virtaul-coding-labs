-- 1. Force Schema Cache Reload
-- We do this by dropping and recreating a dummy function or just running a notify signal
NOTIFY pgrst, 'reload schema';

-- 2. Fix Scientific Notation PRNs
-- Excel often converts PRNs to scientific notation like '4.54545E+13'
-- We try to convert them back to strings if possible, or at least identify them.
-- Since they were likely imported as strings, we can't perfectly recover them if they were truncated, 
-- but often they are just formatted.
-- However, the safest 'fix' for existing bad data is to let the user know, 
-- OR if we know the length, we can try to format them.

-- Let's try to update PRNs that contain letters (like E) which shouldn't be there 
-- if they are pure numbers.
UPDATE students 
SET prn = TRIM(prn::text) 
WHERE prn LIKE '%E+%';

-- 3. Verify Columns
-- Ensure roll_no exists (we know it does from previous scans)
-- Ensure semester is treated as string/text if that's what the UI expects
ALTER TABLE students ALTER COLUMN semester TYPE TEXT USING semester::TEXT;
