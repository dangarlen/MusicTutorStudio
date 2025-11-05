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
      <!-- Exercise Selection (from prototype/show-scales style) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Exercise</span>
        </div>
        <div class="collapse-content px-4 space-y-4">
          <!-- Practice Type (preset) -->
          <div class="form-control w-full max-w-md">
            <label class="label mb-1" for="practiceType"
              ><span class="label-text">Practice Type</span></label
            >
            <input
              id="practiceType"
              class="input input-bordered input-sm"
              value="Passage"
              disabled
            />
          </div>

          <!-- Exercise selector -->
          <div class="form-control w-full max-w-md">
            <label for="exerciseSelect" class="label mb-1"
              ><span class="label-text">Exercise</span></label
            >
            <select
              id="exerciseSelect"
              class="select select-bordered select-sm"
              v-model="selectedExercise"
              @change="onExerciseChange"
            >
              <option value="" disabled>Select exercise...</option>
              <option
                v-for="opt in exerciseOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

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
            <StaffPreview />
          </div>
        </div>
      </div>

      <!-- Import MusicXML -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Import MusicXML</span>
        </div>
        <div class="collapse-content px-4 space-y-3">
          <p class="text-sm text-gray-600">
            Choose a .musicxml or .xml file. We will parse title, key, time, and
            convert notes to simple tokens (SPN + w|h|q|e|s). Dots are currently
            flattened to the base duration for MVP.
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

      <!-- Behind the Curtain: current practice unit JSON -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
          Behind the Curtain: currentPracticeUnit.json
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
import { ref } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";

const store = usePracticeUnitScaleStore();
const testStaffStore = useTestStaffNoteStore();

// Dropdown options sourced from public/alpha-vue-SPA/data/practicePassages
const exerciseOptions = [
  { value: "danny-boy.json", label: "Danny Boy" },
  { value: "king-of-the-road.json", label: "King of the Road" },
  {
    value: "twinkle-twinkle-little-star.json",
    label: "Twinkle Twinkle Little Star",
  },
];
const selectedExercise = ref("");

const importedTitle = ref("");
const importedKey = ref("");
const importedTime = ref("");
const importError = ref("");

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

function onExerciseChange() {
  if (!selectedExercise.value) return;
  const url = `${import.meta.env.BASE_URL}data/practicePassages/${
    selectedExercise.value
  }`;
  fetch(url)
    .then((r) => r.json())
    .then((data) => importExerciseJson(data))
    .catch((e) => console.warn("[CreateExercise] Import failed", e));
}

function importExerciseJson(data) {
  try {
    const parsed = parseSimplePassageJson(data);
    importedTitle.value = parsed.title;
    importedKey.value = parsed.keySignature;
    importedTime.value = parsed.timeSignature;
    // Load into both stores for preview + data store
    store.noteArray = parsed.noteArray;
    testStaffStore.noteArray = parsed.noteArray.map((n) => ({ ...n }));
    // Seed minimal scaleSelections for rendering context
    store.scaleSelections = store.scaleSelections || {};
    store.scaleSelections.key = importedKey.value || "C";
    store.scaleSelections.timeSignature = importedTime.value || "4/4";
    store.title = importedTitle.value || "Exercise";

    // Compose a basic practice unit locally
    currentPracticeUnit.value = composePracticeUnit(parsed.noteArray);
    // Seed edit fields from current unit
    seedEditFieldsFromUnit();
    refreshCurrentUnitJson();
  } catch (e) {
    console.warn("[CreateExercise] Transform failed", e);
  }
}

function parseSimplePassageJson(data) {
  const title = String(data?.title || "");
  const keySignature = String(data?.keySignature || "");
  const timeSignature = String(data?.timeSignature || "4/4");
  const measures = Array.isArray(data?.measures) ? data.measures : [];
  const out = [];
  for (const m of measures) {
    const notes = Array.isArray(m?.notes) ? m.notes : [];
    for (const tok of notes) {
      const [p, dRaw] = String(tok).split(":");
      if (!p || !dRaw) continue;
      if (p.toLowerCase() === "rest") continue; // skip rests for now
      // Accept w|h|q|e|s with optional dot suffix for dotted (+1/2 base)
      const mDur = String(dRaw).match(/^([whqes])(\.)?$/);
      if (!mDur) continue;
      const d = mDur[1] + (mDur[2] || "");
      out.push({ pitch: p, duration: d });
    }
  }
  return { title, keySignature, timeSignature, noteArray: out };
}

// MusicXML import
function onMusicXmlFile(ev) {
  importError.value = "";
  const file = ev?.target?.files?.[0];
  if (!file) return;
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
        store.noteArray = parsed.noteArray;
        testStaffStore.noteArray = parsed.noteArray.map((n) => ({ ...n }));
        store.scaleSelections = store.scaleSelections || {};
        store.scaleSelections.key = importedKey.value;
        store.scaleSelections.timeSignature = importedTime.value;
        store.title = importedTitle.value;

        currentPracticeUnit.value = composePracticeUnit(parsed.noteArray);
        // carry over imported header fields
        currentPracticeUnit.value.practiceUnitHeader.practiceName =
          importedTitle.value;
        currentPracticeUnit.value.practiceUnitHeader.keySignature =
          importedKey.value;
        currentPracticeUnit.value.practiceUnitHeader.timeSignature =
          importedTime.value;
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
      practiceUnitId: "temp-id",
      practiceUnitType: "Exercise",
      lastModified: new Date().toISOString(),
      tempo: 80,
      keySignature: importedKey.value || "C",
      timeSignature: importedTime.value || "4/4",
      instrument: store.instrument || {},
      sourceURL: "",
    },
    practiceUnitExercise: {
      exerciseType: "Passage",
      techniqueFocus: [],
      repetitionCount: 1,
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

function seedEditFieldsFromUnit() {
  const h = currentPracticeUnit.value?.practiceUnitHeader || {};
  const ex = currentPracticeUnit.value?.practiceUnitExercise || {};
  editPracticeName.value = h.practiceName || "Imported Exercise";
  editTempo.value = Number(h.tempo || 80);
  editReps.value = Number(ex.repetitionCount || 1);
  editFocus.value = (ex.techniqueFocus || []).join(", ");
  editSourceURL.value = h.sourceURL || "";
}

function applyEdits() {
  if (!currentPracticeUnit.value) return;
  const h = currentPracticeUnit.value.practiceUnitHeader;
  const ex = currentPracticeUnit.value.practiceUnitExercise;
  h.practiceName = editPracticeName.value || h.practiceName;
  h.tempo = Number(editTempo.value) || 80;
  h.sourceURL = editSourceURL.value || "";
  ex.repetitionCount = Number(editReps.value) || 1;
  ex.techniqueFocus = (editFocus.value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  refreshCurrentUnitJson();
}
</script>
