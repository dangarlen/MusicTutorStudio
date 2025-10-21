# Difference Between `public/xfer` and `public/alpha`

This document summarizes the key differences in structure and content between the two directories.

--

## Directory Structure

### `public/xfer`

- **HTML Page:**
  - show-scales.html
  -
- **Folders:**
  - assets/ (NONE)
  - data/
    - pitch-class.json
    - instruments.json
    - show-scales.json
- scripts/

  - pitchUtils.js → alpha/scripts/utils
  - pitchConverter.js → alpha/scripts/utils
  - cmtConverter.js → alpha/scripts/utils
  - show-scales.js → alpha/scripts/ui
  - render-scale.js → alpha/scripts/ui

### `public/alpha`

- **HTML Pages:**
  - about.html
  - create-exercises.html
  - create-lessons.html
  - create-scales.html
  - creator.html
  - index.html
  - lessons-create.html
  - lessons-manage-practice-units.html
  - lessons-manage.html
  - lessons-start.html
  - lessons.html
  - practice-exercises.html
  - practice-scales.html
  - practice.html
  - preferences.html
  - test-header.html
- **Folders:**
  - components/ (empty)
  - data/ (instruments.json, scales.json)
  - features/ (preferences.js)
  - fragments/ (header.html, footer.html, footer.json)
  - scripts/
    - audio/
    - footer-fetch.js
    - header-fetch.js
    - ui/ (create-scales.js, scales.js)
    - utils/ (buildScaleFromUI.js)
  - styles/ (theme.css)

--

## Key Differences

### 1. **Purpose and Content**

- **xfer:**
  - Contains legacy and reference pages, including `show-scales.html` and older practice passage logic.
  - More demo and transfer-oriented; includes practice passage JSONs and legacy scripts.
- **alpha:**
  - Contains newer, modular, and feature-focused pages (e.g., create-scales, lessons management).
  - More modern structure: separation of UI and utility scripts, feature folders, and custom styles.

### 2. **Data Files**

- **xfer/data:**
  - Many JSON files: pitch-class, instruments, passages, noteColors, etc.
- **alpha/data:**
  - Fewer JSON files: instruments.json, scales.json.

### 3. **Scripts**

- **xfer/scripts:**
  - Flat structure, many legacy scripts, global helpers.
- **alpha/scripts:**
  - Modular structure: `ui/` for UI logic, `utils/` for scale logic, `audio/` for sound, fetchers for header/footer.

### 4. **Fragments and Components**

- **xfer/fragments:**
  - header.html, footer.html.
- **alpha/fragments:**
  - header.html, footer.html, footer.json.
- **alpha/components:**
  - Present but currently empty.

### 5. **Practice Passages**

- **xfer/practicePassages:**
  - Contains JSON files for specific practice pieces.
- **alpha:**
  - No direct equivalent; practice logic is likely handled differently or not yet implemented.

### 6. **Styling**

- **xfer:**
  - No dedicated styles folder; uses CDN Tailwind.
- **alpha:**
  - Has a `styles/theme.css` for custom theming.

--

## Summary Table

| Feature/Folder    | xfer                   | alpha                     |
| ----------------- | ---------------------- | ------------------------- |
| HTML Pages        | legacy, demo, transfer | modern, modular, feature  |
| Data Files        | many JSONs             | fewer JSONs               |
| Scripts           | flat, legacy, global   | modular, UI/utils/audio   |
| Fragments         | header/footer          | header/footer/footer.json |
| Components        | N/A                    | present (empty)           |
| Practice Passages | present                | not present               |
| Styles            | CDN Tailwind           | theme.css                 |

--

## Notes

- `alpha` is the forward-looking, modular, and feature-rich version.
- `xfer` is the legacy, demo, and transfer-oriented version.
- Some features (practice passages, note colors) exist only in `xfer`.
- Some features (modular scripts, custom theming) exist only in `alpha`.
