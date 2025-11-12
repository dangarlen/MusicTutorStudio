<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl">Practice Exercises</span>
      </div>

      <!-- Your Saved Practice Units (load into active memory) -->
      <div class="max-w-2xl mx-auto mb-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title">Your Saved Practice Units</h3>
            <div class="text-xs text-gray-500 mb-2">
              Filter and load a saved practice unit into Active Unit memory
            </div>

            <div v-if="lesson.error" class="alert alert-warning mb-2">
              <span>{{ lesson.error }}</span>
              <button class="btn btn-xs ml-auto" @click="lesson.fetchPracticeUnits()">
                Retry
              </button>
            </div>

            <div class="form-control mb-2">
              <input
                type="text"
                v-model="filterText"
                class="input input-bordered w-full"
                placeholder="Filter by name, type, instrument"
              />
            </div>

            <div class="textarea textarea-bordered w-full min-h-48 bg-base-200 overflow-y-auto p-0">
              <div v-if="lesson.loading" class="p-4">
                <span class="loading loading-spinner loading-md"></span>
                <span class="ml-2">Loading practice units…</span>
              </div>
              <div v-else-if="filteredUnits.length === 0" class="p-4 text-gray-500">
                No Practice Units found.
              </div>
              <ul v-else class="p-2 space-y-1">
                <li v-for="unit in filteredUnits" :key="unit.practice_unit_id">
                  <div class="flex items-center justify-between w-full p-2 rounded border" :style="'background-color: white; border-color: #e5e7eb;'">
                    <div class="flex items-center gap-2 flex-1">
                      <span class="badge badge-outline">{{ unit.type }}</span>
                      <span class="font-medium">{{ unit.name }}</span>
                      <span class="text-xs text-gray-500" v-if="instrumentLabel(unit)">• {{ instrumentLabel(unit) }}</span>
                    </div>
                    <button class="btn btn-sm btn-circle" @click="loadUnit(unit)" :title="`Load '${unit.name}' into Active Unit`">
                      <span class="material-symbols-outlined text-base">download</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Behind the Curtain: show active practiceUnit JSON -->
      <div class="max-w-2xl mx-auto mt-4">
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl">
          <input type="checkbox" class="peer" v-model="expandJson" />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>Behind the Curtain: practiceUnit.json</span>
          </div>
          <div class="collapse-content px-4">
            <pre class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96">{{ JSON.stringify(practiceUnitPreview, null, 2) }}</pre>
          </div>
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
import { ref, computed, onMounted } from "vue";
import { useLessonStore } from "../stores/lessonStore.js";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";

const lesson = useLessonStore();
const practiceStore = usePracticeUnitScaleStore();

const filterText = ref("");

function instrumentLabel(u) {
  const val = u?.instrument;
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.instrument || val.name || "";
  return "";
}

const filteredUnits = computed(() => {
  const q = (filterText.value || "").toLowerCase().trim();
  const items = lesson.availableUnits || [];
  if (!q) return items;
  return items.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const type = (u.type || "").toLowerCase();
    const inst = instrumentLabel(u).toLowerCase();
    return name.includes(q) || type.includes(q) || inst.includes(q);
  });
});

// Compose the active practice unit JSON for the 'Behind the Curtain' view
const practiceUnitPreview = computed(() => {
  try {
    // store action returns an object representing the current active unit
    return practiceStore.composePracticeUnit();
  } catch (e) {
    return {};
  }
});

// Controls whether the 'Behind the Curtain' JSON collapse is expanded
const expandJson = ref(false);

function loadUnit(unit) {
  try {
    if (!unit?.unit_json) {
      alert("Invalid practice unit data.");
      return;
    }
    practiceStore.loadPracticeUnit(unit.unit_json);
  // Do not auto-expand the JSON viewer when loading a unit — keep the
  // 'Behind the Curtain' section collapsed so users are not surprised.
    alert(`Loaded: ${unit.name}`);
  } catch (e) {
    console.warn("[PracticeExercises] loadUnit exception", e);
    alert("Failed to load practice unit.");
  }
}

onMounted(() => {
  lesson.fetchPracticeUnits().catch((e) => console.warn("Failed to load practice units", e));
});
</script>

