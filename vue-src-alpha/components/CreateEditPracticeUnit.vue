<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages">
        <span class="material-symbols-outlined">edit</span>
        <span class="text-2xl font-bold">Edit Practice Unit</span>
        <span v-if="practiceUnitType" class="badge badge-primary ml-2">{{ practiceUnitType }}</span>
      </div>

      <!-- Staff Preview -->
      <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
        <input type="checkbox" class="peer" checked />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
          <span>{{ practiceUnitType }} Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{ store.noteArray && store.noteArray.length > 0 ? store.noteArray.map((n) => n.pitch).join(", ") : `No ${practiceUnitType.toLowerCase()} generated yet.` }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <StaffPreview />
        </div>
      </div>

      <!-- Details -->
      <div v-if="practiceUnitType === 'Scale'" class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Scale Selector:</strong> {{ scaleSelectorText }}</div>
          <div><strong>Scale Range:</strong> {{ scaleRangeText }}</div>
          <div><strong>Duration & Direction:</strong> {{ durationDirectionText }}</div>
          <div><strong>Staff Formatting:</strong> {{ staffFormattingText }}</div>
        </div>
      </div>

      <div v-else-if="practiceUnitType === 'Exercise'" class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Title:</strong> {{ exerciseTitle }}</div>
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Key Signature:</strong> {{ exerciseKeySignature }}</div>
          <div><strong>Time Signature:</strong> {{ exerciseTimeSignature }}</div>
          <div><strong>Tempo:</strong> {{ exerciseTempo }} bpm</div>
          <div v-if="exerciseTechniqueFocus.length > 0"><strong>Technique Focus:</strong> {{ exerciseTechniqueFocus.join(', ') }}</div>
          <div v-if="exerciseSourceMusicXML"><strong>Source:</strong> {{ exerciseSourceMusicXML }}</div>
          <div v-if="exerciseSourceURL"><strong>Source URL:</strong> <a :href="exerciseSourceURL" target="_blank" class="link link-primary">{{ exerciseSourceURL }}</a></div>
          <div><strong>Note Count:</strong> {{ noteCount }}</div>
        </div>
      </div>

      <!-- Your Saved Practice Units (edit icon) -->
      <div class="max-w-2xl mx-auto mb-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title">Your Saved Practice Units</h3>
            <div class="text-xs text-gray-500 mb-2">Filter and open a saved practice unit for editing</div>
            <div v-if="lesson.error" class="alert alert-warning mb-2">
              <span>{{ lesson.error }}</span>
              <button class="btn btn-xs ml-auto" @click="lesson.fetchPracticeUnits()">Retry</button>
            </div>
            <div class="form-control mb-2">
              <input type="text" v-model="filterText" class="input input-bordered w-full" placeholder="Filter by name, type, instrument" />
            </div>
            <div class="textarea textarea-bordered w-full min-h-48 bg-base-200 overflow-y-auto p-0">
              <div v-if="lesson.loading" class="p-4">
                <span class="loading loading-spinner loading-md"></span>
                <span class="ml-2">Loading practice units…</span>
              </div>
              <div v-else-if="filteredUnits.length === 0" class="p-4 text-gray-500">No Practice Units found.</div>
              <ul v-else class="p-2 space-y-1">
                <li v-for="unit in filteredUnits" :key="unit.practice_unit_id">
                  <div class="flex items-center justify-between w-full p-2 rounded border" :style="'background-color: white; border-color: #e5e7eb;'">
                    <div class="flex items-center gap-2 flex-1">
                      <span class="badge badge-outline">{{ unit.type }}</span>
                      <span class="font-medium">{{ unit.name }}</span>
                      <span class="text-xs text-gray-500" v-if="instrumentLabel(unit)">• {{ instrumentLabel(unit) }}</span>
                    </div>
                    <button class="btn btn-sm btn-circle" @click="editUnit(unit)" :title="`Edit '${unit.name}'`">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal modal-open">
        <div class="modal-box max-w-3xl">
          <h3 class="font-bold text-lg mb-2">Edit Practice Unit: {{ editUnitName }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label"><span class="label-text">Header (JSON)</span></label>
              <textarea v-model="headerJson" class="textarea textarea-bordered w-full h-48"></textarea>
            </div>
            <div>
              <label class="label"><span class="label-text">noteArray (JSON)</span></label>
              <textarea v-model="noteArrayJson" class="textarea textarea-bordered w-full h-48"></textarea>
            </div>
          </div>
          <div class="modal-action">
            <button class="btn" @click="closeEditModal">Cancel</button>
            <button class="btn" @click="saveEdits">Save to Memory</button>
            <button class="btn btn-primary" @click="saveEditsToDatabase">Save to Database</button>
          </div>
        </div>
      </div>

    </main>

    <div style="max-width: 400px; margin: 2em auto">
      <button class="mtsFormatCreatorButtons flex items-center gap-2" @click="$router.push('/creator')">
        <span class="material-symbols-outlined align-middle mr-2" aria-hidden="true">edit_square</span>
        Return to Creator
      </button>
    </div>

    <FooterStandard />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from './Header.vue';
import FooterStandard from './FooterStandard.vue';
import StaffPreview from './StaffPreview.vue';
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useLessonStore } from '../stores/lessonStore.js';
import supabase from '../scripts/supabaseClient.js';

const store = usePracticeUnitScaleStore();
const lesson = useLessonStore();

const filterText = ref('');
const showEditModal = ref(false);
const editUnitName = ref('');
const headerJson = ref('');
const noteArrayJson = ref('');
const editingUnitId = ref(null);
const editingUnit = ref(null);

function instrumentLabel(u) {
  const val = u?.instrument;
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.instrument || val.name || '';
  return '';
}

