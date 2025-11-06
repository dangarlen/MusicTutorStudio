# Multi-Unit Data Store Roadmap (Foldable)

This roadmap lays out a step-wise plan to evolve from a single active practice unit to a full library of Scales and Exercises that can be combined into Lessons, with clean import/export to JSON. Each milestone includes goals, scope, acceptance criteria, and implementation notes.

<details>
<summary><strong>0) Current State (baseline)</strong></summary>

- Practice Scales route renders notes via VexFlow with overlays and note color cycling.
- `composePracticeUnit.js` produces a Scale practiceUnit with header + noteArray.
- `practiceUnitHeader.noteColorDesignation` is supported and exported.
- Export button saves a composed practiceUnit JSON.

Acceptance criteria:

- The current Scale pathway composes valid JSON and exports it.

</details>

<details>
<summary><strong>1) Finalize core schemas</strong> (PracticeUnit, Lesson, Library)</summary>

- PracticeUnit (existing; extend for Exercises/Passages)
  - `practiceUnitHeader`: { practiceUnitId (GUID), lastModified (ISO), practiceUnitType ("Scale"|"Exercise"|"Passage"), practiceName, tempo, keySignature, timeSignature, instrument, staffDisplayOptions, noteColorDesignation, sourceURL, User (string user id), shareMusic (boolean) }
  - Branch object: `practiceUnitScale` | `practiceUnitExercise` | `practiceUnitPassage`
  - `noteArray`: Note[]
- Lesson (new)
  - `{ lessonId (GUID), name, description?, items: [{ practiceUnitId, repeat?: number, notes?: string }], lastModified }`
- Library (export container)
  - `{ meta: { formatVersion: "1.0", exportedAt, appVersion? }, practiceUnits: PracticeUnit[], lessons: Lesson[] }`

Acceptance criteria:

- JSON examples exist in docs for each shape.
- Validator signatures defined: `validatePracticeUnit(unit)`, `validateLesson(lesson)`.

</details>

<details>
<summary><strong>2) Create library store</strong> (Pinia)</summary>

File: `vue-src-alpha/stores/practiceUnitLibraryStore.js`

State:

- `unitsById: Record<string, PracticeUnit>`
- `unitOrder: string[]` (UI order)
- `lessonsById: Record<string, Lesson>`
- `lessonOrder: string[]`

Actions (MVP):

- `upsertUnit(unit): string`, `duplicateUnit(id): string`, `deleteUnit(id)`
- `upsertLesson(lesson): string`, `deleteLesson(lessonId)`
- `exportSelection({ unitIds?, lessonIds? }): Library`
- `importLibrary(library, { onCollision: "skip"|"overwrite"|"re-id" })`
- `persist()` / `load()` to localStorage key `mts.library`

Acceptance criteria:

- Units/lessons survive page refresh via localStorage.
- Duplicate and delete work and keep order arrays in sync.

</details>

<details>
<summary><strong>3) Unify composer API</strong></summary>

- Extend `composePracticeUnit` to accept `{ type: "Scale"|"Exercise"|"Passage" }` and branch payloads:
  - For Scale (existing): fill `practiceUnitScale`
  - For Exercise (new): fill `practiceUnitExercise` fields (e.g., exerciseType, techniqueFocus, repetitionCount)
  - For Passage (later): fill `practiceUnitPassage`
- Add `guid()` util and `touch(unit|lesson)` to set `lastModified`.
- Add lightweight validation functions (throw or return `{ ok, errors }`).

Acceptance criteria:

- Calling the composer with different types yields valid, type-specific units.

</details>

<details>
<summary><strong>4) Save / Save As in pages</strong></summary>

- Practice Scales (/#/practice-scales):
  - Add buttons: "Save as New", "Update Existing" (when editing an existing unit).
  - On save: `composePracticeUnit({ type:"Scale" })` → `library.upsertUnit()`.
- Practice Exercises (new page): mirror Scales workflow.

Acceptance criteria:

- User can save a Scale unit into the library with a name and see it listed later.

</details>

<details>
<summary><strong>5) Library UI</strong></summary>

