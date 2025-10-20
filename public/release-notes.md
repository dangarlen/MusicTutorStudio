[➡️ Open the landing page (public/index.html)](./index.html)

# 🎯 Music Tutor Studio – Release Tracker

This document tracks progress across release stages using best-practice terminology.

---

## 🚧 prototype

**Status:** Active Development
**Goal:** Refactor PoC into modular, readable architecture

### ✅ Action Items

- [x] Audit oversized files
- [x] Split `show-scales.js` into modules
- [ ] Refactor `render-scale.js` into OOP
- [ ] Create `domain/` and `components/` folders
- [ ] Add logging overlays

### 🧩 Features

- Scale rendering logic (early prototype)
- Instrument selector (non-modular)
- Practice passage loader

### 🐞 Known Bugs

- UI overcrowding
- Unreadable logic blocks
- No test coverage
- No state management

---

## 🧪 Alpha

**Status:** Planned
**Goal:** Feature-complete, internally testable

### ✅ Action Items

- [ ] Modularize all UI components
- [ ] Add unit tests for domain logic
- [ ] Integrate ESLint and Prettier
- [ ] Document architectural layers

### 🧩 Features

- Modular scale selector
- Diagnostic overlays
- Snapshot testing

### 🐞 Known Bugs

- Inconsistent accidental logic
- No CI/CD pipeline

---

## 🚀 Beta

\*\*Status:\*\* Planned

\*\*Goal:\*\* Stable, externally testable

\### ✅ Action Items

\- \[ ] Finalize UI layout

\- \[ ] Add accessibility labels

\- \[ ] Prepare Netlify preview deploy

\- \[ ] Validate ensemble clarity

\### 🧩 Features

\- Audit-safe scale rendering

\- Modular lesson scaffolding

\- Persistent session logic

\### 🐞 Known Bugs

\- Minor UI inconsistencies

\- Tooltip overlap in mobile view

---
