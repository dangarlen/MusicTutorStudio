<style>
@import "../styles/theme.css";
</style>
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">edit_square</span>
        <span class="text-2xl font-bold">Creator</span>
      </div>
      <!-- Lesson / Unit header (shows active lesson/unit or indicates none) -->
      <div class="mb-4">
        <div v-if="lessonActive" class="mb-4 flex items-center justify-between gap-4">
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
        <RouterLink to="/create-scales" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >queue_music</span
          >
          Create Scale
        </RouterLink>

        <RouterLink to="/create-exercises" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >add_circle</span
          >
          Create Exercise
        </RouterLink>

        <RouterLink to="/create-edit-practice-unit" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined" aria-hidden="true">edit</span>
          Edit Practice Unit
        </RouterLink>

        <RouterLink
          to="/create-practice-unit-view"
          class="mtsFormatCreatorButtons"
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >visibility</span
          >
          Preview Practice Unit
        </RouterLink>
        <div class="text-xs text-gray-600 mt-2 text-center">
          A Practice Unit can be created from either a Scale or an Exercise — use "Create Scale" or "Create Exercise" to start a new unit.
        </div>
        <br />

        <!-- Create Lessons button removed: now available under Lessons page -->
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useLessonStore } from '../stores/lessonStore.js';
import { useActiveUnitStatus } from '../composables/useActiveUnitStatus.js';
import useAnnouncer from '../composables/useAnnouncer';
import { computed } from 'vue';

const store = usePracticeUnitScaleStore();
const lesson = useLessonStore();
const { 
  hasActiveUnit,
  activeUnitDisplayName,
  isInLessonMode,
  isInQuickPracticeMode,
  statusIndicator 
} = useActiveUnitStatus();
const { liveAnnounce, announce } = useAnnouncer();

// Legacy compatibility
const activeLessonName = computed(() => lesson.activeLessonName || '');
const lessonActive = computed(() => isInLessonMode.value);
const practiceUnitName = computed(() => activeUnitDisplayName.value);
</script>
