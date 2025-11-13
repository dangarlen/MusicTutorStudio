import { defineStore } from "pinia";

export const usePracticeUnitScaleStore = defineStore("practiceUnitScale", {
  state: () => ({
    // Unified practiceUnitHeader fields
    practiceUnitHeader: {
      practiceName: "",
      practiceUnitId: "",
      lastModified: "",
      practiceUnitType: "Scale",
      tempo: 120,
      keySignature: "C",
      timeSignature: "4/4",
      instrument: null,
      staffDisplayOptions: {
        showAccidentals: true,
        showOverlays: true,
        measuresPerLineMax: 2,
      },
      sourceURL: "",
      noteColorDesignation: {},
      // User ownership & privacy
      User: "", // Supabase user id (or other user identifier)
      shareMusic: false, // true = Share; false = Personal Use ONLY
      // Scale-specific unified fields
      contentType: "Major", // scaleType: Major/Minor/Chromatic
      direction: "ascending",
      startingOctave: "C4",
      numberOfOctaves: 1,
      // N/A for Scale (initialized as null/""/[])
      rangeStart: null,
      rangeEnd: null,
      composer: "",
      sourceWork: "",
      techniqueFocus: [],
      tagSource: "",
      repetitionCount: null,
      sourceMusicXML: "",
      instrumentOverride: "",
    },
    // noteArray
    noteArray: [],
    // UI state (not part of practiceUnit schema)
    title: "Create Scale",
    instruments: [],
    scaleSelections: null, // Deprecated; migrate to practiceUnitHeader fields
    // Quick practice session tracking
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
      this.loadPracticeUnit(unit);
      // Add to recently practiced (keep last 10)
      const existing = this.recentlyPracticed.findIndex(u => u.practiceUnitId === unit.practiceUnitHeader?.practiceUnitId);
      if (existing >= 0) this.recentlyPracticed.splice(existing, 1);
      this.recentlyPracticed.unshift({ ...unit, practicedAt: new Date().toISOString(), mode });
      if (this.recentlyPracticed.length > 10) this.recentlyPracticed.pop();
    },
    markAsChanged() {
      this.hasUnsavedChanges = true;
    },
    checkForUnsavedChanges() {
      const current = JSON.stringify(this.composePracticeUnit());
      return current !== this.lastSavedSnapshot;
    },
  },
});
