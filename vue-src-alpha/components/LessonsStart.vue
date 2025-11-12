<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatLessonPages"
      >
        <span class="material-symbols-outlined">play_circle</span>
        <span class="text-2xl font-bold">Start Lesson</span>
      </div>
      <!-- Continue button removed from LessonsStart; Continue appears on the Lessons page when a lesson is active -->
        <div class="max-w-3xl mx-auto">
          <div class="card bg-base-100 shadow-sm mb-4">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <h3 class="card-title">Your Lessons</h3>
                <div>
                  <button class="btn btn-sm" @click="refresh">Refresh</button>
                </div>
              </div>
              <div class="text-xs text-gray-600 mt-2">Select a lesson and then pick a Practice Unit to begin.</div>

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
                    <div class="font-medium">{{ lesson.lesson_name }}</div>
                    <div class="text-xs text-gray-500">{{ lesson.created_at ? new Date(lesson.created_at).toLocaleString() : '' }}</div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-sm" @click="openSelectUnits(lesson)">Select</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Select Units Modal -->
          <div v-if="selectingLessonId" class="modal modal-open">
            <div class="modal-box max-w-2xl">
              <h3 class="font-bold text-lg">Select Practice Unit — {{ selectingLessonName }}</h3>
              <div class="py-4">
                <div v-if="unitsLoading" class="p-2">Loading units…</div>
                <div v-else>
                  <div v-if="unitList.length === 0" class="text-gray-500">This lesson has no Practice Units.</div>
                  <ul v-else class="space-y-2">
                    <li v-for="(u, idx) in unitList" :key="u.practice_unit_id" class="flex items-center justify-between p-2 bg-base-200 rounded">
                      <div>
                        <div class="font-medium">{{ u.name || '(untitled)' }}</div>
                        <div class="text-xs text-gray-500">{{ u.type || '' }}</div>
                      </div>
                      <div>
                        <button class="btn btn-sm" @click="selectUnit(u)">Select Unit</button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="modal-action">
                <button class="btn" @click="closeSelectModal">Cancel</button>
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
import { ref, onMounted } from "vue";
import { useLessonStore } from "../stores/lessonStore.js";
import { useRouter, useRoute } from 'vue-router';

const store = useLessonStore();
const router = useRouter();
const route = useRoute();

const selectingLessonId = ref(null);
const selectingLessonName = ref('');
const unitsLoading = ref(false);
const unitList = ref([]);

async function refresh() {
  await store.fetchLessons();
}

onMounted(async () => {
  await refresh();
  // If the route asked us to open a lesson's Select Units modal, do it now
  try {
    const openId = route.query?.openLessonId;
    if (openId) {
      // attempt to open the select modal for the requested lesson id
      await openSelectUnitsById(String(openId));
    }
  } catch (e) {
    // ignore failures here; user can still open manually
  }
});

async function openSelectUnits(lesson) {
  if (!lesson || !lesson.lesson_id) return;
  selectingLessonId.value = lesson.lesson_id;
  selectingLessonName.value = lesson.lesson_name || '';
  unitsLoading.value = true;
  unitList.value = [];
  try {
    const units = await store.fetchLessonUnits(lesson.lesson_id);
    unitList.value = (units || []).map(u => ({ practice_unit_id: u.practice_unit_id, name: u.name || (u.unit_json?.practiceUnitHeader?.practiceName) || '(untitled)', type: u.type, unit_json: u.unit_json }));
  } catch (e) {
    alert(e?.message || 'Failed to load lesson units');
  } finally {
    unitsLoading.value = false;
  }
}

// Open select units modal when we only have a lesson id (used via routing)
async function openSelectUnitsById(lessonId) {
  if (!lessonId) return;
  selectingLessonId.value = lessonId;
  // try to discover the lesson name from the cached lessons list
  try {
    const found = (store.availableLessons || []).find(l => String(l.lesson_id) === String(lessonId));
    selectingLessonName.value = found ? (found.lesson_name || '') : '';
  } catch (e) {
    selectingLessonName.value = '';
  }
  unitsLoading.value = true;
  unitList.value = [];
  try {
    const units = await store.fetchLessonUnits(lessonId);
    unitList.value = (units || []).map(u => ({ practice_unit_id: u.practice_unit_id, name: u.name || (u.unit_json?.practiceUnitHeader?.practiceName) || '(untitled)', type: u.type, unit_json: u.unit_json }));
  } catch (e) {
    alert(e?.message || 'Failed to load lesson units');
  } finally {
    unitsLoading.value = false;
  }
}

function closeSelectModal() {
  selectingLessonId.value = null;
  selectingLessonName.value = '';
  unitList.value = [];
}

function selectUnit(u) {
  try {
    if (!u || !u.unit_json) return alert('Invalid unit');
    // Activate the lesson and load the unit
    store.activateLesson(selectingLessonId.value || null, selectingLessonName.value || '', u);
    // navigate to lessons-continue (which reuses practice view)
    router.push('/lessons-continue');
    closeSelectModal();
  } catch (e) {
    alert(e?.message || 'Failed to load unit');
  }
}
</script>
