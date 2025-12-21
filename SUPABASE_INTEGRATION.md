# Supabase Integration Guide

This document describes the Supabase backend integration for Music Tutor Studio.

## Overview

The application uses Supabase for:
- **Authentication:** User signup, login, password reset, magic links
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Real-time:** Optional (can be enabled for live updates)

## Architecture

### Singleton Client Pattern

The application uses a single Supabase client instance (`src/scripts/supabaseClient.js`) that:
- Loads credentials from environment variables
- Persists auth sessions in localStorage
- Auto-refreshes expired tokens
- Supports magic link authentication
- Provides helper functions for auth state

### Service Composables Layer

Six service composables provide clean abstractions over Supabase operations:

1. **useAuthService** - Authentication operations
2. **useLessonsService** - Lesson CRUD operations
3. **usePracticeUnitsService** - Practice unit CRUD with public sharing
4. **useLessonUnitsService** - Lesson-to-unit linking
5. **useNotesService** - Private practice notes
6. **useTestLogService** - Diagnostic logging

### Data Flow

```
Vue Components
      ↓
Service Composables (optional)
      ↓
supabaseClient (singleton)
      ↓
Supabase Backend
```

**Note:** Components can use services OR call Supabase directly. Both patterns are supported.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your Supabase credentials
# VITE_SUPABASE_URL=your_project_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
```

The `.env` file is git-ignored for security.

### 2. Database Setup

Run the SQL files in your Supabase SQL Editor:

1. **Schema:** `database/schema.sql`
   - Creates all tables with proper types and constraints
   - Sets up indexes for performance
   - Adds triggers for auto-updating timestamps

2. **RLS Policies:** `database/rls-policies.sql`
   - Enables Row Level Security on all tables
   - Creates policies for user-scoped access
   - Configures public sharing for practice units

See `database/README.md` for detailed setup instructions.

### 3. Verify Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start dev server
npm run dev
```

Open browser console and check for any Supabase errors.

## Usage Examples

### Authentication

```vue
<script setup>
import { useAuthService } from '@/composables/useAuthService';

const auth = useAuthService();

async function handleSignUp() {
  const { user, error } = await auth.signUp(email.value, password.value);
  if (error) {
    console.error('Signup failed:', error);
  } else {
    console.log('Signed up:', user);
  }
}

async function handleSignIn() {
  const { user, error } = await auth.signInWithPassword(email.value, password.value);
  if (error) {
    console.error('Login failed:', error);
  }
}

async function handleSignOut() {
  await auth.signOut();
}
</script>
```

### Lessons Management

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useLessonsService } from '@/composables/useLessonsService';

const lessons = useLessonsService();
const myLessons = ref([]);

onMounted(async () => {
  // Fetch all lessons for current user
  myLessons.value = await lessons.fetchLessons();
});

async function createLesson() {
  const result = await lessons.createLesson('My New Lesson', []);
  console.log('Created:', result.lessonId);
  
  // Refresh list
  myLessons.value = await lessons.fetchLessons();
}

async function deleteLesson(lessonId) {
  await lessons.deleteLesson(lessonId);
  myLessons.value = await lessons.fetchLessons();
}
</script>
```

### Practice Units

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { usePracticeUnitsService } from '@/composables/usePracticeUnitsService';

const units = usePracticeUnitsService();
const myUnits = ref([]);

onMounted(async () => {
  // Fetch user's units AND public shared units
  myUnits.value = await units.fetchPracticeUnits({
    includeShared: true,
    orderBy: 'last_modified',
    ascending: false
  });
});

async function createUnit() {
  await units.createPracticeUnit({
    name: 'C Major Scale',
    type: 'Scale',
    unit_json: { /* ... */ },
    is_public: false
  });
}

async function shareUnit(unitId) {
  // Make unit public
  await units.togglePublicStatus(unitId, true);
}
</script>
```

### Practice Notes

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useNotesService } from '@/composables/useNotesService';

const notes = useNotesService();
const myNotes = ref([]);

onMounted(async () => {
  // Fetch only open notes
  myNotes.value = await notes.fetchNotes({
    status: 'open',
    orderBy: 'created_at',
    ascending: false
  });
});

async function createNote() {
  await notes.createNote({
    title: 'Practice reminder',
    detail: 'Work on tempo',
    practice_unit: 'C Major Scale',
    status: 'open'
  });
}

