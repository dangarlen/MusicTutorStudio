<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">note_add</span>
        <span class="text-2xl font-bold">Create Lessons</span>
      </div>

      <div class="max-w-2xl mx-auto mb-4">
        <AuthStatusBanner :onRetry="() => lesson.fetchPracticeUnits()" />
      </div>

      <div class="card bg-base-100 shadow-sm max-w-2xl mx-auto">
        <div class="card-body">
          <h2 class="card-title mb-2">Create New Lesson</h2>
          <div class="text-sm text-gray-600 mb-4">
            <strong>How this works:</strong> Choose a name, add practice units
            from the list below to build your lesson, then click
            <strong>Save Lesson to Database</strong> at the bottom.
          </div>

          <!-- Lesson Name -->
          <label class="label" for="lessonName">
            <span class="label-text font-semibold">Lesson Name:</span>
          </label>
          <input
            id="lessonName"
            type="text"
            class="input input-bordered w-full"
            v-model="lesson.lessonName"
            placeholder="Enter lesson name"
          />

          <!-- Available Practice Units -->
          <div class="mt-6">
            <div class="font-semibold mb-1">Your Saved Practice Units:</div>
            <div class="text-xs text-gray-500 mb-2">
              Click "Add" to include a unit in this lesson
            </div>
            <div v-if="lesson.error" class="alert alert-warning mb-2">
              <span>{{ lesson.error }}</span>
              <button
                class="btn btn-xs ml-auto"
                @click="lesson.fetchPracticeUnits()"
              >
                Retry
              </button>
            </div>
            <div class="form-control">
              <input
                type="text"
                v-model="filterText"
                class="input input-bordered w-full mb-2"
                placeholder="Filter by name, type, instrument"
              />
            </div>
            <div
              class="textarea textarea-bordered w-full min-h-48 bg-base-200 overflow-y-auto p-0"
            >
              <div v-if="lesson.loading" class="p-4">
                <span class="loading loading-spinner loading-md"></span>
                <span class="ml-2">Loading practice units…</span>
              </div>
              <div
                v-else-if="filteredUnits.length === 0"
                class="p-4 text-gray-500"
              >
                No Practice Units found.
              </div>
              <ul v-else class="p-2 space-y-1">
                <li v-for="unit in filteredUnits" :key="unit.practice_unit_id">
                  <div
                    class="flex items-center justify-between w-full p-2 rounded border"
                    :style="
                      isUnitSelected(unit.practice_unit_id)
                        ? 'background-color: #fef3c7; border-color: #fcd34d;'
                        : 'background-color: white; border-color: #e5e7eb;'
                    "
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <span class="badge badge-outline">{{ unit.type }}</span>
                      <span class="font-medium">{{ unit.name }}</span>
                      <span
                        class="text-xs text-gray-500"
                        v-if="instrumentLabel(unit)"
                        >• {{ instrumentLabel(unit) }}</span
                      >
                    </div>
                    <button
                      class="btn btn-sm btn-circle"
                      @click="addToLesson(unit)"
                      :title="
                        isUnitSelected(unit.practice_unit_id)
                          ? 'Already in lesson'
                          : 'Add to lesson'
                      "
                    >
                      <span class="material-symbols-outlined text-base"
                        >add</span
                      >
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Units in Lesson (Working Lesson) -->
          <div class="mt-6 border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <div class="font-semibold mb-2">
              📝 Working Lesson (not saved yet):
            </div>
            <div class="text-xs text-gray-600 mb-2">
              These units will be included when you click "Save Lesson to
              Database" below
            </div>
            <div
              v-if="lesson.selectedUnits.length === 0"
              class="text-gray-500 p-4 bg-white rounded"
            >
              (empty - add units from the list above)
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="(unit, idx) in lesson.selectedUnits"
                :key="unit.practice_unit_id"
                class="flex items-center justify-between p-2 rounded bg-white border border-gray-200"
              >
                <div class="flex items-center gap-2">
                  <span class="badge badge-outline">{{ idx + 1 }}</span>
                  <span class="badge badge-neutral">{{ unit.type }}</span>
                  <span class="font-medium">{{ unit.name }}</span>
                  <span
                    class="text-xs text-gray-500"
                    v-if="instrumentLabel(unit)"
                    >• {{ instrumentLabel(unit) }}</span
                  >
                </div>
                <div class="flex gap-2">
                  <button
                    class="btn btn-xs"
                    @click="move(idx, idx - 1)"
                    :disabled="idx === 0"
                  >
                    ↑
                  </button>
                  <button
                    class="btn btn-xs"
                    @click="move(idx, idx + 1)"
                    :disabled="idx === lesson.selectedUnits.length - 1"
                  >
                    ↓
                  </button>
                  <button
                    class="btn btn-xs btn-error"
                    @click="remove(unit.practice_unit_id)"
                  >
                    Remove
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="mt-6">
            <div
              v-if="
                lesson.selectedUnits.length > 0 && !lesson.lessonName?.trim()
              "
              class="text-sm text-red-600 mb-2"
            >
              ⚠️ Enter a Lesson Name above before saving
            </div>
            <div class="flex gap-3">
              <button
                class="btn btn-success"
                @click="handleSave"
                :disabled="!canSave"
                :title="saveButtonTooltip"
              >
                💾 Save Lesson to Database
              </button>
              <button class="btn" @click="handleCancel">
                Clear & Start Over
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-2xl mx-auto mt-6">
        <LessonsReturn />
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import LessonsReturn from "./LessonsReturn.vue";
import AuthStatusBanner from "./AuthStatusBanner.vue";
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../stores/lessonStore.js";
import supabase from "../scripts/supabaseClient.js";

