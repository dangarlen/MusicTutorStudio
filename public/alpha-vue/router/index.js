import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue";
import Practice from "../components/Practice.vue";
import PracticeExercises from "../components/PracticeExercises.vue";
import PracticeScales from "../components/PracticeScales.vue";
import Creator from "../components/Creator.vue";
import Lessons from "../components/Lessons.vue";
import LessonsManage from "../components/LessonsManage.vue";
import LessonsManagePracticeUnits from "../components/LessonsManagePracticeUnits.vue";
import LessonsCreate from "../components/LessonsCreate.vue";
import LessonsStart from "../components/LessonsStart.vue";
import CreateScale from "../components/CreateScale.vue";
import CreateExercise from "../components/CreateExercise.vue";
import CreateLessons from "../components/CreateLessons.vue";
import About from "../components/About.vue";
import Preferences from "../components/Preferences.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/practice", component: Practice },
  { path: "/practice-exercises", component: PracticeExercises },
  { path: "/practice-scales", component: PracticeScales },
  { path: "/creator", component: Creator },
  { path: "/lessons", component: Lessons },
  { path: "/lessons-manage", component: LessonsManage },
  {
    path: "/lessons-manage-practice-units",
    component: LessonsManagePracticeUnits,
  },
  { path: "/lessons-create", component: LessonsCreate },
  { path: "/lessons-start", component: LessonsStart },
  { path: "/preferences", component: Preferences },
  { path: "/create-scales", component: CreateScale },
  { path: "/create-exercises", component: CreateExercise },
  { path: "/create-lessons", component: CreateLessons },
  { path: "/about", component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
