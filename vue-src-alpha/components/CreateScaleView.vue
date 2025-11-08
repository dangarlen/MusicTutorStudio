<!-- Removed stray component outside <template> -->
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">queue_music</span>
        <span class="text-2xl font-bold">{{ store.title }}</span>
      </div>
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Scale Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{
              store.noteArray && store.noteArray.length > 0
                ? store.noteArray.map((n) => n.pitch).join(", ")
                : "No scale generated yet."
            }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <StaffPreview />
        </div>
      </div>

      <!-- Instrument Selection -->
      <div class="mb-4">
        <InstrumentDropdown
          :instruments="store.instruments"
          v-model="store.practiceUnitHeader.instrument"
        />
      </div>

      <!-- Scale Configuration Components -->
      <CreateScaleScaleSelector
        :scaleSelections="store.scaleSelections"
        @update:scaleSelections="store.scaleSelections = $event"
      />
      <CreateScaleScaleRange
        :scaleSelections="store.scaleSelections"
        @update:scaleSelections="store.scaleSelections = $event"
      />
      <CreateScaleScaleDurationDirection
        :scaleSelections="store.scaleSelections"
        @update:scaleSelections="store.scaleSelections = $event"
      />
      <CreateScaleScaleStaffFormatting
        :scaleSelections="store.scaleSelections"
        @update:scaleSelections="store.scaleSelections = $event"
      />

      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Behind the Curtain: practiceUnitStore (JSON snapshot)</span>
        </div>
        <div class="collapse-content px-4">
          <pre class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96"
            >{{ JSON.stringify(store.composePracticeUnit(), null, 2) }}
          </pre>
        </div>
      </div>
    </main>
    <div style="max-width: 400px; margin: 2em auto">
      <button
        class="mtsFormatCreatorButtons flex items-center gap-2"
        @click="$router.push('/creator')"
      >
        <span
          class="material-symbols-outlined align-middle mr-2"
          aria-hidden="true"
          >edit_square</span
        >
        Return to Creator
      </button>
    </div>
    <FooterStandard />
  </div>
</template>

<script setup>
// --- Copy Scale SPN to clipboard ---
function copyScaleSPN() {
  console.log("function copyScaleSPN called.");
  const spnArray =
    store.noteArray && store.noteArray.length > 0
      ? store.noteArray.map((n) => n.pitch).join(", ")
      : "";
  console.log("[Copy Scale SPN] noteArray:", store.noteArray);
  console.log("[Copy Scale SPN] spnArray:", spnArray);
  if (spnArray) {
    navigator.clipboard
      .writeText(spnArray)
      .then(() => {
        console.log("[Copy Scale SPN] Clipboard write succeeded.");
        // Removed diagnostic alert
      })
      .catch((err) => {
        console.error("[Copy Scale SPN] Clipboard write failed:", err);
        alert("Failed to copy scale SPN.");
      });
  } else {
    console.warn("[Copy Scale SPN] No scale generated to copy.");
    alert("No scale generated to copy.");
  }
}

import { ref, watch, onMounted, reactive, computed } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import supabase from "../scripts/supabaseClient.js";
const store = usePracticeUnitScaleStore();

// State for recall modal
const showRecallModal = ref(false);
const availablePracticeUnits = ref([]);
const loadingUnits = ref(false);
const recallFilterText = ref("");
const filteredPracticeUnits = computed(() => {
  const q = (recallFilterText.value || "").trim().toLowerCase();
  const items = availablePracticeUnits.value || [];
  if (!q) return items;
  return items.filter((u) => {
    try {
      const h = u?.unit_json?.practiceUnitHeader || {};
      const inst = h?.instrument?.instrument || h?.instrument || "";
      const parts = [
        u?.name,
        u?.type,
        h?.keySignature,
        h?.contentType,
        h?.startingOctave,
        String(h?.numberOfOctaves || ""),
        h?.direction,
        inst,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());
      return parts.some((p) => p.includes(q));
    } catch {
      return false;
    }
  });
});

// --- Supabase helpers ------------------------------------------------------
// Direct calls to the default public schema (no fallback needed for this env)
async function upsertPracticeUnit(row) {
  const { error } = await supabase
    .from("practice_units")
    .upsert(row, { onConflict: "practice_unit_id" });
  return { error };
}

