<template>
  <button class="btn btn-warning" @click="saveToExport">
    SAVE to MTS-practiceUnitExport.json
  </button>
</template>
<script setup>
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { composePracticeUnit } from "../scripts/composePracticeUnit";
const notesStore = useTestStaffNoteStore();
const scaleStore = usePracticeUnitScaleStore();
function saveToExport() {
  // Compose MTS practiceUnit object using Pinia and current selections (includes noteColorDesignation)
  const practiceUnit = composePracticeUnit({
    scaleStore,
    notesStore,
    name: scaleStore?.title || "Untitled",
  });
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
