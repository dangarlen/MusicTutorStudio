// show-scales.js

console.log("show-scales.js loaded and executing");

// Test function to verify dependencies
function testDependencies() {
  console.log("Testing dependencies...");
  console.log("window.spnToMidi:", typeof window.spnToMidi);
  console.log("window.midiToSpn:", typeof window.midiToSpn);
  console.log("window.normalizeNoteName:", typeof window.normalizeNoteName);
  console.log("window.majorSteps:", window.majorSteps);
  console.log("window.minorSteps:", window.minorSteps);
  console.log("window.chromatic:", window.chromatic);
  console.log("window.noteMap:", window.noteMap);

  // Show debug info on page
  const debugDiv = document.getElementById("scale-notes-display");
  let debugInfo = "DEBUG INFO:\n";
  debugInfo += `spnToMidi: ${typeof window.spnToMidi}\n`;
  debugInfo += `midiToSpn: ${typeof window.midiToSpn}\n`;
  debugInfo += `normalizeNoteName: ${typeof window.normalizeNoteName}\n`;
  debugInfo += `majorSteps: ${
    window.majorSteps ? window.majorSteps.join(",") : "undefined"
  }\n`;
  debugInfo += `minorSteps: ${
    window.minorSteps ? window.minorSteps.join(",") : "undefined"
  }\n`;
  debugInfo += `chromatic: ${
    window.chromatic
      ? window.chromatic.slice(0, 3).join(",") + "..."
      : "undefined"
  }\n`;
  debugInfo += `noteMap keys: ${
    window.noteMap ? Object.keys(window.noteMap).length : "undefined"
  }\n`;

  if (
    window.spnToMidi &&
    window.noteMap &&
    Object.keys(window.noteMap).length > 0
  ) {
    try {
      const testMidi = window.spnToMidi("C/4");
      debugInfo += `Test C/4 to MIDI: ${testMidi}\n`;
      const testSpn = window.midiToSpn(testMidi);
      debugInfo += `Test back to SPN: ${testSpn}\n`;
    } catch (e) {
      debugInfo += `Test conversion failed: ${e.message}\n`;
    }
  }

  if (debugDiv) {
    debugDiv.textContent = debugInfo;
  }
}

// Global diagnostic mode state
let isDiagnosticMode = false;

// Toggle diagnostic mode functionality
function toggleDiagnosticMode(enabled) {
  isDiagnosticMode = enabled;

  // Show/hide the entire Textual Note Output section
  const textualOutputSection = document.getElementById("textual-note-output");
  if (textualOutputSection) {
    textualOutputSection.style.display = enabled ? "block" : "none";
  }

  // Show/hide diagnostic information in the scale display
  const debugDiv = document.getElementById("scale-notes-display");
  if (debugDiv) {
    if (!enabled) {
      // Clear display when diagnostic mode is disabled (scale display is diagnostic-only)
      debugDiv.textContent = "";
    } else {
      // Update display when diagnostic mode is enabled
      updateScaleNotesDisplay();
    }
  }

  console.log(`Diagnostic mode ${enabled ? "enabled" : "disabled"}`);
}

// Enhanced logging function that respects diagnostic mode
function diagnosticLog(message, ...args) {
  if (isDiagnosticMode) {
    console.log(`[DIAGNOSTIC] ${message}`, ...args);
  }
}

// Helper function to convert checkbox states to accidental display value
function getAccidentalDisplayValue(showKeySignature, showAccidentals) {
  if (showKeySignature && showAccidentals) {
    return "both";
  } else if (showKeySignature && !showAccidentals) {
    return "key-signature-only";
  } else if (!showKeySignature && showAccidentals) {
    return "accidentals-only";
  } else {
    // If neither is checked, default to both
    return "both";
  }
}

// Helper function to set checkbox states from accidental display value
function setAccidentalDisplayCheckboxes(accidentalDisplay) {
  const showKeySignatureCheckbox =
    document.getElementById("show-key-signature");
  const showAccidentalsCheckbox = document.getElementById("show-accidentals");

  if (showKeySignatureCheckbox && showAccidentalsCheckbox) {
    switch (accidentalDisplay) {
      case "both":
        showKeySignatureCheckbox.checked = true;
        showAccidentalsCheckbox.checked = true;
        break;
      case "key-signature-only":
        showKeySignatureCheckbox.checked = true;
        showAccidentalsCheckbox.checked = false;
        break;
      case "accidentals-only":
        showKeySignatureCheckbox.checked = false;
        showAccidentalsCheckbox.checked = true;
        break;
      default:
        showKeySignatureCheckbox.checked = true;
        showAccidentalsCheckbox.checked = true;
        break;
    }
  }
}

let startingOctave = 4;

//////////////// Display Option Defaults and Cookie Logic ////////////////
const defaultDisplayOption = "note-names";
const cookieKey = "displayOption";

// Read cookie if it exists
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Set cookie
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function initializeStartingOctaveControls(entry) {
  const rootNote = document.getElementById("root-note").value;
  const octaveCount = parseInt(document.getElementById("octave-count").value);

  const range = getUsableOctaveRange(entry, rootNote, octaveCount);
  usableOctaveRange = range;

  const raw = entry.defaultStartingOctave ?? "4";
  const match = raw.toString().match(/\d+/);
  let proposed = match ? parseInt(match[0]) : 4;

  // Clamp to usable range
  startingOctave = Math.min(Math.max(proposed, range.min), range.max);

  updateOctaveLabel();

  // Remove existing event listeners to prevent duplicates
  const decrementBtn = document.getElementById("octave-decrement");
  const incrementBtn = document.getElementById("octave-increment");

  // Clone nodes to remove all event listeners
  const newDecrementBtn = decrementBtn.cloneNode(true);
  const newIncrementBtn = incrementBtn.cloneNode(true);
  decrementBtn.parentNode.replaceChild(newDecrementBtn, decrementBtn);
  incrementBtn.parentNode.replaceChild(newIncrementBtn, incrementBtn);

  document.getElementById("octave-decrement").onclick = () => {
    if (startingOctave > range.min) {
      startingOctave--;
      updateOctaveLabel();
      renderCurrentScale();
    }
  };

  document.getElementById("octave-increment").onclick = () => {
    if (startingOctave < range.max) {
      startingOctave++;
      updateOctaveLabel();
      renderCurrentScale();
    }
  };
}

function updateOctaveLabel() {
  document.getElementById("starting-octave-label").textContent = startingOctave;
}

// Apply saved or default display option
function initializeDisplayOption() {
  const saved = getCookie(cookieKey);
  const selected = saved || defaultDisplayOption;

  const radio = document.querySelector(
    `input[name="display-option"][value="${selected}"]`
  );
  if (radio) radio.checked = true;

  applyDisplayOption(selected);
}
//////////////////////////////////////////////////////////////////////////

///// Populate Root Note Dropdown ///////
fetch("data/show-scales.json")
  .then((res) => res.json())
  .then((data) => {
    const select = document.getElementById("root-note");
    data.rootNotes.forEach(({ value, label }) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    });

    // Trigger a re-render in case everything else is ready
    if (
      window.noteMap &&
      Object.keys(window.noteMap).length > 0 &&
      fingeringData.length > 0
    ) {
      setTimeout(renderCurrentScale, 100);
    }
  });

