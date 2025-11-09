-- Migration: create mts-notes table and RLS policies
-- Run this in Supabase SQL Editor (recommended) or via psql against your DB

-- Optional: ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table
CREATE TABLE IF NOT EXISTS public."mts-notes" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  detail text,
  practice_unit text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mts_notes_user_id ON public."mts-notes" (user_id);
CREATE INDEX IF NOT EXISTS idx_mts_notes_status ON public."mts-notes" (status);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_on_mts_notes ON public."mts-notes";
CREATE TRIGGER set_timestamp_on_mts_notes
BEFORE UPDATE ON public."mts-notes"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Row Level Security: only allow users to operate on their own rows
ALTER TABLE public."mts-notes" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own notes
CREATE POLICY "Select own notes" ON public."mts-notes"
  FOR SELECT
  USING (user_id = auth.uid()::uuid);

-- Allow authenticated users to INSERT notes where user_id equals auth.uid()
CREATE POLICY "Insert own notes" ON public."mts-notes"
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

-- Allow authenticated users to UPDATE their own notes
CREATE POLICY "Update own notes" ON public."mts-notes"
  FOR UPDATE
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

-- Allow authenticated users to DELETE their own notes
CREATE POLICY "Delete own notes" ON public."mts-notes"
  FOR DELETE
  USING (user_id = auth.uid()::uuid);

-- Example: simple select to test
-- SELECT id, user_id, title, status, created_at FROM public."mts-notes" LIMIT 10;

-- Notes on service_role / admin access:
-- If you need server-side (admin) access, use your Supabase service_role key (NOT from client code).
-- To let an admin query everything via the anon key for debugging only, you could add a temporary policy but it's recommended to avoid that in production.

-- End of migration
