<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages">
        <span class="material-symbols-outlined">hearing</span>
        <span class="text-2xl font-bold">Pitch Practice</span>
      </div>

        <!-- Lesson / Unit header (shows active lesson/unit or indicates none) -->
        <div class="mb-4">
          <div v-if="lessonActive" class="mb-4 flex items-center justify-between gap-4">
            <div class="badge badge-primary">Active lesson: {{ activeLessonName }}</div>
            <div class="flex-1 text-center">
              <div v-if="practiceUnitName"
                class="text-sm text-gray-500 mx-auto max-w-lg truncate overflow-hidden whitespace-nowrap"
                :title="practiceUnitName"
              >
                Unit: {{ practiceUnitName }}
              </div>
              <div class="text-xs text-gray-500 mt-1" aria-hidden="true">{{ liveAnnounce }}</div>
              <div aria-live="polite" class="sr-only">{{ liveAnnounce }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-warning" @click="endLesson">End Lesson</button>
            </div>
          </div>
          <EmptyStateMessage 
            v-else-if="!hasActiveUnit"
            :context="{ page: 'practice-pitch', hasActiveUnit, isInLessonMode }"
            size="medium"
            :showActions="true"
          />
          <div v-else class="mb-4">
            <div class="p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <div class="badge badge-info">Preview Practice</div>
                <div class="tooltip tooltip-bottom" data-tip="You're testing this content without saving it to a lesson. Create a lesson to track progress and organize practice units.">
                  <span class="material-symbols-outlined text-blue-600 text-sm cursor-help">help</span>
                </div>
              </div>
              <div class="text-sm text-blue-700">
                Testing without saving to lesson
              </div>
              <div class="text-sm text-gray-600 mt-1 font-medium">{{ practiceUnitName }}</div>
              
              <!-- Save suggestion -->
              <div class="flex gap-2 mt-3 justify-center">
                <button class="btn btn-xs btn-primary" @click="navigateToSave">
                  💾 Save This Practice Unit
                </button>
                <button class="btn btn-xs btn-outline" @click="exitQuickPractice">
                  ← Back to Creator
                </button>
              </div>
            </div>
          </div>
        </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Toast stack -->
        <ToastStack :toasts="toasts" @dismiss="dismissToast" />
        <div class="card bg-white p-4">
          <!-- Always Visible Detected Note Display -->
          <div class="mb-6">
            <div class="card bg-gray-50 border border-gray-200 p-6 text-center">
              <div class="flex items-center justify-center gap-3 mb-4">
                <span class="material-symbols-outlined text-gray-600 text-2xl">music_note</span>
                <h3 class="text-xl font-bold text-gray-700">Detected Note</h3>
              </div>
              <div class="mb-4">
                <div class="text-6xl font-bold text-gray-800 mb-2">{{ detectedNote }}</div>
                <div class="text-lg text-gray-600">{{ fmtFreq(detectedFreq) }} Hz • {{ centsDisplay() }}</div>
              </div>
              <div class="text-sm text-gray-500">
                <span v-if="inputMode === 'instrument' && running">Live microphone input</span>
                <span v-else-if="inputMode === 'virtual-keyboard'">Virtual keyboard input</span>
                <span v-else-if="inputMode === 'instrument' && !running">Start microphone to see live input</span>
                <span v-else>No input active</span>
              </div>
            </div>
          </div>

          <!-- Input Method Selection Header -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-semibold">Input Method</h2>
              <div class="flex items-center gap-2">
                <button 
                  class="btn btn-sm"
                  :class="inputMode === 'instrument' ? 'btn-primary' : 'btn-outline'"
                  @click="selectInputMethod('instrument')"
                >
                  <span class="material-symbols-outlined mr-1">mic</span>
                  {{ currentInstrumentName }}
                </button>
                <button 
                  class="btn btn-sm"
                  :class="inputMode === 'virtual-keyboard' ? 'btn-primary' : 'btn-outline'"
                  @click="selectInputMethod('virtual-keyboard')"
                >
                  <span class="material-symbols-outlined mr-1">piano</span>
                  Virtual Keyboard
                </button>
              </div>
            </div>
            
            <!-- Current method indicator -->
            <div class="text-sm text-gray-600">
              <span v-if="inputMode === 'instrument'">
                Using microphone input for {{ currentInstrumentName }}
                <span class="text-xs text-amber-600 ml-1">(microphone permission required)</span>
              </span>
              <span v-else>
                Using virtual keyboard for testing (no microphone needed)
              </span>
            </div>
          </div>

          <!-- Progressive Disclosure: Show only active input method -->
          
          <!-- Live Microphone Input -->
          <div v-if="inputMode === 'instrument'" class="mb-6">
            <div class="card bg-blue-50 border border-blue-200 p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-blue-600">mic</span>
                <h3 class="font-semibold">Live Tuner</h3>
                <div v-if="running" class="badge badge-success badge-sm">
                  <span class="material-symbols-outlined text-xs mr-1">radio_button_checked</span>
                  Listening
                </div>
              </div>
              
              <div class="mb-3 text-sm text-gray-600">Range: {{ rangeText }}</div>

              <div class="flex items-center gap-4 mb-4">
                <button 
                  class="btn btn-lg"
                  :class="running ? 'btn-error' : 'btn-primary'" 
                  @click="toggleRunning"
                >
                  <span class="material-symbols-outlined mr-2">{{ running ? 'stop' : 'mic' }}</span>
                  {{ running ? 'Stop Microphone' : 'Start Microphone' }}
                </button>
                <button class="btn btn-outline btn-sm" @click="showPermissionHelp">
                  <span class="material-symbols-outlined mr-2">help</span>
                  Permission Help
                </button>
              </div>
            </div>
          </div>

          <!-- Virtual Keyboard Input -->
          <div v-if="inputMode === 'virtual-keyboard'" class="mb-6">
            <div class="card bg-green-50 border border-green-200 p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-green-600">piano</span>
                <h3 class="font-semibold">Virtual Keyboard</h3>
                <div class="badge badge-success badge-sm">Ready</div>
              </div>
              
              <div class="text-xs text-gray-500 mb-3 text-center">
                {{ currentInstrumentName }} • Starting octave {{ virtualKeyboardOctave }}
              </div>
              
              <VirtualKeyboard 
                :on-tone-start="simulateToneInput"
                :on-tone-stop="stopSimulatedTone"
                :initial-octave="virtualKeyboardOctave"
                :key="inputMethodKey"
              />
            </div>
          </div>



          <div class="mt-4 collapse collapse-arrow border bg-base-100">
            <input type="checkbox" ref="staffCollapse" @change="onStaffCollapseChange" />
            <div class="collapse-title cursor-pointer font-semibold flex justify-between items-center">
              <span>Staff Display</span>
              <span v-if="staffDisplayHint" class="text-xs text-red-600 font-medium">{{ staffDisplayHint }}</span>
            </div>
            <div class="collapse-content mt-3">
              <div class="text-sm text-gray-600 mb-2">All notes within the current instrument range</div>
              <div class="text-xs text-gray-600 mb-2">{{ transpositionLabel }}</div>
              <div class="w-full">
                <StaffPreview
                  :practice-overlay-mode="overlayDisplayOption"
                  :practice-overlay-tooltip-only="overlayTooltipOnly"
                  :practice-enable-click-to-cycle="overlayEnableClickToCycle"
                  :practice-color-cycle="practiceColorCycle"
                />
              </div>
              <div class="text-xs text-gray-500 mt-2">Mapped keys: <span class="font-mono">{{ staffMappedText }}</span></div>
            </div>
          </div>

          

          <div class="mt-4 collapse collapse-arrow border bg-base-100">
            <input type="checkbox" />
            <div class="collapse-title cursor-pointer font-semibold">Practice Settings</div>
            <div class="collapse-content mt-3">
              <div class="mb-2 font-semibold">Select One:</div>
              <div class="flex flex-col gap-3">
                <label class="flex items-start gap-3">
                  <input type="radio" class="radio radio-primary mt-1" v-model="practiceMode" value="Free Play" />
                  <div>
                    <div class="font-medium">Free Play</div>
                    <div class="text-xs text-gray-600">User plays freely; matching notes are highlighted on the staff. Ideal for scales.</div>
                  </div>
                </label>
                <label class="flex items-start gap-3">
                  <input type="radio" class="radio radio-primary mt-1" v-model="practiceMode" value="Follow Me" />
                  <div>
                    <div class="font-medium">Follow Me</div>
                    <div class="text-xs text-gray-600">App highlights one note at a time, advancing after a tonal break.</div>
                  </div>
                </label>
                <label class="flex items-start gap-3">
                  <input type="radio" class="radio radio-primary mt-1" v-model="practiceMode" value="You Lead" />
                  <div>
                    <div class="font-medium">You Lead</div>
                    <div class="text-xs text-gray-600">Notes are highlighted in sequence at a tempo-driven pace.</div>
                  </div>
                </label>
                <label class="flex items-start gap-3">
                  <input type="radio" class="radio radio-primary mt-1" v-model="practiceMode" value="Random" />
                  <div>
                    <div class="font-medium">Random</div>
                    <div class="text-xs text-gray-600">App selects a random note; user plays it and receives tuning feedback.</div>
                  </div>
                </label>
                <label class="flex items-start gap-3">
                  <input type="radio" class="radio radio-primary mt-1" v-model="practiceMode" value="Hear & Match" />
                  <div>
                    <div class="font-medium">Hear & Match</div>
                    <div class="text-xs text-gray-600">App plays a note; user must match it by ear. Visual feedback confirms accuracy.</div>
                  </div>
                </label>
              </div>
              <div class="mt-4 flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="label mb-0 mr-2"><span class="label-text">BPM</span></label>
                  <input type="number" class="input input-sm w-20" v-model.number="youLeadTempo" min="60" max="240" />
                </div>
                <button class="btn btn-sm" @click="startPracticeMode" :disabled="practiceActive">Start</button>
                <button class="btn btn-sm btn-ghost" @click="stopPracticeMode" :disabled="!practiceActive">Stop</button>
                <div class="text-sm text-gray-600 ml-4">
                  <span class="font-medium">Mode:</span> {{ practiceMode }}
                  <span v-if="currentTargetIndex !== null"> • Target: {{ store.noteArray?.[currentTargetIndex]?.pitch || store.noteArray?.[currentTargetIndex]?.spn || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 collapse collapse-arrow border bg-base-100">
            <input type="checkbox" />
            <div class="collapse-title cursor-pointer font-semibold">Sound Settings</div>
            <div class="collapse-content mt-3">
              <div class="mb-3">
                <label class="label">A4 reference</label>
                <input class="input input-sm w-32" v-model.number="a4" />
              </div>
              <div class="mb-3">
                <label class="label">RMS gate</label>
                <input class="input input-sm w-32" v-model.number="rmsGate" />
              </div>
              <div class="mb-3">
                <label class="label">Onset threshold</label>
                <input class="input input-sm w-32" v-model.number="onsetThreshold" />
              </div>
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm text-gray-700">Use aubio (WASM) if available</div>
                <label class="label">
                  <input type="checkbox" class="checkbox" v-model="useAubio" />
                </label>
              </div>
              
              
              
              
              
              
              
              
              
              
              
              
              <div class="mb-3">
                <button v-if="audioWorkletDisabled" class="btn btn-sm btn-outline" @click="resetAudioEngine">Reset audio engine (re-enable worklet)</button>
                <div class="text-xs text-gray-500 mt-1">Clears a local setting and restarts audio so AudioWorklet can be retried.</div>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                AudioWorklet: <span v-if="!audioWorkletDisabled" class="font-medium text-green-600">Enabled</span><span v-else class="font-medium text-red-600">Disabled</span>
              </div>
              <div class="text-xs mt-1">
                Forwarder: <span v-if="forwarderActive" class="font-medium text-green-600">Worklet</span><span v-else-if="aubioProcessorEnabled" class="font-medium text-yellow-600">ScriptProcessor</span><span v-else class="font-medium text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
          
          

          <div class="mt-4 collapse collapse-arrow border bg-base-100">
            <input type="checkbox" />
            <div class="collapse-title cursor-pointer font-semibold">Behind the Curtain</div>
            <div class="collapse-content mt-3">
              <div class="w-full bg-gray-200 h-3 rounded overflow-hidden mb-2">
                <div class="h-3 bg-primary" :style="{ width: needlePosition + '%' }"></div>
              </div>
              <div class="text-xs text-gray-600 mb-2">Needle: -50 to +50 cents</div>

              <div class="mb-2">
                <div><strong>BPM:</strong> {{ bpm ? Math.round(bpm) : '—' }} <small class="text-gray-500">(estimated)</small></div>
                <div><strong>Last note length:</strong> {{ lastNoteQuant?.note || '—' }} <small class="text-gray-500">(error {{ lastNoteQuant?.error?.toFixed(2) || '—' }})</small></div>
              </div>

              <div class="mt-4">
                <!-- Imported defaults and internal noteArray for debugging -->
                <h4 class="font-semibold">Imported Defaults</h4>
                <div v-if="importedDefaults" class="mb-2 text-sm">
                  <div class="font-medium">Loading defaults for: {{ importedDefaults.instrument }}</div>
                  <pre class="bg-base-100 p-2 rounded text-xs max-h-64 overflow-auto">{{ JSON.stringify(importedDefaults, null, 2) }}</pre>
                </div>
                <div v-else class="text-xs text-gray-500">No instrument defaults loaded yet.</div>

                <h4 class="font-semibold mt-3">noteArray (internal)</h4>
                <pre class="bg-base-100 p-2 rounded text-xs max-h-64 overflow-auto">{{ JSON.stringify(store.noteArray || [], null, 2) }}</pre>

                <h4 class="font-semibold mt-4">Analysis</h4>
                <pre class="bg-base-100 p-2 rounded text-xs max-h-96 overflow-auto">{{ analysisAsJson }}</pre>
              </div>
            </div>
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTestStaffNoteStore } from '../stores/testStaffNoteStore';
import ToastStack from './ToastStack.vue';
import Header from './Header.vue';
import FooterStandard from './FooterStandard.vue';
import StaffPreview from './StaffPreview.vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import EmptyStateMessage from './EmptyStateMessage.vue';
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore';
import { useLessonStore } from '../stores/lessonStore.js';
import { useActiveUnitStatus } from '../composables/useActiveUnitStatus.js';
import useAnnouncer from '../composables/useAnnouncer';

const store = usePracticeUnitScaleStore();
const testNotes = useTestStaffNoteStore();
const lesson = useLessonStore();
const router = useRouter();
const { 
  hasActiveUnit,
  activeUnitDisplayName,
  isInLessonMode,
  isInQuickPracticeMode,
  statusIndicator,
  getEmptyStateMessage 
} = useActiveUnitStatus();
const { liveAnnounce, announce } = useAnnouncer();

// Legacy compatibility
const activeLessonName = computed(() => lesson.activeLessonName || '');
const lessonActive = computed(() => isInLessonMode.value);
const practiceUnitName = computed(() => activeUnitDisplayName.value);

const detectedNote = ref('--');
const detectedFreq = ref(0);
const cents = ref(0);
const needlePosition = ref(50); // 0..100 mapping -50..+50 cents
const a4 = ref(440);
const useAubio = ref(false);
const rmsGate = ref(0.001);
const onsetThreshold = ref(0.15);

// UI state: running toggle
const running = ref(false);

// Input method management
const inputMode = ref('instrument'); // 'instrument' | 'virtual-keyboard'
const inputMethodKey = ref(0); // Force VirtualKeyboard re-render when switching

// Practice mode selection for Practice Settings collapse
const practiceMode = ref("Free Play");

// Practice mode runtime state
const practiceActive = ref(false);
const currentTargetIndex = ref(null);
const practiceSequence = ref([]);
let practiceIntervalId = null;
let lastTargetIdx = null;
const targetPrevColors = new Map();

function clearCurrentTarget() {
  try {
    if (lastTargetIdx != null && testNotes.noteArray && testNotes.noteArray[lastTargetIdx]) {
      const prev = targetPrevColors.get(lastTargetIdx);
      testNotes.noteArray[lastTargetIdx] = { ...testNotes.noteArray[lastTargetIdx], noteColor: prev || '' };
      targetPrevColors.delete(lastTargetIdx);
    }
  } catch (e) {}
  lastTargetIdx = null;
  currentTargetIndex.value = null;
}

// You Lead tempo control (BPM). Default to header tempo or 120.
const youLeadTempo = ref(Number(store.practiceUnitHeader?.tempo) || 120);

// Keep header in sync when tempo changes and update interval if You Lead is active
watch(youLeadTempo, (nv) => {
  try {
    let bpmVal = Number(nv) || 120;
    if (bpmVal < 60) bpmVal = 60;
    if (bpmVal > 240) bpmVal = 240;
    youLeadTempo.value = bpmVal;
    if (!store.practiceUnitHeader) store.practiceUnitHeader = {};
    store.practiceUnitHeader.tempo = bpmVal;
    // if currently running in You Lead, update the interval
    if (practiceActive.value && practiceMode.value === 'You Lead') {
      if (practiceIntervalId) { clearInterval(practiceIntervalId); practiceIntervalId = null; }
      const ms = (60 / Math.max(1, bpmVal)) * 1000;
      practiceIntervalId = setInterval(() => { try { nextTarget(false); } catch(e){} }, ms);
    }
  } catch (e) {}
}, { immediate: true });

// Persist practiceMode into the practiceUnitHeader and react to runtime changes
watch(() => practiceMode.value, (nv) => {
  try {
    if (!store.practiceUnitHeader) store.practiceUnitHeader = {};
    store.practiceUnitHeader.practiceMode = nv;
    // if already running, adapt behavior when switching modes
    if (practiceActive.value) {
      if (practiceIntervalId) { clearInterval(practiceIntervalId); practiceIntervalId = null; }
      if (nv === 'You Lead') {
        const ms = (60 / Math.max(1, Number(store.practiceUnitHeader.tempo || youLeadTempo.value || 120))) * 1000;
        practiceIntervalId = setInterval(() => { try { nextTarget(false); } catch(e){} }, ms);
      }
    }
  } catch (e) {}
});

function setTargetIndex(idx, color = 'blue') {
  try {
    // restore previous
    if (lastTargetIdx != null && lastTargetIdx !== idx && testNotes.noteArray && testNotes.noteArray[lastTargetIdx]) {
      const prev = targetPrevColors.get(lastTargetIdx);
      testNotes.noteArray[lastTargetIdx] = { ...testNotes.noteArray[lastTargetIdx], noteColor: prev || '' };
      targetPrevColors.delete(lastTargetIdx);
    }
    if (idx == null) { clearCurrentTarget(); return; }
    if (!testNotes.noteArray || !testNotes.noteArray[idx]) { currentTargetIndex.value = null; lastTargetIdx = null; return; }
    if (!targetPrevColors.has(idx)) targetPrevColors.set(idx, testNotes.noteArray[idx].noteColor || '');
    testNotes.noteArray[idx] = { ...testNotes.noteArray[idx], noteColor: color };
    currentTargetIndex.value = idx;
    lastTargetIdx = idx;
  } catch (e) {}
}

function nextTarget(randomize = false) {
  try {
    const n = Array.isArray(testNotes.noteArray) ? testNotes.noteArray.length : 0;
    if (!n) return;
    if (randomize) {
      let idx = Math.floor(Math.random() * n);
      // avoid immediate repeat
      if (n > 1 && idx === lastTargetIdx) idx = (idx + 1) % n;
      setTargetIndex(idx);
      if (practiceMode.value === 'Hear & Match') playTargetNoteForIndex(idx);
      return;
    }
    // sequential
    let idx = lastTargetIdx == null ? 0 : (lastTargetIdx + 1) % n;
    setTargetIndex(idx);
    if (practiceMode.value === 'Hear & Match') playTargetNoteForIndex(idx);
  } catch (e) {}
}

function handleCorrectMatch() {
  try {
    if (!practiceActive.value || currentTargetIndex.value == null) return;
    switch (practiceMode.value) {
      case 'Free Play':
        // no sequencing in Free Play
        break;
      case 'Follow Me':
        // advance on user's correct match
        nextTarget(false);
        break;
      case 'You Lead':
        // allow user to advance early
        nextTarget(false);
        break;
      case 'Random':
        nextTarget(true);
        break;
      case 'Hear & Match':
        // after correct match, pick next (random)
        nextTarget(true);
        break;
      default:
        break;
    }
  } catch (e) {}
}

function startPracticeMode() {
  try {
    if (!Array.isArray(testNotes.noteArray) || testNotes.noteArray.length === 0) { pushToast('No notes loaded for practice. Load a practice unit or create a scale.', 'warn'); return; }
    practiceActive.value = true;
    // prepare sequence
    practiceSequence.value = testNotes.noteArray.map((_, i) => i);
    // clear any existing target
    clearCurrentTarget();
    if (practiceMode.value === 'Random' || practiceMode.value === 'Hear & Match') {
      nextTarget(true);
    } else if (practiceMode.value === 'Follow Me' || practiceMode.value === 'You Lead') {
      nextTarget(false);
    } else {
      // Free Play no automatic targets, but still allow highlighting when user plays
      currentTargetIndex.value = null;
    }

    // schedule You Lead tempo-based progression if selected
    if (practiceMode.value === 'You Lead') {
      const tempo = Number(store.practiceUnitHeader?.tempo) || 120;
      const ms = (60 / Math.max(1, tempo)) * 1000;
      if (practiceIntervalId) { clearInterval(practiceIntervalId); practiceIntervalId = null; }
      practiceIntervalId = setInterval(() => { try { nextTarget(false); } catch(e){} }, ms);
    }
  } catch (e) { console.warn('startPracticeMode error', e); }
}

function stopPracticeMode() {
  try {
    practiceActive.value = false;
    if (practiceIntervalId) { clearInterval(practiceIntervalId); practiceIntervalId = null; }
    clearCurrentTarget();
  } catch (e) {}
}

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function playTargetNoteForIndex(idx) {
  try {
    if (!testNotes.noteArray || !testNotes.noteArray[idx]) return;
    const p = String(testNotes.noteArray[idx].pitch || testNotes.noteArray[idx].spn || '').trim();
    const m = spnToMidiGlobal(p);
    if (!Number.isFinite(m)) return;
    const f = midiToFreq(m);
    // ensure audioCtx exists
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audioCtx = null; }
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, audioCtx.currentTime + 0.01);
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    // stop after 600ms
    setTimeout(() => {
      try { g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06); o.stop(audioCtx.currentTime + 0.06); } catch (e) {}
    }, 600);
  } catch (e) {}
}

