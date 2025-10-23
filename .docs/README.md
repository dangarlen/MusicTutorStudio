# Music Tutor Studio: Project Overview

This project is a modular, static web app for teaching and visualizing music scales. It was intially created for the euphonium (as Euphonioum Tutor) and has been generalized to cover multible instruments (ie valved brass and trombone) and is now named "Music Tutor Studo". It features:

- Data-driven UI (JSON config)
- Minimize File Size and modularize codebase by
  - Utilizing Web Components
  - Externalize html fragments to fragments/fragment-\*.html
  - Externalize JavaScript to scripts/\*.js
  - Utilize Modular ES modules
- VexFlow music notation
- Tailwind CSS & DaisyUI installed via local npm (not CDN) using the CLI (npx tailwindcss)

- Instrument range validation
- Diagnostics/debug console

See `.docs/CONTRIBUTING.md` for coding standards and workflow.
