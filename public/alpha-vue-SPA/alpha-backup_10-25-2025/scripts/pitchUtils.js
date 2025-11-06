// --- Global Pitch Class Map ---
window.noteMap = {};

const majorSteps = [2, 2, 1, 2, 2, 2, 1];
const minorSteps = [2, 1, 2, 2, 1, 2, 2];

// --- Enharmonic Normalization ---
function normalizeNoteName(note) {
  const enharmonics = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
  };
  return enharmonics[note] || note;
}

// --- Accidental Family Conversion ---
function convertToSharps(noteName) {
  const flatsToSharps = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
  };
  return flatsToSharps[noteName] || noteName;
}

function convertToFlats(noteName) {
  const sharpsToFlats = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };
  return sharpsToFlats[noteName] || noteName;
}

// --- Display Format Conversion ---
function toDisplayFormat(note) {
  // Convert ASCII accidentals to Unicode symbols for display
  const asciiToUnicode = {
    "C#": "C♯",
    Db: "D♭",
    "D#": "D♯",
    Eb: "E♭",
    "F#": "F♯",
    Gb: "G♭",
    "G#": "G♯",
    Ab: "A♭",
    "A#": "A♯",
    Bb: "B♭",
  };
  return asciiToUnicode[note] || note;
}

function fromDisplayFormat(note) {
  // Convert Unicode symbols back to ASCII for internal logic
  const unicodeToAscii = {
    "C♯": "C#",
    "D♭": "Db",
    "D♯": "D#",
    "E♭": "Eb",
    "F♯": "F#",
    "G♭": "Gb",
    "G♯": "G#",
    "A♭": "Ab",
    "A♯": "A#",
    "B♭": "Bb",
  };
  return unicodeToAscii[note] || note;
}

function applyAccidentalFamily(
  noteWithOctave,
  accidentalFamily,
  rootNote,
  direction
) {
  // Parse note (e.g., "C#4" -> "C#" and "4")
  const match = noteWithOctave.match(/^([A-Ga-g][#b]?)(\d+)$/);
  if (!match) return noteWithOctave;

  const [, noteName, octave] = match;
  let convertedNote = noteName;

  switch (accidentalFamily) {
    case "force-sharps":
      convertedNote = convertToSharps(noteName);
      break;
    case "force-flats":
      convertedNote = convertToFlats(noteName);
      break;
    case "auto-key": {
      // Use key signature preference (sharps for sharp keys, flats for flat keys)
      // Flat major keys: F, Bb, Eb, Ab, Db, Gb, Cb
      // Since root notes come normalized, also check for their sharp equivalents
      const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
      const flatKeyEquivalents = ["F", "A#", "D#", "G#", "C#", "F#", "B"]; // normalized equivalents

      if (
        flatKeys.includes(rootNote) ||
        flatKeyEquivalents.includes(rootNote) ||
        rootNote.includes("b")
      ) {
        convertedNote = convertToFlats(noteName);
      } else {
        convertedNote = convertToSharps(noteName);
      }
      break;
    }
    case "auto-direction":
      // Use sharps for ascending, flats for descending
      if (direction === "Descending") {
        convertedNote = convertToFlats(noteName);
      } else {
        convertedNote = convertToSharps(noteName);
      }
      break;
    default:
      // "auto-key" is default
      convertedNote = convertToSharps(noteName);
      break;
  }

  return convertedNote + octave;
}

// Simple scale building using MIDI arithmetic
function buildScale(rootNote, startingOctave, steps) {
  const rootNormalized = normalizeNoteName(rootNote);
  const rootSPN = `${rootNormalized}/${startingOctave}`;
  let currentMidi = spnToMidi(rootSPN);

  const scale = [rootNormalized];

  for (let i = 0; i < steps.length; i++) {
    currentMidi += steps[i];
    const noteSpn = midiToSpn(currentMidi);
    const noteName = noteSpn.split("/")[0];
    scale.push(noteName);
  }

  return scale;
}

// --- SPN to MIDI ---
function spnToMidi(spn) {
  if (!window.noteMap || Object.keys(window.noteMap).length === 0) {
    throw new Error("noteMap not loaded");
  }
  // Accept both "C/4" and "C4" formats
  let notePart = null;
  let octave = null;
  if (typeof spn === "string") {
    if (spn.includes("/")) {
      const parts = spn.split("/");
      notePart = parts[0];
      octave = parseInt(parts[1], 10);
    } else {
      const m = spn.match(/^([A-Ga-g][#b]?)(\d+)$/);
      if (m) {
        notePart = m[1];
        octave = parseInt(m[2], 10);
      }
    }
  }

  if (notePart === null || isNaN(octave)) {
    throw new Error(`Invalid SPN format: '${spn}'`);
  }

  const note = normalizeNoteName(notePart);
  const semitone = window.noteMap[note];

  if (semitone === undefined) {
    throw new Error(`Invalid note: ${note}`);
  }

  return semitone + (octave + 1) * 12;
}

// --- MIDI to SPN ---
function midiToSpn(midi) {
  if (typeof midi !== "number" || midi < 0 || midi > 127) {
    throw new Error(`Invalid MIDI value: ${midi}`);
  }
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

const chromatic = [
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

const noteTo = {
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

function noteToMidi(note, octave = null) {
  const normalized = normalizeNoteName(note);
  const pitch = normalized.replace(/[^A-G#]/g, "");
  const oct =
    octave !== null ? octave : parseInt(normalized.replace(/[^0-9]/g, ""), 10);

  if (!noteTo.hasOwnProperty(pitch)) {
    throw new Error(`Invalid pitch: ${pitch}`);
  }
  if (isNaN(oct)) {
    throw new Error(`Missing or invalid octave for note: ${note}`);
  }

  return noteTo[pitch] + (oct + 1) * 12;
}

// --- Global exposure (if needed) ---
window.normalizeNoteName = normalizeNoteName;
window.spnToMidi = spnToMidi;
window.midiToSpn = midiToSpn;
window.chromatic = chromatic;
window.noteTo = noteTo;
window.noteToMidi = noteToMidi;
window.majorSteps = majorSteps;
window.minorSteps = minorSteps;
window.buildScale = buildScale;
window.applyAccidentalFamily = applyAccidentalFamily;
window.toDisplayFormat = toDisplayFormat;
window.fromDisplayFormat = fromDisplayFormat;
window.convertToSharps = convertToSharps;
window.convertToFlats = convertToFlats;
