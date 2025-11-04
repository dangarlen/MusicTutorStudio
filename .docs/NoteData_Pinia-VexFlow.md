# Note Data Management from Create-scales to Pinia datastore to VexFlow

This guide explains how the Vue Alpha SPA moves note data from the Create Scales UI into Pinia stores, renders it with VexFlow, and exports it as practice unit JSON.

<details>
<summary><strong>Overview</strong></summary>

- UI controls in `CreateScaleView.vue` build a reactive `scaleSelections` object and generate `noteArray` entries.
- Notes live in Pinia (`useTestStaffNoteStore`) and are consumed by `StaffPreview.vue` for VexFlow rendering.
- Layout and ledger limits are driven by `public/staff-format.json`.
- Export uses `composePracticeUnit.js`, which maps UI selections and `noteArray` into an MTS practice unit JSON.

</details>

<details>
<summary><strong>High-level data flow</strong></summary>

```
CreateScaleView.vue (UI)
   ├─ updates store.scaleSelections (reactive)
   ├─ generates testStaffNoteStore.noteArray
   │
   ├─ SaveToPracticeUnitExport.vue (optional) → downloads practice unit JSON
   │
   └─ StaffPreview.vue (renderer)
        ├─ fetches public/staff-format.json (layout)
        ├─ reads practiceUnitScaleStore.instrument & scaleSelections
        ├─ consumes testStaffNoteStore.noteArray
        └─ draws staves with VexFlow (global CDN)

composePracticeUnit.js
   └─ builds { practiceUnitHeader, practiceUnitScale, noteArray }
```

</details>

<details>
<summary><strong>Pinia stores</strong></summary>

- `usePracticeUnitScaleStore` (file: `vue-src-alpha/stores/practiceUnitScaleStore.js`)

  - state
    - `instrument`: currently selected instrument object (from `public/data/instruments.json`)
    - `instruments`: the catalog loaded from JSON
    - `title`: page title (e.g., "Create Scale")
  - actions
    - `loadInstruments()`: fetches `public/data/instruments.json`
    - `setInstrument(inst)`, `setTitle(title)`

- `useTestStaffNoteStore` (file: `vue-src-alpha/stores/testStaffNoteStore.js`)
  - state
    - `noteArray`: array of note objects for rendering/export
    - `selectedNote`: optional cursor for UI selection
  - actions
    - `addNote(note)`, `selectNote(note)`, `clearNotes()`

Note shape used by the renderer:

- `{ pitch: "C#4" | "Bb3" | ... , duration: "w"|"h"|"q"|"e", noteColor?: string, overlay?: string }`

</details>

<details>
<summary><strong>Key components and responsibilities</strong></summary>

- `CreateScaleView.vue`

  - Owns the full Create Scales UI.
  - Maintains `store.scaleSelections`:
    - `key`, `scaleType`, `startingOctave`, `octaveCount`, `direction`
    - `noteDuration`, `timeSignature`, `maxMeasuresPerLine`
    - `staffOptions` toggles (key signature, accidentals, bar lines, time signature, accidental family)
  - Generates and writes notes to `testStaffNoteStore.noteArray`.
  - Persists staff options to `localStorage` key `mts.staffOptions`.
  - Reads the `instrument` cookie to default the instrument after `instruments` load.

- `StaffPreview.vue`

  - Loads layout config from `public/staff-format.json` (dimensions, ledger bounds, styling).
  - Reads `instrument.clef`, `scaleSelections`, and `testStaffNoteStore.noteArray`.
  - Filters notes by ledger limits if `staffOptions.enforceLedgerLimits` is true.
  - Splits notes into measures using the current time signature and lays them out across multiple lines using `maxMeasuresPerLine`.
  - Uses VexFlow’s `Formatter.formatToStave` (spacing locked to default for stability).

- `SaveToPracticeUnitExport.vue` (optional)

  - Presents the composed practice unit and allows download.

- `ViewScale.vue`
  - Read-only page variant decoupled from Create Scales.

