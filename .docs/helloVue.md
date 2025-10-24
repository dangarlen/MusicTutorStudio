# Hello Vue Example: File & Directory Structure

This document describes the files, scripts, and directory structure used by the example Hello World Vue app in `public/vue/refactor-alpha/`, including Pinia state management, DaisyUI components, and file save/load features.

## Directory Structure

```
refactor-alpha/
├── App.vue
├── components/
│   ├── HelloWorld.vue
│   └── HelloTwo.vue
├── fragments/
├── index.html
├── main.js
├── pages/
├── router/
│   └── index.js
├── scripts/
│   └── vue-test-getTime.js
├── stores/
│   └── name.js
```

## File Descriptions

- **index.html**: Entry HTML file for the Vue app. Mounts the Vue app to a DOM element (e.g., `<div id="app"></div>`).
- **main.js**: JavaScript entry point. Creates and mounts the Vue app, imports `App.vue`, sets up Vue Router and Pinia.
- **App.vue**: Root Vue component. Renders the current route using `<router-view />`.
- **components/HelloWorld.vue**: Main page component. Includes:
  - A Name input and Save button, using Pinia (`stores/name.js`) for state management.
  - A button to navigate to HelloTwo.vue.
  - A display of the current time using a JS utility.
- **components/HelloTwo.vue**: Second page, styled with DaisyUI. Features:
  - DaisyUI-styled buttons and file input (primary color).
  - Save State: Downloads a JSON file with the name and timestamp.
  - Recall State: Loads state from localStorage.
  - Load from File: Loads state from a user-selected JSON file and updates the UI immediately.
  - Saved state is shown in a DaisyUI alert and preformatted block.
- **router/index.js**: Vue Router setup for page navigation.
- **stores/name.js**: Pinia store for managing the Name input state.
- **scripts/vue-test-getTime.js**: JavaScript utility function used by `HelloWorld.vue`.

## Example Imports & Usage

- `main.js` imports and sets up Pinia and Vue Router:
  ```js
  import { createApp } from "vue";
  import App from "./App.vue";
  import router from "./router/index.js";
  import { createPinia } from "pinia";
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount("#app");
  ```
- `App.vue` renders the current route:
  ```vue
  <template>
    <router-view />
  </template>
  ```
- `HelloWorld.vue` uses Pinia and a JS utility:
  ```js
  import { useNameStore } from "../stores/name.js";
  import { getTime } from "../scripts/vue-test-getTime.js";
  ```
- `HelloTwo.vue` uses DaisyUI and file input:
  ```vue
  <input
    type="file"
    accept="application/json"
    @change="loadFromFile"
    ref="fileInput"
    class="file-input file-input-primary file-input-bordered"
  />
  ```

## Features

- **Name Input**: Enter and save a name using Pinia state management. The saved name is displayed below the input.
- **Routing**: Navigate between HelloWorld and HelloTwo using Vue Router.
- **Utility JS**: Show the current time using a helper JS function.
- **DaisyUI Components**: All controls in HelloTwo use DaisyUI for modern styling.
- **File Save/Load**: Save state as a JSON file and load it back using a DaisyUI file input.

## Notes

- The `fragments/`, `pages/`, `router/`, and `stores/` folders are present for future expansion.
- All supporting JS utilities are kept in `scripts/` for modularity.
- This structure is scalable for larger Vue projects.
