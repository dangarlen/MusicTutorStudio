# 🎯 Quick Start Checklist

Use this checklist to get your Supabase integration up and running.

## ✅ Prerequisites (Already Done)

- [x] Supabase client enhanced with session persistence
- [x] Service composables created (6 services)
- [x] Environment variables configured (.env created)
- [x] SQL schema documented (database/schema.sql)
- [x] RLS policies documented (database/rls-policies.sql)
- [x] Code built successfully (npm run build ✓)

## 📝 Database Setup (5 minutes - REQUIRED)

Follow these steps to set up your Supabase database:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `rlcepiyvbxfzjtrxpqad`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run Schema SQL
1. Click "New Query"
2. Copy contents of `database/schema.sql`
3. Paste into the SQL editor
4. Click "Run" or press Cmd/Ctrl + Enter
5. ✅ Verify: Should see "Success. No rows returned"

### Step 3: Run RLS Policies SQL
1. Click "New Query" again
2. Copy contents of `database/rls-policies.sql`
3. Paste into the SQL editor
4. Click "Run"
5. ✅ Verify: Should see "Success. No rows returned"

### Step 4: Verify Tables Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lessons', 'practice_units', 'lesson_units', 'mts-notes', 'TestLog');
```
✅ Expected: Should return 5 rows (all 5 tables)

### Step 5: Verify RLS Enabled
Run this query:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('lessons', 'practice_units', 'lesson_units', 'mts-notes', 'TestLog');
```
✅ Expected: 
- lessons: rowsecurity = true
- practice_units: rowsecurity = true
- lesson_units: rowsecurity = true
- mts-notes: rowsecurity = true
- TestLog: rowsecurity = false (intentional for debugging)

## 🧪 Testing (15 minutes - RECOMMENDED)

### Step 1: Start Development Server
```bash
npm run dev
```
✅ Verify: Server starts without errors

### Step 2: Test Authentication
1. Navigate to http://localhost:5173/#/preferences
2. Enter email and password
3. Click "Create Account"
4. ✅ Verify: "Signup requested. Check email..." or "Account created"
5. Click "Login" with same credentials
6. ✅ Verify: "Logged in as [email]"
7. Check browser console for any errors
8. ✅ Verify: No red errors in console

### Step 3: Test Lessons
1. Navigate to "Create Lessons" page
2. Enter a lesson name: "Test Lesson"
3. Click "Save Lesson to Database"
4. ✅ Verify: Success message appears
5. Navigate to "Start Lesson" page
6. ✅ Verify: Your lesson appears in the list
7. Check browser console
8. ✅ Verify: No errors

### Step 4: Test Practice Notes
1. Navigate to "Practice Notes" page
2. Fill in:
   - Title: "Test Note"
   - Detail: "This is a test"
   - Practice Unit: "Test"
3. Click "Add Note"
4. ✅ Verify: Note appears in the list
5. Click "Edit" on the note
6. Change title to "Updated Note"
7. Click "Save"
8. ✅ Verify: Note title updated
9. Click "Delete" on the note
10. ✅ Verify: Note removed from list

### Step 5: Test Data Persistence
1. Refresh the browser page (F5)
2. ✅ Verify: Still logged in (session persisted)
3. Navigate to "Start Lesson"
4. ✅ Verify: Your lesson still appears
5. Check browser LocalStorage (DevTools > Application > Local Storage)
6. ✅ Verify: See `mts-supabase-auth-token` key

### Step 6: Test Logout
1. Click "Sign out" button
2. ✅ Verify: Logged out successfully
3. Refresh page
4. ✅ Verify: Still logged out (session cleared)

## 🔍 Troubleshooting

### ❌ "Not authenticated" errors
**Solution:** Make sure you're logged in before accessing protected pages
```javascript
// Check in browser console:
localStorage.getItem('mts-supabase-auth-token')
// Should show a session token if logged in
```

### ❌ "Row level security policy violation"
**Solution:** 
1. Verify RLS policies were applied (see Database Setup Step 5)
2. Make sure you're logged in
3. Check that you're only accessing your own data

### ❌ Build errors "Module not found"
**Solution:**
```bash
rm -rf node_modules
npm install
npm run build
```

### ❌ Environment variables not loading
**Solution:**
1. Verify `.env` file exists in project root
2. Restart the dev server
3. Check that variables are prefixed with `VITE_`

### ❌ Tables not created
**Solution:**
1. Check Supabase dashboard for error messages
2. Re-run `database/schema.sql`
3. Verify you're in the correct project

## 📚 Documentation Reference

- **Main Integration Guide:** `SUPABASE_INTEGRATION.md`
- **Database Guide:** `database/README.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Testing Guide:** `src/composables/__test_services.js`

## 🎉 Success Criteria

You're done when:

- [x] All 5 tables exist in Supabase
- [x] RLS is enabled on 4 tables (not TestLog)
- [x] You can sign up and log in
- [x] You can create a lesson
- [x] You can create a practice note
- [x] Session persists across page refreshes
- [x] No errors in browser console
- [x] Data persists in Supabase dashboard

## 🚀 Production Deployment

When ready to deploy:

1. **Update Environment Variables**
   - Add `VITE_SUPABASE_URL` to Netlify/Vercel env vars
   - Add `VITE_SUPABASE_ANON_KEY` to Netlify/Vercel env vars

2. **Build and Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting
   ```

3. **Verify Production**
   - Test signup/login on live site
   - Test data persistence
   - Check browser console for errors

## 💡 Pro Tips

1. **Use Service Composables** for cleaner code:
   ```javascript
   import { useLessonsService } from '@/composables/useLessonsService';
   const lessons = useLessonsService();
   const data = await lessons.fetchLessons();
   ```

2. **Check Supabase Dashboard** for:
   - Real-time data updates
   - User list in Authentication
   - Table row counts
   - Error logs

3. **Browser DevTools** are your friend:
   - Console tab: Check for errors
   - Network tab: Inspect Supabase API calls
   - Application tab: View localStorage tokens

4. **Database Logs** in Supabase:
   - Go to Logs section
   - Filter by table or RLS policy
   - Debug access denied errors

## ✅ Final Checklist

Before closing this task:

- [ ] Database setup completed (all tables created)
- [ ] RLS policies applied
- [ ] Authentication tested (signup, login, logout)
- [ ] Lessons tested (create, view)
- [ ] Notes tested (create, edit, delete)
- [ ] Session persistence verified
- [ ] No console errors
- [ ] Ready for production deployment

---

**Need Help?** Check the documentation files listed above or search for specific errors in the troubleshooting sections.

**Status: Ready to Go!** 🚀