</details>

<details>
<summary><strong>Rendering pipeline (VexFlow)</strong></summary>

- VexFlow is loaded via CDN in `vue-src-alpha/index.html` and accessed as `globalThis.Vex.Flow`.
- `StaffPreview.vue` rendering steps:
  1. Load staff format JSON (`getStaffFormat()` → `public/staff-format.json`).
  2. Determine clef from `instrument.clef` with config fallback.
  3. Determine time signature (defaults to `4/4`).
  4. Optionally filter notes beyond configured ledger limits.
  5. If bar lines are on, split into measures by quarter-note capacity; else draw a single stave.
  6. Compute per-line layout and wrap measures by `scaleSelections.maxMeasuresPerLine` (1–4; default 2).
  7. For spacing, use `Formatter.formatToStave([voice], stave)` to respect clef/key/time glyphs; custom spacing modes are disabled.

</details>

<details>
<summary><strong>Export mapping (composePracticeUnit.js)</strong></summary>

- `practiceUnitHeader`

  - `keySignature` ← `scaleSelections.key`
  - `timeSignature` ← `scaleSelections.timeSignature` (default `4/4`)
  - `instrument` ← selected instrument object
  - `staffDisplayOptions` ← merges `scaleSelections.staffOptions` plus:
    - `measuresPerLineMax` ← clamp( `scaleSelections.maxMeasuresPerLine`, 1..4 ), default `2`

- `practiceUnitScale`

  - `scaleType` ← `scaleSelections.scaleType`
  - `scaleRange.startingOctave` ← `scaleSelections.startingOctave`
  - `scaleRange.octaveCount` ← `scaleSelections.octaveCount`
  - `direction` ← `scaleSelections.direction`

- `noteArray` ← from `testStaffNoteStore.noteArray`

Notes:

- Practice unit JSON does not carry spacing configuration; spacing is controlled client-side (see staff-format.json).

</details>

<details>
<summary><strong>Persistence</strong></summary>

- Cookie

  - `instrument`: used to default the instrument on Create Scales load; Preferences page also saves/reads it.

- localStorage
  - `mts.staffOptions`: persists UI staff formatting toggles across sessions (`CreateScaleView.vue`).

</details>

<details>
<summary><strong>Staff layout config (public/staff-format.json)</strong></summary>

- Path: `public/staff-format.json`
- Example keys (used by `StaffPreview.vue`):
  - `staff.x`, `staff.y`, `staff.width`, `staff.height`
  - `staff.backgroundColor`, `staff.containerPadding`, `staff.containerBorderRadius`, `staff.containerShadow`, `staff.verticalCenter`
  - `staff.clef` (fallback)
  - `staff.ledgerLines.above`, `staff.ledgerLines.below`

</details>

<details>
<summary><strong>Quick contract: note objects</strong></summary>

- Input to renderer and export:
  - `pitch`: SPN-like string (e.g., `"C4"`, `"Bb3"`, `"F#5"`)
  - `duration`: VexFlow duration token (`"w"`, `"h"`, `"q"`, `"e"`)
  - `noteColor` (optional): CSS color string
  - `overlay` (optional): small text label above note

</details>

<details>
<summary><strong>Edge cases and behaviors</strong></summary>

- If all notes fall outside ledger limits and enforcement is on, the stave renders without notes and logs a warning.
- Invalid key signatures are caught and logged; rendering continues.
- Empty `noteArray` results in no rendering (component guards early).
- Compound meters (e.g., 6/8, 9/8, 12/8) are handled in spacing logic; layout remains stave-aware.
- `maxMeasuresPerLine` is clamped 1–4 everywhere; default is 2.

</details>

<details>
<summary><strong>Try it (local)</strong></summary>

- Use the VS Code task: "Dev Server (npm run dev)" to run the Vue Alpha SPA.
- The renderer relies on `public/staff-format.json`; ensure the server serves from repo root so `/public/...` is reachable.
- Navigate to `/#/create-scales`.

</details>
