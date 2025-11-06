[➡️ Open the landing page (public/index.html)](./index.html)

# 🎯 Music Tutor Studio – Development Roadmap

## Definitions & Terminology

### A. Release Stages

- **prototype**: Experimental, unstable, early refactor
- **Alpha**: Feature-complete, internally testable
- **Beta**: Stable, externally testable
- **Release**: Production-ready
- **LTS**: Long-term support

### B. Code Completeness

- **PoC (Proof of Concept)**: Demonstrates feasibility, not production-ready
- **MVP (Minimum Viable Product)**: Core features for early users
- **Feature-Complete**: All planned features implemented
- **Stable**: Tested and reliable
- **Production-Ready**: Meets performance, security, and usability standards

### C. Architectural Layers

- **Presentation Layer (UI)**: User interface and interaction logic
- **Application Layer**: Orchestrates workflows
- **Domain Layer**: Core musical logic
- **Data Access Layer**: Interfaces with JSON, APIs
- **Infrastructure Layer**: Logging, deployment, config

### D. Code Quality Indicators

- **Modular**: Reusable, isolated components
- **Test Coverage**: % of code tested
- **CI/CD Integration**: Automated build/test/deploy
- **Linting & Static Analysis**: Style enforcement
- **SOLID Principles**: Object-oriented design best practices
- **DRY / KISS / YAGNI**: Clean, efficient coding
- **DORA Metrics**: Deployment frequency, lead time, MTTR

---

## V. Current State Summary

- **Release Stage**: prototype
- **Code Completeness**: PoC with oversized, unmodular files
- **Architecture**: Mixed layers, unclear separation
- **Code Quality**: Unreadable, untestable, no OOP, crowded UI
- **UI/UX**: Monolithic, not user-friendly
- **Tooling**: VS Code config, no CI/CD, no test coverage

---

## 🛠️ Refactor Roadmap

### Phase 1: Audit & Stabilize

- Snapshot current state in Git

- Tag oversized files

- Identify architectural roles

- Add logging overlays

### Phase 2: Modularize \& Isolate

- Split `show-scales.js` and `render-scale.js`

- Refactor into OOP or pure functions

- Create `domain/`, `components/`, `services/`

### Phase 3: Validate \& Test

- Add unit and snapshot tests

- Integrate ESLint + Prettier

- Create `tests/` folder

### Phase 4: Architect for Growth

- Formalize architectural layers

- Introduce state management

- Set up CI/CD pipeline

### Phase 5: UI/UX Refactor

- Break UI into atomic components

- Add accessibility and tooltips

- Validate ensemble clarity

---

### 📊 Release Tracker

### 🚧 prototype

- \*\*Status\*\*: Active

- \*\*Goal\*\*: Refactor PoC into modular architecture

### Action Items

- \[x] Audit oversized files

- \[x] Split `show-scales.js`

- \[ ] Refactor `render-scale.js`

- \[ ] Add logging overlays

### Features

- Scale rendering prototype

- Instrument selector

- Practice passage loader

### Bugs

- UI overcrowding

- No test coverage

- No state management

---

### 🧪 Alpha

- \*\*Status\*\*: Planned

- \*\*Goal\*\*: Feature-complete, internally testable

### Action Items

- \[ ] Modularize UI

- \[ ] Add unit tests

- \[ ] Integrate linting

- \[ ] Document architecture

### Features

- Modular scale selector

- Diagnostic overlays

- Snapshot testing

### Bugs

- Inconsistent accidental logic

- No CI/CD pipeline

---

### 🚀 Beta

- \*\*Status\*\*: Planned

- \*\*Goal\*\*: Stable, externally testable

\#### Action Items

- \[ ] Finalize UI layout

- \[ ] Add accessibility

- \[ ] Prepare Netlify preview

- \[ ] Validate ensemble clarity

### Features

- Audit-safe scale rendering

- Modular lesson scaffolding

- Persistent session logic

### Bugs

- Minor UI inconsistencies

- Tooltip overlap in mobile view

```

```
