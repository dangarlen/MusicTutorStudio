<template>
  <div class="virtual-keyboard bg-gradient-to-b from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg border border-gray-300">
    <!-- Header Controls -->
    <div class="mb-4">
      <h3 class="font-bold text-base text-gray-800 mb-3 text-center">🎹 Virtual Piano Keyboard</h3>
      
      <!-- Octave Controls -->
      <div class="flex justify-center items-center gap-3 mb-3">
        <span class="text-sm font-medium text-gray-600">Octave:</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="octave = Math.max(0, octave - 1)"
          :disabled="octave <= 0"
        >
          −
        </button>
        <span class="text-lg font-bold font-mono text-gray-800 w-8 text-center">{{ octave }}</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="octave = Math.min(8, octave + 1)"
          :disabled="octave >= 8"
        >
          +
        </button>
        <button 
          class="btn btn-sm btn-error ml-4" 
          @click="stopAllNotes"
        >
          Stop All
        </button>
      </div>

      <!-- Audio Playback Control -->
      <div class="flex justify-center items-center gap-3 mb-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            v-model="audioEnabled" 
            class="toggle toggle-success toggle-sm"
          />
          <span class="text-sm font-medium text-gray-700">
            🔊 Play Audio
          </span>
        </label>
        <div v-if="audioEnabled" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Volume:</span>
          <input 
            type="range" 
            v-model="volume" 
            min="0" 
            max="100" 
            step="10" 
            class="range range-xs w-20"
          />
          <span class="text-xs text-gray-600">{{ volume }}%</span>
        </div>
      </div>

      <div class="text-xs text-center text-gray-500 mb-2">
        Click a key to hear the piano sound
      </div>

      <!-- Loopback Testing Mode -->
      <div v-if="audioEnabled" class="flex justify-center items-center gap-3 mb-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            v-model="loopbackMode" 
            class="toggle toggle-warning toggle-sm" 
          />
          <span class="text-sm font-medium text-gray-700">
            🎤 Test with Microphone
          </span>
        </label>
        <div class="tooltip tooltip-bottom" data-tip="Plays audio through speakers so you can test microphone detection">
          <span class="material-symbols-outlined text-xs text-gray-500 cursor-help">help</span>
        </div>
      </div>
      <div v-if="audioEnabled && loopbackMode" class="alert alert-warning mb-3 py-2">
        <span class="material-symbols-outlined text-sm">warning</span>
        <div class="text-xs space-y-1">
          <div>
            <strong>Mic Testing Mode:</strong> Audio plays through speakers - start microphone to detect it.
          </div>
          <div class="opacity-75">
            <strong>Note:</strong> No internal audio routing. Your microphone must physically detect sound from your speakers.
          </div>
        </div>
      </div>
    </div>

    <!-- Canvas Keyboard -->
    <div class="flex justify-center w-full">
      <canvas 
        ref="canvasRef"
        class="border-2 border-gray-400 rounded-lg bg-gray-50 cursor-pointer"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @mouseleave="handleCanvasMouseLeave"
      />
    </div>

    <!-- Current Note Display -->
    <div class="mt-4 text-center">
      <div v-if="currentNote" class="text-lg font-bold text-blue-600">
        🎵 {{ currentNote }} ({{ currentFreq.toFixed(2) }} Hz)
      </div>
      <div v-else class="text-sm text-gray-400">
        Click a key to start
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  onToneStart: Function,
  onToneStop: Function,
  initialOctave: {
    type: Number,
    default: 4
  }
})

const canvasRef = ref(null)
const octave = ref(props.initialOctave)
const audioEnabled = ref(true)
const volume = ref(50)
const loopbackMode = ref(false)
const currentNote = ref('')
const currentFreq = ref(0)
const currentMidi = ref(null)

// Audio context
let audioContext = null
let oscillator = null
let gainNode = null

// Keyboard layout
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
// Black keys: between C-D, D-E, F-G, G-A, A-B (no black key between E-F or B-C)
const BLACK_KEYS = [
  { whiteKeyIndex: 0, offset: 0.5 }, // C#
  { whiteKeyIndex: 1, offset: 0.5 }, // D#
  { whiteKeyIndex: 3, offset: 0.5 }, // F#
  { whiteKeyIndex: 4, offset: 0.5 }, // G#
  { whiteKeyIndex: 5, offset: 0.5 }  // A#
]
const KEY_WIDTH = 60
const KEY_HEIGHT = 200
const BLACK_KEY_WIDTH = 36
const BLACK_KEY_HEIGHT = 130

let keyRects = [] // Will store key rectangles and their note info

// MIDI conversion functions
function noteNameToMidi(noteName, octaveNum) {
  const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }
  return (octaveNum + 1) * 12 + noteMap[noteName]
}

function midiToFreq(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

function midiToNoteName(midiNote) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaveNum = Math.floor(midiNote / 12) - 1
  const noteNum = midiNote % 12
  return notes[noteNum] + octaveNum
}

