<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
  <span class="text-2xl">Practice</span>
      </div>

      <!-- Scale Preview START -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{
              store.noteArray && store.noteArray.length > 0
                ? store.noteArray.map((n) => n.pitch).join(", ")
                : "No scale generated yet."
            }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <StaffPreview
            :practice-overlay-mode="overlayDisplayOption"
            :practice-overlay-tooltip-only="overlayTooltipOnly"
            :practice-enable-click-to-cycle="true"
            :practice-color-cycle="noteColors.map((c) => c.color)"
          />
        </div>
      </div>
      <!-- Scale Preview END -->

      <!-- Note Colors -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Note Colors</span>
        </div>
        <div class="collapse-content px-4">
          <div class="mb-3 text-gray-700 text-sm">
            Each color below is used to highlight notes in the scale. You can
            type a personal meaning for each color (e.g. "too high for me to
            reach", "can't remember fingering").
          </div>
          <div class="flex flex-wrap gap-4 mb-4">
            <div
              v-for="(c, idx) in noteColors"
              :key="c.color"
              class="flex items-center gap-3 border rounded p-2 bg-white"
            >
              <div
                class="w-8 h-8 rounded border"
                :style="{ backgroundColor: c.color }"
                :title="c.color"
              ></div>
              <span
                class="badge border"
                :style="{
                  backgroundColor: c.color,
                  color: getTextColor(c.color),
                }"
                :title="c.color"
              >
                {{ c.name }}
              </span>
              <input
                class="input input-sm input-bordered w-64"
                type="text"
                :placeholder="`Meaning for ${c.name}`"
                v-model="c.meaning"
              />
            </div>
          </div>
          <button
            class="btn btn-outline btn-error btn-sm flex items-center gap-2"
            @click="resetColorsAndNotes"
          >
            <span class="material-symbols-outlined">restart_alt</span>
            Reset Colors
          </button>
        </div>
      </div>

      <!-- Practice Overlays -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Practice Overlays</span>
        </div>
        <div class="collapse-content px-4">
          <div class="space-y-3 text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="overlayTooltipOnly" />
              Show overlays as note tooltip ONLY
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="none"
                  v-model="overlayDisplayOption"
                />
                Notes ONLY
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="names"
                  v-model="overlayDisplayOption"
                />
                Note Names
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="pitch"
                  v-model="overlayDisplayOption"
                />
                Scientific Pitch Notation (SPN)
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="cmt"
                  v-model="overlayDisplayOption"
                />
                Compact Music Token (CMT)
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="midi"
                  v-model="overlayDisplayOption"
                />
                MIDI Note Number
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="fingering"
                  v-model="overlayDisplayOption"
                />
                Standard Fingering
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="display-option"
                  value="fingering-alt"
                  v-model="overlayDisplayOption"
                />
                Fingering with alternates
              </label>
            </div>
          </div>
        </div>
      </div>
      <!-- Scale Preview (copied from ViewScale) -->

      <!-- Scale Details (copied from ViewScale) -->
      <div
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

      <!-- Behind the Curtain (copied from ViewScale) -->
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
            >{{ JSON.stringify(practiceUnitPreview, null, 2) }}</pre
          >
        </div>
      </div>

      <PracticeReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import PracticeReturn from "./PracticeReturn.vue";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import StaffPreview from "./StaffPreview.vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import { computed, onMounted, reactive, watch, ref } from "vue";
import { composePracticeUnit } from "../scripts/composePracticeUnit";

