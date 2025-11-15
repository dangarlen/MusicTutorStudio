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
        <!-- Live Tuner Collapse -->
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" checked />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>🎤 Live Tuner</span>
            <span v-if="running" class="badge badge-success">Listening</span>
          </div>
          <div class="collapse-content px-4 pb-4">
            <div v-if="inputMode === 'instrument'" class="space-y-3">
              <div class="text-sm text-gray-700 mb-3">
                Using microphone input for {{ currentInstrumentName }} (microphone permission required)
              </div>
              <button
                class="btn btn-lg w-full"
                :class="running ? 'btn-error' : 'btn-primary'"
                @click="toggleRunning"
              >
                <span class="material-symbols-outlined mr-2">{{ running ? 'mic_off' : 'mic' }}</span>
                {{ running ? 'Stop Microphone' : 'Start Microphone' }}
              </button>
              <div v-if="!running" class="text-xs text-center text-gray-500 mt-2">
                <button class="link link-primary" @click="showPermissionHelp = !showPermissionHelp">
                  Permission Help
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 py-4 text-center">
              Switch to microphone input above to start tuning practice.
            </div>
          </div>
        </div>

        <!-- Scale Detection Debug Collapse -->
        <div class="collapse collapse-arrow bg-yellow-50 border border-yellow-300 mb-4 rounded-xl hidden">
          <input type="checkbox" class="peer" />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>🎼 Scale Detection Debug</span>
            <span v-if="scaleDetectionRunning" class="badge badge-warning">Recording</span>
          </div>
          <div class="collapse-content px-4 pb-4">
            <div class="space-y-3">
              <div class="text-sm text-gray-700">
                Play a C major scale starting with C4. Each note will be logged with frequency, MIDI value, and converted note.
              </div>
              <button
                class="btn btn-lg w-full"
                :class="scaleDetectionRunning ? 'btn-error' : 'btn-warning'"
                @click="toggleScaleDetection"
              >
                <span class="material-symbols-outlined mr-2">{{ scaleDetectionRunning ? 'stop' : 'play_arrow' }}</span>
                {{ scaleDetectionRunning ? 'Stop Scale Detection' : 'Start Scale Detection' }}
              </button>
              
              <div class="mt-4 p-3 bg-gray-900 text-gray-100 rounded font-mono text-xs max-h-64 overflow-y-auto">
                <div v-if="scaleLog.length === 0" class="text-gray-500">
                  Logs will appear here as notes are detected...
                </div>
                <div v-for="(entry, idx) in scaleLog" :key="idx" class="mb-2 pb-1 border-b border-gray-700">
                  <div>
                    <span class="text-blue-300">{{ entry.time }}</span>
                    <span class="text-green-300 mx-2 font-bold">{{ entry.note }}</span>
                    <span class="text-yellow-300">{{ entry.freq.toFixed(1) }}Hz</span>
                  </div>
                  <div class="text-gray-400 ml-2">
                    MIDI: {{ entry.midi.toFixed(2) }} | Rounded: {{ entry.midiRounded }} | Oct: {{ entry.octave }} | Note Idx: {{ entry.noteIdx }}
                  </div>
                </div>
              </div>
              
              <button class="btn btn-sm btn-ghost w-full" @click="clearScaleLog">
                Clear Log
              </button>
            </div>
          </div>
        </div>

        <!-- Virtual Keyboard Collapse -->
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" :checked="inputMode === 'virtual-keyboard'" />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
            🎹 Virtual Keyboard
          </div>
          <div class="collapse-content px-4 pb-4">
            <div v-if="inputMode === 'virtual-keyboard'" class="space-y-3">
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
            <div v-else class="text-sm text-gray-500 py-4 text-center">
              Switch to virtual keyboard input above to use the on-screen piano.
            </div>
          </div>
        </div>

        <!-- Chromatic Scale + Tuning Meter + Detected Note Collapse -->
        <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl">
          <input type="checkbox" class="peer" checked />
          <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center">
            <span>🎵 Tuning Display</span>
          </div>
          <div class="collapse-content px-4 pb-4 space-y-6">
            <!-- Detected Note Display -->
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="text-center">
                <div class="text-sm text-gray-600 mb-2 font-medium">Detected Note</div>
                <div class="text-5xl font-bold text-gray-800 mb-2">{{ detectedNote || '--' }}</div>
                <div class="text-sm text-gray-600">{{ formatFreq(detectedFreq) }} Hz</div>
              </div>
              <div class="text-xs text-gray-500 text-center mt-2">
                <span v-if="inputMode === 'instrument' && running">🎤 Live microphone input</span>
                <span v-else-if="inputMode === 'virtual-keyboard'">🎹 Virtual keyboard input</span>
                <span v-else-if="inputMode === 'instrument' && !running">Start microphone to see live input</span>
                <span v-else>No input active</span>
              </div>
            </div>

            <!-- Tuning Meter -->
            <div>
              <div class="text-sm text-gray-600 mb-3 font-medium text-center">Tuning Meter</div>
              <div class="flex flex-col items-center gap-2">
                <svg width="200" height="120" viewBox="0 0 200 120" class="drop-shadow-md">
                  <!-- Background gradient -->
                  <defs>
                    <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.2" />
                      <stop offset="50%" style="stop-color:#22c55e;stop-opacity:0.3" />
                      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.2" />
                    </linearGradient>
                  </defs>
                  
                  <!-- Semicircle background -->
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#meterGradient)" stroke-width="20" stroke-linecap="round"/>
                  
                  <!-- Tick marks -->
                  <g stroke="#999" stroke-width="2">
                    <!-- Left tick (flat) -->
                    <line x1="25" y1="95" x2="25" y2="105"/>
                    <!-- Center tick (in tune) -->
                    <line x1="100" y1="90" x2="100" y2="105"/>
                    <!-- Right tick (sharp) -->
                    <line x1="175" y1="95" x2="175" y2="105"/>
                  </g>
                  
                  <!-- Labels -->
                  <text x="25" y="115" text-anchor="middle" font-size="10" fill="#3b82f6" font-weight="bold">♭ Flat</text>
                  <text x="100" y="115" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="bold">In Tune</text>
                  <text x="175" y="115" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="bold">Sharp ♯</text>
                  
                  <!-- Needle -->
                  <line 
                    x1="100" y1="100" 
                    :x2="`${100 + Math.cos((getTuningNeedleAngle() - 90) * Math.PI / 180) * 60}`"
                    :y2="`${100 - Math.sin((getTuningNeedleAngle() - 90) * Math.PI / 180) * 60}`"
                    stroke="#000" stroke-width="3" stroke-linecap="round"
                  />
                  
                  <!-- Center knob -->
                  <circle cx="100" cy="100" r="6" fill="#000"/>
                </svg>
                <div class="text-center text-sm font-semibold text-gray-700">{{ centsDisplay() }}</div>
              </div>
            </div>

            <!-- Chromatic Scale Display -->
            <div>
              <div class="text-sm text-gray-600 mb-3 font-medium">Chromatic Scale (Target: {{ targetNote }})</div>
              <div class="flex flex-wrap gap-2 bg-white p-4 rounded-lg border border-gray-200">
                <button
                  v-for="note in chromaticScaleNotes"
                  :key="note"
                  class="px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                  :class="note === highlightedNote 
                    ? 'bg-green-500 text-white ring-2 ring-green-600 scale-110' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ note }}
                </button>
              </div>
            </div>

            <!-- Staff Display (Optional) -->
            <details class="border-t pt-4">
              <summary class="cursor-pointer font-medium text-gray-700">Show Staff</summary>
              <div class="mt-3">
                <StaffPreview
                  :practice-overlay-mode="'pitch'"
                  :practice-overlay-tooltip-only="false"
                  :practice-enable-click-to-cycle="false"
                  :practice-color-cycle="['blue']"
                />
              </div>
            </details>
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

