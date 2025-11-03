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

function getKeySignature() {
  const key = scaleStore?.scaleSelections?.key || "C";
  return key;
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
  const durToQN = { w: 4, h: 2, q: 1, e: 0.5 };
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
  const valid = arr.filter((n) => n?.pitch && n?.duration);
  const filtered = valid.filter((n) =>
    withinLedgerLimits(n.pitch, clef, limits)
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

  // Helper to create a VexFlow StaveNote for a given note
  function buildVFNote(n) {
    const key = n.pitch.replace(/([A-G][#b]?)(\d)/, "$1/$2");
    const note = new VF.StaveNote({ keys: [key], duration: n.duration, clef });
    if (shouldShow("accidentals", true)) {
      const acc = parseAccidental(n.pitch);
      if (acc) note.addModifier(0, new VF.Accidental(acc));
    }
    if (n.noteColor)
      note.setStyle({ fillStyle: n.noteColor, strokeStyle: n.noteColor });
    if (n.overlay) {
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
      // Map durations to ticks (limited to h,q,e,w set)
      const durTicks = { w: RES * 4, h: RES * 2, q: RES, e: RES / 2 };
      // First pass: assign each note to a beat index by accumulating ticks
      const beatGroups = Array.from({ length: beatsCount }, () => []);
      let accTicks = 0;
      const beatTicks =
        den === 8 && num % 3 === 0 && num >= 6 ? (RES * 3) / 2 : ticksPerDen; // dotted-quarter for compound
      for (const n of vfNotes) {
        const d = typeof n.getDuration === "function" ? n.getDuration() : "q";
        const t = durTicks[d] ?? RES;
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
    const vfNotes = notesToRender.map(buildVFNote);
    layoutAndDraw(stave, vfNotes, width - staveX * 2);
    return;
  }

  // Split notes into measures (by quarter-note capacity)
  const measures = [];
  let current = [];
  let sumQN = 0;
  for (const n of notesToRender) {
    if (!n?.pitch || !n?.duration) continue;
    const qn = durToQN[n.duration] ?? 1;
    const next = sumQN + qn;
    if (next - measureCapacityQN > 1e-6 && current.length) {
      measures.push(current);
      current = [];
      sumQN = 0;
    }
    current.push(buildVFNote(n));
    sumQN += qn;
    if (Math.abs(sumQN - measureCapacityQN) < 1e-6) {
      measures.push(current);
      current = [];
      sumQN = 0;
    }
  }
  if (current.length) measures.push(current);

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
    x += msWidth;
  }
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
    staffFormat.staff.width,
    staffFormat.staff.height,
  ],
  () => {
    renderVexFlow();
  },
  { deep: true }
);
</script>
