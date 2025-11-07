<!-- CreatePracticeUnitView.vue: Unified viewer for both Scales and Exercises -->
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-2xl font-bold">Preview Practice Unit</span>
        <span v-if="practiceUnitType" class="badge badge-primary ml-2">{{
          practiceUnitType
        }}</span>
      </div>

      <!-- Staff Preview (shared for both types) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>{{ practiceUnitType }} Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{
              store.noteArray && store.noteArray.length > 0
                ? store.noteArray.map((n) => n.pitch).join(", ")
                : `No ${practiceUnitType.toLowerCase()} generated yet.`
            }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <StaffPreview />
        </div>
      </div>

      <!-- Details (only shown for Scales) -->
      <div
        v-if="practiceUnitType === 'Scale'"
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Scale Selector:</strong> {{ scaleSelectorText }}</div>
          <div><strong>Scale Range:</strong> {{ scaleRangeText }}</div>
          <div>
            <strong>Duration & Direction:</strong>
            {{ durationDirectionText }}
          </div>
          <div>
            <strong>Staff Formatting:</strong> {{ staffFormattingText }}
          </div>
        </div>
      </div>

      <!-- Details (only shown for Exercises) -->
      <div
        v-else-if="practiceUnitType === 'Exercise'"
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Title:</strong> {{ exerciseTitle }}</div>
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Key Signature:</strong> {{ exerciseKeySignature }}</div>
          <div>
            <strong>Time Signature:</strong> {{ exerciseTimeSignature }}
          </div>
          <div><strong>Tempo:</strong> {{ exerciseTempo }} bpm</div>
          <div v-if="exerciseTechniqueFocus.length > 0">
            <strong>Technique Focus:</strong>
            {{ exerciseTechniqueFocus.join(", ") }}
          </div>
          <div v-if="exerciseSourceMusicXML">
            <strong>Source:</strong> {{ exerciseSourceMusicXML }}
          </div>
          <div v-if="exerciseSourceURL">
            <strong>Source URL:</strong>
            <a
              :href="exerciseSourceURL"
              target="_blank"
              class="link link-primary"
              >{{ exerciseSourceURL }}</a
            >
          </div>
          <div><strong>Note Count:</strong> {{ noteCount }}</div>
        </div>
      </div>

      <!-- 💾 Practice Unit Snapshot Manager -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
          <span>💾 Practice Unit Snapshot Manager</span>
        </div>
        <div class="collapse-content px-4">
          <!-- User Help Note -->
          <div
            class="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm text-gray-700"
          >
            <strong class="text-blue-800">Save/Update Options:</strong>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong>SAVE to Database</strong> –
                <span v-if="!store.practiceUnitHeader?.practiceUnitId"
                  >Creates a new record (first time)</span
                ><span v-else>Disabled after first save</span>.
              </li>
              <li>
                <strong>UPDATE in Database</strong> –
                <span v-if="store.practiceUnitHeader?.practiceUnitId"
                  >Updates the existing record (after first save)</span
                ><span v-else>Disabled until first save</span>.
              </li>
              <li>
                <strong>SAVE as New</strong> – Always creates a brand new copy
                with a fresh ID. Use to make a variation or backup.
              </li>
              <li>
                <strong>Export/Import JSON</strong> – Download or upload
                practice units as standalone files for sharing or backup outside
                the database.
              </li>
            </ul>
          </div>
          <div class="flex gap-4 mb-4 flex-wrap">
            <button class="btn btn-warning" @click="exportToJson">
              Export to JSON file
            </button>
            <button
              class="mtsFormatCreatorButtons flex items-center gap-2 mt-4"
              @click="triggerImportFileDialog"
            >
              <span
                class="material-symbols-outlined align-middle mr-2"
                aria-hidden="true"
                >upload_file</span
              >
              Import from JSON file
            </button>
            <input
              ref="importFileInput"
              type="file"
              accept="application/json"
              style="display: none"
              @change="handleImportFileChange"
            />
            <button
              class="btn btn-primary mt-4"
              @click="saveToDatabase"
              :disabled="store.practiceUnitHeader?.practiceUnitId"
            >
              SAVE to Database
            </button>
            <button
              class="btn btn-primary mt-4"
              @click="saveToDatabase"
              v-if="store.practiceUnitHeader?.practiceUnitId"
            >
              UPDATE in Database
            </button>
            <button class="btn btn-accent mt-4" @click="saveAsNewToDatabase">
              SAVE as New
            </button>
            <button class="btn btn-outline mt-4" @click="openRecallModal">
              RECALL from Database
            </button>
          </div>
        </div>
      </div>

      <!-- Recall Modal -->
      <div v-if="showRecallModal" class="modal modal-open">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-3">
            Select {{ practiceUnitType }} to Recall
          </h3>
          <div class="form-control mb-3">
            <input
              type="text"
              class="input input-bordered w-full"
              :placeholder="
                practiceUnitType === 'Scale'
                  ? 'Filter by name, key, type, or instrument...'
                  : 'Filter by name, key, time, focus, or instrument...'
              "
              v-model="recallFilterText"
            />
          </div>
          <div v-if="loadingUnits" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <div
            v-else-if="availableUnits.length === 0"
            class="py-8 text-center text-gray-500"
          >
            No saved {{ practiceUnitType.toLowerCase() }}s found for your
            account.
          </div>
          <div
            v-else-if="filteredUnits.length === 0"
            class="py-8 text-center text-gray-500"
          >
            No matches for "{{ recallFilterText }}".
          </div>
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="unit in filteredUnits"
              :key="unit.practice_unit_id"
              class="card bg-base-100 border hover:border-primary cursor-pointer transition-all"
              @click="loadSelectedUnit(unit)"
            >
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-semibold">{{ unit.name }}</h4>
                    <p class="text-sm text-gray-500">
                      {{ describeUnit(unit) }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(unit.last_modified) }}
                    </p>
                  </div>
                  <span class="badge badge-primary">{{ unit.type }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <button class="btn" @click="showRecallModal = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Behind the Curtain: JSON viewer (shared for both types) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Behind the Curtain: practiceUnit.json</span>
        </div>
        <div class="collapse-content px-4">
          <pre
            class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96"
            >{{ formattedJson }}</pre
          >
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
import { onMounted, computed, ref } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import supabase from "../scripts/supabaseClient.js";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import StaffPreview from "./StaffPreview.vue";

const store = usePracticeUnitScaleStore();

// ----- Snapshot Manager State -----
const showRecallModal = ref(false);
const availableUnits = ref([]);
const loadingUnits = ref(false);
const recallFilterText = ref("");
const importFileInput = ref(null);

// ----- Supabase Helper Functions -----
async function upsertPracticeUnit(row) {
  const { error } = await supabase
    .from("practice_units")
    .upsert(row, { onConflict: "practice_unit_id" });
  return { error };
}

async function insertNewPracticeUnit(row) {
  const { error } = await supabase.from("practice_units").insert(row);
  return { error };
}

onMounted(async () => {
  await store.loadInstruments();
});

// ----- Determine Practice Unit Type -----
const practiceUnitType = computed(() => {
  return store.practiceUnitHeader?.practiceUnitType || "Scale";
});

// ----- Shared computed properties -----
const instrumentName = computed(() => {
  const inst = store.practiceUnitHeader?.instrument || store.instrument;
  if (!inst) return "Unknown";
  return inst.instrument || "Unknown";
});

const noteCount = computed(() => {
  return store.noteArray?.length || 0;
});

const formattedJson = computed(() => {
  return JSON.stringify(
    {
      practiceUnitHeader: store.practiceUnitHeader,
      noteArray: store.noteArray,
    },
    null,
    2
  );
});

// ----- Scale-specific computed properties -----
const cap = (s) =>
  typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;

const scaleSelectorText = computed(() => {
  const sel = store.scaleSelections || {};
  return `${sel.key || "C"} ${cap(sel.scaleType || "major")} Scale`;
});

const scaleRangeText = computed(() => {
  const sel = store.scaleSelections || {};
  const n = Number(sel.octaveCount) || 1;
  const plural = n === 1 ? "octave" : "octaves";
  return `${n} ${plural} starting at ${sel.startingOctave || "C4"}`;
});

const durationDirectionText = computed(() => {
  const sel = store.scaleSelections || {};
  const dir = sel.direction || "Ascending";
  const map = {
    whole: "Whole",
    half: "Half",
    quarter: "Quarter",
    eighth: "Eighth",
  };
  const dur = map[sel.noteDuration] || cap(sel.noteDuration || "Quarter");
  return `${dir} ${dur} Note Scale`;
});

const staffFormattingText = computed(() => {
  const so =
    (store.scaleSelections && store.scaleSelections.staffOptions) || {};
  const parts = [];
  if (so.keySignature) parts.push("Key Signature");
  if (so.barLines) parts.push("Bar Lines");
  if (so.timeSignature) parts.push("Time Signature");
  if (so.accidentals) parts.push("Accidentals");
  let family = "";
  switch (so.accidentalFamily) {
    case "auto-key":
      family = "Auto: Based on Key";
      break;
    case "auto-direction":
      family = "Auto: Based on Asc/Desc";
      break;
    case "force-sharps":
      family = "Force: Sharps";
      break;
    case "force-flats":
      family = "Force: Flats";
      break;
  }
  return parts.join(", ") + (family ? `, ${family}` : "");
});

// ----- Exercise-specific computed properties -----
const exerciseTitle = computed(() => {
  return store.practiceUnitHeader?.practiceName || "Untitled Exercise";
});

const exerciseKeySignature = computed(() => {
  return store.practiceUnitHeader?.keySignature || "C";
});

const exerciseTimeSignature = computed(() => {
  return store.practiceUnitHeader?.timeSignature || "4/4";
});

const exerciseTempo = computed(() => {
  return store.practiceUnitHeader?.tempo || 80;
});

const exerciseTechniqueFocus = computed(() => {
  return store.practiceUnitHeader?.techniqueFocus || [];
});

const exerciseSourceMusicXML = computed(() => {
  return store.practiceUnitHeader?.sourceMusicXML || "";
});

const exerciseSourceURL = computed(() => {
  return store.practiceUnitHeader?.sourceURL || "";
});

// ----- Snapshot Manager Functions -----

// Smart default name generator based on practice unit type
const defaultPracticeUnitName = computed(() => {
  const header = store.practiceUnitHeader;

  // If already named, use that
  if (header?.practiceName) {
    return header.practiceName;
  }

  // Generate type-specific default
  if (practiceUnitType.value === "Scale") {
    // For scales: "C Major Scale for Euphonium"
    const inst = header?.instrument;
    const shortName =
      inst?.instrument?.split(",")[0]?.trim() || "Unknown Instrument";
    const sel = store.scaleSelections || {};
    const typeCased = sel.scaleType
      ? sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1)
      : "Major";
    const key = sel.key || header?.keySignature || "C";
    return `${key} ${typeCased} Scale for ${shortName}`;
  } else {
    // For exercises: use sourceTitle or "Exercise for Euphonium"
    const inst = header?.instrument;
    const shortName =
      inst?.instrument?.split(",")[0]?.trim() || "Unknown Instrument";
    const sourceTitle = header?.sourceTitle;

    if (sourceTitle) {
      return `${sourceTitle} for ${shortName}`;
    }

    // Fallback
    return `Exercise for ${shortName}`;
  }
});

