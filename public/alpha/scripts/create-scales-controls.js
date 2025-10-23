// Modular ES module for Create Scales UI controls
// Exported functions for octave count and starting octave logic

// Octave count logic
export function setupOctaveCountControls() {
  let octaveCount = 1;
  const minOctaves = 1;
  const maxOctaves = 3;
  const label = document.getElementById("octave-count-label");
  const decBtn = document.getElementById("octave-count-decrement");
  const incBtn = document.getElementById("octave-count-increment");
  function updateOctaveCount(val) {
    octaveCount = val;
    label.textContent = octaveCount;
    let hidden = document.getElementById("octave-count");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "octave-count";
      label.parentNode.appendChild(hidden);
    }
    hidden.value = octaveCount;
    const event = new Event("change", { bubbles: true });
    hidden.dispatchEvent(event);
  }
  decBtn.onclick = function () {
    if (octaveCount > minOctaves) {
      updateOctaveCount(octaveCount - 1);
    }
  };
  incBtn.onclick = function () {
    if (octaveCount < maxOctaves) {
      updateOctaveCount(octaveCount + 1);
    }
  };
  updateOctaveCount(octaveCount);
}

// Starting octave logic
export function setupStartingOctaveControls() {
  let startingOctave = 4;
  const minOctave = 1;
  const maxOctave = 8;
  const label = document.getElementById("starting-octave-label");
  const decBtn = document.getElementById("octave-decrement");
  const incBtn = document.getElementById("octave-increment");

  function getRootNote() {
    const rootNoteSelect = document.getElementById("root-note");
    if (!rootNoteSelect) return "C";
    let note = rootNoteSelect.value || "C";
    note = note.replace(/\s*\(.*\)/, "");
    note = note.split(" ")[0];
    note = note.replace(/\/.*/, "");
    return note;
  }

  function updateStartingOctaveLabel() {
    const note = getRootNote();
    label.textContent = note + startingOctave;
    console.log("[Starting Octave Label Updated]", note + startingOctave);
  }

  function updateStartingOctave(val) {
    startingOctave = val;
    updateStartingOctaveLabel();
    if (typeof window.renderCurrentScale === "function") {
      window.renderCurrentScale();
    }
  }

  function onRootNoteChange() {
    updateStartingOctaveLabel();
  }

  function attachRootNoteListener() {
    const rootNoteSelect = document.getElementById("root-note");
    if (rootNoteSelect && !rootNoteSelect._octaveLabelListenerAttached) {
      rootNoteSelect.addEventListener("change", onRootNoteChange);
      rootNoteSelect._octaveLabelListenerAttached = true;
    }
  }

  decBtn.onclick = function () {
    if (startingOctave > minOctave) {
      startingOctave--;
      updateStartingOctaveLabel();
      if (typeof window.renderCurrentScale === "function") {
        window.renderCurrentScale();
      }
    }
  };
  incBtn.onclick = function () {
    if (startingOctave < maxOctave) {
      startingOctave++;
      updateStartingOctaveLabel();
      if (typeof window.renderCurrentScale === "function") {
        window.renderCurrentScale();
      }
    }
  };

  // Listen for Key and instrument changes
  attachRootNoteListener();
  const instrumentSelect = document.getElementById("instrument-select");
  if (instrumentSelect) {
    instrumentSelect.addEventListener("change", function () {
      setTimeout(function () {
        attachRootNoteListener();
        updateStartingOctaveLabel();
      }, 100);
    });
  }

  // Listen for scale type changes
  const scaleTypeRadios = document.querySelectorAll('input[name="scale-type"]');
  for (const radio of scaleTypeRadios) {
    radio.addEventListener("change", updateStartingOctaveLabel);
  }

  // Observe root note select for dynamic changes
  const observer = new MutationObserver(function () {
    attachRootNoteListener();
    updateStartingOctaveLabel();
  });
  const rootNoteSelect = document.getElementById("root-note");
  if (rootNoteSelect) {
    observer.observe(rootNoteSelect, { childList: true, subtree: true });
  }

  // Initial label update
  updateStartingOctaveLabel();
}

// Key signature change logic
export function setupKeySignatureListener() {
  var keySig = document.getElementById("show-key-signature");
  if (keySig) {
    keySig.addEventListener("change", function () {
      if (typeof window.renderCurrentScale === "function") {
        window.renderCurrentScale();
      }
    });
  }
}

// Navigation button logic
export function setupReturnToCreatorButton() {
  const btn = document.getElementById("return-to-creator-btn");
  if (btn) {
    btn.onclick = function () {
      window.location.href = "creator.html";
    };
  }
}
