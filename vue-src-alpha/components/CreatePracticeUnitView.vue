<!-- CreatePracticeUnitView.vue: Unified viewer for both Scales and Exercises -->
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-2xl font-bold">Preview Practice Unit</span>
        <span v-if="practiceUnitType" class="badge badge-primary ml-2">{{
          practiceUnitType
        }}</span>
      </div>

      <!-- Staff Preview (shared for both types) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" checked />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>{{ practiceUnitType }} Preview</span>
          <span class="text-right text-base font-normal text-gray-600">
            {{
              store.noteArray && store.noteArray.length > 0
                ? store.noteArray.map((n) => n.pitch).join(", ")
                : `No ${practiceUnitType.toLowerCase()} generated yet.`
            }}
          </span>
        </div>
        <div class="collapse-content px-4">
          <StaffPreview />
        </div>
      </div>

      <!-- Play controls for preview: per-note durations, pause/resume, looping, step controls -->
      <div class="mb-4">
        <div class="flex items-center gap-2 flex-wrap">
          <button class="btn btn-sm" @click="stepBack" title="Step back">⏮️</button>
          <button class="btn btn-sm" @click="playing ? pausePlayback() : startPlayback()" :class="playing ? 'btn-warning' : 'btn-primary'">
            <span v-if="!playing">▶️ Play</span>
            <span v-else>⏸ Pause</span>
          </button>
          <button class="btn btn-sm btn-ghost" @click="stopPlayback" title="Stop">⏹</button>
          <button class="btn btn-sm" @click="stepForward" title="Step forward">⏭️</button>

          <label class="ml-2 input-group input-group-sm">
            <span class="text-sm">Tempo</span>
            <input type="number" class="input input-sm input-bordered w-28" v-model.number="tempoBpm" min="30" max="300" />
          </label>

          <button class="btn btn-sm ml-2" :class="loop ? 'btn-primary' : 'btn-outline'" @click="toggleLoop">Loop: {{ loop ? 'On' : 'Off' }}</button>

          <div class="text-sm text-gray-600 ml-4">Notes: {{ noteCount }}</div>
        </div>
      </div>

      <!-- Details (only shown for Scales) -->
      <div
        v-if="practiceUnitType === 'Scale'"
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Scale Selector:</strong> {{ scaleSelectorText }}</div>
          <div><strong>Scale Range:</strong> {{ scaleRangeText }}</div>
          <div>
            <strong>Duration & Direction:</strong>
            {{ durationDirectionText }}
          </div>
          <div>
            <strong>Staff Formatting:</strong> {{ staffFormattingText }}
          </div>
        </div>
      </div>

      <!-- Details (only shown for Exercises) -->
      <div
        v-else-if="practiceUnitType === 'Exercise'"
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Details</span>
        </div>
        <div class="collapse-content px-4 text-sm leading-7">
          <div><strong>Title:</strong> {{ exerciseTitle }}</div>
          <div><strong>Instrument:</strong> {{ instrumentName }}</div>
          <div><strong>Key Signature:</strong> {{ exerciseKeySignature }}</div>
          <div>
            <strong>Time Signature:</strong> {{ exerciseTimeSignature }}
          </div>
          <div><strong>Tempo:</strong> {{ exerciseTempo }} bpm</div>
          <div v-if="exerciseTechniqueFocus.length > 0">
            <strong>Technique Focus:</strong>
            {{ exerciseTechniqueFocus.join(", ") }}
          </div>
          <div v-if="exerciseSourceMusicXML">
            <strong>Source:</strong> {{ exerciseSourceMusicXML }}
          </div>
          <div v-if="exerciseSourceURL">
            <strong>Source URL:</strong>
            <a
              :href="exerciseSourceURL"
              target="_blank"
              class="link link-primary"
              >{{ exerciseSourceURL }}</a
            >
          </div>
          <div><strong>Note Count:</strong> {{ noteCount }}</div>
        </div>
      </div>

      <!-- 🗄️ Database Storage & Management -->
      <div
        class="collapse collapse-arrow bg-blue-50 border border-blue-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" :checked="shouldAutoExpandDatabase" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
          <span>🗄️ Database Storage & Management</span>
          <span v-if="shouldAutoExpandDatabase" class="text-sm font-normal text-blue-600 ml-2">(Auto-expanded)</span>
        </div>
        <div class="collapse-content px-4">
          <!-- Clear Action Guide -->
          <div
            class="bg-blue-100 border border-blue-300 rounded p-3 mb-3 text-sm"
          >
            <div v-if="!isSignedIn" class="text-orange-700 font-semibold">
              🔐 Sign in required – Visit Preferences to enable database saves
            </div>
            <div v-else class="text-gray-700">
              <div v-if="isNewPracticeUnit" class="mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                <strong class="text-blue-800">💾 Ready to Save</strong><br>
                This practice unit hasn't been saved yet. Click <strong>"Save to My Library"</strong> to store it permanently.
              </div>
              <div v-if="isExistingPracticeUnit" class="mb-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                <strong class="text-green-800">🔄 Already Saved</strong><br>
                This practice unit exists in your library. Click <strong>"Update My Copy"</strong> to save any changes.
              </div>
              <div class="mb-2 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                <strong class="text-purple-800">✨ Make a Variation</strong><br>
                Want to create a new version? Click <strong>"Save as New Practice Unit"</strong> to keep both versions.
              </div>
              <div class="p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                <strong class="text-gray-800">📋 Load Different Unit</strong><br>
                Browse your saved practice units with <strong>"Browse My Library"</strong>.
              </div>
            </div>
          </div>
          
          <div class="flex gap-4 mb-4 flex-wrap">
            <!-- Smart Button Logic: Show appropriate actions based on state -->
            <div class="flex flex-col gap-2 w-full">
              <div v-if="!isSignedIn" class="alert alert-warning">
                <span>Please sign in on Preferences to save to database</span>
              </div>
              
              <div v-if="isSignedIn" class="space-y-4">
                <!-- Primary Action: Save or Update (enhanced when coming from save intent) -->
                <div class="grid grid-cols-1 gap-3">
                  <button
                    v-if="isNewPracticeUnit"
                    :class="[
                      'btn btn-lg flex flex-col items-center p-6 h-auto transition-all duration-300',
                      shouldHighlightPrimary 
                        ? 'btn-primary ring-4 ring-blue-300 ring-opacity-50 shadow-xl scale-105' 
                        : 'btn-primary'
                    ]"
                    @click="saveToDatabase"
                  >
                    <span class="text-3xl mb-2">💾</span>
                    <span class="font-bold text-lg">Save to My Library</span>
                    <span class="text-sm opacity-75">Store this practice unit permanently</span>
                    <span v-if="cameFromSave" class="text-xs bg-blue-200 px-2 py-1 rounded mt-1">← Click here to save!</span>
                  </button>
                  
                  <button
                    v-if="isExistingPracticeUnit"
                    :class="[
                      'btn btn-lg flex flex-col items-center p-6 h-auto transition-all duration-300',
                      shouldHighlightPrimary 
                        ? 'btn-primary ring-4 ring-blue-300 ring-opacity-50 shadow-xl scale-105' 
                        : 'btn-primary'
                    ]"
                    @click="saveToDatabase"
                  >
                    <span class="text-3xl mb-2">🔄</span>
                    <span class="font-bold text-lg">Update My Copy</span>
                    <span class="text-sm opacity-75">Save changes to existing unit</span>
                    <span v-if="cameFromSave" class="text-xs bg-blue-200 px-2 py-1 rounded mt-1">← Click here to update!</span>
                  </button>
                </div>
                
                <!-- Secondary Actions Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- Save as New (conditionally shown) -->
                  <button
                    v-if="showSaveAsNew"
                    class="btn btn-accent btn-lg flex flex-col items-center p-4 h-auto"
                    @click="saveAsNewToDatabase"
                  >
                    <span class="text-2xl mb-1">✨</span>
                    <span class="font-bold">Save as New Practice Unit</span>
                    <span class="text-xs opacity-75">Create a variation or backup copy</span>
                  </button>
                
                  <!-- Browse Library (always shown but positioned based on context) -->
                  <button 
                    :class="[
                      'btn btn-outline btn-lg flex flex-col items-center p-4 h-auto',
                      !showSaveAsNew ? 'md:col-span-2' : ''
                    ]"
                    @click="openRecallModal"
                  >
                    <span class="text-2xl mb-1">📋</span>
                    <span class="font-bold">Browse My Library</span>
                    <span class="text-xs opacity-75">Load a different practice unit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 📁 Practice Unit File Import/Export -->
      <div
        class="collapse collapse-arrow bg-green-50 border border-green-300 mb-4 rounded-xl"
      >
        <input type="checkbox" class="peer" :checked="shouldAutoExpandFileOps" />
        <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
          <span>📁 Practice Unit File Import/Export</span>
        </div>
        <div class="collapse-content px-4">
          <!-- File Operations Guide -->
          <div
            class="bg-green-100 border border-green-300 rounded p-3 mb-3 text-sm text-gray-700"
          >
            <p class="font-semibold text-green-800 mb-2">Share & Backup with Files</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div class="p-2 bg-green-50 rounded border-l-4 border-green-400">
                <strong class="text-green-800">📤 Download File</strong><br>
                <span class="text-xs">Save as .json file to share with others or backup offline</span>
              </div>
              <div class="p-2 bg-green-50 rounded border-l-4 border-green-400">
                <strong class="text-green-800">📥 Upload File</strong><br>
                <span class="text-xs">Load a .json practice unit file someone shared with you</span>
              </div>
            </div>
            <p class="text-xs text-green-700 mt-2 font-medium">
              💡 Files work without sign-in and can be shared via email, cloud storage, etc.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              class="btn btn-warning btn-lg flex flex-col items-center p-4 h-auto"
              @click="exportToJson"
            >
              <span class="text-2xl mb-1">📤</span>
              <span class="font-bold">Download as File</span>
              <span class="text-xs opacity-75">Save .json file to your computer</span>
            </button>
            <button
              class="btn btn-info btn-lg flex flex-col items-center p-4 h-auto"
              @click="triggerImportFileDialog"
            >
              <span class="text-2xl mb-1">📥</span>
              <span class="font-bold">Upload File</span>
              <span class="text-xs opacity-75">Load .json practice unit file</span>
            </button>
            <input
              ref="importFileInput"
              type="file"
              accept="application/json"
              style="display: none"
              @change="handleImportFileChange"
            />
          </div>
        </div>
      </div>

      <!-- Recall Modal -->
      <div v-if="showRecallModal" class="modal modal-open">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-3">
            Select {{ practiceUnitType }} to Recall
          </h3>
          <div class="form-control mb-3">
            <input
              type="text"
              class="input input-bordered w-full"
              :placeholder="
                practiceUnitType === 'Scale'
                  ? 'Filter by name, key, type, or instrument...'
                  : 'Filter by name, key, time, focus, or instrument...'
              "
              v-model="recallFilterText"
            />
          </div>
          <div v-if="loadingUnits" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <div
            v-else-if="availableUnits.length === 0"
            class="py-8 text-center text-gray-500"
          >
            No saved {{ practiceUnitType.toLowerCase() }}s found for your
            account.
          </div>
          <div
            v-else-if="filteredUnits.length === 0"
            class="py-8 text-center text-gray-500"
          >
            No matches for "{{ recallFilterText }}".
          </div>
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="unit in filteredUnits"
              :key="unit.practice_unit_id"
              class="card bg-base-100 border hover:border-primary cursor-pointer transition-all"
              @click="loadSelectedUnit(unit)"
            >
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-semibold">{{ unit.name }}</h4>
                    <p class="text-sm text-gray-500">
                      {{ describeUnit(unit) }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(unit.last_modified) }}
                    </p>
                  </div>
                  <span class="badge badge-primary">{{ unit.type }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <button class="btn" @click="showRecallModal = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Behind the Curtain: JSON viewer (shared for both types) -->
      <div
        class="collapse collapse-arrow bg-gray-50 border border-gray-300 mt-4 rounded-xl"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
        >
          <span>Behind the Curtain: practiceUnit.json</span>
        </div>
        <div class="collapse-content px-4">
          <pre
            class="bg-base-100 p-4 rounded text-xs overflow-x-auto max-h-96"
            >{{ formattedJson }}</pre
          >
        </div>
      </div>
    </main>
    <div style="max-width: 400px; margin: 2em auto">
      <button
        class="mtsFormatCreatorButtons flex items-center gap-2"
        @click="$router.push('/creator')"
      >
        <span
          class="material-symbols-outlined align-middle mr-2"
          aria-hidden="true"
          >edit_square</span
        >
        Return to Creator
      </button>
    </div>
    <FooterStandard />
  </div>
</template>

<script setup>
import { onMounted, computed, ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";
import supabase from "../scripts/supabaseClient.js";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import StaffPreview from "./StaffPreview.vue";

const store = usePracticeUnitScaleStore();
const route = useRoute();

// ----- Snapshot Manager State -----
const showRecallModal = ref(false);
const availableUnits = ref([]);
const loadingUnits = ref(false);
const recallFilterText = ref("");
const importFileInput = ref(null);

// ----- Auto-expand logic -----
const shouldAutoExpandDatabase = ref(false);
const shouldAutoExpandFileOps = ref(false);

// Check if user came from save suggestion (auto-expand database section)
function checkAutoExpand() {
  const fromSave = route.query.from === 'save' || route.query.action === 'save';
  const fromQuickPractice = store.practiceUnitHeader?.practiceUnitId?.startsWith('quick-');
  shouldAutoExpandDatabase.value = fromSave || fromQuickPractice;
}

// ----- Save Intent & Context Detection -----
const cameFromSave = computed(() => {
  return route.query.from === 'save' || route.query.action === 'save';
});

const showSaveAsNew = computed(() => {
  // Only show "Save as New" if:
  // 1. User is signed in, AND
  // 2. This is an existing practice unit (has real ID, not quick-*), OR
  // 3. User didn't come from save intent (browsing/managing existing units)
  return isSignedIn.value && (isExistingPracticeUnit.value || !cameFromSave.value);
});

const shouldHighlightPrimary = computed(() => {
  // Highlight primary save action when user came with save intent
  return cameFromSave.value && isSignedIn.value;
});

// ----- Supabase Helper Functions -----
async function upsertPracticeUnit(row) {
  const { error } = await supabase
    .from("practice_units")
    .upsert(row, { onConflict: "practice_unit_id" });
  return { error };
}

async function insertNewPracticeUnit(row) {
  const { error } = await supabase.from("practice_units").insert(row);
  return { error };
}

onMounted(async () => {
  await store.loadInstruments();
  loadUserSession();
  checkAutoExpand();
});

// ----- Determine Practice Unit Type -----
const practiceUnitType = computed(() => {
  return store.practiceUnitHeader?.practiceUnitType || "Scale";
});

// ----- Shared computed properties -----
const instrumentName = computed(() => {
  const inst = store.practiceUnitHeader?.instrument || store.instrument;
  if (!inst) return "Unknown";
  return inst.instrument || "Unknown";
});

// ----- Smart Button Logic -----
const isNewPracticeUnit = computed(() => {
  const id = store.practiceUnitHeader?.practiceUnitId;
  // Consider it new if no ID, or if ID starts with "quick-" (from Practice Now)
  return !id || id.startsWith("quick-");
});

const isExistingPracticeUnit = computed(() => {
  const id = store.practiceUnitHeader?.practiceUnitId;
  // Consider it existing if it has an ID that doesn't start with "quick-"
  return id && !id.startsWith("quick-");
});

// ----- User Session Management -----
const currentUser = ref(null);
const isSignedIn = computed(() => !!currentUser.value);

// Load user session from localStorage on mount
function loadUserSession() {
  try {
    const saved = localStorage.getItem('mts_user_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.user && parsed.expiresAt > Date.now()) {
        currentUser.value = parsed.user;
        return;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved user session:', e);
  }
  // If no valid saved session, check Supabase
  checkSupabaseSession();
}

// Check current Supabase session
async function checkSupabaseSession() {
  try {
    const { data: sessData } = await supabase.auth.getSession();
    if (sessData?.session?.user) {
      const user = sessData.session.user;
      currentUser.value = user;
      // Save session to localStorage (expires in 24h)
      const sessionData = {
        user: user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      localStorage.setItem('mts_user_session', JSON.stringify(sessionData));
    }
  } catch (e) {
    console.warn('Failed to check Supabase session:', e);
  }
}

// Clear user session
function clearUserSession() {
  currentUser.value = null;
  localStorage.removeItem('mts_user_session');
}

const noteCount = computed(() => {
  return store.noteArray?.length || 0;
});

const formattedJson = computed(() => {
  return JSON.stringify(
    {
      practiceUnitHeader: store.practiceUnitHeader,
      noteArray: store.noteArray,
    },
    null,
    2
  );
});

// Playback state & controls
const playing = ref(false);
const paused = ref(false);
const currentIndex = ref(0);
const loop = ref(false);
let scheduledId = null;
let synth = null;
const tempoBpm = ref(store.practiceUnitHeader?.tempo || 80);

// Load Tone.js dynamically if needed
function loadTone() {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.Tone !== "undefined") return resolve(globalThis.Tone);
    const existing = document.querySelector('script[data-src="tone-cdn"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(globalThis.Tone));
      existing.addEventListener("error", () => reject(new Error("Failed to load Tone.js")));
      return;
    }
    const s = document.createElement("script");
    s.setAttribute("data-src", "tone-cdn");
    s.src = "https://cdn.jsdelivr.net/npm/tone@14.8.39/build/Tone.js";
    s.onload = () => resolve(globalThis.Tone);
    s.onerror = () => reject(new Error("Failed to load Tone.js"));
    document.head.appendChild(s);
  });
}

function clearScheduled() {
  if (scheduledId) {
    clearTimeout(scheduledId);
    scheduledId = null;
  }
}

function getDurationMsForNote(note) {
  try {
    const tok = String(note?.duration || "q");
    const m = tok.match(/^([whqes])(?:\.|\*)?(r)?$/i); // accept w,h,q,e,s, optional dot/star for dotted, optional r
    let base = "q";
    let dotted = false;
    if (m) {
      base = m[1].toLowerCase();
      dotted = /\.|\*/.test(tok);
    }
    const quarterMs = 60000 / (Number(tempoBpm.value) || 80);
    const baseQN = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 }[base] || 1;
    const mult = dotted ? 1.5 : 1;
    return Math.max(50, Math.round(baseQN * mult * quarterMs));
  } catch {
    return 60000 / (Number(tempoBpm.value) || 80);
  }
}

