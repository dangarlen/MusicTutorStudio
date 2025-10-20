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
  const displayBlock = document.getElementById(displayBlockId);
  const displayToggle = document.getElementById(displayToggleId);
  const vfDiv = document.getElementById(vexflowContainerId);

  function updateDisplayBlock() {
    const key = keyEl?.value;
    const scaleType = scaleTypeEl?.value;
    if (key && scaleType) {
      displayToggle.checked = true;
      renderVexflowStaff(vfDiv);
    } else {
      displayToggle.checked = false;
      if (vfDiv) vfDiv.innerHTML = "";
    }
  }

  if (keyEl) keyEl.addEventListener("change", updateDisplayBlock);
  if (scaleTypeEl) scaleTypeEl.addEventListener("change", updateDisplayBlock);
}

// Minimal VexFlow rendering for demonstration
function renderVexflowStaff(container) {
  if (!container) return;
  container.innerHTML = "";
  if (!window.Vex || !window.Vex.Flow) {
    container.textContent = "VexFlow not loaded.";
    return;
  }
  const VF = window.Vex.Flow;
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(400, 120);
  const context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  const stave = new VF.Stave(10, 40, 380);
  stave.addClef("treble").addTimeSignature("4/4");
  stave.setContext(context).draw();
}

export function setupDynamicCreateTitle({
  titleSelector = "#dynamic-create-title",
  keySelector = "#key-select",
  scaleTypeSelector = "#scale-type-select",
  defaultTitle = "Create Scales",
  scaleTypeSuffix = "Scale",
} = {}) {
  const titleEl = document.querySelector(titleSelector);
  const keyEl = document.querySelector(keySelector);
  const scaleTypeEl = document.querySelector(scaleTypeSelector);

  function updateTitle() {
    const key = keyEl?.value;
    const scaleType = scaleTypeEl?.value;
    if (key && scaleType) {
      // Capitalize first letter of scale type
      const typeLabel = scaleType.charAt(0).toUpperCase() + scaleType.slice(1);
      titleEl.textContent = `Create: ${key} ${typeLabel} ${scaleTypeSuffix}`;
    } else {
      titleEl.textContent = defaultTitle;
    }
  }

  if (keyEl) keyEl.addEventListener("change", updateTitle);
  if (scaleTypeEl) scaleTypeEl.addEventListener("change", updateTitle);
}
