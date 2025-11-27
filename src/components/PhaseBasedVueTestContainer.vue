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
  const errors = [];
  
  // Try multiple URL candidates for instruments.json
  const instrumentCandidates = [
    `${import.meta.env.BASE_URL}data/instruments.json`,
    '/data/instruments.json'
  ];
  let instrumentsLoaded = false;
  for (const url of instrumentCandidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      instruments.value = await res.json();
      instrumentsLoaded = true;
      break;
    } catch (e) { /* try next */ }
  }
  if (!instrumentsLoaded) {
    errors.push('Could not load instruments.json from any candidate path.');
    instruments.value = [];
  }

  // Try multiple URL candidates for enums.json
  const enumCandidates = [
    `${import.meta.env.BASE_URL}data/enums.json`,
    '/data/enums.json'
  ];
  let enumsLoaded = false;
  for (const url of enumCandidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      enums.value = await res.json();
      enumsLoaded = true;
      break;
    } catch (e) { /* try next */ }
  }
  if (!enumsLoaded) {
    errors.push('Could not load enums.json from any candidate path.');
    enums.value = {};
  }
  
  if (errors.length > 0) {
    errorMsg.value = errors.join('\n');
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
