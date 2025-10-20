[➡️ Open the landing page (public/index.html)](./index.html)

# Music Tutor Studio – Version 0.15

Welcome to the modular, stage-aware development of Music Tutor Studio (formerly Euphonium Tutor Application). This version introduces a structured release pipeline and architectural clarity.

## 🔄 Versioning Strategy

- Each version is stored in a folder: `MTS_v15A`, `MTS_v15B`, etc.
- Each release stage is nested under `public/`:
  - `prototype/`
  - `Alpha/`
  - `Beta/`
- `public/index.html` routes to each stage.

## 📁 Directory Highlights

- `.docs/` – Planning and documentation
- `.vscode/` – Editor configuration
- `public/` – Entry point and stage folders
- `tools/` – Scripts and utilities
- `partials/` – Shared HTML fragments

## 🧭 Current Phase: prototype

- Refactoring from oversized, unreadable PoC
- Modularizing UI and domain logic
- Preparing for audit-safe architecture

## 🛠️ Goals

- Modularize `show-scales.js` and `render-scale.js`
- Isolate UI components (e.g., `TonicSelector`, `InstrumentDropdown`)
- Introduce OOP or functional encapsulation
- Add diagnostic overlays and logging
- Begin unit testing and linting

## 📌 Naming Convention

- `prototype`, `Alpha`, `Beta` use camel case for web compatibility
- Future folders may include `Release`, `LTS`, etc.

## 🌐 Deployment

- Netlify points to `public/Release/` or latest stable stage
- Preview deploys available for `Beta/` and `Alpha/`

---