///// Load Fingering Data and Initialize App ///////

window.noteMap = {};
let fingeringData = [];

fetch("data/pitch-class.json")
  .then((res) => {
    if (!res.ok) {
      console.error(
        `❌ Failed to load pitch-class.json: HTTP ${res.status} ${res.statusText}`
      );
      return null;
    }
    return res.text();
  })
  .then((text) => {
    if (!text) return;

    try {
      const pitchClassData = JSON.parse(text);
      window.noteMap = pitchClassData.noteMap;
    } catch (err) {
      console.error("❌ pitch-class.json is not valid JSON:", err.message);
      return;
    }

    return fetch("data/instruments.json");
  })
  .then((res) => {
    if (!res || !res.ok) {
      console.error(
        `❌ Failed to load instruments.json: HTTP ${res?.status} ${res?.statusText}`
      );
      return null;
    }
    return res.text();
  })
  .then((text) => {
    if (!text) return;

    try {
      const data = JSON.parse(text);
      fingeringData = data;
    } catch (err) {
      console.error("❌ instruments.json is not valid JSON:", err.message);
      return;
    }

    populateInstrumentDropdown();

    const dropdown = document.getElementById("instrument-select");
    const entry = fingeringData.find((e) => e.instrument === dropdown.value);
    if (entry) initializeStartingOctaveControls(entry);

    applySavedPreferences();
    attachEventListeners();
    renderCurrentScale();
  })
  .catch((error) => {
    console.error("❌ Unexpected loader error:", error.message);
  });

///// Load and Populate Practice Passages ///////
let practicePassagesData = [];

function loadPracticePassages() {
  // Fetch the list of practice passage files
  const passageFiles = [
    "danny-boy.json",
    "king-of-the-road.json",
    "twinkle-twinkle-little-star.json",
  ];

  console.log("Loading practice passages...");

  const fetchPromises = passageFiles.map((filename) => {
    return fetch(`practicePassages/${filename}`)
      .then((res) => {
        if (!res.ok) {
          console.warn(`⚠️ Could not load ${filename}: HTTP ${res.status}`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          // Add filename for reference
          data.filename = filename;
          // Create display name from title or filename
          data.displayName =
            data.title || filename.replace(".json", "").replace(/-/g, " ");
          return data;
        }
        return null;
      })
      .catch((error) => {
        console.warn(`⚠️ Error loading ${filename}:`, error.message);
        return null;
      });
  });

  Promise.all(fetchPromises)
    .then((results) => {
      practicePassagesData = results.filter((passage) => passage !== null);
      console.log(
        `✅ Loaded ${practicePassagesData.length} practice passages:`,
        practicePassagesData.map((p) => p.displayName)
      );
      populatePracticePassageDropdown();
    })
    .catch((error) => {
      console.error("❌ Error loading practice passages:", error.message);
    });
}

function populatePracticePassageDropdown() {
  const dropdown = document.getElementById("passage-select");
  if (!dropdown) {
    console.warn("⚠️ Practice passage dropdown not found");
    return;
  }

  // Clear existing options except the first placeholder
  dropdown.innerHTML = '<option value="">Select passage...</option>';

  practicePassagesData.forEach((passage) => {
    const option = document.createElement("option");
    option.value = passage.filename;
    option.textContent = passage.displayName;
    dropdown.appendChild(option);
  });

  console.log(
    `📁 Populated passage dropdown with ${practicePassagesData.length} options`
  );
}

function getSelectedPracticePassage() {
  const dropdown = document.getElementById("passage-select");
  if (!dropdown || !dropdown.value) {
    diagnosticLog("No practice passage selected or dropdown not found");
    return null;
  }

  const selected = practicePassagesData.find(
    (passage) => passage.filename === dropdown.value
  );

  diagnosticLog(
    "Selected practice passage:",
    selected ? selected.displayName : "Not found"
  );
  return selected;
}

// Initialize practice passages after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Load practice passages
  loadPracticePassages();
});

///// Populate Instrument Dropdown ///////
function populateInstrumentDropdown() {
  const dropdown = document.getElementById("instrument-select");
  dropdown.innerHTML = "";

  const seen = new Set();
  fingeringData.forEach((entry) => {
    if (!seen.has(entry.instrument)) {
      seen.add(entry.instrument);
      const opt = document.createElement("option");
      opt.value = entry.instrument;
      opt.textContent = entry.instrument;
      dropdown.appendChild(opt);
    }
  });

  const saved = getCookie("instrument");
  if (saved && seen.has(saved)) {
    dropdown.value = saved;
  }
}

///// Attach Change Listeners and Persist Selections ///////
function attachEventListeners() {
  document
    .getElementById("instrument-select")
    .addEventListener("change", (e) => {
      const selected = e.target.value;
      setCookie("instrument", selected);

      const entry = fingeringData.find((e) => e.instrument === selected);
      if (entry) initializeStartingOctaveControls(entry); // 🔄 update octave

      renderCurrentScale();
    });

  document.getElementById("scale-type").onchange = renderCurrentScale;

  document.getElementById("root-note").addEventListener("change", () => {
    const instrumentName = document.getElementById("instrument-select").value;
    const entry = fingeringData.find((e) => e.instrument === instrumentName);
    if (entry) initializeStartingOctaveControls(entry);
    renderCurrentScale();
  });

  document.getElementById("direction").onchange = renderCurrentScale;

  document.getElementById("octave-count").addEventListener("change", () => {
    const instrumentName = document.getElementById("instrument-select").value;
    const entry = fingeringData.find((e) => e.instrument === instrumentName);
    if (entry) initializeStartingOctaveControls(entry);
    renderCurrentScale();
  });

  document.querySelectorAll('input[name="display-option"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const selected = e.target.value;
      setCookie("displayOption", selected);
      renderCurrentScale();
    });
  });

  // Handle accidental display checkboxes
  document
    .getElementById("show-key-signature")
    ?.addEventListener("change", () => {
      const showKeySignature =
        document.getElementById("show-key-signature").checked;
      const showAccidentals =
        document.getElementById("show-accidentals").checked;
      const accidentalDisplay = getAccidentalDisplayValue(
        showKeySignature,
        showAccidentals
      );
      setCookie("accidentalDisplay", accidentalDisplay);
      renderCurrentScale();
    });

  document
    .getElementById("show-accidentals")
    ?.addEventListener("change", () => {
      const showKeySignature =
        document.getElementById("show-key-signature").checked;
      const showAccidentals =
        document.getElementById("show-accidentals").checked;
      const accidentalDisplay = getAccidentalDisplayValue(
        showKeySignature,
        showAccidentals
      );
      setCookie("accidentalDisplay", accidentalDisplay);
      renderCurrentScale();
    });

  // Handle show bar lines checkbox
  document.getElementById("show-bar-lines")?.addEventListener("change", (e) => {
    const showBarLines = e.target.checked;
    setCookie("showBarLines", showBarLines);
    renderCurrentScale();
    console.log("Show Bar Lines setting:", showBarLines);
  });

  // Handle show time signature checkbox
  document
    .getElementById("show-time-signature")
    ?.addEventListener("change", (e) => {
      const showTimeSignature = e.target.checked;
      setCookie("showTimeSignature", showTimeSignature);
      console.log("Show Time Signature setting:", showTimeSignature);

      // Trigger re-render of current scale to show/hide time signature
      renderCurrentScale();
    });

  document
    .querySelectorAll('input[name="accidental-family"]')
    .forEach((radio) => {
      radio.addEventListener("change", () => {
        renderCurrentScale();
      });
    });

  document.querySelectorAll('input[name="note-duration"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const selected = e.target.value;
      setCookie("noteDuration", selected);
      renderCurrentScale();
    });
  });

  // Practice Passage Selection Event Listener
  const passageDropdown = document.getElementById("passage-select");
  if (passageDropdown) {
    passageDropdown.addEventListener("change", function () {
      const selectedPassage = getSelectedPracticePassage();
      if (selectedPassage) {
        console.log(
          `📁 Selected practice passage: ${selectedPassage.displayName}`
        );
        diagnosticLog("Selected passage data:", selectedPassage);
      }
      // Update dynamic title when passage selection changes
      updateDynamicTitle();
      // Update textual display for the selected passage
      updatePassageTextualDisplay();
      // Render the selected practice passage
      renderCurrentScale();
    });
  }

  // Diagnostic Mode Event Listener
  const diagnosticCheckbox = document.getElementById("diagnostic-mode");
  if (diagnosticCheckbox) {
    diagnosticCheckbox.addEventListener("change", function () {
      setCookie("diagnosticMode", this.checked.toString());
      toggleDiagnosticMode(this.checked);
      if (this.checked) {
        testDependencies();
      }
      renderCurrentScale();
    });
  }
}