const filteredUnits = computed(() => {
  const q = (filterText.value || '').toLowerCase().trim();
  const items = lesson.availableUnits || [];
  if (!q) return items;
  return items.filter((u) => {
    const name = (u.name || '').toLowerCase();
    const type = (u.type || '').toLowerCase();
    const inst = instrumentLabel(u).toLowerCase();
    return name.includes(q) || type.includes(q) || inst.includes(q);
  });
});

function editUnit(unit) {
  if (!unit || !unit.unit_json) return alert('Invalid unit');
  editingUnitId.value = unit.practice_unit_id || null;
  editingUnit.value = unit;
  editUnitName.value = unit.name || '(untitled)';
  headerJson.value = JSON.stringify(unit.unit_json.practiceUnitHeader || {}, null, 2);
  noteArrayJson.value = JSON.stringify(unit.unit_json.noteArray || [], null, 2);
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

function saveEdits() {
  try {
    const h = JSON.parse(headerJson.value || '{}');
    const n = JSON.parse(noteArrayJson.value || '[]');
    store.practiceUnitHeader = { ...store.practiceUnitHeader, ...h };
    store.noteArray = Array.isArray(n) ? n.map((x) => ({ ...x })) : [];
    alert('Updated active practice unit in memory');
    showEditModal.value = false;
  } catch (e) {
    console.error('Failed to save edits', e);
    alert('Invalid JSON - please fix header or noteArray JSON');
  }
}

// Save or update the edited practice unit to the database
async function saveEditsToDatabase() {
  try {
    const h = JSON.parse(headerJson.value || '{}');
    const n = JSON.parse(noteArrayJson.value || '[]');
    const unitJson = { practiceUnitHeader: h, noteArray: n };

    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) throw sessErr;
    const user = sessData?.session?.user;
    if (!user) {
      alert('Sign in first to save to database.');
      return;
    }

    const row = {
      practice_unit_id: editingUnitId.value || undefined,
      user_id: user.id,
      name: editUnitName.value || h.practiceName || '(untitled)',
      type: h.practiceUnitType || editingUnit.value?.type || 'Scale',
      unit_json: unitJson,
    };

    let res;
    if (editingUnitId.value) {
      // Update existing (upsert with conflict)
      res = await supabase.from('practice_units').upsert(row, { onConflict: 'practice_unit_id' }).select().single();
    } else {
      // Insert new
      res = await supabase.from('practice_units').insert(row).select().single();
    }

    if (res.error) throw res.error;

    // Refresh available units list and set editingUnitId to returned id
    await lesson.fetchPracticeUnits();
    const returned = res.data;
    editingUnitId.value = returned?.practice_unit_id || editingUnitId.value;
    alert('Saved practice unit to database.');
    showEditModal.value = false;
  } catch (e) {
    console.error('[CreateEditPracticeUnit] saveEditsToDatabase failed', e);
    alert(e?.message || 'Failed to save to database.');
  }
}

onMounted(() => {
  lesson.fetchPracticeUnits().catch((e) => console.warn('Failed to load practice units', e));
  store.loadInstruments();
});

const practiceUnitType = computed(() => store.practiceUnitHeader?.practiceUnitType || 'Scale');
const instrumentName = computed(() => {
  const inst = store.practiceUnitHeader?.instrument || store.instrument;
  if (!inst) return 'Unknown';
  return inst.instrument || 'Unknown';
});
const noteCount = computed(() => store.noteArray?.length || 0);

const scaleSelectorText = computed(() => {
  const sel = store.scaleSelections || {};
  return `${sel.key || 'C'} ${sel.scaleType ? sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1) : 'Major'} Scale`;
});
const scaleRangeText = computed(() => {
  const sel = store.scaleSelections || {};
  const n = Number(sel.octaveCount) || 1;
  const plural = n === 1 ? 'octave' : 'octaves';
  return `${n} ${plural} starting at ${sel.startingOctave || 'C4'}`;
});
const durationDirectionText = computed(() => {
  const sel = store.scaleSelections || {};
  const dir = sel.direction || 'Ascending';
  const map = { whole: 'Whole', half: 'Half', quarter: 'Quarter', eighth: 'Eighth' };
  const dur = map[sel.noteDuration] || (sel.noteDuration ? sel.noteDuration : 'Quarter');
  return `${dir} ${dur} Note Scale`;
});
const staffFormattingText = computed(() => {
  const so = (store.scaleSelections && store.scaleSelections.staffOptions) || {};
  const parts = [];
  if (so.keySignature) parts.push('Key Signature');
  if (so.barLines) parts.push('Bar Lines');
  if (so.timeSignature) parts.push('Time Signature');
  if (so.accidentals) parts.push('Accidentals');
  let family = '';
  switch (so.accidentalFamily) {
    case 'auto-key': family = 'Auto: Based on Key'; break;
    case 'auto-direction': family = 'Auto: Based on Asc/Desc'; break;
    case 'force-sharps': family = 'Force: Sharps'; break;
    case 'force-flats': family = 'Force: Flats'; break;
  }
  return parts.join(', ') + (family ? `, ${family}` : '');
});

const exerciseTitle = computed(() => store.practiceUnitHeader?.practiceName || '');
const exerciseKeySignature = computed(() => store.practiceUnitHeader?.keySignature || '');
const exerciseTimeSignature = computed(() => store.practiceUnitHeader?.timeSignature || '');
const exerciseTempo = computed(() => store.practiceUnitHeader?.tempo || '');
const exerciseTechniqueFocus = computed(() => store.practiceUnitHeader?.techniqueFocus || []);
const exerciseSourceMusicXML = computed(() => store.practiceUnitHeader?.sourceMusicXML || '');
const exerciseSourceURL = computed(() => store.practiceUnitHeader?.sourceURL || '');

</script>


