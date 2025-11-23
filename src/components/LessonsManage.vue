<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatLessonPages"
      >
        <span class="material-symbols-outlined">launch</span>
        <span class="text-2xl font-bold">Manage Lessons</span>
      </div>

      <div class="max-w-3xl mx-auto">
        <div class="card bg-base-100 shadow-sm mb-4">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h3 class="card-title">Your Lessons</h3>
              <div>
                <button class="btn btn-sm" @click="refresh">Refresh</button>
              </div>
            </div>
            <div class="text-xs text-gray-600 mt-2">A Lesson is a collection of Practice Units and may include Scales, Exercises, or both — assemble units to build a lesson.</div>

            <div v-if="store.lessonsLoading" class="p-4">
              <span class="loading loading-spinner loading-md"></span>
              <span class="ml-2">Loading lessons…</span>
            </div>
            <div v-else-if="store.lessonsError" class="p-4">
              <div class="alert alert-warning">
                <div>{{ store.lessonsError }}</div>
                <div class="ml-auto">
                  <button class="btn btn-xs" @click="refresh">Retry</button>
                </div>
              </div>
            </div>

            <div v-else-if="store.availableLessons.length === 0" class="p-4 text-gray-500">
              No lessons found.
            </div>

            <ul v-else class="space-y-2">
              <li v-for="lesson in store.availableLessons" :key="lesson.lesson_id" class="flex items-center justify-between p-2 bg-base-200 rounded">
                <div class="flex items-center gap-3">
                  <div class="font-medium">
                    <template v-if="editingId === lesson.lesson_id">
                      <input v-model="editName" class="input input-sm input-bordered" />
                    </template>
                    <template v-else>
                      {{ lesson.lesson_name }}
                    </template>
                  </div>
                  <div class="text-xs text-gray-500">{{ lesson.created_at ? new Date(lesson.created_at).toLocaleString() : '' }}</div>
                </div>
                <div class="flex gap-2">
                  <button v-if="editingId !== lesson.lesson_id" class="btn btn-xs" @click="startEdit(lesson)">Edit</button>
                  <button v-else class="btn btn-xs btn-success" @click="saveEdit(lesson)">Save</button>
                  <button v-if="editingId === lesson.lesson_id" class="btn btn-xs" @click="cancelEdit">Cancel</button>
                  <button class="btn btn-xs" @click="openEditUnits(lesson)">Edit Units</button>
                  <button class="btn btn-xs btn-error" @click="confirmDelete(lesson)">Delete</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Edit Units Modal -->
        <div v-if="editingUnitsLessonId" class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg">Edit Practice Units — {{ editingUnitsLessonName }}</h3>
            <div class="py-4">
              <div v-if="unitsLoading" class="p-2">Loading units…</div>
              <div v-else>
                <ul class="space-y-2">
                  <li
                    v-for="(u, idx) in localUnits"
                    :key="u.practice_unit_id"
                    class="flex items-center justify-between p-2 bg-base-200 rounded"
                    draggable="true"
                    @dragstart="onDragStart($event, idx)"
                    @dragover.prevent
                    @drop="onDrop($event, idx)"
                    @dragend="onDragEnd"
                    :class="{ 'opacity-60': draggedIndex === idx }">
                    <div>
                      <div class="font-medium">{{ u.name || '(untitled)' }}</div>
                      <div class="text-xs text-gray-500">{{ u.type || '' }}</div>
                    </div>
                    <div class="flex gap-2">
                      <button class="btn btn-xs" :disabled="idx===0" @click="moveUp(idx)">↑</button>
                      <button class="btn btn-xs" :disabled="idx===localUnits.length-1" @click="moveDown(idx)">↓</button>
                      <button class="btn btn-xs btn-ghost btn-sm text-error" @click="removeLocalUnit(u.practice_unit_id)">Remove</button>
                    </div>
                  </li>
                </ul>

                <div class="mt-4">
                  <label class="block text-sm font-medium mb-1">Add Practice Unit</label>
                  <div class="flex gap-2">
                    <select v-model="selectedAvailableId" class="select select-sm w-full">
                      <option value="">-- choose --</option>
                      <option v-for="au in availableToAdd" :key="au.practice_unit_id" :value="au.practice_unit_id">{{ au.name || '(untitled)' }} — {{ au.type }}</option>
                    </select>
                    <button class="btn btn-sm" :disabled="!selectedAvailableId" @click="addSelectedUnit">Add</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-action">
              <button class="btn" @click="closeUnitsModal">Cancel</button>
              <button class="btn btn-primary" @click="saveUnits">Save</button>
            </div>
          </div>
        </div>

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
import { ref, onMounted, computed } from "vue";
import { useLessonStore } from "../stores/lessonStore.js";

const store = useLessonStore();
const editingId = ref(null);
const editName = ref("");
// For editing the lesson's practice units
const editingUnitsLessonId = ref(null);
const editingUnitsLessonName = ref("");
const unitsLoading = ref(false);
const localUnits = ref([]); // array of unit objects for the modal
const selectedAvailableId = ref("");

