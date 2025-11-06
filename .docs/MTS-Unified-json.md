# 🎼 MTS-Unified-json.md

**Music Tutor Studio Unified JSON Schema**  
_Simplified, generalized, and audit-safe_

---

## 📖 Introduction

This is the **unified schema** for Music Tutor Studio practice units. All three unit types—**Scales**, **Passages**, and **Exercises**—now share a single, flat `practiceUnitHeader` structure. Type-specific fields are either generalized or left blank (N/A) when not applicable.

### Design Goals

- **Single header structure**: No more separate `practiceUnitScale`, `practiceUnitPassage`, or `practiceUnitExercise` objects
- **Simplified persistence**: `practiceUnit` = `practiceUnitHeader` + `noteArray`
- **Backward compatibility**: Migration path from legacy 3-section schema
- **Type flexibility**: `practiceUnitType` determines which fields are required vs optional
- **Audit-safe**: Retains `practiceUnitId`, `lastModified`, and traceability

---

## 🔄 Migration Map: Legacy → Unified

This table shows how fields from the old three-section schema map to the new unified header.

| **Legacy Location**      | **Legacy Field**             | **Unified Header Field** | **Notes**                                     |
| ------------------------ | ---------------------------- | ------------------------ | --------------------------------------------- |
| `practiceUnitHeader`     | `practiceName`               | `practiceName`           | No change                                     |
| `practiceUnitHeader`     | `practiceUnitId`             | `practiceUnitId`         | No change                                     |
| `practiceUnitHeader`     | `lastModified`               | `lastModified`           | No change                                     |
| `practiceUnitHeader`     | `practiceUnitType`           | `practiceUnitType`       | No change                                     |
| `practiceUnitHeader`     | `tempo`                      | `tempo`                  | No change                                     |
| `practiceUnitHeader`     | `keySignature`               | `keySignature`           | No change                                     |
| `practiceUnitHeader`     | `timeSignature`              | `timeSignature`          | No change                                     |
| `practiceUnitHeader`     | `instrument`                 | `instrument`             | No change (object)                            |
| `practiceUnitHeader`     | `staffDisplayOptions`        | `staffDisplayOptions`    | No change                                     |
| `practiceUnitHeader`     | `sourceURL`                  | `sourceURL`              | No change                                     |
| `practiceUnitHeader`     | `noteColorDesignation`       | `noteColorDesignation`   | No change                                     |
| **practiceUnitScale**    | `scaleType`                  | `contentType`            | Generalized: "Major", "Minor", "Chromatic"    |
| **practiceUnitScale**    | `scaleRange.startingOctave`  | `startingOctave`         | Flattened                                     |
| **practiceUnitScale**    | `scaleRange.numberOfOctaves` | `numberOfOctaves`        | Flattened                                     |
| **practiceUnitScale**    | `direction`                  | `direction`              | No change: "ascending" \| "descending"        |
| **practiceUnitPassage**  | `composer`                   | `composer`               | N/A for Scale/Exercise                        |
| **practiceUnitPassage**  | `sourceWork`                 | `sourceWork`             | N/A for Scale/Exercise                        |
| **practiceUnitPassage**  | `passageRange.startMeasure`  | `rangeStart`             | Generalized; N/A for Scale                    |
| **practiceUnitPassage**  | `passageRange.endMeasure`    | `rangeEnd`               | Generalized; N/A for Scale                    |
| **practiceUnitPassage**  | `instrument`                 | `instrumentOverride`     | Optional text override                        |
| **practiceUnitPassage**  | `sourceMusicXML`             | `sourceMusicXML`         | N/A for Scale                                 |
| **practiceUnitExercise** | `exerciseType`               | `contentType`            | Generalized: "Articulation", "Dynamics", etc. |
| **practiceUnitExercise** | `techniqueFocus`             | `techniqueFocus`         | Array; N/A for Scale/Passage                  |
| **practiceUnitExercise** | `tagSource`                  | `tagSource`              | "user" \| "system"; N/A for Scale/Passage     |
| **practiceUnitExercise** | `repetitionCount`            | `repetitionCount`        | N/A for Scale/Passage                         |
| **practiceUnitExercise** | `instrument`                 | `instrumentOverride`     | Optional text override                        |
| **practiceUnitExercise** | `sourceMusicXML`             | `sourceMusicXML`         | N/A for Scale                                 |

### Key Unification Decisions

