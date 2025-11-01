<template>
  <button class="btn btn-info" @click="recallFromPinia">
    RECALL json FROM Pinia
  </button>
</template>
<script setup>
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
function recallFromPinia() {
  const store = useTestStaffNoteStore();
  alert(JSON.stringify(store.noteArray, null, 2));
}
</script>