async function selectLatestPracticeUnit(sessionUserId) {
  const { data, error } = await supabase
    .from("practice_units")
    .select("unit_json, last_modified")
    .eq("user_id", sessionUserId)
    .eq("type", "Scale")
    .order("last_modified", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

async function insertNewPracticeUnit(row) {
  const { error } = await supabase.from("practice_units").insert(row);
  return { error };
}

// Initialize scaleSelections reactive proxy if needed (for backward compatibility during migration)
// Preferred approach: access store.practiceUnitHeader directly
if (!store.scaleSelections) {
  store.scaleSelections = reactive({
    key: store.practiceUnitHeader.keySignature || "C",
    scaleType: store.practiceUnitHeader.contentType || "Major",
    startingOctave: store.practiceUnitHeader.startingOctave || "C4",
    octaveCount: store.practiceUnitHeader.numberOfOctaves || 1,
    maxMeasuresPerLine:
      store.practiceUnitHeader.staffDisplayOptions?.measuresPerLineMax || 2,
    direction: store.practiceUnitHeader.direction || "ascending",
    noteDuration: "quarter",
    timeSignature: store.practiceUnitHeader.timeSignature || "4/4",
    staffOptions: {
      keySignature: true,
      accidentals: true,
      barLines: true,
      timeSignature: true,
      measuresPerLineMax:
        store.practiceUnitHeader.staffDisplayOptions?.measuresPerLineMax || 2,
      enforceLedgerLimits: false,
      accidentalFamily: "auto-key",
      ...store.practiceUnitHeader.staffDisplayOptions,
    },
  });
}

// Sync scaleSelections changes back to unified header
watch(
  () => store.scaleSelections,
  (sel) => {
    if (!sel) return;
    store.practiceUnitHeader.keySignature = sel.key || "C";
    store.practiceUnitHeader.contentType = sel.scaleType || "Major";
    store.practiceUnitHeader.startingOctave = sel.startingOctave || "C4";
    store.practiceUnitHeader.numberOfOctaves = sel.octaveCount || 1;
    store.practiceUnitHeader.direction = sel.direction || "ascending";
    store.practiceUnitHeader.timeSignature = sel.timeSignature || "4/4";
    if (sel.staffOptions) {
      store.practiceUnitHeader.staffDisplayOptions = { ...sel.staffOptions };
    }
  },
  { deep: true, immediate: true }
);

const scaleLabel = ref("Not yet saved");
let previousInstrument = null;

function buildScale() {
  scaleLabel.value = `${store.scaleSelections.key} ${store.scaleSelections.scaleType} Scale`;
  // --- Static alpha logic: full diatonic, chromatic, accidental family, direction, octave handling ---
  store.noteArray = [];
  const testStaffStore = useTestStaffNoteStore();
  testStaffStore.noteArray = [];
  const sel = store.scaleSelections;
  const scaleType = sel.scaleType || "major";
  const key = sel.key || "C";
  let startingOctave = sel.startingOctave || "C4";
  const octaveCount = sel.octaveCount || 1;
  const direction = sel.direction || "Ascending";
  const noteDuration = sel.noteDuration || "quarter";
  const accidentalFamily = sel.staffOptions?.accidentalFamily || "auto-key";
  // Shared scale patterns for accidentals (major and natural minor)
  const SCALE_PATTERNS = {
    // Major scales
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
    Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
    Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    F: ["F", "G", "A", "Bb", "C", "D", "E"],
    C: ["C", "D", "E", "F", "G", "A", "B"],
    G: ["G", "A", "B", "C", "D", "E", "F#"],
    D: ["D", "E", "F#", "G", "A", "B", "C#"],
    A: ["A", "B", "C#", "D", "E", "F#", "G#"],
    E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    // Natural minor scales
    C_minor: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
    G_minor: ["G", "A", "Bb", "C", "D", "Eb", "F"],
    D_minor: ["D", "E", "F", "G", "A", "Bb", "C"],
    A_minor: ["A", "B", "C", "D", "E", "F", "G"],
    E_minor: ["E", "F#", "G", "A", "B", "C", "D"],
    B_minor: ["B", "C#", "D", "E", "F#", "G", "A"],
    "F#_minor": ["F#", "G#", "A", "B", "C#", "D", "E"],
    "C#_minor": ["C#", "D#", "E", "F#", "G#", "A", "B"],
    F_minor: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
    Bb_minor: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"],
    Eb_minor: ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"],
    Ab_minor: ["Ab", "Bb", "Cb", "Db", "Eb", "Fb", "Gb"],
  };
  // --- Helper functions ---
  function spnToMidi(spn) {
    if (window.spnToMidi) return window.spnToMidi(spn);
    const match = spn.match(/^([A-G][#b]?)(\d)$/);
    if (!match) return 60;
    const noteMap = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      Fb: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
      Cb: 11,
    };
    const note = match[1];
    const octave = parseInt(match[2]);
    return 12 * (octave + 1) + (noteMap[note] ?? 0);
  }
  function midiToSpn(midi) {
    if (window.midiToSpn) return window.midiToSpn(midi);
    const notes = [
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
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}/${octave}`;
  }
  // --- Accidental family helpers ---
  function getKeySignaturePreference(rootNote) {
    const sharpKeys = ["C", "G", "D", "A", "E", "B", "F#", "C#"];
    const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
    if (flatKeys.includes(rootNote)) return "flats";
    if (sharpKeys.includes(rootNote)) return "sharps";
    const enharmonicMap = { "A#": "sharps", "D#": "sharps", "G#": "sharps" };
    return enharmonicMap[rootNote] || "sharps";
  }
  function convertToAccidentalFamily(note, preferredFamily) {
    const match = note.match(/^([A-G][#b]{0,2})(\d+)$/);
    if (!match) return note;
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    function adjustOctave(orig, enh, octave) {
      if ((orig === "B#" || orig === "B##") && enh.startsWith("C"))
        return octave + 1;
      if ((orig === "Cb" || orig === "Cbb") && enh.startsWith("B"))
        return octave - 1;
      return octave;
    }
    if (preferredFamily === "flats") {
      const sharpToFlat = {
        "C#": "Db",
        "C##": "D",
        "B#": "C",
        "B##": "C#",
        "D#": "Eb",
        "D##": "E",
        "E#": "F",
        "E##": "F#",
        "F#": "Gb",
        "F##": "G",
        "G#": "Ab",
        "G##": "A",
        "A#": "Bb",
        "A##": "B",
      };
      const doubleFlat = { Cb: "B", Fb: "E", Ebb: "D", Bbb: "A" };
      const enh = sharpToFlat[noteName] || doubleFlat[noteName] || noteName;
      const adjOctave = adjustOctave(noteName, enh, octave);
      return enh + adjOctave;
    } else if (preferredFamily === "sharps") {
      const flatToSharp = {
        Db: "C#",
        Dbb: "C",
        Eb: "D#",
        Ebb: "D",
        Fb: "E",
        Gb: "F#",
        Gbb: "F",
        Ab: "G#",
        Abb: "G",
        Bb: "A#",
        Bbb: "A",
        Cb: "B",
        "E#": "F",
        "B#": "C",
      };
      const doubleSharp = {
        "C##": "D",
        "D##": "E",
        "F##": "G",
        "G##": "A",
        "A##": "B",
      };
      const enh = flatToSharp[noteName] || doubleSharp[noteName] || noteName;
      const adjOctave = adjustOctave(noteName, enh, octave);
      return enh + adjOctave;
    }
    return note;
  }
  // --- Diatonic scale generation ---
  function generateDiatonicScale(rootNote, steps, startingOctave, octaveCount) {
    const letterNames = ["C", "D", "E", "F", "G", "A", "B"];
    const rootLetter = rootNote.charAt(0);
    const rootLetterIndex = letterNames.indexOf(rootLetter);
    const keySignatures = {
      C: { sharps: 0, flats: 0, family: "natural" },
      G: { sharps: 1, flats: 0, family: "sharps" },
      D: { sharps: 2, flats: 0, family: "sharps" },
      A: { sharps: 3, flats: 0, family: "sharps" },
      E: { sharps: 4, flats: 0, family: "sharps" },
      B: { sharps: 5, flats: 0, family: "sharps" },
      "F#": { sharps: 6, flats: 0, family: "sharps" },
      "C#": { sharps: 7, flats: 0, family: "sharps" },
      F: { sharps: 0, flats: 1, family: "flats" },
      Bb: { sharps: 0, flats: 2, family: "flats" },
      Eb: { sharps: 0, flats: 3, family: "flats" },
      Ab: { sharps: 0, flats: 4, family: "flats" },
      Db: { sharps: 0, flats: 5, family: "flats" },
      Gb: { sharps: 0, flats: 6, family: "flats" },
      Cb: { sharps: 0, flats: 7, family: "flats" },
    };
    const keyInfo = keySignatures[rootNote];
    if (!keyInfo)
      return generateScaleWithMidi(
        rootNote,
        steps,
        startingOctave,
        octaveCount
      );
    const scaleNotes = [];
    for (let octave = 0; octave < octaveCount; octave++) {
      const currentOctave =
        parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) + octave;
      for (let degree = 0; degree < 7; degree++) {
        const letterIndex = (rootLetterIndex + degree) % 7;
        const letter = letterNames[letterIndex];
        const accidental = getAccidentalForNote(
          letter,
          rootNote,
          degree,
          keyInfo
        );
        let noteOctave = currentOctave;
        if (degree > 0 && letterIndex < rootLetterIndex) noteOctave++;
        const note = letter + accidental + noteOctave;
        scaleNotes.push(note);
      }
    }
    const finalLetter = letterNames[rootLetterIndex];
    const finalAccidental = getAccidentalForNote(
      finalLetter,
      rootNote,
      0,
      keyInfo
    );
    scaleNotes.push(
      finalLetter +
        finalAccidental +
        (parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) + octaveCount)
    );
    return scaleNotes;
  }
  function getAccidentalForNote(letter, rootNote, degree, keyInfo) {
    const pattern = SCALE_PATTERNS[rootNote];
    const targetNote = pattern?.[degree];
    if (targetNote && targetNote.charAt(0) === letter) {
      return targetNote.substring(1);
    }
    return "";
  }
  function generateScaleWithMidi(rootNote, steps, startingOctave, octaveCount) {
    const rootNormalized = key;
    let currentMidi = spnToMidi(
      `${rootNormalized}/${parseInt(startingOctave.replace(/^[A-G][b#]?/, ""))}`
    );
    const finalNotes = [];
    finalNotes.push(
      `${rootNote}${parseInt(startingOctave.replace(/^[A-G][b#]?/, ""))}`
    );
    const totalSteps = octaveCount * steps.length;
    for (let i = 0; i < totalSteps; i++) {
      const stepIndex = i % steps.length;
      currentMidi += steps[stepIndex];
      const noteSpn = midiToSpn(currentMidi);
      finalNotes.push(noteSpn.replace("/", ""));
    }
    return finalNotes;
  }
  // --- Main scale generation ---
  let finalNotes = [];
  if (scaleType === "chromatic") {
    for (let oct = 0; oct < octaveCount; oct++) {
      const currentOctave =
        parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) + oct;
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
      for (const note of chromatic) {
        finalNotes.push(`${note}${currentOctave}`);
      }
    }
    finalNotes.push(
      `C${parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) + octaveCount}`
    );
  } else if (scaleType === "minor") {
    // Natural minor scale intervals: W-H-W-W-H-W-W
    const minorSteps = [2, 1, 2, 2, 1, 2, 2];
    // Use minor scale pattern for accidentals
    const minorKey = key + "_minor";
    function generateMinorScalePattern(
      rootNote,
      steps,
      startingOctave,
      octaveCount
    ) {
      const scaleNotes = [];
      const pattern = SCALE_PATTERNS[minorKey];
      const letterNames = ["C", "D", "E", "F", "G", "A", "B"];
      const rootLetter = rootNote.charAt(0);
      const rootLetterIndex = letterNames.indexOf(rootLetter);
      for (let octave = 0; octave < octaveCount; octave++) {
        const currentOctave =
          Number.parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) + octave;
        for (let degree = 0; degree < 7; degree++) {
          const noteName = pattern
            ? pattern[degree]
            : letterNames[(rootLetterIndex + degree) % 7];
          const degreeLetter = noteName.charAt(0);
          const degreeLetterIndex = letterNames.indexOf(degreeLetter);
          let noteOctave = currentOctave;
          if (degree > 0 && degreeLetterIndex < rootLetterIndex) noteOctave++;
          scaleNotes.push(noteName + noteOctave);
        }
      }
      // Add final octave note (tonic up one octave)
      const finalTonic = pattern ? pattern[0] : letterNames[rootLetterIndex];
      const finalOct =
        Number.parseInt(startingOctave.replace(/^[A-G][b#]?/, "")) +
        octaveCount;
      scaleNotes.push(finalTonic + finalOct);
      return scaleNotes;
    }
    finalNotes = generateMinorScalePattern(
      key,
      minorSteps,
      startingOctave,
      octaveCount
    );
    // end minor
  } else {
    // Major scale intervals: W-W-H-W-W-W-H
    const majorSteps = [2, 2, 1, 2, 2, 2, 1];
    finalNotes = generateDiatonicScale(
      key,
      majorSteps,
      startingOctave,
      octaveCount
    );
  }
  // Accidental family logic
  let preferredFamily = "sharps";
  if (accidentalFamily === "auto-key") {
    preferredFamily = getKeySignaturePreference(key);
  } else if (accidentalFamily === "auto-direction") {
    preferredFamily = direction === "Descending" ? "flats" : "sharps";
  } else if (accidentalFamily === "force-sharps") {
    preferredFamily = "sharps";
  } else if (accidentalFamily === "force-flats") {
    preferredFamily = "flats";
  }
  if (
    accidentalFamily === "auto-direction" ||
    scaleType === "chromatic" ||
    accidentalFamily.startsWith("force-")
  ) {
    if (direction === "Descending") {
      finalNotes.reverse();
    }
    finalNotes = finalNotes.map((note) =>
      convertToAccidentalFamily(note, preferredFamily)
    );
  } else {
    if (direction === "Descending") {
      finalNotes.reverse();
    }
  }
  // Map to noteArray
  const durationMap = { quarter: "q", eighth: "e", half: "h", whole: "w" };
  const generatedNotes = finalNotes.map((spn) => {
    return {
      pitch: spn,
      duration: durationMap[noteDuration] || "q",
      noteVisible: true,
      noteColor: "black",
      overlay: "",
      overlayObject: {},
      rangeStatus: "within",
    };
  });
  store.noteArray = generatedNotes;
  testStaffStore.noteArray = generatedNotes;
  // Automatically copy scale SPN to clipboard after building preview
  copyScaleSPN();
}

// Reset label to Not yet saved on any control change
watch(
  () => [
    store.scaleSelections.key,
    store.scaleSelections.scaleType,
    store.scaleSelections.startingOctave,
    store.scaleSelections.octaveCount,
    store.scaleSelections.direction,
    store.scaleSelections.noteDuration,
    store.scaleSelections.timeSignature,
    store.scaleSelections.staffOptions,
    store.instrument,
  ],
  () => {
    scaleLabel.value = "Not yet saved";
    buildScale();
  },
  { deep: true }
);

// Instrument dropdown default to previous selection
onMounted(() => {
  if (previousInstrument && !store.instrument) {
    store.instrument = previousInstrument;
  }
});
watch(
  () => store.instrument,
  (newVal) => {
    if (newVal) previousInstrument = newVal;
  }
);
const recallFileInput = ref(null);

function triggerRecallFileDialog() {
  if (recallFileInput.value) {
    recallFileInput.value.value = null; // reset
    recallFileInput.value.click();
  }
}

async function handleRecallFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Check if unified format (practiceUnitHeader + noteArray) or legacy (3-section)
    if (data.practiceUnitHeader && Array.isArray(data.noteArray)) {
      // Unified format
      store.loadPracticeUnit(data);

      // Sync scaleSelections for UI compatibility
      const h = data.practiceUnitHeader;
      store.scaleSelections = reactive({
        key: h.keySignature || "C",
        scaleType: h.contentType || "Major",
        startingOctave: h.startingOctave || "C4",
        octaveCount: h.numberOfOctaves || 1,
        direction: h.direction || "ascending",
        noteDuration: "quarter",
        timeSignature: h.timeSignature || "4/4",
        maxMeasuresPerLine: h.staffDisplayOptions?.measuresPerLineMax || 2,
        staffOptions: h.staffDisplayOptions || {},
      });

      // Sync to testStaffNoteStore for cross-view access
      const testStaffStore = useTestStaffNoteStore();
      testStaffStore.noteArray = data.noteArray.map((n) => ({ ...n }));
      scaleName.value = h.practiceName || "Imported Scale";
      alert("Practice unit loaded successfully (unified format).");
    } else if (
      data.practiceUnitHeader &&
      data.practiceUnitScale &&
      Array.isArray(data.noteArray)
    ) {
      // Legacy format: convert to unified
      const h = data.practiceUnitHeader;
      const s = data.practiceUnitScale;

      store.practiceUnitHeader = {
        ...store.practiceUnitHeader,
        practiceName: h.practiceName || "",
        practiceUnitId: h.practiceUnitId || "",
        lastModified: h.lastModified || new Date().toISOString(),
        practiceUnitType: "Scale",
        tempo: h.tempo || 120,
        keySignature: h.keySignature || "C",
        timeSignature: h.timeSignature || "4/4",
        instrument: h.instrument || null,
        staffDisplayOptions: h.staffDisplayOptions || {},
        sourceURL: h.sourceURL || "",
        noteColorDesignation: h.noteColorDesignation || {},
        // Map legacy scale fields
        contentType: s.scaleType || "Major",
        direction: s.direction || "ascending",
        startingOctave: s.scaleRange?.startingOctave || "C4",
        numberOfOctaves: s.scaleRange?.numberOfOctaves || 1,
        // N/A for Scale
        rangeStart: null,
        rangeEnd: null,
        composer: "",
        sourceWork: "",
        techniqueFocus: [],
        tagSource: "",
        repetitionCount: null,
        sourceMusicXML: "",
        instrumentOverride: "",
      };

      store.noteArray = data.noteArray.map((n) => ({ ...n }));

      // Sync scaleSelections
      store.scaleSelections = reactive({
        key: h.keySignature || "C",
        scaleType: s.scaleType || "Major",
        startingOctave: s.scaleRange?.startingOctave || "C4",
        octaveCount: s.scaleRange?.numberOfOctaves || 1,
        direction: s.direction || "ascending",
        noteDuration: "quarter",
        timeSignature: h.timeSignature || "4/4",
        staffOptions: h.staffDisplayOptions || {},
      });

      // Sync to testStaffNoteStore
      const testStaffStore = useTestStaffNoteStore();
      testStaffStore.noteArray = data.noteArray.map((n) => ({ ...n }));
      scaleName.value = h.practiceName || "Imported Scale";
      alert("Practice unit loaded successfully (legacy format converted).");
    } else {
      alert(
        "Invalid JSON format. Please select a valid practiceUnit.json file."
      );
    }
  } catch (err) {
    alert("Error loading file: " + err.message);
  }
}
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import StaffPreview from "./StaffPreview.vue";
import CreateScaleScaleSelector from "./CreateScale-ScaleSelector.vue";
import CreateScaleScaleRange from "./CreateScale-ScaleRange.vue";
import CreateScaleScaleDurationDirection from "./CreateScale-ScaleDurationDirection.vue";
import CreateScaleScaleStaffFormatting from "./CreateScale-ScaleStaffFormatting.vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
// Defensive: ensure scaleSelections is always initialized before watcher
if (!store.scaleSelections) {
  store.scaleSelections = reactive({
    key: "C",
    scaleType: "major",
    startingOctave: "C4",
    octaveCount: 1,
    maxMeasuresPerLine: 2,
    direction: "Ascending",
    noteDuration: "quarter",
    timeSignature: "4/4",
    staffOptions: {
      keySignature: true,
      accidentals: true,
      barLines: true,
      timeSignature: true,
      measuresPerLineMax: 2,
      enforceLedgerLimits: false,
      accidentalFamily: "auto-key",
    },
  });
}
// Helper: get first note of selected scale
function getFirstNoteOfScale(key, scaleType) {
  // For major/minor, return key + default octave (e.g., Bb4)
  // You may want to map key to correct octave based on instrument
  // For now, use instrument.standardRange.start if available
  const inst = store.practiceUnitHeader.instrument;
  if (inst && inst.standardRange && inst.standardRange.start) {
    // If key matches start note, use start
    if (inst.standardRange.start.startsWith(key)) {
      return inst.standardRange.start;
    }
    // Otherwise, replace note name but keep octave
    const octave = inst.standardRange.start.replace(/^[A-G][b#]?/, "");
    return key + octave;
  }
  // Fallback: Bb4 for Bb, C4 for C, etc.
  return key + "4";
}

// Persist Staff Formatting toggles in localStorage
const STAFF_OPTS_KEY = "mts.staffOptions";
onMounted(() => {
  try {
    const raw = localStorage.getItem(STAFF_OPTS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        store.scaleSelections.staffOptions = {
          ...store.scaleSelections.staffOptions,
          ...saved,
        };
      }
    }
  } catch {}
});

watch(
  () => store.scaleSelections?.staffOptions,
  (opts) => {
    try {
      localStorage.setItem(STAFF_OPTS_KEY, JSON.stringify(opts || {}));
    } catch {}
  },
  { deep: true }
);

// Watch for changes to scale or instrument and update startingOctave
watch(
  () => [
    store.scaleSelections?.key,
    store.scaleSelections?.scaleType,
    store.practiceUnitHeader.instrument,
  ],
  ([key, scaleType, instrument]) => {
    if (key && scaleType) {
      store.scaleSelections.startingOctave = getFirstNoteOfScale(
        key,
        scaleType
      );
    } else if (
      instrument &&
      instrument.standardRange &&
      instrument.standardRange.start
    ) {
      store.scaleSelections.startingOctave = instrument.standardRange.start;
    } else {
      store.scaleSelections.startingOctave = "C4";
    }
  },
  { immediate: true }
);
const scaleName = ref("");
if (!store.scaleSelections) {
  store.scaleSelections = reactive({
    key: "C",
    scaleType: "major",
    startingOctave: "C4",
    octaveCount: 1,
    maxMeasuresPerLine: 2,
    direction: "Ascending",
    noteDuration: "quarter",
    timeSignature: "4/4",
    staffOptions: {
      keySignature: true,
      accidentals: true,
      barLines: true,
      timeSignature: true,
      measuresPerLineMax: 2,
      accidentalFamily: "auto-key",
    },
  });
}

// Keep the scale name synchronized with any scale setting changes
watch(
  () => [
    store.scaleSelections?.key,
    store.scaleSelections?.scaleType,
    store.scaleSelections?.startingOctave,
    store.scaleSelections?.octaveCount,
    store.scaleSelections?.direction,
    store.practiceUnitHeader?.instrument,
  ],
  () => {
    const newName = buildDefaultScaleName();
    scaleName.value = newName;
    // Also keep header.practiceName in sync so SAVE/RECALL reflect it
    if (store.practiceUnitHeader) {
      store.practiceUnitHeader.practiceName = newName;
    }
  },
  { immediate: true, deep: false }
);

function assembleScaleDescription() {
  // Compose description from all labels
  const inst = store.practiceUnitHeader.instrument;
  const sel = store.scaleSelections;
  let desc = "";
  if (inst) {
    desc += `Instrument: ${inst.instrument || ""}`;
    if (inst.details) desc += ", " + inst.details;
    if (inst.clef) desc += ", " + inst.clef + " Clef";
    desc += "\n";
  }
  desc += `Scale Selector: ${sel.key} ${sel.scaleType} Scale\n`;
  desc += `Scale Range Settings: Scale Range: ${sel.octaveCount} octave${
    sel.octaveCount > 1 ? "s" : ""
  } starting at ${sel.startingOctave}\n`;
  desc += `Duration & Direction: ${sel.direction} ${
    sel.noteDuration.charAt(0).toUpperCase() + sel.noteDuration.slice(1)
  } Note Scale\n`;
  desc += "Staff Formatting: Options: ";
  const opts = sel.staffOptions;
  let optArr = [];
  if (opts.keySignature) optArr.push("Key Signature");
  if (opts.barLines) optArr.push("Bar Lines");
  if (opts.timeSignature) optArr.push("Time Signature");
  if (opts.accidentals) optArr.push("Accidentals");
  desc += optArr.join(", ");
  if (opts.accidentalFamily === "auto-key") desc += ". Auto: Based on Key";
  else if (opts.accidentalFamily === "auto-direction")
    desc += ". Auto: Based on Asc/Desc";
  else if (opts.accidentalFamily === "force-sharps") desc += ". Force: Sharps";
  else if (opts.accidentalFamily === "force-flats") desc += ". Force: Flats";
  desc += "\n";
  desc += `\nOne-octave ${sel.key} ${sel.scaleType} scale starting at (${
    sel.startingOctave
  }), ${sel.direction.toLowerCase()} in ${
    sel.noteDuration
  } notes with ${optArr.join(", ")}`;
  if (opts.accidentalFamily === "auto-key") desc += ", Auto: Based on Key";
  else if (opts.accidentalFamily === "auto-direction")
    desc += ", Auto: Based on Asc/Desc";
  else if (opts.accidentalFamily === "force-sharps") desc += ", Force: Sharps";
  else if (opts.accidentalFamily === "force-flats") desc += ", Force: Flats";
  if (inst)
    desc += ` for ${inst.instrument}${inst.details ? ", " + inst.details : ""}${
      inst.clef ? ", " + inst.clef + " Clef" : ""
    }`;
  return desc.replace(/[^a-zA-Z0-9 _\-\.\(\)]/g, ""); // Strip non-DOS filename chars
}

function getInstrumentShortName(inst) {
  if (!inst || !inst.instrument) return "Unknown Instrument";
  return inst.instrument.split(",")[0].trim();
}

// Default, human-friendly name used when the user hasn't provided one yet
function buildDefaultScaleName() {
  const inst = store.practiceUnitHeader.instrument;
  const sel = store.scaleSelections || {};
  const shortName = getInstrumentShortName(inst);
  const typeCased = sel.scaleType
    ? sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1)
    : "Major";
  const key = sel.key || "C";
  return `${key} ${typeCased} Scale for ${shortName}`;
}

function saveScale() {
  // Default: "C Major Scale for Euphonium" (or instrument before first comma)
  const inst = store.practiceUnitHeader.instrument;
  const sel = store.scaleSelections;
  const shortName = getInstrumentShortName(inst);
  let defaultName = `${sel.key} ${
    sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1)
  } Scale for ${shortName}`;
  let name = window.prompt("Enter Practice Unit Name:", defaultName);
  if (!name) return;
  scaleName.value = name;

  // --- Clear noteArray before generating new notes ---
  store.noteArray = [];
  const testStaffStore = useTestStaffNoteStore();
  testStaffStore.noteArray = [];
  // --- Generate noteArray based on parameters ---
  // This is a simplified scale generator for major/minor scales, ascending/descending, octave range, starting note
  // For full chromatic/fingering logic, use helpers from pitchUtils.js/pitchConverter.js if available
  const key = sel.key || "C";
  const scaleType = sel.scaleType || "major";
  const startingOctave = sel.startingOctave || "C4";
  const octaveCount = sel.octaveCount || 1;
  const direction = sel.direction || "Ascending";
  const noteDuration = sel.noteDuration || "quarter";

  // Basic scale intervals
  const scaleIntervals = {
    major: [2, 2, 1, 2, 2, 2, 1],
    minor: [2, 1, 2, 2, 1, 2, 2],
    chromatic: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  };
  // Helper: get MIDI number from SPN (use window.spnToMidi if available)
  function spnToMidi(spn) {
    if (window.spnToMidi) return window.spnToMidi(spn);
    // fallback: C4=60, C3=48, etc.
    const match = spn.match(
      /^([A-G]#?|Bb|A#|C#|D#|E#|F#|G#|Ab|Db|Eb|Gb|Fb|B#|Cb)\/?(\d)$/
    );
    if (!match) return 60;
    const noteMap = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      Fb: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
      Cb: 11,
    };
    const note = match[1];
    const octave = parseInt(match[2]);
    return 12 * (octave + 1) + (noteMap[note] ?? 0);
  }
  // Helper: get SPN from MIDI (use window.midiToSpn if available)
  function midiToSpn(midi) {
    if (window.midiToSpn) return window.midiToSpn(midi);
    const notes = [
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
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}/${octave}`;
  }
  // Build scale
  let intervals = scaleIntervals[scaleType] || scaleIntervals["major"];
  let startMidi = spnToMidi(startingOctave);
  let scaleNotes = [startMidi];
  for (let o = 0; o < octaveCount; ++o) {
    let midi =
      o === 0
        ? startMidi
        : scaleNotes[scaleNotes.length - 1] + intervals[intervals.length - 1];
    for (let i = 0; i < intervals.length; ++i) {
      midi += intervals[i];
      scaleNotes.push(midi);
    }
  }
  // Remove extra notes if too many
  scaleNotes = scaleNotes.slice(0, octaveCount * 7 + 1);
  // Ascending/Descending
  if (direction.toLowerCase().startsWith("desc"))
    scaleNotes = scaleNotes.slice().reverse();
  // Build noteArray (schema-compliant)
  // Map duration string to enum
  const durationMap = {
    quarter: "q",
    eighth: "e",
    half: "h",
    whole: "w",
  };
  const generatedNotes = scaleNotes.map((midi) => {
    // Convert "C/4" to "C4"
    const spn = midiToSpn(midi).replace("/", "");
    return {
      pitch: spn,
      duration: durationMap[noteDuration] || "q",
      noteVisible: true,
      noteColor: "black",
      overlay: "",
      overlayObject: {},
      rangeStatus: "within",
    };
  });
  store.noteArray = generatedNotes;
  // Sync to testStaffNoteStore for cross-view access
  testStaffStore.noteArray = generatedNotes;

  // Update practiceUnitHeader with current values
  store.practiceUnitHeader.practiceName = name;
  store.practiceUnitHeader.practiceUnitId = crypto.randomUUID
    ? crypto.randomUUID()
    : "guid-" + Date.now();
  store.practiceUnitHeader.lastModified = new Date().toISOString();
  store.practiceUnitHeader.practiceUnitType = "Scale";
  store.practiceUnitHeader.tempo = 120;
  store.practiceUnitHeader.keySignature = key;
  store.practiceUnitHeader.timeSignature = sel.timeSignature || "4/4";
  store.practiceUnitHeader.contentType = scaleType;
  store.practiceUnitHeader.direction = direction.toLowerCase();
  store.practiceUnitHeader.startingOctave = startingOctave;
  store.practiceUnitHeader.numberOfOctaves = octaveCount;
  // Ensure N/A fields are nulled for Scale
  store.practiceUnitHeader.rangeStart = null;
  store.practiceUnitHeader.rangeEnd = null;
  store.practiceUnitHeader.composer = "";
  store.practiceUnitHeader.sourceWork = "";
  store.practiceUnitHeader.techniqueFocus = [];
  store.practiceUnitHeader.tagSource = "";
  store.practiceUnitHeader.repetitionCount = null;
  store.practiceUnitHeader.sourceMusicXML = "";
  store.practiceUnitHeader.instrumentOverride = "";

  // Compose unified practiceUnit object
  const practiceUnit = store.composePracticeUnit();
  const dataStr = JSON.stringify(practiceUnit, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MTS-Practice Unit ${name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function recallScale() {
  // Use file input to load JSON (matches the unified viewer import flow)
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.practiceUnitHeader && data.practiceUnitHeader.practiceName) {
          scaleName.value = data.practiceUnitHeader.practiceName;
        }
        // Update Pinia store
        store.instrument = data.practiceUnitHeader.instrument || null;
        store.scaleSelections = {
          key: data.practiceUnitHeader.keySignature || "C",
          scaleType: data.practiceUnitScale.scaleType || "major",
          startingOctave:
            data.practiceUnitScale.scaleRange?.startingOctave || "C4",
          octaveCount: data.practiceUnitScale.scaleRange?.octaveCount || 1,
          direction: data.practiceUnitScale.direction || "Ascending",
          noteDuration: "quarter",
          staffOptions: data.practiceUnitHeader.staffDisplayOptions || {
            keySignature: true,
            accidentals: true,
            barLines: true,
            timeSignature: true,
            accidentalFamily: "auto-key",
          },
        };
        store.noteArray = data.noteArray || [];
      } catch (err) {
        alert("Error loading JSON: " + err);
      }
    };
    reader.readAsText(file);
  };
}
// Only one onMounted block needed

function getCookie(key) {
  const parts = document.cookie.split(";").map((s) => s.trim());
  const prefix = `${key}=`;
  for (const p of parts) {
    if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
  }
  return "";
}

// SAVE to Database (Supabase)
async function saveToDatabase() {
  try {
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (sessErr || !session?.user?.id) {
      alert("Please sign in on Preferences before saving to database.");
      return;
    }
    // Ensure header fields
    const header = store.practiceUnitHeader;
    if (!header.practiceUnitId) {
      header.practiceUnitId = crypto.randomUUID
        ? crypto.randomUUID()
        : `guid-${Date.now()}`;
    }
    header.lastModified = new Date().toISOString();
    header.practiceUnitType = "Scale";
    header.User = session.user.id;
    const unit = store.composePracticeUnit();

    // Ensure we have a human-friendly name; fall back to a composed default
    const nameToUse =
      header.practiceName || scaleName.value || buildDefaultScaleName();
    header.practiceName = header.practiceName || nameToUse;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: nameToUse,
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };
    const { error } = await upsertPracticeUnit(row);
    if (error) {
      console.warn("[CreateScale] saveToDatabase error", error);
      alert(`Save failed: ${error.message}`);
      return;
    }
    alert("Saved to database.");
  } catch (e) {
    console.warn("[CreateScale] saveToDatabase exception", e);
    alert("Unexpected error while saving to database.");
  }
}

// RECALL from Database - open modal to select from list
async function openRecallModal() {
  try {
    const { data: sessData } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (!session?.user?.id) {
      alert("Sign in first to recall from database.");
      return;
    }

    loadingUnits.value = true;
    showRecallModal.value = true;

    const { data, error } = await supabase
      .from("practice_units")
      .select("practice_unit_id, name, type, last_modified, unit_json")
      .eq("user_id", session.user.id)
      .eq("type", "Scale")
      .order("last_modified", { ascending: false });

    if (error) {
      console.warn("[CreateScale] openRecallModal error", error);
      alert(`Failed to load saved scales: ${error.message}`);
      showRecallModal.value = false;
      return;
    }

    availablePracticeUnits.value = data || [];
  } catch (e) {
    console.warn("[CreateScale] openRecallModal exception", e);
    alert("Unexpected error while loading saved scales.");
    showRecallModal.value = false;
  } finally {
    loadingUnits.value = false;
  }
}

// Load the selected practice unit from the modal
function loadSelectedUnit(unit) {
  try {
    if (!unit?.unit_json) {
      alert("Invalid practice unit data.");
      return;
    }
    store.loadPracticeUnit(unit.unit_json);
    if (unit.unit_json?.practiceUnitHeader?.practiceName) {
      scaleName.value = unit.unit_json.practiceUnitHeader.practiceName;
    }
    showRecallModal.value = false;
    alert(`Loaded: ${unit.name}`);
  } catch (e) {
    console.warn("[CreateScale] loadSelectedUnit exception", e);
    alert("Failed to load practice unit.");
  }
}

// Format timestamp for display
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Compose a compact, descriptive summary for a saved unit
function describeUnit(unit) {
  try {
    const h = unit?.unit_json?.practiceUnitHeader || {};
    const shortInst = getInstrumentShortName(h.instrument);
    const ctype = h.contentType
      ? h.contentType.charAt(0).toUpperCase() + h.contentType.slice(1)
      : "";
    const parts = [];
    if (h.keySignature && ctype) parts.push(`${h.keySignature} ${ctype}`);
    if (h.startingOctave) parts.push(`start ${h.startingOctave}`);
    if (h.numberOfOctaves)
      parts.push(
        `${h.numberOfOctaves} octave${h.numberOfOctaves > 1 ? "s" : ""}`
      );
    if (h.direction)
      parts.push(
        typeof h.direction === "string" ? h.direction : String(h.direction)
      );
    if (shortInst && shortInst !== "Unknown Instrument")
      parts.push(`for ${shortInst}`);
    return parts.filter(Boolean).join(" • ");
  } catch {
    return "";
  }
}

// RECALL from Database (legacy - kept for backwards compat, fetches most recent)
async function recallFromDatabase() {
  try {
    const { data: sessData } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (!session?.user?.id) {
      alert("Sign in first to recall from database.");
      return;
    }
    const { data, error } = await selectLatestPracticeUnit(session.user.id);
    if (error) {
      console.warn("[CreateScale] recallFromDatabase error", error);
      alert(`Recall failed: ${error.message}`);
      return;
    }
    if (!data?.unit_json) {
      alert("No saved scale found for this user.");
      return;
    }
    store.loadPracticeUnit(data.unit_json);
    if (data.unit_json?.practiceUnitHeader?.practiceName) {
      scaleName.value = data.unit_json.practiceUnitHeader.practiceName;
    }
    alert("Recalled latest saved scale from database.");
  } catch (e) {
    console.warn("[CreateScale] recallFromDatabase exception", e);
    alert("Unexpected error while recalling from database.");
  }
}

// SAVE as New to Database (always creates a new GUID)
async function saveAsNewToDatabase() {
  try {
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (sessErr || !session?.user?.id) {
      alert("Please sign in on Preferences before saving to database.");
      return;
    }
    // Compose a fresh copy of the practice unit
    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    // Always generate a new GUID
    header.practiceUnitId = crypto.randomUUID
      ? crypto.randomUUID()
      : `guid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    header.lastModified = new Date().toISOString();
    header.practiceUnitType = "Scale";
    header.User = session.user.id;

    // Ensure we have a human-friendly name; fall back to a composed default
    const nameToUse =
      header.practiceName || scaleName.value || buildDefaultScaleName();
    header.practiceName = header.practiceName || nameToUse;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: nameToUse,
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };
    const { error } = await insertNewPracticeUnit(row); // Use insert instead of upsert to ensure new row
    if (error) {
      console.warn("[CreateScale] saveAsNewToDatabase error", error);
      alert(`Save as New failed: ${error.message}`);
      return;
    }
    scaleName.value = header.practiceName || scaleName.value;
    alert(
      `Saved as new practice unit to database.\n\nName: ${header.practiceName}\nID: ${header.practiceUnitId}\n\nThis is a brand new unit separate from any previous saves.`
    );
  } catch (e) {
    console.warn("[CreateScale] saveAsNewToDatabase exception", e);
    alert("Unexpected error while saving as new to database.");
  }
}

onMounted(async () => {
  await store.loadInstruments();
  // If no instrument selected yet, try cookie default
  try {
    const cookieInstrument = getCookie("instrument");
    if (
      cookieInstrument &&
      !store.practiceUnitHeader.instrument &&
      Array.isArray(store.instruments) &&
      store.instruments.length
    ) {
      const match = store.instruments.find(
        (i) => i.instrument === cookieInstrument
      );
      if (match) store.practiceUnitHeader.instrument = match;
    }
  } catch {}
});
</script>
