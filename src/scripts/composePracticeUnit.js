// Compose the current MTS practiceUnit JSON from Pinia stores
// Non-persistent; consumers can stringify and download as needed

export function composePracticeUnit({
  scaleStore,
  notesStore,
  name = "Untitled Scale",
}) {
  const sel = scaleStore?.scaleSelections || {};
  const sdo =
    sel?.staffOptions && typeof sel.staffOptions === "object"
      ? sel.staffOptions
      : {};
  const practiceUnit = {
    practiceUnitHeader: {
      practiceName: name,
      practiceUnitId: "guid-placeholder",
      lastModified: new Date().toISOString(),
      practiceUnitType: "Scale",
      tempo: 120,
      keySignature: sel.key || "C",
      timeSignature: sel.timeSignature || "4/4",
      instrument: scaleStore?.instrument || null,
      staffDisplayOptions: {
        ...sdo,
        // measuresPerLineMax lives in header.staffDisplayOptions; default 2, clamp 1-4
        measuresPerLineMax: (() => {
          const v = Number(sel.maxMeasuresPerLine);
          if (!Number.isFinite(v)) return 2;
          return Math.min(4, Math.max(1, v));
        })(),
      },
      sourceURL: "",
      noteColorDesignation: (() => {
        const src = scaleStore?.noteColorDesignation || {};
        const allowed = ["red", "blue", "green", "orange", "gray", "purple"]; // 'black' excluded
        const out = {};
        try {
          for (const k of allowed) {
            const v = src[k];
            if (typeof v === "string" && v.trim().length) out[k] = v.trim();
          }
        } catch {}
        return out;
      })(),
    },
    practiceUnitScale: {
      scaleType: sel.scaleType || "major",
      scaleRange: {
        startingOctave: sel.startingOctave || "C4",
        octaveCount: sel.octaveCount || 1,
      },
      direction: sel.direction || "Ascending",
    },
    noteArray: Array.isArray(notesStore?.noteArray) ? notesStore.noteArray : [],
  };
  return practiceUnit;
}
