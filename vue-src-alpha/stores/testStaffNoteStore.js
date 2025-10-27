import { defineStore } from "pinia";

export const useTestStaffNoteStore = defineStore("testStaffNote", {
  state: () => ({
    notes: [], // Array to hold staff notes
    selectedNote: null,
  }),
  actions: {
    addNote(note) {
      this.notes.push(note);
    },
    selectNote(note) {
      this.selectedNote = note;
    },
    clearNotes() {
      this.notes = [];
      this.selectedNote = null;
    },
  },
});
