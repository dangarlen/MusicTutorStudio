import { defineStore } from "pinia";
import { 
  validatePracticeUnit, 
  validateActiveUnitContext, 
  createDefaultActiveUnitContext 
} from "../types/index.js";

/**
 * Unified application state store
 * Central coordinator for all app state management
 */
export const useAppStateStore = defineStore("appState", {
  state: () => ({
    /** @type {ActiveUnitContext} */
    activeUnit: createDefaultActiveUnitContext(),
    
    /** @type {WorkflowState} */
    currentWorkflow: null,
    
    /** @type {Object<string, any>} */
    navigationContext: {},
    
    /** @type {string[]} */
    recentlyPracticed: [],
    
    /** @type {boolean} */
    globalLoading: false,
    
    /** @type {string|null} */
    globalError: null,
    
    /** @type {Object} */
    userPreferences: {
      autoSaveEnabled: true,
      defaultInstrument: null,
      lastUsedInstrument: null,
    },
  }),

  getters: {
    /**
     * Whether there is an active practice unit loaded
     * @returns {boolean}
     */
    hasActiveUnit(state) {
      return !!(state.activeUnit.unit && validatePracticeUnit(state.activeUnit.unit));
    },

    /**
     * Display name for the current active unit
     * @returns {string}
     */
    activeUnitDisplayName(state) {
      if (!this.hasActiveUnit) return "No practice unit loaded";
      
      const unit = state.activeUnit.unit;
      const name = unit.practiceUnitHeader?.practiceName || "Untitled";
      const source = state.activeUnit.source;
      
      switch (source) {
        case 'quick':
          return `${name} (Quick Practice)`;
        case 'lesson':
          return `${name} (Lesson: ${state.activeUnit.sourceName || 'Unknown'})`;
        case 'saved':
          return name;
        default:
          return name;
      }
    },

    /**
     * Source indicator for the active unit
     * @returns {string}
     */
    activeUnitSource(state) {
      if (!this.hasActiveUnit) return "none";
      return state.activeUnit.source || "unknown";
    },

    /**
     * Whether the active unit has unsaved changes
     * @returns {boolean}
     */
    hasUnsavedChanges(state) {
      return this.hasActiveUnit && state.activeUnit.hasUnsavedChanges;
    },

    /**
     * Current practice mode based on active unit context
     * @returns {"quick"|"lesson"|"saved"|"none"}
     */
    practiceMode(state) {
      if (!this.hasActiveUnit) return "none";
      return state.activeUnit.source || "unknown";
    },

    /**
     * Whether currently in lesson mode
     * @returns {boolean}
     */
    isInLessonMode(state) {
      return this.practiceMode === "lesson";
    },

    /**
     * Whether currently in quick practice mode
     * @returns {boolean}
     */
    isInQuickPracticeMode(state) {
      return this.practiceMode === "quick";
    },
  },

  actions: {
    /**
     * Loads a practice unit into active context
     * @param {PracticeUnit} unit - Practice unit to load
     * @param {"quick"|"lesson"|"saved"} source - Source of the unit
     * @param {string} [sourceId] - ID of the source
     * @param {string} [sourceName] - Display name of the source
     */
    loadActiveUnit(unit, source, sourceId = null, sourceName = null) {
      console.log('[AppState] Loading active unit:', { unit, source, sourceId, sourceName });
      
      if (!validatePracticeUnit(unit)) {
        throw new Error('Invalid practice unit provided to loadActiveUnit');
      }

      this.activeUnit = {
        unit: { ...unit },
        source,
        sourceId,
        sourceName,
        hasUnsavedChanges: false,
        lastModified: new Date(),
      };

      // Add to recently practiced if not from lesson
      if (source !== 'lesson') {
        this.addToRecentlyPracticed(unit);
      }

      console.log('[AppState] Active unit loaded successfully');
    },

    /**
     * Clears the active unit
     */
    clearActiveUnit() {
      console.log('[AppState] Clearing active unit');
      this.activeUnit = createDefaultActiveUnitContext();
    },

    /**
     * Marks the active unit as having unsaved changes
     */
    markActiveUnitChanged() {
      if (this.hasActiveUnit) {
        this.activeUnit.hasUnsavedChanges = true;
        this.activeUnit.lastModified = new Date();
        console.log('[AppState] Active unit marked as changed');
      }
    },

    /**
     * Marks the active unit as saved (clears unsaved changes flag)
     */
    markActiveUnitSaved() {
      if (this.hasActiveUnit) {
        this.activeUnit.hasUnsavedChanges = false;
        console.log('[AppState] Active unit marked as saved');
      }
    },

    /**
     * Updates the active unit data
     * @param {Partial<PracticeUnit>} updates - Updates to apply
     */
    updateActiveUnit(updates) {
      if (!this.hasActiveUnit) {
        console.warn('[AppState] Cannot update active unit: no unit loaded');
        return;
      }

      // Deep merge updates
      if (updates.practiceUnitHeader) {
        this.activeUnit.unit.practiceUnitHeader = {
          ...this.activeUnit.unit.practiceUnitHeader,
          ...updates.practiceUnitHeader
        };
      }

      if (updates.noteArray) {
        this.activeUnit.unit.noteArray = [...updates.noteArray];
      }

      this.markActiveUnitChanged();
      console.log('[AppState] Active unit updated');
    },

    /**
     * Adds a practice unit to recently practiced list
     * @param {PracticeUnit} unit - Unit to add
     */
    addToRecentlyPracticed(unit) {
      if (!validatePracticeUnit(unit)) {
        console.warn('[AppState] Cannot add invalid unit to recently practiced');
        return;
      }

      const unitId = unit.practiceUnitHeader.practiceUnitId;
      const unitName = unit.practiceUnitHeader.practiceName;

      // Remove existing entry if present
      this.recentlyPracticed = this.recentlyPracticed.filter(id => id !== unitId);

      // Add to beginning
      this.recentlyPracticed.unshift(unitId);

      // Keep only last 10
      if (this.recentlyPracticed.length > 10) {
        this.recentlyPracticed = this.recentlyPracticed.slice(0, 10);
      }

      console.log('[AppState] Added to recently practiced:', unitName);
    },

    /**
     * Sets the current workflow state
     * @param {WorkflowState} workflow - Workflow state to set
     * @param {Object} [context] - Additional context
     */
    setWorkflow(workflow, context = {}) {
      console.log('[AppState] Setting workflow:', workflow, context);
      this.currentWorkflow = workflow;
      this.navigationContext = { ...context };
    },

    /**
     * Clears the current workflow
     */
    clearWorkflow() {
      console.log('[AppState] Clearing workflow');
      this.currentWorkflow = null;
      this.navigationContext = {};
    },

    /**
     * Sets global loading state
     * @param {boolean} loading - Loading state
     */
    setGlobalLoading(loading) {
      this.globalLoading = loading;
    },

    /**
     * Sets global error state
     * @param {string|null} error - Error message or null to clear
     */
    setGlobalError(error) {
      this.globalError = error;
      if (error) {
        console.error('[AppState] Global error set:', error);
      }
    },

    /**
     * Updates user preferences
     * @param {Object} preferences - Preference updates
     */
    updateUserPreferences(preferences) {
      this.userPreferences = {
        ...this.userPreferences,
        ...preferences
      };
      console.log('[AppState] User preferences updated:', preferences);
    },

    /**
     * Validates the current app state
     * @returns {boolean} True if state is valid
     */
    validateState() {
      const isValid = validateActiveUnitContext(this.activeUnit);
      if (!isValid) {
        console.error('[AppState] Invalid app state detected');
      }
      return isValid;
    },

    /**
     * Resets the entire app state to defaults
     */
    reset() {
      console.log('[AppState] Resetting app state');
      this.activeUnit = createDefaultActiveUnitContext();
      this.currentWorkflow = null;
      this.navigationContext = {};
      this.recentlyPracticed = [];
      this.globalLoading = false;
      this.globalError = null;
    },
  },
});
