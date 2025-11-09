import { createRouter, createWebHashHistory } from "vue-router";

import Home from "../components/Home.vue";
import Practice from "../components/Practice.vue";
import PracticeExercises from "../components/PracticeExercises.vue";
import PracticeScales from "../components/PracticeScales.vue";
import Creator from "../components/Creator.vue";
import Lessons from "../components/Lessons.vue";
import LessonsManage from "../components/LessonsManage.vue";
import LessonsCreate from "../components/LessonsCreate.vue";
import LessonsStart from "../components/LessonsStart.vue";
import CreateExercise from "../components/CreateExercise.vue";
import CreateLessons from "../components/CreateLessons.vue";
import About from "../components/About.vue";
import Preferences from "../components/Preferences.vue";

import CreateScaleView from "../components/CreateScaleView.vue";
import CreatePracticeUnitView from "../components/CreatePracticeUnitView.vue";
import CreateEditPracticeUnit from "../components/CreateEditPracticeUnit.vue";
import PhaseBasedVueTestContainer from "../components/PhaseBasedVueTestContainer.vue";
import SaveToPracticeUnitExport from "../components/SaveToPracticeUnitExport.vue";
import RecallJsonFromPinia from "../components/RecallJsonFromPinia.vue";
import ImportPracticeUnitExport from "../components/ImportPracticeUnitExport.vue";
import EditPracticeUnitScaleInMemory from "../components/EditPracticeUnitScaleInMemory.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/practice", name: "practice", component: Practice },
  {
    path: "/practice-recall-practice-unit",
    name: "practice-recall-practice-unit",
    component: PracticeExercises,
  },
  {
    path: "/practice-active-unit",
    name: "practice-active-unit",
    component: PracticeScales,
  },
  { path: "/creator", name: "creator", component: Creator },
  { path: "/lessons", name: "lessons", component: Lessons },
  { path: "/lessons-manage", name: "lessons-manage", component: LessonsManage },
  // Removed route: /lessons-manage-practice-units (Manage Practice Units)
  // Route repointed: use the CreateLessons component at /lessons-create
  { path: "/lessons-create", name: "lessons-create", component: CreateLessons },
  { path: "/lessons-start", name: "lessons-start", component: LessonsStart },
  { path: "/preferences", name: "preferences", component: Preferences },
  { path: "/create-scales", name: "create-scales", component: CreateScaleView },
  {
    path: "/create-exercises",
    name: "create-exercises",
    component: CreateExercise,
  },
  // Keep old /create-lessons for compatibility and redirect to /lessons-create
  { path: "/create-lessons", name: "create-lessons", redirect: "/lessons-create" },
  { path: "/about", name: "about", component: About },
  // Removed legacy test-staff routes (builder/display/data)
  // Unified Practice Unit Viewer (replaces separate scale/exercise viewers)
  {
    path: "/create-practice-unit-view",
    name: "create-practice-unit-view",
    component: CreatePracticeUnitView,
  },
  {
    path: "/create-edit-practice-unit",
    name: "create-edit-practice-unit",
    component: CreateEditPracticeUnit,
  },
  // Deprecated routes - redirect to unified viewer
  {
    path: "/create-scale-view",
    name: "create-scale-view",
    redirect: "/create-practice-unit-view",
  },
  {
    path: "/create-exercise-view",
    name: "create-exercise-view",
    redirect: "/create-practice-unit-view",
  },
  {
    path: "/phase-test-container",
    name: "phase-test-container",
    component: PhaseBasedVueTestContainer,
  },
  {
    path: "/save-to-practice-unit-export",
    name: "save-to-practice-unit-export",
    component: SaveToPracticeUnitExport,
  },
  {
    path: "/recall-json-from-pinia",
    name: "recall-json-from-pinia",
    component: RecallJsonFromPinia,
  },
  {
    path: "/import-practice-unit-export",
    name: "import-practice-unit-export",
    component: ImportPracticeUnitExport,
  },
  {
    path: "/edit-practice-unit-scale-in-memory",
    name: "edit-practice-unit-scale-in-memory",
    component: EditPracticeUnitScaleInMemory,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
