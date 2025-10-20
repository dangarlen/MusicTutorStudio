// Convert note to preferred accidental family (flat/sharp)
function convertToAccidentalFamily(note, preferredFamily) {
  // Accept "C#/5" or "Db/5" format
  const m = note.match(/^([A-G][#b]?)(\/\d+)$/i);
  if (!m) return note;
  let noteName = m[1];
  const octave = m[2];
  if (preferredFamily === "flats") {
    const sharpToFlat = {
      "c#": "db",
      "d#": "eb",
      "f#": "gb",
      "g#": "ab",
      "a#": "bb",
    };
    noteName = sharpToFlat[noteName.toLowerCase()] || noteName;
  } else if (preferredFamily === "sharps") {
    const flatToSharp = {
      db: "c#",
      eb: "d#",
      gb: "f#",
      ab: "g#",
      bb: "a#",
    };
    noteName = flatToSharp[noteName.toLowerCase()] || noteName;
  }
  return `${noteName}/${octave.replace("/", "")}`;
}
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
  // Determine preferred accidental family
  let preferredFamily = "sharps";
  const accType = accidentalFamily(accidentals);
  if (accType === "force-flats") {
    preferredFamily = "flats";
  } else if (accType === "force-sharps") {
    preferredFamily = "sharps";
  } else if (accType === "auto-key") {
    // Use key signature logic if available
    // For now, default to sharps
    preferredFamily = "sharps";
  }
  scaleNotes = scaleNotes.map((spn) => {
    let note = convertToAccidentalFamily(spn, preferredFamily);
    note = formatVexflowNote(
      note,
      rootNote,
      note.split("/")[1],
      accidentals,
      accType === "auto-direction"
        ? direction === "descending"
          ? "Descending"
          : "Ascending"
        : direction
    );
    return note;
  });

  function applyAccidentalFamily(noteWithOctave, accidentalType) {
    // Only convert sharps to flats for force-flats
    if (accidentalType === "force-flats") {
      return noteWithOctave
        .replaceAll("c#", "db")
        .replaceAll("d#", "eb")
        .replaceAll("f#", "gb")
        .replaceAll("g#", "ab")
        .replaceAll("a#", "bb");
    }
    // Only convert flats to sharps for force-sharps
    if (accidentalType === "force-sharps") {
      return noteWithOctave
        .replaceAll("db", "c#")
        .replaceAll("eb", "d#")
        .replaceAll("gb", "f#")
        .replaceAll("ab", "g#")
        .replaceAll("bb", "a#");
    }
    return noteWithOctave;
  }

  function formatVexflowNote(spn, rootNote, octave, accidentals, direction) {
    const [note, oct] = spn.split("/");
    let noteWithOctave = note + oct;
    // Use local accidental logic
    noteWithOctave = applyAccidentalFamily(
      noteWithOctave,
      accidentalFamily(accidentals)
    );
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
