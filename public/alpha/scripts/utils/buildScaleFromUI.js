// buildScaleFromUI.js
// Generates a scale based on UI configuration controls
// Arguments: key, scaleType, octaves, direction, noteDuration, accidentals
// All arguments are optional and have defaults

function accidentalFamily(acc) {
  if (
    ["force-sharps", "force-flats", "auto-key", "auto-direction"].includes(acc)
  )
    return acc;
  return "auto-key";
}

export function buildScaleFromUI({
  key = "C",
  scaleType = "major",
  octaves = 1,
  direction = "ascending",
  noteDuration = "quarter",
  accidentals = "auto",
} = {}) {
  // Dynamic scale generation using step patterns
  let scaleNotes = [];
  const stepsMap = {
    major: globalThis.majorSteps || [2, 2, 1, 2, 2, 2, 1],
    minor: globalThis.minorSteps || [2, 1, 2, 2, 1, 2, 2],
    chromatic: new Array(12).fill(1),
  };
  const steps = stepsMap[scaleType] || stepsMap.major;
  const rootNote = globalThis.normalizeNoteName
    ? globalThis.normalizeNoteName(key)
    : key;
  const startOctave = 4;

  // Fallback MIDI/SPN conversion if pitchUtils is not loaded
  function fallbackSpnToMidi(spn) {
    // Accept "C/4" format only
    const noteMap = {
      C: 0,
      "C#": 1,
      D: 2,
      "D#": 3,
      E: 4,
      F: 5,
      "F#": 6,
      G: 7,
      "G#": 8,
      A: 9,
      "A#": 10,
      B: 11,
    };
    const m = spn.match(/^([A-G][#b]?)[/](\d+)$/);
    if (!m) return 60;
    const note = m[1];
    const octave = parseInt(m[2], 10);
    return (noteMap[note] ?? 0) + (octave + 1) * 12;
  }
  function fallbackMidiToSpn(midi) {
    const reverseNoteMap = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${reverseNoteMap[pitchClass]}/${octave}`;
  }

  const spnToMidi = globalThis.spnToMidi || fallbackSpnToMidi;
  const midiToSpn = globalThis.midiToSpn || fallbackMidiToSpn;

  let midi = spnToMidi(`${rootNote}/${startOctave}`);
  // For auto-direction, pass 'Ascending' or 'Descending' as expected by pitchUtils
  const directionForAccidentals =
    accidentals === "auto-direction"
      ? direction === "descending"
        ? "Descending"
        : "Ascending"
      : direction;
  for (let o = 0; o < octaves; o++) {
    let octaveMidi = midi + o * 12;
    let currentMidi = octaveMidi;
    // First note of the scale
    let spn = midiToSpn(currentMidi);
    scaleNotes.push(spn);
    // Remaining notes
    for (const step of steps) {
      currentMidi += step;
      spn = midiToSpn(currentMidi);
      scaleNotes.push(spn);
    }
  }
  // If descending, reverse the scale
  if (direction === "descending") {
    scaleNotes = [...scaleNotes].reverse();
  }
  // Apply accidental family after reversing for auto-direction
  scaleNotes = scaleNotes.map((spn) => {
    let note = formatVexflowNote(
      spn,
      rootNote,
      spn.split("/")[1],
      accidentals,
      accidentals === "auto-direction"
        ? direction === "descending"
          ? "Descending"
          : "Ascending"
        : direction
    );
    // Guarantee no sharps in descending/auto-direction
    if (
      accidentals === "auto-direction" &&
      direction === "descending" &&
      globalThis.convertToFlats
    ) {
      note = note
        .replaceAll("c#/", "db/")
        .replaceAll("d#/", "eb/")
        .replaceAll("f#/", "gb/")
        .replaceAll("g#/", "ab/")
        .replaceAll("a#/", "bb/");
    }
    return note;
  });

  function formatVexflowNote(spn, rootNote, octave, accidentals, direction) {
    const [note, oct] = spn.split("/");
    let noteWithOctave = note + oct;
    if (globalThis.applyAccidentalFamily) {
      noteWithOctave = globalThis.applyAccidentalFamily(
        noteWithOctave,
        accidentalFamily(accidentals),
        rootNote,
        direction
      );
    }
    const regex = /^([A-Ga-g][#b]?)(\d+)$/;
    const match = regex.exec(noteWithOctave);
    if (match) {
      return `${match[1].toLowerCase()}/${match[2]}`;
    }
    return noteWithOctave;
  }
  return {
    args: { key, scaleType, octaves, direction, noteDuration, accidentals },
    scaleNotes,
  };
}
