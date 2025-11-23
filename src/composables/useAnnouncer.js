import { ref, watch } from 'vue';
import { useLessonStore } from '../stores/lessonStore.js';

// Module-scoped singleton so all callers share the same liveAnnounce ref.
const liveAnnounce = ref('');

export function useAnnouncer() {
  const lesson = useLessonStore();

  // When the lessonActive flag changes, clear the announcement.
  // This implements the requested behaviour: do not auto-clear otherwise.
  try {
    watch(
      () => lesson.lessonActive,
      () => {
        liveAnnounce.value = '';
      }
    );
  } catch (e) {
    // if watch fails (rare), ignore and keep manual control
  }

  function announce(message) {
    try {
      liveAnnounce.value = String(message || '');
    } catch (e) {
      // no-op
    }
  }

  return {
    liveAnnounce,
    announce,
  };
}

export default useAnnouncer;
