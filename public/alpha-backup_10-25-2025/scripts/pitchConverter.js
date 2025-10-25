// pitchConverter.js

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

function midiToSpn(midi) {
  if (typeof midi !== "number" || midi < 0 || midi > 127) {
    throw new Error(`Invalid MIDI value: ${midi}`);
  }
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const note = reverseNoteMap[pitchClass];
  return `${note}/${octave}`;
}

window.midiToSpn = midiToSpn;
