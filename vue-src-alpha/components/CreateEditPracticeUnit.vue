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
        <input type="checkbox" class="peer" v-model="previewOpen" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
          <span>Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{ store.noteArray && store.noteArray.length > 0 ? store.noteArray.map((n) => n.pitch).join(", ") : 'No Practice Unit Loaded.' }}
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
                  <div
                    :class="['flex items-center justify-between w-full p-2 rounded border', isEditing(unit) ? 'bg-yellow-100 border-yellow-300 text-black' : 'bg-white border-gray-200']"
                    :style="isEditing(unit) ? { backgroundColor: '#fff9c4', borderColor: '#f6e05e', color: '#000000' } : {}"
                  >
                        <div class="flex items-center gap-2 flex-1">
                          <span class="badge badge-outline">{{ unit.type }}</span>
                          <span class="font-medium">{{ unit.name }}</span>
                          <span class="text-xs text-gray-500" v-if="instrumentLabel(unit)">• {{ instrumentLabel(unit) }}</span>
                        </div>
                        <button class="btn btn-sm btn-circle" @click="editUnit(unit)" :title="'Edit ' + unit.name" :aria-pressed="isEditing(unit)">
                          <span class="material-symbols-outlined text-base">edit</span>
                        </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Panel: structured header + noteArray editor -->
      <div v-if="showEditPanel" class="max-w-3xl mx-auto mb-6">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h3 class="card-title">Edit Practice Unit: {{ editUnitName || '(new)' }}</h3>
              <div class="flex gap-2">
                <button class="btn btn-ghost" @click="closeEditPanel">Cancel</button>
                <button class="btn" @click="saveToMemory">Save to Memory</button>
                <button class="btn btn-primary" @click="saveToDatabase">Save to Database</button>
                <button v-if="editingUnitId" class="btn btn-error" @click="deleteFromDatabase">Delete</button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label class="label"><span class="label-text">Practice Name</span></label>
              

                <label class="label mt-2"><span class="label-text">Type</span></label>
                <select v-model="headerObj.practiceUnitType" class="select select-bordered w-full">
                  <option>Scale</option>
                  <option>Exercise</option>
                </select>

                <label class="label mt-2"><span class="label-text">Instrument</span></label>
                <input v-model="headerObj.instrumentName" class="input input-bordered w-full" placeholder="Instrument (string)" />

                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label class="label"><span class="label-text">Key</span></label>
                    <input v-model="headerObj.keySignature" class="input input-bordered w-full" />
                  </div>
                  <div>
                    <label class="label"><span class="label-text">Time</span></label>
                    <input v-model="headerObj.timeSignature" class="input input-bordered w-full" />
                  </div>
                </div>

                <label class="label mt-2"><span class="label-text">Tempo (bpm)</span></label>
                <input type="number" v-model.number="headerObj.tempo" class="input input-bordered w-32" min="20" max="400" />
              </div>

              <div>
                <label class="label"><span class="label-text">Note Array (edit items)</span></label>
                <div class="space-y-2">
                  <div v-for="(note, idx) in notes" :key="idx" class="p-2 border rounded bg-white">
                    <div class="flex items-center gap-2">
                      <input v-model="note.pitch" class="input input-sm input-bordered w-32" />
                      <input v-model="note.duration" class="input input-sm input-bordered w-24" />
                      <input v-model="note.noteColor" class="input input-sm input-bordered w-24" placeholder="color" />
                      <button class="btn btn-xs" @click="moveNoteUp(idx)" :disabled="idx===0">↑</button>
                      <button class="btn btn-xs" @click="moveNoteDown(idx)" :disabled="idx===notes.length-1">↓</button>
                      <button class="btn btn-xs btn-error ml-auto" @click="removeNote(idx)">Remove</button>
                    </div>
                  </div>
                </div>
                <div class="mt-2">
                  <button class="btn btn-sm" @click="addNote">Add Note</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

      <!-- Behind the Curtain: practiceUnit.json -->
      <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-6 rounded-xl max-w-3xl mx-auto">
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">Behind the Curtain: practiceUnit.json</div>
        <div class="collapse-content px-4 pb-4">
          <pre class="whitespace-pre-wrap text-sm bg-base-200 p-3 rounded overflow-auto">{{ practiceUnitJson }}</pre>
        </div>
      </div>

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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import Header from './Header.vue';
import FooterStandard from './FooterStandard.vue';
import StaffPreview from './StaffPreview.vue';
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useTestStaffNoteStore } from '../stores/testStaffNoteStore';
import { useLessonStore } from '../stores/lessonStore.js';
import supabase from '../scripts/supabaseClient.js';

