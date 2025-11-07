<template>
  <div class="border border-gray-300" :style="containerStyle">
    <div
      ref="vfContainer"
      class="w-full"
      :style="{ minHeight: staffHeight + 'px' }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from "vue";
import { useTestStaffNoteStore } from "../stores/testStaffNoteStore";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { getStaffFormat } from "../scripts/staffFormat";
import { composePracticeUnit } from "../scripts/composePracticeUnit";

// Optional practice-mode props to enable overlays and click-to-color without
// impacting other routes/components that embed StaffPreview.
const props = defineProps({
  // Overlay mode to display above notes: 'none' | 'names' | 'pitch' | 'cmt' | 'midi' | 'fingering' | 'fingering-alt'
  practiceOverlayMode: { type: String, default: "none" },
  // When true, do not render annotations above notes; instead attach tooltip text.
  practiceOverlayTooltipOnly: { type: Boolean, default: false },
  // Enable clicking notes to cycle colors
  practiceEnableClickToCycle: { type: Boolean, default: false },
  // Array of CSS color strings to cycle through on click
  practiceColorCycle: {
    type: Array,
    default: () => [
      "black",
      "blue",
      "orange",
      "green",
      "purple",
      "red",
      "brown",
      "gray",
    ],
  },
});

const vfContainer = ref(null);
const notesStore = useTestStaffNoteStore();
const scaleStore = usePracticeUnitScaleStore();

// Layout config loaded from public/staff-format.json (with fallback defaults)
const staffFormat = reactive({
  staff: {
    x: 10,
    y: 30,
    width: 560,
    height: 160,
    clef: "treble",
    backgroundColor: "#ffffff",
    containerPadding: 16,
    containerBorderRadius: 12,
    containerShadow: "0 0 0 0 rgba(0,0,0,0)",
    verticalCenter: false,
    ledgerLines: { above: 3, below: 3 },
  },
});

const containerStyle = computed(() => ({
  backgroundColor: staffFormat.staff.backgroundColor || "#ffffff",
  padding: (staffFormat.staff.containerPadding ?? 16) + "px",
  borderRadius: (staffFormat.staff.containerBorderRadius ?? 12) + "px",
  boxShadow: staffFormat.staff.containerShadow || "none",
}));

const staffHeight = computed(() => staffFormat.staff.height ?? 160);

