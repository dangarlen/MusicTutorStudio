<template>
  <header class="w-full py-3 bg-gray-200 shadow">
    <div class="container mx-auto px-4 flex items-center justify-between">
      <RouterLink to="/" class="hover:underline">
        <h1 class="text-2xl md:text-3xl font-bold text-black">Music Tutor Studio</h1>
      </RouterLink>

      <!-- Active lesson indicator + End Lesson control (subtle) -->
      <div class="flex items-center gap-3">
        <template v-if="lesson.lessonActive">
          <span
            class="px-2 py-1 rounded-md text-sm bg-yellow-100 text-yellow-800 border border-yellow-200"
            :title="`Active lesson: ${lesson.activeLessonName}`"
            aria-live="polite"
          >
            Active: {{ lesson.activeLessonName || 'Lesson' }}
          </span>

          <button
            class="btn btn-ghost btn-sm"
            @click="openEndLessonModal"
            aria-haspopup="dialog"
            :aria-label="`End lesson ${lesson.activeLessonName || ''}`"
          >
            End
          </button>
        </template>
      </div>
    </div>

    <!-- Global live region for announcements (visually hidden) -->
    <div
      ref="globalLive"
      class="sr-only"
      aria-atomic="true"
      aria-live="polite"
    >
      {{ liveAnnounce }}
    </div>

    <!-- End Lesson confirmation modal -->
    <div v-if="showEndLessonModal" class="modal modal-open" role="dialog" aria-modal="true" :aria-label="`End lesson ${lesson.activeLessonName || ''} confirmation`">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg">End lesson</h3>
        <p class="py-2">Are you sure you want to end the lesson "{{ lesson.activeLessonName }}"?</p>
        <div class="modal-action">
          <button class="btn" @click="closeEndLessonModal">Cancel</button>
          <button class="btn btn-primary" @click="confirmEndLesson">End Lesson</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import { useLessonStore } from '../stores/lessonStore.js';
import useAnnouncer from '../composables/useAnnouncer';

const lesson = useLessonStore();
const { liveAnnounce, announce } = useAnnouncer();

const showEndLessonModal = ref(false);
const globalLive = ref(null);

function openEndLessonModal() {
  showEndLessonModal.value = true;
  // focus management could be added here if needed
}

function closeEndLessonModal() {
  showEndLessonModal.value = false;
}

function confirmEndLesson() {
  const name = lesson.activeLessonName || '';
  try {
    lesson.deactivateLesson();
    announce(`Lesson ended${name ? ': ' + name : ''}`);
  } catch (e) {
    console.warn('[Header] confirmEndLesson', e);
    announce('Failed to end lesson');
  }
  showEndLessonModal.value = false;
}

// Close modal on Escape when open
function onKeyDown(e) {
  if (e.key === 'Escape' && showEndLessonModal.value) {
    closeEndLessonModal();
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown));

// Expose refs to template
</script>