// Initialize audio context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
}

// Play a note
function playNote(midi) {
  if (!audioEnabled.value) return

  initAudio()
  
  // Stop any existing note
  stopNote()
  
  const freq = midiToFreq(midi)
  
  oscillator = audioContext.createOscillator()
  gainNode = audioContext.createGain()
  
  oscillator.frequency.value = freq
  oscillator.type = 'sine'
  
  const gainValue = (volume.value / 100) * 0.3
  gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime)
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.start()
  
  currentMidi.value = midi
  currentNote.value = midiToNoteName(midi)
  currentFreq.value = freq
  
  if (props.onToneStart) {
    props.onToneStart({
      midi,
      frequency: freq,
      note: currentNote.value,
      loopbackMode: loopbackMode.value
    })
  }
}

// Stop current note
function stopNote() {
  if (oscillator) {
    try {
      oscillator.stop()
    } catch (e) {
      // Already stopped
    }
    oscillator = null
  }
  
  if (currentMidi.value !== null && props.onToneStop) {
    props.onToneStop({
      midi: currentMidi.value,
      note: currentNote.value
    })
  }
  
  currentMidi.value = null
  currentNote.value = ''
  currentFreq.value = 0
}

// Stop all notes
function stopAllNotes() {
  stopNote()
}

// Draw keyboard
function drawKeyboard() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  keyRects = []

  // Calculate canvas size for 2 octaves (14 white keys)
  const numWhiteKeys = 14
  const totalWidth = numWhiteKeys * KEY_WIDTH
  canvas.width = totalWidth
  canvas.height = KEY_HEIGHT

  // Draw white keys for 2 octaves
  for (let octaveOffset = 0; octaveOffset < 2; octaveOffset++) {
    WHITE_KEYS.forEach((note, index) => {
      const whiteKeyIndex = octaveOffset * 7 + index
      const x = whiteKeyIndex * KEY_WIDTH
      const y = 0

      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.fillRect(x, y, KEY_WIDTH, KEY_HEIGHT)
      ctx.strokeRect(x, y, KEY_WIDTH, KEY_HEIGHT)

      // Add note label
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(note + (octave.value + octaveOffset), x + KEY_WIDTH / 2, KEY_HEIGHT - 8)

      // Store white key rect
      const midi = noteNameToMidi(note, octave.value + octaveOffset)
      keyRects.push({
        x,
        y,
        width: KEY_WIDTH,
        height: KEY_HEIGHT,
        midi,
        note,
        isBlack: false
      })
    })
  }

  // Draw black keys for 2 octaves
  for (let octaveOffset = 0; octaveOffset < 2; octaveOffset++) {
    BLACK_KEYS.forEach((blackKey) => {
      const whiteKeyIndex = octaveOffset * 7 + blackKey.whiteKeyIndex
      const x = (whiteKeyIndex + 1) * KEY_WIDTH  // Center on border between white keys
      const y = 0

      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.fillRect(x - BLACK_KEY_WIDTH / 2, y, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT)
      ctx.strokeRect(x - BLACK_KEY_WIDTH / 2, y, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT)

      // Add note label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      const sharpNote = WHITE_KEYS[blackKey.whiteKeyIndex] + '#'
      ctx.fillText(sharpNote, x, BLACK_KEY_HEIGHT - 4)

      // Store black key rect
      const midi = noteNameToMidi(WHITE_KEYS[blackKey.whiteKeyIndex], octave.value + octaveOffset) + 1
      keyRects.push({
        x: x - BLACK_KEY_WIDTH / 2,
        y,
        width: BLACK_KEY_WIDTH,
        height: BLACK_KEY_HEIGHT,
        midi,
        note: sharpNote,
        isBlack: true
      })
    })
  }
}

// Get key at position
function getKeyAtPosition(x, y) {
  // Check black keys first (they're on top)
  for (const rect of keyRects) {
    if (rect.isBlack && x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height) {
      return rect
    }
  }
  // Then check white keys
  for (const rect of keyRects) {
    if (!rect.isBlack && x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height) {
      return rect
    }
  }
  return null
}

// Canvas mouse handlers
function handleCanvasMouseDown(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const key = getKeyAtPosition(x, y)
  if (key) {
    playNote(key.midi)
  }
}

function handleCanvasMouseMove(e) {
  const canvas = canvasRef.value
  canvas.style.cursor = 'pointer'
}

function handleCanvasMouseUp() {
  stopNote()
}

function handleCanvasMouseLeave() {
  stopNote()
}

// Watch octave changes
watch(octave, () => {
  drawKeyboard()
})

// Initialize on mount
onMounted(() => {
  drawKeyboard()
  window.addEventListener('resize', drawKeyboard)
})
</script>

<style scoped>
.virtual-keyboard {
  width: 100%;
}

canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}
</style>
