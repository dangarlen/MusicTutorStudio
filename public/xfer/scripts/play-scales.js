// play-scales.js

console.log("play-scales.js loaded and executing");

const VF = Vex.Flow;
const div = document.getElementById("vf");

const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
renderer.resize(600, 150);
const context = renderer.getContext();

const stave = new VF.Stave(10, 40, 580);
stave.addClef("treble");
stave.setContext(context).draw();

const noteDefs = [
  { key: "c/4", pitch: "C4" },
  { key: "d/4", pitch: "D4" },
  { key: "e/4", pitch: "E4" },
  { key: "f/4", pitch: "F4" },
  { key: "g/4", pitch: "G4" },
  { key: "a/4", pitch: "A4" },
  { key: "b/4", pitch: "B4" },
  { key: "c/5", pitch: "C5" },
];

// Check if tooltip-only overlays are enabled
const tooltipOnly = document.getElementById("show-overlays-tooltip")?.checked;

// Helper to get overlay label for a noteDef (customize as needed)
function getOverlayLabel(def) {
  // Example: show note name and pitch; expand as needed for SPN, CMT, MIDI, fingering, etc.
  return `${def.pitch}`;
}

const notes = noteDefs.map((def) => {
  const note = new VF.StaveNote({ keys: [def.key], duration: "q" });
  if (!tooltipOnly) {
    // Show overlay as annotation above note
    const annotation = new VF.Annotation(
      getOverlayLabel(def)
    ).setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
    note.addAnnotation(0, annotation);
  } else {
    // Store overlay label for tooltip use
    note._overlayTooltip = getOverlayLabel(def);
  }
  return note;
});

const voice = new VF.Voice({ num_beats: 8, beat_value: 4 }).addTickables(notes);
new VF.Formatter().joinVoices([voice]).format([voice], 500);
voice.draw(context, stave);

const svg = div.querySelector("svg");
const allGroups = Array.from(svg.querySelectorAll("g.vf-note"));
const noteGroups = [];
const seen = new Set();
for (const group of allGroups) {
  const bbox = group.getBBox();
  const key = `${Math.round(bbox.x)},${Math.round(bbox.y)}`;
  if (!seen.has(key)) {
    noteGroups.push(group);
    seen.add(key);
  }
  if (noteGroups.length === notes.length) break;
}

// Tooltip overlay logic (similar to render-scale.js)
if (tooltipOnly) {
  setTimeout(() => {
    // Remove any previous tooltip div
    let tooltipDiv = document.getElementById("vf-tooltip");
    if (!tooltipDiv) {
      tooltipDiv = document.createElement("div");
      tooltipDiv.id = "vf-tooltip";
      tooltipDiv.style.position = "absolute";
      tooltipDiv.style.pointerEvents = "none";
      tooltipDiv.style.background = "#222";
      tooltipDiv.style.color = "#fff";
      tooltipDiv.style.padding = "2px 8px";
      tooltipDiv.style.borderRadius = "4px";
      tooltipDiv.style.fontSize = "14px";
      tooltipDiv.style.zIndex = 1000;
      tooltipDiv.style.display = "none";
      document.body.appendChild(tooltipDiv);
    }
    // Attach mouse events to each note group
    noteGroups.forEach((group, i) => {
      group.onmouseenter = (e) => {
        const label = notes[i]._overlayTooltip || "";
        if (!label) return;
        tooltipDiv.textContent = label;
        tooltipDiv.style.display = "block";
        const rect = group.getBoundingClientRect();
        tooltipDiv.style.left = `${
          rect.left + window.scrollX + rect.width / 2
        }px`;
        tooltipDiv.style.top = `${rect.top + window.scrollY - 32}px`;
      };
      group.onmouseleave = () => {
        tooltipDiv.style.display = "none";
      };
    });
  }, 0);
}

const synth = new Tone.Synth().toDestination();
let interval = null;

document.getElementById("play").addEventListener("click", async () => {
  const playBtn = document.getElementById("play");

  if (interval) {
    clearInterval(interval);
    interval = null;
    noteGroups.forEach((g) => g.classList.remove("note-highlight"));
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶️ Play Scale";
    return;
  }

  await Tone.start();
  playBtn.classList.add("playing");
  playBtn.textContent = "⏹ Stop";

  let index = 0;
  const intervalMs = 500;

  interval = setInterval(() => {
    noteGroups.forEach((g) => g.classList.remove("note-highlight"));

    if (index >= noteDefs.length) {
      clearInterval(interval);
      interval = null;
      playBtn.classList.remove("playing");
      playBtn.textContent = "▶️ Play Scale";
      return;
    }

    synth.triggerAttackRelease(noteDefs[index].pitch, "8n");
    noteGroups[index].classList.add("note-highlight");

    index++;
  }, intervalMs);
});
