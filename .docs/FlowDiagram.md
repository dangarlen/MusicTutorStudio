
# Copilot Prompt: Vue.js Website Flow Diagram

I want to generate a flow diagram (or text outline) of my Vue.js website.
- The diagram should list all routes and navigation flows.
- Each route should include possible branches (success, failure, error).
- Show conditional flows (e.g., authentication success/failure, form validation).
- Output should be in Markdown with clear hierarchy:
  - Numbered outline for routes
  - Indented sub-flows for branches
- Keep it audit-friendly for manual testing.
- Example structure:

## Website Flow Diagram

1. Home (`/`)
   1.1. Navigate to Practice, Lessons, Creator, About, Preferences
   1.2. Authentication (if required)
     - Success → Access all features
     - Failure → Limited access / Error

2. Practice
   2.1. Practice (`/practice`)
     - Start Practice → Practice Active Unit
   2.2. Recall Practice Unit (`/practice-recall-practice-unit`)
     - Select Unit → Practice Active Unit
   2.3. Practice Active Unit (`/practice-active-unit`)
     - Complete → Return to Practice or Lessons
   2.4. Practice Notes (`/practice-notes`)
   2.5. Practice Pitch (`/practice-pitch`)
   2.6. Practice Tuning (`/practice-tuning`)

3. Creator
   3.1. Creator (`/creator`)
     - Create Exercise → Create Exercises
     - Create Scale → Create Scales
   3.2. Create Exercises (`/create-exercises`)
     - Import MusicXML
       - Success → Preview/Edit Exercise
       - Failure → Error
     - Edit Notes (Trim/Delete/Rest)
     - Practice Now → Practice Active Unit
   3.3. Create Scales (`/create-scales`)
     - Select Scale Options
     - Generate Scale → Preview/Edit
   3.4. Create Practice Unit View (`/create-practice-unit-view`)
   3.5. Create Edit Practice Unit (`/create-edit-practice-unit`)

4. Lessons
   4.1. Lessons (`/lessons`)
     - Manage Lessons → Lessons Manage
     - Start Lesson → Lessons Start
     - Continue Lesson → Lessons Continue
   4.2. Lessons Manage (`/lessons-manage`)
   4.3. Lessons Create (`/lessons-create`)
   4.4. Lessons Start (`/lessons-start`)
   4.5. Lessons Continue (`/lessons-continue`)

5. Preferences (`/preferences`)
   5.1. Change Instrument, Theme, etc.

6. About (`/about`)

7. Utility & Advanced
   7.1. Save to Practice Unit Export (`/save-to-practice-unit-export`)
   7.2. Recall JSON from Pinia (`/recall-json-from-pinia`)
   7.3. Import Practice Unit Export (`/import-practice-unit-export`)
   7.4. Edit Practice Unit Scale In Memory (`/edit-practice-unit-scale-in-memory`)
   7.5. Debug State (`/debug-state`)
   7.6. Phase Test Container (`/phase-test-container`)

8. Error/Not Found
   8.1. Invalid Route → Redirect to Home or Error Page

**Conditional Flows:**
- Authentication required for some routes (Home, Practice, Lessons)
- Form validation on import, creation, and editing (success/failure branches)
- Legacy routes (`/create-lessons`, `/create-scale-view`, `/create-exercise-view`) redirect to unified views