const store = usePracticeUnitScaleStore();
const lesson = useLessonStore();
const notesStore = useTestStaffNoteStore();

const filterText = ref('');
const previewOpen = ref(false);
const showEditPanel = ref(false);
const editUnitName = ref('');
const editingUnitId = ref(null);
const editingUnit = ref(null);

// Structured editor state
const headerObj = reactive({
  practiceName: '',
  practiceUnitType: 'Scale',
  instrumentName: '',
  keySignature: '',
  timeSignature: '',
  tempo: 120,
});
const notes = ref([]);

function instrumentLabel(u) {
  const val = u?.instrument;
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.instrument || val.name || '';
  return '';
}

function isEditing(unit) {
  try {
    const a = unit?.practice_unit_id;
    const b = editingUnitId.value;
    return String(a || '') === String(b || '');
  } catch (e) {
    return false;
  }
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

function openEditPanelFromUnit(unit) {
  if (!unit || !unit.unit_json) return alert('Invalid unit');
  editingUnitId.value = unit.practice_unit_id || null;
  editingUnit.value = unit;
  editUnitName.value = unit.name || '(untitled)';
  // populate structured editor
  const h = unit.unit_json.practiceUnitHeader || {};
  headerObj.practiceName = h.practiceName || h.practiceUnitName || editUnitName.value || '';
  headerObj.practiceUnitType = h.practiceUnitType || unit.type || 'Scale';
  headerObj.instrumentName = h.instrument || h.instrumentName || '';
  headerObj.keySignature = h.keySignature || h.key || '';
  headerObj.timeSignature = h.timeSignature || '';
  headerObj.tempo = h.tempo || h.bpm || 120;
  notes.value = Array.isArray(unit.unit_json.noteArray) ? unit.unit_json.noteArray.map((x) => ({ ...x })) : [];
  // Also load the selected unit into active memory so StaffPreview updates immediately
  try {
    store.practiceUnitHeader = { ...store.practiceUnitHeader, ...headerObj };
    store.noteArray = notes.value.map((n) => ({ ...n }));
    // Also populate the staff note store used by StaffPreview
    notesStore.noteArray = notes.value.map((n) => ({ ...n }));
  } catch (e) {
    console.warn('Failed to load unit into active memory for preview', e);
  }
  showEditPanel.value = true;
  previewOpen.value = true;
}

function editUnit(unit) {
  openEditPanelFromUnit(unit);
}

function closeEditPanel() {
  showEditPanel.value = false;
  // clear editing selection when closing
  editingUnitId.value = null;
  editingUnit.value = null;
}

function addNote() {
  notes.value.push({ pitch: 'C4', duration: 'q', noteColor: '' });
}

function removeNote(idx) {
  notes.value.splice(idx, 1);
}

function moveNoteUp(idx) {
  if (idx <= 0) return;
  const a = notes.value;
  const tmp = a[idx - 1];
  a[idx - 1] = a[idx];
  a[idx] = tmp;
}

function moveNoteDown(idx) {
  const a = notes.value;
  if (idx >= a.length - 1) return;
  const tmp = a[idx + 1];
  a[idx + 1] = a[idx];
  a[idx] = tmp;
}

function loadActiveIntoEditor() {
  const h = store.practiceUnitHeader || {};
  const n = store.noteArray || [];
  const hasActive = (n && n.length > 0) || (h && h.practiceName);
  if (hasActive) {
    headerObj.practiceName = h.practiceName || '';
    headerObj.practiceUnitType = h.practiceUnitType || 'Scale';
    headerObj.instrumentName = h.instrument || h.instrumentName || '';
    headerObj.keySignature = h.keySignature || '';
    headerObj.timeSignature = h.timeSignature || '';
    headerObj.tempo = h.tempo || 120;
    notes.value = Array.isArray(n) ? n.map((x) => ({ ...x })) : [];
    previewOpen.value = true;
    // ensure staff preview store is populated
    notesStore.noteArray = notes.value.map((n) => ({ ...n }));
  } else {
    previewOpen.value = false;
  }
}

function saveToMemory() {
  // write structured editor back into store
  store.practiceUnitHeader = {
    ...store.practiceUnitHeader,
    practiceName: headerObj.practiceName,
    practiceUnitType: headerObj.practiceUnitType,
    instrument: headerObj.instrumentName,
    keySignature: headerObj.keySignature,
    timeSignature: headerObj.timeSignature,
    tempo: headerObj.tempo,
  };
  store.noteArray = notes.value.map((n) => ({ ...n }));
  // Also update the staff preview store
  notesStore.noteArray = notes.value.map((n) => ({ ...n }));
  alert('Saved edits to active memory');
  showEditPanel.value = false;
}

async function saveToDatabase() {
  try {
    const unitJson = { practiceUnitHeader: { ...headerObj }, noteArray: notes.value };
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
      name: editUnitName.value || headerObj.practiceName || '(untitled)',
      type: headerObj.practiceUnitType || editingUnit.value?.type || 'Scale',
      unit_json: unitJson,
    };

    let res;
    if (editingUnitId.value) {
      res = await supabase.from('practice_units').upsert(row, { onConflict: 'practice_unit_id' }).select().single();
    } else {
      res = await supabase.from('practice_units').insert(row).select().single();
    }

    if (res.error) throw res.error;

    await lesson.fetchPracticeUnits();
    const returned = res.data;
    editingUnitId.value = returned?.practice_unit_id || editingUnitId.value;
    alert('Saved practice unit to database.');
    showEditPanel.value = false;
  } catch (e) {
    console.error('[CreateEditPracticeUnit] saveToDatabase failed', e);
    alert(e?.message || 'Failed to save to database.');
  }
}

