-- Supabase Schema Setup for Music Tutor Studio
-- Run this in the Supabase SQL Editor to create the practice_units table

-- Create the practice_units table in the api schema
-- (Your PostgREST is configured to expose only the 'api' schema)
CREATE TABLE IF NOT EXISTS api.practice_units (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_unit_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Scale', 'Exercise', 'Passage')),
  share_music BOOLEAN NOT NULL DEFAULT false,
  unit_json JSONB NOT NULL,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_practice_units_user_id 
  ON api.practice_units(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_units_type 
  ON api.practice_units(type);
CREATE INDEX IF NOT EXISTS idx_practice_units_user_type 
  ON api.practice_units(user_id, type);
CREATE INDEX IF NOT EXISTS idx_practice_units_last_modified 
  ON api.practice_units(last_modified DESC);

-- Enable Row Level Security
ALTER TABLE api.practice_units ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own practice units
CREATE POLICY "Users can view own practice units"
  ON api.practice_units
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view shared practice units from others
CREATE POLICY "Users can view shared practice units"
  ON api.practice_units
  FOR SELECT
  USING (share_music = true);

-- Policy: Users can insert their own practice units
CREATE POLICY "Users can insert own practice units"
  ON api.practice_units
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own practice units
CREATE POLICY "Users can update own practice units"
  ON api.practice_units
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own practice units
CREATE POLICY "Users can delete own practice units"
  ON api.practice_units
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON api.practice_units TO authenticated;
GRANT USAGE ON SEQUENCE api.practice_units_id_seq TO authenticated;

-- Optional: Grant read access to anonymous users for shared units
GRANT SELECT ON api.practice_units TO anon;
