# Music Tutor Studio - Database Documentation

This directory contains SQL files for setting up and managing the Supabase database.

## Files

### `schema.sql`
Complete database schema with:
- Table definitions with primary keys, foreign keys, and constraints
- Indexes for optimal query performance
- Comments documenting each table and column
- Triggers for automatic timestamp updates

**Tables:**
1. `lessons` - User-created lesson collections
2. `practice_units` - Practice exercise units (scales, exercises, etc.)
3. `lesson_units` - Junction table linking lessons to practice units
4. `mts-notes` - Private practice notes
5. `TestLog` - Diagnostic logging

### `rls-policies.sql`
Row Level Security (RLS) policies ensuring:
- User-scoped access for personal data (lessons, notes)
- Shared/public access for practice units marked as public
- Composite access for lesson_units via lesson ownership
- Optional public access for TestLog (currently disabled RLS)

## Setup Instructions

### 1. Initial Setup
Run these SQL files in your Supabase SQL editor in order:

```sql
-- First, create the schema
\i database/schema.sql

-- Then, apply RLS policies
\i database/rls-policies.sql
```

Alternatively, copy and paste the contents of each file into the Supabase SQL Editor.

### 2. Verify Setup

After running the SQL files, verify:

```sql
-- Check that tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lessons', 'practice_units', 'lesson_units', 'mts-notes', 'TestLog');

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Database Schema

### Entity Relationship Diagram

```
auth.users (Supabase built-in)
    |
    +-- lessons (user_id FK)
    |       |
    |       +-- lesson_units (lesson_id FK)
    |               |
    |               +-- practice_units (practice_unit_id FK, user_id FK)
    |
    +-- practice_units (user_id FK)
    |
    +-- mts-notes (user_id FK)
```

### Table Details

#### `lessons`
Stores user-created lesson collections.
- **Primary Key:** `lesson_id` (UUID)
- **Foreign Keys:** `user_id` → `auth.users(id)`
- **Indexes:** `user_id`, `created_at`

#### `practice_units`
Stores practice exercise units (scales, exercises, etc.).
- **Primary Key:** `practice_unit_id` (UUID)
- **Foreign Keys:** `user_id` → `auth.users(id)`
- **Indexes:** `user_id`, `is_public`, `type`, `last_modified`
- **Special:** Can be marked as public for sharing

#### `lesson_units`
Junction table linking lessons to practice units with sort order.
- **Primary Key:** `id` (UUID)
- **Foreign Keys:** 
  - `lesson_id` → `lessons(lesson_id)`
  - `practice_unit_id` → `practice_units(practice_unit_id)`
- **Unique Constraint:** `(lesson_id, practice_unit_id)`
- **Indexes:** `lesson_id`, `practice_unit_id`, `(lesson_id, sort_order)`

#### `mts-notes`
Stores private practice notes for users.
- **Primary Key:** `id` (UUID)
- **Foreign Keys:** `user_id` → `auth.users(id)`
- **Indexes:** `user_id`, `status`, `created_at`, `practice_unit`

#### `TestLog`
Diagnostic logging table (currently public access).
- **Primary Key:** `id` (UUID)
- **No Foreign Keys:** Public table
- **Indexes:** `test_name`, `status`, `created_at`
- **Note:** RLS is currently disabled for diagnostic purposes

## Row Level Security (RLS)

### Security Model

1. **Lessons:** Users can only access their own lessons (CRUD)
2. **Practice Units:** Users can:
   - View their own units and public units from others
   - Create, update, delete only their own units
3. **Lesson Units:** Users can only access lesson_units for their own lessons
4. **Notes:** Users can only access their own private notes (CRUD)
5. **TestLog:** Currently public (no RLS) for diagnostic purposes

### Policy Examples

#### User-Scoped Access (Lessons, Notes)
```sql
-- Example: Users can view their own lessons
CREATE POLICY "Users can view their own lessons"
    ON public.lessons
    FOR SELECT
    USING (auth.uid() = user_id);
```

#### Shared Access (Practice Units)
```sql
-- Example: Users can view own and public practice units
CREATE POLICY "Users can view own and public practice units"
    ON public.practice_units
    FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);
```

#### Composite Access (Lesson Units)
```sql
-- Example: Users can view lesson_units for their own lessons
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
```

## Migration Strategy

If you're migrating from an existing database:

1. **Backup first:** Export your existing data
2. **Run schema.sql:** Creates tables if they don't exist
3. **Run rls-policies.sql:** Applies RLS policies
4. **Migrate data:** Use Supabase dashboard or SQL INSERT statements
5. **Verify:** Test all CRUD operations through the app

## Maintenance

### Cleanup Old Logs

```sql
-- Delete TestLog entries older than 30 days
DELETE FROM public."TestLog"
WHERE created_at < NOW() - INTERVAL '30 days';
```

### View Table Sizes

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Best Practices

1. **Never disable RLS on user data tables** (lessons, practice_units, mts-notes)
2. **Use service_role key only for admin operations** (never in client code)
3. **Validate all user input** before inserting to prevent injection
4. **Regularly audit policies** to ensure they match business requirements
5. **Monitor RLS performance** using Supabase dashboard metrics

## Troubleshooting

### Common Issues

**Issue:** RLS policies blocking legitimate access
- **Solution:** Check that `auth.uid()` is not null (user is authenticated)
- **Debug:** Temporarily disable RLS on one table to test

**Issue:** Slow queries
- **Solution:** Ensure indexes exist on foreign keys and filter columns
- **Check:** Run `EXPLAIN ANALYZE` on slow queries

**Issue:** Foreign key violations
- **Solution:** Ensure referenced records exist before inserting
- **Check:** Verify cascade delete behavior is correct

## Support

For issues related to the database:
1. Check Supabase logs in the dashboard
2. Review RLS policies for access issues
3. Verify indexes for performance issues
4. Check foreign key constraints for data integrity issues

## Version History

- **v1.0** (2024-12-08): Initial schema with RLS policies
  - Created all tables with proper indexes
  - Implemented RLS policies for user-scoped access
  - Added automatic timestamp triggers