1. **`contentType`**: Replaces both `scaleType` and `exerciseType`. Values depend on `practiceUnitType`:

   - If `practiceUnitType === "Scale"`: "Major" | "Minor" | "Chromatic"
   - If `practiceUnitType === "Exercise"`: "Articulation" | "Dynamics" | "Tone" | "Rhythm" | "Fingering"
   - If `practiceUnitType === "Passage"`: typically empty or N/A

2. **`direction`**: Used only for Scales; N/A for Passage/Exercise.

3. **`rangeStart` / `rangeEnd`**: Generalized from `passageRange`. For Passages, these are measure numbers. N/A for Scales/Exercises.

4. **`startingOctave` / `numberOfOctaves`**: Used only for Scales; N/A for Passage/Exercise.

5. **`composer` / `sourceWork`**: Used only for Passages; N/A for Scale/Exercise.

6. **`techniqueFocus` / `tagSource` / `repetitionCount`**: Used only for Exercises; N/A for Scale/Passage.

7. **`sourceMusicXML`**: Used for Passages and Exercises imported from MusicXML; N/A for Scales.

8. **`instrumentOverride`**: Optional text override; consolidates old `instrument` field from subtype objects.

---

## 📦 Unified Schema Structure

```json
{
  "practiceUnitHeader": {
    // Core metadata (all types)
    "practiceName": "string",
    "practiceUnitId": "string (GUID)",
    "lastModified": "string (ISO 8601)",
    "practiceUnitType": "Scale | Passage | Exercise",
    "tempo": "integer (BPM)",
    "keySignature": "string",
    "timeSignature": "string",
    "instrument": {
      /* object */
    },
    "staffDisplayOptions": {
      /* object */
    },
    "sourceURL": "string (URL)",
    "noteColorDesignation": {
      /* object */
    },

    // Content classification (context-dependent)
    "contentType": "string", // Scale: Major/Minor/Chromatic; Exercise: Articulation/Dynamics/etc; Passage: N/A
    "direction": "string", // Scale: ascending/descending; Passage/Exercise: N/A

    // Range fields (context-dependent)
    "startingOctave": "string", // Scale only; e.g., "C3"
    "numberOfOctaves": "integer", // Scale only
    "rangeStart": "integer", // Passage: startMeasure; Exercise/Scale: N/A
    "rangeEnd": "integer", // Passage: endMeasure; Exercise/Scale: N/A

    // Attribution fields (Passage only)
    "composer": "string",
    "sourceWork": "string",

    // Exercise-specific fields
    "techniqueFocus": ["string"], // Exercise only; array of tags
    "tagSource": "string", // Exercise only; "user" | "system"
    "repetitionCount": "integer", // Exercise only

    // Import metadata
    "sourceMusicXML": "string", // Passage/Exercise: filename; Scale: N/A
    "instrumentOverride": "string" // Optional text override for instrument label
  },
  "noteArray": [
    {
      "pitch": "string (SPN)",
      "duration": "string (enum + dot)",
      "noteColor": "string (enum)",
      "overlay": "string",
      "overlayObject": {
        /* object */
      },
      "rangeStatus": "string",
      "noteVisible": "boolean"
    }
  ]
}
```

---

## 🔹 practiceUnitHeader (Unified)

### Core Metadata (All Types)

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
  Type: `enum: "Scale" | "Passage" | "Exercise"`  
  Source: `user-defined`  
  Destination: Determines which optional fields are used

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

- **instrument**  
  Type: `object`  
  Source: `user-defined` or fallback from last selection  
  Fields: `instrument`, `clef`, `transposition`, `mechanism`, `standardRange`, `defaultStartingOctave`, `fingering`

- **staffDisplayOptions**  
  Type: `object`  
  Source: `logic engine`  
  Fields: `showAccidentals`, `showOverlays`, `measuresPerLineMax`

- **sourceURL**  
  Type: `string (URL)`  
  Source: `external reference`  
  Destination: Citation, external linking

- **noteColorDesignation**  
  Type: `object`  
  Source: `user-defined`  
  Keys: `red`, `blue`, `green`, `orange`, `gray`, `purple` (each optional)

---

### Content Classification (Context-Dependent)

- **contentType**  
  Type: `string`  
  Source: `user-defined`  
  Values:

  - For `practiceUnitType === "Scale"`: `"Major"` | `"Minor"` | `"Chromatic"`
  - For `practiceUnitType === "Exercise"`: `"Articulation"` | `"Dynamics"` | `"Tone"` | `"Rhythm"` | `"Fingering"`
  - For `practiceUnitType === "Passage"`: typically `""` or N/A

- **direction**  
  Type: `string: "ascending" | "descending"`  
  Source: `user-defined`  
  Used: Scale only; N/A for Passage/Exercise

