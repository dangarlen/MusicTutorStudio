// create-scales.js
// Handles dynamic logic for the Scale Configuration block in create-scales.html
// Best practices: modular, event-driven, no global leaks

export function initScaleConfiguration(options = {}) {
  const keySelect = document.getElementById("key-select");
  if (keySelect && options.keys) {
    // Preserve the placeholder
    keySelect.innerHTML = '<option value="">Select Key</option>';
    for (const key of options.keys) {
      const opt = document.createElement("option");
      opt.value = key.value;
      opt.textContent = key.label;
      keySelect.appendChild(opt);
    }
  }

  const scaleTypeSelect = document.getElementById("scale-type-select");
  if (scaleTypeSelect && options.scaleTypes) {
    // Preserve the placeholder
    scaleTypeSelect.innerHTML = '<option value="">Select Scale Type</option>';
    for (const scaleType of options.scaleTypes) {
      const opt = document.createElement("option");
      opt.value = scaleType.value;
      opt.textContent = scaleType.label;
      scaleTypeSelect.appendChild(opt);
    }
  }
  // Add more event listeners or logic as needed
}

// Optionally, auto-init on DOMContentLoaded if needed
// document.addEventListener('DOMContentLoaded', () => initScaleConfiguration());