const store = usePracticeUnitScaleStore();
const testStaffStore = useTestStaffNoteStore();
onMounted(async () => {
  await store.loadInstruments();
  // Ensure note arrays exist and initial sync for StaffPreview rendering
  if (!Array.isArray(store.noteArray)) {
    store.noteArray = [];
  }
  if (
    !Array.isArray(testStaffStore.noteArray) ||
    testStaffStore.noteArray.length === 0
  ) {
    if (Array.isArray(store.noteArray) && store.noteArray.length > 0) {
      testStaffStore.noteArray = store.noteArray.map((n) => ({ ...n }));
    } else {
      testStaffStore.noteArray = [];
    }
  }
  // Best-effort: initialize instrument from cookie if not set (to enable fingering lookups)
  try {
    if (
      !store.instrument &&
      Array.isArray(store.instruments) &&
      store.instruments.length
    ) {
      const parts = document.cookie.split(";").map((s) => s.trim());
      const prefix = "instrument=";
      let cookieInstrument = "";
      for (const p of parts) {
        if (p.startsWith(prefix)) {
          cookieInstrument = decodeURIComponent(p.slice(prefix.length));
          break;
        }
      }
      if (cookieInstrument) {
        // Try exact match first
        let match = store.instruments.find(
          (i) => i.instrument === cookieInstrument
        );
        // Fallback: case-insensitive contains/startsWith
        if (!match) {
          const ci = cookieInstrument.toLowerCase();
          match = store.instruments.find(
            (i) =>
              typeof i.instrument === "string" &&
              (i.instrument.toLowerCase() === ci ||
                i.instrument.toLowerCase().startsWith(ci) ||
                i.instrument.toLowerCase().includes(ci))
          );
        }
        if (match) store.instrument = match;
      }
      // Last resort: if only one instrument has non-empty fingering, choose it
      if (!store.instrument) {
        const withFing = store.instruments.filter(
          (i) => i && i.fingering && Object.keys(i.fingering).length > 0
        );
        if (withFing.length === 1) store.instrument = withFing[0];
      }
    }
  } catch {}
  // Initialize overlay controls: prefer practiceUnitHeader-stored overlays (so settings travel with units),
  // otherwise fall back to legacy localStorage.
  try {
    const hdr = store.practiceUnitHeader?.staffDisplayOptions?.overlays;
    if (hdr) {
      overlayTooltipOnly.value = !!hdr.tooltipOnly;
      overlayDisplayOption.value = String(hdr.displayOption || 'none');
    } else {
      loadOverlaySettings();
    }
  } catch (e) { loadOverlaySettings(); }
});

// Determine readable text color for DaisyUI badge backgrounds
function getTextColor(color) {
  try {
    const c = String(color).toLowerCase();
    // For our known named colors, prefer white text on darker hues
    if (["black", "blue", "green", "purple", "red", "brown"].includes(c))
      return "#ffffff";
    if (["orange", "gray", "grey", "yellow", "white"].includes(c))
      return "#000000";
  } catch {}
  return "#000000";
}

// --- Note Colors state & persistence (localStorage key: noteColorMeanings) ---
// Use human-readable named colors with swatches, similar to prototype UI
const DEFAULT_NOTE_COLOR_ITEMS = [
  { name: "Black", color: "black" },
  { name: "Blue", color: "blue" },
  { name: "Orange", color: "orange" },
  { name: "Green", color: "green" },
  { name: "Purple", color: "purple" },
  { name: "Red", color: "red" },
  { name: "Brown", color: "brown" },
  { name: "Gray", color: "gray" },
];

const noteColors = reactive(
  DEFAULT_NOTE_COLOR_ITEMS.map((it) => ({ ...it, meaning: "" }))
);

function loadNoteColorMeanings() {
  try {
    const raw = localStorage.getItem("noteColorMeanings");
    if (!raw) return;
    const obj = JSON.parse(raw) || {};
    for (const nc of noteColors) {
      if (typeof obj[nc.color] === "string") nc.meaning = obj[nc.color];
    }
  } catch {}
}

function saveNoteColorMeanings() {
  const obj = {};
  for (const nc of noteColors) obj[nc.color] = nc.meaning || "";
  try {
    localStorage.setItem("noteColorMeanings", JSON.stringify(obj));
  } catch {}
}

function resetNoteColors() {
  for (const nc of noteColors) nc.meaning = "";
  saveNoteColorMeanings();
}

