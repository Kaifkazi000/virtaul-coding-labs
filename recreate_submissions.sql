-- Recreate Submissions Table with Strict FK Constraints
-- Paste this entirely into your Supabase SQL Editor and hit RUN.

-- 1. Drop the existing table to resolve all schema conflicts cleanly
DROP TABLE IF EXISTS public.submissions CASCADE;

-- 2. Create the strict table structure as requested
CREATE TABLE public.submissions (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  subject_instance_id uuid not null,
  practical_id uuid not null,
  pr_no integer not null,
  code text not null,
  language text not null,
  execution_status text not null,
  execution_output text null,
  submitted_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  execution_time_ms integer null,
  memory_used_kb integer null,
  execution_error text null,
  similarity_score integer null default 0,
  flagged boolean null default false,
  logic_hash text null,
  matching_submission_id uuid null,
  status text null default 'pending'::text,
  score integer null,
  teacher_feedback text null,
  checked_at timestamp with time zone null,
  
  constraint submissions_pkey primary key (id),
  constraint submissions_student_id_practical_id_key unique (student_id, practical_id),
  constraint submissions_matching_submission_id_fkey foreign KEY (matching_submission_id) references submissions (id),
  -- NOTE: Changed "subject_instances" to "allotments" to match actual database table name!
  constraint submissions_subject_instance_id_fkey foreign KEY (subject_instance_id) references allotments (id) on delete CASCADE,
  constraint submissions_execution_status_check check (
    (
      execution_status = any (array['success'::text, 'failed'::text])
    )
  )
) TABLESPACE pg_default;

-- 3. Restore all strict Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_student_id on public.submissions using btree (student_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_submissions_subject_instance_id on public.submissions using btree (subject_instance_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_submissions_practical_id on public.submissions using btree (practical_id) TABLESPACE pg_default;
