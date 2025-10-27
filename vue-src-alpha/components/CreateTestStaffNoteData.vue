<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">edit_square</span>
        <span class="text-2xl font-bold">Test Staff Note Data</span>
      </div>
      <!-- Add your data UI here -->
      <CreatorReturn />
      <div>
        <h2 class="text-lg font-semibold mb-2">Raw Pinia Note Data</h2>
        <div class="bg-base-300 p-2 rounded">
          <div v-if="isEditing">
            <div
              v-for="(note, idx) in editableNotes"
              :key="idx"
              class="flex items-center gap-2 mb-2"
            >
              <input
                v-model="editableNotes[idx].key"
                class="input input-bordered input-sm w-32"
              />
              <input
                v-model="editableNotes[idx].duration"
                class="input input-bordered input-sm w-24"
              />
              <span class="text-xs text-gray-500">{{
                JSON.stringify(note)
              }}</span>
              <button class="btn btn-xs btn-error" @click="removeNote(idx)">
                Remove
              </button>
            </div>
          </div>
          <div v-else>
            <span v-for="(note, idx) in store.notes" :key="idx">
              {{ note }}
            </span>
          </div>
        </div>
        <div class="flex gap-4 mt-4">
          <button
            class="btn btn-secondary"
            @click="startEdit"
            v-if="!isEditing"
          >
            Edit Notes
          </button>
          <button class="btn btn-primary" @click="saveNotes" v-if="isEditing">
            Update/Save Notes
          </button>
        </div>
        <button class="btn btn-primary mt-4" @click="addTestNote">
          Add Test Note
        </button>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import CreatorReturn from "./CreatorReturn.vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import { ref } from "vue";

const store = useTestStaffNoteStore();
const isEditing = ref(false);
const editableNotes = ref([]);

function startEdit() {
  editableNotes.value = store.notes.map((n) => ({ ...n }));
  isEditing.value = true;
}

function saveNotes() {
  store.clearNotes();
  for (const note of editableNotes.value) {
    store.addNote({ key: note.key, duration: note.duration });
  }
  isEditing.value = false;
}

function removeNote(idx) {
  editableNotes.value.splice(idx, 1);
}

function addTestNote() {
  if (isEditing.value) {
    editableNotes.value.push({ key: "c/4", duration: "q" });
  } else {
    store.addNote({ key: "c/4", duration: "q" });
  }
}
</script>
