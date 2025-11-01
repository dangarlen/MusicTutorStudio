<template>
  <button class="btn btn-accent" @click="editScale">
    Edit practiceUnitScale Pinia Store
  </button>
</template>
<script setup>
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
function editScale() {
  const store = useTestStaffNoteStore();
  // Prompt for all practiceUnitScale fields
  const scaleType =
    prompt("Scale Type:", store.scaleType || "Major") ||
    store.scaleType ||
    "Major";
  const direction =
    prompt("Direction:", store.direction || "ascending") ||
    store.direction ||
    "ascending";
  const rangeStart =
    prompt("Scale Range Start (e.g. C4):", store.scaleRange?.start || "") ||
    store.scaleRange?.start ||
    "";
  const rangeEnd =
    prompt("Scale Range End (e.g. C5):", store.scaleRange?.end || "") ||
    store.scaleRange?.end ||
    "";
  // Prompt for noteArray as JSON
  let noteArrayStr = JSON.stringify(store.noteArray || [], null, 2);
  noteArrayStr = prompt("Edit noteArray (JSON):", noteArrayStr) || noteArrayStr;
  let noteArray;
  try {
    noteArray = JSON.parse(noteArrayStr);
    if (!Array.isArray(noteArray))
      throw new Error("noteArray must be an array");
  } catch (err) {
    alert("Invalid noteArray JSON. Changes not applied.");
    return;
  }
  // Update Pinia store
  store.scaleType = scaleType;
  store.direction = direction;
  store.scaleRange = { start: rangeStart, end: rangeEnd };
  store.noteArray = noteArray;
  alert(
    `practiceUnitScale updated in memory!\nType: ${scaleType}\nDirection: ${direction}\nRange: ${rangeStart} - ${rangeEnd}\nnoteArray updated.`
  );
}
</script>
