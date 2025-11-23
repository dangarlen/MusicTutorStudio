<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <!-- Page Title -->
      <div class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages">
        <span class="material-symbols-outlined">tune</span>
        <span class="text-2xl font-bold">Tuning Practice</span>
      </div>

      <!-- Context Message -->
      <div class="mb-6 max-w-3xl mx-auto">
        <div class="p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 text-center">
          <div class="text-sm text-blue-700 font-medium">
            Match the target note on your instrument. Use the frequency and cents display to fine-tune your pitch.
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <!-- Left Column: Detected Note Display -->
        <div class="lg:col-span-2">
          <!-- Input Method Selection -->
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
          </div>
        </div>

        <!-- Right Column: Empty for now (can add more features) -->
        <div class="lg:col-span-1">
          <!-- Space reserved for future features -->
        </div>
      </div>

      <!-- Collapses Section -->
      <div class="max-w-5xl mx-auto mt-6">
        <!-- Tuning Display Collapse -->
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" checked />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
            🎵 Tuning Display
          </div>
          <div class="collapse-content px-4 pb-4">
            <!-- Detected Note • Expected Next • Tuning (Side-by-Side) -->
            <div class="flex gap-4 mb-4">
              <!-- Detected Note (Left) -->
              <div class="flex-1 bg-white p-3 rounded-lg border border-gray-200">
                <div class="text-center">
                  <div class="text-xs text-gray-600 mb-1 font-medium">Detected Note</div>
                  <div class="text-4xl font-bold text-gray-800">{{ detectedNote || '--' }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ formatFreq(detectedFreq) }}</div>
                  
                  <!-- Hold Time Countdown Timer -->
                  <div v-if="detectedNote" class="mt-2">
                    <div class="text-xs font-medium text-gray-600 mb-1" v-if="!isNoteHeld">Hold for 1s</div>
                    <div class="text-3xl font-bold font-mono transition-all" :class="isNoteHeld ? 'text-green-600' : 'text-blue-600'">
                      {{ holdTimeDisplay }}
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-3 overflow-hidden mt-1">
                      <div 
                        class="h-full rounded-full transition-all duration-100"
                        :class="isNoteHeld ? 'bg-green-500' : 'bg-blue-500'"
                        :style="{ width: holdPercentage + '%' }"
                      ></div>
                    </div>
                    <!-- Completion message -->
                    <div v-if="isNoteHeld" class="mt-2 p-1 bg-green-100 border border-green-500 rounded text-xs">
                      <div class="font-bold text-green-600">✓ HELD!</div>
                    </div>
                  </div>
                  
                  <div class="text-xs text-gray-500 mt-2">
                    <span v-if="inputMode === 'instrument' && running">🎤 Live</span>
                    <span v-else-if="inputMode === 'virtual-keyboard'">🎹 Virtual</span>
                    <span v-else>—</span>
                  </div>
                </div>
              </div>

              <!-- Expected Next Note (Middle) -->
              <div class="w-56 bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-300 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-xs text-gray-700 font-semibold uppercase">Expected Next</div>
                  <div class="text-3xl font-bold font-mono text-cyan-600">
                    {{ expectedNextNote || 'N/A' }}
                  </div>
                </div>
              </div>

              <!-- Tuning Meter (Right) - Horizontal Style -->
              <div class="flex-1 bg-gradient-to-b from-gray-50 to-white p-4 rounded-lg border-2 border-gray-300 shadow-lg flex flex-col justify-center">
                <div class="text-sm text-gray-800 mb-3 font-bold text-center uppercase tracking-wide">Tuning</div>
                <svg width="100%" height="80" viewBox="0 0 200 80" class="drop-shadow-lg">
                  <defs>
                    <linearGradient id="meterHGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.5" />
                      <stop offset="50%" style="stop-color:#22c55e;stop-opacity:0.6" />
                      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.5" />
                    </linearGradient>
                  </defs>
                  
                  <!-- Background bar -->
                  <rect x="10" y="28" width="180" height="24" fill="url(#meterHGradient)" rx="12" ry="12" stroke="#666" stroke-width="1"/>
                  
                  <!-- Tick marks -->
                  <g stroke="#666" stroke-width="2">
                    <line x1="10" y1="20" x2="10" y2="60"/>
                    <line x1="100" y1="18" x2="100" y2="62"/>
                    <line x1="190" y1="20" x2="190" y2="60"/>
                  </g>
                  
                  <!-- Labels -->
                  <text x="10" y="73" text-anchor="middle" font-size="12" fill="#3b82f6" font-weight="bold">♭ FLAT</text>
                  <text x="100" y="73" text-anchor="middle" font-size="12" fill="#22c55e" font-weight="bold">IN TUNE</text>
                  <text x="190" y="73" text-anchor="middle" font-size="12" fill="#ef4444" font-weight="bold">♯ SHARP</text>
                  
                  <!-- Needle -->
                  <line 
                    x1="100" y1="40" 
                    :x2="10 + getTuningNeedlePosition() * 1.8"
                    y2="40"
                    stroke="#000" stroke-width="4" stroke-linecap="round"
                  />
                  
                  <!-- Center knob -->
                  <circle cx="100" cy="40" r="5" fill="#000" stroke="#fff" stroke-width="1"/>
                </svg>
                <div class="text-center text-base font-bold text-gray-800 mt-2">{{ centsDisplay() }}</div>
              </div>
            </div>

            <!-- Staff Display -->
            <details class="border-t pt-3" open>
              <summary class="cursor-pointer text-base font-bold text-gray-800 mb-2">📊 C Major Scale Progress</summary>
              <div class="mt-2 bg-gradient-to-b from-blue-50 to-white p-4 rounded-lg border-2 border-blue-200">
                <div class="text-xs text-gray-600 mb-2 text-center">
                  <strong>Color Key:</strong>
                  <span class="mx-2 text-yellow-600">● Yellow = Expected Next</span>
                  <span class="mx-2 text-green-600">● Green = Perfect</span>
                  <span class="mx-2 text-blue-600">● Blue = Good</span>
                  <span class="mx-2 text-orange-600">● Orange = Flat/Sharp</span>
                  <span class="mx-2 text-red-600">● Red = Wrong</span>
                </div>
                <StaffPreview
                  :practice-overlay-mode="'pitch'"
                  :practice-overlay-tooltip-only="false"
                  :practice-enable-click-to-cycle="false"
                  :practice-color-cycle="['black', 'yellow', 'green', 'blue', 'orange', 'red']"
                />
              </div>
            </details>
          </div>
        </div>

        <!-- Virtual Keyboard Collapse -->
        <div v-if="showVirtualKeyboardCollapse" class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input 
            type="checkbox" 
            class="peer" 
            checked
          />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
            🎹 Virtual Keyboard
          </div>
          <div class="collapse-content px-4 pb-4">
            <div class="space-y-3">
              <div class="text-sm text-gray-700 mb-3">
                {{ currentInstrumentName }} • Starting octave {{ virtualKeyboardOctave }}
              </div>
              <VirtualKeyboard
                ref="virtualKeyboardRef"
                :initial-octave="virtualKeyboardOctave"
                @on-tone-start="handleVirtualKeyboardTone"
                @on-tone-stop="stopVirtualKeyboardTone"
              />
            </div>
          </div>
        </div>

        <!-- Microphone Input Collapse -->
        <div v-if="showMicrophoneCollapse" class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" checked />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>🎤 Microphone Input</span>
            <span v-if="running" class="badge badge-success">Listening</span>
          </div>
          <div class="collapse-content px-4 pb-4">
            <div class="space-y-3">
              <div class="text-sm text-gray-700 mb-3">
                <template v-if="inputMode === 'instrument'">
                  Using microphone input for {{ currentInstrumentName }} (microphone permission required)
                </template>
                <template v-else>
                  Using microphone to detect audio from Virtual Keyboard (enable speakers in keyboard settings)
                </template>
              </div>
              <button
                class="btn w-full"
                :class="running ? 'btn-error' : 'btn-primary'"
                @click="toggleRunning"
              >
                <span class="material-symbols-outlined">{{ running ? 'mic_off' : 'mic' }}</span>
                {{ running ? 'Stop Microphone' : 'Start Microphone' }}
              </button>
              <div v-if="!running" class="text-xs text-center text-gray-500 mt-2">
                <button class="link link-primary" @click="showPermissionHelp = !showPermissionHelp">
                  Permission Help
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scale Detection Debug Collapse -->
        <div class="collapse collapse-arrow bg-yellow-50 border border-yellow-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>🎼 Scale Detection</span>
            <span v-if="scaleDetectionRunning" class="badge badge-warning">Recording</span>
          </div>
          <div class="collapse-content px-4 pb-4">
            <div class="space-y-3">
              <!-- Compact Workflow Instructions -->
              <div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
                <details class="cursor-pointer">
                  <summary class="font-semibold text-blue-800">📋 Workflow</summary>
                  <div class="text-xs mt-2 space-y-2 ml-2">
                    <div v-if="inputMode === 'instrument'" class="space-y-1">
                      <strong>Microphone Mode:</strong>
                      <ol class="list-decimal list-inside ml-2">
                        <li>Open "🎤 Microphone Input" collapse (above)</li>
                        <li>Click "Start Microphone" button</li>
                        <li>Click "Start Scale Detection" button below</li>
                        <li>Play C major scale on your instrument (C, D, E, F, G, A, B, C)</li>
                        <li>Watch the analysis table fill with your notes and tuning data</li>
                      </ol>
                    </div>
                    <div v-else class="space-y-1">
                      <strong>Virtual Keyboard Mode:</strong>
                      <ol class="list-decimal list-inside ml-2">
                        <li>Enable "🎙️ Simulate Microphone Detection" toggle</li>
                        <li>Click "Start Scale Detection" button</li>
                        <li><strong>Click each key:</strong> C, D, E, F, G, A, B, C</li>
                        <li>Hold each note for 1+ seconds until "✓ HELD!" shows</li>
                        <li>Watch the analysis table auto-populate</li>
                      </ol>
                    </div>
                  </div>
                </details>
              </div>

              <!-- Control Buttons Row -->
              <div class="flex gap-2 items-center flex-wrap">
                <button
                  class="btn btn-sm flex-1"
                  :class="scaleDetectionRunning ? 'btn-error' : 'btn-warning'"
                  @click="toggleScaleDetection"
                >
                  <span class="material-symbols-outlined">{{ scaleDetectionRunning ? 'stop' : 'play_arrow' }}</span>
                  {{ scaleDetectionRunning ? 'Stop' : 'Start' }} Detection
                </button>
                
                <!-- Simulate Microphone Toggle -->
                <label class="flex items-center gap-2 cursor-pointer bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg flex-1">
                  <input 
                    type="checkbox" 
                    v-model="simulateMicrophoneMode" 
                    class="toggle toggle-xs toggle-primary"
                  />
                  <span class="text-xs font-medium text-gray-700 whitespace-nowrap">
                    🎙️ Simulate
                  </span>
                </label>
              </div>

              <!-- Statistics Summary (Single Line) -->
              <div v-if="scaleLog.length > 0" class="bg-white p-2 rounded border border-yellow-200 text-xs">
                <div class="flex justify-between items-center gap-3">
                  <span><strong>Notes:</strong> <span class="font-bold text-yellow-600">{{ scaleLog.length }}</span></span>
                  <span><strong>Avg Error:</strong> <span class="font-bold" :class="averageTuningError <= 50 ? 'text-green-600' : 'text-orange-600'">{{ averageTuningError.toFixed(0) }}¢</span></span>
                  <span><strong>Expected:</strong> <span class="font-mono text-gray-700">{{ expectedSequence }}</span></span>
                  <span><strong>Detected:</strong> <span class="font-mono text-gray-700">{{ detectedSequence }}</span></span>
                </div>
              </div>

              <!-- Threshold Configuration Collapse -->
              <div v-if="scaleDetectionRunning" class="collapse collapse-arrow bg-gray-800 text-gray-100 border border-gray-600 rounded">
                <input type="checkbox" class="peer" />
                <div class="collapse-title text-xs font-semibold text-cyan-300 py-2 px-3">
                  🎯 Status Thresholds (click to configure)
                </div>
                <div class="collapse-content px-3 pb-3">
                  <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between gap-2">
                      <label class="text-green-300 font-mono">✓ Perfect (0-X¢):</label>
                      <input type="number" v-model="thresholdPerfect" min="1" max="49" class="input input-xs w-16 bg-gray-700 text-white" @keydown.stop />
                    </div>
                    <div class="flex items-center justify-between gap-2">
                      <label class="text-yellow-300 font-mono">✓ Good (X+1 to Y¢):</label>
                      <input type="number" v-model="thresholdGood" min="2" max="49" class="input input-xs w-16 bg-gray-700 text-white" @keydown.stop />
                    </div>
                    <div class="text-blue-300 font-mono">♭ Flat: {{ thresholdGood + 1 }} to {{ thresholdWrong }}¢ (negative)</div>
                    <div class="text-orange-300 font-mono">♯ Sharp: {{ thresholdGood + 1 }} to {{ thresholdWrong }}¢ (positive)</div>
                    <div class="flex items-center justify-between gap-2">
                      <label class="text-red-300 font-mono">⚠ Wrong Note (>X¢):</label>
                      <input type="number" v-model="thresholdWrong" min="10" max="100" class="input input-xs w-16 bg-gray-700 text-white" @keydown.stop />
                    </div>
                    <div class="flex items-center gap-2 pt-2 border-t border-gray-600">
                      <input type="checkbox" v-model="logWrongNotes" class="toggle toggle-xs toggle-error" />
                      <label class="text-gray-300">Log wrong notes (instead of rejecting)</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Expected Next Note Display (Prominent) -->
              <div v-if="scaleDetectionRunning" class="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400 rounded-lg p-3 text-center relative">
                <div class="text-xs text-gray-700 font-semibold uppercase">Expected Next Note</div>
                <div class="text-4xl font-bold text-cyan-600 font-mono">
                  {{ expectedNextNote || 'C4' }}
                </div>
                <div class="text-xs text-gray-600 mt-1 tracking-wider">C · D · E · F · G · A · B · C</div>
                
                <!-- Wrong Note Flash Indicator -->
                <div v-if="wrongNoteFlash" class="absolute inset-0 bg-red-500 bg-opacity-80 rounded-lg flex items-center justify-center animate-pulse">
                  <div class="text-white font-bold text-2xl">⚠ WRONG NOTE</div>
                </div>
              </div>

              <!-- Detailed Analysis Table (Condensed) -->
              <div v-if="scaleLog.length > 0" class="p-2 bg-gray-900 text-gray-100 rounded font-mono text-xs max-h-48 overflow-y-auto">
                <table class="w-full">
                  <thead class="sticky top-0 bg-gray-800 border-b border-gray-600">
                    <tr>
                      <th class="text-left px-1 py-0.5 text-blue-300">#</th>
                      <th class="text-left px-1 py-0.5 text-green-300">Detected</th>
                      <th class="text-left px-1 py-0.5 text-cyan-300">Expected</th>
                      <th class="text-left px-1 py-0.5 text-yellow-300">Freq</th>
                      <th class="text-left px-1 py-0.5 text-orange-300">Error</th>
                      <th class="text-left px-1 py-0.5 text-purple-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(entry, idx) in scaleLog" :key="idx" class="border-b border-gray-700 hover:bg-gray-800">
                      <td class="px-1 py-0.5 text-blue-300">{{ idx + 1 }}</td>
                      <td class="px-1 py-0.5 text-green-300 font-bold">{{ entry.note }}</td>
                      <td class="px-1 py-0.5 text-cyan-300">{{ entry.expectedNote || '--' }}</td>
                      <td class="px-1 py-0.5 text-yellow-300">{{ entry.freq.toFixed(0) }}</td>
                      <td class="px-1 py-0.5" :class="getTuningErrorColor(entry.tuningError)">
                        {{ entry.tuningError !== undefined ? entry.tuningError.toFixed(0) : '--' }}
                      </td>
                      <td class="px-1 py-0.5 text-purple-300">{{ getTuningStatus(entry.tuningError) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Results Collapse (Compact) -->
              <div v-if="scaleLog.length > 0" class="collapse collapse-arrow bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded">
                <input type="checkbox" class="peer" />
                <div class="collapse-title text-xs font-semibold text-gray-800 py-2 px-3">
                  ✓ Results
                </div>
                <div class="collapse-content px-3 pb-3">
                  <div class="space-y-0.5 text-xs text-gray-700">
                    <div>• <span class="font-mono font-bold">{{ currentInstrumentName }}</span> ({{ keyboardKey }})</div>
                    <div>• Pitch: <span :class="averageTuningError <= thresholdWrong ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'">
                      {{ averageTuningError <= thresholdWrong ? '✓ Accurate' : '⚠ Check' }}
                    </span></div>
                    <div>• Deviation: <span class="font-mono font-bold">{{ averageTuningError.toFixed(1) }}¢</span></div>
                    <div v-if="accurateDetections > 0">• Accurate: <span class="font-mono font-bold text-green-600">{{ accurateDetections }}/{{ scaleLog.length }}</span></div>
                  </div>
                </div>
              </div>

              <!-- Clear Button -->
              <button class="btn btn-xs btn-ghost w-full" @click="clearScaleLog">
                Clear Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-center gap-4 mt-8 mb-6">
        <RouterLink to="/practice" class="btn btn-outline gap-2">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Practice
        </RouterLink>
      </div>

      <!-- Accessibility Live Region -->
      <div aria-live="polite" class="sr-only">{{ liveAnnounce }}</div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore'
import { useTestStaffNoteStore } from '../stores/testStaffNoteStore'
import Header from './Header.vue'
import FooterStandard from './FooterStandard.vue'
import StaffPreview from './StaffPreview.vue'
import VirtualKeyboard from './VirtualKeyboard.vue'

const store = usePracticeUnitScaleStore()
const notesStore = useTestStaffNoteStore()
const virtualKeyboardRef = ref(null)

// State
const running = ref(false)
const inputMode = ref('instrument')
const detectedNote = ref('')
const detectedFreq = ref(0)
const cents = ref(0)
const targetNote = ref('A4')
const referenceFreq = ref(440)
const selectedInstrument = ref('')
const showPermissionHelp = ref(false)
const liveAnnounce = ref('')
const keyboardKey = ref('C') // Piano key setting for instrument display

// Collapse visibility controls
const showMicrophoneCollapse = ref(true)
const showVirtualKeyboardCollapse = ref(false)

// Hold time tracking for visual feedback
const noteHoldTime = ref(0) // Milliseconds note has been held
const maxHoldTime = ref(1000) // 1 second required to register note
const simulateMicrophoneMode = ref(false) // Simulate microphone detection without actual mic input
let virtualKeyboardHoldInterval = null // Tracks hold time for virtual keyboard

// Scale detection debug state
const scaleDetectionRunning = ref(false)
const scaleLog = ref([])
const lastDetectedNote = ref('')
const lastNoteTime = ref(0)
const firstDetectedOctave = ref(null) // Track the starting octave for dynamic scale generation
const wrongNoteFlash = ref(false) // Flash indicator for wrong notes

// Threshold configuration (editable)
const thresholdPerfect = ref(10)  // 0-10¢
const thresholdGood = ref(25)     // 11-25¢
const thresholdWrong = ref(50)    // >50¢
const logWrongNotes = ref(false)  // If true, log wrong notes instead of rejecting them

// Audio
let audioCtx = null
let mediaStream = null
let processor = null
let oscillator = null
let gainNode = null
const frequencyHistory = [] // Smooth pitch detection by averaging recent frequencies
const MAX_HISTORY = 20 // Number of recent frequency samples to average (increased for stability)
let lastPitchTime = 0 // Track when last valid pitch was detected
const PITCH_TIMEOUT = 1500 // Clear detected note if no pitch for 1.5 seconds (increased for stability)

// Cookie utilities for persisting user preferences
function setCookie(name, value, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = 'expires=' + date.toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`
}

function getCookie(name, defaultValue = '') {
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return defaultValue
}

// Available options
const availableNotes = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 
                        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
                        'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5']

// Computed
const availableInstruments = computed(() => store.instruments || [])

const currentInstrumentName = computed(() => {
  if (selectedInstrument.value) {
    const found = store.instruments?.find(i => i.instrument === selectedInstrument.value)
    return found?.instrument || 'Unknown Instrument'
  }
  return store.practiceUnitHeader?.instrument?.instrument || store.instrument?.instrument || 'Unknown Instrument'
})

const virtualKeyboardOctave = computed(() => {
  if (selectedInstrument.value) {
    const found = store.instruments?.find(i => i.instrument === selectedInstrument.value)
    if (found?.defaultStartingOctave) {
      const match = found.defaultStartingOctave.match(/(\d+)$/)
      return match ? parseInt(match[1], 10) : 4
    }
  }
  return 4
})

const targetFreq = computed(() => {
  return noteToFreq(targetNote.value, referenceFreq.value)
})

const chromaticScaleNotes = computed(() => {
  // Generate chromatic scale starting from C below target note
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteMap = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 }
  
  const match = targetNote.value.match(/^([A-G]#?)(\d+)$/)
  if (!match) return notes
  
  const octave = parseInt(match[2], 10)
  const result = []
  
  // Start from C of current octave
  for (let i = 0; i < 13; i++) { // 13 notes: C to C
    const noteIdx = i % 12
    const octaveOffset = Math.floor(i / 12)
    const currentOctave = octave + octaveOffset
    result.push(notes[noteIdx] + currentOctave)
  }
  
  return result
})

const highlightedNote = computed(() => {
  if (!detectedNote.value) return ''
  
  // Extract the note name and octave from detected note
  const match = detectedNote.value.match(/^([A-G]#?)(\d+)$/)
  if (!match) return ''
  
  // Return the detected note if it's within our chromatic scale range
  const inst = getActiveInstrument()
  const transposeSemitones = inst ? transpositionToSemitones(inst.transposition) : 0
  
  // For transposing instruments, highlight the written note
  return detectedNote.value
})

// C Major scale notes for staff display
const cMajorScaleNotes = computed(() => {
  const octave = firstDetectedOctave.value || 4
  const noteNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c']
  const octaves = [octave, octave, octave, octave, octave, octave, octave, octave + 1]
  
  return noteNames.map((pitch, idx) => {
    const spn = `${pitch.toUpperCase()}${octaves[idx]}`
    const vexPitch = `${pitch}/${octaves[idx]}`
    
    // Determine color based on whether this note has been logged and its tuning
    let color = 'black' // Default: not yet played
    
    // Check if this note has been logged
    if (scaleLog.value.length > idx) {
      const logEntry = scaleLog.value[idx]
      const tuningError = logEntry.tuningError
      
      if (tuningError !== undefined) {
        const absError = Math.abs(tuningError)
        // Check wrong note first (highest priority)
        if (absError > thresholdWrong.value) {
          color = 'red' // Wrong note
        }
        // Then check perfect
        else if (absError <= thresholdPerfect.value) {
          color = 'green' // Perfect
        }
        // Then check good
        else if (absError <= thresholdGood.value) {
          color = 'blue' // Good
        }
        // Otherwise it's flat or sharp (within acceptable range)
        else {
          color = 'orange' // Flat or Sharp
        }
      }
    }
    // If not logged yet, check if it's the expected next note
    else if (idx === scaleLog.value.length) {
      // This is the next note in sequence - highlight as yellow
      color = 'yellow'
    }
    
    return {
      n: { pitch: vexPitch },
      duration: 'q',
      color: color
    }
  })
})

// Utilities
function noteToFreq(note, refFreq = 440) {
  const noteMap = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 }
  const match = note.match(/^([A-G]#?)(\d+)$/)
  if (!match) return refFreq
  const noteName = match[1]
  const octave = parseInt(match[2], 10)
  const semitones = noteMap[noteName] + (octave - 4) * 12
  return refFreq * Math.pow(2, semitones / 12)
}

function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440)
}

function midiToNote(midi) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  // MIDI 0 = C-1, MIDI 12 = C0, MIDI 60 = C4, MIDI 69 = A4
  const rounded = Math.round(midi)
  const octave = Math.floor(rounded / 12) - 1
  const noteIdx = rounded % 12
  // Ensure positive modulo for safety
  const safeNoteIdx = ((noteIdx % 12) + 12) % 12
  return notes[safeNoteIdx] + octave
}

function formatFreq(freq) {
  if (freq < 20 || freq > 20000) return '0.0'
  return freq.toFixed(1)
}

function centsDisplay() {
  const c = Math.round(cents.value)
  if (c === 0) return 'in tune'
  if (c > 0) return `+${c} cents (sharp)`
  return `${c} cents (flat)`
}

function transpositionToSemitones(t) {
  if (!t) return 0
  const s = String(t).trim()
  if (/^C$/i.test(s)) return 0
  if (/^B\s*♭$|^Bb$|^B♭/i.test(s)) return 2
  if (/^F$/i.test(s)) return 7
  if (/^E\s*♭$|^Eb$|^E♭/i.test(s)) return 9
  const letter = s[0].toUpperCase()
  const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const base = map[letter]
  if (base === undefined) return 0
  return base
}

function getActiveInstrument() {
  if (selectedInstrument.value) {
    return store.instruments?.find(i => i.instrument === selectedInstrument.value)
  }
  return store.practiceUnitHeader?.instrument || store.instrument
}

// Methods
function selectInputMethod(mode) {
  inputMode.value = mode
  if (mode === 'virtual-keyboard') {
    stopRunning()
    showVirtualKeyboardCollapse.value = true
    showMicrophoneCollapse.value = false
  } else {
    showMicrophoneCollapse.value = true
    showVirtualKeyboardCollapse.value = false
  }
}

function stopRunning() {
  running.value = false
  frequencyHistory.length = 0 // Clear frequency history
  detectedNote.value = ''
  detectedFreq.value = 0
  cents.value = 0
  noteHoldTime.value = 0 // Reset hold time
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  if (processor) {
    processor.disconnect()
    processor = null
  }
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
}

function toggleRunning() {
  if (running.value) {
    stopRunning()
  } else {
    startMicrophone()
  }
}

async function startMicrophone() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not available in this browser.')
      return
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const sourceNode = audioCtx.createMediaStreamSource(mediaStream)
    processor = audioCtx.createScriptProcessor(4096, 1, 1)

    let bufferQueue = []
    const buffers = []

    processor.onaudioprocess = (evt) => {
      const input = evt.inputBuffer.getChannelData(0)
      for (let i = 0; i < input.length; i++) {
        buffers.push(input[i])
      }

      if (buffers.length >= 4096) {
        const buffer = buffers.splice(0, 4096)
        analyzeAudio(buffer)
      }
    }

    sourceNode.connect(processor)
    processor.connect(audioCtx.destination)
    running.value = true
  } catch (err) {
    console.error('Microphone error:', err)
    alert('Microphone access denied or unavailable.')
    running.value = false
  }
}

function analyzeAudio(buffer) {
  // Detect pitch with stability filtering
  const freq = detectPitch(buffer)
  const now = Date.now()
  
  if (freq > 0 && freq > 40 && freq < 8000) {
    // Valid pitch detected
    lastPitchTime = now
    
    // Add to history for smoothing
    frequencyHistory.push(freq)
    if (frequencyHistory.length > MAX_HISTORY) {
      frequencyHistory.shift()
    }
    
    // Use median of recent frequencies for stability
    const sortedFreqs = [...frequencyHistory].sort((a, b) => a - b)
    const smoothedFreq = sortedFreqs[Math.floor(sortedFreqs.length / 2)]
    
    detectedFreq.value = smoothedFreq
    const midi = freqToMidi(smoothedFreq)
    const nearest = Math.round(midi)
    
    // For a tuner, show the actual sounding pitch being detected
    // Don't apply transposition - just show what's being heard
    const noteName = midiToNote(nearest)
    
    // Track hold time for visual feedback
    if (noteName === detectedNote.value) {
      // Same note - increment hold time
      noteHoldTime.value += buffer.length / audioCtx.sampleRate * 1000 // Convert to milliseconds
    } else {
      // New note - reset hold time
      noteHoldTime.value = 0
      detectedNote.value = noteName
    }
    
    cents.value = (midi - nearest) * 100
    
    // Log for scale detection if enabled
    if (scaleDetectionRunning.value) {
      const now = Date.now()
      // Only log if note changed or enough time has passed (avoid duplicate logs)
      if (noteName !== lastDetectedNote.value || now - lastNoteTime.value > 300) {
        lastDetectedNote.value = noteName
        lastNoteTime.value = now
        
        console.log(`[Scale Detection] Note detected: ${noteName}, MIDI: ${midi.toFixed(2)}, Freq: ${smoothedFreq.toFixed(1)}, Log length: ${scaleLog.value.length}`)
        
        const time = new Date().toLocaleTimeString()
        
        // Calculate octave and note index for debugging
        const octave = Math.floor(nearest / 12) - 1
        const noteIdx = ((nearest % 12) + 12) % 12
        
        // Dynamic C major scale generation based on first detected note
        if (firstDetectedOctave.value === null && detectedNote.value) {
          firstDetectedOctave.value = octave
          console.log(`[Scale Detection] First note detected: ${detectedNote.value}, octave ${octave}`)
        }
        
        // Calculate expected note for C major scale analysis
        const detectionIndex = scaleLog.value.length
        let expectedNote = ''
        let tuningError = undefined
        
        if (firstDetectedOctave.value !== null) {
          // C major scale intervals from C (in semitones): C, D, E, F, G, A, B, C
          const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11, 12]
          const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
          
          // Allow continuous cycling through the scale
          const scaleDegree = detectionIndex % 8  // Cycle through 0-7
          const octaveOffset = Math.floor(detectionIndex / 8)  // How many times through the scale
          
          const expectedOctave = firstDetectedOctave.value + octaveOffset + (scaleDegree >= 7 ? 1 : 0)
          const expectedMidi = firstDetectedOctave.value * 12 + 12 + cMajorIntervals[scaleDegree] + (octaveOffset * 12)
          expectedNote = noteNames[scaleDegree] + expectedOctave
          
          // Tuning error in cents: 100 cents = 1 semitone
          tuningError = (midi - expectedMidi) * 100
          console.log(`[Scale Detection] Index ${detectionIndex}: Expected ${expectedNote} (MIDI ${expectedMidi}), Tuning error: ${tuningError.toFixed(0)}¢`)
        }
        
        scaleLog.value.push({
          time,
          note: noteName,
          expectedNote,
          freq: smoothedFreq,
          midi: midi,
          midiRounded: nearest,
          octave: octave,
          noteIdx: noteIdx,
          tuningError: tuningError
        })
        
        console.log(`[Scale Detection] Entry added, scaleLog now has ${scaleLog.value.length} entries`)
        
        // Keep log from getting too long
        if (scaleLog.value.length > 50) {
          scaleLog.value.shift()
        }
      }
    }
  } else if (now - lastPitchTime > PITCH_TIMEOUT) {
    // No valid pitch detected and enough time has passed since last valid pitch
    // Only clear if we had no frequency history at all (never detected anything)
    if (frequencyHistory.length === 0) {
      detectedNote.value = ''
      detectedFreq.value = 0
      cents.value = 0
      noteHoldTime.value = 0
    }
  }
}

function detectPitch(buffer) {
  // YIN algorithm for pitch detection (avoids subharmonic issues)
  const SIZE = buffer.length
  
  // Calculate RMS (signal strength)
  let rms = 0
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / SIZE)
  
  // If signal is too quiet, ignore (noise threshold)
  if (rms < 0.02) return -1
  
  // Apply DC offset removal
  let sum = 0
  for (let i = 0; i < SIZE; i++) sum += buffer[i]
  const mean = sum / SIZE
  
  const normalized = new Array(SIZE)
  for (let i = 0; i < SIZE; i++) {
    normalized[i] = buffer[i] - mean
  }
  
  // YIN algorithm
  // Step 1: Compute difference function
  const minPeriod = Math.floor(audioCtx.sampleRate / 600)   // ~600Hz max
  const maxPeriod = Math.floor(audioCtx.sampleRate / 80)    // ~80Hz min
  
  const df = new Array(SIZE)
  let runningSum = 0
  df[0] = 0
  
  for (let tau = 1; tau < SIZE; tau++) {
    let sum = 0
    for (let i = 0; i < SIZE - tau; i++) {
      const delta = normalized[i] - normalized[i + tau]
      sum += delta * delta
    }
    df[tau] = sum
    if (tau < maxPeriod) {
      runningSum += sum
    }
  }
  
  // Step 2: Compute cumulative mean normalized difference
  const cmndf = new Array(SIZE)
  cmndf[0] = 1
  for (let tau = 1; tau < SIZE; tau++) {
    if (runningSum === 0) {
      cmndf[tau] = 1
    } else {
      cmndf[tau] = df[tau] / (runningSum / tau)
    }
  }
  
  // Step 3: Find the first tau where cmndf is below threshold
  // Lower threshold = more likely to find fundamental, but might miss weak signals
  const threshold = 0.15
  let tau = -1
  for (let t = minPeriod; t < maxPeriod; t++) {
    if (cmndf[t] < threshold) {
      tau = t
      break
    }
  }
  
  // If no tau found below threshold, find the global minimum
  if (tau === -1) {
    let minVal = Infinity
    for (let t = minPeriod; t < maxPeriod; t++) {
      if (cmndf[t] < minVal) {
        minVal = cmndf[t]
        tau = t
      }
    }
  }
  
  if (tau > 0 && tau < maxPeriod) {
    const detectedFreq = audioCtx.sampleRate / tau
    
    // Check if detected frequency is in euphonium range
    if (detectedFreq >= 80 && detectedFreq <= 600) {
      console.log(`[Pitch] freq=${detectedFreq.toFixed(1)}Hz, tau=${tau}, cmndf=${cmndf[tau].toFixed(3)}`)
      return detectedFreq
    }
    
    // If frequency is too high (possibly got octave wrong), try half the frequency
    if (detectedFreq > 600) {
      const halfFreq = detectedFreq / 2
      if (halfFreq >= 80 && halfFreq <= 600) {
        console.log(`[Pitch] freq=${halfFreq.toFixed(1)}Hz (octave corrected), tau=${tau}`)
        return halfFreq
      }
    }
  }
  
  return -1
}

function addNoteToScaleLog(midi, freq, noteName) {
  // Add note to scale detection log (used by both real microphone and simulated mode)
  const now = Date.now()
  
  // Only log if note changed or enough time has passed (avoid duplicate logs)
  if (noteName !== lastDetectedNote.value || now - lastNoteTime.value > 500) {
    lastDetectedNote.value = noteName
    lastNoteTime.value = now
    
    console.log(`[Scale Detection] Note detected: ${noteName}, MIDI: ${midi.toFixed(2)}, Freq: ${freq.toFixed(1)}, Log length: ${scaleLog.value.length}`)
    
    const time = new Date().toLocaleTimeString()
    
    // Calculate octave and note index for debugging
    const nearest = Math.round(midi)
    const octave = Math.floor(nearest / 12) - 1
    const noteIdx = ((nearest % 12) + 12) % 12
    
    // Dynamic C major scale generation based on first detected note
    if (firstDetectedOctave.value === null) {
      firstDetectedOctave.value = octave
      console.log(`[Scale Detection] First note detected: ${noteName}, octave ${octave}`)
    }
    
    // Calculate expected note for C major scale analysis
    const detectionIndex = scaleLog.value.length
    let expectedNote = ''
    let tuningError = undefined
    
    if (firstDetectedOctave.value !== null) {
      // C major scale intervals from C (in semitones): C, D, E, F, G, A, B, C
      const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11, 12]
      const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
      
      // Allow continuous cycling through the scale
      const scaleDegree = detectionIndex % 8  // Cycle through 0-7
      const octaveOffset = Math.floor(detectionIndex / 8)  // How many times through the scale
      
      const expectedOctave = firstDetectedOctave.value + octaveOffset + (scaleDegree >= 7 ? 1 : 0)
      const expectedMidi = firstDetectedOctave.value * 12 + 12 + cMajorIntervals[scaleDegree] + (octaveOffset * 12)
      expectedNote = noteNames[scaleDegree] + expectedOctave
      
      // Tuning error in cents: 100 cents = 1 semitone
      tuningError = (midi - expectedMidi) * 100
      console.log(`[Scale Detection] Index ${detectionIndex}: Expected ${expectedNote} (MIDI ${expectedMidi}), Tuning error: ${tuningError.toFixed(0)}¢`)
      
      // Check if note is wrong (exceeds threshold)
      if (Math.abs(tuningError) > thresholdWrong.value) {
        wrongNoteFlash.value = true
        setTimeout(() => { wrongNoteFlash.value = false }, 1000)
        
        if (!logWrongNotes.value) {
          // Reject note - don't add to log or increment expected note
          console.log(`[Scale Detection] ❌ WRONG NOTE - Error ${tuningError.toFixed(0)}¢ exceeds ±${thresholdWrong.value}¢ threshold. Not logging.`)
          return
        } else {
          // Log as wrong note
          console.log(`[Scale Detection] ⚠ WRONG NOTE - Error ${tuningError.toFixed(0)}¢ exceeds ±${thresholdWrong.value}¢ threshold. Logging as wrong.`)
        }
      }
    }
    
    scaleLog.value.push({
      time,
      note: noteName,
      expectedNote,
      freq: freq,
      midi: midi,
      midiRounded: nearest,
      octave: octave,
      noteIdx: noteIdx,
      tuningError: tuningError
    })
    
    console.log(`[Scale Detection] ✓ Entry added, scaleLog now has ${scaleLog.value.length} entries`)
    
    // Keep log from getting too long
    if (scaleLog.value.length > 50) {
      scaleLog.value.shift()
    }
  }
}

function handleVirtualKeyboardTone(data) {
  if (!data || !data.midi) return
  const midi = data.midi
  const freq = data.frequency
  
  detectedFreq.value = freq
  
  // Calculate the MIDI note from the actual frequency (which includes detune)
  const actualMidi = freqToMidi(freq)
  
  // For a tuner, show the actual note being played (no transposition)
  const newNote = midiToNote(midi)
  
  // If this is a new note, reset hold time
  if (newNote !== detectedNote.value) {
    noteHoldTime.value = 0
    detectedNote.value = newNote
    
    // Clear any existing hold time interval
    if (virtualKeyboardHoldInterval) {
      clearInterval(virtualKeyboardHoldInterval)
    }
    
    // Start tracking hold time for virtual keyboard
    virtualKeyboardHoldInterval = setInterval(() => {
      noteHoldTime.value += 50 // Increment by 50ms each interval
    }, 50)
  }
  
  // Calculate cents based on actual frequency vs nearest semitone
  const nearest = Math.round(actualMidi)
  cents.value = (actualMidi - nearest) * 100
}

function stopVirtualKeyboardTone(data) {
  // Clear the hold time tracking interval
  if (virtualKeyboardHoldInterval) {
    clearInterval(virtualKeyboardHoldInterval)
    virtualKeyboardHoldInterval = null
  }
  
  // Clear the detected note and reset hold time immediately
  detectedNote.value = ''
  detectedFreq.value = 0
  cents.value = 0
  noteHoldTime.value = 0
}

function onInstrumentChange() {
  // Save selected instrument to cookie (same key as Preferences.vue)
  setCookie('instrument', selectedInstrument.value)
}

function getWrittenTargetNote() {
  const inst = getActiveInstrument()
  if (!inst) return targetNote.value
  const transposeSemitones = transpositionToSemitones(inst.transposition)
  if (transposeSemitones === 0) return targetNote.value
  
  const noteMap = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 }
  const match = targetNote.value.match(/^([A-G]#?)(\d+)$/)
  if (!match) return targetNote.value
  const noteName = match[1]
  const octave = parseInt(match[2], 10)
  const semitones = noteMap[noteName] + (octave - 4) * 12 + transposeSemitones
  
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const newOctave = Math.floor(semitones / 12) + 4
  const noteIdx = ((semitones % 12) + 12) % 12
  return notes[noteIdx] + newOctave
}

function getTuningNeedleAngle() {
  // Converts cents to needle angle for SVG rendering
  // The meter is a semicircle from 90° (left/flat) to 270° (right/sharp)
  // with 180° (straight up) being in tune (0 cents)
  
  let c = Math.round(cents.value)
  // Clamp to ±50 cents for display
  c = Math.max(-50, Math.min(50, c))
  
  // Convert to angle: -50 cents → 90° (left), 0 cents → 180° (up), +50 cents → 270° (right)
  return 180 + (c / 50) * 90
}

function getTuningNeedlePosition() {
  // Returns 0-100 for horizontal tuning meter
  // 0 = flat (left), 50 = in tune (center), 100 = sharp (right)
  let c = Math.round(cents.value)
  // Clamp to ±100 cents for display
  c = Math.max(-100, Math.min(100, c))
  // Convert to 0-100 scale (negative cents = flat = left)
  return 50 + (c / 100) * 50
}

// Initialize
onMounted(async () => {
  await store.loadInstruments()
  
  // Load saved instrument preference from cookie (same key as Preferences.vue)
  const savedInstrument = getCookie('instrument', '')
  if (savedInstrument) {
    selectedInstrument.value = savedInstrument
    
    // Also set in store so VirtualKeyboard can find it
    const instrumentObj = store.instruments?.find(i => i.instrument === savedInstrument)
    if (instrumentObj) {
      store.instrument = instrumentObj
    }
  }
  
  // Initialize staff with chromatic scale
  const chromaticNotes = chromaticScaleNotes.value
  notesStore.noteArray = chromaticNotes.map((note, idx) => ({
    pitch: note,
    spn: note,
    duration: 'q',
    noteColor: note === targetNote.value ? 'blue' : 'gray'
  }))
  
  liveAnnounce.value = `Tuning Practice started. Target note: ${targetNote.value}`
})

// Watch target note and instrument changes
watch(targetNote, (newNote) => {
  // Update staff with chromatic scale highlighting the new target
  const chromaticNotes = chromaticScaleNotes.value
  notesStore.noteArray = chromaticNotes.map((note) => ({
    pitch: note,
    spn: note,
    duration: 'q',
    noteColor: note === newNote ? 'blue' : 'gray'
  }))
  liveAnnounce.value = `Target note changed to: ${newNote}`
})

watch(selectedInstrument, () => {
  const inst = getActiveInstrument()
  
  // Also update store so VirtualKeyboard can access it
  if (inst) {
    store.instrument = inst
  }
  
  liveAnnounce.value = `Instrument changed to: ${currentInstrumentName.value}`
})

watch(detectedNote, (newDetectedNote) => {
  // Update staff highlighting when a note is detected
  if (!newDetectedNote) {
    // If no note detected, reset to base chromatic scale
    const chromaticNotes = chromaticScaleNotes.value
    notesStore.noteArray = chromaticNotes.map((note) => ({
      pitch: note,
      spn: note,
      duration: 'q',
      noteColor: note === targetNote.value ? 'blue' : 'gray'
    }))
  } else {
    // Highlight the detected note in the chromatic scale
    const chromaticNotes = chromaticScaleNotes.value
    notesStore.noteArray = chromaticNotes.map((note) => ({
      pitch: note,
      spn: note,
      duration: 'q',
      noteColor: note === newDetectedNote ? 'green' : (note === targetNote.value ? 'blue' : 'gray')
    }))
  }
})

function toggleScaleDetection() {
  if (scaleDetectionRunning.value) {
    // Stop scale detection
    scaleDetectionRunning.value = false
    stopRunning()
  } else {
    // Start scale detection
    clearScaleLog()
    scaleDetectionRunning.value = true
    
    // Only start microphone if NOT in simulate mode
    if (!simulateMicrophoneMode.value) {
      // Start microphone if not already running
      setTimeout(() => {
        if (!running.value) {
          toggleRunning()
        }
      }, 100)
    } else {
      console.log('[Scale Detection] Simulate microphone mode enabled - skipping real microphone')
    }
  }
}

function clearScaleLog() {
  scaleLog.value = []
  lastDetectedNote.value = ''
  lastNoteTime.value = 0
  firstDetectedOctave.value = null
}

// Analysis helper functions
function getTuningErrorColor(error) {
  if (error === undefined) return 'text-gray-400'
  const absError = Math.abs(error)
  if (absError <= 25) return 'text-green-300' // ± 25¢ is excellent
  if (absError <= 50) return 'text-yellow-300' // ± 50¢ is good
  return 'text-red-300' // > 50¢ is poor
}

function getTuningStatus(error) {
  if (error === undefined) return '?'
  const absError = Math.abs(error)
  if (absError <= thresholdPerfect.value) return '✓ Perfect'
  if (absError <= thresholdGood.value) return '✓ Good'
  if (absError > thresholdWrong.value) return '⚠ Wrong'
  if (error < 0) return '♭ Flat'
  return '♯ Sharp'
}

// Computed properties for analysis
const detectedSequence = computed(() => {
  if (scaleLog.value.length === 0) return '---'
  return scaleLog.value.map(e => e.note.replace(/\d+/, '')).join(' ')
})

const expectedSequence = computed(() => {
  if (scaleLog.value.length === 0) return 'C D E F G A B C'
  // Return only the notes we're expecting to see (C major scale)
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
  return noteNames.join(' ')
})

const averageTuningError = computed(() => {
  if (scaleLog.value.length === 0) return 0
  const validErrors = scaleLog.value.filter(e => e.tuningError !== undefined).map(e => Math.abs(e.tuningError))
  if (validErrors.length === 0) return 0
  return validErrors.reduce((a, b) => a + b, 0) / validErrors.length
})

const accurateDetections = computed(() => {
  return scaleLog.value.filter(e => e.tuningError !== undefined && Math.abs(e.tuningError) <= 50).length
})

const holdPercentage = computed(() => {
  if (detectedNote.value === '') return 0
  return Math.min(100, (noteHoldTime.value / maxHoldTime.value) * 100)
})

const holdTimeDisplay = computed(() => {
  // Show countdown from 1.00s to 0.00s
  const remaining = Math.max(0, (maxHoldTime.value - noteHoldTime.value) / 1000)
  return remaining.toFixed(2) + 's'
})

const isNoteHeld = computed(() => {
  return noteHoldTime.value >= maxHoldTime.value && detectedNote.value !== ''
})

const expectedNextNote = computed(() => {
  // Show the NEXT expected note in the C major scale
  if (!scaleDetectionRunning.value) return null
  if (firstDetectedOctave.value === null) {
    // No notes detected yet, expect C at default octave
    return 'C4'
  }
  
  // C major scale note names
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
  const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11, 12]
  
  // Current index is based on how many notes we've logged
  const nextIndex = scaleLog.value.length
  const scaleDegree = nextIndex % 8
  const octaveOffset = Math.floor(nextIndex / 8)
  
  const expectedOctave = firstDetectedOctave.value + octaveOffset + (scaleDegree >= 7 ? 1 : 0)
  const nextNote = noteNames[scaleDegree] + expectedOctave
  
  return nextNote
})

// Update staff display when C major scale notes change
watch(cMajorScaleNotes, (notes) => {
  // Update the notesStore with the current scale state
  notesStore.noteArray = notes.map(note => ({
    pitch: note.n.pitch,
    duration: note.duration,
    color: note.color
  }))
}, { deep: true, immediate: true })

// Watch for when note is held in simulate mode and log it to scale
let lastLoggedNote = null
watch(isNoteHeld, (isHeld) => {
  if (isHeld && simulateMicrophoneMode.value && scaleDetectionRunning.value && detectedNote.value) {
    // Log the held note only once per hold (prevent duplicate entries)
    if (detectedNote.value !== lastLoggedNote) {
      lastLoggedNote = detectedNote.value
      
      // Use actual frequency to calculate MIDI (includes detune)
      const actualMidi = freqToMidi(detectedFreq.value)
      console.log(`[Scale Detection] Note held in simulate mode: ${detectedNote.value}, actualMidi=${actualMidi.toFixed(2)}, freq=${detectedFreq.value.toFixed(1)}Hz`)
      addNoteToScaleLog(actualMidi, detectedFreq.value, detectedNote.value)
    }
  } else if (!isHeld) {
    // Reset when note is no longer held
    lastLoggedNote = null
  }
})

// Cleanup
onBeforeUnmount(() => {
  stopRunning()
  if (virtualKeyboardHoldInterval) {
    clearInterval(virtualKeyboardHoldInterval)
    virtualKeyboardHoldInterval = null
  }
})
</script>

<style scoped>
/* Component styles if needed */
</style>