const availableToAdd = computed(() => {
  // availableUnits filtered to those not already in localUnits
  const existing = new Set((localUnits.value || []).map((u) => u.practice_unit_id));
  return (store.availableUnits || []).filter((au) => !existing.has(au.practice_unit_id));
});

// Drag & drop state
const draggedIndex = ref(-1);

function onDragStart(e, idx) {
  try {
    e.dataTransfer.setData("text/plain", String(idx));
    // Use move effect to indicate reordering
    if (e.dataTransfer.setDragImage) {
      // optional: create tiny transparent image to avoid default ghost
      // skipping for simplicity; browsers handle native drag images
    }
  } catch (_) {}
  draggedIndex.value = idx;
}

function onDrop(e, destIdx) {
  const src = Number(e.dataTransfer.getData("text/plain"));
  if (isNaN(src)) return;
  if (src === destIdx) return;
  // Reorder localUnits: remove src, insert at destIdx
  const arr = localUnits.value;
  // Guard indexes
  if (src < 0 || src >= arr.length || destIdx < 0 || destIdx > arr.length) return;
  const [item] = arr.splice(src, 1);
  // If dropping after removal and src < destIdx, the dest index shifts by -1
  const insertAt = src < destIdx ? destIdx - 1 : destIdx;
  arr.splice(insertAt, 0, item);
  draggedIndex.value = -1;
}

function onDragEnd() {
  draggedIndex.value = -1;
}

function refresh() {
  store.fetchLessons();
}

function startEdit(lesson) {
  editingId.value = lesson.lesson_id;
  editName.value = lesson.lesson_name || "";
}

function cancelEdit() {
  editingId.value = null;
  editName.value = "";
}

async function saveEdit(lesson) {
  try {
    await store.updateLessonName(lesson.lesson_id, editName.value.trim());
    editingId.value = null;
    editName.value = "";
  } catch (e) {
    alert(e?.message || "Update failed");
  }
}

function confirmDelete(lesson) {
  if (!confirm(`Delete lesson "${lesson.lesson_name}"? This cannot be undone.`)) return;
  store.deleteLesson(lesson.lesson_id).catch((e) => alert(e?.message || "Delete failed"));
}

onMounted(() => {
  refresh();
  // make sure we have the available practice units for adding to lessons
  if (!store.availableUnits || store.availableUnits.length === 0) {
    store.fetchPracticeUnits().catch((e) => console.warn("Failed to load practice units", e));
  }
});

async function openEditUnits(lesson) {
  if (!lesson || !lesson.lesson_id) return;
  editingUnitsLessonId.value = lesson.lesson_id;
  editingUnitsLessonName.value = lesson.lesson_name || "";
  unitsLoading.value = true;
  localUnits.value = [];
  try {
    const units = await store.fetchLessonUnits(lesson.lesson_id);
    // Normalize into array of objects (practice_unit_id, name, type, unit_json, sort_order)
    localUnits.value = (units || []).map((u) => ({
      practice_unit_id: u.practice_unit_id,
      name: u.name || (u.unit_json?.practiceUnitHeader?.title) || "(untitled)",
      type: u.type || (u.unit_json?.practiceUnitHeader?.type) || "",
      unit_json: u.unit_json || null,
      sort_order: u.sort_order,
    }));
  } catch (e) {
    alert(e?.message || "Failed to load lesson units");
  } finally {
    unitsLoading.value = false;
  }
}

function closeUnitsModal() {
  editingUnitsLessonId.value = null;
  editingUnitsLessonName.value = "";
  localUnits.value = [];
  selectedAvailableId.value = "";
}

function moveUp(idx) {
  if (idx <= 0) return;
  const arr = localUnits.value;
  const [item] = arr.splice(idx, 1);
  arr.splice(idx - 1, 0, item);
}

function moveDown(idx) {
  if (idx < 0 || idx >= localUnits.value.length - 1) return;
  const arr = localUnits.value;
  const [item] = arr.splice(idx, 1);
  arr.splice(idx + 1, 0, item);
}

function removeLocalUnit(id) {
  localUnits.value = localUnits.value.filter((u) => u.practice_unit_id !== id);
}

function addSelectedUnit() {
  const id = selectedAvailableId.value;
  if (!id) return;
  const au = store.availableUnits.find((a) => a.practice_unit_id === id);
  if (!au) return;
  localUnits.value.push({
    practice_unit_id: au.practice_unit_id,
    name: au.name,
    type: au.type,
    unit_json: au.unit_json,
  });
  selectedAvailableId.value = "";
}

async function saveUnits() {
  if (!editingUnitsLessonId.value) return;
  try {
    const orderedIds = (localUnits.value || []).map((u) => u.practice_unit_id);
    await store.updateLessonUnits(editingUnitsLessonId.value, orderedIds);
    // success: close modal and refresh lessons
    closeUnitsModal();
    await store.fetchLessons();
  } catch (e) {
    alert(e?.message || "Failed to save lesson units");
  }
}
</script>
