import { defineStore } from "pinia";

export const useTestStaffNoteStore = defineStore("testStaffNote", {
  state: () => ({
    noteArray: [], // Array to hold staff notes (MTS-json.md compliant)
    selectedNote: null,
  }),
  actions: {
    addNote(note) {
      this.noteArray.push(note);
    },
    selectNote(note) {
      this.selectedNote = note;
    },
    clearNotes() {
      this.noteArray = [];
      this.selectedNote = null;
    },
  },
});
