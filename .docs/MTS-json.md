Here is your fully regenerated **`MTS-json.md`** documentation, formatted as a clean, copy-pasteable Markdown file. It reflects all your schema decisions, including structural updates, field additions, validation logic, and export considerations.

---

````markdown
# 🎼 MTS-json.md

**Music Tutor Studio JSON Schema Reference**  
_Audit-safe, modular, and user-extensible_

---

## 📖 Introduction

This schema is designed to support modular, traceable, and instructional music practice units.  
Key design drivers include:

- Globally unique `practiceUnitId` for cross-session traceability
- `lastModified` timestamp for versioning and audit trails
- Optional instructional color mapping via `noteColorDesignation`
- Fallback instrument metadata if user input is incomplete
- Runtime validation of pitch against instrument range
- Structured overlay logic for rendering and tooltips
- Preservation of empty fields during export for integrity
- Support for export formats: JSON, PDF, MusicXML, CSV
- No role-based field restrictions or multilingual enum support
- Future extensibility for enum validation and technique tagging

---

## 📦 Overview

Each `practiceUnit` object consists of three core components:

- `practiceUnitHeader`: shared metadata and instructional context
- One of:
  - `practiceUnitScale`
  - `practiceUnitPassage`
  - `practiceUnitExercise`
- `noteArray`: atomic note objects with optional overlays and color tagging

---

## 🔹 practiceUnitHeader

**Populated during Phase 1–3: Instrument Selection and Header Finalization**  
Combines injected metadata, user input, and system-generated values.  
Includes optional instructional mappings for `noteColorDesignation`.

### Core Metadata

- **practiceName**  
  Type: `string`  
  Source: `user-defined`  
  Destination: UI label, GUID anchor

- **practiceUnitId**  
  Type: `string (GUID)`  
  Source: `system default`  
  Destination: Globally unique identifier

- **lastModified**  
  Type: `string (ISO 8601)`  
  Source: `system default`  
  Destination: Audit-safe timestamp

- **practiceUnitType**  
  Type: `enum`  
  Source: `enums.json`  
  Destination: Conditional schema branching

- **tempo**  
  Type: `integer (BPM)`  
  Source: `user-defined`  
  Destination: Playback engine, UI display

- **keySignature**  
  Type: `string`  
  Source: `user-defined`  
  Destination: Staff rendering, transposition logic

- **timeSignature**  
  Type: `string`  
  Source: `user-defined`  
  Destination: Staff rendering, rhythmic validation

### Instrument Metadata

- **instrument**  
  Type: `object`  
  Source: `user-defined` or fallback from last selection  
  Destination: Clef, transposition, range, mechanism

### Display and Linking

- **staffDisplayOptions**  
  Type: `object`  
  Source: `logic engine`  
  Destination: UI toggles for overlays, accidentals

- **sourceURL**  
  Type: `string (URL)`  
  Source: `external reference`  
  Destination: Citation, external linking

### Instructional Color Mapping (`noteColorDesignation`)

Each field below is optional and user-defined. `"black"` is excluded and always renders as default.

- **noteColorDesignation.red** → Meaning of red notes in this unit
- **noteColorDesignation.blue** → Meaning of blue notes in this unit
- **noteColorDesignation.green** → Meaning of green notes in this unit
- **noteColorDesignation.orange** → Meaning of orange notes in this unit
- **noteColorDesignation.gray** → Meaning of gray notes in this unit
- **noteColorDesignation.purple** → Meaning of purple notes in this unit

---

## 🔹 practiceUnitScale

**Populated during Phase 2: Scale Configuration**  
User selects scale parameters; system validates and prepares for note generation.

- **scaleType**  
  Type: `enum`  
  Source: `enums.json`  
  Destination: Note generator, UI label

- **scaleRange**  
  Type: `object`  
  Source: `user-defined`  
  Destination: Starting octave, number of octaves

- **direction**  
  Type: `enum`  
  Source: `enums.json`  
  Destination: Note generator, arrow icon (UI)

---

## 🔹 practiceUnitPassage

**Populated during Phase 4A: Passage-Specific Configuration**  
User enters metadata and selects excerpt range after MusicXML import.