- New route: Manage Library
  - Tabs: All | Scales | Exercises | Passages | Lessons
  - Per-unit actions: View, Practice, Duplicate, Delete, Export
  - Toolbar: Import JSON, Export Selected JSON, New Lesson
  - Search/filter by name/type; sort by `lastModified`

Acceptance criteria:

- Saved units appear with correct type; actions perform as expected.

</details>

<details>
<summary><strong>6) Import / Export flows</strong></summary>

Export:

- Export selected units/lessons to a single `Library` JSON: `{ meta, practiceUnits, lessons }`.
- Also allow per-unit/lesson single-file exports for convenience.

Import:

- Accept either a single PracticeUnit object or a full Library bundle.
- Collision strategies: `skip` (default), `overwrite`, `re-id` (generate new IDs and rewrite internal lesson item references).
- Post-import summary: added / updated / skipped counts.

Acceptance criteria:

- Round-trip: export → delete from library → import → items restored 1:1.

</details>

<details>
<summary><strong>7) Lessons schema & builder</strong></summary>

- Store: add `lessonsById`, `lessonOrder` with CRUD.
- Lesson Builder UI:
  - Pick units from library; build ordered `items` with optional `repeat` and `notes`.
  - Save/Update lesson; show preview (list of items linking to units).

Acceptance criteria:

- User can assemble a lesson from saved units and persist it.

</details>

<details>
<summary><strong>8) Integrations & previews</strong></summary>

- Update "Behind the Curtain" panels to show full composed unit JSON and lesson JSON.
- Add small preview/play affordances in lists (open unit in appropriate view/route).

Acceptance criteria:

- Previews reflect latest data; navigation between unit/lesson views works.

</details>

<details>
<summary><strong>9) Validation & QA gates</strong></summary>

- `validatePracticeUnit` checks: header presence, type branch present, noteArray shape, instrument object present.
- `validateLesson` checks: each `practiceUnitId` exists (or warn), items array non-empty.
- Add fast tests or dev-only assertions; keep logs concise and actionable.

Acceptance criteria:

- Invalid imports are rejected with a clear message; library remains consistent.

</details>

<details>
<summary><strong>10) Persistence upgrade (optional)</strong></summary>

- Migrate library persistence from localStorage to IndexedDB (e.g., `idb-keyval`).
- Keep an in-memory cache mirrored by async IDB ops; lazy-load on boot.

Acceptance criteria:

- Large libraries (>5MB JSON) remain responsive and durable.

</details>

<details>
<summary><strong>11) Packaging & deploy</strong></summary>

- Ensure Vite base path and Netlify config serve the SPA under `/alpha-vue-SPA/` in production; use `/#/...` in dev.
- Export/import tested on production build.

Acceptance criteria:

- Production build serves library routes; import/export works in prod and dev.

</details>

---

## Contracts & data shapes (quick reference)

- PracticeUnit (per MTS-json.md) with header + branch + noteArray.
- Lesson: `{ lessonId, name, description?, items: [{ practiceUnitId, repeat?, notes? }], lastModified }`.
- Library: `{ meta: { formatVersion, exportedAt, appVersion? }, practiceUnits: PracticeUnit[], lessons: Lesson[] }`.

## Risks & edge cases

- Import collisions: choose consistent strategy (default `skip`), allow user override.
- Lessons referencing missing units: warn and allow partial import; offer to import required units if present in bundle.
- Versioning: bump `meta.formatVersion` on breaking changes; add simple upgrader.
- Instrument variations: keep instrument embedded per unit (no global pointer).

## Try it (execution hints)

- Use the existing VS Code tasks to run the dev server and production build.
- During development, open `http://localhost:5173/#/practice-scales` (hash router root).
- Export a unit; then test Library import after deleting it from the store.