async function ensureSynth() {
  if (synth) return synth;
  const Tone = await loadTone();
  await Tone.start?.();
  synth = new Tone.Synth().toDestination();
  return synth;
}

function highlightAt(index) {
  try {
    const groups = Array.from(document.querySelectorAll(".vf-stavenote"));
    groups.forEach((g) => g.classList.remove("note-highlight"));
    if (groups[index]) groups[index].classList.add("note-highlight");
  } catch {}
}

async function playFrom(index = 0) {
  try {
    clearScheduled();
    const arr = Array.isArray(store.noteArray) ? store.noteArray : [];
    if (!arr.length) {
      alert("No notes to play.");
      playing.value = false;
      return;
    }
    currentIndex.value = Math.max(0, Math.min(index, arr.length - 1));
    const Tone = await ensureSynth();
    playing.value = true;
    paused.value = false;

    const note = arr[currentIndex.value];
    // Highlight
    highlightAt(currentIndex.value);

    // Trigger
    const pitchRaw = String(note?.pitch || "");
    const pitch = pitchRaw.includes("/") ? pitchRaw.replace(/\//g, "") : pitchRaw;
    const durMs = getDurationMsForNote(note);
    const durSec = Math.max(0.08, durMs / 1000);
    try {
      Tone.triggerAttackRelease(pitch, durSec);
    } catch {
      try {
        Tone.triggerAttackRelease(pitchRaw, durSec);
      } catch {}
    }

    // Schedule next
    scheduledId = setTimeout(() => {
      scheduledId = null;
      if (!playing.value) return;
      currentIndex.value++;
      const arrLen = arr.length;
      if (currentIndex.value >= arrLen) {
        if (loop.value) {
          currentIndex.value = 0;
          playFrom(currentIndex.value);
        } else {
          stopPlayback();
        }
      } else {
        playFrom(currentIndex.value);
      }
    }, durMs);
  } catch (e) {
    console.warn("[CreatePracticeUnitView] playFrom failed", e);
    stopPlayback();
  }
}

function startPlayback() {
  if (playing.value && !paused.value) return;
  if (paused.value) {
    // resume by playing from currentIndex
    paused.value = false;
    playFrom(currentIndex.value);
    return;
  }
  // start fresh
  playFrom(currentIndex.value || 0);
}

function pausePlayback() {
  if (!playing.value) return;
  paused.value = true;
  playing.value = false;
  clearScheduled();
}

function stopPlayback() {
  playing.value = false;
  paused.value = false;
  currentIndex.value = 0;
  clearScheduled();
  // clear highlights
  try { document.querySelectorAll('.vf-stavenote').forEach(g=>g.classList.remove('note-highlight')); } catch {}
}

function stepForward() {
  stopPlayback();
  const arr = Array.isArray(store.noteArray) ? store.noteArray : [];
  if (!arr.length) return;
  currentIndex.value = Math.min(arr.length - 1, (currentIndex.value || 0) + 1);
  playFrom(currentIndex.value);
}

function stepBack() {
  stopPlayback();
  const arr = Array.isArray(store.noteArray) ? store.noteArray : [];
  if (!arr.length) return;
  currentIndex.value = Math.max(0, (currentIndex.value || 0) - 1);
  playFrom(currentIndex.value);
}

function toggleLoop() {
  loop.value = !loop.value;
}

onBeforeUnmount(() => {
  clearScheduled();
  try {
    if (synth && typeof synth.dispose === 'function') synth.dispose();
  } catch {}
  synth = null;
});

// ----- Scale-specific computed properties -----
const cap = (s) =>
  typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;

const scaleSelectorText = computed(() => {
  const sel = store.scaleSelections || {};
  return `${sel.key || "C"} ${cap(sel.scaleType || "major")} Scale`;
});

const scaleRangeText = computed(() => {
  const sel = store.scaleSelections || {};
  const n = Number(sel.octaveCount) || 1;
  const plural = n === 1 ? "octave" : "octaves";
  return `${n} ${plural} starting at ${sel.startingOctave || "C4"}`;
});

const durationDirectionText = computed(() => {
  const sel = store.scaleSelections || {};
  const dir = sel.direction || "Ascending";
  const map = {
    whole: "Whole",
    half: "Half",
    quarter: "Quarter",
    eighth: "Eighth",
  };
  const dur = map[sel.noteDuration] || cap(sel.noteDuration || "Quarter");
  return `${dir} ${dur} Note Scale`;
});

const staffFormattingText = computed(() => {
  const so =
    (store.scaleSelections && store.scaleSelections.staffOptions) || {};
  const parts = [];
  if (so.keySignature) parts.push("Key Signature");
  if (so.barLines) parts.push("Bar Lines");
  if (so.timeSignature) parts.push("Time Signature");
  if (so.accidentals) parts.push("Accidentals");
  let family = "";
  switch (so.accidentalFamily) {
    case "auto-key":
      family = "Auto: Based on Key";
      break;
    case "auto-direction":
      family = "Auto: Based on Asc/Desc";
      break;
    case "force-sharps":
      family = "Force: Sharps";
      break;
    case "force-flats":
      family = "Force: Flats";
      break;
  }
  return parts.join(", ") + (family ? `, ${family}` : "");
});

// ----- Exercise-specific computed properties -----
const exerciseTitle = computed(() => {
  return store.practiceUnitHeader?.practiceName || "Untitled Exercise";
});

const exerciseKeySignature = computed(() => {
  return store.practiceUnitHeader?.keySignature || "C";
});

const exerciseTimeSignature = computed(() => {
  return store.practiceUnitHeader?.timeSignature || "4/4";
});

const exerciseTempo = computed(() => {
  return store.practiceUnitHeader?.tempo || 80;
});

const exerciseTechniqueFocus = computed(() => {
  return store.practiceUnitHeader?.techniqueFocus || [];
});

const exerciseSourceMusicXML = computed(() => {
  return store.practiceUnitHeader?.sourceMusicXML || "";
});

const exerciseSourceURL = computed(() => {
  return store.practiceUnitHeader?.sourceURL || "";
});

// ----- Snapshot Manager Functions -----

// Smart default name generator based on practice unit type
const defaultPracticeUnitName = computed(() => {
  const header = store.practiceUnitHeader;

  // If already named, use that
  if (header?.practiceName) {
    return header.practiceName;
  }

  // Generate type-specific default
  if (practiceUnitType.value === "Scale") {
    // For scales: "C Major Scale for Euphonium"
    const inst = header?.instrument;
    const shortName =
      inst?.instrument?.split(",")[0]?.trim() || "Unknown Instrument";
    const sel = store.scaleSelections || {};
    const typeCased = sel.scaleType
      ? sel.scaleType.charAt(0).toUpperCase() + sel.scaleType.slice(1)
      : "Major";
    const key = sel.key || header?.keySignature || "C";
    return `${key} ${typeCased} Scale for ${shortName}`;
  } else {
    // For exercises: use sourceTitle or "Exercise for Euphonium"
    const inst = header?.instrument;
    const shortName =
      inst?.instrument?.split(",")[0]?.trim() || "Unknown Instrument";
    const sourceTitle = header?.sourceTitle;

    if (sourceTitle) {
      return `${sourceTitle} for ${shortName}`;
    }

    // Fallback
    return `Exercise for ${shortName}`;
  }
});

// Filtered units for recall modal
const filteredUnits = computed(() => {
  const q = (recallFilterText.value || "").trim().toLowerCase();
  const items = availableUnits.value || [];
  if (!q) return items;
  return items.filter((u) => {
    try {
      const h = u?.unit_json?.practiceUnitHeader || {};
      const inst = h?.instrument?.instrument || h?.instrument || "";
      const focus = (h?.techniqueFocus || []).join(" ");
      const parts = [
        u?.name,
        u?.type,
        h?.keySignature,
        h?.timeSignature,
        h?.contentType,
        focus,
        inst,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());
      return parts.some((p) => p.includes(q));
    } catch {
      return false;
    }
  });
});

// Export to JSON file
function exportToJson() {
  try {
    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    // Use smart default name generator
    let name = globalThis.prompt(
      "Enter Practice Unit Name:",
      defaultPracticeUnitName.value
    );
    if (!name) return;

    header.practiceName = name;

    const json = JSON.stringify(unit, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MTS-Practice Unit ${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn("[CreatePracticeUnitView] exportToJson failed", e);
    alert("Failed to export practice unit.");
  }
}

// Trigger file import dialog
function triggerImportFileDialog() {
  if (importFileInput.value) {
    importFileInput.value.click();
  }
}

// Handle file import
async function handleImportFileChange(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.practiceUnitHeader && Array.isArray(data.noteArray)) {
      store.loadPracticeUnit(data);
      alert(`Loaded ${practiceUnitType.value} from file: ${file.name}`);
    } else {
      alert(
        "Invalid practice unit format. Expected practiceUnitHeader and noteArray."
      );
    }
  } catch (e) {
    console.warn("[CreatePracticeUnitView] Import parse failed", e);
    alert("Failed to parse JSON file.");
  }
}

// SAVE to Database (Supabase)
async function saveToDatabase() {
  try {
    // Check persistent user session first
    if (!currentUser.value) {
      alert("Please sign in on Preferences before saving to database.");
      return;
    }
    
    // Double-check with Supabase session
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (sessErr || !session?.user?.id) {
      // Clear invalid session and prompt sign-in
      clearUserSession();
      alert("Your session has expired. Please sign in again on Preferences.");
      return;
    }

    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    if (!header.practiceUnitId) {
      header.practiceUnitId = crypto.randomUUID
        ? crypto.randomUUID()
        : `guid-${Date.now()}`;
    }
    header.lastModified = new Date().toISOString();
    header.User = session.user.id;

    // Ensure practice unit type is set
    if (!header.practiceUnitType) {
      header.practiceUnitType = practiceUnitType.value;
    }

    // Use smart default name if not already set
    const nameToUse = header.practiceName || defaultPracticeUnitName.value;
    header.practiceName = nameToUse;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: nameToUse,
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };

    const { error } = await upsertPracticeUnit(row);
    if (error) {
      console.warn("[CreatePracticeUnitView] saveToDatabase error", error);
      alert(`Save failed: ${error.message}`);
      return;
    }
    alert("Saved to database.");
  } catch (e) {
    console.warn("[CreatePracticeUnitView] saveToDatabase exception", e);
    alert("Unexpected error while saving to database.");
  }
}

