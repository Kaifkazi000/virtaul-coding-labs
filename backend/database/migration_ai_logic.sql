-- Migration to add AI Logic Integrity columns to the submissions table

-- Similarity Score: Integer between 0-100
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS similarity_score INTEGER DEFAULT 0;

-- Flagged: Boolean to mark suspicious submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;

-- Logic Hash: Structural fingerprint of the code for comparison
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS logic_hash TEXT;

-- Matching Submission ID: Reference to the submission that triggered the alert
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS matching_submission_id UUID REFERENCES submissions(id);

-- Verify the columns (optional)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'submissions';
