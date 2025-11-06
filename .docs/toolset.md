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
<summary><strong>🧪 Testing Stack</strong></summary>

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
<summary><strong>📦 Key NPM Dependencies</strong></summary>

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.3",
    "vue-router": "^4.2.5",
    "@vueuse/core": "^10.2.0",
    "daisyui": "^4.0.7",
    "@supabase/supabase-js": "^2.80.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.1",
    "@testing-library/vue": "^7.0.2",
    "c8": "^8.0.1",
    "eslint": "^8.53.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.1.0",
    "eslint-config-prettier": "^9.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```