// SAVE as New to Database (always creates a new GUID)
async function saveAsNewToDatabase() {
  try {
    // Check persistent user session first
    if (!currentUser.value) {
      alert("Please sign in on Preferences before saving to database.");
      return;
    }
    
    // Double-check with Supabase session
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (sessErr || !session?.user?.id) {
      // Clear invalid session and prompt sign-in
      clearUserSession();
      alert("Your session has expired. Please sign in again on Preferences.");
      return;
    }

    const unit = store.composePracticeUnit();
    const header = unit.practiceUnitHeader;

    // Always generate a new GUID
    header.practiceUnitId = crypto.randomUUID
      ? crypto.randomUUID()
      : `guid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    header.lastModified = new Date().toISOString();
    header.User = session.user.id;

    // Ensure practice unit type is set
    if (!header.practiceUnitType) {
      header.practiceUnitType = practiceUnitType.value;
    }

    // Use smart default name if not already set
    const nameToUse = header.practiceName || defaultPracticeUnitName.value;
    header.practiceName = nameToUse;

    const row = {
      user_id: session.user.id,
      practice_unit_id: header.practiceUnitId,
      name: nameToUse,
      type: header.practiceUnitType,
      share_music: !!header.shareMusic,
      unit_json: unit,
      last_modified: header.lastModified,
    };

    const { error } = await insertNewPracticeUnit(row);
    if (error) {
      console.warn("[CreatePracticeUnitView] saveAsNewToDatabase error", error);
      alert(`Save as New failed: ${error.message}`);
      return;
    }

    alert(
      `Saved as new practice unit to database.\n\nName: ${header.practiceName}\nID: ${header.practiceUnitId}\n\nThis is a brand new unit separate from any previous saves.`
    );
  } catch (e) {
    console.warn("[CreatePracticeUnitView] saveAsNewToDatabase exception", e);
    alert("Unexpected error while saving as new to database.");
  }
}

// RECALL from Database - open modal to select from list
async function openRecallModal() {
  try {
    // Check persistent user session first
    if (!currentUser.value) {
      alert("Please sign in on Preferences before accessing saved units.");
      return;
    }
    
    // Double-check with Supabase session
    const { data: sessData } = await supabase.auth.getSession();
    const session = sessData?.session;
    if (!session?.user?.id) {
      // Clear invalid session and prompt sign-in
      clearUserSession();
      alert("Your session has expired. Please sign in again on Preferences.");
      return;
    }

    loadingUnits.value = true;
    showRecallModal.value = true;

    // Query for ALL practice units (both Scales and Exercises)
    const { data, error } = await supabase
      .from("practice_units")
      .select("practice_unit_id, name, type, last_modified, unit_json")
      .eq("user_id", session.user.id)
      .order("last_modified", { ascending: false });

    if (error) {
      console.warn("[CreatePracticeUnitView] openRecallModal error", error);
      alert(`Failed to load saved practice units: ${error.message}`);
      showRecallModal.value = false;
      return;
    }

    availableUnits.value = data || [];
  } catch (e) {
    console.warn("[CreatePracticeUnitView] openRecallModal exception", e);
    alert(
      `Unexpected error while loading saved ${practiceUnitType.value.toLowerCase()}s.`
    );
    showRecallModal.value = false;
  } finally {
    loadingUnits.value = false;
  }
}

// Load the selected practice unit from the modal
function loadSelectedUnit(unit) {
  try {
    if (!unit?.unit_json) {
      alert("Invalid practice unit data.");
      return;
    }

    store.loadPracticeUnit(unit.unit_json);
    showRecallModal.value = false;
    alert(`Loaded: ${unit.name}`);
  } catch (e) {
    console.warn("[CreatePracticeUnitView] loadSelectedUnit exception", e);
    alert("Failed to load practice unit.");
  }
}

// Format timestamp for display
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Helper: get instrument short name
function getInstrumentShortName(inst) {
  if (!inst || !inst.instrument) return "Unknown Instrument";
  return inst.instrument.split(",")[0].trim();
}

// Compose a compact, descriptive summary for a saved unit
function describeUnit(unit) {
  try {
    const h = unit?.unit_json?.practiceUnitHeader || {};
    const shortInst = getInstrumentShortName(h.instrument);

    if (unit.type === "Scale") {
      // Scale description
      const ctype = h.contentType
        ? h.contentType.charAt(0).toUpperCase() + h.contentType.slice(1)
        : "";
      const parts = [];
      if (h.keySignature && ctype) parts.push(`${h.keySignature} ${ctype}`);
      if (h.startingOctave) parts.push(`start ${h.startingOctave}`);
      if (h.numberOfOctaves)
        parts.push(
          `${h.numberOfOctaves} octave${h.numberOfOctaves > 1 ? "s" : ""}`
        );
      if (h.direction) parts.push(String(h.direction));
      if (shortInst && shortInst !== "Unknown Instrument")
        parts.push(`for ${shortInst}`);
      return parts.filter(Boolean).join(" • ");
    } else {
      // Exercise description
      const focus = (h?.techniqueFocus || []).join(", ");
      const parts = [];
      if (h.keySignature) parts.push(h.keySignature);
      if (h.timeSignature) parts.push(h.timeSignature);
      if (focus) parts.push(focus);
      if (shortInst && shortInst !== "Unknown Instrument")
        parts.push(`for ${shortInst}`);
      return parts.filter(Boolean).join(" • ");
    }
  } catch {
    return "";
  }
}
</script>
