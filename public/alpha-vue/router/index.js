import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue";
import Practice from "../components/Practice.vue";
import PracticeExercises from "../components/PracticeExercises.vue";
import PracticeScales from "../components/PracticeScales.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/practice", component: Practice },
  { path: "/practice-exercises", component: PracticeExercises },
  { path: "/practice-scales", component: PracticeScales },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
