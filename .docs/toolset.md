## Deployment & Hosting

- [Netlify Project Dashboard](https://app.netlify.com/teams/dangarlen/projects)

# 🎛️ MusicTutorStudio Toolset Overview

This document outlines the full development toolset for the Vue.js refactor of MusicTutorStudio, including core technologies, plugins, testing tools, and VS Code extensions.

<details>
<summary><strong>🧩 Core Stack</strong></summary>

- **HTML, CSS, JS** – Base technologies
- **VexFlow** – Music notation rendering
- **Tone.js** – Web Audio synthesis and playback
- **Tailwind CSS** – Utility-first styling (installed via CLI)
- **DaisyUI** – Tailwind component library
- **Vue.js 3** – Component-based frontend framework
- **Vite** – Dev server and build tool for Vue
- **Vue Router** – Page-level routing
- **Pinia** – Native Vue state management
- **VueUse** – Utility composables (e.g. localStorage, lifecycle)
- **Supabase** – Backend-as-a-Service (Auth, Database, Storage)

</details>

<details>
<summary><strong>📡 CDN Libraries</strong></summary>

- **VexFlow 3.0.9** – Music notation rendering (via jsDelivr CDN)
- **Tone.js** – Web Audio synthesis and playback
- **Material Symbols** – Google's icon font for UI symbols
- **Tailwind CSS** – Utility-first CSS framework (CDN for legacy pages)
- **DaisyUI** – Component library for Tailwind (CDN for legacy pages)

</details>

<details>
<summary><strong>🧪 Testing & E2E Stack</strong></summary>

- **Playwright** – End-to-end testing framework for web applications
- **Vitest** – Vite-native test runner
- **@vue/test-utils** – Mount and test Vue components
- **@testing-library/vue** – Optional DOM-focused testing
- **c8** – Code coverage for Vitest

</details>

<details>
<summary><strong>🧼 Linting & Formatting</strong></summary>

- **ESLint** – JavaScript/TypeScript linting
- **eslint-plugin-vue** – Vue-specific linting rules
- **Prettier** – Code formatting
- **eslint-config-prettier** – Prevents conflicts between ESLint and Prettier

</details>

<details>
<summary><strong>🎵 Audio Processing Libraries</strong></summary>

- **Aubio** – WebAssembly build of aubio library for pitch detection and audio analysis
- **Web Audio API** – Native browser audio processing capabilities
- **FFT** – Fast Fourier Transform for frequency analysis

</details>

<details>
<summary><strong>🛠️ Development Tools & Scripts</strong></summary>

- **Python Scripts** – Custom utility scripts for codebase analysis
  - `scan-orphans.py` – Finds unused JavaScript and JSON files
  - `finder.py` – Search utility for scanning code patterns
- **PowerShell Scripts** – Build and deployment automation
  - `deploy.ps1` – Netlify deployment wrapper
  - `build-alpha-vue-spa.ps1` – SPA build process
  - `fetch-aubio.ps1` – Downloads Aubio WebAssembly binaries
- **Batch Files** – Windows command shortcuts
  - `finder.bat` & `orphans.bat` – Quick access to Python utilities

</details>

<details>
<summary><strong>📺 VS Code Extensions</strong></summary>

- **GitHub Copilot & Chat** – AI-powered code assistance
- **Tailwind CSS IntelliSense** – Tailwind utility class autocomplete
- **Prettier** – Code formatting
- **PowerShell** – PowerShell script support
- **Python** – Python development environment
- **Live Server** – Local development server
- **SonarLint** – Code quality analysis
- **Markdown All in One** – Enhanced markdown editing
- **Project Manager** – Workspace management
- **Meld Diff** – File comparison tool

</details>

<details>
<summary><strong>📦 Key NPM Dependencies</strong></summary>

```json
{
  "dependencies": {
    "vue": "^3.5.22",
    "pinia": "^3.0.3", 
    "vue-router": "^4.6.3",
    "daisyui": "^5.3.7",
    "tailwindcss": "^3.3.3"
  },
  "devDependencies": {
    "vite": "^7.1.12",
    "@vitejs/plugin-vue": "^6.0.1", 
    "@playwright/test": "^1.56.1"
  }
}
```

**Scripts Available:**
- `npm run dev` – Start Vite development server
- `npm run build` – Build production bundle
- `npm run test:e2e` – Run Playwright end-to-end tests
- `npm run build:css` – Build Tailwind CSS for legacy pages
