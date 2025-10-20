// preferences.js

console.log("preferences.js loaded and executing");

// Dynamic instrument loader

let fingeringData = [];

// Populate instrument dropdown from instruments.json
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

  // Restore saved preference if available
  const saved = getCookie("instrument");
  if (saved && seen.has(saved)) {
    dropdown.value = saved;
  }
}

// Save preferences to cookies
function savePreferences() {
  const instrument = document.getElementById("instrument-select").value;
  const range = document.getElementById("range-select").value;
  const alt = document.querySelector(
    'input[name="fingering-alt"]:checked'
  ).value;

  setCookie("instrument", instrument, 365);
  setCookie("range", range, 365);
  setCookie("fingering-alt", alt, 365);

  alert("Preferences saved!");
}

// Load instruments.json dynamically
fetch("data/instruments.json")
  .then((response) => response.json())
  .then((data) => {
    fingeringData = data;
    populateInstrumentDropdown();
  })
  .catch((error) => {
    console.error("Error loading instruments.json:", error);
  });

window.addEventListener("DOMContentLoaded", () => {
  const savedInstrument = getCookie("instrument");
  const savedRange = getCookie("range");
  const savedAlt = getCookie("fingering-alt");

  // Apply saved instrument
  if (savedInstrument) {
    const instrumentSelect = document.getElementById("instrument-select");
    if (
      [...instrumentSelect.options].some((opt) => opt.value === savedInstrument)
    ) {
      instrumentSelect.value = savedInstrument;
    }
  }

  // Apply saved range
  if (savedRange) {
    const rangeSelect = document.getElementById("range-select");
    if ([...rangeSelect.options].some((opt) => opt.value === savedRange)) {
      rangeSelect.value = savedRange;
    }
  }

  // Apply saved fingering display
  if (savedAlt === "true") {
    document.querySelector(
      'input[name="fingering-alt"][value="true"]'
    ).checked = true;
  } else {
    document.querySelector(
      'input[name="fingering-alt"][value="false"]'
    ).checked = true;
  }
});
