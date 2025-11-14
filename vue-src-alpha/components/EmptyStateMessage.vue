<template>
  <div class="empty-state-container" :class="containerClasses">
    <div class="empty-state-content">
      <!-- Icon -->
      <div v-if="showIcon" class="empty-state-icon">
        <span class="material-symbols-outlined" :class="iconClasses">
          {{ computedIcon }}
        </span>
      </div>

      <!-- Message -->
      <div class="empty-state-message">
        <h3 v-if="title" class="empty-state-title">{{ title }}</h3>
        <p class="empty-state-text">{{ computedMessage }}</p>
      </div>

      <!-- Action Button -->
      <div v-if="showActions && showAction" class="empty-state-action">
        <button 
          v-if="actionRoute"
          class="btn"
          :class="actionButtonClasses"
          @click="navigateToAction"
        >
          <span v-if="actionIcon" class="material-symbols-outlined mr-2">
            {{ actionIcon }}
          </span>
          {{ computedActionText }}
        </button>
        <button 
          v-else-if="actionCallback"
          class="btn"
          :class="actionButtonClasses"
          @click="actionCallback"
        >
          <span v-if="actionIcon" class="material-symbols-outlined mr-2">
            {{ actionIcon }}
          </span>
          {{ computedActionText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useActiveUnitStatus } from '../composables/useActiveUnitStatus.js';

/**
 * Props for EmptyStateMessage component
 */
const props = defineProps({
  /** @type {Object|string} Context object or string for determining appropriate message */
  context: {
    type: [Object, String],
    default: () => ({ page: 'general', hasActiveUnit: false, isInLessonMode: false }),
    validator: (value) => {
      if (typeof value === 'string') {
        return ['general', 'practice', 'create', 'staff', 'lesson', 
                'scale', 'exercise', 'pitch', 'notes'].includes(value);
      }
      return typeof value === 'object' && value !== null;
    }
  },

  /** @type {string} Custom message to display */
  message: {
    type: String,
    default: ''
  },

  /** @type {string} Title text */
  title: {
    type: String,
    default: ''
  },

  /** @type {string} Icon name from Material Symbols */
  icon: {
    type: String,
    default: ''
  },

  /** @type {boolean} Whether to show icon */
  showIcon: {
    type: Boolean,
    default: true
  },

  /** @type {string} Action button text */
  actionText: {
    type: String,
    default: ''
  },

  /** @type {string} Action button icon */
  actionIcon: {
    type: String,
    default: ''
  },

  /** @type {string} Route to navigate to on action */
  actionRoute: {
    type: String,
    default: ''
  },

  /** @type {Function} Callback function for action */
  actionCallback: {
    type: Function,
    default: null
  },

  /** @type {string} Size variant */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },

  /** @type {string} Visual variant */
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'info', 'warning', 'error'].includes(value)
  },

  /** @type {boolean} Whether to show action buttons */
  showActions: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const { getEmptyStateMessage, getActionText } = useActiveUnitStatus();

// Default icons for different contexts
const defaultIcons = {
  general: 'info',
  practice: 'music_note',
  'practice-hub': 'music_note',
  'practice-scales': 'piano',
  'practice-pitch': 'graphic_eq',
  create: 'add_circle',
  staff: 'music_note',
  lesson: 'menu_book',
  scale: 'piano',
  exercise: 'fitness_center',
  pitch: 'graphic_eq',
  notes: 'note_add'
};

/**
 * Computed icon based on context and props
 */
const computedIcon = computed(() => {
  if (props.icon) return props.icon;
  
  // Handle both object and string contexts for icon lookup
  const contextKey = typeof props.context === 'object' ? props.context.page : props.context;
  return defaultIcons[contextKey] || 'info';
});

/**
 * Computed message based on context and props
 */
const computedMessage = computed(() => {
  if (props.message) return props.message;
  
  // Handle both object and string contexts
  if (typeof props.context === 'object') {
    return getEmptyStateMessage(props.context);
  } else {
    // Legacy string context support
    return getEmptyStateMessage({ page: props.context, hasActiveUnit: false, isInLessonMode: false });
  }
});

/**
 * Computed action text based on context
 */
const computedActionText = computed(() => {
  if (props.actionText) return props.actionText;
  
  // Handle both object and string contexts for action text
  if (typeof props.context === 'object') {
    return getActionText(props.context);
  }
  
  // Legacy string context - determine action type
  const actionMap = {
    practice: 'load',
    'practice-hub': 'load',
    'practice-scales': 'create',
    'practice-pitch': 'create',
    create: 'create',
    scale: 'create',
    exercise: 'create',
    general: 'load'
  };
  
  const actionType = actionMap[props.context] || 'load';
  return getActionText(actionType);
});

/**
 * Whether to show action button
 */
const showAction = computed(() => {
  return (props.actionRoute || props.actionCallback) && computedActionText.value;
});

/**
 * Container CSS classes
 */
const containerClasses = computed(() => ({
  [`empty-state-${props.size}`]: true,
  [`empty-state-${props.variant}`]: true,
}));

/**
 * Icon CSS classes
 */
const iconClasses = computed(() => ({
  'text-4xl': props.size === 'large',
  'text-3xl': props.size === 'medium', 
  'text-2xl': props.size === 'small',
  'text-gray-400': props.variant === 'default',
  'text-blue-400': props.variant === 'info',
  'text-yellow-400': props.variant === 'warning',
  'text-red-400': props.variant === 'error',
}));

/**
 * Action button CSS classes
 */
const actionButtonClasses = computed(() => ({
  'btn-primary': props.variant === 'default',
  'btn-info': props.variant === 'info',
  'btn-warning': props.variant === 'warning',
  'btn-error': props.variant === 'error',
  'btn-sm': props.size === 'small',
  'btn-md': props.size === 'medium',
  'btn-lg': props.size === 'large',
}));

/**
 * Navigate to action route
 */
function navigateToAction() {
  if (props.actionRoute) {
    router.push(props.actionRoute);
  }
}
</script>

<style scoped>
.empty-state-container {
  @apply flex items-center justify-center p-8;
  min-height: 200px;
}

.empty-state-content {
  @apply text-center max-w-md;
}

.empty-state-icon {
  @apply mb-4;
}

.empty-state-message {
  @apply mb-6;
}

.empty-state-title {
  @apply text-lg font-semibold mb-2 text-gray-700;
}

.empty-state-text {
  @apply text-gray-600 leading-relaxed;
}

.empty-state-action {
  @apply flex justify-center;
}

/* Size variants */
.empty-state-small {
  @apply p-4;
  min-height: 120px;
}

.empty-state-small .empty-state-content {
  @apply max-w-xs;
}

.empty-state-small .empty-state-title {
  @apply text-base;
}

.empty-state-small .empty-state-text {
  @apply text-sm;
}

.empty-state-large {
  @apply p-12;
  min-height: 300px;
}

.empty-state-large .empty-state-content {
  @apply max-w-lg;
}

.empty-state-large .empty-state-title {
  @apply text-xl;
}

/* Variant styles */
.empty-state-info {
  @apply bg-blue-50 border border-blue-200 rounded-lg;
}

.empty-state-warning {
  @apply bg-yellow-50 border border-yellow-200 rounded-lg;
}

.empty-state-error {
  @apply bg-red-50 border border-red-200 rounded-lg;
}

.empty-state-default {
  @apply bg-gray-50 border border-gray-200 rounded-lg;
}
</style>