---

### Range Fields (Context-Dependent)

- **startingOctave**  
  Type: `string (SPN)`  
  Source: `user-defined`  
  Used: Scale only (e.g., `"C3"`); N/A for Passage/Exercise

- **numberOfOctaves**  
  Type: `integer`  
  Source: `user-defined`  
  Used: Scale only; N/A for Passage/Exercise

- **rangeStart**  
  Type: `integer`  
  Source: `user-defined`  
  Used: Passage only (measure number); N/A for Scale/Exercise

- **rangeEnd**  
  Type: `integer`  
  Source: `user-defined`  
  Used: Passage only (measure number); N/A for Scale/Exercise

---

### Attribution Fields (Passage Only)

- **composer**  
  Type: `string`  
  Source: `user-defined`  
  Used: Passage only; N/A for Scale/Exercise

- **sourceWork**  
  Type: `string`  
  Source: `user-defined`  
  Used: Passage only; N/A for Scale/Exercise

---

### Exercise-Specific Fields

- **techniqueFocus**  
  Type: `array[string]`  
  Source: `user-defined`  
  Used: Exercise only; N/A for Scale/Passage

- **tagSource**  
  Type: `string: "user" | "system"`  
  Source: `user-defined`  
  Used: Exercise only; N/A for Scale/Passage

- **repetitionCount**  
  Type: `integer`  
  Source: `user-defined`  
  Used: Exercise only; N/A for Scale/Passage

---

### Import Metadata

- **sourceMusicXML**  
  Type: `string`  
  Source: `system-captured`  
  Used: Passage/Exercise (filename of imported MusicXML); N/A for Scale

- **instrumentOverride**  
  Type: `string`  
  Source: `user-defined`  
  Used: Optional text override for instrument label (formerly separate in Passage/Exercise subtypes)

---

## 🔹 noteArray (Atomic Note Object)

No changes from legacy schema.

- **noteColor**  
  Type: `enum: "black" | "red" | "blue" | "green" | "orange" | "gray" | "purple"`  
  Source: `user-defined`

- **pitch**  
  Type: `string (SPN)`  
  Source: `user-defined`

- **duration**  
  Type: `string (enum + optional dot)`  
  Values: `"s"` | `"e"` | `"q"` | `"h"` | `"w"` (append `"."` for dotted)

- **overlay**  
  Type: `string`  
  Source: `logic engine`

- **overlayObject**  
  Type: `object`  
  Source: `logic engine`

- **rangeStatus**  
  Type: `string: "above" | "below" | "within"`  
  Source: `runtime validation`

- **noteVisible**  
  Type: `boolean`  
  Source: `user-defined`

---

## 📚 Examples

### Example 1: Scale (Unified)

```json
{
  "practiceUnitHeader": {
    "practiceName": "Euphonium Bb Major 2 Octaves",
    "practiceUnitId": "a1b2c3d4-e5f6-7890-gh12-ijkl34567890",
    "lastModified": "2025-11-06T10:30:00Z",
    "practiceUnitType": "Scale",
    "tempo": 80,
    "keySignature": "Bb Major",
    "timeSignature": "4/4",
    "instrument": {
      "instrument": "Euphonium, Treble Clef",
      "clef": "treble",
      "transposition": "Bb",
      "mechanism": "valve",
      "standardRange": { "start": "E2", "end": "Bb5" },
      "defaultStartingOctave": "Bb3",
      "fingering": {}
    },
    "staffDisplayOptions": {
      "showAccidentals": true,
      "showOverlays": true,
      "measuresPerLineMax": 4
    },
    "sourceURL": "",
    "noteColorDesignation": {
      "green": "Correct fingering",
      "red": "Out of range"
    },
    "contentType": "Major",
    "direction": "ascending",
    "startingOctave": "Bb3",
    "numberOfOctaves": 2,
    "rangeStart": null,
    "rangeEnd": null,
    "composer": "",
    "sourceWork": "",
    "techniqueFocus": [],
    "tagSource": "",
    "repetitionCount": null,
    "sourceMusicXML": "",
    "instrumentOverride": ""
  },
  "noteArray": [
    {
      "pitch": "Bb3",
      "duration": "q",
      "noteColor": "green",
      "overlay": "1-2-3",
      "overlayObject": { "fingering": "1-2-3" },
      "rangeStatus": "within",
      "noteVisible": true
    },
    {
      "pitch": "C4",
      "duration": "q",
      "noteColor": "green",
      "overlay": "2-3",
      "overlayObject": { "fingering": "2-3" },
      "rangeStatus": "within",
      "noteVisible": true
    }
  ]
}
```

