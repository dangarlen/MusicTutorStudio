-- =====================================================
-- Music Tutor Studio - Row Level Security (RLS) Policies
-- =====================================================
-- This file contains all RLS policies for the application.
-- RLS ensures users can only access their own data and
-- public/shared content where appropriate.
-- 
-- Policy Strategy:
--   - User-scoped access for lessons, practice_units, mts-notes
--   - Composite access for lesson_units via lessons ownership
--   - Public access for TestLog (diagnostic logging)
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mts-notes" ENABLE ROW LEVEL SECURITY;
-- TestLog: RLS disabled for now (public diagnostic logging)
-- ALTER TABLE public."TestLog" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. LESSONS TABLE POLICIES
-- =====================================================
-- Users can only access their own lessons

-- Policy: Users can view their own lessons
DROP POLICY IF EXISTS "Users can view their own lessons" ON public.lessons;
CREATE POLICY "Users can view their own lessons"
    ON public.lessons
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own lessons
DROP POLICY IF EXISTS "Users can insert their own lessons" ON public.lessons;
CREATE POLICY "Users can insert their own lessons"
    ON public.lessons
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own lessons
DROP POLICY IF EXISTS "Users can update their own lessons" ON public.lessons;
CREATE POLICY "Users can update their own lessons"
    ON public.lessons
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own lessons
DROP POLICY IF EXISTS "Users can delete their own lessons" ON public.lessons;
CREATE POLICY "Users can delete their own lessons"
    ON public.lessons
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 2. PRACTICE_UNITS TABLE POLICIES
-- =====================================================
-- Users can access their own practice units and public/shared units

-- Policy: Users can view their own practice units and public units
DROP POLICY IF EXISTS "Users can view own and public practice units" ON public.practice_units;
CREATE POLICY "Users can view own and public practice units"
    ON public.practice_units
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR is_public = TRUE
    );

-- Policy: Users can insert their own practice units
DROP POLICY IF EXISTS "Users can insert their own practice units" ON public.practice_units;
CREATE POLICY "Users can insert their own practice units"
    ON public.practice_units
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own practice units
DROP POLICY IF EXISTS "Users can update their own practice units" ON public.practice_units;
CREATE POLICY "Users can update their own practice units"
    ON public.practice_units
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own practice units
DROP POLICY IF EXISTS "Users can delete their own practice units" ON public.practice_units;
CREATE POLICY "Users can delete their own practice units"
    ON public.practice_units
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. LESSON_UNITS TABLE POLICIES
-- =====================================================
-- Users can only access lesson_units for their own lessons
-- This requires a join to the lessons table to verify ownership

-- Policy: Users can view lesson_units for their own lessons
DROP POLICY IF EXISTS "Users can view lesson_units for own lessons" ON public.lesson_units;
CREATE POLICY "Users can view lesson_units for own lessons"
    ON public.lesson_units
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.lesson_id = lesson_units.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

-- Policy: Users can insert lesson_units for their own lessons
DROP POLICY IF EXISTS "Users can insert lesson_units for own lessons" ON public.lesson_units;
CREATE POLICY "Users can insert lesson_units for own lessons"
    ON public.lesson_units
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.lesson_id = lesson_units.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

-- Policy: Users can update lesson_units for their own lessons
DROP POLICY IF EXISTS "Users can update lesson_units for own lessons" ON public.lesson_units;
CREATE POLICY "Users can update lesson_units for own lessons"
    ON public.lesson_units
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.lesson_id = lesson_units.lesson_id
            AND lessons.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.lesson_id = lesson_units.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

-- Policy: Users can delete lesson_units for their own lessons
DROP POLICY IF EXISTS "Users can delete lesson_units for own lessons" ON public.lesson_units;
CREATE POLICY "Users can delete lesson_units for own lessons"
    ON public.lesson_units
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.lesson_id = lesson_units.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

-- =====================================================
-- 4. MTS-NOTES TABLE POLICIES
-- =====================================================
-- Users can only access their own private notes

-- Policy: Users can view their own notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public."mts-notes";
CREATE POLICY "Users can view their own notes"
    ON public."mts-notes"
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
DROP POLICY IF EXISTS "Users can insert their own notes" ON public."mts-notes";
CREATE POLICY "Users can insert their own notes"
    ON public."mts-notes"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
DROP POLICY IF EXISTS "Users can update their own notes" ON public."mts-notes";
CREATE POLICY "Users can update their own notes"
    ON public."mts-notes"
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notes
DROP POLICY IF EXISTS "Users can delete their own notes" ON public."mts-notes";
CREATE POLICY "Users can delete their own notes"
    ON public."mts-notes"
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. TESTLOG TABLE POLICIES (OPTIONAL)
-- =====================================================
-- TestLog is currently PUBLIC (no RLS enabled)
-- Uncomment these policies if you want to enable RLS for TestLog

-- To enable RLS for TestLog, uncomment:
-- ALTER TABLE public."TestLog" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert logs (for debugging)
-- DROP POLICY IF EXISTS "Anyone can insert test logs" ON public."TestLog";
-- CREATE POLICY "Anyone can insert test logs"
--     ON public."TestLog"
--     FOR INSERT
--     WITH CHECK (true);

-- Policy: Anyone can view logs (for debugging)
-- DROP POLICY IF EXISTS "Anyone can view test logs" ON public."TestLog";
-- CREATE POLICY "Anyone can view test logs"
--     ON public."TestLog"
--     FOR SELECT
--     USING (true);

-- Alternative: Only authenticated users can access TestLog
-- DROP POLICY IF EXISTS "Authenticated users can access test logs" ON public."TestLog";
-- CREATE POLICY "Authenticated users can access test logs"
--     ON public."TestLog"
--     FOR ALL
--     USING (auth.uid() IS NOT NULL)
--     WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 
-- 1. The lesson_units policies use EXISTS subqueries to verify
--    lesson ownership. This is more secure than allowing direct
--    access based on user_id since lesson_units doesn't have
--    a user_id column.
-- 
-- 2. Practice units can be marked as public (is_public = TRUE)
--    to share with other users. Users can only modify their
--    own units but can view public units from others.
-- 
-- 3. All personal data (lessons, notes) is strictly user-scoped.
--    Users cannot access other users' private data.
-- 
-- 4. TestLog currently has no RLS (public access) for diagnostic
--    purposes. Enable RLS policies above if you need to restrict
--    access in production.
-- 
-- 5. These policies assume auth.uid() returns the current user's ID.
--    This is handled automatically by Supabase when using the
--    supabase-js client with a valid session.
-- 
-- =====================================================
-- END OF RLS POLICIES
-- =====================================================
