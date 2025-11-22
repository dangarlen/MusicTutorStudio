<template>
  <div 
    class="virtual-keyboard bg-gradient-to-b from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg border border-gray-300"
    ref="keyboardContainer"
    tabindex="0"

  >
    <!-- Header Controls (Condensed) -->
    <div class="mb-3">
      <h3 class="font-bold text-base text-gray-800 mb-2 text-center">🎹 Virtual Piano Keyboard</h3>
      
      <!-- First Row: Range, Key, Stop All -->
      <div class="flex justify-center items-center gap-4 mb-2 flex-wrap">
        <span class="text-xs font-medium text-gray-600">Range: <span class="font-mono text-gray-700">C4-C6</span></span>
        <span class="text-xs text-gray-400">|</span>
        <span class="text-xs font-medium text-gray-600">Key:</span>
        <button 
          class="btn btn-xs"
          :class="keyboardKey === 'C' ? 'btn-primary' : 'btn-outline'"
          @click="keyboardKey = 'C'"
        >
          C
        </button>
        <button 
          class="btn btn-xs"
          :class="keyboardKey === 'instrument' ? 'btn-primary' : 'btn-outline'"
          @click="keyboardKey = 'instrument'"
        >
          {{ instrumentTransposition }}
        </button>
        <span class="text-xs text-gray-400">|</span>
        <button 
          class="btn btn-xs btn-error" 
          @click="stopAllNotes"
        >
          Stop All
        </button>
      </div>
      
      <!-- Second Row: Audio, Volume, Microphone Test -->
      <div class="flex justify-center items-center gap-4 mb-2 flex-wrap text-xs">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            v-model="audioEnabled" 
            class="toggle toggle-xs toggle-success"
          />
          <span class="font-medium text-gray-700">🔊 Audio</span>
        </label>
        <div v-if="audioEnabled" class="flex items-center gap-2">
          <span class="text-gray-500">Vol:</span>
          <input 
            type="range" 
            v-model="volume" 
            min="0" 
            max="100" 
            step="10" 
            class="range range-xs w-16"
          />
          <span class="text-gray-600">{{ volume }}%</span>
        </div>
        <label v-if="audioEnabled" class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            v-model="loopbackMode" 
            class="toggle toggle-xs toggle-warning" 
          />
          <span class="font-medium text-gray-700">🎤 Test</span>
          <div class="tooltip tooltip-bottom" data-tip="Plays audio through speakers for mic testing">
            <span class="material-symbols-outlined text-xs text-gray-500 cursor-help">help</span>
          </div>
        </label>
        <span class="text-xs text-gray-400">|</span>
        <div class="flex items-center gap-2">
          <button 
            class="text-xs font-medium cursor-pointer px-2 py-0.5 rounded transition-colors whitespace-nowrap"
            :class="detuneCents == 0 ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-green-50'"
            @click="detuneCents = 0"
            title="Click to reset to in-tune (0 cents)"
          >
            Tuning
          </button>
          <button 
            class="text-xs font-medium text-gray-600 hover:text-blue-600 cursor-pointer px-1"
            @click="detuneCents = Math.max(-100, detuneCents - 2)"
            title="Click to flatten by 2 cents"
          >
            ♭ Flat
          </button>
          <input 
            type="range" 
            v-model="detuneCents" 
            min="-100" 
            max="100" 
            step="1" 
            class="range range-xs w-32"
          />
          <button 
            class="text-xs font-medium text-gray-600 hover:text-blue-600 cursor-pointer px-1"
            @click="detuneCents = Math.min(100, parseInt(detuneCents) + 2)"
            title="Click to sharpen by 2 cents"
          >
            ♯ Sharp
          </button>
          <span class="text-xs font-mono" :class="detuneCents == 0 ? 'text-green-600 font-bold' : 'text-orange-600'">{{ detuneCents > 0 ? '+' : '' }}{{ detuneCents }}¢</span>
          <div class="tooltip tooltip-bottom" data-tip="Tuning Control: Click 'Tuning' to reset to 0¢ (in-tune). Click '♭ Flat' to lower pitch by 2¢. Click '♯ Sharp' to raise pitch by 2¢. Use slider for precise adjustment (-100¢ to +100¢). Perfect for testing tuning accuracy across a full semitone range.">
            <span class="material-symbols-outlined text-xs text-gray-500 cursor-help">help</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Piano Canvas -->
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
import { usePracticeUnitScaleStore } from '../stores/practiceUnitScaleStore'

