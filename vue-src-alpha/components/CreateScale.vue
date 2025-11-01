<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">queue_music</span>
        <span class="text-2xl font-bold">Create Scale</span>
      </div>

      <!-- Scale Data Collapse -->
      <div
        class="collapse collapse-arrow bg-white mb-6 border-2 border-dotted border-gray-400"
      >
        <input type="checkbox" class="peer" checked />
        <div class="collapse-title font-bold text-lg flex items-center gap-2">
          🗄️ Scale Data
        </div>
        <div class="collapse-content">
          <div class="bg-base-300 p-2 rounded">
            <div v-if="isEditing">
              <textarea
                v-model="editableJson"
                class="textarea textarea-bordered w-full h-32 font-mono"
              ></textarea>
            </div>
            <div v-else>
              <pre class="font-mono text-xs">{{
                JSON.stringify(scaleSelections, null, 2)
              }}</pre>
            </div>
            <div class="flex gap-4 mt-4">
              <button
                class="btn btn-secondary"
                @click="startEdit"
                v-if="!isEditing"
              >
                Edit Data
              </button>
              <button
                class="btn btn-primary"
                @click="saveData"
                v-if="isEditing"
              >
                Update/Save Data
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreateScaleScaleSelector />
      <CreateScaleScaleRange />
      <CreateScaleScaleDurationDirection />
      <CreateScaleScaleStaffFormatting />
      <CreatorReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import CreatorReturn from "./CreatorReturn.vue";
import CreateScaleScaleSelector from "./CreateScale-ScaleSelector.vue";
import CreateScaleScaleRange from "./CreateScale-ScaleRange.vue";
import CreateScaleScaleDurationDirection from "./CreateScale-ScaleDurationDirection.vue";
import CreateScaleScaleStaffFormatting from "./CreateScale-ScaleStaffFormatting.vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";

const store = useTestStaffNoteStore();
const isEditing = ref(false);
const scaleSelections = ref({
  ScaleDefinition: {
    pitch: "C",
    scaleType: "major",
    startingOctave: "C4",
    octaveCount: 1,
    direction: "Ascending",
    noteDuration: "quarter",
  },
  staffOptions: {
    keySignature: true,
    accidentals: true,
    barLines: true,
    timeSignature: true,
    accidentalFamily: "auto-key",
  },
  noteArray: [
    { pitch: "c/4", duration: "q" },
    { pitch: "d/4", duration: "q" },
    { pitch: "e/4", duration: "q" },
    { pitch: "f/4", duration: "q" },
    { pitch: "g/4", duration: "q" },
    { pitch: "a/4", duration: "q" },
    { pitch: "b/4", duration: "q" },
    { pitch: "c/5", duration: "q" },
  ],
});
const editableJson = ref(JSON.stringify(scaleSelections.value, null, 2));

function startEdit() {
  editableJson.value = JSON.stringify(scaleSelections.value, null, 2);
  isEditing.value = true;
}
function saveData() {
  try {
    scaleSelections.value = JSON.parse(editableJson.value);
    isEditing.value = false;
  } catch (e) {
    alert("Invalid JSON format");
  }
}

watch(
  scaleSelections,
  (val) => {
    if (Array.isArray(val.noteArray)) {
      store.noteArray = val.noteArray.map((n) => ({
        key: n.pitch,
        duration: n.duration,
      }));
    }
  },
  { deep: true }
);
</script>
