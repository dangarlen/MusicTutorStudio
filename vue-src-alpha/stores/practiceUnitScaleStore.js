import { defineStore } from "pinia";

export const usePracticeUnitScaleStore = defineStore("practiceUnitScale", {
  state: () => ({
    instrument: null,
    title: "Create Scale",
    instruments: [],
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
  },
});
