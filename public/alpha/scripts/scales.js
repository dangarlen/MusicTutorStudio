// scales.js

// Handles dynamic title updates and scale display logic for create-scales.html
// Show/hide Scale Display block and render VexFlow staff when both key and scale type are selected
export function setupScaleDisplay({
  keySelector = "#key-select",
  scaleTypeSelector = "#scale-type-select",
  displayBlockId = "scale-display-block",
  displayToggleId = "scale-display-toggle",
  vexflowContainerId = "vf",
} = {}) {
  const keyEl = document.querySelector(keySelector);
  const scaleTypeEl = document.querySelector(scaleTypeSelector);
  const displayToggle = document.getElementById(displayToggleId);
  const vfDiv = document.getElementById(vexflowContainerId);

  function updateDisplayBlock() {
    const key = keyEl?.value;
    const scaleType = scaleTypeEl?.value;
    const octaves = globalThis.getNumberOfOctaves
      ? globalThis.getNumberOfOctaves()
      : 2;
    const direction =
      document.getElementById("direction")?.value?.toLowerCase() || "ascending";
    const noteDuration =
      document.querySelector('input[name="note-duration"]:checked')?.value ||
      "quarter";
    const accidentals =
      document.querySelector('input[name="accidental-family"]:checked')
        ?.value || "auto-key";

    if (key && scaleType) {
      displayToggle.checked = true;
      // Call buildScaleFromUI and render staff
      import("./buildScaleFromUI.js").then(({ buildScaleFromUI }) => {
        const result = buildScaleFromUI({
          key,
          scaleType,
          octaves,
          direction,
          noteDuration,
          accidentals,
        });
        renderVexflowStaff(vfDiv, result.scaleNotes);
        // Optionally update textual note output
        const notesDisplay = document.getElementById("scale-notes-display");
        if (notesDisplay) {
          notesDisplay.textContent = result.scaleNotes.join(", ");
        }
      });
    } else {
      displayToggle.checked = false;
      if (vfDiv) vfDiv.innerHTML = "";
    }
  }

  if (keyEl) keyEl.addEventListener("change", updateDisplayBlock);
  if (scaleTypeEl) scaleTypeEl.addEventListener("change", updateDisplayBlock);
  // Also wire up other controls
  // Wire up octave stepper
  const minusBtn = document.getElementById("octave-minus");
  const plusBtn = document.getElementById("octave-plus");
  if (minusBtn) minusBtn.addEventListener("click", updateDisplayBlock);
  if (plusBtn) plusBtn.addEventListener("click", updateDisplayBlock);
  for (const id of ["direction"]) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", updateDisplayBlock);
  }
  for (const el of document.querySelectorAll('input[name="note-duration"]')) {
    el.addEventListener("change", updateDisplayBlock);
  }
  for (const el of document.querySelectorAll(
    'input[name="accidental-family"]'
  )) {
    el.addEventListener("change", updateDisplayBlock);
  }
}

// Minimal VexFlow rendering for demonstration
export function renderVexflowStaff(container, scaleNotes = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!globalThis?.Vex?.Flow) {
    container.textContent = "VexFlow not loaded.";
    return;
  }
  const VF = globalThis.Vex.Flow;
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(400, 120);
  const context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  const stave = new VF.Stave(10, 40, 380);
  stave.addClef("treble").addTimeSignature("4/4");
  stave.setContext(context).draw();
  // Render notes if available
  if (scaleNotes.length > 0) {
    // This is a stub: render all notes as quarter notes on the staff
    const notes = scaleNotes.map(
      (n) =>
        new VF.StaveNote({
          clef: "treble",
          keys: [n],
          duration: "q",
        })
    );
    const voice = new VF.Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(notes);
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], 350);
    voice.draw(context, stave);
  }
}