async function deleteFromDatabase() {
  if (!editingUnitId.value) return alert('No unit selected to delete.');
  if (!confirm('Delete this practice unit from the database? This cannot be undone.')) return;
  try {
    const del = await supabase.from('practice_units').delete().eq('practice_unit_id', editingUnitId.value).select();
    if (del.error) throw del.error;
    await lesson.fetchPracticeUnits();
    alert('Deleted practice unit.');
    showEditPanel.value = false;
    editingUnitId.value = null;
  } catch (e) {
    console.error('Failed to delete', e);
    alert(e?.message || 'Delete failed.');
  }
}

onMounted(() => {
  lesson.fetchPracticeUnits().catch((e) => console.warn('Failed to load practice units', e));
  store.loadInstruments();
  // initialize preview from any active in-memory unit
  loadActiveIntoEditor();
});

// Watch local notes and headerObj while editing and propagate changes to stores
watch(
  notes,
  (nv) => {
    if (showEditPanel.value) {
      try {
        store.noteArray = nv.map((n) => ({ ...n }));
        notesStore.noteArray = nv.map((n) => ({ ...n }));
        if (editingUnit.value) {
          editingUnit.value.unit_json = editingUnit.value.unit_json || {};
          editingUnit.value.unit_json.noteArray = nv.map((n) => ({ ...n }));
        }
      } catch (e) {
        console.warn('Failed to sync notes to stores', e);
      }
    }
  },
  { deep: true }
);

watch(
  headerObj,
  (nv) => {
    if (showEditPanel.value) {
      try {
        store.practiceUnitHeader = { ...store.practiceUnitHeader, ...nv };
        if (editingUnit.value) {
          editingUnit.value.unit_json = editingUnit.value.unit_json || {};
          editingUnit.value.unit_json.practiceUnitHeader = { ...nv };
        }
      } catch (e) {
        console.warn('Failed to sync header to store', e);
      }
    }
  },
  { deep: true }
);

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

const practiceUnitPreview = computed(() => {
  // When editing, show the live editor state (headerObj + notes)
  if (showEditPanel.value) {
    return { practiceUnitHeader: { ...headerObj }, noteArray: notes.value.map((n) => ({ ...n })) };
  }
  if (typeof store.composePracticeUnit === 'function') return store.composePracticeUnit();
  return { practiceUnitHeader: store.practiceUnitHeader || {}, noteArray: store.noteArray || [] };
});

const practiceUnitJson = computed(() => JSON.stringify(practiceUnitPreview.value, null, 2));

</script>


