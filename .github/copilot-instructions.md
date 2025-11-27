## Quick orientation

This repository is a small static site (single-page HTML demos) that teaches music scales for euphonium and related instruments. Pages live under `public/` and are data-driven: JSON files in `data/` supply pitch maps and instrument fingering data which the client-side scripts fetch at runtime.

Target audience for these instructions: automated coding agents (Copilot-style) that will open, edit, or add features to this codebase.

## Big-picture architecture (read before editing)
- Static site served from `public/` (HTML + client JS). No server-side code in the repo.
- Fragments: header and footer are injected at runtime (`src/scripts/load-header.js`, `src/scripts/load-footer.js`) from `fragments/header.html` and `fragments/footer.html`.
- Data-driven UI: `src/scripts/*.js` fetch JSON from `data/*.json` (examples: `pitch-class.json`, `instruments.json`, `version.json`). These JSON files are authoritative for pitch maps and fingerings.
- Notation & audio: VexFlow (notation) and Tone.js (audio) are used via CDN links in the HTML pages (see `public/show-scales.html`, `public/play-scales.html`).

Why this matters: most changes are front-end-only and must preserve the fetch/load order and data shapes. Many scripts assume global helpers on `window` and the existence of certain cookie keys.

## Important developer workflows
- Local testing: serve the `public/` directory with a static server (don't open `file://` pages because fetch() to `data/*.json` will fail in many browsers). Example quick commands (PowerShell):

```powershell
# from repo root
python -m http.server 8000 -d public

# or using npm 'serve' if available
npx serve public
```

- Deploy: a PowerShell script `deploy.ps1` wraps `netlify deploy --prod --dir=public`. Netlify CLI must be installed (`npm install -g netlify-cli`). VS Code task "🚀 Push & Deploy to Netlify" runs the script.

## Project-specific conventions & patterns
- File layout: most client code lives under `src/scripts/`. HTML pages reference scripts with relative paths; maintain relative references when moving files.
- Load-order matters: `fragments/header.html` is injected by `load-header.js`. Scripts that depend on data or globals must be included in the same order seen in the HTML pages. Example ordering in `show-scales.html`:
  1. `scripts/pitchUtils.js` (normalization, SPN/MIDI helpers)
  2. `scripts/pitchConverter.js` (midi/spn helpers)
  3. `scripts/show-scales.js` (UI, fetches JSON, wires controls)
  4. `scripts/render-scale.js` (VexFlow rendering)

- Globals and contracts:
  - `window.noteMap` must be populated from `data/pitch-class.json` before calling `spnToMidi()`. `show-scales.js` fetches and assigns `window.noteMap`.
  - `normalizeNoteName(note)`, `spnToMidi(spn)`, `midiToSpn(midi)` are exported onto `window` by `pitchUtils.js` / `pitchConverter.js`.

- Cookies / persisted prefs used by the UI:
  - `displayOption` (radio selection in Show Scales)
  - `instrument` (selected instrument)
  - `fingering-alt` (alternate fingering toggle)

## Data shapes (discoverable from code)
- `data/pitch-class.json` provides a `noteMap` mapping normalized note names (e.g. "C", "C#") to semitone offsets used by `spnToMidi()`.
- `data/instruments.json` is an array of instrument entries. Relevant fields used in code:
  - `instrument` (string)
  - `clef` (e.g. "treble")
  - `standardRange` with `start` and `end` SPN strings (e.g. "C/3")
  - optional `defaultStartingOctave`
  - `fingering` object keyed by SPN-like keys (`normalizeNoteName(pitch) + '/' + octave`) whose values are arrays of fingering strings.

When adding an instrument, follow the existing shape: keys are normalized via `normalizeNoteName()` before lookup (see `render-scale.js`).

## Common edit patterns & safe changes
- To change UI text or layout, edit `public/fragments/header.html`, `public/fragments/footer.html` or the relevant page under `public/`.
- To add a new root-note or scale option, update `data/show-scales.json` (populated in `show-scales.js`).
- To change pitch/fingering behavior, edit `src/scripts/pitchUtils.js` / `src/scripts/pitchConverter.js` and update `data/*.json` accordingly.

Avoid:
- Renaming top-level files without updating the HTML references.
- Moving `pitchUtils.js` or `pitchConverter.js` after code that calls `spnToMidi()` / `normalizeNoteName()`.

## Debugging tips (fast wins)
- Open browser DevTools Console and Network tabs; many loader errors are logged (e.g. malformed JSON, missing `noteMap`). `show-scales.js` prints explicit diagnostics like "Fingering lookup" and usable octave ranges.
- If `spnToMidi()` throws "noteMap not loaded", verify `data/pitch-class.json` fetch succeeded and that `window.noteMap` is set before callers execute.
- For visual issues, inspect the SVG produced by VexFlow in `#vf` and use the console logs from `render-scale.js` which list the constructed scale notes.

## PR guidance for agents
- Keep changes small and focused. When editing JSON data shapes, update the corresponding UI code that reads it.
- Preserve CDN references for VexFlow/Tone unless there is a specific reason to change them — tests and pages rely on those exact versions.

## Troubleshooting Copilot Coding Agent

### "Failed to find pull request" error
This error typically occurs when the Copilot coding agent cannot locate or create a pull request. Common causes and fixes:

1. **Transient API issues**: Refresh the page and wait a few moments. The agent will retry automatically in most cases.

2. **Branch targeting**: Ensure you're working from a branch that can be merged into the default branch (`master`). The agent creates PRs targeting the default branch.

3. **Repository permissions**: Verify that:
   - Copilot coding agent is enabled for this repository
   - GitHub Actions are enabled in repository settings
   - You have write access to the repository

4. **IDE-specific issues**:
   - In VS Code: Use `@github` prefix when asking Copilot to create PRs
   - Sign out and sign back in to refresh authentication tokens
   - Update the GitHub Copilot and GitHub Pull Request extensions

5. **Assignment method**: When assigning issues to Copilot:
   - On GitHub.com: Assign the issue directly to Copilot
   - In VS Code: Use the GitHub Pull Request extension's chat interface

### Agent not responding
- Check GitHub's status page for service interruptions
- Ensure the repository isn't excluded by content exclusion rules
- Verify Copilot is enabled for your organization/account

### Best practices for this repository
- Always run `npm run dev` to test changes locally before committing
- Use `npm run build` to verify the build succeeds
- Test in the browser by navigating to `http://localhost:5173`

---

Please review these instructions and tell me any gaps (missing files or unclear data shapes) and I will refine the guidance.