- **composer**  
  Type: `string`  
  Source: `user-defined`  
  Destination: UI display, metadata

- **sourceWork**  
  Type: `string`  
  Source: `user-defined`  
  Destination: UI display, citation

- **passageRange**  
  Type: `object`  
  Source: `user-defined`  
  Destination: `startMeasure`, `endMeasure`

- **instrument**  
  Type: `string`  
  Source: `user-defined`  
  Destination: Text override for instrument label

---

## 🔹 practiceUnitExercise

**Populated during Phase 4B: Exercise-Specific Configuration**  
User defines technique focus and repetition logic after MusicXML import.

- **exerciseType**  
  Type: `enum`  
  Source: `enums.json`  
  Destination: UI filter, logic branching

- **techniqueFocus**  
  Type: `array[string]`  
  Source: `user-defined`  
  Destination: UI tags, instructional overlay  
  _Note: Tag vocabulary to be qualified later._

- **tagSource**  
  Type: `string`  
  Source: `user-defined`  
  Destination: `"user"` or `"system"` to distinguish origin

- **repetitionCount**  
  Type: `integer`  
  Source: `user-defined`  
  Destination: Playback loop logic

- **instrument**  
  Type: `string`  
  Source: `user-defined`  
  Destination: Text override for instrument label

---

## 🔹 noteArray (Atomic Note Object)

**Populated during Phase 4: Note Generation or MusicXML Import**  
System generates or parses notes, then user optionally edits formatting.

- **noteColor**  
  Type: `enum`  
  Source: `user-defined`  
  Destination: Visual highlight (UI)

- **pitch**  
  Type: `string (SPN)`  
  Source: `user-defined`  
  Destination: Staff rendering, overlay engine

- **duration**  
  Type: `enum`  
  Source: `enums.json`  
  Destination: Rhythmic spacing, playback engine

- **overlay**  
  Type: `string`  
  Source: `logic engine`  
  Destination: Compact token for rendering/tooltip

- **overlayObject**  
  Type: `object`  
  Source: `logic engine`  
  Destination: Structured overlay for UI clarity

- **rangeStatus**  
  Type: `string`  
  Values: `"above"`, `"below"`, `"within"`  
  Destination: Runtime validation against instrument range

- **noteColorLegendVisible**  
  Type: `boolean`  
  Source: `user-defined`  
  Destination: UI toggle for legend display

---

## 🎨 noteColorDesignation (Fixed Enum)

```json
"noteColorDesignation": {
  "red": "Too high — transpose down",
  "blue": "Alternate fingering",
  "green": "Correct note",
  "orange": "Articulation target",
  "gray": "Ghosted note",
  "purple": "Dynamic swell"
}
```
````

- `"black"` is excluded and always renders as default
- All other keys are optional and user-defined
- Stored inside `practiceUnitHeader`

---

## 🧾 Enum Reference

### practiceUnitType

- `"Scale"` → Triggers `practiceUnitScale`
- `"Passage"` → Triggers `practiceUnitPassage`
- `"Exercise"` → Triggers `practiceUnitExercise`

### scaleType

- `"Major"` → Standard major scale
- `"Minor"` → Natural/harmonic/melodic minor
- `"Chromatic"` → Full semitone scale

### direction

- `"ascending"` → Low to high
- `"descending"` → High to low

### duration

- `"e"` → Eighth note
- `"q"` → Quarter note
- `"h"` → Half note
- `"w"` → Whole note

### noteColor

- `"black"` → Default (not remapped)
- `"red"` → Optional instructional tag
- `"blue"` → Optional instructional tag
- `"green"` → Optional instructional tag
- `"orange"` → Optional instructional tag
- `"gray"` → Optional instructional tag
- `"purple"` → Optional instructional tag

---

## 📤 Export Considerations

- Supported formats: `JSON`, `PDF`, `MusicXML`, `CSV`
- Empty fields are preserved as blank and handled at read-time
- `noteColorDesignation` and `noteColorLegendVisible` included in all exports

---

Would you like this scaffolded into a JSON Schema or split into modular Markdown sections for your documentation site? I can also generate a validator or UI mockup based on this structure. Let me know when you're ready to revisit `techniqueFocus` vocabulary.
