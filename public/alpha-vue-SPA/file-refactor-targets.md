# 📐 Industry Best Practices: File Size & Procedure Count

## 1. 🧩 General Guidelines

- **File Size Target**:

  - Preferably ≤ 300–500 lines per file
  - Smaller files improve readability, testability, and version control

- **Procedures / Functions per File**:

  - Ideal range: 5–10 functions
  - Each function should serve a single, well-defined purpose

- **Single Responsibility Principle**:
  - Each file should encapsulate one concept or role
  - Example: `ScaleRenderer.js` handles only scale rendering logic

---

## 2. 🧠 JavaScript / HTML / JSON Environments

### JavaScript Modules

- Keep modules ≤ 300 lines
- Group related logic (e.g., `pitchUtils.js` for pitch transformations)
- Avoid mixing UI and domain logic in the same file

### HTML Pages

- Use semantic structure and partials (`header.html`, `footer.html`)
- Avoid inline scripts/styles — use external files
- Keep each HTML file ≤ 500 lines when possible

### JSON Configs

- Split large config files into logical chunks
- Example: `scales.json`, `instruments.json`, `preferences.json`
- Keep each file ≤ 200 KB for performance and clarity

---

## 3. 🧪 Testing & CI/CD

### Test Files

- One test file per module/component
- Keep each test ≤ 200 lines
- Use descriptive names: `ScaleRenderer.test.js`, `pitchUtils.test.js`

### CI/CD Scripts

- Modularize into steps: `build.yml`, `deploy.yml`, `lint.yml`
- Keep each script focused and ≤ 150 lines

---

## 4. 🧱 UI Component Architecture

### Atomic Design Principles

- **Atoms**: Smallest components (e.g., buttons, inputs)
- **Molecules**: Combinations (e.g., dropdown with label)
- **Organisms**: Full sections (e.g., scale selector panel)

### Component Files

- One component per file
- Preferably ≤ 200 lines
- Include only logic, markup, and styles relevant to that component

---

## ✅ Summary Targets

| Category            | Recommended Limit |
| ------------------- | ----------------- |
| JS/TS Modules       | ≤ 300 lines       |
| HTML Pages          | ≤ 500 lines       |
| JSON Configs        | ≤ 200 KB          |
| Test Files          | ≤ 200 lines       |
| Functions           | ≤ 50 lines each   |
| Components          | ≤ 200 lines       |
| Procedures per File | 5–10              |

---

## 🧠 Why It Matters

- Easier to debug and maintain
- Faster onboarding for collaborators
- Better version control granularity
- Enables modular testing and CI/CD integration
- Supports audit-safe workflows and rollback clarity
