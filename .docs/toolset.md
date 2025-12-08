## Deployment & Hosting

- [Netlify Project Dashboard](https://app.netlify.com/teams/dangarlen/projects)

# 🎛️ MusicTutorStudio Toolset Overview

This document outlines the full development toolset for MusicTutorStudio, including frontend libraries, backend services, audio/notation tools, and development utilities.

<details>

**Frontend Libraries:**
- Vue.js 3 (SPA framework)
- Vite (build tool/dev server)
- Pinia (state management)
- Vue Router (routing)
- VueUse (utility composables)
- Tailwind CSS (utility-first styling)
- DaisyUI (Tailwind component library)
- VexFlow (music notation rendering)
- Tone.js (audio synthesis/playback)
- Material Symbols (icon font)

**Backend & External Services:**
- Supabase (Postgres DB, Auth, Storage)

**Data:**
- JSON-driven config for instruments, scales, lessons

</details>

<details>

**CDN Libraries:**
- VexFlow 3.0.9 (jsDelivr)
- Tone.js
- Material Symbols
- DaisyUI/Tailwind (legacy pages)

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

**Audio & Pitch Detection:**
- Aubio (WebAssembly pitch detection)
- Web Audio API
- FFT (frequency analysis)

</details>

<details>

**Development Tools & Scripts:**
- Python: scan-orphans.py, finder.py
- PowerShell: deploy.ps1, build-alpha-vue-spa.ps1, fetch-aubio.ps1
- Batch: finder.bat, orphans.bat

</details>

<details>

**VS Code Extensions:**
- GitHub Copilot & Chat
- Tailwind CSS IntelliSense
- Prettier
- PowerShell
- Python
- Live Server
- SonarLint
- Markdown All in One
- Project Manager
- Meld Diff

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
