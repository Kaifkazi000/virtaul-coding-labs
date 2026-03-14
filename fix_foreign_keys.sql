-- Final Schema Constraint Fix
-- Add missing foreign keys to the submissions table so Teacher Dashboard joins work!

ALTER TABLE public.submissions ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_practical_id_fkey FOREIGN KEY (practical_id) REFERENCES public.master_practicals(id) ON DELETE CASCADE;

-- Run this snippet in your Supabase SQL Editor and the Teacher View will work!