---

### Example 2: Passage (Unified)

```json
{
  "practiceUnitHeader": {
    "practiceName": "Bach Cello Suite Excerpt",
    "practiceUnitId": "z9y8x7w6-v5u4-3210-ts98-rqpo98765432",
    "lastModified": "2025-11-06T10:35:00Z",
    "practiceUnitType": "Passage",
    "tempo": 72,
    "keySignature": "D Minor",
    "timeSignature": "3/4",
    "instrument": {
      "instrument": "Cello",
      "clef": "bass",
      "transposition": "C",
      "mechanism": "none",
      "standardRange": { "start": "C2", "end": "C6" },
      "defaultStartingOctave": "C2",
      "fingering": {}
    },
    "staffDisplayOptions": {
      "showAccidentals": true,
      "showOverlays": false,
      "measuresPerLineMax": 4
    },
    "sourceURL": "https://imslp.org/wiki/Cello_Suite_No.1_(Bach)",
    "noteColorDesignation": {
      "orange": "Phrase start"
    },
    "contentType": "",
    "direction": "",
    "startingOctave": "",
    "numberOfOctaves": null,
    "rangeStart": 1,
    "rangeEnd": 4,
    "composer": "J.S. Bach",
    "sourceWork": "Cello Suite No. 1",
    "techniqueFocus": [],
    "tagSource": "",
    "repetitionCount": null,
    "sourceMusicXML": "bach-cello-suite-1.musicxml",
    "instrumentOverride": ""
  },
  "noteArray": [
    {
      "pitch": "D3",
      "duration": "q",
      "noteColor": "orange",
      "overlay": "",
      "overlayObject": {},
      "rangeStatus": "within",
      "noteVisible": true
    },
    {
      "pitch": "E3",
      "duration": "q",
      "noteColor": "black",
      "overlay": "",
      "overlayObject": {},
      "rangeStatus": "within",
      "noteVisible": true
    }
  ]
}
```

---

### Example 3: Exercise (Unified)

```json
{
  "practiceUnitHeader": {
    "practiceName": "Articulation Drill C Major",
    "practiceUnitId": "m9n8o7p6-q5r4-3210-st21-uvwx98765432",
    "lastModified": "2025-11-06T10:40:00Z",
    "practiceUnitType": "Exercise",
    "tempo": 120,
    "keySignature": "C Major",
    "timeSignature": "4/4",
    "instrument": {
      "instrument": "Trumpet in Bb",
      "clef": "treble",
      "transposition": "Bb",
      "mechanism": "valve",
      "standardRange": { "start": "F#3", "end": "C6" },
      "defaultStartingOctave": "C4",
      "fingering": {}
    },
    "staffDisplayOptions": {
      "showAccidentals": true,
      "showOverlays": true,
      "measuresPerLineMax": 4
    },
    "sourceURL": "",
    "noteColorDesignation": {
      "blue": "Staccato",
      "green": "Legato"
    },
    "contentType": "Articulation",
    "direction": "",
    "startingOctave": "",
    "numberOfOctaves": null,
    "rangeStart": null,
    "rangeEnd": null,
    "composer": "",
    "sourceWork": "",
    "techniqueFocus": ["staccato", "legato"],
    "tagSource": "user",
    "repetitionCount": 5,
    "sourceMusicXML": "articulation-drill.musicxml",
    "instrumentOverride": ""
  },
  "noteArray": [
    {
      "pitch": "C4",
      "duration": "e",
      "noteColor": "blue",
      "overlay": "0",
      "overlayObject": { "fingering": "0" },
      "rangeStatus": "within",
      "noteVisible": true
    },
    {
      "pitch": "D4",
      "duration": "e",
      "noteColor": "green",
      "overlay": "1-3",
      "overlayObject": { "fingering": "1-3" },
      "rangeStatus": "within",
      "noteVisible": true
    }
  ]
}
```

---

## 🔧 Migration Strategy

### Step 1: Legacy Detection

Check if incoming JSON has `practiceUnitScale`, `practiceUnitPassage`, or `practiceUnitExercise` keys. If present, trigger conversion.

### Step 2: Conversion Logic (Pseudocode)

