<template>
  <div>
    <label class="block mb-2" for="fileInput"
      >Step 1: Choose a JSON file to import</label
    >
    <input
      id="fileInput"
      type="file"
      accept="application/json"
      @change="onFileSelected"
      ref="fileInput"
      class="mb-2"
    />
    <div v-if="selectedFile && selectedFile.name">
      <label class="block mb-2" for="importBtn"
        >Step 2: Click IMPORT to load into Pinia</label
      >
      <button id="importBtn" class="btn btn-secondary" @click="importJson">
        IMPORT MTS-practiceUnitExport.json to Pinia
      </button>
      <span class="ml-2">Selected: {{ selectedFile.name }}</span>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
const fileInput = ref(null);
const selectedFile = ref(null);

function onFileSelected(e) {
  selectedFile.value = e.target.files[0] || null;
}

function importJson() {
  const file = selectedFile.value;
  if (!file) {
    alert("No file selected.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const json = JSON.parse(evt.target.result);
      const store = useTestStaffNoteStore();
      if (json.noteArray) {
        store.noteArray = json.noteArray;
        alert("Imported noteArray to Pinia!");
      } else {
        alert("Invalid file: noteArray missing");
      }
    } catch (err) {
      alert("Error parsing JSON: " + err);
    }
  };
  reader.readAsText(file);
}
</script>
