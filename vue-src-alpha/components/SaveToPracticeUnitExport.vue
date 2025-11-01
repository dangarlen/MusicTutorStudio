<template>
  <button class="btn btn-warning" @click="saveToExport">
    SAVE to MTS-practiceUnitExport.json
  </button>
</template>
<script setup>
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
const store = useTestStaffNoteStore();
function saveToExport() {
  // Compose MTS practiceUnit object using Pinia and defaults
  const practiceUnit = {
    practiceUnitHeader: {
      practiceName: "Untitled",
      practiceUnitId: "guid-placeholder",
      lastModified: new Date().toISOString(),
      practiceUnitType: "Scale",
      tempo: 120,
      keySignature: "C",
      timeSignature: "4/4",
      instrument: {},
      staffDisplayOptions: {},
      sourceURL: "",
      noteColorDesignation: {},
    },
    practiceUnitScale: {
      scaleType: "Major",
      scaleRange: {},
      direction: "ascending",
    },
    noteArray: store.noteArray || [],
  };
  const dataStr = JSON.stringify(practiceUnit, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "MTS-practiceUnitExport.json";
  a.click();
  URL.revokeObjectURL(url);
}
</script>
