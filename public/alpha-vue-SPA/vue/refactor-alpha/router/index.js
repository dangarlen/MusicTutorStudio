import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import HelloTwo from "../components/HelloTwo.vue";

const routes = [
  { path: "/", component: HelloWorld, props: { msg: "Hello from Vue" } },
  { path: "/hello-two", component: HelloTwo },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
