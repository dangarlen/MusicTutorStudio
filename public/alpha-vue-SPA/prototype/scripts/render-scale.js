// --- Pitch Constants ---
const noteOrder = chromatic; // Used for fullRange construction

// Helper function to get key signature
function getKeySignature(rootNote, scaleType) {
  if (scaleType !== "major") return null; // Only support major scales for now

  const keySignatures = {
    C: null,
    G: "G",
    D: "D",
    A: "A",
    E: "E",
    B: "B",
    "F#": "F#",
    "C#": "C#",
    F: "F",
    Bb: "Bb",
    Eb: "Eb",
    Ab: "Ab",
    Db: "Db",
    Gb: "Gb",
  };

  return keySignatures[rootNote] || null;
}

// Global cache for note colors
let NOTE_COLORS = null;
async function loadNoteColors() {
  if (NOTE_COLORS) return NOTE_COLORS;
  try {
    const resp = await fetch("data/noteColors.json");
    NOTE_COLORS = await resp.json();
    return NOTE_COLORS;
  } catch (e) {
    NOTE_COLORS = ["black", "blue", "orange", "green"];
    return NOTE_COLORS;
  }
}

// Main renderScale now supports noteColorState and onNoteColorChange
async function renderScale(
  entry,
  scaleType,
  rootNote,
  direction,
  displayMode,
  octaveCount = 1,
  startingOctave = 4,
  accidentalFamily = "auto-key",
  accidentalDisplay = "both",
  noteDuration = "quarter",
  showBarLines = true,
  noteColorState = {},
  onNoteColorChange = null
) {
  const VF = Vex.Flow;
  const container = document.getElementById("vf");
  const tooltipOnly = document.getElementById("show-overlays-tooltip")?.checked;

  // Clear previous content completely
  container.innerHTML = "";
  container.style.width = "";
  container.style.height = "";

  // Load note colors
  const noteColors = await loadNoteColors();

  // Map note duration from HTML form values to VexFlow duration codes
  const durationMap = {
    eighth: "8",
    quarter: "q",
    half: "h",
    whole: "w",
  };
  const vfDuration = durationMap[noteDuration] || "q";

  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  const context = renderer.getContext();

  const stave = new VF.Stave(10, 40, 780);
  stave.addClef(entry.clef || "treble");

  // Add key signature if required
  if (
    accidentalDisplay === "key-signature-only" ||
    accidentalDisplay === "both"
  ) {
    const keySignature = getKeySignature(rootNote, scaleType);
    if (keySignature) {
      stave.addKeySignature(keySignature);
    }
  }

  // Add time signature if Show Time Signature is checked
  const showTimeSignatureCheckbox = document.getElementById(
    "show-time-signature"
  );
  if (showTimeSignatureCheckbox?.checked) {
    stave.addTimeSignature("4/4"); // Default to Common (4/4) time
  }

  stave.setContext(context).draw();

  // Use the same scale generation logic as the display
  let finalNotes = [];

  console.log("🎼 STAFF RENDERING - Using generateScaleNotesForDisplay");

  // Get scale notes from the same function used for display
  if (typeof window.generateScaleNotesForDisplay === "function") {
    finalNotes = window.generateScaleNotesForDisplay(
      scaleType,
      rootNote,
      startingOctave,
      octaveCount,
      direction,
      accidentalFamily
    );
    console.log(
      "🎼 Staff received notes from generateScaleNotesForDisplay:",
      finalNotes
    );
  } else {
    console.error(
      "🎼 generateScaleNotesForDisplay not available - this should not happen!"
    );
    // Fallback - but this should not happen
    finalNotes = [`${rootNote}${startingOctave}`, "Error"];
  }

  // Note: Direction reversal is already handled by generateScaleNotesForDisplay
  // No need to reverse again here as it would cause double reversal

  // Apply instrument transposition if needed
  const instrumentOffset = getInstrumentOffset(entry.instrument, entry.clef);
  if (instrumentOffset !== 0) {
    finalNotes = finalNotes.map((note) =>
      transposeFullNote(note, instrumentOffset)
    );
  }

  // Note: accidental family preference is already applied by generateScaleNotesForDisplay
  // No need to apply it again here - that was causing the sharp->flat conversion bug!

  function getInstrumentOffset(instrument, clef) {
    if (clef !== "treble") return 0;
    const instrumentOffsetMap = {
      "B♭ Treble": 2,
      "F Treble": -5,
      "E♭ Treble": 3,
      "A Treble": -3,
    };
    for (const [label, offset] of Object.entries(instrumentOffsetMap)) {
      if (instrument.includes(label)) return offset;
    }
    return 0;
  }

  function transposeFullNote(fullNote, semitones) {
    // Parse note like "C4" into note name and octave
    const match = fullNote.match(/^([A-Ga-g][#b]?)(\d+)$/);
    if (!match) return fullNote;

    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);

    // Use MIDI arithmetic for accurate transposition
    const originalMidi = spnToMidi(`${noteName}/${octave}`);
    const transposedMidi = originalMidi + semitones;
    const transposedSpn = midiToSpn(transposedMidi);

    return transposedSpn.replace("/", "");
  }

  const notesPerStave = 8;
  const staveHeight = 100;
  const staveGap = 40;
  const staveCount = Math.ceil(finalNotes.length / notesPerStave);
  const canvasHeight = 40 + staveCount * (staveHeight + staveGap);
  renderer.resize(800, canvasHeight);

  // Track color index for each note (by index in finalNotes)
  const vfNotes = finalNotes
    .map((note, noteIdx) => {
      // Parse SPN format (e.g., "C4" -> ["C", "4"])
      const spnRegex = /^([A-Ga-g][#b]?)(\d+)$/;
      const match = spnRegex.exec(note);
      if (!match) {
        console.warn(`Invalid SPN format: ${note}`);
        return null;
      }

      const [, pitch, octave] = match;

      // Handle special cases for VexFlow
      let vfPitch = pitch.toLowerCase();
      let accidental = null;

      // E# is enharmonically F, but VexFlow needs to show it as E with sharp
      if (pitch === "E#") {
        vfPitch = "e";
        accidental = "#";
      }
      // B# is enharmonically C, but VexFlow needs to show it as B with sharp
      else if (pitch === "B#") {
        vfPitch = "b";
        accidental = "#";
      }
      // Regular sharp/flat handling
      else if (pitch.includes("#")) {
        vfPitch = pitch.charAt(0).toLowerCase();
        accidental = "#";
      } else if (pitch.includes("b")) {
        vfPitch = pitch.charAt(0).toLowerCase();
        accidental = "b";
      }

      const key = `${vfPitch}/${octave}`; // VexFlow still needs slash for internal keys
      const fingeringKey = `${normalizeNoteName(pitch)}${octave}`;

      // Enhanced diagnostic logging for fingering lookups
      if (typeof diagnosticLog === "function") {
        diagnosticLog(
          `Fingering lookup: SPN = ${note}, VF key = ${key}, fingering key = ${fingeringKey}`
        );
      }
      console.log(
        `🔍 Fingering lookup: SPN = ${note}, VF key = ${key}, fingering key = ${fingeringKey}`
      );

      const isRootNote =
        note.startsWith(rootNote) && note.includes(startingOctave.toString());
      const vfNote = new VF.StaveNote({ keys: [key], duration: vfDuration });

      // Note color logic: use noteColorState[noteIdx] if present, else default (0)
      let colorIdx =
        noteColorState && typeof noteColorState[noteIdx] === "number"
          ? noteColorState[noteIdx]
          : 0;
      let color = noteColors[colorIdx % noteColors.length] || "black";

      // Check if note is within instrument's standard range and color red if out of range
      let outOfRange = false;
      if (entry.standardRange) {
        try {
          const noteMidi = spnToMidi(note);
          const minMidi = spnToMidi(entry.standardRange.start);
          const maxMidi = spnToMidi(entry.standardRange.end);
          if (noteMidi < minMidi || noteMidi > maxMidi) {
            outOfRange = true;
          }
        } catch (error) {
          console.warn(`⚠️ Range check failed for ${note}:`, error.message);
        }
      }
      if (outOfRange) {
        vfNote.setStyle({ fillStyle: "red", strokeStyle: "red" });
      } else {
        vfNote.setStyle({ fillStyle: color, strokeStyle: color });
      }

      // Add accidentals based on accidental display option
      if (accidental && accidentalDisplay !== "key-signature-only") {
        // Only add accidentals if not "key-signature-only" mode
        if (
          accidentalDisplay === "accidentals-only" ||
          accidentalDisplay === "both"
        ) {
          vfNote.addAccidental(0, new VF.Accidental(accidental));
        }
      }

      let label = "";
      if (displayMode === "midi") {
        try {
          const midi = spnToMidi(note);
          label = `${midi}`;
          if (typeof diagnosticLog === "function") {
            diagnosticLog(`MIDI conversion: ${note} → ${midi}`);
          }
          console.log(`🎹 MIDI for ${note}: ${midi}`);
        } catch (err) {
          console.warn(`⚠️ MIDI conversion failed for ${note}`, err);
          if (typeof diagnosticLog === "function") {
            diagnosticLog(`MIDI conversion ERROR: ${note} → ${err.message}`);
          }
          label = "?";
        }
      } else if (displayMode === "names") {
        // Convert ASCII accidentals to Unicode symbols for display
        label =
          typeof window.toDisplayFormat === "function"
            ? window.toDisplayFormat(pitch)
            : pitch;
      } else if (displayMode === "pitch") {
        label = note;
      } else if (displayMode === "cmt") {
        // Convert note to CMT format (note:duration)
        // For scales, assume quarter notes unless specified otherwise
        let duration = "q"; // default to quarter note
        if (vfDuration === "w") duration = "w";
        else if (vfDuration === "h") duration = "h";
        else if (vfDuration === "8") duration = "8";
        label = `${note}:${duration}`;
      } else if (
        displayMode === "fingering" ||
        displayMode === "fingering-alt"
      ) {
        const fingering = entry.fingering?.[fingeringKey];
        if (fingering) {
          label =
            displayMode === "fingering-alt"
              ? fingering.join(" / ")
              : fingering[0];
        } else {
          console.warn(`No fingering found for ${note} in ${entry.instrument}`);
        }
      }

      if (label) {
        if (!tooltipOnly) {
          const annotation = new VF.Annotation(label).setVerticalJustification(
            VF.Annotation.VerticalJustify.TOP
          );
          if (isRootNote) annotation.setFont("Arial", 12, "bold");
          vfNote.addAnnotation(0, annotation);
        } else {
          vfNote._overlayTooltip = label;
        }
      }

      return vfNote;
    })
    .filter((note) => note !== null);

  if (vfNotes.length === 0) {
    const fallback = new VF.StaveNote({ keys: ["g/4"], duration: vfDuration });
    fallback.addAnnotation(
      0,
      new VF.Annotation("⚠️ Error").setVerticalJustification(
        VF.Annotation.VerticalJustify.TOP
      )
    );
    vfNotes.push(fallback);
  }

  const staveWidth = 780;

  for (let i = 0; i < vfNotes.length; i += notesPerStave) {
    let chunk = vfNotes.slice(i, i + notesPerStave);
    if (i > 0 && finalNotes[i] === finalNotes[i - 1]) chunk = chunk.slice(1);

    const yOffset = 40 + (i / notesPerStave) * (staveHeight + staveGap);
    const stave = new VF.Stave(10, yOffset, staveWidth);
    stave.addClef(entry.clef || "treble");

    // Add key signature to all staves if required
    if (
      accidentalDisplay === "key-signature-only" ||
      accidentalDisplay === "both"
    ) {
      const keySignature = getKeySignature(rootNote, scaleType);
      if (keySignature) {
        stave.addKeySignature(keySignature);
      }
    }

    // Add time signature only to the topmost (first) stave when Show Time Signature is checked
    if (i === 0) {
      const showTimeSignatureCheckbox = document.getElementById(
        "show-time-signature"
      );
      if (showTimeSignatureCheckbox?.checked) {
        stave.addTimeSignature("4/4"); // Default to Common (4/4) time
      }
    }

    stave.setContext(context).draw();

    // Calculate total beats based on note duration
    const beatMap = {
      8: 0.5, // eighth note = 0.5 beats
      q: 1, // quarter note = 1 beat
      h: 2, // half note = 2 beats
      w: 4, // whole note = 4 beats
    };
    const beatsPerNote = beatMap[vfDuration] || 1;
    const totalBeats = chunk.length * beatsPerNote;

    const voice = new VF.Voice({ num_beats: totalBeats, beat_value: 4 });
    voice.addTickables(chunk);

    new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context, stave);

    // Add bar lines if enabled
    if (showBarLines && chunk.length > 1) {
      // Calculate notes per measure based on note duration in 4/4 time
      const notesPerMeasureMap = {
        w: 1, // whole notes: 1 per measure
        h: 2, // half notes: 2 per measure
        q: 4, // quarter notes: 4 per measure
        8: 8, // eighth notes: 8 per measure
      };
      const notesPerMeasure = notesPerMeasureMap[vfDuration] || 4;

      for (
        let noteIndex = notesPerMeasure;
        noteIndex < chunk.length;
        noteIndex += notesPerMeasure
      ) {
        // Calculate x position for bar line based on note positions
        const tickables = voice.getTickables();
        if (tickables[noteIndex]) {
          const barLineX = tickables[noteIndex].getBoundingBox().x - 5;
          // Draw a simple vertical line as bar line
          context.beginPath();
          context.moveTo(barLineX, stave.getYForLine(0));
          context.lineTo(barLineX, stave.getYForLine(4));
          context.stroke();
        }
      }
    }
  }

  // --- Tooltip overlay support for dynamically generated notes ---
  // Collect overlay tooltips for each note in order
  window._lastRenderedNotes = vfNotes.map((n) => n._overlayTooltip || null);

  // Attach tooltips and color-cycling click handlers
  setTimeout(() => {
    const svg = container.querySelector("svg");
    if (!svg) return;
    const noteGroups = svg.querySelectorAll("g.vf-stavenote");
    // Remove any previous tooltips
    let tooltipDiv = document.getElementById("vf-tooltip");
    if (!tooltipDiv) {
      tooltipDiv = document.createElement("div");
      tooltipDiv.id = "vf-tooltip";
      tooltipDiv.style.position = "absolute";
      tooltipDiv.style.pointerEvents = "none";
      tooltipDiv.style.background = "rgba(0,0,0,0.85)";
      tooltipDiv.style.color = "white";
      tooltipDiv.style.padding = "2px 6px";
      tooltipDiv.style.borderRadius = "4px";
      tooltipDiv.style.fontSize = "14px";
      tooltipDiv.style.zIndex = 1000;
      tooltipDiv.style.display = "none";
      document.body.appendChild(tooltipDiv);
    }
    noteGroups.forEach((g, idx) => {
      // Tooltip handlers
      g.onmouseenter = (e) => {
        const label = window._lastRenderedNotes[idx];
        if (!label) return;
        tooltipDiv.textContent = label;
        tooltipDiv.style.display = "block";
        tooltipDiv.style.left = e.clientX + 10 + "px";
        tooltipDiv.style.top = e.clientY - 10 + "px";
      };
      g.onmousemove = (e) => {
        tooltipDiv.style.left = e.clientX + 10 + "px";
        tooltipDiv.style.top = e.clientY - 10 + "px";
      };
      g.onmouseleave = () => {
        tooltipDiv.style.display = "none";
      };
      // Color-cycling click handler
      g.style.cursor = "pointer";
      g.onclick = () => {
        if (!noteColors.length) return;
        let curIdx =
          noteColorState && typeof noteColorState[idx] === "number"
            ? noteColorState[idx]
            : 0;
        let nextIdx = (curIdx + 1) % noteColors.length;
        if (typeof onNoteColorChange === "function") {
          onNoteColorChange(idx, nextIdx);
        }
      };
    });
  }, 0);
}
