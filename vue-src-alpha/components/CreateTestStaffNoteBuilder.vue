<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">edit_square</span>
        <span class="text-2xl font-bold">Test Staff Note Builder</span>
      </div>
      <CreatorReturn />
      <button class="btn btn-primary mb-4" @click="populateNotes">
        Populate Notes
      </button>
      <!-- Only build notes, do not display them here -->
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import CreatorReturn from "./CreatorReturn.vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";

const store = useTestStaffNoteStore();

function populateNotes() {
  const notes = [
    { key: "c/4", duration: "q" },
    { key: "d/4", duration: "q" },
    { key: "e/4", duration: "q" },
    { key: "f/4", duration: "q" },
    { key: "g/4", duration: "q" },
    { key: "a/4", duration: "q" },
    { key: "b/4", duration: "q" },
    { key: "c/5", duration: "q" },
  ];
  store.clearNotes();
  for (const note of notes) {
    store.addNote(note);
  }
}
</script>
