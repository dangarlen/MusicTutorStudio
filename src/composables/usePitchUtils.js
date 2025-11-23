// Vue composable for pitch utility functions
// Provides spnToMidi, midiToSpn, and other pitch conversion utilities

const noteMap = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11
};

const reverseNoteMap = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

// Normalize note name (remove case and normalize accidentals)
function normalizeNoteName(note) {
  if (typeof note !== "string") return "";
  return note.trim().replace(/[♯]/g, "#").replace(/[♭]/g, "b");
}

// Convert SPN (Scientific Pitch Notation) to MIDI number
// Accepts formats: "C4", "C/4", "C#4", "Db/4"
function spnToMidi(spn) {
  if (typeof spn !== "string") return 60; // Default to C4
  
  let notePart = null;
  let octave = null;
  
  // Handle both "C/4" and "C4" formats
  if (spn.includes("/")) {
    const parts = spn.split("/");
    notePart = parts[0];
    octave = parseInt(parts[1], 10);
  } else {
    const match = spn.match(/^([A-Ga-g][#b♯♭]?)(\d+)$/);
    if (match) {
      notePart = match[1];
      octave = parseInt(match[2], 10);
    }
  }
  
  if (notePart === null || isNaN(octave)) {
    console.warn(`Invalid SPN format: '${spn}', using C4 as fallback`);
    return 60;
  }
  
  const normalizedNote = normalizeNoteName(notePart);
  const semitone = noteMap[normalizedNote];
  
  if (semitone === undefined) {
    console.warn(`Invalid note: '${normalizedNote}', using C4 as fallback`);
    return 60;
  }
  
  return semitone + (octave + 1) * 12;
}

// Convert MIDI number to SPN
function midiToSpn(midi) {
  if (typeof midi !== "number" || midi < 0 || midi > 127) {
    console.warn(`Invalid MIDI value: ${midi}, using C4 as fallback`);
    return "C/4";
  }
  
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const note = reverseNoteMap[pitchClass];
  
  return `${note}/${octave}`;
}

// Composable hook
export function usePitchUtils() {
  return {
    normalizeNoteName,
    spnToMidi,
    midiToSpn,
    noteMap,
    reverseNoteMap
  };
}

// Also expose globally for compatibility with existing code
if (typeof window !== 'undefined') {
  window.normalizeNoteName = normalizeNoteName;
  window.spnToMidi = spnToMidi;
  window.midiToSpn = midiToSpn;
  window.noteMap = noteMap;
}