const useStore = () => usePracticeUnitScaleStore()

const emit = defineEmits(['on-tone-start', 'on-tone-stop'])

const props = defineProps({
  onToneStart: Function,
  onToneStop: Function
})

const canvasRef = ref(null)
const keyboardContainer = ref(null)
const audioEnabled = ref(true)
const volume = ref(50)
const loopbackMode = ref(false)
const currentNote = ref('')
const currentFreq = ref(0)
const currentMidi = ref(null)
const pressedMidiNote = ref(null) // Track which key is currently pressed for visual feedback
const keyboardKey = ref('C') // 'C' or 'instrument'
const detuneCents = ref(0) // Detune in cents: -100 (flat) to +100 (sharp)

// Keyboard key display - computed to be reactive
const instrumentTransposition = computed(() => {
  const store = useStore()
  
  // Get instrument from either direct store.instrument or practiceUnitHeader
  const instrumentObj = store.instrument || store.practiceUnitHeader?.instrument
  if (!instrumentObj) {
    console.log('[VirtualKeyboard] No instrument object for display')
    return 'Key of [Instrument]'
  }
  
  // Get the instrument name
  const instrumentName = typeof instrumentObj === 'string' 
    ? instrumentObj 
    : instrumentObj.instrument
  
  // Find the instrument in the loaded instruments array
  const inst = store.instruments?.find(i => i.instrument === instrumentName)
  if (inst?.transposition) {
    const display = `Key of ${inst.transposition}`
    console.log(`[VirtualKeyboard] Display: ${display}`)
    return display
  }
  
  console.log(`[VirtualKeyboard] No transposition found for display`)
  return 'Key of [Instrument]'
})

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

function midiToNoteName(midiNote, preferFlats = false) {
  const sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  const notes = preferFlats ? flats : sharps
  const octaveNum = Math.floor(midiNote / 12) - 1
  const noteNum = midiNote % 12
  return notes[noteNum] + octaveNum
}

// Get transposition semitones for current instrument
function getInstrumentTranspositionSemitones() {
  if (keyboardKey.value !== 'instrument') return 0
  
  const store = useStore()
  
  // Get instrument from either direct store.instrument or practiceUnitHeader
  const instrumentObj = store.instrument || store.practiceUnitHeader?.instrument
  if (!instrumentObj) {
    console.log('[VirtualKeyboard] No instrument object found in store')
    return 0
  }
  
  // Get the instrument name - could be a string or an object with .instrument property
  const instrumentName = typeof instrumentObj === 'string' 
    ? instrumentObj 
    : instrumentObj.instrument
  
  if (!instrumentName) {
    console.log('[VirtualKeyboard] No instrument name found')
    return 0
  }
  
  // Find the instrument in the loaded instruments array
  const inst = store.instruments?.find(i => i.instrument === instrumentName)
  if (!inst?.transposition) {
    console.log(`[VirtualKeyboard] No transposition found for instrument: ${instrumentName}`)
    return 0
  }
  
  console.log(`[VirtualKeyboard] Found instrument: ${instrumentName}, transposition: ${inst.transposition}`)
  
  // Parse transposition (e.g., "Bb" = -2 semitones, "Eb" = -3, "F" = 5)
  const transpositionMap = {
    'C': 0,
    'Db': -1, 'D♭': -1,
    'D': 2,
    'Eb': -3, 'E♭': -3,
    'E': 4,
    'F': 5,
    'Gb': -6, 'G♭': -6,
    'G': 7,
    'Ab': -9, 'A♭': -9,
    'A': 9,
    'Bb': -2, 'B♭': -2,
    'B': 11
  }
  
  const semitones = transpositionMap[inst.transposition] || 0
  console.log(`[VirtualKeyboard] Transposition semitones for ${inst.transposition}: ${semitones}`)
  return semitones
}

// Initialize audio context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
}

