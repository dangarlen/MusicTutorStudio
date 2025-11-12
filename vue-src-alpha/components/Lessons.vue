<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatLessonPages"
      >
        <span class="material-symbols-outlined">menu_book</span>
        <span class="text-2xl font-bold">Lessons</span>
      </div>

      <!-- Active Lesson indicator and End Lesson control (shown when a lesson is active) -->
      <div v-if="lessonActive" class="mb-4 flex items-center justify-between gap-4 max-w-3xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="badge badge-primary">Active lesson: {{ activeLessonName }}</div>
          <!-- Visible helper text for recent announcements + aria-live for screen readers -->
          <div class="text-sm text-gray-600 ml-2" aria-hidden="true">{{ liveAnnounce }}</div>
          <div aria-live="polite" class="sr-only">{{ liveAnnounce }}</div>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink :to="{ path: '/lessons-start', query: { openLessonId: activeLessonId } }" class="btn btn-sm btn-secondary"> 
            <span class="material-symbols-outlined align-middle mr-2">skip_next</span>
            Continue Lesson
          </RouterLink>
          <button class="btn btn-sm btn-warning" @click="endLesson">End Lesson</button>
        </div>
      </div>
      <div
        class="flex flex-col gap-6 max-w-xs mx-auto mt-8"
        style="
          display: flex;
          flex-direction: column;
          gap: 1.5em;
          max-width: 400px;
          margin: 2em auto;
        "
      >
        <RouterLink to="/lessons-create" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >add_circle</span
          >
          Create Lessons
        </RouterLink>
        <RouterLink to="/lessons-manage" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >launch</span
          >
          Manage Lessons
        </RouterLink>
        <RouterLink to="/lessons-start" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >play_circle</span
          >
          Start Lesson
        </RouterLink>
        <div class="text-xs text-gray-600 mt-2 text-center">
          A Lesson is built from Practice Units and may include Scales, Exercises, or both — assemble units to compose a lesson.
        </div>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { RouterLink } from "vue-router";
import { useLessonStore } from "../stores/lessonStore.js";
import { computed } from "vue";
import useAnnouncer from "../composables/useAnnouncer";

const lesson = useLessonStore();
const activeLessonName = computed(() => lesson.activeLessonName || '');
const lessonActive = computed(() => !!lesson.lessonActive);
const activeLessonId = computed(() => lesson.activeLessonId || null);
const { liveAnnounce, announce } = useAnnouncer();

function endLesson() {
  lesson.deactivateLesson();
  announce('Lesson ended');
}
</script>
