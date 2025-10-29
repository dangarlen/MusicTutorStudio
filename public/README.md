[➡️ Open the landing page (public/index.html)](./index.html)

# Music Tutor Studio – Version 0.15

Welcome to the modular, stage-aware development of Music Tutor Studio (formerly Euphonium Tutor Application). This version introduces a structured release pipeline and architectural clarity.

## 🔄 Versioning Strategy

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

## 🎼 Scientific Pitch Notation (SPN)

Scientific Pitch Notation (SPN) is a system used to name musical notes by combining their pitch class (like C, D#, Bb) with an octave number. It provides an unambiguous way to identify exact pitches across all instruments and is widely used in digital music, MIDI, and music theory.

**Examples:**

- `C4` = Middle C
- `A4` = A above middle C (440 Hz standard tuning)
- `F#3` = F-sharp in the third octave
- `Bb5` = B-flat in the fifth octave

SPN avoids symbols like ♯ or ♭ and instead uses `#` for sharp and `b` for flat, making it ideal for coding, tokenization, and cross-platform compatibility.

SPN will be used in alpha-vue to define individual notes, along with custom add-ons for extended musical features.

- Filenames will use dashes to seperate included words such as file-refactor-targets.md

## 🌐 Deployment

- Netlify points to `public/Release/` or latest stable stage
- Preview deploys available for `Beta/` and `Alpha/`

---