```javascript
function convertLegacyToUnified(legacyUnit) {
  const type = legacyUnit.practiceUnitHeader.practiceUnitType;
  const header = { ...legacyUnit.practiceUnitHeader };

  // Initialize all new fields with safe defaults
  header.contentType = "";
  header.direction = "";
  header.startingOctave = "";
  header.numberOfOctaves = null;
  header.rangeStart = null;
  header.rangeEnd = null;
  header.composer = "";
  header.sourceWork = "";
  header.techniqueFocus = [];
  header.tagSource = "";
  header.repetitionCount = null;
  header.sourceMusicXML = "";
  header.instrumentOverride = "";

  // Map type-specific fields
  if (type === "Scale" && legacyUnit.practiceUnitScale) {
    const s = legacyUnit.practiceUnitScale;
    header.contentType = s.scaleType || "";
    header.direction = s.direction || "";
    header.startingOctave = s.scaleRange?.startingOctave || "";
    header.numberOfOctaves = s.scaleRange?.numberOfOctaves ?? null;
  }

  if (type === "Passage" && legacyUnit.practiceUnitPassage) {
    const p = legacyUnit.practiceUnitPassage;
    header.composer = p.composer || "";
    header.sourceWork = p.sourceWork || "";
    header.rangeStart = p.passageRange?.startMeasure ?? null;
    header.rangeEnd = p.passageRange?.endMeasure ?? null;
    header.sourceMusicXML = p.sourceMusicXML || "";
    header.instrumentOverride = p.instrument || "";
  }

  if (type === "Exercise" && legacyUnit.practiceUnitExercise) {
    const e = legacyUnit.practiceUnitExercise;
    header.contentType = e.exerciseType || "";
    header.techniqueFocus = e.techniqueFocus || [];
    header.tagSource = e.tagSource || "";
    header.repetitionCount = e.repetitionCount ?? null;
    header.sourceMusicXML = e.sourceMusicXML || "";
    header.instrumentOverride = e.instrument || "";
  }

  return {
    practiceUnitHeader: header,
    noteArray: legacyUnit.noteArray || [],
  };
}
```

### Step 3: Update Stores and Components

- Pinia store: remove separate scale/passage/exercise state; use unified header
- CreateScaleView.vue: populate unified header fields directly
- CreateExercise.vue: populate unified header fields directly
- Save/Recall: serialize/deserialize unified format
- StaffPreview: read from unified header fields

### Step 4: Validation Rules

- Runtime checks based on `practiceUnitType`:
  - Scale: require `contentType`, `direction`, `startingOctave`, `numberOfOctaves`
  - Passage: require `composer`, `sourceWork`, `rangeStart`, `rangeEnd`
  - Exercise: require `contentType`, `repetitionCount`

### Step 5: Documentation

- Archive `MTS-json.md` as `MTS-json-LEGACY.md`
- Update all references to point to `MTS-Unified-json.md`
- Add deprecation notices in legacy export/import utilities

---

## 📤 Export Considerations

- Supported formats: `JSON`, `PDF`, `MusicXML`, `CSV`
- Unified header simplifies serialization (single object, no nested subtype)
- Empty/N/A fields are preserved as `null` or `""` for clarity
- `noteColorDesignation` and `noteVisible` remain unchanged

---

## 🎯 Validation & Edge Cases

### Validation by Type

**Scale**  
Required: `contentType`, `direction`, `startingOctave`, `numberOfOctaves`  
N/A: `rangeStart`, `rangeEnd`, `composer`, `sourceWork`, `techniqueFocus`, `tagSource`, `repetitionCount`, `sourceMusicXML`

**Passage**  
Required: `composer`, `sourceWork`, `rangeStart`, `rangeEnd`  
Optional: `sourceMusicXML`, `instrumentOverride`  
N/A: `contentType`, `direction`, `startingOctave`, `numberOfOctaves`, `techniqueFocus`, `tagSource`, `repetitionCount`

**Exercise**  
Required: `contentType`, `repetitionCount`  
Optional: `techniqueFocus`, `tagSource`, `sourceMusicXML`, `instrumentOverride`  
N/A: `direction`, `startingOctave`, `numberOfOctaves`, `rangeStart`, `rangeEnd`, `composer`, `sourceWork`

### Null vs Empty String

- Use `null` for numeric fields (e.g., `numberOfOctaves`, `rangeStart`)
- Use `""` for string fields (e.g., `composer`, `contentType`)
- Use `[]` for array fields (e.g., `techniqueFocus`)

---

## 🔚 Summary

The unified schema reduces complexity, improves maintainability, and simplifies database persistence. Migration from the legacy three-section format is straightforward via the provided conversion logic. All existing features (color tagging, overlays, validation) remain fully functional.

---

**Next Steps**: See detailed todo list for implementation roadmap.