// Clear all color meanings AND set every note's color to black in both stores
function resetColorsAndNotes() {
  // 1) Clear meanings and persist localStorage
  resetNoteColors();
  // 2) Force schema mapping to clear in header (noteColorDesignation)
  syncNoteColorDesignationToStore();
  // 3) Set all note colors to black in both arrays (trigger re-render)
  try {
    if (Array.isArray(testStaffStore.noteArray)) {
      testStaffStore.noteArray = testStaffStore.noteArray.map((n) => ({
        ...n,
        noteColor: "black",
      }));
    }
  } catch {}
  try {
    if (Array.isArray(store.noteArray)) {
      store.noteArray = store.noteArray.map((n) => ({
        ...n,
        noteColor: "black",
      }));
    }
  } catch {}
}

loadNoteColorMeanings();
watch(
  () => noteColors.map((n) => n.meaning),
  () => saveNoteColorMeanings(),
  { deep: true }
);

// Sync schema-compliant instructional mapping into the store for export
function syncNoteColorDesignationToStore() {
  const allowed = new Set(["red", "blue", "green", "orange", "gray", "purple"]); // 'black' excluded
  const mapping = {};
  for (const nc of noteColors) {
    const key = String(nc.color || "").toLowerCase();
    if (allowed.has(key)) {
      const val = typeof nc.meaning === "string" ? nc.meaning.trim() : "";
      if (val) mapping[key] = val;
    }
  }
  store.setNoteColorDesignation(mapping);
}

// Initial sync and on changes
syncNoteColorDesignationToStore();
watch(
  () => noteColors.map((n) => ({ color: n.color, meaning: n.meaning })),
  () => syncNoteColorDesignationToStore(),
  { deep: true }
);

// Keep StaffPreview input array present and loosely synced from practice store
watch(
  () => store.noteArray,
  (arr) => {
    if (!Array.isArray(arr)) {
      store.noteArray = [];
      return;
    }
    // Initialize test store if empty (do not overwrite user edits once present)
    if (
      !Array.isArray(testStaffStore.noteArray) ||
      testStaffStore.noteArray.length === 0
    ) {
      testStaffStore.noteArray = arr.map((n) => ({ ...n }));
    }
  },
  { deep: true, immediate: true }
);

// --- Practice Overlays state (persist locally to avoid affecting other routes) ---
const overlayTooltipOnly = ref(false);
const overlayDisplayOption = ref("none");

const OVERLAY_KEY = "practiceScales.overlay";
function loadOverlaySettings() {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) || {};
    if (typeof obj.tooltipOnly === "boolean")
      overlayTooltipOnly.value = obj.tooltipOnly;
    if (typeof obj.displayOption === "string")
      overlayDisplayOption.value = obj.displayOption;
  } catch {}
}
function saveOverlaySettings() {
  const obj = {
    tooltipOnly: overlayTooltipOnly.value,
    displayOption: overlayDisplayOption.value,
  };
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(obj));
    // Persist into practiceUnitHeader so overlays travel with exported units
    try {
      if (!store.practiceUnitHeader) store.practiceUnitHeader = {};
      if (!store.practiceUnitHeader.staffDisplayOptions) store.practiceUnitHeader.staffDisplayOptions = {};
      store.practiceUnitHeader.staffDisplayOptions.overlays = {
        displayOption: String(overlayDisplayOption.value || 'none'),
        tooltipOnly: !!overlayTooltipOnly.value,
        enableClickToCycle: true,
      };
    } catch (e) { /* ignore */ }
  } catch {}
}
loadOverlaySettings();
watch([overlayTooltipOnly, overlayDisplayOption], saveOverlaySettings);

const instrumentName = computed(() => {
  const inst = store.instrument;
  if (!inst) return "Unknown";
  return inst.instrument || "Unknown";
});

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

// --- Behind the Curtain: full practiceUnit preview including header.noteColorDesignation ---
const practiceUnitPreview = computed(() =>
  composePracticeUnit({
    scaleStore: store,
    notesStore: testStaffStore,
    name: "Practice Scale",
  })
);
</script>
