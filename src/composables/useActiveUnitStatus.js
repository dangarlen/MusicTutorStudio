import { computed } from 'vue';
import { useAppStateStore } from '../stores/appStateStore.js';
import { useLessonStore } from '../stores/lessonStore.js';

/**
 * Composable for managing active unit status across components
 * Provides consistent active unit information and status indicators
 * @returns {Object} Active unit status and helpers
 */
export function useActiveUnitStatus() {
  const appState = useAppStateStore();
  const lessonStore = useLessonStore();

  /**
   * Whether there is currently an active practice unit
   * @type {import('vue').ComputedRef<boolean>}
   */
  const hasActiveUnit = computed(() => appState.hasActiveUnit);

  /**
   * Display name for the current active unit
   * @type {import('vue').ComputedRef<string>}
   */
  const activeUnitDisplayName = computed(() => appState.activeUnitDisplayName);

  /**
   * Source of the active unit (quick, lesson, saved, none)
   * @type {import('vue').ComputedRef<string>}
   */
  const activeUnitSource = computed(() => appState.activeUnitSource);

  /**
   * Whether the active unit has unsaved changes
   * @type {import('vue').ComputedRef<boolean>}
   */
  const hasUnsavedChanges = computed(() => appState.hasUnsavedChanges);

  /**
   * Current practice mode
   * @type {import('vue').ComputedRef<string>}
   */
  const practiceMode = computed(() => appState.practiceMode);

  /**
   * Whether currently in lesson mode
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isInLessonMode = computed(() => appState.isInLessonMode);

  /**
   * Whether currently in quick practice mode
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isInQuickPracticeMode = computed(() => appState.isInQuickPracticeMode);

  /**
   * Status indicator text with unsaved changes indication
   * @type {import('vue').ComputedRef<string>}
   */
  const statusIndicator = computed(() => {
    if (!hasActiveUnit.value) {
      return "No practice unit loaded";
    }

    let indicator = activeUnitDisplayName.value;
    
    if (hasUnsavedChanges.value) {
      indicator += " ⚠️";
    } else {
      indicator += " ✅";
    }

    return indicator;
  });

  /**
   * Detailed status object for advanced use cases
   * @type {import('vue').ComputedRef<Object>}
   */
  const detailedStatus = computed(() => ({
    hasUnit: hasActiveUnit.value,
    displayName: activeUnitDisplayName.value,
    source: activeUnitSource.value,
    mode: practiceMode.value,
    hasChanges: hasUnsavedChanges.value,
    isLessonMode: isInLessonMode.value,
    isQuickMode: isInQuickPracticeMode.value,
    indicator: statusIndicator.value,
  }));

  /**
   * Helper functions for common operations
   */
  const helpers = {
    /**
     * Gets the appropriate empty state message for current context
     * @param {string} [contextType] - Type of context (practice, create, etc.)
     * @returns {string}
     */
    getEmptyStateMessage(contextType = 'general') {
      if (isInLessonMode.value) {
        return "No practice unit active in current lesson";
      }

      switch (contextType) {
        case 'practice':
          return "Load a practice unit to begin practicing";
        case 'create':
          return "Create notes to see preview";
        case 'staff':
          return "No notes to display";
        default:
          return "No practice unit loaded";
      }
    },

    /**
     * Gets appropriate action text for current context
     * @param {string} actionType - Type of action (load, create, etc.)
     * @returns {string}
     */
    getActionText(actionType) {
      switch (actionType) {
        case 'load':
          return isInLessonMode.value ? "Select Unit from Lesson" : "Load Practice Unit";
        case 'create':
          return "Create New Practice Unit";
        case 'practice':
          return hasActiveUnit.value ? "Continue Practicing" : "Start Practice Session";
        default:
          return "Get Started";
      }
    },

    /**
     * Determines if save actions should be available
     * @returns {boolean}
     */
    canSave() {
      return hasActiveUnit.value && !isInLessonMode.value;
    },

    /**
     * Determines appropriate save text
     * @returns {string}
     */
    getSaveText() {
      if (!hasActiveUnit.value) return "Nothing to Save";
      if (isInLessonMode.value) return "Lesson Units Cannot be Saved Separately";
      if (hasUnsavedChanges.value) return "Save Changes";
      return "Already Saved";
    },
  };

  // Diagnostic logging for development
  if (import.meta.env.DEV) {
    // Log status changes in development
    const logStatus = () => {
      console.log('[useActiveUnitStatus] Status:', detailedStatus.value);
    };

    // Watch for major changes
    const stopWatcher = computed(() => {
      logStatus();
      return detailedStatus.value;
    });
  }

  return {
    // Reactive properties
    hasActiveUnit,
    activeUnitDisplayName,
    activeUnitSource,
    hasUnsavedChanges,
    practiceMode,
    isInLessonMode,
    isInQuickPracticeMode,
    statusIndicator,
    detailedStatus,

    // Helper functions
    ...helpers,
  };
}

/**
 * Legacy compatibility function
 * Provides the same interface as existing practice unit name computeds
 * @returns {import('vue').ComputedRef<string>}
 */
export function usePracticeUnitName() {
  const { activeUnitDisplayName } = useActiveUnitStatus();
  return activeUnitDisplayName;
}

/**
 * Legacy compatibility for lesson status
 * @returns {Object}
 */
export function useLessonStatus() {
  const { isInLessonMode } = useActiveUnitStatus();
  const lessonStore = useLessonStore();
  
  return {
    lessonActive: isInLessonMode,
    activeLessonName: computed(() => lessonStore.activeLessonName || ''),
    activeLessonId: computed(() => lessonStore.activeLessonId || null),
  };
}
