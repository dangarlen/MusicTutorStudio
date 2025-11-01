<template>
  <div class="phase-test-container">
    <h2>Phase-Based Vue Test Container</h2>
    <div v-if="phase === 1">
      <p>Phase 1: Instrument Selection</p>
      <InstrumentDropdown
        :instruments="instruments"
        v-model="selectedInstrument"
      />
    </div>
    <div v-else-if="phase === 2">
      <p>Phase 2: Scale Configuration</p>
      <ScaleBuilder :enums="enums" v-model="scaleConfig" />
    </div>
    <div v-else-if="phase === 3">
      <p>Phase 3: Staff Note Builder</p>
      <StaffNoteBuilder v-model="noteConfig" />
    </div>
    <div v-else-if="phase === 4">
      <p>Phase 4: Data Block Preview</p>
      <pre>{{ dataBlock }}</pre>
    </div>
    <div class="phase-controls">
      [<button @click="prevPhase" :disabled="phase === 1">Previous</button>]
      [<button @click="nextPhase" :disabled="phase === 4">Next</button>]
    </div>
    <div v-if="errorMsg" class="text-red-600 mt-2">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import ScaleBuilder from "./ScaleBuilder.vue";
import StaffNoteBuilder from "./StaffNoteBuilder.vue";

const phase = ref(1);
const selectedInstrument = ref(null);
const scaleConfig = ref({});
const noteConfig = ref({ noteArray: [] });
const instruments = ref([]);
const enums = ref({});
const errorMsg = ref("");
const store = useTestStaffNoteStore();
// Sync noteConfig.notes with Pinia store.notes
watch(
  () => noteConfig.value.noteArray,
  (newNotes) => {
    if (Array.isArray(newNotes)) {
      store.noteArray = newNotes;
    }
  },
  { deep: true }
);

const dataBlock = computed(() => ({
  instrument: selectedInstrument.value,
  scale: scaleConfig.value,
  noteArray: noteConfig.value.noteArray,
}));

function nextPhase() {
  if (phase.value < 4) phase.value++;
}
function prevPhase() {
  if (phase.value > 1) phase.value--;
}

onMounted(async () => {
  try {
    const instrumentsRes = await fetch("/alpha-vue-SPA/data/instruments.json");
    if (!instrumentsRes.ok) throw new Error("Failed to fetch instruments.json");
    instruments.value = await instrumentsRes.json();
  } catch (err) {
    errorMsg.value = `Could not load c:/Dev/MusicTutorStudio/Code/public/alpha-vue-SPA/data/instruments.json.\nError: ${
      err && err.message ? err.message : err
    }`;
    instruments.value = [];
  }
  try {
    const enumsRes = await fetch("/alpha-vue-SPA/data/enums.json");
    if (!enumsRes.ok) throw new Error("Failed to fetch enums.json");
    enums.value = await enumsRes.json();
  } catch (err) {
    errorMsg.value += `\nCould not load c:/Dev/MusicTutorStudio/Code/public/alpha-vue-SPA/data/enums.json.\nError: ${
      err && err.message ? err.message : err
    }`;
    enums.value = {};
  }
});
</script>

<style scoped>
.phase-test-container {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #f9f9f9;
}
.phase-controls {
  margin-top: 1rem;
}
</style>
