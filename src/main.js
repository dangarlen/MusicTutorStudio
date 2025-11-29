// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { usePitchUtils } from "./composables/usePitchUtils";

// Vuetify
import { createVuetify } from "vuetify";
import "vuetify/styles";

// Tailwind + DaisyUI
import "./styles/index.css";

console.log("[MusicTutorStudio] main.js loaded, attempting to mount app...");

const app = createApp(App);

// Initialize global utilities before mounting
usePitchUtils();
console.log("[MusicTutorStudio] Pitch utilities initialized globally");

// Register plugins
app.use(createPinia());
app.use(router);
app.use(createVuetify());

// Mount app
app.mount("#app");
console.log("[MusicTutorStudio] app mounted successfully.");
