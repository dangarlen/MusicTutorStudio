# Music Tutor Studio - User Workflow Documentation

**Last Updated:** November 26, 2025  
**Purpose:** Complete map of user navigation paths and workflows through the Music Tutor Studio Vue SPA

---

## Overview

Music Tutor Studio is a single-page application (SPA) for creating, practicing, and managing music exercises, scales, and lessons for euphonium and related instruments. The application uses Vue Router with hash-based routing.

---

## Primary User Journeys

### 1. Home → Creator Workflow

**Entry Point:** `/` (Home page)

**User Goal:** Create custom scales or exercises for practice

**Navigation Paths:**

```
Home (/)
  ├─→ Creator (/creator)
       ├─→ Create Scales (/create-scales)
       │    ├─→ View Scale (/create-practice-unit-view)
       │    ├─→ Edit Scale (/create-edit-practice-unit)
       │    └─→ Save to Export (/save-to-practice-unit-export)
       │
       └─→ Create Exercises (/create-exercises)
            ├─→ View Exercise (/create-practice-unit-view)
            ├─→ Edit Exercise (/create-edit-practice-unit)
            └─→ Save to Export (/save-to-practice-unit-export)
```

**Key Interactions:**
- Select instrument, clef, key signature
- Choose root note and scale type (Major, Minor, etc.)
- Import MusicXML files for exercises
- Preview on staff notation (VexFlow)
- Save practice units to localStorage or export as JSON
- Load saved practice units from files

---

### 2. Home → Practice Workflow

**Entry Point:** `/` (Home page)

**User Goal:** Practice saved scales/exercises or active lesson content

**Navigation Paths:**

```
Home (/)
  └─→ Practice (/practice)
       ├─→ Active Unit Practice (/practice-active-unit → /practice-scales)
       │    ├─→ Note Practice (/practice-notes)
       │    ├─→ Pitch Practice (/practice-pitch)
       │    └─→ Tuning Practice (/practice-tuning)
       │
       └─→ Recall Saved Practice Unit (/practice-recall-practice-unit → /practice-exercises)
            ├─→ Import Practice Unit (/import-practice-unit-export)
            └─→ Recall from Pinia (/recall-json-from-pinia)
```

**Key Interactions:**
- Load practice units from memory, localStorage, or JSON files
- View staff notation with fingerings
- Practice individual notes with audio playback (Tone.js)
- Check pitch accuracy with microphone input
- Practice tuning exercises
- Navigate between exercises in active lesson

---

### 3. Home → Lessons Workflow

**Entry Point:** `/` (Home page)

**User Goal:** Organize practice units into structured lessons and track progress

**Navigation Paths:**

```
Home (/)
  └─→ Lessons (/lessons)
       ├─→ Manage Lessons (/lessons-manage)
       │    └─→ Create Lesson (/lessons-create)
       │
       ├─→ Start Lesson (/lessons-start)
       │    └─→ Continue Lesson (/lessons-continue)
       │         └─→ Practice Active Unit (/practice-active-unit)
       │
       └─→ Return to Lessons (navigation component)
```

**Key Interactions:**
- Create new lessons with multiple practice units
- Add scales and exercises to lessons in sequence
- Manage lesson metadata (name, description)
- Start lessons and track progress through units
- Continue from last position in active lesson
- Complete lessons and mark progress

---

### 4. Home → Preferences Workflow

**Entry Point:** `/` (Home page)

**User Goal:** Configure application settings and user preferences

**Navigation Path:**

```
Home (/)
  └─→ Preferences (/preferences)
       ├─→ Login/Authentication
       ├─→ Instrument Selection
       ├─→ Audio Settings
       └─→ Display Preferences
```

**Key Interactions:**
- Select default instrument
- Configure audio input/output devices
- Set pitch detection sensitivity
- Adjust notation display options
- Save preferences to localStorage

---

### 5. Home → About Workflow

**Entry Point:** `/` (Home page)

**User Goal:** View application information, features, and credits

**Navigation Path:**

```
Home (/)
  └─→ About (/about)
       ├─→ Overview
       ├─→ Core Features
       ├─→ FAQ
       ├─→ Contributors
       ├─→ Tools & Acknowledgments
       └─→ Release Notes/Changelog
```

**Key Interactions:**
- Expand/collapse sections for features, FAQ, changelog
- View tool dependencies and credits
- Access release notes with timestamps
- Navigate to external documentation links

---

## Route Reference Table

