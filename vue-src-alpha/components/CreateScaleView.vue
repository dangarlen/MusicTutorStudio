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
      <div class="mb-4">
        <InstrumentDropdown
          :instruments="store.instruments"
          v-model="store.instrument"
        />
      </div>
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
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>💾 Save/Recall Workspace Snapshot</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{ scaleName ? `Scale Name: ${scaleName}` : "Not yet saved" }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <div class="flex gap-4 mb-4">
            <button class="btn btn-warning" @click="saveScale">
              SAVE Scale to MTS-PracticeUnitExport.json
            </button>
            <button class="btn btn-info" @click="recallScale">
              RECALL Scale FROM json file
            </button>
          </div>
        </div>
      </div>
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Behind the Curtain: practiceUnitScale.json</span>
        </div>
        <div class="collapse-content px-4">
          <pre class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96"
            >{{
              JSON.stringify(
                {
                  instrument: store.instrument,
                  scaleSelections: store.scaleSelections,
                  noteArray: store.noteArray,
                },
                null,
                2
              )
            }}
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
      <button
        class="mtsFormatCreatorButtons flex items-center gap-2 mt-4"
        @click="triggerRecallFileDialog"
      >
        <span
          class="material-symbols-outlined align-middle mr-2"
          aria-hidden="true"
          >upload_file</span
        >
        RECALL (Import JSON)
      </button>
      <input
        ref="recallFileInput"
        type="file"
        accept="application/json"
        style="display: none"
        @change="handleRecallFileChange"
      />
    </div>
    <FooterStandard />
  </div>
</template>
<script setup>
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
    // Defensive: check for expected fields
    if (
      data.practiceUnitHeader &&
      data.practiceUnitScale &&
      Array.isArray(data.noteArray)
    ) {
      // Update Pinia store
      store.instrument = data.practiceUnitHeader.instrument;
      store.scaleSelections = reactive({
        key: data.practiceUnitHeader.keySignature || "C",
        scaleType: data.practiceUnitScale.scaleType || "major",
        startingOctave:
          data.practiceUnitScale.scaleRange?.startingOctave || "C4",
        octaveCount: data.practiceUnitScale.scaleRange?.numberOfOctaves || 1,
        direction: data.practiceUnitScale.direction || "Ascending",
        noteDuration: "quarter", // fallback
        staffOptions: data.practiceUnitHeader.staffDisplayOptions || {},
      });
      store.noteArray = data.noteArray;
      // Sync to testStaffNoteStore for cross-view access
      const testStaffStore = useTestStaffNoteStore();
      testStaffStore.noteArray = data.noteArray;
      alert("Practice unit loaded successfully.");
    } else {
      alert(
        "Invalid JSON format. Please select a valid practiceUnitScale.json file."
      );
    }
  } catch (err) {
    alert("Error loading file: " + err.message);
  }
}
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import CreateScaleScaleSelector from "./CreateScale-ScaleSelector.vue";
import CreateScaleScaleRange from "./CreateScale-ScaleRange.vue";
import CreateScaleScaleDurationDirection from "./CreateScale-ScaleDurationDirection.vue";
import CreateScaleScaleStaffFormatting from "./CreateScale-ScaleStaffFormatting.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
const store = usePracticeUnitScaleStore();
// Defensive: ensure scaleSelections is always initialized before watcher
if (!store.scaleSelections) {
  store.scaleSelections = reactive({
    key: "C",
    scaleType: "major",
    startingOctave: "C4",
    octaveCount: 1,
    direction: "Ascending",
    noteDuration: "quarter",
    staffOptions: {
      keySignature: true,
      accidentals: true,
      barLines: true,
      timeSignature: true,
      accidentalFamily: "auto-key",
    },
  });
}
// Helper: get first note of selected scale
function getFirstNoteOfScale(key, scaleType) {
  // For major/minor, return key + default octave (e.g., Bb4)
  // You may want to map key to correct octave based on instrument
  // For now, use instrument.standardRange.start if available
  if (
    store.instrument &&
    store.instrument.standardRange &&
    store.instrument.standardRange.start
  ) {
    // If key matches start note, use start
    if (store.instrument.standardRange.start.startsWith(key)) {
      return store.instrument.standardRange.start;
    }
    // Otherwise, replace note name but keep octave
    const octave = store.instrument.standardRange.start.replace(
      /^[A-G][b#]?/,
      ""
    );
    return key + octave;
  }
  // Fallback: Bb4 for Bb, C4 for C, etc.
  return key + "4";
}

// Watch for changes to scale or instrument and update startingOctave
watch(
  () => [
    store.scaleSelections?.key,
    store.scaleSelections?.scaleType,
    store.instrument,
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
    direction: "Ascending",
    noteDuration: "quarter",
    staffOptions: {
      keySignature: true,
      accidentals: true,
      barLines: true,
      timeSignature: true,
      accidentalFamily: "auto-key",
    },
  });
}

function assembleScaleDescription() {
  // Compose description from all labels
  const inst = store.instrument;
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

function saveScale() {
  // Default: "C Major Scale for Euphonium" (or instrument before first comma)
  const inst = store.instrument;
  const sel = store.scaleSelections;
  const shortName = getInstrumentShortName(inst);
  let defaultName = `${sel.key} ${
    sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1)
  } Scale for ${shortName}`;
  let name = window.prompt("Enter scale name:", defaultName);
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

  // Compose practiceUnit object
  const practiceUnit = {
    practiceUnitHeader: {
      practiceName: name,
      practiceUnitId: "guid-placeholder",
      lastModified: new Date().toISOString(),
      practiceUnitType: "Scale",
      tempo: 120,
      keySignature: store.scaleSelections.key,
      timeSignature: "4/4",
      instrument: store.instrument,
      staffDisplayOptions: store.scaleSelections.staffOptions,
      sourceURL: "",
      noteColorDesignation: {},
    },
    practiceUnitScale: {
      scaleType: store.scaleSelections.scaleType,
      scaleRange: {
        startingOctave: store.scaleSelections.startingOctave,
        octaveCount: store.scaleSelections.octaveCount,
      },
      direction: store.scaleSelections.direction,
    },
    noteArray: store.noteArray || [],
  };
  const dataStr = JSON.stringify(practiceUnit, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "MTS-PracticeUnitExport.json";
  a.click();
  URL.revokeObjectURL(url);
}

function recallScale() {
  // Use file input to load JSON, similar to Step 1 in CreateTestStaffNoteBuilder
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

onMounted(() => {
  store.loadInstruments();
});
</script>