const bpm = ref(null);
const onsets = ref([]);
const lastNoteQuant = ref(null);

const aubioStatus = ref(null);

// track whether AudioWorklet has been disabled via localStorage so UI can show state
const audioWorkletDisabled = ref(!!localStorage.getItem('mts_disableAudioWorklet'));

const analysis = ref({});

const forwarderActive = ref(false);
const aubioProcessorEnabled = ref(false);
const toasts = ref([]);

function pushToast(message, type = 'info', ms = 3000) {
  const id = Date.now() + Math.floor(Math.random()*999);
  const t = { id, message, type };
  toasts.value.push(t);
  console.info('[PitchPractice] ' + message);
  setTimeout(() => {
    const idx = toasts.value.findIndex(x=>x.id===id);
    if (idx >= 0) toasts.value.splice(idx,1);
  }, ms);
}

// PracticePitch no longer generates chromatic previews itself; it renders whatever is present in the store.noteArray.

function dismissToast(id) {
  const idx = toasts.value.findIndex(x=>x.id===id);
  if (idx >= 0) toasts.value.splice(idx,1);
}

let audioCtx = null;
let mediaStream = null;
let processor = null;
let workletNode = null;
let aubioWorker = null;
let aubioProcessor = null; // ScriptProcessor used to forward audio to worker when aubio enabled
let aubioForwarderNode = null; // AudioWorkletNode that forwards audio to aubio worker (preferred)
let sourceNode = null;
let aubio = null; // placeholder for aubio runtime if loaded

