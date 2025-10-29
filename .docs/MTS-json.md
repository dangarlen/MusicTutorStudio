## 🧪 Example: practiceUnitExercise

# 🎼 Music Tutor Studio JSON Schema

---

## 📁 Top-Level Structure

Each Practice Unit is a JSON object with two main sections:

- `practiceUnitHeader`: Metadata and configuration
- `noteArray`: Array of atomic note objects

```
---
┌─────────────────────────────────────────┐
│     practiceUnitScale                   │
├────────────┬────────────────────────────┤
│ Field      │ Value Type                 │
├────────────┼────────────────────────────┤
│ practiceName         │ string           │
│ practiceUnitType     │ "Scale"          │
│ keySignature         │ string           │
│ scaleType            │ "Major"/"Minor"  │
│ scaleRange           │ object           │
│ duration             │ "e"/"q"/"h"/"w"  │
│ direction            │ "▲"/"▼"          │
│ staffDisplayOptions  │ object           │
│ accidentalFamily     │ object           │
│ showOverlaysAsTooltipOnly │ boolean     │
│ tempo                │ integer          │
│ instrument           │ string           │
│ timeSignature        │ string           │
│ sourceURL            │ string           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    practiceUnitPassage                  │
├────────────┬────────────────────────────┤
│ Field      │ Value Type                 │
├────────────┼────────────────────────────┤
│ practiceName         │ string           │
│ practiceUnitType     │ "Passage"        │
│ keySignature         │ string           │
│ composer             │ string           │
│ timeSignature        │ string           │
│ staffDisplayOptions  │ object           │
│ accidentalFamily     │ object           │
│ showOverlaysAsTooltipOnly │ boolean     │
│ tempo                │ integer          │
│ instrument           │ string           │
│ sourceURL            │ string           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    practiceUnitExercise                 │
├────────────┬────────────────────────────┤
│ Field      │ Value Type                 │
├────────────┼────────────────────────────┤
│ practiceName         │ string           │
│ practiceUnitType     │ "Exercise"       │
│ keySignature         │ string           │
│ composer             │ string           │
│ timeSignature        │ string           │
│ staffDisplayOptions  │ object           │
│ accidentalFamily     │ object           │
│ showOverlaysAsTooltipOnly │ boolean     │
│ tempo                │ integer          │
│ instrument           │ string           │
│ sourceURL            │ string           │
└─────────────────────────────────────────┘

```

## 🔹 practiceUnitHeader

### Shared Fields (All Unit Types)

| Field                       | Type                                     | Description                                                         |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `practiceName`              | `string`                                 | Unique identifier for the unit                                      |
| `practiceUnitType`          | `"Scale"` \| `"Passage"` \| `"Exercise"` | Defines the unit category                                           |
| `sourceURL`                 | `string`                                 | Points to an original site or source that defined the practice unit |
| `keySignature`              | `string`                                 | Musical key (e.g., `"C Major"`, `"Bb Minor"`)                       |
| `staffDisplayOptions`       | `object`                                 | Toggles for visual elements                                         |
| `accidentalFamily`          | `object`                                 | Logic for accidental rendering                                      |
| `showOverlaysAsTooltipOnly` | `boolean`                                | If true, overlays appear only as tooltips                           |
| `tempo`                     | `integer`                                | Beats per minute                                                    |
| `instrument`                | `string`                                 | Target instrument                                                   |
| `timeSignature`             | `string`                                 | Time signature (e.g., `"4/4"`, `"6/8"`)                             |

### Scale-Specific Fields

| Field        | Type                                    | Description                           |
| ------------ | --------------------------------------- | ------------------------------------- |
| `scaleType`  | `"Major"` \| `"Minor"` \| `"Chromatic"` | Type of scale                         |
| `scaleRange` | `object`                                | Starting octave and number of octaves |
| `duration`   | `"e"` \| `"q"` \| `"h"` \| `"w"`        | Note duration                         |
| `direction`  | `"▲"` \| `"▼"`                          | Ascending or descending               |

### Passage-Specific Fields

| Field      | Type     | Description          |
| ---------- | -------- | -------------------- |
| `composer` | `string` | Composer or arranger |

---

## 🔹 noteArray

Each Practice Unit contains a `noteArray` of atomic note objects.

### Note Object Fields

| Field       | Type                                                        | Description                           |
| ----------- | ----------------------------------------------------------- | ------------------------------------- |
| `noteColor` | `"red"` \| `"black"` \| `"blue"` \| `"orange"` \| `"green"` | Visual highlight                      |
| `pitch`     | `string`                                                    | SPN format (e.g., `"C#4"`, `"Bb3"`)   |
| `duration`  | `"e"` \| `"q"` \| `"h"` \| `"w"`                            | Rhythmic value                        |
| `overlay`   | `string`                                                    | Compact Music Token (e.g., `"C#4:q"`) |

---

## 🧪 Example: practiceUnitScale

```json
{
  "practiceUnitHeader": {
    "practiceUnitType": "Scale",
    "practiceName": "C Major Scale for TC Euphonium",
    "keySignature": "C Major",
    "scaleType": "Major",
    "scaleRange": {
      "startingOctave": 3,
      "numberOfOctaves": 2
    },
    "duration": "q",
    "direction": "▲",
    "staffDisplayOptions": {
      "keySignature": true,
      "accidentals": true,
      "barLines": true,
      "timeSignature": true
    },
    "accidentalFamily": {
      "mode": "Auto: Based on Key",
      "override": false
    },
    "showOverlaysAsTooltipOnly": false,
    "tempo": 80,
    "instrument": "Trumpet",
    "timeSignature": "4/4",
    "sourceURL": "https://example.com/arban-scale"
  },
  "noteArray": [
    {
      "noteColor": "red",
      "pitch": "C4",
      "duration": "q",
      "overlay": "C4:q"
    },
    {
      "noteColor": "blue",
      "pitch": "D4",
      "duration": "q",
      "overlay": "D4:q"
    }
  ]
}
```

## 🧪 Example: practiceUnitPassage

```json
{
  "practiceUnitHeader": {
    "practiceUnitType": "Passage",
    "practiceName": "Danny Boy in C Major for TC Euphonium",
    "keySignature": "C Major",
    "staffDisplayOptions": {
      "keySignature": true,
      "accidentals": true,
      "barLines": true,
      "timeSignature": true
    },
    "accidentalFamily": {
      "mode": "Auto: Based on Key",
      "override": false
    },
    "showOverlaysAsTooltipOnly": false,
    "composer": "Traditional / Arr. Roger Miller",
    "timeSignature": "4/4",
    "tempo": 80,
    "instrument": "Trumpet",
    "sourceURL": "https://example.com/danny-boy"
  },
  "noteArray": [
    {
      "noteColor": "orange",
      "pitch": "E4",
      "duration": "q",
      "overlay": "E4:q"
    },
    {
      "noteColor": "green",
      "pitch": "G4",
      "duration": "q",
      "overlay": "G4:q"
    }
  ]
}
```
