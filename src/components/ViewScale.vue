<!-- ViewScale.vue: initially cloned from CreateScaleView.vue to decouple routes -->
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-2xl font-bold">View Scale</span>
      </div>
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
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
      <!-- New: Scale Details panel under Scale Preview -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Scale Details</span>
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
    </div>
    <FooterStandard />
  </div>
</template>
<script setup>
import { onMounted, computed } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import StaffPreview from "./StaffPreview.vue";

const store = usePracticeUnitScaleStore();

onMounted(async () => {
  await store.loadInstruments();
});

// ----- Scale Details computed strings -----
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
</script>
