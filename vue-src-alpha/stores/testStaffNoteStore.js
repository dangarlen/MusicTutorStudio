import { defineStore } from "pinia";
import { useAppStateStore } from './appStateStore.js';

export const useTestStaffNoteStore = defineStore("testStaffNote", {
  state: () => ({
    noteArray: [], // Array to hold staff notes (MTS-json.md compliant)
    selectedNote: null,
    // Practice session state
    currentNoteIndex: 0,
    score: 0,
    isCorrect: null,
    feedback: "",
    showAnswer: false,
    timeLimit: 30,
    timeRemaining: 30,
    isActive: false,
    selectedAnswer: null,
    correctAnswer: null,
    practiceStartTime: null,
    practiceEndTime: null,
    sessionStats: {
      correct: 0,
      incorrect: 0,
      totalTime: 0,
      averageTime: 0
    }
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
    
    // Practice session management
    startPractice() {
      this.isActive = true;
      this.practiceStartTime = new Date();
      this.timeRemaining = this.timeLimit;
      this.resetStats();
      
      // Sync with AppState if there's an active unit
      const appState = useAppStateStore();
      if (appState.hasActiveUnit) {
        appState.updateWorkflowState({ currentStep: 'practicing', practiceActive: true });
      }
      
      console.log("[TestStaffNoteStore] Practice session started");
    },
    
    endPractice() {
      this.isActive = false;
      this.practiceEndTime = new Date();
      this.calculateSessionStats();
      
      // Sync with AppState
      const appState = useAppStateStore();
      if (appState.hasActiveUnit) {
        appState.updateWorkflowState({ 
          currentStep: 'completed', 
          practiceActive: false,
          sessionStats: { ...this.sessionStats } 
        });
      }
      
      console.log("[TestStaffNoteStore] Practice session ended", this.sessionStats);
    },
    
    resetStats() {
      this.sessionStats = {
        correct: 0,
        incorrect: 0,
        totalTime: 0,
        averageTime: 0
      };
      this.score = 0;
      this.currentNoteIndex = 0;
    },
    
    calculateSessionStats() {
      const total = this.sessionStats.correct + this.sessionStats.incorrect;
      if (total > 0 && this.practiceStartTime && this.practiceEndTime) {
        this.sessionStats.totalTime = (this.practiceEndTime - this.practiceStartTime) / 1000;
        this.sessionStats.averageTime = this.sessionStats.totalTime / total;
      }
    }
  },
});