async function closeNote(noteId) {
  await notes.toggleNoteStatus(noteId, 'closed');
}
</script>
```

## Database Schema

### Tables

- **lessons** - User's lesson collections
- **practice_units** - Practice exercises (scales, etc.) with optional public sharing
- **lesson_units** - Links lessons to practice units with sort order
- **mts-notes** - Private practice notes
- **TestLog** - Diagnostic logging (public access)

### Relationships

```
auth.users
    ├── lessons (1:many)
    │       └── lesson_units (1:many)
    │               └── practice_units (many:1)
    ├── practice_units (1:many)
    └── mts-notes (1:many)
```

See `database/README.md` for complete schema documentation.

## Security

### Row Level Security (RLS)

All tables except TestLog use RLS to ensure:
- Users can only access their own data
- Public practice units can be viewed by anyone
- Lesson units are accessible only through owned lessons

### Best Practices

1. **Never disable RLS** on user data tables
2. **Use environment variables** for credentials (never commit keys)
3. **Validate input** before database operations
4. **Use service composables** for consistent error handling
5. **Check authentication** before protected operations

### Authentication Flow

```
1. User signs up/in
   ↓
2. Supabase creates session
   ↓
3. Session stored in localStorage
   ↓
4. Token auto-refreshes when expired
   ↓
5. auth.uid() available for RLS policies
```

## Migration from Direct Calls

If you have components using direct Supabase calls, you can:

**Option 1:** Keep using direct calls (they work fine)
```vue
<script setup>
import supabase from '@/scripts/supabaseClient';

const { data, error } = await supabase.from('lessons').select('*');
</script>
```

**Option 2:** Migrate to service composables (cleaner)
```vue
<script setup>
import { useLessonsService } from '@/composables/useLessonsService';

const lessons = useLessonsService();
const data = await lessons.fetchLessons();
</script>
```

Both patterns are valid. Services provide:
- Consistent error handling
- User authentication checks
- Cleaner component code
- Easier testing

## Troubleshooting

### Authentication Issues

**Problem:** "Not authenticated" errors
- **Solution:** Check that user is signed in before protected operations
- **Debug:** `const { user } = await auth.getSession();`

### RLS Policy Errors

**Problem:** "Row level security policy violation"
- **Solution:** Ensure user owns the data being accessed
- **Debug:** Check Supabase dashboard for RLS policy details

### Environment Variables Not Loading

**Problem:** `import.meta.env.VITE_SUPABASE_URL` is undefined
- **Solution:** Ensure `.env` file exists and vars are prefixed with `VITE_`
- **Debug:** Check Vite config and restart dev server

### Build Errors

**Problem:** Module not found errors
- **Solution:** Run `npm install` to ensure all dependencies are installed
- **Debug:** Check that `@supabase/supabase-js` is in package.json

## Performance Optimization

### Indexes

All foreign keys and frequently queried columns have indexes. See `database/schema.sql`.

### Caching

Consider caching frequently accessed data:

```vue
<script setup>
import { ref } from 'vue';
import { useLessonsService } from '@/composables/useLessonsService';

const lessons = useLessonsService();
const cachedLessons = ref(null);

async function getLessons() {
  if (!cachedLessons.value) {
    cachedLessons.value = await lessons.fetchLessons();
  }
  return cachedLessons.value;
}
</script>
```

### Real-time Updates (Optional)

Enable real-time for live updates:

```javascript
// Subscribe to changes
const subscription = supabase
  .channel('lessons-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'lessons' },
    (payload) => {
      console.log('Change received!', payload);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
onUnmounted(() => {
  subscription.unsubscribe();
});
```

## Testing

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Reset password
- [ ] Create lesson
- [ ] Add practice units to lesson
- [ ] Reorder units in lesson
- [ ] Delete lesson
- [ ] Create practice note
- [ ] Edit practice note
- [ ] Toggle note status
- [ ] Share practice unit (make public)
- [ ] View shared practice units

### Automated Testing

For automated tests, use Supabase local development:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run tests against local instance
npm test
```

## Support

- **Documentation:** `database/README.md`
- **Supabase Docs:** https://supabase.com/docs
- **Issues:** Check browser console and Supabase dashboard logs

## Version History

- **v1.0** (2024-12-08): Initial Supabase integration
  - Enhanced supabaseClient with persistence and auto-refresh
  - Created 6 service composables
  - Generated complete SQL schema and RLS policies
  - Added environment variable configuration
