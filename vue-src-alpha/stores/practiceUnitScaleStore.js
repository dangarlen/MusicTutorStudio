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
  }),
  actions: {
    async loadInstruments() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/instruments.json`
        );
        if (!response.ok) throw new Error("Failed to load instruments.json");
        const data = await response.json();
        this.instruments = data;
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
    },
  },
});