const rangeText = ref('');

// Range display text (computed from instrument metadata)
// The interactive Scale Range Settings UI was removed; we keep `rangeText` for display only.

// Imported defaults captured from instruments.json when we load an instrument
const importedDefaults = ref(null);
// Last mapped keys (for display/debugging under the staff) — derived from store.noteArray so it mirrors Create Scales
const staffMappedSample = computed(() => {
  try {
    if (Array.isArray(store.noteArray) && store.noteArray.length) {
      return store.noteArray.map(n => {
        const p = String(n.pitch || n.spn || '').trim();
        const m = p.match(/^([A-Ga-g])([#b♭♯]?)(?:\/?)(\d+)$/);
        if (!m) {
          const parts = p.split('/').map(s => s.trim());
          if (parts.length === 2) {
            const mm = parts[0].match(/^([A-Ga-g])([#b♭♯]?)$/);
            const oct = parts[1].match(/^(\d+)$/);
            if (mm && oct) {
              let acc = mm[2] || '';
              if (acc === '♭') acc = 'b';
              if (acc === '♯') acc = '#';
              return mm[1].toLowerCase() + (acc || '') + '/' + oct[1];
            }
          }
          return 'c/4';
        }
        let note = m[1].toLowerCase();
        let acc = m[2] || '';
        if (acc === '♭') acc = 'b';
        if (acc === '♯') acc = '#';
        const oct = m[3];
        return note + (acc || '') + '/' + oct;
      });
    }
  } catch (e) {}
  return [];
});

const staffMappedText = computed(() => (Array.isArray(staffMappedSample.value) && staffMappedSample.value.length) ? staffMappedSample.value.join(', ') : '(none)');

// Hint shown in the Staff Display title when there's nothing to render
const staffDisplayHint = computed(() => {
  try {
    if (Array.isArray(store.noteArray) && store.noteArray.length) return '';
    return getEmptyStateMessage({ page: 'practice-pitch', hasActiveUnit: hasActiveUnit.value, isInLessonMode: isInLessonMode.value });
  } catch (e) { 
    return getEmptyStateMessage({ page: 'practice-pitch', hasActiveUnit: false, isInLessonMode: false });
  }
});

// Derive a color cycle from practice unit noteColorDesignation if present
const practiceColorCycle = computed(() => {
  try {
    const m = store.practiceUnitHeader?.noteColorDesignation || {};
    // return values in defined order if present
    const order = ['red','blue','green','orange','gray','purple'];
    const out = [];
    for (const k of order) if (typeof m[k] === 'string' && m[k].trim()) out.push(m[k].trim());
    return out.length ? out : ['black','blue','orange','green','purple','red','brown','gray'];
  } catch (e) { return ['black','blue','orange','green','purple','red','brown','gray']; }
});

// For overlays, prefer settings stored on the practice unit so they travel with saved units.
// StaffPreview will be passed values derived directly from the store.practiceUnitHeader.staffDisplayOptions.overlays object.

// Compute overlay settings from practiceUnitHeader; provide defaults and migrate legacy localStorage values if present
const overlayFromHeader = computed(() => {
  try {
    const sdo = store.practiceUnitHeader?.staffDisplayOptions || {};
    const ov = sdo.overlays || null;
    if (!ov) return { displayOption: 'none', tooltipOnly: false, enableClickToCycle: false };
    return {
      displayOption: String(ov.displayOption || 'none'),
      tooltipOnly: !!ov.tooltipOnly,
      enableClickToCycle: !!ov.enableClickToCycle,
    };
  } catch (e) { return { displayOption: 'none', tooltipOnly: false, enableClickToCycle: false }; }
});

const overlayDisplayOption = computed(() => overlayFromHeader.value.displayOption || 'none');
const overlayTooltipOnly = computed(() => !!overlayFromHeader.value.tooltipOnly);
const overlayEnableClickToCycle = computed(() => !!overlayFromHeader.value.enableClickToCycle);

// Migrate legacy overlay settings from localStorage into the practiceUnitHeader so they travel with exported units.
function migrateLegacyOverlays() {
  try {
    if (!store.practiceUnitHeader) store.practiceUnitHeader = {};
    if (!store.practiceUnitHeader.staffDisplayOptions) store.practiceUnitHeader.staffDisplayOptions = {};
    const sdo = store.practiceUnitHeader.staffDisplayOptions;
    if (sdo.overlays) return; // already present
    const raw = localStorage.getItem('practiceScales.overlay');
    if (raw) {
      try {
        const obj = JSON.parse(raw) || {};
        sdo.overlays = {
          displayOption: String(obj.displayOption || 'none'),
          tooltipOnly: !!obj.tooltipOnly,
          enableClickToCycle: !!obj.enableClickToCycle,
        };
        store.practiceUnitHeader.staffDisplayOptions = { ...store.practiceUnitHeader.staffDisplayOptions, ...sdo };
        // Persist migration result into local store so it gets exported with units
      } catch (e) {
        sdo.overlays = { displayOption: 'none', tooltipOnly: false, enableClickToCycle: false };
      }
    } else {
      sdo.overlays = { displayOption: 'none', tooltipOnly: false, enableClickToCycle: false };
    }
  } catch (e) { /* ignore */ }
}

// expose toast stack component in template
const components = { ToastStack };

function fmtFreq(v) {
  return (v || 0).toFixed(1);
}

function centsDisplay() {
  const c = Math.round(cents.value);
  if (Math.abs(c) <= 5) return `${c} cents • in tune`;
  return `${c} cents • ${c > 0 ? 'sharp' : 'flat'}`;
}

function noteNameFromMidi(midi) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const n = midi % 12;
  const o = Math.floor(midi / 12) - 1;
  return `${names[n]}${o}`;
}

// Convert SPN like C4 or C/4 or C#4 or C♭4 to MIDI number (C4 -> 60)
function spnToMidiGlobal(spn) {
  try {
    const s = String(spn || '').trim();
    const m = s.match(/^([A-Ga-g])([#b♭♯]?)[\/]?(\d+)$/);
    if (!m) return Number.NaN;
    const note = m[1].toUpperCase();
    let acc = m[2] || '';
    if (acc === '♭') acc = 'b';
    if (acc === '♯') acc = '#';
    const oct = Number(m[3]);
    const base = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[note] ?? 0;
    const delta = acc === '#' ? 1 : acc === 'b' ? -1 : 0;
    return (oct + 1) * 12 + base + delta;
  } catch (e) { return Number.NaN; }
}

function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / a4.value);
}

// Virtual keyboard simulation functions
function simulateToneInput(toneData) {
  // Directly set the detected values to simulate microphone input with pitch adjustment
  detectedFreq.value = toneData.frequency;
  detectedNote.value = toneData.note;
  
  // Use the provided cents offset from virtual keyboard pitch adjustment
  if (toneData.cents !== undefined) {
    cents.value = toneData.cents;
  } else {
    // Fallback: calculate cents for display
    const nearestMidi = Math.round(toneData.midi);
    const nearestFreq = midiToFreq(nearestMidi);
    const centsOff = 1200 * Math.log2(toneData.frequency / nearestFreq);
    cents.value = centsOff;
  }
  
  // Update needle position based on cents
  needlePosition.value = Math.max(0, Math.min(100, 50 + (cents.value/100)*50));
  
  console.log(`[VirtualKeyboard] Simulating tone: ${toneData.note} @ ${toneData.frequency.toFixed(1)}Hz (${cents.value.toFixed(1)} cents, needle: ${needlePosition.value.toFixed(1)})`);
}

function stopSimulatedTone() {
  // Reset to no-detection state
  detectedFreq.value = 0;
  detectedNote.value = '--';
  cents.value = 0;
  
  console.log('[VirtualKeyboard] Stopped simulated tone');
}

// Navigation functions for Quick Practice Mode
function navigateToSave() {
  console.log('Navigating to save practice unit');
  router.push('/create-practice-unit-view?from=save');
}

function exitQuickPractice() {
  console.log('Exiting quick practice mode');
  const creatorRoute = store.practiceUnitHeader.practiceUnitType === 'Scale' 
    ? '/create-scales' 
    : '/create-exercises';
  router.push(creatorRoute);
}

// Select input method and update virtual keyboard accordingly
function selectInputMethod(method) {
  inputMode.value = method;
  
  if (method === 'virtual-keyboard') {
    // Force VirtualKeyboard to re-render with new octave
    inputMethodKey.value += 1;
    pushToast(`Switched to virtual keyboard (octave ${virtualKeyboardOctave.value} for ${currentInstrumentName.value})`, 'success', 3000);
  } else {
    pushToast(`Switched to ${currentInstrumentName.value} microphone input`, 'info', 3000);
  }
}

function quantizeDuration(durationSec, bpmVal) {
  if (!bpmVal) return null;
  const quarterSec = 60 / bpmVal;
  const quarters = durationSec / quarterSec;
  const candidates = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
  let best = candidates[0];
  let bestErr = Infinity;
  for (const c of candidates) {
    const err = Math.abs(quarters - c);
    if (err < bestErr) { bestErr = err; best = c; }
  }
  const mapping = {
    4: 'Whole', 3: 'Dotted Half', 2: 'Half', 1.5: 'Dotted Quarter', 1: 'Quarter', 0.75: 'Dotted Eighth', 0.5: 'Eighth', 0.25: 'Sixteenth'
  };
  return { note: mapping[best] || String(best), error: bestErr };
}

function updateAnalysis() {
  analysis.value = {
    freq: detectedFreq.value,
    note: detectedNote.value,
    cents: Math.round(cents.value),
    bpm: bpm.value,
    onsets: onsets.value.slice(-20),
    lastNoteQuant: lastNoteQuant.value,
  };
}

// Helper: map transposition spec (e.g. 'B♭', 'Bb', 'F', 'C') to semitone offset
function transpositionToSemitones(t) {
  if (!t) return 0;
  const s = String(t).trim();
  if (/^C$/i.test(s)) return 0;
  if (/^B\s*♭$|^Bb$|^B♭/i.test(s)) return 2; // B-flat instruments: written = sounding + 2
  if (/^F$/i.test(s)) return 7; // F instruments: written = sounding + 7
  if (/^E\s*♭$|^Eb$|^E♭/i.test(s)) return 9; // E-flat instruments: +9
  // fallback: try single letter mapping to pitch-class
  const letter = s[0].toUpperCase();
  const map = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const base = map[letter];
  if (base === undefined) return 0;
  return base;
}

const transpositionLabel = computed(() => {
  try {
    // Determine instrument source and context
    const practiceUnitInst = store.practiceUnitHeader?.instrument;
    const globalInst = store.instrument || (store.instruments && store.instruments[0]);
    const inst = practiceUnitInst || globalInst;
    
    if (!inst) return '';
    
    const t = inst?.transposition || 'C';
    const semis = transpositionToSemitones(t);
    const intervalMap = { 0: 'P1', 2: 'M2', 7: 'P5', 9: 'M6' };
    const iv = intervalMap[semis] || (semis > 0 ? `+${semis}` : `${semis}`);
    
    // normalize display of special chars
    const tDisplay = String(t).replace('Bb','B♭').replace('Eb','E♭');
    
    // Show context: whether using practice unit's instrument or global selection
    const instrumentName = inst?.instrument || 'Unknown';
    const context = practiceUnitInst ? `(Practice Unit: ${instrumentName})` : `(Selected: ${instrumentName})`;
    
    if (semis === 0) {
      return `Non-transposing instrument ${context}`;
    }
    
    return `Transposition: ${tDisplay} → written = sounding + ${iv} (${semis >= 0 ? '+' : ''}${semis} semitones) ${context}`;
  } catch (e) { return '' }
});

// Current instrument name for display
const currentInstrumentName = computed(() => {
  const inst = store.practiceUnitHeader?.instrument || store.instrument || (store.instruments && store.instruments[0]);
  return inst?.instrument || 'Unknown Instrument';
});

// Virtual keyboard octave based on current instrument
const virtualKeyboardOctave = computed(() => {
  const inst = store.practiceUnitHeader?.instrument || store.instrument || (store.instruments && store.instruments[0]);
  if (!inst?.defaultStartingOctave) return 4; // fallback
  
  // Parse defaultStartingOctave like "C3" or "C0" to get octave number
  const octaveMatch = inst.defaultStartingOctave.match(/(\d+)$/);
  return octaveMatch ? parseInt(octaveMatch[1], 10) : 4;
});

// Render a simple staff showing every chromatic note between the instrument range
function renderRangeStaff() {
  try {
    const container = document.getElementById('range-staff');
    if (!container) return;
    // clear previous
    container.innerHTML = '';

    const txt = (rangeText.value || '').trim();
    if (!txt || txt.indexOf('to') === -1) {
      container.textContent = txt || 'Range not available';
      return;
    }
    const parts = txt.split('to').map(s => s.trim());
    const start = parts[0];
    const end = parts[1];

    // helper: parse like A3 or C#4 or Bb3 (supports flats and sharps)
    function parseSpn(s) {
      const m = s.match(/^([A-Ga-g])([#b♭♯]?)(\d+)$/);
      if (!m) return null;
      let note = m[1].toUpperCase();
      let acc = m[2] || '';
      if (acc === '♭') acc = 'b';
      if (acc === '♯') acc = '#';
      const oct = parseInt(m[3],10);
      return { note, acc, oct };
    }

    const semitoneBase = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const ssp = parseSpn(start);
  const esp = parseSpn(end);
    if (!ssp || !esp) { container.textContent = txt; return; }

    // compute start and end semitone indexes (use SPN convention where C4 ~ MIDI 60)
    function noteToSemitone(obj) {
      const base = semitoneBase[obj.note] ?? 0;
      let delta = 0;
      if (obj.acc === '#') delta = 1;
      else if (obj.acc === 'b') delta = -1;
      // SPN octave: C4 -> MIDI 60 so use (oct + 1) * 12
      return (obj.oct + 1) * 12 + base + delta;
    }
    const startSemitone = noteToSemitone(ssp);
    const endSemitone = noteToSemitone(esp);
    const transOff = transpositionToSemitones(store?.instrument?.transposition || (store.practiceUnitHeader?.instrument?.transposition || 'C'));
    try { console.debug('[renderRangeStaff] semitone range', { startSemitone, endSemitone, transpositionOffset: transOff }); } catch(e){}
    if (endSemitone < startSemitone) { container.textContent = txt; return; }

    let notes = [];
    // If a noteArray exists in the store, use it as the source of truth for the staff preview.
    if (Array.isArray(store.noteArray) && store.noteArray.length) {
      try {
        notes = store.noteArray.map(n => {
          const p = String(n.pitch || n.spn || '').trim();
          // Accept both C4 and C/4 forms, and support sharps/flats and unicode accidentals
          const m = p.match(/^([A-Ga-g])([#b♭♯]?)(?:\/?)(\d+)$/);
          if (!m) {
            // Try splitting on slash as a fallback: e.g. 'C/4'
            const parts = p.split('/').map(s => s.trim());
            if (parts.length === 2) {
              const mm = parts[0].match(/^([A-Ga-g])([#b♭♯]?)$/);
              const oct = parts[1].match(/^(\d+)$/);
              if (mm && oct) {
                let note = mm[1].toLowerCase();
                let acc = mm[2] || '';
                if (acc === '♭') acc = 'b';
                if (acc === '♯') acc = '#';
                const key = note + (acc || '') + '/' + oct[1];
                return { key, acc: acc || null };
              }
            }
            // Unknown format — skip by returning a neutral placeholder that will be ignored by renderers
            return { key: 'c/4', acc: null };
          }
          let note = m[1].toLowerCase();
          let acc = m[2] || '';
          if (acc === '♭') acc = 'b';
          if (acc === '♯') acc = '#';
          const oct = m[3];
          const key = note + (acc || '') + '/' + oct;
          return { key, acc: acc || null };
        }).filter(Boolean);
      } catch (e) {
        notes = [];
      }
    } else {
      // Do not auto-generate chromatic notes here. If no notes are present in the store,
      // leave `notes` empty so we can draw an empty stave as a visual placeholder.
      notes = [];
    }

  // staffMappedSample is derived from store.noteArray now; no direct assignment here.
  try { console.debug('[renderRangeStaff] computed notes', { count: notes.length, sample: notes.slice(0,8) }); } catch(e){}

    // choose clef from instrument metadata if available (do this before fallback rendering)
    let clef = 'treble';
    try {
      const inst = store.practiceUnitHeader?.instrument || store.instrument || (store.instruments && store.instruments[0]);
      if (inst && inst.clef) {
        const c = String(inst.clef).toLowerCase();
        const map = { treble: 'treble', g: 'treble', 'treble-clef': 'treble', bass: 'bass', f: 'bass', alto: 'alto', tenor: 'tenor' };
        clef = map[c] || clef;
      }
    } catch (e) { /* ignore */ }

    // small fallback renderer that draws a simple staff + note heads if VexFlow isn't available
    function noteObjToMidi(it) {
      // key like 'c#/4' or 'db/4'
      const m = String(it.key).match(/^([a-g])(b|#)?\/(\d+)$/);
      if (!m) return 60;
      const letter = m[1].toUpperCase();
      const acc = m[2] || '';
      const oct = Number(m[3]);
      const base = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[letter] ?? 0;
      const delta = acc === '#' ? 1 : acc === 'b' ? -1 : 0;
      return (oct + 1) * 12 + base + delta;
    }

    function drawSimpleStaff(containerEl, noteObjs, clefName) {
      try {
        containerEl.innerHTML = '';
        const w = containerEl.clientWidth || 600;
        const h = 100;
        const xmlns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(xmlns, 'svg');
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.style.background = 'transparent';
        // draw 5 staff lines centered vertically
        const top = 20;
        const spacing = 10; // pixels between staff lines
        for (let i = 0; i < 5; i++) {
          const y = top + i * spacing;
          const line = document.createElementNS(xmlns, 'line');
          line.setAttribute('x1', '0');
          line.setAttribute('x2', String(w));
          line.setAttribute('y1', String(y));
          line.setAttribute('y2', String(y));
          line.setAttribute('stroke', '#444');
          line.setAttribute('stroke-width', '1');
          svg.appendChild(line);
        }

        // choose a reference MIDI for vertical placement depending on clef
        let refMidi = 64; // E4 default
        if (clefName === 'bass') refMidi = 52; // approx E2
        else if (clefName === 'alto') refMidi = 60;
        else if (clefName === 'tenor') refMidi = 60;

        const centerY = top + 2 * spacing; // middle line

        // draw notes spaced horizontally with improved spacing
        const leftPad = 35;
        const rightPad = 15;
        const availableW = Math.max(60, w - leftPad - rightPad);
        // Use improved spacing algorithm: minimum spacing with gentle scaling
        const minSpacing = 45;
        const maxSpacing = 100;
        let stepX = availableW / Math.max(1, noteObjs.length);
        // Clamp to reasonable spacing bounds
        stepX = Math.max(minSpacing, Math.min(maxSpacing, stepX));
        // If notes would overflow, adjust spacing
        const totalWidth = (noteObjs.length - 1) * stepX;
        if (totalWidth > availableW && noteObjs.length > 1) {
          stepX = availableW / Math.max(1, noteObjs.length - 1);
        }
        for (let i = 0; i < noteObjs.length; i++) {
          const it = noteObjs[i];
          const midi = noteObjToMidi(it);
          const dySemis = midi - refMidi;
          const y = centerY - (dySemis * (spacing / 2));
          const x = leftPad + i * stepX;
          const circle = document.createElementNS(xmlns, 'ellipse');
          circle.setAttribute('cx', String(x));
          circle.setAttribute('cy', String(y));
          circle.setAttribute('rx', '6');
          circle.setAttribute('ry', '4');
          // draw halo behind note if the corresponding note object indicates it
          try {
            const sourceNote = (Array.isArray(store.noteArray) && store.noteArray[i]) ? store.noteArray[i] : null;
            if (sourceNote && sourceNote.halo) {
              const halo = document.createElementNS(xmlns, 'ellipse');
              halo.setAttribute('cx', String(x));
              halo.setAttribute('cy', String(y));
              halo.setAttribute('rx', String(10));
              halo.setAttribute('ry', String(8));
              halo.setAttribute('fill', String(sourceNote.haloColor || 'yellow'));
              halo.setAttribute('opacity', '0.28');
              halo.setAttribute('class', 'mts-note-halo');
              svg.appendChild(halo);
            }
          } catch (e) {}
          circle.setAttribute('fill', '#222');
          circle.setAttribute('stroke', '#222');
          svg.appendChild(circle);
          // accidental text if present
          if (it.acc) {
            const txt = document.createElementNS(xmlns, 'text');
            txt.setAttribute('x', String(x - 12));
            txt.setAttribute('y', String(y + 4));
            txt.setAttribute('font-size', '12');
            txt.setAttribute('fill', '#222');
            txt.textContent = it.acc === '#' ? '#' : '♭';
            svg.appendChild(txt);
          }
        }

        containerEl.appendChild(svg);
      } catch (e) {
        containerEl.textContent = noteObjs.map(n => n.key).join(' ');
      }
    }

    // small guard: if the container is not visible or has zero size, keep retrying until it becomes visible
    const tryAttr = 'data-render-attempts';
    const attempts = Number(container.getAttribute(tryAttr) || '0');
    const cw = container.clientWidth || 0;
    const ch = container.clientHeight || 0;
    // more verbose debug including current rangeText
    try { console.debug('[renderRangeStaff] container size', { cw, ch, attempts, range: rangeText.value }); } catch(e){}
    // If container is hidden or very small, schedule a retry after a short delay.
    if (cw < 40 || ch < 24) {
      // mark an attempt counter for telemetry but do not give up — wait for the collapse to open
      container.setAttribute(tryAttr, String(attempts + 1));
      // schedule a retry after a longer delay to allow UI transitions
      setTimeout(() => { try { renderRangeStaff(); } catch(e){} }, 350);
      return;
    }

    let VF = window && window.Vex && window.Vex.Flow ? window.Vex.Flow : null;
    if (!VF) {
      // render a simple SVG staff as a fallback immediately
      drawSimpleStaff(container, notes, clef);
      try { pushToast('Staff Display rendered (simple fallback)', 'info', 2500); } catch(e){}
      // attempt to lazy-load VexFlow from CDN and re-render when loaded
      const scriptId = 'vexflow-cdn';
      if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.src = 'https://cdn.jsdelivr.net/npm/vexflow@3.0.9/releases/vexflow-debug.js';
        s.async = true;
        s.onload = () => setTimeout(renderRangeStaff, 50);
        document.head.appendChild(s);
      }
      return;
    }
  console.debug('[renderRangeStaff] using VexFlow');
  // If there are no notes to render, draw an empty stave and return
  if (!notes || notes.length === 0) {
    try {
      const rendererEmpty = new VF.Renderer(container, VF.Renderer.Backends.SVG);
      const rwEmpty = Math.max(300, container.clientWidth || 600);
      const rhEmpty = Math.max(80, container.clientHeight || 110);
      rendererEmpty.resize(rwEmpty, rhEmpty);
      const contextEmpty = rendererEmpty.getContext();
      const staveEmpty = new VF.Stave(5, 0, rwEmpty);
      staveEmpty.addClef(clef).setContext(contextEmpty).draw();
    } catch (e) {
      // fallback to simple SVG
      drawSimpleStaff(container, notes, clef);
    }
    try { pushToast('Staff Display rendered (empty stave)', 'info', 1500); } catch(e){}
    return;
  }

  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  // prefer to size renderer to visible container dimensions when available
  const rw = Math.max(300, container.clientWidth || 600);
  const rh = Math.max(80, container.clientHeight || 110);
  renderer.resize(rw, rh);
    const context = renderer.getContext();
  const stave = new VF.Stave(5, 0, rw);
    stave.addClef(clef).setContext(context).draw();

    // group notes into measures of up to 8 notes for layout simplicity
    const vfNotes = notes.map((it) => {
      const n = new VF.StaveNote({ keys: [it.key], duration: 'q' });
      if (it.acc === '#' || it.acc === 'b') {
        n.addModifier(0, new VF.Accidental(it.acc === '#' ? '#' : 'b'));
      }
      n.setStyle({ shadowColor: 'transparent' });
      return n;
    });

    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
    // fill voice with all notes by allowing multiple measures
    voice.addTickables(vfNotes);

    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context, stave);
    try { pushToast('Staff Display rendered (VexFlow)', 'info', 2500); } catch(e){}
  } catch (e) {
    try { document.getElementById('range-staff').textContent = rangeText.value; } catch(_){}
  }
}

// Chromatic generation removed from PracticePitch; use Create Scales or other flows to populate store.noteArray.

async function tryLoadInstruments() {
  if (!store.instruments || store.instruments.length === 0) {
    await store.loadInstruments();
  }
  // pick instrument from store.practiceUnitHeader.instrument or store.instrument
  let inst = store.practiceUnitHeader?.instrument || store.instrument || null;
  // If the store holds a string (instrument name), resolve it to the object from the loaded list
  try {
    if (typeof inst === 'string' && Array.isArray(store.instruments) && store.instruments.length) {
      const name = inst.trim().toLowerCase();
      // prefer exact match on instrument field, otherwise contains
      let found = store.instruments.find(i => String(i.instrument || '').toLowerCase() === name);
      if (!found) found = store.instruments.find(i => String(i.instrument || '').toLowerCase().includes(name));
      if (found) inst = found;
    }
    // If inst is an object but lacks standardRange, try resolving by its instrument field
    if (inst && typeof inst === 'object' && !inst.standardRange && inst.instrument && Array.isArray(store.instruments)) {
      const name = String(inst.instrument).trim().toLowerCase();
      const found = store.instruments.find(i => String(i.instrument || '').toLowerCase() === name) || store.instruments.find(i => String(i.instrument || '').toLowerCase().includes(name));
      if (found) inst = found;
    }
  } catch (e) {
    /* ignore */
  }
  if (!inst && store.instruments && store.instruments.length) inst = store.instruments[0];
  // If still no instrument resolved, try cookie-based preference (Preferences.vue persists to cookie)
  try {
    if (!inst) {
      const parts = document.cookie.split(';').map(s => s.trim());
      const prefix = 'instrument=';
      let cookieInstrument = '';
      for (const p of parts) {
        if (p.startsWith(prefix)) { cookieInstrument = decodeURIComponent(p.slice(prefix.length)); break; }
      }
      if (cookieInstrument && Array.isArray(store.instruments) && store.instruments.length) {
        let match = store.instruments.find(i => String(i.instrument || '') === cookieInstrument);
        if (!match) {
          const ci = cookieInstrument.toLowerCase();
          match = store.instruments.find(i => typeof i.instrument === 'string' && (i.instrument.toLowerCase() === ci || i.instrument.toLowerCase().includes(ci) || i.instrument.toLowerCase().startsWith(ci)));
        }
        if (match) { inst = match; store.instrument = match; }
      }
    }
  } catch(e) { /* ignore cookie resolution errors */ }
  if (inst && inst.standardRange) {
    try { console.debug('[tryLoadInstruments] selected instrument', inst.instrument || inst, 'standardRange=', inst.standardRange); } catch(e){}
    // capture imported defaults for debugging/UI display
    try {
      importedDefaults.value = {
        instrument: inst.instrument || inst,
        clef: inst.clef,
        transposition: inst.transposition,
        standardRange: inst.standardRange,
        defaultStartingOctave: inst.defaultStartingOctave || null,
      };
      console.debug('[tryLoadInstruments] importedDefaults', importedDefaults.value);
    } catch (e) { /* ignore */ }

    // Compute a readable rangeText for display: prefer explicit standardRange, fallback to defaultStartingOctave
    try {
      if (inst.standardRange && inst.standardRange.start && inst.standardRange.end) {
        rangeText.value = `${inst.standardRange.start} to ${inst.standardRange.end}`;
      } else if (inst.defaultStartingOctave) {
        const m = String(inst.defaultStartingOctave).match(/^C?(\d+)/);
        if (m) {
          const s = `C${m[1]}`;
          const e = `B${m[1]}`;
          rangeText.value = `${s} to ${e}`;
        }
      }
    } catch (e) {}

    // render the staff for this range
    setTimeout(()=>{ try { renderRangeStaff(); } catch(e){/* ignore */} }, 30);
  }
}

onMounted(() => {
  tryLoadInstruments();
  // Ensure overlay settings are present on practiceUnitHeader (migrate legacy localStorage if needed)
  try { migrateLegacyOverlays(); } catch (e) { /* ignore */ }
});

// Keep the Test Staff store (used by StaffPreview) in sync with the practice store.noteArray
// StaffPreview reads `useTestStaffNoteStore().noteArray` so ensure it mirrors the canonical store
watch(
  () => store.noteArray,
  (nv) => {
    try {
      // shallow clone entries to avoid accidental shared mutation
      testNotes.noteArray = Array.isArray(nv) ? nv.map((x) => ({ ...x })) : [];
    } catch (e) {
      testNotes.noteArray = [];
    }
  },
  { deep: true, immediate: true }
);

// Highlight detected note on the staff: set noteColor temporarily on the matching note in testNotes
let highlightTimer = null;
let lastHighlightedIdx = null;
const prevColors = new Map();
const prevHalos = new Map();

function highlightDetectedNote() {
  try {
    if (!testNotes || !Array.isArray(testNotes.noteArray) || !testNotes.noteArray.length)
      return;
    const det = String(detectedNote.value || '').trim();
    if (!det) return;
    // Compute MIDI for detected (best-effort)
    const detMidi = Number.isFinite(Number(detectedFreq.value)) && detectedFreq.value > 0 ? Math.round(freqToMidi(detectedFreq.value)) : Number.NaN;

    // Find best match: exact SPN match first, else closest MIDI distance
    let bestIdx = -1;
    for (let i = 0; i < testNotes.noteArray.length; i++) {
      const n = testNotes.noteArray[i];
      const p = String(n.pitch || n.spn || '').trim();
      if (!p) continue;
      // normalize: allow C/4 or C4
      const normP = p.replace('/', '');
      const normDet = det.replace('/', '');
      if (normP.toLowerCase() === normDet.toLowerCase()) { bestIdx = i; break; }
    }
    if (bestIdx === -1 && Number.isFinite(detMidi)) {
      // fallback: choose note with nearest MIDI
      let bestDiff = Infinity;
      for (let i = 0; i < testNotes.noteArray.length; i++) {
        const n = testNotes.noteArray[i];
        const p = String(n.pitch || n.spn || '');
        const m = spnToMidiGlobal(p);
        if (!Number.isFinite(m)) continue;
        const d = Math.abs(m - detMidi);
        if (d < bestDiff) { bestDiff = d; bestIdx = i; }
      }
    }

  if (bestIdx >= 0) {
      // apply a yellow halo around the detected note while also applying a
      // temporary tuning color (green/orange). We preserve any existing
      // noteColor and halo state so both can be restored.
      const haloColor = 'yellow';
      const tuneColor = Math.abs(cents.value || 0) <= 10 ? 'green' : 'orange';
      // clear previous halo and tuning color if different
      if (lastHighlightedIdx != null && lastHighlightedIdx !== bestIdx) {
        try {
          const prevH = prevHalos.get(lastHighlightedIdx);
          if (prevH !== undefined && testNotes.noteArray[lastHighlightedIdx]) {
            if (prevH && prevH.halo) testNotes.noteArray[lastHighlightedIdx] = { ...testNotes.noteArray[lastHighlightedIdx], halo: prevH.halo, haloColor: prevH.haloColor };
            else {
              const copy = { ...testNotes.noteArray[lastHighlightedIdx] };
              delete copy.halo; delete copy.haloColor;
              testNotes.noteArray[lastHighlightedIdx] = copy;
            }
          }
          const prevC = prevColors.get(lastHighlightedIdx);
          if (prevC !== undefined && testNotes.noteArray[lastHighlightedIdx]) {
            testNotes.noteArray[lastHighlightedIdx] = { ...testNotes.noteArray[lastHighlightedIdx], noteColor: prevC };
          }
        } catch (e) {}
        prevHalos.delete(lastHighlightedIdx);
        prevColors.delete(lastHighlightedIdx);
      }

      // store previous halo and previous noteColor so we can restore them
      try {
        if (!prevHalos.has(bestIdx)) prevHalos.set(bestIdx, { halo: !!testNotes.noteArray[bestIdx].halo, haloColor: testNotes.noteArray[bestIdx].haloColor || '' });
        if (!prevColors.has(bestIdx)) prevColors.set(bestIdx, testNotes.noteArray[bestIdx].noteColor || '');
        testNotes.noteArray[bestIdx] = { ...testNotes.noteArray[bestIdx], halo: true, haloColor, noteColor: tuneColor };
        lastHighlightedIdx = bestIdx;
      } catch (e) {}

      // schedule revert of halo and tuning color (restore both to previous values)
      if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
      highlightTimer = setTimeout(() => {
        try {
          const prevH = prevHalos.get(bestIdx);
          if (testNotes.noteArray[bestIdx]) {
            if (prevH && prevH.halo) {
              testNotes.noteArray[bestIdx] = { ...testNotes.noteArray[bestIdx], halo: prevH.halo, haloColor: prevH.haloColor };
            } else {
              const copy = { ...testNotes.noteArray[bestIdx] };
              delete copy.halo; delete copy.haloColor;
              testNotes.noteArray[bestIdx] = copy;
            }
          }
          const prevC2 = prevColors.get(bestIdx);
          if (typeof prevC2 !== 'undefined' && testNotes.noteArray[bestIdx]) {
            testNotes.noteArray[bestIdx] = { ...testNotes.noteArray[bestIdx], noteColor: prevC2 };
          }
        } catch (e) {}
        prevHalos.delete(bestIdx);
        prevColors.delete(bestIdx);
        lastHighlightedIdx = null;
        highlightTimer = null;
      }, 700);

      // If practice mode active and this detection matches the current target, handle it
      try {
        if (practiceActive.value && currentTargetIndex.value != null && bestIdx === currentTargetIndex.value) {
          handleCorrectMatch();
        }
      } catch (e) {}
    }
  } catch (e) { /* ignore */ }
}

// Watch detection state to highlight
watch([() => detectedFreq.value, () => detectedNote.value, () => cents.value], () => {
  try { highlightDetectedNote(); } catch (e) {}
});

// re-render staff when rangeText changes
watch(rangeText, () => { setTimeout(() => { try { renderRangeStaff(); } catch(e){} }, 20); });


// Re-render staff when the underlying noteArray in the store changes
watch(() => store.noteArray, () => { setTimeout(() => { try { renderRangeStaff(); } catch(e){} }, 30); }, { deep: true, immediate: true });

// When startingOctave or octaveCount change while override active, update the range


onBeforeUnmount(() => {
  stop();
});

function start() {
  if (audioCtx) return; // already running
  
  // Check if getUserMedia is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    pushToast('Microphone access is not available in this browser. Please use a modern browser with HTTPS.', 'error', 8000);
    return;
  }
  
  pushToast('Requesting microphone access for live pitch detection...', 'info', 3000);
  
  navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    .then(async (stream) => {
      mediaStream = stream;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaStreamSource(stream);

  // mark running state for UI
  running.value = true;

      // try to lazy-load aubio if desired
      if (useAubio.value) {
        try {
          // Try to use a global Aubio runtime if the app includes it in public/libs
          if (window && (window.Aubio || window.aubio)) {
            aubio = window.Aubio || window.aubio;
            console.log('aubio runtime found on window', aubio);
          } else {
            // Attempt to load a script from public/libs/aubio.js (POC: host aubio runtime there)
            const url = (import.meta.env.BASE_URL || '/') + 'libs/aubio.js';
            await loadScript(url);
              if (window && (window.Aubio || window.aubio)) {
                aubio = window.Aubio || window.aubio;
                console.log('aubio loaded from', url);
              } else {
                // debug-level: we attempt a runtime aubio but it's optional; keep quieter in console
                console.debug('aubio script loaded but runtime not found on window');
                aubio = null;
              }
          }
        } catch (e) {
          console.warn('aubio load failed, falling back to JS detector', e);
          aubio = null;
        }
      }

        // create aubio worker but don't forward audio until user enables it
        try {
          const workerUrl = (import.meta.env.BASE_URL || '/') + 'libs/aubio-worker.js';
          aubioWorker = new Worker(workerUrl);
          aubioWorker.onmessage = (we) => {
            const wd = we.data || {};
            if (wd.type === 'analysis') {
              if (wd.freq && wd.freq > 0) {
                detectedFreq.value = wd.freq;
                const midi = freqToMidi(wd.freq);
                const nearest = Math.round(midi);
                detectedNote.value = noteNameFromMidi(nearest);
                cents.value = (midi - nearest) * 100;
                needlePosition.value = Math.max(0, Math.min(100, 50 + (cents.value/100)*50));
              }
              updateAnalysis();
            } else if (wd.type === 'aubio-status') {
              analysis.value.aubio = wd;
            }
          };
          aubioWorker.postMessage({ type: 'init', sampleRate: audioCtx.sampleRate });
        } catch (we) {
          // worker aubio is optional — log at debug level to avoid noise in normal runs
          console.debug('Could not start aubio worker', we);
          aubioWorker = null;
        }

        // If user asked to use aubio immediately, wire a forwarding processor.
        // Prefer an AudioWorklet-based forwarder (no ScriptProcessor) when AudioWorklet is available.
        if (useAubio.value && aubioWorker) {
          const forwarderUrl = (import.meta.env.BASE_URL || '/') + 'libs/aubio-forwarder-processor.js';
          let forwarderRegistered = false;
          try {
            if (!localStorage.getItem('mts_disableAudioWorklet')) {
              // try to register the forwarder worklet; ignore if already registered
              await audioCtx.audioWorklet.addModule(forwarderUrl).catch(()=>{});
              forwarderRegistered = true;
            }
          } catch (e) {
            forwarderRegistered = false;
          }

          if (forwarderRegistered && audioCtx.audioWorklet) {
            try {
              aubioForwarderNode = new AudioWorkletNode(audioCtx, 'aubio-forwarder', { numberOfInputs: 1, numberOfOutputs: 0 });
              aubioForwarderNode.port.onmessage = (ev) => {
                try {
                  const a = ev.data && ev.data.audio;
                  if (a && aubioWorker) {
                    // forward the transferred ArrayBuffer to worker
                    aubioWorker.postMessage({ type: 'audio', audio: a }, [a]);
                  }
                } catch (e) { /* ignore */ }
              };
              forwarderActive.value = true;
              pushToast('Forwarder: Worklet active', 'info');
              sourceNode.connect(aubioForwarderNode);
            } catch (e) {
              // failed to create forwarder; fall back to ScriptProcessor
              forwarderRegistered = false;
            }
          }

          if (!forwarderRegistered) {
            // fallback: ScriptProcessor forwarding (creates deprecation warning in console)
            aubioProcessor = audioCtx.createScriptProcessor(2048,1,1);
            aubioProcessor.onaudioprocess = (evt) => {
              try {
                const input = evt.inputBuffer.getChannelData(0);
                const f = new Float32Array(input.length);
                f.set(input);
                aubioWorker.postMessage({ type: 'audio', audio: f.buffer }, [f.buffer]);
              } catch (e) { /* ignore */ }
            };
            sourceNode.connect(aubioProcessor);
            aubioProcessor.connect(audioCtx.destination);
            aubioProcessorEnabled.value = true;
            pushToast('Forwarder: ScriptProcessor active', 'warn');
          }
        }

      // Use AudioWorklet for lower latency and predictable timing
      try {
        const workletUrl = (import.meta.env.BASE_URL || '/') + 'libs/pitch-processor-simple.js';
        try {
          await audioCtx.audioWorklet.addModule(workletUrl);
          workletNode = new AudioWorkletNode(audioCtx, 'pitch-processor', { numberOfInputs: 1, numberOfOutputs: 0 });
          audioWorkletDisabled.value = false;
        } catch (e) {
          // registration failed; log and fall back (do NOT persist a disable flag) so we retry next start
          console.debug('AudioWorklet registration failed for simple processor:', e);
          pushToast('AudioWorklet registration failed — using fallback', 'warn');
          workletNode = null;
        }

        // forward param values to the worklet (guarded)
        if (workletNode && workletNode.port) {
          workletNode.port.postMessage({ rmsGate: rmsGate.value, onsetThreshold: onsetThreshold.value });

          // receive analysis messages from the worklet
          workletNode.port.onmessage = (e) => {
          const d = e.data || {};
          if (d.type === 'analysis') {
            if (d.freq && d.freq > 0) {
              detectedFreq.value = d.freq;
              const midi = freqToMidi(d.freq);
              const nearest = Math.round(midi);
              detectedNote.value = noteNameFromMidi(nearest);
              cents.value = (midi - nearest) * 100;
              needlePosition.value = Math.max(0, Math.min(100, 50 + (cents.value/100)*50));
            }
            if (d.onset) {
              const now = d.onsetTime || audioCtx.currentTime;
              onsets.value.push(now);
              if (onsets.value.length >= 2) {
                const ios = [];
                for (let i = 1; i < onsets.value.length; i++) ios.push(onsets.value[i] - onsets.value[i-1]);
                const medianIo = median(ios.slice(-8));
                bpm.value = 60 / medianIo;
                const duration = onsets.value[onsets.value.length-1] - onsets.value[onsets.value.length-2];
                lastNoteQuant.value = quantizeDuration(duration, bpm.value);
              }
            }
            updateAnalysis();
          } else if (d.type === 'aubio-status') {
            aubioStatus.value = d;
            // expose aubio status into the analysis object as well
            analysis.value.aubio = d;
          }
          };
        } else {
          // no worklet port available; ensure we mark disabled so UI matches runtime
          audioWorkletDisabled.value = true;
        }

        if (workletNode) {
          sourceNode.connect(workletNode);
        }
        // no need to connect workletNode to destination (it's analysis-only)
      } catch (e) {
        console.warn('AudioWorklet failed, falling back to ScriptProcessorNode', e);
        try { localStorage.setItem('mts_disableAudioWorklet', '1'); } catch (se) { /* ignore */ }
        audioWorkletDisabled.value = true;
  pushToast('AudioWorklet failed — using ScriptProcessor fallback', 'warn');
        // fallback to ScriptProcessorNode (previous PoC code)
        const bufferSize = 2048; // window size
        processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        const bufferQueue = [];
        let lastOnsetTime = 0;

        processor.onaudioprocess = (evt) => {
          const input = evt.inputBuffer.getChannelData(0);
          const now = audioCtx.currentTime;
          // compute RMS
          let sum = 0;
          for (let i = 0; i < input.length; i++) sum += input[i]*input[i];
          const rmsVal = Math.sqrt(sum/input.length);
          if (rmsVal < rmsGate.value) {
            // silence
            return;
          }
          // pitch detection: prefer aubio if available
          let freq = null;
          if (aubio && aubio.Pitch) {
            try {
              const detector = new aubio.Pitch();
              detector.setTolerance(0.8);
              const f = detector.do(input);
              freq = f || null;
            } catch (e) {
              freq = null;
            }
          }
          if (!freq) {
            freq = autoCorrelate(input, audioCtx.sampleRate);
          }
          if (freq && freq > 0) {
            detectedFreq.value = freq;
            const midi = freqToMidi(freq);
            const nearest = Math.round(midi);
            detectedNote.value = noteNameFromMidi(nearest);
            cents.value = (midi - nearest) * 100;
            needlePosition.value = Math.max(0, Math.min(100, 50 + (cents.value/100)*50));
          }

          // simple onset detection by energy flux
          const energy = sum / input.length;
          bufferQueue.push(energy);
          if (bufferQueue.length > 8) bufferQueue.shift();
          const avg = bufferQueue.reduce((a,b)=>a+b,0)/bufferQueue.length;
          const last = bufferQueue[bufferQueue.length-1];
          if (last > avg * (1 + onsetThreshold.value)) {
            // onset detected
            if (now - lastOnsetTime > 0.05) {
              onsets.value.push(now);
              if (onsets.value.length >= 2) {
                const ios = [];
                for (let i=1;i<onsets.value.length;i++) ios.push(onsets.value[i]-onsets.value[i-1]);
                const medianIo = median(ios.slice(-8));
                bpm.value = 60 / medianIo;
                const duration = onsets.value[onsets.value.length-1] - onsets.value[onsets.value.length-2];
                lastNoteQuant.value = quantizeDuration(duration, bpm.value);
              }
              lastOnsetTime = now;
            }
          }

          updateAnalysis();
        };

        sourceNode.connect(processor);
        processor.connect(audioCtx.destination);
      }
    })
    .catch((err) => {
      console.error('Microphone error:', err.name, err.message, err);
      
      // Provide detailed user guidance based on error type
      let message = 'Microphone access is required for live pitch detection.';
      let toastType = 'warning';
      
      if (err.name === 'NotAllowedError') {
        message = 'Microphone permission was denied. Click the 🔒 icon in your browser address bar and allow microphone access, then try again.';
        toastType = 'error';
      } else if (err.name === 'NotFoundError') {
        message = 'No microphone detected. Please: 1) Connect a microphone or headset 2) Check system audio settings 3) Close other apps using the microphone 4) Try the Virtual Keyboard instead.';
        toastType = 'error';
      } else if (err.name === 'NotReadableError') {
        message = 'Microphone is busy or hardware error. Please close other apps using the microphone and try again.';
        toastType = 'error';
      } else if (err.name === 'AbortError') {
        message = 'Microphone access was aborted. Please try again.';
      } else if (err.name === 'TypeError') {
        message = 'Browser microphone support issue. Please use a modern browser (Chrome, Firefox, Safari) with HTTPS.';
        toastType = 'error';
      } else {
        message = `Microphone error (${err.name}): ${err.message || 'Unknown error'}. Try using the Virtual Keyboard instead.`;
        toastType = 'error';
      }
      
      pushToast(message, toastType, 10000);
      running.value = false;
      
      // Automatically suggest virtual keyboard for microphone issues
      if (err.name === 'NotFoundError' || err.name === 'NotReadableError') {
        setTimeout(() => {
          pushToast('💡 Tip: Use Virtual Keyboard below for testing without a microphone!', 'info', 5000);
        }, 2000);
      }
    });
}

function toggleRunning() {
  if (running.value) {
    stop();
  } else {
    start();
  }
}

function showPermissionHelp() {
  // Check if we can enumerate devices to provide better guidance
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        console.log('Available audio inputs:', audioInputs);
        
        if (audioInputs.length === 0) {
          pushToast('🎤 No microphone detected. Please connect a microphone or headset and refresh the page. Or use Virtual Keyboard below!', 'warning', 12000);
        } else {
          pushToast(`🎤 Microphone Setup Help:\n1) Click the 🔒 or 🎤 icon in your browser address bar\n2) Select "Allow" for microphone access\n3) Choose your microphone: ${audioInputs[0].label || 'Default microphone'}\n4) Refresh the page if needed\n\n💡 Alternative: Use Virtual Keyboard below (no microphone required)`, 'info', 15000);
        }
      })
      .catch(() => {
        pushToast('🎤 Microphone Permission Help:\n1) Click the 🔒 icon in your browser address bar\n2) Select "Allow" for microphone access\n3) Refresh the page if needed\n4) Make sure a microphone is connected\n\n💡 Alternative: Use Virtual Keyboard below!', 'info', 12000);
      });
  } else {
    pushToast('🎤 Your browser may not support microphone access. Please use a modern browser (Chrome, Firefox, Safari) or try the Virtual Keyboard below!', 'warning', 10000);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => setTimeout(resolve, 50);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function stop() {
  try {
    if (processor) {
      processor.disconnect();
      processor.onaudioprocess = null;
      processor = null;
    }
    if (workletNode) {
      try { workletNode.port.onmessage = null; } catch(e){}
      try { workletNode.disconnect(); } catch(e){}
      workletNode = null;
    }
    if (aubioProcessor) {
      try { aubioProcessor.disconnect(); } catch(e){}
      try { aubioProcessor.onaudioprocess = null; } catch(e){}
      aubioProcessor = null;
      aubioProcessorEnabled.value = false;
    }
    if (aubioForwarderNode) {
      try { aubioForwarderNode.port.onmessage = null; } catch(e){}
      try { aubioForwarderNode.disconnect(); } catch(e){}
      aubioForwarderNode = null;
      forwarderActive.value = false;
    }
    if (aubioWorker) {
      try { aubioWorker.terminate(); } catch(e){}
      aubioWorker = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t=>t.stop());
      mediaStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  } catch (e) {
    console.warn('Error stopping audio', e);
  }
  // reflect UI state
  try { running.value = false; } catch(e){}
}

function resetAudioEngine() {
  try {
    localStorage.removeItem('mts_disableAudioWorklet');
    audioWorkletDisabled.value = false;
  } catch (e) { /* ignore */ }
  const wasRunning = !!audioCtx;
  if (wasRunning) {
    // restart audio to pick up worklet on next start
    stop();
    setTimeout(() => start(), 250);
  } else {
    console.info('Audio engine reset: AudioWorklet flag cleared. Start the tuner to retry.');
  }
}

// Utility functions
function autoCorrelate(buf, sampleRate) {
  // Auto-correlation algorithm to find fundamental frequency
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val*val;
  }
  rms = Math.sqrt(rms/SIZE);
  if (rms < 0.01) return null;
  let r1 = 0, r2 = SIZE-1, thres = 0.2;
  for (let i = 0; i < SIZE/2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE/2; i++) {
    if (Math.abs(buf[SIZE-i]) < thres) { r2 = SIZE-i; break; }
  }
  buf = buf.slice(r1, r2);
  const newSize = buf.length;
  const c = new Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) {
      c[i] = c[i] + buf[j]*buf[j+i];
    }
  }
  let d = 0; while (c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  let T0 = maxpos;
  if (T0 == 0) return null;
  const freq = sampleRate / T0;
  if (freq > 20000 || freq < 50) return null;
  return freq;
}

function median(arr) {
  if (!arr || arr.length === 0) return null;
  const s = arr.slice().sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  if (s.length % 2 === 0) return (s[mid-1]+s[mid])/2;
  return s[mid];
}

const analysisAsJson = computed(()=> JSON.stringify(analysis.value, null, 2));

// Re-render staff when the Staff Display collapse is opened (handles VexFlow needing visible container)
const staffCollapse = ref(null);
function onStaffCollapseChange(evt) {
  try {
    // Small delay lets the collapse animation finish and container dimensions settle
    setTimeout(() => {
      try { renderRangeStaff(); } catch(e) { /* ignore */ }
    }, 80);
  } catch (e) { /* ignore */ }
}

</script>

<style scoped>
.card { border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
</style>