// Scale detection debug state
const scaleDetectionRunning = ref(false)
const scaleLog = ref([])
const lastDetectedNote = ref('')
const lastNoteTime = ref(0)

// Audio
let audioCtx = null
let mediaStream = null
let processor = null
let oscillator = null
let gainNode = null
const frequencyHistory = [] // Smooth pitch detection by averaging recent frequencies
const MAX_HISTORY = 8 // Number of recent frequency samples to average

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
  }
}

function stopRunning() {
  running.value = false
  frequencyHistory.length = 0 // Clear frequency history
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
  if (freq > 0 && freq > 40 && freq < 8000) {
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
    detectedNote.value = noteName
    cents.value = (midi - nearest) * 100
    
    // Log for scale detection if enabled
    if (scaleDetectionRunning.value) {
      const now = Date.now()
      // Only log if note changed or enough time has passed (avoid duplicate logs)
      if (noteName !== lastDetectedNote.value || now - lastNoteTime.value > 300) {
        lastDetectedNote.value = noteName
        lastNoteTime.value = now
        
        const time = new Date().toLocaleTimeString()
        
        // Calculate octave and note index for debugging
        const octave = Math.floor(nearest / 12) - 1
        const noteIdx = ((nearest % 12) + 12) % 12
        
        scaleLog.value.push({
          time,
          note: noteName,
          freq: smoothedFreq,
          midi: midi,
          midiRounded: nearest,
          octave: octave,
          noteIdx: noteIdx
        })
        
        // Keep log from getting too long
        if (scaleLog.value.length > 50) {
          scaleLog.value.shift()
        }
      }
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

function handleVirtualKeyboardTone(data) {
  if (!data || !data.midi) return
  const midi = data.midi
  const freq = data.frequency
  
  detectedFreq.value = freq
  
  // For a tuner, show the actual note being played (no transposition)
  detectedNote.value = midiToNote(midi)
  const nearest = Math.round(midi)
  cents.value = (midi - nearest) * 100
}

function stopVirtualKeyboardTone(data) {
  detectedNote.value = ''
  detectedFreq.value = 0
  cents.value = 0
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
    selectInputMethod('instrument')
    // Delay to ensure input method is set
    setTimeout(() => {
      toggleRunning()
    }, 100)
  }
}

function clearScaleLog() {
  scaleLog.value = []
  lastDetectedNote.value = ''
  lastNoteTime.value = 0
}

// Cleanup
onBeforeUnmount(() => {
  stopRunning()
})
</script>

<style scoped>
/* Component styles if needed */
</style>
