import { defineStore } from "pinia";
import { useAppStateStore } from './appStateStore.js';
import { validatePracticeUnit, createDefaultPracticeUnitHeader } from '../types/index.js';

export const usePracticeUnitScaleStore = defineStore("practiceUnitScale", {
  state: () => ({
    // Unified practiceUnitHeader fields
    practiceUnitHeader: createDefaultPracticeUnitHeader(),
    // noteArray
    noteArray: [],
    // UI state (not part of practiceUnit schema)
    title: "Create Scale",
    instruments: [],
    scaleSelections: null, // Deprecated; migrate to practiceUnitHeader fields
    // Legacy tracking (moved to AppState but kept for compatibility)
    recentlyPracticed: [], // Array of practice units for quick access
    hasUnsavedChanges: false, // Track if current unit differs from saved state
    lastSavedSnapshot: null // Snapshot of last saved state for comparison
  }),
  actions: {
    async loadInstruments() {
      try {
        // Try multiple candidate locations so the app works both in dev (/) and
        // when built to a subfolder (e.g. /alpha-vue-SPA/). This avoids a 404 that
        // would leave the staff range empty.
        const candidates = [
          `${import.meta.env.BASE_URL}data/instruments.json`,
          '/alpha-vue-SPA/data/instruments.json',
          '/data/instruments.json',
        ];
        let data = null;
        let lastErr = null;
        for (const url of candidates) {
          try {
            // normalise double-slashes
            const u = url.replace(/([^:]\/)\/+/g, '$1/');
            const resp = await fetch(u);
            if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            data = await resp.json();
            // success — stop trying
            this.instruments = data;
            // debug helpful when diagnosing missing staff at runtime
            // eslint-disable-next-line no-console
            console.debug('[practiceUnitScaleStore] loaded instruments from', u, 'count=', Array.isArray(data)?data.length:0);
            break;
          } catch (e) {
            lastErr = e;
            // try next candidate
          }
        }
        if (!data) throw lastErr || new Error('Failed to load instruments.json');
      } catch (e) {
        console.error("Instrument fetch error:", e);
      }
    },
    setInstrument(inst) {
      this.practiceUnitHeader.instrument = inst;
    },
    setTitle(title) {
      this.title = title;
    },
    setNoteColorDesignation(map) {
      // Accept only known keys and string values
      const allowed = ["red", "blue", "green", "orange", "gray", "purple"];
      const out = {};
      try {
        if (map && typeof map === "object") {
          for (const k of allowed) {
            const v = map[k];
            if (typeof v === "string" && v.trim().length) out[k] = v.trim();
          }
        }
      } catch {}
      this.practiceUnitHeader.noteColorDesignation = out;
    },
    // Helper to compose full practiceUnit for export
    composePracticeUnit() {
      return {
        practiceUnitHeader: { ...this.practiceUnitHeader },
        noteArray: [...this.noteArray],
      };
    },
    // Helper to load from unified format
    loadPracticeUnit(unit) {
      if (unit.practiceUnitHeader) {
        this.practiceUnitHeader = {
          ...this.practiceUnitHeader,
          ...unit.practiceUnitHeader,
        };
      }
      if (Array.isArray(unit.noteArray)) {
        this.noteArray = unit.noteArray.map((n) => ({ ...n }));
      }
      // Update tracking
      this.hasUnsavedChanges = false;
      this.lastSavedSnapshot = JSON.stringify(this.composePracticeUnit());
    },
    // Quick practice session management
    activateForPractice(unit, mode = 'quick') {
      console.log('[PracticeUnitScaleStore] Activating for practice:', { unit, mode });
      
      // Load into local state
      this.loadPracticeUnit(unit);
      
      // Sync with AppState for global coordination
      const appState = useAppStateStore();
      appState.loadActiveUnit(unit, mode);
      
      // Legacy compatibility - keep local tracking
      const existing = this.recentlyPracticed.findIndex(u => u.practiceUnitId === unit.practiceUnitHeader?.practiceUnitId);
      if (existing >= 0) this.recentlyPracticed.splice(existing, 1);
      this.recentlyPracticed.unshift({ ...unit, practicedAt: new Date().toISOString(), mode });
      if (this.recentlyPracticed.length > 10) this.recentlyPracticed.pop();
    },
    
    markAsChanged() {
      this.hasUnsavedChanges = true;
      // Sync with AppState
      const appState = useAppStateStore();
      if (appState.hasActiveUnit) {
        appState.markActiveUnitChanged();
      }
    },
    
    checkForUnsavedChanges() {
      const current = JSON.stringify(this.composePracticeUnit());
      const hasChanges = current !== this.lastSavedSnapshot;
      
      // Sync with AppState
      const appState = useAppStateStore();
      if (appState.hasActiveUnit && appState.hasUnsavedChanges !== hasChanges) {
        if (hasChanges) {
          appState.markActiveUnitChanged();
        } else {
          appState.markActiveUnitSaved();
        }
      }
      
      return hasChanges;
    },
    
    // New method to sync current state to AppState
    syncToAppState() {
      const appState = useAppStateStore();
      const currentUnit = this.composePracticeUnit();
      
      if (validatePracticeUnit(currentUnit)) {
        appState.updateActiveUnit(currentUnit);
        console.log('[PracticeUnitScaleStore] Synced to AppState');
      }
    },
    
    // New method to load from AppState
    loadFromAppState() {
      const appState = useAppStateStore();
      
      if (appState.hasActiveUnit) {
        this.loadPracticeUnit(appState.activeUnit.unit);
        console.log('[PracticeUnitScaleStore] Loaded from AppState');
      }
    },
  },
});
