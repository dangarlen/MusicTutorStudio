<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl">Practice Exercises</span>
      </div>

      <!-- Your Saved Practice Units (load into active memory) -->
      <div class="max-w-4xl mx-auto mb-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title">Your Saved Practice Units</h3>
            <div class="text-xs text-gray-500 mb-2">
              Filter and load a saved practice unit into Active Unit memory
            </div>
            
            <!-- Active Unit Status Indicator -->
            <div v-if="hasActiveUnit" class="alert alert-success mb-3">
              <span class="material-symbols-outlined">check_circle</span>
              <div>
                <div class="font-medium">Active Practice Unit</div>
                <div class="text-sm">{{ activeUnitDisplayName }}</div>
              </div>
            </div>
            <div v-else class="alert alert-info mb-3">
              <span class="material-symbols-outlined">info</span>
              <div class="text-sm">No practice unit currently active. Load one below to start practicing.</div>
            </div>

            <div v-if="lesson.error" class="alert alert-warning mb-2">
              <span>{{ lesson.error }}</span>
              <button class="btn btn-xs ml-auto" @click="lesson.fetchPracticeUnits()">
                Retry
              </button>
            </div>

            <div class="form-control mb-2">
              <input
                type="text"
                v-model="filterText"
                class="input input-bordered w-full"
                placeholder="Filter by name, type, instrument"
              />
            </div>

            <div class="textarea textarea-bordered w-full min-h-48 bg-base-200 overflow-y-auto p-0">
              <div v-if="lesson.loading" class="p-4">
                <span class="loading loading-spinner loading-md"></span>
                <span class="ml-2">Loading practice units…</span>
              </div>
              <div v-else-if="filteredUnits.length === 0" class="p-4 text-gray-500">
                No Practice Units found.
              </div>
              <ul v-else class="p-2 space-y-1">
                <li v-for="unit in filteredUnits" :key="unit.practice_unit_id">
                  <div 
                    class="flex items-center justify-between w-full p-2 rounded border hover:bg-gray-50 transition-colors" 
                    :style="'background-color: white; border-color: #e5e7eb;'"
                    :title="createTooltipText(unit)"
                  >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <span class="badge badge-outline flex-shrink-0">{{ unit.type }}</span>
                      <span class="font-medium truncate">{{ unit.name }}</span>
                      <span class="text-xs text-gray-500 flex-shrink-0" v-if="instrumentLabel(unit)">• {{ instrumentLabel(unit) }}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <div class="text-right">
                        <div class="text-xs text-gray-500" v-if="unit.last_modified">
                          {{ formatTimestamp(unit.last_modified, 'compact') }}
                        </div>
                        <div class="text-xs text-gray-400" v-if="unit.last_modified">
                          {{ formatTimestamp(unit.last_modified, 'relative') }}
                        </div>
                      </div>
                      <button 
                        class="btn btn-sm btn-circle" 
                        @click="loadUnit(unit)" 
                        :title="`Load '${unit.name}' into Active Unit`"
                      >
                        <span class="material-symbols-outlined text-base">download</span>
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Behind the Curtain: show active practiceUnit JSON -->
      <div class="max-w-4xl mx-auto mt-4">
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl">
          <input type="checkbox" class="peer" v-model="expandJson" />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>Behind the Curtain: practiceUnit.json</span>
          </div>
          <div class="collapse-content px-4">
            <pre class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96">{{ JSON.stringify(practiceUnitPreview, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <PracticeReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import PracticeReturn from "./PracticeReturn.vue";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { ref, computed, onMounted } from "vue";
import { useLessonStore } from "../stores/lessonStore.js";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import { useActiveUnitStatus } from "../composables/useActiveUnitStatus.js";

const lesson = useLessonStore();
const practiceStore = usePracticeUnitScaleStore();
const { hasActiveUnit, activeUnitDisplayName } = useActiveUnitStatus();

const filterText = ref("");

function instrumentLabel(u) {
  const val = u?.instrument;
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.instrument || val.name || "";
  return "";
}

// Format timestamp for display
function formatTimestamp(timestamp, format = 'compact') {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    if (format === 'compact') {
      // Compact format: "Nov 14, 2:30 PM"
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } else if (format === 'tooltip') {
      // Detailed format for tooltip: "November 14, 2025 at 2:30:45 PM"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
    } else if (format === 'relative') {
      // Relative time: "2 hours ago", "3 days ago"
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    }
  } catch (e) {
    console.warn('Error formatting timestamp:', e);
    return '';
  }
}

// Create tooltip text with all available metadata
function createTooltipText(unit) {
  const parts = [];
  
  if (unit.name) {
    parts.push(`Name: ${unit.name}`);
  }
  
  if (unit.type) {
    parts.push(`Type: ${unit.type}`);
  }
  
  const instrument = instrumentLabel(unit);
  if (instrument) {
    parts.push(`Instrument: ${instrument}`);
  }
  
  if (unit.last_modified) {
    parts.push(`Last Modified: ${formatTimestamp(unit.last_modified, 'tooltip')}`);
    parts.push(`(${formatTimestamp(unit.last_modified, 'relative')})`);
  }
  
  if (unit.practice_unit_id) {
    parts.push(`ID: ${unit.practice_unit_id}`);
  }
  
  return parts.join('\n');
}

const filteredUnits = computed(() => {
  const q = (filterText.value || "").toLowerCase().trim();
  const items = lesson.availableUnits || [];
  if (!q) return items;
  return items.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const type = (u.type || "").toLowerCase();
    const inst = instrumentLabel(u).toLowerCase();
    return name.includes(q) || type.includes(q) || inst.includes(q);
  });
});

// Compose the active practice unit JSON for the 'Behind the Curtain' view
const practiceUnitPreview = computed(() => {
  try {
    // store action returns an object representing the current active unit
    return practiceStore.composePracticeUnit();
  } catch (e) {
    return {};
  }
});

// Controls whether the 'Behind the Curtain' JSON collapse is expanded
const expandJson = ref(false);

function loadUnit(unit) {
  try {
    if (!unit?.unit_json) {
      alert("Invalid practice unit data.");
      return;
    }
    
    console.log('[PracticeExercises] Loading unit for practice:', unit.name);
    
    // Load the unit data into the store
    practiceStore.loadPracticeUnit(unit.unit_json);
    
    // Activate it for practice mode (this syncs with AppStateStore)
    practiceStore.activateForPractice(unit.unit_json, 'saved');
    
    console.log('[PracticeExercises] Unit activated for practice mode');
    
    // Provide user feedback
    alert(`Loaded: ${unit.name}\n\nYou can now practice this unit on any practice page.`);
    
  } catch (e) {
    console.error("[PracticeExercises] loadUnit exception", e);
    alert("Failed to load practice unit: " + e.message);
  }
}

onMounted(() => {
  lesson.fetchPracticeUnits().catch((e) => console.warn("Failed to load practice units", e));
});
</script>

<style scoped>
/* Enhanced tooltip styling for practice units */
.tooltip-enhanced {
  position: relative;
}

.tooltip-enhanced:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: pre-line;
  z-index: 1000;
  max-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tooltip-enhanced:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.9);
  z-index: 1001;
}

/* Improve layout responsiveness */
@media (max-width: 640px) {
  .practice-unit-timestamp {
    display: none;
  }
}
</style>

