import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { createPinia } from "pinia";

console.log("[Vue Alpha] main.js loaded, attempting to mount app...");
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
console.log("[Vue Alpha] app mounted.");
