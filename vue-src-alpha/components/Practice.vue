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
        <EmptyStateMessage 
          v-else-if="!hasActiveUnit"
          :context="{ page: 'practice-hub', hasActiveUnit, isInLessonMode }"
          size="medium"
          :showActions="true"
        />
        <div v-else class="mb-4">
          <div class="p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <div class="badge badge-info">Preview Practice</div>
              <div class="tooltip tooltip-bottom" data-tip="You're testing this content without saving it to a lesson. Create a lesson to track progress and organize practice units.">
                <span class="material-symbols-outlined text-blue-600 text-sm cursor-help">help</span>
              </div>
            </div>
            <div class="text-sm text-blue-700">
              Testing without saving to lesson
            </div>
            <div class="text-sm text-gray-600 mt-1 font-medium">{{ practiceUnitName }}</div>
            
            <!-- Save suggestion -->
            <div class="flex gap-2 mt-3 justify-center">
              <button class="btn btn-xs btn-primary" @click="navigateToSave">
                💾 Save This Practice Unit
              </button>
              <button class="btn btn-xs btn-outline" @click="exitQuickPractice">
                ← Back to Creator
              </button>
            </div>
          </div>
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
import EmptyStateMessage from "./EmptyStateMessage.vue";
import { RouterLink, useRouter } from "vue-router";
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useLessonStore } from '../stores/lessonStore.js';
import { useActiveUnitStatus } from '../composables/useActiveUnitStatus.js';
import useAnnouncer from '../composables/useAnnouncer';
import { computed } from 'vue';

const store = usePracticeUnitScaleStore();
const lesson = useLessonStore();
const router = useRouter();
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

function endLesson() {
  lesson.deactivateLesson();
  announce('Lesson ended');
}

// Navigation functions for Quick Practice Mode
function navigateToSave() {
  console.log('Navigating to save practice unit');
  router.push('/create-practice-unit-view?from=save');
}

function exitQuickPractice() {
  console.log('Exiting quick practice mode');
  const creatorRoute = store.practiceUnitHeader.practiceUnitType === 'Scale' 
    ? '/create-scales' 
    : '/create-exercises';
  router.push(creatorRoute);
}
</script>