// Play a note
function playNote(midi) {
  console.log(`[VirtualKeyboard] playNote called with midi=${midi}, audioEnabled=${audioEnabled.value}`)
  
  // Stop any existing note
  stopNote()
  
  // Apply transposition if "Key of [Instrument]" is selected
  const transpositionSemitones = getInstrumentTranspositionSemitones()
  const inputMidi = midi
  const playMidi = midi + transpositionSemitones
  
  console.log(`[VirtualKeyboard] playNote: keyboardKey=${keyboardKey.value}, inputMidi=${inputMidi}, transposition=${transpositionSemitones}, playMidi=${playMidi}`)
  
  let freq = midiToFreq(playMidi)
  
  // Apply detune from slider (range -50 to +50 cents)
  if (detuneCents.value !== 0) {
    freq = freq * Math.pow(2, detuneCents.value / 1200)
  }
  
  // Only play audio if enabled
  if (audioEnabled.value) {
    initAudio()
    
    oscillator = audioContext.createOscillator()
    gainNode = audioContext.createGain()
    
    oscillator.frequency.value = freq
    oscillator.type = 'sine'
    
    const gainValue = (volume.value / 100) * 0.3
    gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime)
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.start()
  }
  
  // Display the actual sounding pitch (playMidi), not the input fingering (inputMidi)
  // Use flat notation for transposed instruments
  const useFlats = keyboardKey.value === 'instrument'
  currentMidi.value = playMidi
  pressedMidiNote.value = midi // Track the input MIDI for visual feedback on the correct key
  currentNote.value = midiToNoteName(playMidi, useFlats)
  currentFreq.value = freq
  
  console.log(`[VirtualKeyboard] Emitting tone-start: displayMidi=${playMidi}, note=${currentNote.value}, freq=${freq}`)
  
  // Emit event for listeners (regardless of audio state)
  emit('on-tone-start', {
    midi: playMidi,
    frequency: freq,
    note: currentNote.value,
    loopbackMode: loopbackMode.value
  })
  
  if (props.onToneStart) {
    props.onToneStart({
      midi: playMidi,
      frequency: freq,
      note: currentNote.value,
      loopbackMode: loopbackMode.value
    })
  }
}

