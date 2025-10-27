# Music Tutor Studio: Project Overview

==========
Import via import in Vue source (e.g., main.js or a component)

import './legacy/my-legacy-script.js'

Yes, it will be bundled into your SPA’s assets/\*.js output.

It becomes part of the dependency graph and is processed by the bundler (Vite or Webpack).

# If the legacy script modifies window or global scope, it will still execute — but you may need to shim or polyfill for compatibility.

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