function getUsableOctaveRange(entry, rootNote, octaveCount) {
  // Accept 'C/4' or 'C4'
  if (!/^[A-Ga-g][#b]?(?:\/)?\d+$/.test(entry.standardRange.start)) {
    console.warn(`⚠️ Malformed SPN: ${entry.standardRange.start}`);
  }
  const minMidi = spnToMidi(entry.standardRange.start);
  const maxMidi = spnToMidi(entry.standardRange.end);

  if (
    !rootNote ||
    typeof rootNote !== "string" ||
    !/^[A-Ga-g][#b]?$/.test(rootNote)
  ) {
    console.warn(
      `⚠️ Invalid rootNote: '${rootNote}' — skipping usable range calculation`
    );
    return { min: null, max: null };
  }

  let min = null;
  let max = null;

  for (let oct = 0; oct <= 9; oct++) {
    const spn = `${normalizeNoteName(rootNote)}/${oct}`;
    try {
      const start = spnToMidi(spn);
      const end = start + octaveCount * 7;
      if (start >= minMidi && end <= maxMidi) {
        if (min === null) min = oct;
        max = oct;
      }
    } catch (err) {
      console.warn(`⚠️ Invalid SPN "${spn}" — ${err.message}`);
    }
  }

  console.log(`Usable Starting Octave Range: MIN = ${min}, MAX = ${max}`);
  return { min, max };
}

///// Generate Scale Notes for Display ///////
// Key signature helper - determines if a key should use sharps or flats
function getKeySignaturePreference(rootNote) {
  const sharpKeys = ["C", "G", "D", "A", "E", "B", "F#", "C#"];
  const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];

  // For enharmonic equivalents, respect the user's choice of spelling
  // Don't automatically convert C# to Db, etc.
  if (flatKeys.includes(rootNote)) {
    return "flats";
  } else if (sharpKeys.includes(rootNote)) {
    return "sharps";
  } else {
    // For enharmonic equivalents not in the standard lists
    const enharmonicMap = {
      "A#": "sharps",
      "D#": "sharps",
      "G#": "sharps",
    };
    return enharmonicMap[rootNote] || "sharps";
  }
}

// Convert note to preferred accidental family
function convertToAccidentalFamily(note, preferredFamily) {
  // Extract note name and octave
  const match = note.match(/^([A-G][#b]?)(\d*)$/);
  if (!match) return note;

  const [, noteName, octave] = match;

  if (preferredFamily === "flats") {
    const sharpToFlat = {
      "C#": "Db",
      "D#": "Eb",
      "F#": "Gb",
      "G#": "Ab",
      "A#": "Bb",
      // Note: E# and B# are preserved when they appear in theoretical scales
      // as they maintain proper scale degree relationships
    };
    return (sharpToFlat[noteName] || noteName) + octave;
  } else if (preferredFamily === "sharps") {
    const flatToSharp = {
      Db: "C#",
      Eb: "D#",
      Gb: "F#",
      Ab: "G#",
      Bb: "A#",
      // Note: Cb and Fb are preserved when they appear in theoretical scales
      // as they maintain proper scale degree relationships
    };
    return (flatToSharp[noteName] || noteName) + octave;
  }
  return note;
}

function generateScaleNotesForDisplay(
  scaleType,
  rootNote,
  startingOctave,
  octaveCount,
  direction,
  accidentalFamily = "auto-key"
) {
  console.log(
    "🎵 SCALE GENERATION START - generateScaleNotesForDisplay called with params:",
    {
      scaleType,
      rootNote,
      startingOctave,
      octaveCount,
      direction,
      accidentalFamily,
    }
  );

  let finalNotes = [];

  if (scaleType === "chromatic") {
    // For chromatic, use all 12 notes per octave
    for (let oct = 0; oct < octaveCount; oct++) {
      const currentOctave = startingOctave + oct;
      for (const note of chromatic) {
        finalNotes.push(`${note}${currentOctave}`);
      }
    }
    // Add final note to complete the scale
    finalNotes.push(`${chromatic[0]}${startingOctave + octaveCount}`);
  } else {
    // For major/minor scales, use proper diatonic scale theory
    const steps = scaleType === "major" ? majorSteps : minorSteps;

    // Don't normalize the root note for diatonic scales - preserve the user's enharmonic choice
    // This ensures Db Major stays as Db Major and doesn't become C# Major

    // Generate scale using proper music theory
    finalNotes = generateDiatonicScale(
      rootNote, // Use original root note, not normalized
      steps,
      startingOctave,
      octaveCount
    );
  }

  console.log(
    "🎵 Raw generated notes (before accidental family conversion):",
    finalNotes
  );

  // Apply accidental family preference - but only for chromatic scales
  // or when not using theoretical scale patterns
  let preferredFamily = "sharps"; // default

  if (accidentalFamily === "auto-key") {
    preferredFamily = getKeySignaturePreference(rootNote);
    console.log(
      `🎵 Auto-key determined family: ${preferredFamily} for root ${rootNote}`
    );
  } else if (accidentalFamily === "force-sharps") {
    preferredFamily = "sharps";
  } else if (accidentalFamily === "force-flats") {
    preferredFamily = "flats";
  }

  console.log(`🎵 Using accidental family: ${preferredFamily}`);

  // Only convert accidental family for chromatic scales or when forcing a specific family
  // For diatonic scales, trust the theoretical pattern which already has correct enharmonics
  if (scaleType === "chromatic" || accidentalFamily.startsWith("force-")) {
    // Convert notes to preferred accidental family
    finalNotes = finalNotes.map((note) =>
      convertToAccidentalFamily(note, preferredFamily)
    );
    console.log("🎵 Applied accidental family conversion to notes");
  } else {
    console.log(
      "🎵 Skipped accidental family conversion - using theoretical pattern"
    );
  }

  if (direction === "Descending") {
    finalNotes.reverse();
    console.log("🎵 Reversed for descending direction");
  }

  console.log("🎵 FINAL SCALE NOTES:", finalNotes);
  return finalNotes;
}

// Generate a diatonic scale using proper music theory
function generateDiatonicScale(rootNote, steps, startingOctave, octaveCount) {
  // Letter names in order
  const letterNames = ["C", "D", "E", "F", "G", "A", "B"];

  // Find starting letter index
  const rootLetter = rootNote.charAt(0);
  const rootLetterIndex = letterNames.indexOf(rootLetter);

  // Key signatures for major scales (number of sharps/flats)
  const keySignatures = {
    C: { sharps: 0, flats: 0, family: "natural" },
    G: { sharps: 1, flats: 0, family: "sharps" },
    D: { sharps: 2, flats: 0, family: "sharps" },
    A: { sharps: 3, flats: 0, family: "sharps" },
    E: { sharps: 4, flats: 0, family: "sharps" },
    B: { sharps: 5, flats: 0, family: "sharps" },
    "F#": { sharps: 6, flats: 0, family: "sharps" },
    "C#": { sharps: 7, flats: 0, family: "sharps" },
    F: { sharps: 0, flats: 1, family: "flats" },
    Bb: { sharps: 0, flats: 2, family: "flats" },
    Eb: { sharps: 0, flats: 3, family: "flats" },
    Ab: { sharps: 0, flats: 4, family: "flats" },
    Db: { sharps: 0, flats: 5, family: "flats" },
    Gb: { sharps: 0, flats: 6, family: "flats" },
    Cb: { sharps: 0, flats: 7, family: "flats" },
  };

  // Get the correct accidentals for this key
  const keyInfo = keySignatures[rootNote];
  if (!keyInfo) {
    // Fallback to MIDI-based generation for unsupported keys
    return generateScaleWithMidi(rootNote, steps, startingOctave, octaveCount);
  }

  // Build the scale using music theory
  const scaleNotes = [];

  // Generate all notes for the requested octaves
  for (let octave = 0; octave < octaveCount; octave++) {
    const currentOctave = startingOctave + octave;
    for (let degree = 0; degree < 7; degree++) {
      const letterIndex = (rootLetterIndex + degree) % 7;
      const letter = letterNames[letterIndex];

      // Calculate what accidental this note should have
      const accidental = getAccidentalForNote(
        letter,
        rootNote,
        degree,
        keyInfo
      );

      // Handle octave changes when we wrap around the letters
      let noteOctave = currentOctave;
      if (degree > 0 && letterIndex < rootLetterIndex) {
        noteOctave++;
      }

      const note = letter + accidental + noteOctave;
      scaleNotes.push(note);
    }
  }

  // Add the final octave note (completing the scale)
  const finalLetter = letterNames[rootLetterIndex];
  const finalAccidental = getAccidentalForNote(
    finalLetter,
    rootNote,
    0,
    keyInfo
  );
  scaleNotes.push(
    finalLetter + finalAccidental + (startingOctave + octaveCount)
  );

  return scaleNotes;
}

// Get the correct accidental for a note in a given key
function getAccidentalForNote(letter, rootNote, degree, keyInfo) {
  // Specific mappings for common keys
  const scalePatterns = {
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
    Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
    Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    F: ["F", "G", "A", "Bb", "C", "D", "E"],
    C: ["C", "D", "E", "F", "G", "A", "B"],
    G: ["G", "A", "B", "C", "D", "E", "F#"],
    D: ["D", "E", "F#", "G", "A", "B", "C#"],
    A: ["A", "B", "C#", "D", "E", "F#", "G#"],
    E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  };

  const pattern = scalePatterns[rootNote];
  const targetNote = pattern?.[degree];
  if (targetNote && targetNote.charAt(0) === letter) {
    return targetNote.substring(1); // Return the accidental part
  }

  return ""; // No accidental
}

// Fallback function using MIDI arithmetic
function generateScaleWithMidi(rootNote, steps, startingOctave, octaveCount) {
  // For MIDI calculations, we need to normalize to get the semitone offset,
  // but we should try to preserve the user's enharmonic choice in the output
  const rootNormalized = normalizeNoteName(rootNote);
  let currentMidi = spnToMidi(`${rootNormalized}/${startingOctave}`);
  const finalNotes = [];

  // Add root note using original spelling, not normalized
  finalNotes.push(`${rootNote}${startingOctave}`);

  // Generate notes for the requested number of octaves
  const totalSteps = octaveCount * steps.length;
  for (let i = 0; i < totalSteps; i++) {
    const stepIndex = i % steps.length;
    currentMidi += steps[stepIndex];
    const noteSpn = midiToSpn(currentMidi);
    finalNotes.push(noteSpn.replace("/", ""));
  }

  return finalNotes;
}

// Make function available globally for render-scale.js
window.generateScaleNotesForDisplay = generateScaleNotesForDisplay;
window.generateScaleNotesForDisplay = generateScaleNotesForDisplay;

///// Update Scale Notes Display ///////
function updateScaleNotesDisplay() {
  const scaleType = document.getElementById("scale-type").value;
  const rootNote = document.getElementById("root-note").value;
  const direction = document.getElementById("direction").value;
  const octaveCount = parseInt(document.getElementById("octave-count").value);
  const displayElement = document.getElementById("scale-notes-display");

  diagnosticLog("=== updateScaleNotesDisplay() called ===");
  diagnosticLog("Scale Type:", scaleType);
  diagnosticLog("Root Note:", rootNote);
  diagnosticLog("Starting Octave:", startingOctave);
  diagnosticLog("Direction:", direction);
  diagnosticLog("Octave Count:", octaveCount);

  if (!rootNote || !startingOctave) {
    if (isDiagnosticMode) {
      displayElement.textContent = "Select scale parameters to see notes...";
    } else {
      displayElement.textContent = "";
    }
    return;
  }

  // Additional check for initialization
  if (!window.noteMap || Object.keys(window.noteMap).length === 0) {
    if (isDiagnosticMode) {
      displayElement.textContent = "Loading...";
    } else {
      displayElement.textContent = "";
    }
    diagnosticLog("noteMap not ready:", window.noteMap);
    return;
  }

  try {
    const accidentalFamily =
      document.querySelector('input[name="accidental-family"]:checked')
        ?.value || "auto-key";

    diagnosticLog("About to call generateScaleNotesForDisplay with:", {
      scaleType,
      rootNote,
      startingOctave,
      octaveCount,
      direction,
      accidentalFamily,
    });

    console.log("About to call generateScaleNotesForDisplay with:", {
      scaleType,
      rootNote,
      startingOctave,
      octaveCount,
      direction,
      accidentalFamily,
    });

    const scaleNotes = generateScaleNotesForDisplay(
      scaleType,
      rootNote,
      startingOctave,
      octaveCount,
      direction,
      accidentalFamily
    );

    diagnosticLog("Generated scale notes:", scaleNotes);
    console.log("Generated scale notes:", scaleNotes);

    if (scaleNotes.length > 0) {
      // Convert ASCII accidentals to Unicode symbols for display
      const displayNotes = scaleNotes.map((note) => {
        // Extract just the pitch part (without octave) for display formatting
        const pitchMatch = note.match(/^([A-G][#b]?)/);
        if (pitchMatch && typeof window.toDisplayFormat === "function") {
          const pitch = pitchMatch[1];
          const octave = note.replace(pitch, "");
          return window.toDisplayFormat(pitch) + octave;
        }
        return note;
      });

      if (isDiagnosticMode) {
        // Enhanced display with diagnostic information
        let diagnosticInfo = `${displayNotes.join(" | ")}\n\n`;
        diagnosticInfo += `DIAGNOSTIC INFO:\n`;
        diagnosticInfo += `• Scale Type: ${scaleType}\n`;
        diagnosticInfo += `• Root Note: ${rootNote}\n`;
        diagnosticInfo += `• Starting Octave: ${startingOctave}\n`;
        diagnosticInfo += `• Direction: ${direction}\n`;
        diagnosticInfo += `• Octave Count: ${octaveCount}\n`;
        diagnosticInfo += `• Accidental Family: ${accidentalFamily}\n`;
        diagnosticInfo += `• Raw Notes: ${scaleNotes.join(", ")}\n`;
        diagnosticInfo += `• Note Count: ${scaleNotes.length}\n`;
        diagnosticInfo += `• Usable Range: ${
          usableOctaveRange
            ? `${usableOctaveRange.min}-${usableOctaveRange.max}`
            : "N/A"
        }\n`;
        displayElement.textContent = diagnosticInfo;
      } else {
        // In normal mode, show nothing (scale display is diagnostic-only)
        displayElement.textContent = "";
      }
    } else {
      if (isDiagnosticMode) {
        displayElement.textContent = "Unable to generate scale notes";
      } else {
        displayElement.textContent = "";
      }
      diagnosticLog("No scale notes generated!");
    }
  } catch (error) {
    console.error("Error generating scale notes for display:", error);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    diagnosticLog("ERROR in updateScaleNotesDisplay:", error);
    if (isDiagnosticMode) {
      displayElement.textContent = `Error generating scale notes: ${error.message}`;
    } else {
      displayElement.textContent = "";
    }
  }
}

///// Update Textual Display for Practice Passages ///////
function updatePassageTextualDisplay() {
  const displayElement = document.getElementById("scale-notes-display");
  const practiceType = document.querySelector(
    'input[name="practice-type"]:checked'
  )?.value;

  if (practiceType !== "passages") {
    return; // Not in passage mode
  }

  const selectedPassage = getSelectedPracticePassage();
  if (!selectedPassage) {
    displayElement.textContent = "Select a practice passage to see notes...";
    return;
  }

  try {
    // Format passage header and CMT sequence
    let displayText = "";

    // Add header information using the CMT converter function
    if (window.formatPassageHeader) {
      displayText += window.formatPassageHeader(selectedPassage) + "\n\n";
    }

    // Add CMT sequence
    displayText += "CMT Sequence:\n";
    if (window.convertPassageToCMT) {
      const cmtSequence = window.convertPassageToCMT(selectedPassage, {
        includeMeasureMarkers: true,
        tokensPerLine: 6,
      });
      displayText += cmtSequence;
    } else {
      displayText += "CMT converter not loaded";
    }

    displayElement.textContent = displayText;
  } catch (error) {
    console.error("Error updating passage textual display:", error);
    displayElement.textContent = `Error displaying passage: ${error.message}`;
  }
}

///// Update Textual Note Label Based on Practice Type ///////
function updateTextualNoteLabel() {
  const labelElement = document.getElementById("textual-note-label");
  if (!labelElement) return;

  const practiceType =
    document.querySelector('input[name="practice-type"]:checked')?.value ||
    "scales";

  if (practiceType === "passages") {
    labelElement.textContent = "🎵 Current Practice Passage:";
  } else {
    labelElement.textContent = "🎵 Current Scale:";
  }
}

///// Update Dynamic Title Based on Scale Configuration ///////
function updateDynamicTitle() {
  const titleElement = document.getElementById("dynamic-title");
  if (!titleElement) {
    console.warn("⚠️ Dynamic title element not found");
    return;
  }

  const scaleType = document.getElementById("scale-type")?.value || "major";
  const rootNote = document.getElementById("root-note")?.value || "C";
  const practiceType =
    document.querySelector('input[name="practice-type"]:checked')?.value ||
    "scales";

  // Check if we're in practice passage mode
  if (practiceType === "passages") {
    const selectedPassage = getSelectedPracticePassage();
    if (selectedPassage) {
      titleElement.textContent = `� ${selectedPassage.displayName}`;
      diagnosticLog("Practice passage title set to:", titleElement.textContent);
      return;
    } else {
      titleElement.textContent = "📁 Select Practice Passage";
      diagnosticLog("No practice passage selected, showing default title");
      return;
    }
  }

  // Generate scale title
  if (!rootNote) {
    titleElement.textContent = "🎼 Show Scale";
    return;
  }

  // Format the key name (handle both formats: "C" or "C#")
  const formattedKey = rootNote.replace(/b/g, "♭").replace(/#/g, "♯");

  // Format scale type
  let formattedScaleType;
  switch (scaleType.toLowerCase()) {
    case "major":
      formattedScaleType = "Major";
      break;
    case "minor":
      formattedScaleType = "Minor";
      break;
    case "chromatic":
      formattedScaleType = "Chromatic";
      break;
    default:
      formattedScaleType =
        scaleType.charAt(0).toUpperCase() + scaleType.slice(1);
  }

  // Create the dynamic title
  titleElement.textContent = `🎼 ${formattedKey} ${formattedScaleType} Scale`;

  diagnosticLog("Updated dynamic title:", titleElement.textContent);
}

///// Render Scale Based on Current Selections ///////
function renderCurrentScale() {
  // Update the dynamic title first
  updateDynamicTitle();

  const instrumentName = document.getElementById("instrument-select").value;
  const practiceType =
    document.querySelector('input[name="practice-type"]:checked')?.value ||
    "scales";

  // Clear the staff container completely
  const container = document.getElementById("vf");
  container.innerHTML = "";
  container.style.width = "";
  container.style.height = "";

  const entry = fingeringData.find((e) => e.instrument === instrumentName);
  if (!entry?.instrument) {
    console.warn("⚠️ No valid instrument entry found for:", instrumentName);
    return;
  }

  diagnosticLog("=== renderCurrentScale() called ===");
  diagnosticLog("Instrument:", instrumentName);
  diagnosticLog("Practice Type:", practiceType);

  // Handle practice passage rendering
  if (practiceType === "passages") {
    const selectedPassage = getSelectedPracticePassage();
    if (selectedPassage) {
      const displayMode =
        document.querySelector('input[name="display-option"]:checked')?.value ||
        "none";
      diagnosticLog("Rendering practice passage:", selectedPassage.displayName);
      diagnosticLog("Display Mode for passage:", displayMode);
      renderPracticePassage(entry, selectedPassage, displayMode);
      return;
    } else {
      // Show message when no passage is selected
      container.innerHTML =
        '<div class="text-gray-500 text-center p-8">Select a practice passage to display notation</div>';
      return;
    }
  }

  // Handle scale rendering (existing logic)
  const scaleType = document.getElementById("scale-type").value;
  const rootNote = document.getElementById("root-note").value;
  const direction = document.getElementById("direction").value;
  const displayMode =
    document.querySelector('input[name="display-option"]:checked')?.value ||
    "none";
  const octaveCount = parseInt(document.getElementById("octave-count").value);

  diagnosticLog("Scale Type:", scaleType);
  diagnosticLog("Root Note:", rootNote);
  diagnosticLog("Direction:", direction);
  diagnosticLog("Display Mode:", displayMode);
  diagnosticLog("Octave Count:", octaveCount);

  diagnosticLog("Found instrument entry:", entry.instrument);
  diagnosticLog("Instrument clef:", entry.clef);
  diagnosticLog("Instrument range:", entry.standardRange);

  // Recalculate usable octave range for current settings
  usableOctaveRange = getUsableOctaveRange(entry, rootNote, octaveCount);
  diagnosticLog("Usable octave range:", usableOctaveRange);

  // Update the scale notes display
  updateScaleNotesDisplay();

  if (typeof renderScale === "function") {
    const accidentalFamily =
      document.querySelector('input[name="accidental-family"]:checked')
        ?.value || "auto-key";
    const showKeySignature =
      document.getElementById("show-key-signature")?.checked ?? true;
    const showAccidentals =
      document.getElementById("show-accidentals")?.checked ?? true;
    const accidentalDisplay = getAccidentalDisplayValue(
      showKeySignature,
      showAccidentals
    );
    const noteDuration =
      document.querySelector('input[name="note-duration"]:checked')?.value ||
      "quarter";
    const showBarLines =
      document.getElementById("show-bar-lines")?.checked ?? true;
    renderScale(
      entry,
      scaleType,
      rootNote,
      direction,
      displayMode,
      octaveCount,
      startingOctave,
      accidentalFamily,
      accidentalDisplay,
      noteDuration,
      showBarLines
    );
  }

  console.log("Selected Octave Count:", octaveCount);
  console.log("Starting Octave:", startingOctave);
  usableOctaveRange = getUsableOctaveRange(entry, rootNote, octaveCount);
}

///// Apply Saved Preferences ///////
function applySavedPreferences() {
  const savedAlt = getCookie("fingering-alt");
  const savedDisplay = getCookie("displayOption");
  const savedAccidentalDisplay = getCookie("accidentalDisplay");
  const savedNoteDuration = getCookie("noteDuration");

  if (savedDisplay) {
    const radio = document.querySelector(
      `input[name="display-option"][value="${savedDisplay}"]`
    );
    if (radio) radio.checked = true;
  } else if (savedAlt === "true") {
    document.querySelector(
      'input[name="display-option"][value="fingering-alt"]'
    ).checked = true;
  } else if (savedAlt === "false") {
    document.querySelector(
      'input[name="display-option"][value="fingering"]'
    ).checked = true;
  }

  if (savedAccidentalDisplay) {
    setAccidentalDisplayCheckboxes(savedAccidentalDisplay);
  }

  // Restore show bar lines setting
  const savedShowBarLines = getCookie("showBarLines");
  const showBarLinesCheckbox = document.getElementById("show-bar-lines");
  if (showBarLinesCheckbox && savedShowBarLines !== null) {
    showBarLinesCheckbox.checked = savedShowBarLines === "true";
  }

  // Restore show time signature setting
  const savedShowTimeSignature = getCookie("showTimeSignature");
  const showTimeSignatureCheckbox = document.getElementById(
    "show-time-signature"
  );
  if (showTimeSignatureCheckbox && savedShowTimeSignature !== null) {
    showTimeSignatureCheckbox.checked = savedShowTimeSignature === "true";
  }

  if (savedNoteDuration) {
    const radio = document.querySelector(
      `input[name="note-duration"][value="${savedNoteDuration}"]`
    );
    if (radio) radio.checked = true;
  }

  // Restore diagnostic mode state
  const savedDiagnosticMode = getCookie("diagnosticMode");
  const diagnosticCheckbox = document.getElementById("diagnostic-mode");
  if (diagnosticCheckbox && savedDiagnosticMode === "true") {
    diagnosticCheckbox.checked = true;
    toggleDiagnosticMode(true);
  }
}

///// Practice Passage Rendering ///////
function renderPracticePassage(entry, passageData, displayMode = "none") {
  if (!passageData?.measures) {
    console.warn("⚠️ Invalid practice passage data");
    return;
  }

  const VF = Vex.Flow;
  const container = document.getElementById("vf");

  // Clear container
  container.innerHTML = "";
  container.style.width = "";
  container.style.height = "";

  // Check if bar lines should be shown
  const showBarLines =
    document.getElementById("show-bar-lines")?.checked ?? true;

  diagnosticLog("🎵 Rendering practice passage:", passageData.title);
  diagnosticLog("🎵 Measures count:", passageData.measures.length);
  diagnosticLog("🎵 Show bar lines:", showBarLines);
  diagnosticLog("🎵 Display mode:", displayMode);

  // Calculate layout
  const layoutConfig = calculatePassageLayout(passageData.measures.length);

  // Setup renderer
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(layoutConfig.totalWidth, layoutConfig.totalHeight);
  const context = renderer.getContext();

  // Render each staff
  for (
    let staveIndex = 0;
    staveIndex < layoutConfig.stavesNeeded;
    staveIndex++
  ) {
    renderPassageStave(
      staveIndex,
      passageData,
      entry,
      context,
      layoutConfig,
      showBarLines,
      displayMode
    );
  }

  diagnosticLog(
    `🎵 Completed rendering ${layoutConfig.stavesNeeded} staves for passage: ${passageData.title}`
  );
}

///// Helper: Calculate layout for practice passage ///////
function calculatePassageLayout(totalMeasures) {
  const staveWidth = 500; // Increased from 300 to 500 for better spacing
  const staveHeight = 120;
  const staveMargin = 20;
  const measuresPerStave = 3; // Changed from 4 to 3 measures per stave for better spacing
  const stavesNeeded = Math.ceil(totalMeasures / measuresPerStave);
  const firstStaveExtraWidth = 80; // Extra width for first stave signatures

  return {
    staveWidth,
    staveHeight,
    staveMargin,
    measuresPerStave,
    stavesNeeded,
    totalWidth: staveWidth + firstStaveExtraWidth + staveMargin * 2, // Account for wider first stave
    totalHeight: stavesNeeded * staveHeight + staveMargin * 2,
  };
}

///// Helper: Render a single stave for practice passage ///////
function renderPassageStave(
  staveIndex,
  passageData,
  entry,
  context,
  layout,
  showBarLines = true,
  displayMode = "none"
) {
  const VF = Vex.Flow;
  const startMeasure = staveIndex * layout.measuresPerStave;
  const endMeasure = Math.min(
    startMeasure + layout.measuresPerStave,
    passageData.measures.length
  );
  const measuresForThisStave = passageData.measures.slice(
    startMeasure,
    endMeasure
  );

  if (measuresForThisStave.length === 0) return;

  // Create stave with extra width for first stave to accommodate signatures
  const yPosition = layout.staveMargin + staveIndex * layout.staveHeight;
  const isFirstStave = staveIndex === 0;
  const staveWidth = isFirstStave ? layout.staveWidth + 80 : layout.staveWidth; // Extra 80px for signatures
  const stave = new VF.Stave(layout.staveMargin, yPosition, staveWidth);

  // Add clef and signatures to first stave
  if (isFirstStave) {
    addStaveSignatures(stave, passageData, entry);
  } else {
    stave.addClef(entry.clef || "treble");
  }

  stave.setContext(context).draw();

  // Render notes for this stave
  const allNotesForStave = createNotesForStave(measuresForThisStave, entry);

  // Apply display overlays if enabled
  if (
    displayMode !== "none" &&
    displayMode !== "" &&
    allNotesForStave.length > 0
  ) {
    addPassageDisplayOverlays(allNotesForStave, displayMode, entry);
  }

  if (allNotesForStave.length > 0) {
    renderStaveNotesFixed(
      allNotesForStave,
      stave,
      context,
      staveWidth,
      isFirstStave,
      measuresForThisStave,
      showBarLines
    );
  }
}

///// Helper: Add display overlays to practice passage notes ///////
function addPassageDisplayOverlays(notes, displayMode, entry) {
  const VF = Vex.Flow;

  notes.forEach((vfNote) => {
    // Skip rests - check custom property first, then duration
    if (vfNote._isRest || vfNote.duration?.endsWith("r")) {
      console.log(
        `🛑 Skipping rest - isRest: ${vfNote._isRest}, duration: ${vfNote.duration}`
      );
      return;
    }

    // Skip non-note objects (additional safety check)
    if (!vfNote.keys || vfNote.keys.length === 0) return;

    try {
      // Get the first key (VexFlow format like "c/4")
      const vfKey = vfNote.keys[0];

      // Convert to SPN format (like "C/4")
      const spnNote = convertVexFlowKeyToSPN(vfKey);

      let label = "";

      if (displayMode === "midi") {
        try {
          const midi = spnToMidi(spnNote);
          label = `${midi}`;
        } catch (err) {
          console.warn(`⚠️ MIDI conversion failed for ${spnNote}`, err);
          label = "?";
        }
      } else if (displayMode === "names") {
        // Extract just the note name and accidental (remove octave)
        const noteName = spnNote.split("/")[0];
        label =
          typeof window.toDisplayFormat === "function"
            ? window.toDisplayFormat(noteName)
            : noteName;
      } else if (displayMode === "pitch") {
        label = spnNote;
      } else if (displayMode === "cmt") {
        // Convert note to CMT format (note:duration)
        const duration = vfNote.duration || "q";
        let cmtDuration = "q";
        if (duration === "w") cmtDuration = "w";
        else if (duration === "h") cmtDuration = "h";
        else if (duration === "8") cmtDuration = "8";
        label = `${spnNote}:${cmtDuration}`;
      } else if (
        displayMode === "fingering" ||
        displayMode === "fingering-alt"
      ) {
        if (entry?.fingering) {
          // Convert SPN format "C/4" to fingering key format "C4"
          const fingeringKey = spnNote.replace("/", "");
          console.log(
            `🎹 Looking for fingering: ${fingeringKey} in ${entry.instrument}`
          );
          console.log(
            `🎹 Available fingering keys:`,
            Object.keys(entry.fingering).slice(0, 10)
          );
          const fingering = entry.fingering[fingeringKey];
          if (fingering) {
            label =
              displayMode === "fingering-alt"
                ? fingering.join(" / ")
                : fingering[0];
            console.log(`🎹 Found fingering for ${fingeringKey}: ${label}`);
          } else {
            console.warn(
              `No fingering found for ${fingeringKey} in ${entry.instrument}`
            );
            label = "?";
          }
        } else {
          console.warn(`No fingering data available for ${entry.instrument}`);
          label = "?";
        }
      }

      if (label) {
        const annotation = new VF.Annotation(label).setVerticalJustification(
          VF.Annotation.VerticalJustify.TOP
        );
        vfNote.addAnnotation(0, annotation);
      }
    } catch (error) {
      console.warn(`Failed to add overlay for note:`, error);
    }
  });
}

///// Helper: Convert VexFlow key to SPN notation ///////
function convertVexFlowKeyToSPN(vfKey) {
  // VexFlow uses lowercase with "/" separator, e.g., "c/4", "c#/4", "cb/4"
  // SPN uses uppercase with "/" separator, e.g., "C/4", "C#/4", "Cb/4"

  if (!vfKey || typeof vfKey !== "string") {
    throw new Error(`Invalid VexFlow key: ${vfKey}`);
  }

  const parts = vfKey.split("/");
  if (parts.length !== 2) {
    throw new Error(`Invalid VexFlow key format: ${vfKey}`);
  }

  const notePart = parts[0];
  const octave = parts[1];

  // Capitalize the first letter and keep accidentals
  const spnNote = notePart.charAt(0).toUpperCase() + notePart.slice(1);

  return `${spnNote}/${octave}`;
}

///// Helper: Fixed rendering with proper voice timing ///////
function renderStaveNotesFixed(
  notes,
  stave,
  context,
  staveWidth,
  isFirstStave = false,
  measures = [],
  showBarLines = true
) {
  const VF = Vex.Flow;

  try {
    // Create voice without VexFlow barlines for simpler timing - we'll draw our own
    const notesList = notes.filter((note) => !(note instanceof VF.BarNote));

    const voice = new VF.Voice({
      num_beats: 4,
      beat_value: 4,
    });
    voice.setStrict(false);
    voice.addTickables(notesList);

    // Format with generous spacing, accounting for signatures on first stave
    const formatWidth = isFirstStave ? staveWidth - 120 : staveWidth - 20; // More space reduction for first stave
    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], formatWidth);
    voice.draw(context, stave);

    // Draw bar lines between measures if enabled
    if (showBarLines && measures.length > 1) {
      drawPassageBarLines(voice, stave, context, measures);
    }

    diagnosticLog(
      `🎵 Rendered stave with ${notesList.length} notes (${
        notes.length - notesList.length
      } barlines removed), formatWidth: ${formatWidth}, showBarLines: ${showBarLines}`
    );
  } catch (error) {
    diagnosticLog("❌ Fixed rendering failed:", error.message);

    // Ultra-simple fallback - just place notes without timing constraints
    try {
      const notesList = notes.filter((note) => !(note instanceof VF.BarNote));
      notesList.forEach((note, index) => {
        note.setStave(stave);
        note.setContext(context);
        // Simple positioning
        const x = stave.x + 50 + index * 40;
        note.setXShift(x - stave.x - 50);
        note.draw();
      });
      diagnosticLog("🎵 Used ultra-simple fallback rendering");
    } catch (fallbackError) {
      diagnosticLog("❌ All rendering methods failed:", fallbackError.message);
    }
  }
}

///// Helper: Draw bar lines for practice passage measures ///////
function drawPassageBarLines(voice, stave, context, measures) {
  try {
    const tickables = voice.getTickables();
    let noteIndex = 0;

    // Draw a bar line after each measure (except the last one)
    for (
      let measureIndex = 0;
      measureIndex < measures.length - 1;
      measureIndex++
    ) {
      const measure = measures[measureIndex];
      noteIndex += measure.notes.length;

      // Make sure we have a note at this position to get the x coordinate
      if (tickables[noteIndex]) {
        const barLineX = tickables[noteIndex].getBoundingBox().x - 5;

        // Draw a vertical line as bar line
        context.beginPath();
        context.moveTo(barLineX, stave.getYForLine(0));
        context.lineTo(barLineX, stave.getYForLine(4));
        context.stroke();

        diagnosticLog(
          `🎵 Drew bar line after measure ${measureIndex + 1} at x: ${barLineX}`
        );
      }
    }
  } catch (error) {
    diagnosticLog("⚠️ Could not draw bar lines:", error.message);
  }
}

///// Helper: Add signatures to stave ///////
function addStaveSignatures(stave, passageData, entry) {
  stave.addClef(entry.clef || "treble");

  // Add key signature if specified
  if (passageData.keySignature && passageData.keySignature !== "C major") {
    const keyName = passageData.keySignature.split(" ")[0];
    try {
      stave.addKeySignature(keyName);
    } catch (error) {
      diagnosticLog("⚠️ Could not add key signature:", keyName, error.message);
    }
  }

  // Add time signature
  if (passageData.timeSignature) {
    stave.addTimeSignature(passageData.timeSignature);
  }
}

///// Helper: Create notes for a stave ///////
function createNotesForStave(measures, entry) {
  const VF = Vex.Flow;
  const allNotesForStave = [];

  measures.forEach((measure, measureIndex) => {
    const vexNotes = measure.notes.map((noteStr) => {
      try {
        return convertToVexNote(noteStr, entry);
      } catch (error) {
        diagnosticLog("⚠️ Error converting note:", noteStr, error.message);
        return new VF.StaveNote({
          clef: entry.clef || "treble",
          keys: ["c/4"],
          duration: "qr",
        });
      }
    });

    allNotesForStave.push(...vexNotes);

    // No longer adding VexFlow BarNote objects since we draw bar lines manually
  });

  return allNotesForStave;
}

///// Helper: Render notes on stave ///////
function renderStaveNotes(notes, stave, context, staveWidth) {
  const VF = Vex.Flow;

  try {
    // Try with automatic timing first
    const voice = new VF.Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: VF.RESOLUTION,
    });
    voice.setStrict(false);
    voice.addTickables(notes);

    // Use more generous width for formatting
    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], staveWidth - 30);
    voice.draw(context, stave);

    diagnosticLog(
      `🎵 Rendered stave with ${notes.length} notes using standard timing`
    );
  } catch (error) {
    diagnosticLog(
      "❌ Standard timing failed, trying alternative:",
      error.message
    );

    // Fallback: Try with no timing restrictions
    try {
      const fallbackVoice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      fallbackVoice.setStrict(false);
      fallbackVoice.addTickables(notes);

      // Just format without strict timing
      new VF.Formatter()
        .joinVoices([fallbackVoice])
        .formatToStave([fallbackVoice], stave);
      fallbackVoice.draw(context, stave);

      diagnosticLog("🎵 Rendered stave using fallback timing");
    } catch (fallbackError) {
      diagnosticLog("❌ All rendering attempts failed:", fallbackError.message);
    }
  }
}

///// Helper: Convert practice passage note format to VexFlow note ///////
function convertToVexNote(noteString, entry) {
  const VF = Vex.Flow;

  diagnosticLog(`🎵 Converting note: ${noteString}`);

  // Handle rests
  if (noteString === "rest" || noteString.startsWith("rest:")) {
    const duration = noteString.includes(":") ? noteString.split(":")[1] : "q";
    const vexDuration = convertDurationToVex(duration) + "r";
    diagnosticLog(`🎵 Rest converted to: ${vexDuration}`);
    const rest = new VF.StaveNote({
      clef: entry.clef || "treble",
      keys: ["c/4"],
      duration: vexDuration,
    });
    // Mark this as a rest for overlay filtering
    rest._isRest = true;
    console.log(
      `🛑 Created rest with _isRest: ${rest._isRest}, duration: ${rest.duration}`
    );
    return rest;
  }

  // Parse note format: "C4:q" or "C4:q."
  const parts = noteString.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid note format: ${noteString}`);
  }

  const [pitch, duration] = parts;
  const vexDuration = convertDurationToVex(duration);
  const vexPitch = convertPitchToVex(pitch);

  diagnosticLog(
    `🎵 Note parts: pitch=${pitch}, duration=${duration}, vexDuration=${vexDuration}, vexPitch=${vexPitch}, isDotted=${duration.includes(
      "."
    )}`
  );

  const note = new VF.StaveNote({
    clef: entry.clef || "treble",
    keys: [vexPitch],
    duration: vexDuration,
  });

  // Check if note is within instrument's standard range and color red if out of range
  if (entry.standardRange && !noteString.includes("rest")) {
    try {
      const noteMidi = spnToMidi(pitch);
      const minMidi = spnToMidi(entry.standardRange.start);
      const maxMidi = spnToMidi(entry.standardRange.end);

      if (noteMidi < minMidi || noteMidi > maxMidi) {
        // Note is out of range - color it red
        note.setStyle({ fillStyle: "red", strokeStyle: "red" });
        diagnosticLog(
          `🔴 Out of range note: ${pitch} (MIDI ${noteMidi}) outside ${entry.standardRange.start}-${entry.standardRange.end} (MIDI ${minMidi}-${maxMidi})`
        );
      }
    } catch (error) {
      console.warn(`⚠️ Range check failed for ${pitch}:`, error.message);
    }
  }

  // Handle dotted notes - MUST be done before accidentals
  if (duration.includes(".")) {
    note.addDotToAll();
    diagnosticLog(
      `🎵 Added dot to note: ${noteString} -> VexFlow duration: ${vexDuration} with dot`
    );
  }

  // Handle accidentals
  if (pitch.includes("#")) {
    note.addAccidental(0, new VF.Accidental("#"));
    diagnosticLog(`🎵 Added sharp to note: ${noteString}`);
  } else if (pitch.includes("b")) {
    note.addAccidental(0, new VF.Accidental("b"));
    diagnosticLog(`🎵 Added flat to note: ${noteString}`);
  }

  // Debug: Log the final note properties
  diagnosticLog(
    `🎵 Final note created: duration=${note.duration}, keys=${
      note.keys
    }, dots=${note.dots ? note.dots.length : 0}`
  );

  return note;
}

///// Helper: Convert duration notation to VexFlow format ///////
function convertDurationToVex(duration) {
  const durationMap = {
    w: "w", // whole note
    h: "h", // half note
    q: "q", // quarter note
    e: "8", // eighth note
    s: "16", // sixteenth note
    t: "32", // thirty-second note
  };

  // Remove dots for mapping, they're handled separately
  const baseDuration = duration.replace(".", "");
  return durationMap[baseDuration] || "q"; // default to quarter note
}

///// Helper: Convert pitch notation to VexFlow format ///////
function convertPitchToVex(pitch) {
  // Convert from "C4" format to "c/4" format
  const match = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid pitch format: ${pitch}`);
  }

  const [, noteName, octave] = match;
  const vexNoteName = noteName.toLowerCase();

  return `${vexNoteName}/${octave}`;
}
