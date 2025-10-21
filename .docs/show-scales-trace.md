# Trace Tree: JS Called from show-scales.html

This document lists all JavaScript files loaded by `show-scales.html` and traces their main functions and global exports.

## JS Files Loaded (in order)

1. **External Libraries**

   - `https://cdn.jsdelivr.net/npm/vexflow@3.0.9/releases/vexflow-debug.js` (VexFlow)
   - `https://cdn.tailwindcss.com` (Tailwind CSS)

2. **Local Scripts**
   - `scripts/cookies.js`
   - `scripts/pitchUtils.js`
   - `scripts/pitchConverter.js`
   - `scripts/cmtConverter.js`
   - `scripts/show-scales.js`
   - `scripts/render-scale.js`
   - `scripts/load-header.js`
   - `scripts/load-footer.js`

---

## Trace Tree

```text
show-scales.html
├── scripts/cookies.js
│   ├── setCookie(name, value, days)
│   └── getCookie(name)
├── scripts/pitchUtils.js
│   ├── normalizeNoteName(note)
│   ├── convertToSharps(noteName)
│   ├── convertToFlats(noteName)
│   ├── toDisplayFormat(note)
│   ├── fromDisplayFormat(note)
│   ├── applyAccidentalFamily(...)
│   ├── buildScale(...)
│   ├── spnToMidi(spn)
│   ├── midiToSpn(midi)
│   ├── noteToMidi(note, octave)
│   ├── [global] window.noteMap, window.majorSteps, window.minorSteps, window.chromatic
├── scripts/pitchConverter.js
│   ├── midiToSpn(midi)
│   └── [global] window.midiToSpn
├── scripts/cmtConverter.js
│   ├── convertPassageToCMT(passageData, options)
│   ├── getUniquePitches(passageData)
│   ├── formatPassageHeader(passageData)
│   └── [global] window.convertPassageToCMT, window.getUniquePitches, window.formatPassageHeader
├── scripts/show-scales.js
│   ├── collectWorkspaceSnapshot()
│   ├── applyWorkspaceSnapshot(snapshot)
│   ├── testDependencies()
│   ├── toggleDiagnosticMode(enabled)
│   ├── diagnosticLog(...)
│   ├── getAccidentalDisplayValue(...)
│   ├── setAccidentalDisplayCheckboxes(...)
│   ├── initializeStartingOctaveControls(entry)
│   ├── updateOctaveLabel()
│   ├── getUsableOctaveRange(entry, rootNote, octaveCount)
│   ├── generateScaleNotesForDisplay(...)
│   ├── updateScaleNotesDisplay()
│   ├── updatePassageTextualDisplay()
│   ├── updateTextualNoteLabel()
│   ├── updateDynamicTitle()
│   ├── renderCurrentScale()
│   ├── applySavedPreferences()
│   ├── renderPracticePassage(...)
│   ├── calculatePassageLayout(...)
│   ├── renderPassageStave(...)
│   ├── addPassageDisplayOverlays(...)
│   ├── attachOverlayTooltips()
│   ├── convertVexFlowKeyToSPN(...)
│   ├── renderStaveNotesFixed(...)
│   ├── drawPassageBarLines(...)
│   ├── addStaveSignatures(...)
│   ├── createNotesForStave(...)
│   ├── renderStaveNotes(...)
│   ├── convertToVexNote(...)
│   ├── convertDurationToVex(...)
│   ├── convertPitchToVex(...)
│   └── [global] window.generateScaleNotesForDisplay
├── scripts/render-scale.js
│   ├── getKeySignature(rootNote, scaleType)
│   ├── loadNoteColors()
│   ├── renderScale(...)
│   ├── getInstrumentOffset(...)
│   ├── transposeFullNote(...)
│   └── [global] window.generateScaleNotesForDisplay (used)
├── scripts/load-header.js
│   ├── updateTimestamp()
│   └── fetchVersion()
├── scripts/load-footer.js
    └── [no major functions found]
```

---

## Notes

- All scripts are loaded in the order shown above.
- Most cross-script calls use global `window` exports (e.g., `window.generateScaleNotesForDisplay`).
- VexFlow is used for music notation rendering; Tailwind for styling.
- No ES6 `import`/`export` statements; all scripts use global functions and variables.