// Filtered units for recall modal
const filteredUnits = computed(() => {
  const q = (recallFilterText.value || "").trim().toLowerCase();
  const items = availableUnits.value || [];
  if (!q) return items;
  return items.filter((u) => {
    try {
      const h = u?.unit_json?.practiceUnitHeader || {};
      const inst = h?.instrument?.instrument || h?.instrument || "";
      const focus = (h?.techniqueFocus || []).join(" ");
      const parts = [
        u?.name,
        u?.type,
        h?.keySignature,
        h?.timeSignature,
        h?.contentType,
        focus,
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

// Export to JSON file
function exportToJson() {
  try {
    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    // Use smart default name generator
    let name = globalThis.prompt(
      "Enter Practice Unit Name:",
      defaultPracticeUnitName.value
    );
    if (!name) return;

    header.practiceName = name;

    const json = JSON.stringify(unit, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MTS-Practice Unit ${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn("[CreatePracticeUnitView] exportToJson failed", e);
    alert("Failed to export practice unit.");
  }
}

// Trigger file import dialog
function triggerImportFileDialog() {
  if (importFileInput.value) {
    importFileInput.value.click();
  }
}

// Handle file import
async function handleImportFileChange(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.practiceUnitHeader && Array.isArray(data.noteArray)) {
      store.loadPracticeUnit(data);
      alert(`Loaded ${practiceUnitType.value} from file: ${file.name}`);
    } else {
      alert(
        "Invalid practice unit format. Expected practiceUnitHeader and noteArray."
      );
    }
  } catch (e) {
    console.warn("[CreatePracticeUnitView] Import parse failed", e);
    alert("Failed to parse JSON file.");
  }
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

    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    if (!header.practiceUnitId) {
      header.practiceUnitId = crypto.randomUUID
        ? crypto.randomUUID()
        : `guid-${Date.now()}`;
    }
    header.lastModified = new Date().toISOString();
    header.User = session.user.id;

    // Ensure practice unit type is set
    if (!header.practiceUnitType) {
      header.practiceUnitType = practiceUnitType.value;
    }

    // Use smart default name if not already set
    const nameToUse = header.practiceName || defaultPracticeUnitName.value;
    header.practiceName = nameToUse;

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
      console.warn("[CreatePracticeUnitView] saveToDatabase error", error);
      alert(`Save failed: ${error.message}`);
      return;
    }
    alert("Saved to database.");
  } catch (e) {
    console.warn("[CreatePracticeUnitView] saveToDatabase exception", e);
    alert("Unexpected error while saving to database.");
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

    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    // Always generate a new GUID
    header.practiceUnitId = crypto.randomUUID
      ? crypto.randomUUID()
      : `guid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    header.lastModified = new Date().toISOString();
    header.User = session.user.id;

    // Ensure practice unit type is set
    if (!header.practiceUnitType) {
      header.practiceUnitType = practiceUnitType.value;
    }

    // Use smart default name if not already set
    const nameToUse = header.practiceName || defaultPracticeUnitName.value;
    header.practiceName = nameToUse;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: nameToUse,
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };

    const { error } = await insertNewPracticeUnit(row);
    if (error) {
      console.warn("[CreatePracticeUnitView] saveAsNewToDatabase error", error);
      alert(`Save as New failed: ${error.message}`);
      return;
    }

    alert(
      `Saved as new practice unit to database.\n\nName: ${header.practiceName}\nID: ${header.practiceUnitId}\n\nThis is a brand new unit separate from any previous saves.`
    );
  } catch (e) {
    console.warn("[CreatePracticeUnitView] saveAsNewToDatabase exception", e);
    alert("Unexpected error while saving as new to database.");
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

    // Query for ALL practice units (both Scales and Exercises)
    const { data, error } = await supabase
      .from("practice_units")
      .select("practice_unit_id, name, type, last_modified, unit_json")
      .eq("user_id", session.user.id)
      .order("last_modified", { ascending: false });

    if (error) {
      console.warn("[CreatePracticeUnitView] openRecallModal error", error);
      alert(`Failed to load saved practice units: ${error.message}`);
      showRecallModal.value = false;
      return;
    }

    availableUnits.value = data || [];
  } catch (e) {
    console.warn("[CreatePracticeUnitView] openRecallModal exception", e);
    alert(
      `Unexpected error while loading saved ${practiceUnitType.value.toLowerCase()}s.`
    );
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
    showRecallModal.value = false;
    alert(`Loaded: ${unit.name}`);
  } catch (e) {
    console.warn("[CreatePracticeUnitView] loadSelectedUnit exception", e);
    alert("Failed to load practice unit.");
  }
}

// Format timestamp for display
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Helper: get instrument short name
function getInstrumentShortName(inst) {
  if (!inst || !inst.instrument) return "Unknown Instrument";
  return inst.instrument.split(",")[0].trim();
}

// Compose a compact, descriptive summary for a saved unit
function describeUnit(unit) {
  try {
    const h = unit?.unit_json?.practiceUnitHeader || {};
    const shortInst = getInstrumentShortName(h.instrument);

    if (unit.type === "Scale") {
      // Scale description
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
      if (h.direction) parts.push(String(h.direction));
      if (shortInst && shortInst !== "Unknown Instrument")
        parts.push(`for ${shortInst}`);
      return parts.filter(Boolean).join(" • ");
    } else {
      // Exercise description
      const focus = (h?.techniqueFocus || []).join(", ");
      const parts = [];
      if (h.keySignature) parts.push(h.keySignature);
      if (h.timeSignature) parts.push(h.timeSignature);
      if (focus) parts.push(focus);
      if (shortInst && shortInst !== "Unknown Instrument")
        parts.push(`for ${shortInst}`);
      return parts.filter(Boolean).join(" • ");
    }
  } catch {
    return "";
  }
}
</script>
