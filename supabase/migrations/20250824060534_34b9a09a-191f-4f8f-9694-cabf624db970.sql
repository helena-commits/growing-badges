-- Create badges_printed table for tracking badge emissions
CREATE TABLE IF NOT EXISTS public.badges_printed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  photo_url TEXT,
  photo_origin TEXT CHECK (photo_origin IN ('supabase','local','unknown')) DEFAULT 'unknown',
  action TEXT NOT NULL CHECK (action IN ('download','print')),
  printed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_printed_printed_at ON public.badges_printed(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_printed_name ON public.badges_printed(full_name);

-- Enable Row Level Security
ALTER TABLE public.badges_printed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS badges_printed_insert ON public.badges_printed;
DROP POLICY IF EXISTS badges_printed_select ON public.badges_printed;

-- Create RLS policies for anon access
CREATE POLICY badges_printed_insert ON public.badges_printed 
FOR INSERT TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY badges_printed_select ON public.badges_printed 
FOR SELECT TO anon 
USING (true);