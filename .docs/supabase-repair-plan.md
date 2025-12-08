## 9. Admin Account & TestLog Table

### Create an Admin Account
1. In Supabase Dashboard, go to Authentication > Users.
2. Click 'Add user'.
3. Enter the admin email and password (e.g., admin@yourdomain.com).
4. Optionally, add a custom claim or metadata to mark this user as admin (e.g., `{ "role": "admin" }`).
5. You can use this account to log in and access all data.

### Add TestLog Table (Universal Access)
Run this SQL in the Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.test_log (
  id BIGSERIAL PRIMARY KEY,
  fldTest TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Allow all users to read and insert
ALTER TABLE public.test_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can read test_log" ON public.test_log
  FOR SELECT USING (true);
CREATE POLICY "All users can insert test_log" ON public.test_log
  FOR INSERT WITH CHECK (true);

-- Optionally, allow admin to delete or update
-- (Assumes you set a custom claim or metadata for admin role)
CREATE POLICY "Admin can modify test_log" ON public.test_log
  FOR UPDATE, DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

### Next Steps
- Add a collapse section in Preferences.vue named "Test".
- Display all single-line entries from `fldTest` in `test_log`.
- Add a text box to allow users to add to the log.
- All users can view/add entries; only admin can delete/update.
# Supabase Integration Repair Plan

## Overview
This document provides a plan for auditing and repairing Supabase references in the MusicTutorStudio codebase.

---

## 1. Current Supabase References Inventory

### Client Configuration
| File | Status | Notes |
|------|--------|-------|
| `src/scripts/supabaseClient.js` | ✅ Present | Singleton client, uses `public` schema |

### Components Using Supabase
| Component | Purpose | Supabase Operations |
|-----------|---------|---------------------|
| `src/components/Preferences.vue` | User auth | signUp, signIn, signOut, resetPassword, updateUser, getSession, onAuthStateChange |
| `src/components/AuthStatusBanner.vue` | Auth status | getSession, signOut, onAuthStateChange |
| `src/components/CreateScaleView.vue` | Scale creation | CRUD on `practice_units` |
| `src/components/CreateExercise.vue` | Exercise creation | CRUD on `practice_units` |
| `src/components/CreatePracticeUnitView.vue` | Practice unit preview | CRUD on `practice_units` |
| `src/components/CreateEditPracticeUnit.vue` | Practice unit editing | upsert/delete on `practice_units` |
| `src/components/CreateLessons.vue` | Lesson creation | Session check |
| `src/components/PracticeNotes.vue` | Practice notes | CRUD on `mts-notes` |

### Stores Using Supabase
| Store | Purpose | Supabase Operations |
|-------|---------|---------------------|
| `src/stores/lessonStore.js` | Lesson management | CRUD on `lessons`, `lesson_units`, `practice_units` |

---

## 2. Database Tables Required

### Tables in Use (Client Code)
| Table Name | Schema Used | Operations |
|------------|-------------|------------|
| `practice_units` | public | SELECT, INSERT, UPDATE, DELETE, UPSERT |
| `lessons` | public | SELECT, INSERT, UPDATE, DELETE |
| `lesson_units` | public | SELECT, INSERT, DELETE |
| `mts-notes` | public | SELECT, INSERT, UPDATE, DELETE |

### Schema Mismatch Issue ⚠️
- **Documentation** (`.docs/supabase-schema.sql`): Creates tables in `api` schema
- **Client code** (`supabaseClient.js`): Configured for `public` schema
- **Resolution needed**: Either migrate tables to `public` or update client to use `api`

---

## 3. Repair Checklist

### Phase 1: Verify Code Integrity ✅
- [x] `src/scripts/supabaseClient.js` exists and exports client
- [x] `@supabase/supabase-js` dependency in `package.json`
- [x] All components properly import from `../scripts/supabaseClient.js`
- [x] Build passes successfully

### Phase 2: Schema Alignment (Backend)
- [ ] Decide on target schema: `public` or `api`
- [ ] If `public`: Create/migrate tables to public schema
- [ ] If `api`: Update `supabaseClient.js` to use `api` schema
- [ ] Verify RLS policies are configured

### Phase 3: Table Setup (Run in Supabase SQL Editor)

#### Option A: Create tables in PUBLIC schema (Recommended)
```sql
-- practice_units table
CREATE TABLE IF NOT EXISTS public.practice_units (
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

-- lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- lesson_units table (junction table)
CREATE TABLE IF NOT EXISTS public.lesson_units (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  practice_unit_id TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- mts-notes table
CREATE TABLE IF NOT EXISTS public."mts-notes" (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Enable RLS on all tables
```sql
ALTER TABLE public.practice_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mts-notes" ENABLE ROW LEVEL SECURITY;

-- Create policies for each table (owner-only access)
CREATE POLICY "Users manage own data" ON public.practice_units
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own lessons" ON public.lessons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own lesson_units" ON public.lesson_units
  FOR ALL USING (
    lesson_id IN (SELECT id FROM public.lessons WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own notes" ON public."mts-notes"
  FOR ALL USING (auth.uid() = user_id);
```

### Phase 4: Verification Testing
- [ ] Test authentication (sign up, sign in, sign out)
- [ ] Test creating a practice unit (scale)
- [ ] Test creating a lesson
- [ ] Test practice notes CRUD
- [ ] Check browser console for API errors

---

## 4. Code Files Reference Map

```
src/
├── scripts/
│   └── supabaseClient.js          # Singleton Supabase client
├── stores/
│   └── lessonStore.js             # Lesson CRUD operations
└── components/
    ├── Preferences.vue            # Auth UI (login/signup)
    ├── AuthStatusBanner.vue       # Auth status display
    ├── CreateScaleView.vue        # Scale → practice_units
    ├── CreateExercise.vue         # Exercise → practice_units
    ├── CreatePracticeUnitView.vue # Preview → practice_units
    ├── CreateEditPracticeUnit.vue # Edit → practice_units
    ├── CreateLessons.vue          # Session check
    └── PracticeNotes.vue          # Notes → mts-notes
```

---

## 5. Quick Diagnostic Commands

### Check if Supabase client is accessible
Open browser console on the app and run:
```javascript
// Check if supabase is available
console.log(window.__SUPABASE_CLIENT__ || 'Not exposed globally');

// Or import and test
import('/src/scripts/supabaseClient.js').then(m => {
  m.supabase.auth.getSession().then(console.log);
});
```

### Test table access (when logged in)
```javascript
// From browser console after login
const { data, error } = await supabase.from('practice_units').select('*').limit(1);
console.log({ data, error });
```

---

## 6. Summary

**Current Status**: Code is intact; issue is likely backend table/schema configuration.

**Primary Fix**: Execute the SQL in Phase 3 in Supabase Dashboard to create tables in `public` schema with proper RLS policies.

**No code changes required** unless you decide to change the target schema from `public` to `api`.



## 7. Implementation Steps (Actionable)

### Step 1: Create/Repair Tables in Supabase (public schema)
Run the following SQL in the Supabase SQL Editor:

```sql
-- practice_units table
CREATE TABLE IF NOT EXISTS public.practice_units (
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

-- lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- lesson_units table (junction table)
CREATE TABLE IF NOT EXISTS public.lesson_units (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  practice_unit_id TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- mts-notes table
CREATE TABLE IF NOT EXISTS public."mts-notes" (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Step 2: Enable Row Level Security (RLS) and Policies
Run the following SQL in the Supabase SQL Editor:

```sql
ALTER TABLE public.practice_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mts-notes" ENABLE ROW LEVEL SECURITY;

-- Owner-only access policies
CREATE POLICY "Users manage own data" ON public.practice_units
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own lessons" ON public.lessons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own lesson_units" ON public.lesson_units
  FOR ALL USING (
    lesson_id IN (SELECT id FROM public.lessons WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own notes" ON public."mts-notes"
  FOR ALL USING (auth.uid() = user_id);
```

### Step 3: Verification
- Test authentication and CRUD operations from the app.
- Check for API errors in the browser console.
- Ensure all tables are in the `public` schema (not `api`).

---

## 8. Best Practice: Add Local and Production URLs to Supabase Auth

### Step-by-Step Repair Path

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com/ and select your project.

2. **Navigate to Authentication Settings**
   - In the left sidebar, click on 'Authentication'.
   - Click on 'URL Configuration' or 'Settings'.

3. **Set Site URL**
   - Enter your production site URL (e.g., `https://your-site.netlify.app/`).
   - For local development, enter your local URL (e.g., `http://localhost:5173/`).

4. **Add Redirect URLs**
   - In the 'Redirect URLs' field, add both URLs, one per line:
     ```
     http://localhost:5173/
     https://your-site.netlify.app/
     ```
   - This allows Supabase to redirect authentication flows to both environments.

5. **Save Changes**
   - Click 'Save' or 'Update' to apply the changes.

6. **Test Authentication Flows**
   - Try sign up, login, and password reset from both local and production environments.
   - Confirm that confirmation and reset emails contain the correct redirect URL.

7. **Troubleshooting**
   - If you do not receive emails, check your spam folder and Supabase SMTP configuration.
   - If you see 'No authentication token found in URL', verify the redirect URL matches your app's current domain.

---

**After completing these steps, your Supabase backend will be fully aligned with your client code.**