const lesson = useLessonStore();
const filterText = ref("");

// Generate default lesson name
async function generateDefaultLessonName() {
  try {
    const { data: sessData } = await supabase.auth.getSession();
    const user = sessData?.session?.user;
    const username = user?.email?.split("@")[0] || "user";

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `Lesson ${username} ${month}-${day}-${year} ${hours}:${minutes}`;
  } catch {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `Lesson user ${month}-${day}-${year} ${hours}:${minutes}`;
  }
}

function instrumentLabel(u) {
  const val = u?.instrument;
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.instrument || val.name || "";
  return "";
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

const canAdd = computed(() => filteredUnits.value.length > 0);
const canSave = computed(
  () => !!lesson.lessonName?.trim() && lesson.selectedUnits.length > 0
);

const saveButtonTooltip = computed(() => {
  if (!lesson.lessonName?.trim() && lesson.selectedUnits.length > 0) {
    return "Enter a Lesson Name at the top of the page before saving";
  }
  if (!lesson.lessonName?.trim()) {
    return "Requires a Lesson Name and at least one Practice Unit";
  }
  if (lesson.selectedUnits.length === 0) {
    return "Add at least one Practice Unit to your lesson";
  }
  return "Save this lesson to the database";
});

function isUnitSelected(unitId) {
  return lesson.selectedUnits.some((u) => u.practice_unit_id === unitId);
}

function addToLesson(unit) {
  lesson.addUnit(unit);
}
function handleAddFirst() {
  if (filteredUnits.value.length > 0) addToLesson(filteredUnits.value[0]);
}
function move(from, to) {
  lesson.moveUnit(from, to);
}
function remove(id) {
  lesson.removeUnit(id);
}
async function handleSave() {
  try {
    await lesson.saveLesson();
    alert("Lesson saved.");
    lesson.clear();
  } catch (e) {
    console.error("[CreateLessons] save failed", e);
    alert(e?.message || "Save failed");
  }
}
function handleCancel() {
  lesson.clear();
}

onMounted(async () => {
  // Don't block on auth check - generate name immediately
  const defaultName = await generateDefaultLessonName();
  lesson.lessonName = defaultName;

  // Fetch practice units in parallel
  lesson.fetchPracticeUnits();
});
</script>
