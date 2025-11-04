import { defineStore } from "pinia";

export const usePracticeUnitScaleStore = defineStore("practiceUnitScale", {
  state: () => ({
    instrument: null,
    title: "Create Scale",
    instruments: [],
    // Optional instructional color mapping saved into practiceUnitHeader.noteColorDesignation
    // Keys allowed by schema: red, blue, green, orange, gray, purple (black excluded)
    noteColorDesignation: {},
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
      this.instrument = inst;
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
      this.noteColorDesignation = out;
    },
  },
});
