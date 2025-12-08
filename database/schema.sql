-- =====================================================
-- Music Tutor Studio - Database Schema
-- =====================================================
-- This file contains the complete database schema for
-- the Music Tutor Studio application using Supabase.
-- 
-- Tables:
--   1. lessons - User's lesson collections
--   2. practice_units - Practice exercise units (scales, exercises, etc.)
--   3. lesson_units - Junction table linking lessons to practice units
--   4. mts-notes - Private practice notes
--   5. TestLog - Diagnostic logging (public access)
--   6. auth.users - Supabase auth table (reference only)
-- =====================================================

-- =====================================================
-- 1. LESSONS TABLE
-- =====================================================
-- Stores user-created lessons (collections of practice units)
CREATE TABLE IF NOT EXISTS public.lessons (
    lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.lessons IS 'User-created lesson collections containing ordered practice units';
COMMENT ON COLUMN public.lessons.lesson_id IS 'Unique identifier for the lesson';
COMMENT ON COLUMN public.lessons.user_id IS 'Foreign key to auth.users - lesson owner';
COMMENT ON COLUMN public.lessons.lesson_name IS 'User-provided name for the lesson';
COMMENT ON COLUMN public.lessons.created_at IS 'Timestamp when lesson was created';
COMMENT ON COLUMN public.lessons.updated_at IS 'Timestamp when lesson was last modified';

-- =====================================================
-- 2. PRACTICE_UNITS TABLE
-- =====================================================
-- Stores practice exercise units (scales, exercises, etc.)
CREATE TABLE IF NOT EXISTS public.practice_units (
    practice_unit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Scale',
    unit_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT FALSE,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_practice_units_user_id ON public.practice_units(user_id);

-- Create index on is_public for shared units queries
CREATE INDEX IF NOT EXISTS idx_practice_units_is_public ON public.practice_units(is_public) WHERE is_public = TRUE;

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_practice_units_type ON public.practice_units(type);

-- Create index on last_modified for sorting
CREATE INDEX IF NOT EXISTS idx_practice_units_last_modified ON public.practice_units(last_modified DESC);

-- Add comments for documentation
COMMENT ON TABLE public.practice_units IS 'Practice exercise units (scales, exercises, etc.) with optional public sharing';
COMMENT ON COLUMN public.practice_units.practice_unit_id IS 'Unique identifier for the practice unit';
COMMENT ON COLUMN public.practice_units.user_id IS 'Foreign key to auth.users - unit creator';
COMMENT ON COLUMN public.practice_units.name IS 'User-provided name for the practice unit';
COMMENT ON COLUMN public.practice_units.type IS 'Type of practice unit (Scale, Exercise, etc.)';
COMMENT ON COLUMN public.practice_units.unit_json IS 'Complete practice unit data in JSON format';
COMMENT ON COLUMN public.practice_units.is_public IS 'Whether this unit is publicly shareable';
COMMENT ON COLUMN public.practice_units.last_modified IS 'Timestamp when unit was last modified';
COMMENT ON COLUMN public.practice_units.created_at IS 'Timestamp when unit was created';

-- =====================================================
-- 3. LESSON_UNITS TABLE
-- =====================================================
-- Junction table linking lessons to practice units with ordering
CREATE TABLE IF NOT EXISTS public.lesson_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
    practice_unit_id UUID NOT NULL REFERENCES public.practice_units(practice_unit_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create composite index for efficient queries
CREATE INDEX IF NOT EXISTS idx_lesson_units_lesson_id ON public.lesson_units(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_units_practice_unit_id ON public.lesson_units(practice_unit_id);

-- Create index on sort_order for ordering
CREATE INDEX IF NOT EXISTS idx_lesson_units_sort_order ON public.lesson_units(lesson_id, sort_order);

-- Ensure unique combination of lesson_id and practice_unit_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_units_unique ON public.lesson_units(lesson_id, practice_unit_id);

-- Add comments for documentation
COMMENT ON TABLE public.lesson_units IS 'Junction table linking lessons to practice units with sort order';
COMMENT ON COLUMN public.lesson_units.id IS 'Unique identifier for the lesson-unit link';
COMMENT ON COLUMN public.lesson_units.lesson_id IS 'Foreign key to lessons table';
COMMENT ON COLUMN public.lesson_units.practice_unit_id IS 'Foreign key to practice_units table';
COMMENT ON COLUMN public.lesson_units.sort_order IS 'Order of practice unit within the lesson (0-based)';
COMMENT ON COLUMN public.lesson_units.created_at IS 'Timestamp when link was created';

-- =====================================================
-- 4. MTS-NOTES TABLE
-- =====================================================
-- Stores private practice notes for users
CREATE TABLE IF NOT EXISTS public."mts-notes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    detail TEXT,
    practice_unit TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_mts_notes_user_id ON public."mts-notes"(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_mts_notes_status ON public."mts-notes"(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_mts_notes_created_at ON public."mts-notes"(created_at DESC);

-- Create index on practice_unit for filtering
CREATE INDEX IF NOT EXISTS idx_mts_notes_practice_unit ON public."mts-notes"(practice_unit) WHERE practice_unit IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE public."mts-notes" IS 'Private practice notes and reminders for users';
COMMENT ON COLUMN public."mts-notes".id IS 'Unique identifier for the note';
COMMENT ON COLUMN public."mts-notes".user_id IS 'Foreign key to auth.users - note owner';
COMMENT ON COLUMN public."mts-notes".title IS 'Short title for the note';
COMMENT ON COLUMN public."mts-notes".detail IS 'Detailed content of the note';
COMMENT ON COLUMN public."mts-notes".practice_unit IS 'Associated practice unit name/ID (optional)';
COMMENT ON COLUMN public."mts-notes".status IS 'Note status (open, closed, etc.)';
COMMENT ON COLUMN public."mts-notes".created_at IS 'Timestamp when note was created';
COMMENT ON COLUMN public."mts-notes".updated_at IS 'Timestamp when note was last updated';

-- =====================================================
-- 5. TESTLOG TABLE
-- =====================================================
-- Diagnostic logging table (currently public access, no RLS)
CREATE TABLE IF NOT EXISTS public."TestLog" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name TEXT NOT NULL,
    status TEXT DEFAULT 'info',
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on test_name for filtering
CREATE INDEX IF NOT EXISTS idx_testlog_test_name ON public."TestLog"(test_name);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_testlog_status ON public."TestLog"(status);

-- Create index on created_at for sorting and cleanup
CREATE INDEX IF NOT EXISTS idx_testlog_created_at ON public."TestLog"(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public."TestLog" IS 'Diagnostic logging table for application testing and debugging';
COMMENT ON COLUMN public."TestLog".id IS 'Unique identifier for the log entry';
COMMENT ON COLUMN public."TestLog".test_name IS 'Name/identifier of the test or event';
COMMENT ON COLUMN public."TestLog".status IS 'Status of the event (success, failure, info, etc.)';
COMMENT ON COLUMN public."TestLog".message IS 'Log message or description';
COMMENT ON COLUMN public."TestLog".metadata IS 'Additional metadata in JSON format';
COMMENT ON COLUMN public."TestLog".created_at IS 'Timestamp when log entry was created';

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lessons table
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for mts-notes table
DROP TRIGGER IF EXISTS update_mts_notes_updated_at ON public."mts-notes";
CREATE TRIGGER update_mts_notes_updated_at
    BEFORE UPDATE ON public."mts-notes"
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- END OF SCHEMA
-- =====================================================
