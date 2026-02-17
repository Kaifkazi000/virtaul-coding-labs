-- Formal HOD Table
CREATE TABLE IF NOT EXISTS public.hods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL DEFAULT 'CSE',
    role TEXT NOT NULL DEFAULT 'hod',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for hods
ALTER TABLE public.hods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow HODs to view their own profile"
ON public.hods FOR SELECT
USING (auth.uid() = auth_user_id);

-- One-time Admin HOD Initializer (Manual Step)
-- Insert an entry here manually or via API once the Auth user is created.
