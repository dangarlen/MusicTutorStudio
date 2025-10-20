<h1>migration-outline.md</h1>
<details>

<summary>Hybrid Page Loader Pattern</summary>

**Recommended Pattern:**

- Each HTML page has a corresponding small JS loader (e.g., preferences.html → preferences.js) responsible for page-specific wiring: DOM selection, event listeners, and calling shared logic.
- Common/shared logic (data fetching, rendering, business rules) lives in utility, feature, or component modules (e.g., scripts/utils/, scripts/features/).
- The loader imports and uses these shared modules, keeping page entry points clean and focused.

**Benefits:**

- Promotes code reuse and avoids duplication.
- Makes page scripts easy to read and maintain.
- Supports scaling and modular refactoring as the project grows.

**Example:**

```
// scripts/features/preferences.js (shared logic)
export function savePreferences() { ... }

// scripts/preferences.js (page loader)
import { savePreferences } from './features/preferences.js';
document.getElementById('save-btn').addEventListener('click', savePreferences);
```

</details>

# Migration Outline: public/prototype → public/alpha

<details>
<summary>Recommended Modular Structure & Approach</summary>

<details>
<summary>1. Directory Structure & Layering</summary>

- **public/alpha/scripts/** — All JS modules, grouped by feature (e.g., scales, lessons, audio, UI)
- **public/alpha/data/** — JSON data files (mirroring prototype/data)
- **public/alpha/components/** — Reusable HTML fragments or web components
- **public/alpha/styles/** — CSS (keep site.css, modularize if needed)

---

## Daisy UI Documentation

- [DaisyUI Components Reference](https://daisyui.com/components/)
  - Reference for all component classes, color options, and usage examples.

</details>

<details>
<summary>2. Modular JavaScript</summary>

- Break up large scripts into focused ES modules:
  - **utils/** — General helpers (pitch, note, cookie utilities)
  - **data/** — Data fetchers/loaders (e.g., loadInstrumentData.js)
  - **audio/** — Tone.js wrappers, audio routines
  - **notation/** — VexFlow rendering helpers
  - **ui/** — DOM manipulation, event binding, modal/dialog helpers
  - **features/** — High-level logic for each page (e.g., showScales.js)
- Each module should export only what’s needed (named exports).

</details>

<details>
<summary>3. Data-Driven Design</summary>

- Keep all pitch, instrument, and scale data in JSON.
- Write generic data loader modules (e.g., fetchJson(url)) and pass data to feature modules.

</details>

<details>
<summary>4. Reusable Components</summary>

- For repeated UI (headers, footers, controls), use HTML fragments or web components.
- For repeated JS logic (e.g., rendering a scale, playing a note), create callable functions in shared modules.

</details>

<details>
<summary>5. Page Bootstrapping</summary>

- Each HTML page should import only the scripts it needs.
- Use a main entry script per page (e.g., alpha/show-scales.js) that wires up the page, fetches data, and calls reusable modules.

</details>

<details>
<summary>6. Example Modularization</summary>

- pitchUtils.js → scripts/utils/pitchUtils.js
- pitchConverter.js → scripts/utils/pitchConverter.js
- render-scale.js → scripts/notation/renderScale.js
- play-scales.js → scripts/audio/playScales.js
- show-scales.js → scripts/features/showScales.js
- load-header.js, load-footer.js → scripts/ui/loadFragment.js

</details>

<details>
<summary>7. Naming & Contracts</summary>

- Use clear, consistent naming for modules and exports.
- Document expected data shapes and module contracts in comments or a central README.

</details>

<details>
<summary>8. Testing & Debugging</summary>

- Keep test/demo pages or scripts for each major module.
- Use browser console logs and network tab to verify data loading and module boundaries.

</details>

---

### Summary Table

| Layer/Folder      | Example Files/Modules              | Purpose                 |
| ----------------- | ---------------------------------- | ----------------------- |
| scripts/utils/    | pitchUtils.js, cookies.js          | General helpers         |
| scripts/data/     | loadInstrumentData.js              | Data fetching/parsing   |
| scripts/audio/    | playScales.js, audioUtils.js       | Audio playback          |
| scripts/notation/ | renderScale.js, vexflowHelpers.js  | Notation rendering      |
| scripts/ui/       | loadFragment.js, modal.js          | UI/DOM helpers          |
| scripts/features/ | showScales.js, lessons.js          | Page-specific logic     |
| data/             | instruments.json, pitch-class.json | Authoritative data      |
| components/       | header.html, footer.html           | Reusable HTML fragments |
| styles/           | site.css, ...                      | CSS                     |

</details>
