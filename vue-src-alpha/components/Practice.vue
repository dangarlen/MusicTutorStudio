<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl font-bold">Practice</span>
      </div>
      <!-- Lesson / Unit header (shows active lesson/unit or indicates none) -->
      <div class="mb-4">
        <div v-if="lessonActive" class="mb-4 flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div class="badge badge-primary">Active lesson: {{ activeLessonName }}</div>
          <div class="flex-1 text-center">
            <div v-if="practiceUnitName"
              class="text-sm text-gray-500 mx-auto max-w-lg truncate overflow-hidden whitespace-nowrap"
              :title="practiceUnitName"
            >
              Unit: {{ practiceUnitName }}
            </div>
            <div class="text-xs text-gray-500 mt-1" aria-hidden="true">{{ liveAnnounce }}</div>
            <div aria-live="polite" class="sr-only">{{ liveAnnounce }}</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-sm btn-warning" @click="endLesson">End Lesson</button>
          </div>
        </div>
        <div v-else class="mb-4 text-sm text-gray-500">No active lesson or unit.</div>
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
        <RouterLink to="/practice-active-unit" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >play_circle</span
          >
          Active Unit Practice
        </RouterLink>

        <RouterLink to="/practice-recall-practice-unit" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true">download</span>
          Recall Saved Practice Unit
        </RouterLink>

        <RouterLink to="/practice-pitch" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true">hearing</span>
          Pitch Practice
        </RouterLink>
        
        <RouterLink to="/practice-notes" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true">sticky_note_2</span>
          Student Notes
        </RouterLink>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { RouterLink } from "vue-router";
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useLessonStore } from '../stores/lessonStore.js';
import useAnnouncer from '../composables/useAnnouncer';
import { computed } from 'vue';

const store = usePracticeUnitScaleStore();
const lesson = useLessonStore();
const { liveAnnounce, announce } = useAnnouncer();

const activeLessonName = computed(() => lesson.activeLessonName || '');
const lessonActive = computed(() => !!lesson.lessonActive);
const practiceUnitName = computed(() => {
  try {
    return (
      store.practiceUnitHeader?.practiceName ||
      lesson.activeLessonUnit?.name ||
      ''
    );
  } catch (e) {
    return '';
  }
});

function endLesson() {
  lesson.deactivateLesson();
  announce('Lesson ended');
}
</script>