| Route Path | Component | Purpose | Parent Route |
|------------|-----------|---------|--------------|
| `/` | Home | Main landing page | - |
| `/creator` | Creator | Creator hub | `/` |
| `/practice` | Practice | Practice hub | `/` |
| `/lessons` | Lessons | Lessons hub | `/` |
| `/preferences` | Preferences | User settings | `/` |
| `/about` | About | App information | `/` |
| `/create-scales` | CreateScaleView | Scale creator | `/creator` |
| `/create-exercises` | CreateExercise | Exercise creator | `/creator` |
| `/create-practice-unit-view` | CreatePracticeUnitView | Unified viewer for scales/exercises | `/create-scales`, `/create-exercises` |
| `/create-edit-practice-unit` | CreateEditPracticeUnit | Edit practice units in memory | `/create-practice-unit-view` |
| `/practice-active-unit` | PracticeScales | Practice loaded unit | `/practice` |
| `/practice-recall-practice-unit` | PracticeExercises | Load/recall practice units | `/practice` |
| `/practice-notes` | PracticeNotes | Note identification practice | `/practice-active-unit` |
| `/practice-pitch` | PracticePitch | Pitch matching practice | `/practice-active-unit` |
| `/practice-tuning` | PracticeTuning | Tuning practice | `/practice-active-unit` |
| `/lessons-manage` | LessonsManage | Manage existing lessons | `/lessons` |
| `/lessons-create` | CreateLessons | Create new lessons | `/lessons`, `/lessons-manage` |
| `/lessons-start` | LessonsStart | Start a lesson session | `/lessons` |
| `/lessons-continue` | LessonsContinue | Continue active lesson | `/lessons-start` |
| `/save-to-practice-unit-export` | SaveToPracticeUnitExport | Export practice units | `/create-practice-unit-view` |
| `/import-practice-unit-export` | ImportPracticeUnitExport | Import practice units | `/practice-recall-practice-unit` |
| `/recall-json-from-pinia` | RecallJsonFromPinia | Recall from Pinia store | `/practice-recall-practice-unit` |
| `/edit-practice-unit-scale-in-memory` | EditPracticeUnitScaleInMemory | In-memory scale editing | `/create-edit-practice-unit` |
| `/debug-state` | DebugState | Developer state inspection | - |
| `/phase-test-container` | PhaseBasedVueTestContainer | Testing container | - |

---

## Navigation Components

### Global Navigation
- **Header Component:** Provides app title and navigation menu
- **Footer Components:**
  - `FooterMain`: Home page footer with version info
  - `FooterStandard`: Standard footer with home button and version
  - `FooterBase`: Base footer with dynamic version from JSON

### Context-Specific Navigation
- **PracticeReturn**: Return to Practice hub button
- **LessonsReturn**: Return to Lessons hub button
- **RouterLink buttons**: Throughout UI for page-to-page navigation

---

## Data Flow Summary

1. **Creator → Practice:**
   - Create scale/exercise in Creator
   - Save to Pinia store (in-memory)
   - Navigate to Practice
   - Load from active unit in Pinia

2. **Creator → Export → Import → Practice:**
   - Create practice unit
   - Export as JSON file
   - Import JSON file in Practice
   - Load into Pinia and practice

3. **Creator → Lessons → Practice:**
   - Create multiple practice units
   - Add units to lesson in sequence
   - Start lesson
   - Practice units in lesson order
   - Track progress through lesson

---

## Critical User Paths (Priority for Testing)

1. **Quick Practice Path:** Home → Creator → Create Scale → Practice Active Unit
2. **Save/Load Path:** Home → Creator → Create Exercise → Save → Practice → Recall → Import
3. **Lesson Path:** Home → Lessons → Create Lesson → Add Units → Start → Practice
4. **Settings Path:** Home → Preferences → Save Settings → Return to Home

---

## Known Navigation Issues to Test

- [ ] Verify all RouterLink paths resolve correctly
- [ ] Check back-button behavior in hash routing
- [ ] Validate state persistence across route changes
- [ ] Test error handling for invalid routes
- [ ] Confirm footer version updates correctly
- [ ] Verify lesson continue state after page refresh
- [ ] Test practice unit state when navigating between creators

---

## Testing Strategy

**End-to-End Tests Should Cover:**
1. Happy path navigation through each primary workflow
2. State persistence (Pinia + localStorage) across navigation
3. Form submissions and data validation in Creator pages
4. Audio playback and microphone access in Practice pages
5. Lesson sequencing and progress tracking
6. Footer and header rendering across all pages
7. Error states and user feedback (toasts, alerts)

**Manual Testing Priorities:**
1. Audio input/output device selection
2. Pitch detection accuracy
3. VexFlow rendering performance with large scales
4. MusicXML import edge cases
5. Cross-browser compatibility (Chromium, Firefox, Safari)

---

## References

- Router definition: [`src/router/index.js`](../src/router/index.js)
- Component directory: [`src/components/`](../src/components/)
- Pinia stores: [`src/stores/`](../src/stores/)
- Vite configuration: [`vite.config.js`](../vite.config.js)
