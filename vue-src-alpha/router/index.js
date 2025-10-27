import { createRouter, createWebHashHistory } from "vue-router";

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

import CreateTestStaffNoteBuilder from "../components/CreateTestStaffNoteBuilder.vue";
import CreateTestStaffNoteDisplay from "../components/CreateTestStaffNoteDisplay.vue";
import CreateTestStaffNoteData from "../components/CreateTestStaffNoteData.vue";
import CreateScaleView from "../components/CreateScaleView.vue";
import CreateExerciseView from "../components/CreateExerciseView.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/practice", name: "practice", component: Practice },
  {
    path: "/practice-exercises",
    name: "practice-exercises",
    component: PracticeExercises,
  },
  {
    path: "/practice-scales",
    name: "practice-scales",
    component: PracticeScales,
  },
  { path: "/creator", name: "creator", component: Creator },
  { path: "/lessons", name: "lessons", component: Lessons },
  { path: "/lessons-manage", name: "lessons-manage", component: LessonsManage },
  {
    path: "/lessons-manage-practice-units",
    name: "lessons-manage-practice-units",
    component: LessonsManagePracticeUnits,
  },
  { path: "/lessons-create", name: "lessons-create", component: LessonsCreate },
  { path: "/lessons-start", name: "lessons-start", component: LessonsStart },
  { path: "/preferences", name: "preferences", component: Preferences },
  { path: "/create-scales", name: "create-scales", component: CreateScale },
  {
    path: "/create-exercises",
    name: "create-exercises",
    component: CreateExercise,
  },
  { path: "/create-lessons", name: "create-lessons", component: CreateLessons },
  { path: "/about", name: "about", component: About },
  {
    path: "/create-test-staff-note-builder",
    name: "create-test-staff-note-builder",
    component: CreateTestStaffNoteBuilder,
  },
  {
    path: "/create-test-staff-note-display",
    name: "create-test-staff-note-display",
    component: CreateTestStaffNoteDisplay,
  },
  {
    path: "/create-test-staff-note-data",
    name: "create-test-staff-note-data",
    component: CreateTestStaffNoteData,
  },
  {
    path: "/create-scale-view",
    name: "create-scale-view",
    component: CreateScaleView,
  },
  {
    path: "/create-exercise-view",
    name: "create-exercise-view",
    component: CreateExerciseView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