function normalizeKeySignature(val) {
  try {
    const s = String(val || "C").trim();
    // Match: Letter + optional accidental + optional mode word (major/minor)
    const m = s.match(/^([A-Ga-g])([#b♭♯]?)(?:\s*(major|minor))?$/);
    if (m) {
      const letter = m[1].toUpperCase();
      let acc = m[2] || "";
      if (acc === "♭") acc = "b";
      if (acc === "♯") acc = "#";
      const mode = (m[3] || "").toLowerCase();
      return letter + acc + (mode === "minor" ? "m" : "");
    }
    // Already in VexFlow form like "Bb" or "Am"
    if (/^[A-G][#b]?m?$/i.test(s)) return s;
  } catch {}
  return "C";
}

function getKeySignature() {
  const raw = scaleStore?.scaleSelections?.key || "C";
  return normalizeKeySignature(raw);
}

function shouldShow(optionKey, defaultVal = true) {
  const opts = scaleStore?.scaleSelections?.staffOptions || {};
  if (typeof opts[optionKey] === "boolean") return opts[optionKey];
  return defaultVal;
}

function parseAccidental(pitch) {
  // pitch: e.g., "C#4", "Bb4", "C4"
  const m = pitch.match(/^([A-G])([#b]?)\d$/);
  if (!m) return null;
  return m[2] || null; // '#' | 'b' | null
}

// Local SPN->MIDI helper for overlay computation (fallback if window.spnToMidi isn't present)
function spnToMidiLocal(spn) {
  try {
    if (
      typeof globalThis !== "undefined" &&
      globalThis &&
      typeof globalThis.spnToMidi === "function"
    ) {
      // Accept both "C4" and "C/4"
      const std = spn.includes("/")
        ? spn
        : spn.replace(/([A-G][#b]?)(\d)/, "$1/$2");
      return globalThis.spnToMidi(std);
    }
  } catch {}
  const m = String(spn).match(/^([A-G])([#b]?)(\d)$/);
  if (!m) return Number.NaN;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] ?? 0;
  let acc = 0;
  if (m[2] === "#") acc = 1;
  else if (m[2] === "b") acc = -1;
  const octave = Number(m[3]);
  return 12 * (octave + 1) + base + acc;
}

function toSPNSlash(pitch) {
  // Convert "C4" -> "C/4"
  return String(pitch).replace(/([A-G][#b]?(?=\d))(\d)/, "$1/$2");
}

function enharmonics(letterAcc) {
  const map = {
    "C#": "Db",
    Db: "C#",
    "D#": "Eb",
    Eb: "D#",
    "F#": "Gb",
    Gb: "F#",
    "G#": "Ab",
    Ab: "G#",
    "A#": "Bb",
    Bb: "A#",
  };
  return map[letterAcc] || null;
}

function getFingeringArrayForPitch(pitch) {
  try {
    const inst = scaleStore?.instrument;
    const fing = inst && inst.fingering ? inst.fingering : null;
    if (!fing) return [];
    const raw = String(pitch || ""); // e.g., "C4"
    const keySlash = toSPNSlash(raw); // e.g., "C/4"
    const keyNoSlash = raw; // as-is
    const m = raw.match(/^([A-G][#b]?)/);
    const letterAcc = m ? m[1] : null;
    const alt = letterAcc ? enharmonics(letterAcc) : null;
    const keySlashAlt = alt ? keySlash.replace(/^([A-G][#b]?)/, alt) : null;
    const keyNoSlashAlt = alt ? keyNoSlash.replace(/^([A-G][#b]?)/, alt) : null;
    // Try all likely key shapes found in instruments.json
    if (Array.isArray(fing[keyNoSlash])) return fing[keyNoSlash];
    if (Array.isArray(fing[keySlash])) return fing[keySlash];
    if (keyNoSlashAlt && Array.isArray(fing[keyNoSlashAlt]))
      return fing[keyNoSlashAlt];
    if (keySlashAlt && Array.isArray(fing[keySlashAlt]))
      return fing[keySlashAlt];
  } catch {}
  return [];
}

// Helpers to calculate ledger line counts relative to staff by clef
function diatonicIndex(pitch, clef) {
  const m = pitch.match(/^([A-G])[#b]?(\d)$/);
  if (!m) return 0;
  const letter = m[1];
  const octave = Number(m[2]);
  const letterOrder = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const L = letterOrder[letter];
  if (L == null) return 0;
  let baseLetter, baseOctave;
  if (clef === "bass") {
    baseLetter = letterOrder["G"]; // G2 bottom line
    baseOctave = 2;
  } else {
    baseLetter = letterOrder["E"]; // E4 bottom line (treble default)
    baseOctave = 4;
  }
  return (octave - baseOctave) * 7 + (L - baseLetter);
}
function countLedgerAbove(index) {
  if (index <= 9) return 0; // 9 is space above top line
  return Math.ceil((index - 9) / 2);
}
function countLedgerBelow(index) {
  if (index >= -1) return 0; // -1 is space below bottom line
  return Math.ceil(-(index + 1) / 2);
}
function withinLedgerLimits(pitch, clef, limits) {
  const idx = diatonicIndex(pitch, clef);
  const above = countLedgerAbove(idx);
  const below = countLedgerBelow(idx);
  const maxAbove = Number(limits?.above ?? 3);
  const maxBelow = Number(limits?.below ?? 3);
  return above <= maxAbove && below <= maxBelow;
}

async function renderVexFlow() {
  if (!vfContainer.value) return;
  vfContainer.value.innerHTML = "";
  const VF = globalThis.Vex ? globalThis.Vex.Flow : null;
  if (!VF) {
    console.error("[VexFlow] Not available on globalThis");
    return;
  }

  const width = staffFormat.staff.width ?? 560;
  let height = staffFormat.staff.height ?? 160;
  const renderer = new VF.Renderer(vfContainer.value, VF.Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  // Y position: either config.y or vertically centered
  const staveY = staffFormat.staff.verticalCenter
    ? Math.max(0, Math.floor(height / 2 - 40))
    : staffFormat.staff.y ?? 30;

  const staveX = staffFormat.staff.x ?? 10;

  // Clef: prefer instrument clef if available, else config, else treble
  const clef =
    scaleStore?.instrument?.clef || staffFormat.staff.clef || "treble";

  // Determine meter and bar lines behavior
  let tsString = "4/4";
  try {
    const pu = composePracticeUnit({ scaleStore, notesStore });
    const header = pu?.practiceUnitHeader || {};
    tsString =
      header.timeSignature ||
      (typeof header.keySignature === "string" &&
      /^\d+\/\d+$/.test(header.keySignature)
        ? header.keySignature
        : "4/4");
  } catch {}
  const [numStr, denStr] = (tsString || "4/4").split("/");
  const num = Number(numStr) || 4;
  const den = Number(denStr) || 4;
  const measureCapacityQN = num * (4 / den);
  function parseDurToken(tok) {
    // Support rests using an optional 'r' suffix (e.g., 'qr', 'hr', 'wr', 'er', 'sr')
    // and an optional dotted marker '.' (e.g., 'q.r' won't be used; expect 'qr.' or 'q.')
    const m = String(tok || "").match(/^([whqes])(r)?(\.)?$/);
    if (m) {
      return { base: m[1], isRest: Boolean(m[2]), dotted: Boolean(m[3]) };
    }
    return { base: "q", isRest: false, dotted: false };
  }
  function durationToQN(tok) {
    const { base, dotted } = parseDurToken(tok);
    let baseQN = 1;
    switch (base) {
      case "w":
        baseQN = 4;
        break;
      case "h":
        baseQN = 2;
        break;
      case "q":
        baseQN = 1;
        break;
      case "e":
        baseQN = 0.5;
        break;
      case "s":
        baseQN = 0.25;
        break;
      default:
        break;
    }
    return dotted ? baseQN * 1.5 : baseQN;
  }
  const showMeasureBars = shouldShow("barLines", true);

  const arr = Array.isArray(notesStore.noteArray) ? notesStore.noteArray : [];
  if (!arr.length) return;
  const limits = staffFormat.staff.ledgerLines || { above: 3, below: 3 };
  const optEnforce =
    scaleStore?.scaleSelections?.staffOptions?.enforceLedgerLimits;
  const enforceLedger =
    typeof optEnforce === "boolean"
      ? optEnforce
      : Boolean(staffFormat.staff?.enforceLedgerLimits ?? false);
  // Keep track of original indices alongside note objects
  const valid = arr
    .map((n, i) => ({ n, i }))
    .filter((x) => x.n?.pitch && x.n?.duration);
  const filtered = valid.filter((x) =>
    withinLedgerLimits(x.n.pitch, clef, limits)
  );
  // Decide which notes to render based on enforcement toggle
  const notesToRender = enforceLedger ? filtered : valid;
  if (enforceLedger && !filtered.length) {
    // Strict mode: nothing to draw as notes; draw a clean stave only
    // eslint-disable-next-line no-console
    console.warn(
      "[StaffPreview] All notes outside ledger limits; strict enforcement active.",
      { limits, clef, total: arr.length }
    );
  }

  // Compute overlays per note (and persist into store) for practice mode
  const overlayMode = String(props.practiceOverlayMode || "none");
  const useAnnotation = !props.practiceOverlayTooltipOnly;
  function computeOverlayText(note) {
    try {
      if (overlayMode === "names") {
        const m = String(note.pitch || "").match(/^([A-G][#b]?)/);
        return m ? m[1] : String(note.pitch || "");
      } else if (overlayMode === "pitch") {
        return String(note.pitch || "");
      } else if (overlayMode === "midi") {
        if (note.midi != null && note.midi !== "") return String(note.midi);
        const midi = spnToMidiLocal(String(note.pitch || ""));
        return Number.isFinite(midi) ? String(midi) : "";
      } else if (overlayMode === "cmt") {
        if (note.cmt) return String(note.cmt);
        const d = String(note.duration || "q");
        // Simple CMT token: SPN + duration letter, e.g., "C4q"
        return String(note.pitch || "") + d;
      } else if (
        overlayMode === "fingering" ||
        overlayMode === "fingering-alt"
      ) {
        // Prefer note-provided fingering data
        if (
          overlayMode === "fingering-alt" &&
          Array.isArray(note.fingeringAlt)
        ) {
          return note.fingeringAlt.join("/");
        }
        if (Array.isArray(note.fingering)) return note.fingering[0] ?? "";
        if (typeof note.fingering === "string") return note.fingering;
        // Fallback: lookup from instrument fingering map
        const arr = getFingeringArrayForPitch(note.pitch);
        if (overlayMode === "fingering-alt" && arr.length) return arr.join("/");
        return arr[0] ?? "";
      }
    } catch {}
    return "";
  }
  if (overlayMode && overlayMode !== "none") {
    for (const { n, i } of valid) {
      const text = computeOverlayText(n);
      // Persist overlay text only to the practice store (for JSON) and local note for rendering
      if ((n.overlay || "") !== text) {
        try {
          if (Array.isArray(scaleStore.noteArray) && scaleStore.noteArray[i]) {
            scaleStore.noteArray[i] = {
              ...scaleStore.noteArray[i],
              overlay: text,
            };
          }
        } catch {}
        // Update the local reference so annotations render this pass
        try {
          n.overlay = text;
        } catch {}
      }
    }
  } else {
    // When overlays are off, ensure overlay field is cleared (non-destructive if already empty)
    for (const { n, i } of valid) {
      if (n.overlay) {
        try {
          if (Array.isArray(scaleStore.noteArray) && scaleStore.noteArray[i]) {
            scaleStore.noteArray[i] = {
              ...scaleStore.noteArray[i],
              overlay: "",
            };
          }
        } catch {}
        try {
          n.overlay = "";
        } catch {}
      }
    }
  }

  // Helper to create a VexFlow StaveNote for a given note
  function buildVFNote(n) {
    const parsed = parseDurToken(n.duration);
    const { base, dotted, isRest } = parsed;
    // For rests, VexFlow expects a placeholder key; use 'B/4'
    const key = isRest
      ? "B/4"
      : n.pitch
          .replace(/([A-G][#b]?)\/(\d)/, "$1/$2")
          .replace(/([A-G][#b]??)(\d)/, "$1/$2");
    let vexDur;
    switch (base) {
      case "e":
        vexDur = "8";
        break;
      case "s":
        vexDur = "16";
        break;
      default:
        vexDur = base;
    }
    // Append 'r' to duration for rests so VexFlow renders a rest glyph
    if (isRest) vexDur = `${vexDur}r`;
    const note = new VF.StaveNote({ keys: [key], duration: vexDur, clef });
    if (dotted) {
      try {
        if (typeof note.addDotToAll === "function") note.addDotToAll();
        else if (VF?.Dot && typeof VF.Dot.buildAndAttach === "function") {
          VF.Dot.buildAndAttach([note], { all: true });
        } else if (typeof note.addDot === "function") note.addDot(0);
      } catch {}
    }
    note.__mtsDur = n.duration;
    // Do not add accidentals to rests
    if (!isRest && shouldShow("accidentals", true)) {
      const acc = parseAccidental(n.pitch);
      if (acc) note.addModifier(0, new VF.Accidental(acc));
    }
    if (n.noteColor)
      note.setStyle({ fillStyle: n.noteColor, strokeStyle: n.noteColor });
    if (n.overlay && useAnnotation) {
      note.addAnnotation(
        0,
        new VF.Annotation(n.overlay).setVerticalJustification(
          VF.Annotation.VerticalJustify.TOP
        )
      );
    }
    return note;
  }

  // Helper: layout and draw notes with spacing config
  function layoutAndDraw(stave, vfNotes, availableWidth) {
    if (!vfNotes.length) return;
    const spacing = staffFormat.staff.noteSpacing || {
      mode: "proportional",
      justify: true,
    };
    // Spacing is locked to VexFlow default; UI overrides removed
    const voice = new VF.Voice({ time: { num, beat_value: den } });
    // SOFT lets voice accept bars that don't strictly sum; our filtering may change totals
    voice.setMode(VF.Voice.Mode.SOFT);
    voice.addTickables(vfNotes);
    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]);
    // Resolve effective spacing mode (UI toggle overrides JSON)
    const mode = spacing.mode || "default";
    // 'default' (or alias 'auto'): use VexFlow's normal formatting, ignoring custom spacing settings
    if (mode === "default" || mode === "auto") {
      // Use VexFlow's stave-aware formatter so clef/key/time offsets are respected
      formatter.formatToStave([voice], stave);
    } else if (mode === "fixedPerNote") {
      // Fixed spacing per note: place notes with a constant pixel step from the note start X
      for (const n of vfNotes) {
        if (n && typeof n.setIgnoreTicks === "function") n.setIgnoreTicks(true);
      }
      // Compute left/right bounds
      const left =
        typeof stave.getNoteStartX === "function"
          ? stave.getNoteStartX()
          : stave.getX() + 24;
      const right =
        typeof stave.getWidth === "function"
          ? stave.getX() + stave.getWidth() - 12
          : left + Math.max(0, availableWidth - 12);
      const innerWidth = Math.max(10, right - left);
      let step = Number(staffFormat.staff?.noteSpacing?.pixelsPerNote ?? 50);
      if (!Number.isFinite(step) || step <= 0) step = 50;
      // If the sequence would exceed the available width, optionally clamp step to fit (keeps fixed look while avoiding overflow)
      const needed = step * (vfNotes.length - 1);
      if (needed > innerWidth) {
        step = innerWidth / Math.max(1, vfNotes.length - 1);
      }
      // Create tick contexts, then override x positions
      formatter.format([voice], availableWidth);
      let i = 0;
      for (const n of vfNotes) {
        const x = left + i * step;
        if (typeof n.setX === "function") n.setX(x);
        i++;
      }
    } else if (mode === "fixedPerBeat") {
      // Equal-width beats: distribute notes into beats by original ticks, then place notes evenly within each beat.
      // Build tick contexts, but we'll ignore tick-based x and set positions manually.
      for (const n of vfNotes) {
        if (n && typeof n.setIgnoreTicks === "function") n.setIgnoreTicks(true);
      }
      // Determine beat structure
      const RES = VF.Flow.RESOLUTION;
      const ticksPerDen = (RES * 4) / den; // ticks per one beat (denominator note)
      let beatsCount = num;
      // Handle common compound meters: 6/8, 9/8, 12/8 => dotted-quarter beats
      if (den === 8 && num % 3 === 0 && num >= 6) {
        beatsCount = Math.floor(num / 3);
      }
      const left =
        typeof stave.getNoteStartX === "function"
          ? stave.getNoteStartX()
          : stave.getX() + 24;
      const right =
        typeof stave.getWidth === "function"
          ? stave.getX() + stave.getWidth() - 12
          : left + Math.max(0, availableWidth - 12);
      const innerWidth = Math.max(10, right - left);
      const beatWidth = innerWidth / Math.max(1, beatsCount);
      // Duration to ticks including dotted and sixteenth
      function durationToTicks(tok) {
        const { base, dotted } = parseDurToken(tok);
        let baseTicks = RES; // quarter by default
        switch (base) {
          case "w":
            baseTicks = RES * 4;
            break;
          case "h":
            baseTicks = RES * 2;
            break;
          case "q":
            baseTicks = RES;
            break;
          case "e":
            baseTicks = RES / 2;
            break;
          case "s":
            baseTicks = RES / 4;
            break;
          default:
            break;
        }
        return dotted ? (baseTicks * 3) / 2 : baseTicks;
      }
      // First pass: assign each note to a beat index by accumulating ticks
      const beatGroups = Array.from({ length: beatsCount }, () => []);
      let accTicks = 0;
      const beatTicks =
        den === 8 && num % 3 === 0 && num >= 6 ? (RES * 3) / 2 : ticksPerDen; // dotted-quarter for compound
      for (const n of vfNotes) {
        const tok =
          n.__mtsDur ||
          (typeof n.getDuration === "function" ? n.getDuration() : "q");
        const t = durationToTicks(tok);
        const beatIndex = Math.min(
          beatsCount - 1,
          Math.floor(accTicks / beatTicks)
        );
        beatGroups[beatIndex].push(n);
        accTicks += t;
      }
      // Second pass: compute x positions per note within its beat (equal spacing within beat)
      const positions = new Map();
      for (let b = 0; b < beatsCount; b++) {
        const group = beatGroups[b];
        const slots = group.length + 1;
        for (let j = 0; j < group.length; j++) {
          const nx = left + b * beatWidth + (j + 1) * (beatWidth / slots);
          positions.set(group[j], nx);
        }
      }
      // Create tick contexts, then override x
      formatter.format([voice], availableWidth);
      for (const n of vfNotes) {
        const x = positions.get(n);
        if (typeof n.setX === "function" && typeof x === "number") n.setX(x);
      }
    } else if (mode === "proportional" && spacing.justify) {
      // proportional (default, justified) — respect stave start/end
      formatter.formatToStave([voice], stave);
    } else if (mode === "proportional") {
      // proportional (default, no justification) — still align to stave
      formatter.formatToStave([voice], stave);
    } else {
      // Fallback: use VexFlow default formatting
      formatter.format([voice], availableWidth);
    }
    voice.draw(context, stave);
  }

  // Track original indices for click binding and optional tooltips
  const allDrawnOriginalIndices = [];
  const tooltipTextByIndex = new Map();
  if (overlayMode && overlayMode !== "none") {
    for (const { n, i } of valid) {
      const t = props.practiceOverlayTooltipOnly
        ? computeOverlayText(n)
        : (n.overlay || "").trim();
      if (t) tooltipTextByIndex.set(i, String(t));
    }
  }

  if (!showMeasureBars) {
    // Single long stave without internal barlines
    const stave = new VF.Stave(staveX, staveY, width - staveX * 2);
    stave.addClef(clef);
    if (shouldShow("keySignature", true)) {
      try {
        stave.addKeySignature(getKeySignature());
      } catch (e) {
        console.warn("[VexFlow] Invalid key signature:", getKeySignature(), e);
      }
    }
    if (shouldShow("timeSignature", true)) {
      try {
        stave.addTimeSignature(tsString);
      } catch {}
    }
    stave.setContext(context).draw();
    const vfNotes = notesToRender.map(({ n, i }) => {
      allDrawnOriginalIndices.push(i);
      return buildVFNote(n);
    });
    layoutAndDraw(stave, vfNotes, width - staveX * 2);
    // Attach events after draw
    attachNoteInteractivity(allDrawnOriginalIndices, tooltipTextByIndex);
    return;
  }

  // Split notes into measures (by quarter-note capacity)
  const measures = [];
  const measuresIdx = [];
  let current = [];
  let currentIdx = [];
  let sumQN = 0;
  for (const obj of notesToRender) {
    const n = obj?.n;
    if (!n?.pitch || !n?.duration) continue;
    const qn = durationToQN(n.duration);
    const next = sumQN + qn;
    if (next - measureCapacityQN > 1e-6 && current.length) {
      measures.push(current);
      measuresIdx.push(currentIdx);
      current = [];
      currentIdx = [];
      sumQN = 0;
    }
    current.push(buildVFNote(n));
    currentIdx.push(obj.i);
    sumQN += qn;
    if (Math.abs(sumQN - measureCapacityQN) < 1e-6) {
      measures.push(current);
      measuresIdx.push(currentIdx);
      current = [];
      currentIdx = [];
      sumQN = 0;
    }
  }
  if (current.length) {
    measures.push(current);
    measuresIdx.push(currentIdx);
  }

  // Render measures across multiple lines based on maxMeasuresPerLine
  const availableWidth = width - staveX * 2;
  const measureCount = Math.max(1, measures.length);
  const maxPerLineRaw = scaleStore?.scaleSelections?.maxMeasuresPerLine ?? 2;
  const maxPerLine = Math.min(4, Math.max(1, Number(maxPerLineRaw)));

  // Compute glyph offset (clef/key/time) for first measure on a line
  let firstGlyphOffset = 0;
  try {
    const tmp = new VF.Stave(0, 0, 120);
    tmp.addClef(clef);
    if (shouldShow("keySignature", true)) {
      try {
        tmp.addKeySignature(getKeySignature());
      } catch {}
    }
    if (shouldShow("timeSignature", true)) {
      try {
        tmp.addTimeSignature(tsString);
      } catch {}
    }
    firstGlyphOffset =
      typeof tmp.getNoteStartX === "function"
        ? tmp.getNoteStartX() - tmp.getX()
        : 0;
  } catch {}

  const rows = Math.ceil(measureCount / maxPerLine);
  // Increase renderer height to fit all rows (use configured height per row)
  const rowHeight = Math.max(120, staffFormat.staff.height ?? 160);
  const verticalGap = 16; // slight gap between staves
  const neededHeight =
    rows * rowHeight + (rows - 1) * verticalGap + (staffFormat.staff.y ?? 30);
  if (neededHeight > height) {
    height = neededHeight;
    renderer.resize(width, height);
  }

  let x = staveX;
  let y = staveY;
  for (let idx = 0; idx < measureCount; idx++) {
    const isLineStart = idx % maxPerLine === 0;
    const isLineEnd =
      idx % maxPerLine === maxPerLine - 1 || idx === measureCount - 1;

    // When starting a new line, reset x and y
    if (isLineStart && idx !== 0) {
      x = staveX;
      y += rowHeight + verticalGap;
    }

    // Determine how many measures on this line
    const measuresOnThisLine = Math.min(
      maxPerLine,
      measureCount - Math.floor(idx / maxPerLine) * maxPerLine
    );

    // Compute equal content width for this line
    const baseContentWidth = Math.max(
      60,
      Math.floor((availableWidth - firstGlyphOffset) / measuresOnThisLine)
    );
    const totalPlanned =
      firstGlyphOffset + baseContentWidth * measuresOnThisLine;
    const remainder = availableWidth - totalPlanned;
    const isFirstOnLine = isLineStart;
    const isLastOnLine = isLineEnd;

    let contentWidth =
      baseContentWidth + (isLastOnLine ? Math.max(0, remainder) : 0);
    const msWidth = isFirstOnLine
      ? contentWidth + firstGlyphOffset
      : contentWidth;

    const notes = measures[idx];
    const ms = new VF.Stave(x, y, msWidth);
    if (isFirstOnLine) {
      ms.addClef(clef);
      if (shouldShow("keySignature", true)) {
        try {
          ms.addKeySignature(getKeySignature());
        } catch {}
      }
      if (shouldShow("timeSignature", true)) {
        try {
          ms.addTimeSignature(tsString);
        } catch {}
      }
    } else {
      ms.setBegBarType(VF.Barline.type.SINGLE);
      ms.setEndBarType(VF.Barline.type.SINGLE);
    }
    ms.setContext(context).draw();
    layoutAndDraw(ms, notes, msWidth);
    // Record original indices in the same draw order
    const idxs = measuresIdx[idx] || [];
    for (const ii of idxs) allDrawnOriginalIndices.push(ii);
    x += msWidth;
  }
  attachNoteInteractivity(allDrawnOriginalIndices, tooltipTextByIndex);
}

onMounted(() => {
  getStaffFormat()
    .then((fmt) => {
      if (fmt && fmt.staff) Object.assign(staffFormat.staff, fmt.staff);
    })
    .finally(() => {
      renderVexFlow();
    });
});

watch(
  () => [
    notesStore.noteArray,
    scaleStore?.scaleSelections?.key,
    scaleStore?.scaleSelections?.staffOptions,
    scaleStore?.scaleSelections?.timeSignature,
    scaleStore?.scaleSelections?.maxMeasuresPerLine,
    scaleStore?.instrument?.clef,
    scaleStore?.instrument, // re-render on instrument change to refresh fingering overlays
    staffFormat.staff.width,
    staffFormat.staff.height,
    props.practiceOverlayMode,
    props.practiceOverlayTooltipOnly,
    props.practiceEnableClickToCycle,
    props.practiceColorCycle,
  ],
  () => {
    renderVexFlow();
  },
  { deep: true }
);

// Attach click listeners and optional tooltips to rendered notes
function attachNoteInteractivity(originalIdxList, tooltipMap) {
  try {
    const groups = vfContainer.value.querySelectorAll("g.vf-stavenote");
    const count = Math.min(groups.length, originalIdxList.length);
    for (let i = 0; i < count; i++) {
      const g = groups[i];
      const origIdx = originalIdxList[i];
      if (!g) continue;
      // Tooltip (title attribute) for tooltip-only overlay mode
      if (props.practiceOverlayTooltipOnly && tooltipMap?.has(origIdx)) {
        g.setAttribute("title", tooltipMap.get(origIdx));
      }
      if (props.practiceEnableClickToCycle) {
        g.style.cursor = "pointer";
        g.addEventListener("click", () => onNoteClick(origIdx));
      }
    }
  } catch (e) {
    console.warn("[StaffPreview] attachNoteInteractivity failed", e);
  }
}

function onNoteClick(idx) {
  try {
    if (!Array.isArray(notesStore.noteArray) || !notesStore.noteArray[idx])
      return;
    const current = notesStore.noteArray[idx];
    const cycle = Array.isArray(props.practiceColorCycle)
      ? props.practiceColorCycle.filter((c) => typeof c === "string" && c)
      : [];
    if (!cycle.length) return;
    const cur = (current.noteColor || "").toLowerCase();
    const normCycle = cycle.map((c) => String(c).toLowerCase());
    let nextIndex = 0;
    const found = normCycle.indexOf(cur);
    if (found >= 0) nextIndex = (found + 1) % normCycle.length;
    const nextColor = cycle[nextIndex];
    // Update both stores if possible
    notesStore.noteArray[idx] = { ...current, noteColor: nextColor };
    try {
      if (Array.isArray(scaleStore.noteArray) && scaleStore.noteArray[idx]) {
        scaleStore.noteArray[idx] = {
          ...scaleStore.noteArray[idx],
          noteColor: nextColor,
        };
      }
    } catch {}
  } catch (e) {
    console.warn("[StaffPreview] onNoteClick failed", e);
  }
}
</script>
