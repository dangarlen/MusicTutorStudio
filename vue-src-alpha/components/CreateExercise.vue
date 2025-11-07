<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">add_circle</span>
        <span class="text-2xl font-bold">Create Exercise</span>
      </div>
      <!-- Preview -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Preview</span>
        </div>
        <div class="collapse-content px-4 space-y-4">
          <!-- Preview: basic list of imported notes -->
          <div v-if="importedTitle" class="text-sm text-gray-700">
            <div><strong>Title:</strong> {{ importedTitle }}</div>
            <div><strong>Key:</strong> {{ importedKey || "Unknown" }}</div>
            <div><strong>Time:</strong> {{ importedTime || "4/4" }}</div>
          </div>

          <div v-if="store.noteArray?.length" class="mt-2">
            <div class="text-xs text-gray-600 mb-1">
              Imported note count: {{ store.noteArray.length }}
            </div>

            <!-- TRIM Instructions -->
            <div
              class="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm text-gray-700"
            >
              <strong class="text-blue-800">How to TRIM:</strong> Click on notes
              to cycle through colors:
              <span
                style="
                  background-color: #bbf7d0;
                  padding: 0 0.25rem;
                  border-radius: 0.25rem;
                "
                ><strong style="color: #166534">green</strong></span
              >
              = trim start,
              <span
                style="
                  background-color: #fecaca;
                  padding: 0 0.25rem;
                  border-radius: 0.25rem;
                "
                ><strong style="color: #991b1b">red</strong></span
              >
              = trim end,
              <span
                style="
                  background-color: #fed7aa;
                  padding: 0 0.25rem;
                  border-radius: 0.25rem;
                "
                ><strong style="color: #9a3412">orange</strong></span
              >
              = delete note,
              <span
                style="
                  background-color: #d1d5db;
                  padding: 0 0.25rem;
                  border-radius: 0.25rem;
                "
                ><strong style="color: #1f2937">gray</strong></span
              >
              = replace with rest. Press <strong>[TRIM]</strong> to keep only
              notes between green and red (inclusive). Press
              <strong>[Delete Selected Notes]</strong> to remove orange notes
              and convert gray notes to rests.
            </div>

            <StaffPreview
              :practice-enable-click-to-cycle="true"
              :practice-color-cycle="[
                'black',
                'green',
                'red',
                'orange',
                'gray',
              ]"
            />

            <div v-if="trimEnabled" class="mt-3 flex items-center gap-2">
              <button class="btn btn-sm btn-accent" @click="doTrim">
                [TRIM]
              </button>
              <div class="text-sm text-gray-600">
                Keeping notes {{ trimStart + 1 }} → {{ trimEnd + 1 }}
              </div>
            </div>

            <div
              v-if="hasDeleteOrRestNotes"
              class="mt-3 flex items-center gap-2"
            >
              <button
                class="btn btn-sm btn-warning"
                @click="deleteSelectedNotes"
              >
                [Delete Selected Notes]
              </button>
              <div class="text-sm text-gray-600">
                {{ orangeNoteCount }} to delete, {{ grayNoteCount }} to convert
                to rests
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MusicXML -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>MusicXML</span>
          <span class="text-sm font-normal text-gray-500">{{
            musicXmlFileName || "Select MusicXML file for import"
          }}</span>
        </div>
        <div class="collapse-content px-4 space-y-3">
          <p class="text-sm text-gray-600">
            Choose a .musicxml or .xml file. We'll parse title, key, and time,
            then convert notes into simple tokens: SPN plus duration (w|h|q|e|s)
            with an optional dot for dotted values (e.g., q., e.). Dotted
            durations are fully supported and render/measure as 1.5× their base
            value.
          </p>
          <input
            type="file"
            accept=".musicxml,.xml,application/xml,text/xml"
            @change="onMusicXmlFile"
            class="file-input file-input-bordered file-input-sm w-full max-w-md"
          />
          <div v-if="importError" class="text-sm text-error">
            {{ importError }}
          </div>
        </div>
      </div>

      <!-- Edit Exercise Details (fields not imported) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Edit Exercise Details</span>
        </div>
        <div class="collapse-content px-4 grid gap-3 max-w-xl">
          <div class="form-control">
            <label class="label" for="exPracticeName"
              ><span class="label-text">Practice Name</span></label
            >
            <input
              id="exPracticeName"
              v-model="editPracticeName"
              class="input input-sm input-bordered"
              placeholder="Imported Exercise"
            />
          </div>
          <div class="form-control">
            <label class="label" for="exTempo"
              ><span class="label-text">Tempo (bpm)</span></label
            >
            <input
              id="exTempo"
              v-model.number="editTempo"
              type="number"
              min="20"
              max="240"
              class="input input-sm input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label" for="exReps"
              ><span class="label-text">Repetitions</span></label
            >
            <input
              id="exReps"
              v-model.number="editReps"
              type="number"
              min="1"
              max="20"
              class="input input-sm input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label" for="exFocus"
              ><span class="label-text"
                >Technique Focus (comma-separated)</span
              ></label
            >
            <input
              id="exFocus"
              v-model="editFocus"
              class="input input-sm input-bordered"
              placeholder="tone, articulation"
            />
          </div>
          <div class="form-control">
            <label class="label" for="exSourceURL"
              ><span class="label-text">Source URL</span></label
            >
            <input
              id="exSourceURL"
              v-model="editSourceURL"
              class="input input-sm input-bordered"
              placeholder="https://..."
            />
          </div>
          <div>
            <button
              class="btn btn-primary btn-sm"
              @click="applyEdits"
              :disabled="!currentPracticeUnit"
            >
              Apply to Current Unit
            </button>
          </div>
        </div>
      </div>

      <!-- Instrument -->
      <div class="mb-4">
        <InstrumentDropdown
          :instruments="store.instruments"
          v-model="store.instrument"
        />
      </div>

      <!-- Staff Formatting -->
      <CreateScaleScaleStaffFormatting
        :scaleSelections="store.scaleSelections"
        @update:scaleSelections="store.scaleSelections = $event"
      />

      <!-- Octave Controls -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>🔢 Octave Controls</span>
          <span class="text-right text-base font-normal text-gray-600">
            Octave Transposition: {{ octaveTranspositionCount }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <div class="flex items-center gap-4">
            <button
              class="btn btn-sm"
              @click="decrementOctave"
              :disabled="octaveTranspositionCount <= -2"
            >
              [–]
            </button>
            <div class="text-center">
              <div class="font-semibold mb-1">Octave Transposition</div>
              <span
                class="px-3 py-1 border rounded bg-white text-gray-800 font-mono"
                >{{ octaveTranspositionCount }}</span
              >
            </div>
            <button
              class="btn btn-sm"
              @click="incrementOctave"
              :disabled="octaveTranspositionCount >= 2"
            >
              [+]
            </button>
          </div>
          <div class="text-xs text-gray-600 mt-2">
            Range: -2 to +2 octaves. Adjusts note octaves without changing
            accidentals.
          </div>
        </div>
      </div>

      <!-- Behind the Curtain: current practice unit JSON -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
          Behind the Curtain: practiceUnitStore (JSON snapshot)
        </div>
        <div class="collapse-content px-4">
          <pre
            class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96"
            >{{ currentUnitJson }}</pre
          >
        </div>
      </div>

      <CreatorReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import CreatorReturn from "./CreatorReturn.vue";
import StaffPreview from "./StaffPreview.vue";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import CreateScaleScaleStaffFormatting from "./CreateScale-ScaleStaffFormatting.vue";
import { ref, computed, reactive, onMounted } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import supabase from "../scripts/supabaseClient.js";
// removed duplicate Vue import

const store = usePracticeUnitScaleStore();
const testStaffStore = useTestStaffNoteStore();

// Initialize scaleSelections if not present (needed for Staff Formatting component)
if (!store.scaleSelections) {
  store.scaleSelections = reactive({
    key: "C",
    scaleType: "Major",
    startingOctave: "C4",
    octaveCount: 1,
    maxMeasuresPerLine: 2,
    direction: "ascending",
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

const importedTitle = ref("");
const importedKey = ref("");
const importedTime = ref("");
const importError = ref("");
const musicXmlFileName = ref("");

// --- Supabase helpers ------------------------------------------------------
// Direct calls to the default public schema
async function ex_upsertPracticeUnit(row) {
  const { error } = await supabase
    .from("practice_units")
    .upsert(row, { onConflict: "practice_unit_id" });
  return { error };
}

async function ex_selectLatest(userId) {
  const { data, error } = await supabase
    .from("practice_units")
    .select("unit_json, last_modified")
    .eq("user_id", userId)
    .eq("type", "Exercise")
    .order("last_modified", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

async function ex_insertNew(row) {
  const { error } = await supabase.from("practice_units").insert(row);
  return { error };
}
const exerciseName = ref("");
const recallFileInput = ref(null);
const octaveTranspositionCount = ref(0);
let originalNoteArray = ref([]);
// Recall modal state (Exercise)
const showRecallModal = ref(false);
const availableExercises = ref([]);
const loadingUnits = ref(false);
const recallFilterText = ref("");
const filteredExercises = computed(() => {
  const q = (recallFilterText.value || "").trim().toLowerCase();
  const items = availableExercises.value || [];
  if (!q) return items;
  return items.filter((u) => {
    try {
      const h = u?.unit_json?.practiceUnitHeader || {};
      const inst = h?.instrument?.instrument || h?.instrument || "";
      const parts = [
        u?.name,
        u?.type,
        h?.keySignature,
        h?.timeSignature,
        (h?.techniqueFocus || []).join(" "),
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

// current practice unit (local to this view)
const currentPracticeUnit = ref(null);
const currentUnitJson = ref("{}");

function refreshCurrentUnitJson() {
  try {
    currentUnitJson.value = JSON.stringify(
      currentPracticeUnit.value || {},
      null,
      2
    );
  } catch {
    currentUnitJson.value = "{}";
  }
}

// Auto-populate workspace if coming from Create Scales with existing noteArray
onMounted(() => {
  // Check if store has noteArray data (e.g., from a scale)
  if (store.noteArray && store.noteArray.length > 0) {
    // Pre-populate the exercise workspace with the scale data
    const header = store.practiceUnitHeader || {};

    // Set imported values from the existing scale header
    importedTitle.value =
      header.practiceName || header.sourceTitle || "Imported from Scale";
    importedKey.value = header.keySignature || "C";
    importedTime.value = header.timeSignature || "4/4";

    // Copy noteArray to exercise workspace
    originalNoteArray.value = store.noteArray.map((n) => ({ ...n }));
    octaveTranspositionCount.value = 0;
    testStaffStore.noteArray = store.noteArray.map((n) => ({ ...n }));

    // Create the practice unit from the existing data
    currentPracticeUnit.value = composePracticeUnit(store.noteArray);
    currentPracticeUnit.value.practiceUnitHeader.practiceName =
      importedTitle.value;
    currentPracticeUnit.value.practiceUnitHeader.keySignature =
      importedKey.value;
    currentPracticeUnit.value.practiceUnitHeader.timeSignature =
      importedTime.value;

    // Update store header to match
    store.practiceUnitHeader = {
      ...store.practiceUnitHeader,
      ...currentPracticeUnit.value.practiceUnitHeader,
    };

    seedEditFieldsFromUnit();
    refreshCurrentUnitJson();

    console.log(
      "[CreateExercise] Auto-populated workspace from existing scale data"
    );
  }
});

// MusicXML import
function onMusicXmlFile(ev) {
  importError.value = "";
  const file = ev?.target?.files?.[0];
  if (!file) return;
  musicXmlFileName.value = file.name; // Capture filename for display
  file
    .text()
    .then((xml) => {
      try {
        const parsed = parseMusicXML(xml);
        if (!parsed?.noteArray?.length) {
          importError.value = "No playable notes found in MusicXML.";
          return;
        }
        importedTitle.value = parsed.title || "Imported Exercise";
        importedKey.value = parsed.keySignature || "C";
        importedTime.value = parsed.timeSignature || "4/4";

        // update stores for preview
        originalNoteArray.value = parsed.noteArray.map((n) => ({ ...n }));
        octaveTranspositionCount.value = 0;
        store.noteArray = originalNoteArray.value.map((n) => ({ ...n }));
        testStaffStore.noteArray = originalNoteArray.value.map((n) => ({
          ...n,
        }));
        store.scaleSelections = store.scaleSelections || {};
        store.scaleSelections.key = importedKey.value;
        store.scaleSelections.timeSignature = importedTime.value;
        store.title = importedTitle.value;

        currentPracticeUnit.value = composePracticeUnit(store.noteArray);
        // carry over imported header fields
        currentPracticeUnit.value.practiceUnitHeader.practiceName =
          importedTitle.value;
        currentPracticeUnit.value.practiceUnitHeader.keySignature =
          importedKey.value;
        currentPracticeUnit.value.practiceUnitHeader.timeSignature =
          importedTime.value;

        // Update store header to match (needed for unified viewer)
        store.practiceUnitHeader = {
          ...store.practiceUnitHeader,
          ...currentPracticeUnit.value.practiceUnitHeader,
        };

        seedEditFieldsFromUnit();
        refreshCurrentUnitJson();
      } catch (e) {
        console.warn("[CreateExercise] MusicXML parse failed", e);
        importError.value = "MusicXML parse failed. See console.";
      }
    })
    .catch(() => (importError.value = "Failed to read file."));
}

function parseMusicXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  // Check parsererror
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("Invalid XML");
  }
  const pick = (sel) => doc.querySelector(sel)?.textContent?.trim() || "";
  const title = pick("work > work-title") || pick("movement-title") || "";
  // key from first <key><fifths> (0=C, sharps positive)
  const fifthsStr = pick("part measure attributes key fifths");
  const ks = fifthsToKey(Number.parseInt(fifthsStr || "0", 10));
  const beats = pick("part measure attributes time beats") || "4";
  const beatType = pick("part measure attributes time beat-type") || "4";
  const timeSig = `${beats}/${beatType}`;

  // build notes from first <part>
  const part = doc.querySelector("score-partwise > part");
  const notesOut = [];
  if (part) {
    const noteNodes = part.querySelectorAll("measure > note");
    for (const n of noteNodes) {
      if (n.querySelector("rest")) return; // skip rests
      // chord handling: skip secondary chord notes (only take the first in each chord group)
      if (n.querySelector("chord")) return;
      const step = n.querySelector("pitch > step")?.textContent?.trim() || "";
      const alter = Number.parseInt(
        n.querySelector("pitch > alter")?.textContent?.trim() || "0",
        10
      );
      const octave =
        n.querySelector("pitch > octave")?.textContent?.trim() || "4";
      const type = n.querySelector("type")?.textContent?.trim() || "quarter";
      const spn = toSpn(step, alter, octave);
      const dots = n.querySelectorAll("dot").length;
      const dur = typeToToken(type, dots);
      if (spn && dur) notesOut.push({ pitch: spn, duration: dur });
    }
  }

  return {
    title,
    keySignature: ks,
    timeSignature: timeSig,
    noteArray: notesOut,
  };
}

function toSpn(step, alter, octave) {
  if (!step) return "";
  let acc = "";
  if (alter === 1) acc = "#";
  else if (alter === -1) acc = "b";
  else if (alter > 1) acc = "##";
  else if (alter < -1) acc = "bb";
  return `${step}${acc}${octave}`;
}

function typeToToken(type, dots = 0) {
  let base = "";
  switch (type) {
    case "whole":
      base = "w";
      break;
    case "half":
      base = "h";
      break;
    case "quarter":
      base = "q";
      break;
    case "eighth":
      base = "e";
      break;
    case "16th":
      base = "s";
      break;
    default:
      break;
  }
  if (!base) return "";
  return dots > 0 ? base + "." : base;
}

function fifthsToKey(f) {
  const map = {
    "-7": "Cb major",
    "-6": "Gb major",
    "-5": "Db major",
    "-4": "Ab major",
    "-3": "Eb major",
    "-2": "Bb major",
    "-1": "F major",
    0: "C major",
    1: "G major",
    2: "D major",
    3: "A major",
    4: "E major",
    5: "B major",
    6: "F# major",
    7: "C# major",
  };
  return map[String(Number.isNaN(f) ? 0 : f)] || "C major";
}

function composePracticeUnit(outNotes) {
  return {
    practiceUnitHeader: {
      practiceName: importedTitle.value || "Imported Exercise",
      practiceUnitId: crypto.randomUUID
        ? crypto.randomUUID()
        : "temp-" + Date.now(),
      practiceUnitType: "Exercise",
      lastModified: new Date().toISOString(),
      tempo: 80,
      keySignature: importedKey.value || "C",
      timeSignature: importedTime.value || "4/4",
      instrument: store.instrument || {},
      staffDisplayOptions: {
        showAccidentals: true,
        showOverlays: true,
        measuresPerLineMax: 2,
      },
      sourceURL: "",
      noteColorDesignation: {},
      // Exercise-specific unified fields
      contentType: "Passage", // Exercise type
      techniqueFocus: [],
      tagSource: "user",
      repetitionCount: 1,
      sourceMusicXML: musicXmlFileName.value || "",
      instrumentOverride: "",
      // N/A for Exercise (Scale fields)
      direction: "",
      startingOctave: "",
      numberOfOctaves: null,
      // N/A for Exercise (Passage fields)
      rangeStart: null,
      rangeEnd: null,
      composer: "",
      sourceWork: "",
    },
    noteArray: outNotes,
  };
}

// Edit fields state
const editPracticeName = ref("");
const editTempo = ref(80);
const editReps = ref(1);
const editFocus = ref("");
const editSourceURL = ref("");

// Trim button logic: show when at least one green and one red note exist
const trimEnabled = computed(() => {
  const arr = store.noteArray || [];
  const hasGreen = arr.some(
    (n) => (n.noteColor || "").toLowerCase() === "green"
  );
  const hasRed = arr.some((n) => (n.noteColor || "").toLowerCase() === "red");
  if (!hasGreen || !hasRed) return false;
  // ensure green occurs before red in index space
  const minGreen = arr.findIndex(
    (n) => (n.noteColor || "").toLowerCase() === "green"
  );
  const maxRed = arr.reduce(
    (acc, n, i) => ((n.noteColor || "").toLowerCase() === "red" ? i : acc),
    -1
  );
  return minGreen >= 0 && maxRed >= 0 && minGreen <= maxRed;
});

const trimStart = computed(() => {
  const arr = store.noteArray || [];
  return arr.findIndex((n) => (n.noteColor || "").toLowerCase() === "green");
});

const trimEnd = computed(() => {
  const arr = store.noteArray || [];
  return arr.reduce(
    (acc, n, i) => ((n.noteColor || "").toLowerCase() === "red" ? i : acc),
    -1
  );
});

// Delete/Rest button logic: show when there are orange or gray notes
const hasDeleteOrRestNotes = computed(() => {
  const arr = store.noteArray || [];
  return arr.some((n) => {
    const color = (n.noteColor || "").toLowerCase();
    return color === "orange" || color === "gray";
  });
});

const orangeNoteCount = computed(() => {
  const arr = store.noteArray || [];
  return arr.filter((n) => (n.noteColor || "").toLowerCase() === "orange")
    .length;
});

const grayNoteCount = computed(() => {
  const arr = store.noteArray || [];
  return arr.filter((n) => (n.noteColor || "").toLowerCase() === "gray").length;
});

function seedEditFieldsFromUnit() {
  const h = currentPracticeUnit.value?.practiceUnitHeader || {};
  editPracticeName.value = h.practiceName || "Imported Exercise";
  editTempo.value = Number(h.tempo || 80);
  editReps.value = Number(h.repetitionCount || 1);
  editFocus.value = (h.techniqueFocus || []).join(", ");
  editSourceURL.value = h.sourceURL || "";
}

function applyEdits() {
  if (!currentPracticeUnit.value) return;
  const h = currentPracticeUnit.value.practiceUnitHeader;
  h.practiceName = editPracticeName.value || h.practiceName;
  h.tempo = Number(editTempo.value) || 80;
  h.sourceURL = editSourceURL.value || "";
  h.repetitionCount = Number(editReps.value) || 1;
  h.techniqueFocus = (editFocus.value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  refreshCurrentUnitJson();
}

function doTrim() {
  try {
    const start = trimStart.value;
    const end = trimEnd.value;
    if (start < 0 || end < 0 || start > end) {
      console.warn("[CreateExercise] Trim range invalid", start, end);
      return;
    }
    const arr = store.noteArray || [];
    const newArr = arr
      .slice(start, end + 1)
      .map((n) => ({ ...n, noteColor: "black" }));
    // Update stores and local practice unit
    store.noteArray = newArr;
    testStaffStore.noteArray = newArr.map((n) => ({ ...n }));
    if (currentPracticeUnit.value) {
      currentPracticeUnit.value.noteArray = newArr;
      refreshCurrentUnitJson();
    }
    // Reset baseline to trimmed and center transposition
    originalNoteArray.value = newArr.map((n) => ({ ...n }));
    octaveTranspositionCount.value = 0;
  } catch (e) {
    console.warn("[CreateExercise] doTrim failed", e);
  }
}

// Delete selected notes (orange = delete, gray = convert to rest)
function deleteSelectedNotes() {
  try {
    const arr = store.noteArray || [];
    const newArr = [];

    for (const note of arr) {
      const color = (note.noteColor || "").toLowerCase();

      if (color === "orange") {
        // Skip this note (delete it)
        continue;
      } else if (color === "gray") {
        // Convert to rest: use "B/4" as placeholder pitch and add "r" to duration
        // VexFlow recognizes duration + "r" as a rest (e.g., "qr" = quarter rest)
        newArr.push({
          ...note,
          pitch: "B/4", // Placeholder pitch (won't be rendered for rests)
          duration: note.duration + "r", // Add "r" suffix to mark as rest
          noteColor: "black",
        });
      } else {
        // Keep the note as-is, but reset color to black
        newArr.push({
          ...note,
          noteColor: "black",
        });
      }
    }

    // Update stores and local practice unit
    store.noteArray = newArr;
    testStaffStore.noteArray = newArr.map((n) => ({ ...n }));
    if (currentPracticeUnit.value) {
      currentPracticeUnit.value.noteArray = newArr;
      refreshCurrentUnitJson();
    }
    // Reset baseline to new array
    originalNoteArray.value = newArr.map((n) => ({ ...n }));

    console.log(
      "[CreateExercise] Deleted orange notes and converted gray notes to rests"
    );
  } catch (e) {
    console.warn("[CreateExercise] deleteSelectedNotes failed", e);
  }
}

// --- Octave transposition helpers ---
function transposePitchOctave(spn, delta) {
  const m = String(spn).match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return spn;
  const note = m[1];
  const oct = Number.parseInt(m[2], 10);
  const newOct = oct + delta;
  return `${note}${newOct}`;
}

function applyOctaveTransposition() {
  const delta = octaveTranspositionCount.value || 0;
  const base = Array.isArray(originalNoteArray.value)
    ? originalNoteArray.value
    : [];
  const transposed = base.map((n) => {
    if (!n?.pitch) return { ...n };
    return { ...n, pitch: transposePitchOctave(n.pitch, delta) };
  });
  store.noteArray = transposed;
  testStaffStore.noteArray = transposed.map((n) => ({ ...n }));
  if (currentPracticeUnit.value) {
    currentPracticeUnit.value.noteArray = transposed;
    refreshCurrentUnitJson();
  }
}

function incrementOctave() {
  if (octaveTranspositionCount.value >= 2) return;
  octaveTranspositionCount.value += 1;
  applyOctaveTransposition();
}
function decrementOctave() {
  if (octaveTranspositionCount.value <= -2) return;
  octaveTranspositionCount.value -= 1;
  applyOctaveTransposition();
}

// Save/Recall functions
function saveExercise() {
  try {
    if (!currentPracticeUnit.value) {
      alert("No exercise to save. Please import or create an exercise first.");
      return;
    }

    // Prompt for practice unit name
    const defaultName = editPracticeName.value || "Exercise";
    let name = globalThis.prompt("Enter Practice Unit Name:", defaultName);
    if (!name) return;

    // Update the practice name in the current unit
    if (currentPracticeUnit.value.practiceUnitHeader) {
      currentPracticeUnit.value.practiceUnitHeader.practiceName = name;
    }

    const json = JSON.stringify(currentPracticeUnit.value, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MTS-Practice Unit ${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    exerciseName.value = name;
  } catch (e) {
    console.warn("[CreateExercise] saveExercise failed", e);
    alert("Failed to save exercise.");
  }
}

function triggerRecallFileDialog() {
  if (recallFileInput.value) {
    recallFileInput.value.click();
  }
}

function handleRecallFileChange(ev) {
  const file = ev?.target?.files?.[0];
  if (!file) return;
  file
    .text()
    .then((text) => {
      try {
        const data = JSON.parse(text);

        // Check if unified format (2-section) or legacy (3-section with practiceUnitExercise)
        if (data.practiceUnitHeader && Array.isArray(data.noteArray)) {
          const h = data.practiceUnitHeader;

          // Check if legacy format (has practiceUnitExercise section)
          if (data.practiceUnitExercise) {
            // Convert legacy to unified
            const ex = data.practiceUnitExercise;
            h.contentType = ex.exerciseType || "Passage";
            h.techniqueFocus = ex.techniqueFocus || [];
            h.tagSource = ex.tagSource || "user";
            h.repetitionCount = ex.repetitionCount || 1;
            h.sourceMusicXML = ex.sourceMusicXML || "";
            h.instrumentOverride = ex.instrument || "";
            // Ensure N/A fields are set
            h.direction = h.direction || "";
            h.startingOctave = h.startingOctave || "";
            h.numberOfOctaves = h.numberOfOctaves ?? null;
            h.rangeStart = h.rangeStart ?? null;
            h.rangeEnd = h.rangeEnd ?? null;
            h.composer = h.composer || "";
            h.sourceWork = h.sourceWork || "";
            // Remove legacy section
            delete data.practiceUnitExercise;
          }

          // Populate stores
          if (data.noteArray) {
            store.noteArray = data.noteArray.map((n) => ({ ...n }));
            testStaffStore.noteArray = data.noteArray.map((n) => ({ ...n }));
            originalNoteArray.value = data.noteArray.map((n) => ({ ...n }));
            octaveTranspositionCount.value = 0;
          }

          importedTitle.value = h.practiceName || "";
          importedKey.value = h.keySignature || "C";
          importedTime.value = h.timeSignature || "4/4";
          musicXmlFileName.value = h.sourceMusicXML || "";

          store.scaleSelections = store.scaleSelections || {};
          store.scaleSelections.key = importedKey.value;
          store.scaleSelections.timeSignature = importedTime.value;
          store.title = importedTitle.value;

          if (h.instrument) {
            store.instrument = h.instrument;
          }

          currentPracticeUnit.value = data;
          seedEditFieldsFromUnit();
          refreshCurrentUnitJson();
          exerciseName.value = importedTitle.value || "Recalled Exercise";

          alert(
            data.practiceUnitExercise
              ? "Exercise loaded (legacy format converted)"
              : "Exercise loaded (unified format)"
          );
        } else {
          alert(
            "Invalid practice unit format. Expected practiceUnitHeader and noteArray."
          );
        }
      } catch (e) {
        console.warn("[CreateExercise] Recall parse failed", e);
        alert("Failed to parse recalled JSON file.");
      }
    })
    .catch(() => alert("Failed to read recall file."));
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
    // Ensure we have a unit to save
    const unit =
      currentPracticeUnit.value || composePracticeUnit(store.noteArray || []);
    const header = unit.practiceUnitHeader || (unit.practiceUnitHeader = {});
    if (!header.practiceUnitId) {
      header.practiceUnitId = crypto.randomUUID
        ? crypto.randomUUID()
        : `guid-${Date.now()}`;
    }
    header.lastModified = new Date().toISOString();
    header.practiceUnitType = "Exercise";
    header.User = session.user.id;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: header.practiceName || exerciseName.value || "Exercise",
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };
    const { error } = await ex_upsertPracticeUnit(row);
    if (error) {
      console.warn("[CreateExercise] saveToDatabase error", error);
      alert(`Save failed: ${error.message}`);
      return;
    }
    alert("Saved to database.");
  } catch (e) {
    console.warn("[CreateExercise] saveToDatabase exception", e);
    alert("Unexpected error while saving to database.");
  }
}

// RECALL from Database - open modal to select from list
async function recallFromDatabase() {
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
      .eq("type", "Exercise")
      .order("last_modified", { ascending: false });
    if (error) {
      console.warn("[CreateExercise] recallFromDatabase error", error);
      alert(`Failed to load saved exercises: ${error.message}`);
      showRecallModal.value = false;
      return;
    }
    availableExercises.value = data || [];
  } catch (e) {
    console.warn("[CreateExercise] recallFromDatabase exception", e);
    alert("Unexpected error while loading saved exercises.");
    showRecallModal.value = false;
  } finally {
    loadingUnits.value = false;
  }
}

function loadSelectedExercise(unit) {
  try {
    if (!unit?.unit_json) {
      alert("Invalid exercise data.");
      return;
    }
    currentPracticeUnit.value = unit.unit_json;
    refreshCurrentUnitJson();
    if (Array.isArray(unit.unit_json?.noteArray)) {
      store.noteArray = unit.unit_json.noteArray.map((n) => ({ ...n }));
      testStaffStore.noteArray = unit.unit_json.noteArray.map((n) => ({
        ...n,
      }));
      originalNoteArray.value = unit.unit_json.noteArray.map((n) => ({ ...n }));
      octaveTranspositionCount.value = 0;
    }
    exerciseName.value =
      unit.unit_json?.practiceUnitHeader?.practiceName || unit.name;
    showRecallModal.value = false;
    alert(`Loaded: ${unit.name}`);
  } catch (e) {
    console.warn("[CreateExercise] loadSelectedExercise exception", e);
    alert("Failed to load exercise.");
  }
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

function describeExercise(unit) {
  try {
    const h = unit?.unit_json?.practiceUnitHeader || {};
    const inst = h?.instrument?.instrument || h?.instrument || "";
    const focus = (h?.techniqueFocus || []).join(", ");
    const parts = [];
    if (h.keySignature) parts.push(h.keySignature);
    if (h.timeSignature) parts.push(h.timeSignature);
    if (focus) parts.push(focus);
    if (inst) parts.push(`for ${inst}`);
    return parts.join(" • ");
  } catch {
    return "";
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
    // Ensure we have a unit to save
    const unit =
      currentPracticeUnit.value || composePracticeUnit(store.noteArray || []);
    const header = unit.practiceUnitHeader || (unit.practiceUnitHeader = {});

    // Always generate a new GUID
    header.practiceUnitId = crypto.randomUUID
      ? crypto.randomUUID()
      : `guid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    header.lastModified = new Date().toISOString();
    header.practiceUnitType = "Exercise";
    header.User = session.user.id;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: header.practiceName || exerciseName.value || "Exercise",
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };
    const { error } = await ex_insertNew(row); // Use insert instead of upsert to ensure new row
    if (error) {
      console.warn("[CreateExercise] saveAsNewToDatabase error", error);
      alert(`Save as New failed: ${error.message}`);
      return;
    }
    exerciseName.value = header.practiceName || exerciseName.value;
    alert(
      `Saved as new practice unit to database.\n\nName: ${header.practiceName}\nID: ${header.practiceUnitId}\n\nThis is a brand new unit separate from any previous saves.`
    );
  } catch (e) {
    console.warn("[CreateExercise] saveAsNewToDatabase exception", e);
    alert("Unexpected error while saving as new to database.");
  }
}
</script>