// Stop current note
function stopNote() {
  console.log(`[VirtualKeyboard] stopNote called, currentMidi=${currentMidi.value}`)
  
  if (oscillator) {
    try {
      oscillator.stop()
    } catch (e) {
      // Already stopped
    }
    oscillator = null
  }
  
  if (currentMidi.value !== null) {
    console.log(`[VirtualKeyboard] Emitting tone-stop: midi=${currentMidi.value}, note=${currentNote.value}`)
    
    // Emit event for listeners
    emit('on-tone-stop', {
      midi: currentMidi.value,
      note: currentNote.value
    })
    
    if (props.onToneStop) {
      props.onToneStop({
        midi: currentMidi.value,
        note: currentNote.value
      })
    }
  }
  
  currentMidi.value = null
  pressedMidiNote.value = null // Clear pressed state to redraw keys normally
  currentNote.value = ''
  currentFreq.value = 0
  
  // Redraw to remove highlight
  drawKeyboard()
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

  console.log(`[VirtualKeyboard] drawKeyboard called, pressedMidiNote=${pressedMidiNote.value}`)

  // Get device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1
  
  // Calculate canvas size for C4 to C6 (15 white keys: C-C6)
  const numWhiteKeys = 15
  const totalWidth = numWhiteKeys * KEY_WIDTH
  const displayWidth = totalWidth
  const displayHeight = KEY_HEIGHT
  
  // Set canvas display size
  canvas.style.width = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'
  
  // Set canvas resolution to match device pixel ratio
  canvas.width = displayWidth * dpr
  canvas.height = displayHeight * dpr
  
  // Scale context to device pixel ratio
  ctx.scale(dpr, dpr)

  // Draw white keys for C4 to C6 (2 full octaves + C)
  // Always start from octave 4, draw octaves 4 and 5, then just C from octave 6
  for (let octaveOffset = 0; octaveOffset < 2; octaveOffset++) {
    WHITE_KEYS.forEach((note, index) => {
      const whiteKeyIndex = octaveOffset * 7 + index
      const x = whiteKeyIndex * KEY_WIDTH
      const y = 0

      // Check if this key is pressed
      const midi = noteNameToMidi(note, 4 + octaveOffset)
      const isPressed = pressedMidiNote.value === midi
      
      if (isPressed) {
        console.log(`[VirtualKeyboard] WHITE KEY MATCH: ${note}${4 + octaveOffset} midi=${midi}, pressedMidiNote=${pressedMidiNote.value}`)
      }

      ctx.fillStyle = isPressed ? '#ADD8E6' : '#FFFFFF' // Light blue if pressed, white otherwise
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.fillRect(x, y, KEY_WIDTH, KEY_HEIGHT)
      ctx.strokeRect(x, y, KEY_WIDTH, KEY_HEIGHT)

      // Add note label
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(note + (4 + octaveOffset), x + KEY_WIDTH / 2, KEY_HEIGHT - 8)

      // Store white key rect
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
  
  // Add the final C6
  const finalCIndex = 14
  const finalCX = finalCIndex * KEY_WIDTH
  const c6Midi = noteNameToMidi('C', 6)
  const c6IsPressed = pressedMidiNote.value === c6Midi
  
  if (c6IsPressed) {
    console.log(`[VirtualKeyboard] C6 KEY MATCH: midi=${c6Midi}, pressedMidiNote=${pressedMidiNote.value}`)
  }
  
  ctx.fillStyle = c6IsPressed ? '#ADD8E6' : '#FFFFFF' // Light blue if pressed
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.fillRect(finalCX, 0, KEY_WIDTH, KEY_HEIGHT)
  ctx.strokeRect(finalCX, 0, KEY_WIDTH, KEY_HEIGHT)
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('C6', finalCX + KEY_WIDTH / 2, KEY_HEIGHT - 8)
  keyRects.push({
    x: finalCX,
    y: 0,
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    midi: c6Midi,
    note: 'C',
    isBlack: false
  })

  // Draw black keys for C4 to C6
  for (let octaveOffset = 0; octaveOffset < 2; octaveOffset++) {
    BLACK_KEYS.forEach((blackKey) => {
      const whiteKeyIndex = octaveOffset * 7 + blackKey.whiteKeyIndex
      const x = (whiteKeyIndex + 1) * KEY_WIDTH  // Center on border between white keys
      const y = 0

      // Store black key rect - use hardcoded octave (4+octaveOffset)
      const midi = noteNameToMidi(WHITE_KEYS[blackKey.whiteKeyIndex], 4 + octaveOffset) + 1
      const isPressed = pressedMidiNote.value === midi
      
      if (isPressed) {
        console.log(`[VirtualKeyboard] BLACK KEY MATCH: ${WHITE_KEYS[blackKey.whiteKeyIndex]}#${4 + octaveOffset} midi=${midi}, pressedMidiNote=${pressedMidiNote.value}`)
      }

      ctx.fillStyle = isPressed ? '#FFD700' : '#000000' // Gold/yellow if pressed, black otherwise
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.fillRect(x - BLACK_KEY_WIDTH / 2, y, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT)
      ctx.strokeRect(x - BLACK_KEY_WIDTH / 2, y, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT)

      // Add note label
      ctx.fillStyle = isPressed ? '#000000' : '#FFFFFF' // Black text if pressed (so it shows on yellow), white otherwise
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      const sharpNote = WHITE_KEYS[blackKey.whiteKeyIndex] + '#'
      ctx.fillText(sharpNote, x, BLACK_KEY_HEIGHT - 4)

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

// Keyboard shortcuts disabled - users click keys to play

// Keyboard handling disabled

// Key up handling disabled

// Watch for key press changes to redraw keyboard with visual feedback
// Use flush: 'sync' to redraw immediately when pressedMidiNote changes
watch(pressedMidiNote, () => {
  console.log(`[VirtualKeyboard] Watch fired: pressedMidiNote=${pressedMidiNote.value}`)
  drawKeyboard()
}, { flush: 'sync' })

// Initialize on mount
onMounted(() => {
  console.log(`[VirtualKeyboard] Mounted, setting up keyboard handling`)
  drawKeyboard()
  window.addEventListener('resize', drawKeyboard)
  
  // Keyboard shortcuts disabled
  
  // Cleanup on unmount
  return () => {
    console.log(`[VirtualKeyboard] Unmounting`)
    window.removeEventListener('resize', drawKeyboard)
  }
})
</script>

<style scoped>
.virtual-keyboard {
  width: 100%;
}

canvas {
  display: block;
  margin: 0 auto;
  /* Let the canvas size be determined by the width/height attributes set in JavaScript */
  /* Do NOT scale or stretch the canvas */
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
</style>
