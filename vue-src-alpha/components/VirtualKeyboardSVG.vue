<template>
  <div class="virtual-keyboard-svg bg-gradient-to-b from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg border border-gray-300">
    <!-- Header Controls -->
    <div class="mb-4">
      <h3 class="font-bold text-base text-gray-800 mb-3 text-center">🎹 Virtual Piano Keyboard</h3>
      
      <!-- Octave Controls -->
      <div class="flex justify-center items-center gap-3 mb-3">
        <span class="text-sm font-medium text-gray-600">Octave:</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="changeOctave(-1)"
          :disabled="startOctave <= 2"
        >
          −
        </button>
        <span class="text-lg font-bold font-mono text-gray-800 w-8 text-center">{{ startOctave }}</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="changeOctave(1)"
          :disabled="startOctave >= 6"
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
            @change="onAudioToggle"
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
      
      <!-- Test Audio Button -->
      <button 
        v-if="audioEnabled"
        class="btn btn-xs btn-outline w-full mb-2" 
        @click="testAudio"
      >
        🔊 Test Audio (440Hz)
      </button>
      
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
      
      <!-- Pitch Adjustment Controls -->
      <div class="bg-white p-3 rounded-lg border border-gray-300 mb-3">
        <div class="text-sm font-medium text-gray-700 mb-2 text-center">Pitch Adjustment (for testing tuning)</div>
        
        <!-- Tuning Mode Selection -->
        <div class="flex justify-center gap-4 mb-2">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="tuningMode" value="flat" class="radio radio-xs radio-error" />
            <span class="text-xs text-red-600 font-medium">♭ Flat</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="tuningMode" value="in-tune" class="radio radio-xs radio-success" />
            <span class="text-xs text-green-600 font-medium">♮ In-Tune</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="tuningMode" value="sharp" class="radio radio-xs radio-warning" />
            <span class="text-xs text-orange-600 font-medium">♯ Sharp</span>
          </label>
        </div>
        
        <!-- Cents Adjustment Slider -->
        <div v-if="tuningMode !== 'in-tune'" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ tuningMode === 'flat' ? '-' : '+' }}</span>
          <input 
            type="range" 
            v-model="centsOffset" 
            min="5" 
            max="50" 
            step="5" 
            class="range range-xs flex-1"
            :class="tuningMode === 'flat' ? 'range-error' : 'range-warning'"
          />
          <span class="text-xs font-mono text-gray-700 w-8">{{ centsOffset }}¢</span>
        </div>
        
        <!-- Current Adjustment Display -->
        <div class="text-center mt-1">
          <span class="text-xs text-gray-600">
            Current offset: {{ currentPitchOffset }} cents
          </span>
        </div>
      </div>
    </div>
    
    <!-- Piano SVG Container -->
    <div ref="pianoContainer" class="piano-svg-wrapper flex justify-center mb-4"></div>
    
    <!-- Current tone display -->
    <div class="mt-4 text-center">
      <div class="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block">
        <div v-if="currentTone" class="text-sm">
          <div class="font-bold text-lg">{{ currentTone }}</div>
          <div class="text-xs text-gray-300">
            {{ currentFreq?.toFixed(1) }} Hz 
            <span v-if="currentPitchOffset !== 0" 
                  :class="currentPitchOffset > 0 ? 'text-orange-300' : 'text-red-300'">
              ({{ currentPitchOffset > 0 ? '+' : '' }}{{ currentPitchOffset }}¢)
            </span>
          </div>
        </div>
        <div v-else class="text-sm text-gray-400">
          Press a key to play
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import PianoSVG from 'pianosvg'

// Props
const props = defineProps({
  onToneStart: {
    type: Function,
    default: () => {}
  },
  onToneStop: {
    type: Function,
    default: () => {}
  },
  initialOctave: {
    type: Number,
    default: 4
  }
})

// Refs
const pianoContainer = ref(null)
let pianoSvg = null
let keyStates = new Uint8Array(128) // MIDI keys 0-127

// State
const startOctave = ref(props.initialOctave)
const audioEnabled = ref(false)
const volume = ref(50)
const loopbackMode = ref(false)
const tuningMode = ref('in-tune')
const centsOffset = ref(20)
const currentTone = ref(null)
const currentFreq = ref(null)
const activeKeyMidi = ref(null)

// Audio context
let audioContext = null
let currentOscillator = null
let currentGain = null

// Computed
const currentPitchOffset = computed(() => {
  if (tuningMode.value === 'in-tune') return 0
  const offset = centsOffset.value
  return tuningMode.value === 'flat' ? -offset : offset
})

const adjustedFreq = computed(() => {
  if (!currentFreq.value) return null
  const centsFactor = Math.pow(2, currentPitchOffset.value / 1200)
  return currentFreq.value * centsFactor
})

// Utility functions
const midiToFreq = (midi) => {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

const midiToNoteName = (midi) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const note = notes[midi % 12]
  return `${note}/${octave}`
}

// Piano rendering
const renderPiano = () => {
  console.log('[Piano] renderPiano called, container:', pianoContainer.value ? 'exists' : 'null')
  if (!pianoContainer.value) {
    console.warn('[Piano] Piano container not found!')
    return
  }
  
  // Clear previous
  pianoContainer.value.innerHTML = ''
  console.log('[Piano] Container cleared, creating pianosvg...')
  
  // Create pianosvg instance with larger key dimensions
  pianoSvg = PianoSVG({
    classRoot: 'piano-svg',
    classWKey: 'piano-white-key',
    classBKey: 'piano-black-key',
    classWGroup: 'piano-white-group',
    classBGroup: 'piano-black-group',
    classActive: 'piano-key-active'
  })
  
  // Render visible keys for current octave (1 octave = 12 semitones)
  // MIDI calculation: octave 4 should start at C4 (MIDI 60)
  // Since midiToNoteName uses: octave = floor(midi/12) - 1, then midi = (octave + 1) * 12
  const startMidi = (startOctave.value + 1) * 12 // Start from C of current octave
  const endMidi = startMidi + 12 // 1 octave = 12 semitones (C to B)
  
  pianoSvg.render({
    keys: keyStates.slice(startMidi, endMidi + 1),
    wWidth: 250,   // White key width (very large)
    wHeight: 1000, // White key height (very large)
    bWidth: 145,   // Black key width (proportional)
    bHeight: 650   // Black key height (proportional)
  })
  
  console.log('[Piano] SVG rendered, appending to container...')
  console.log('[Piano] Container width:', pianoContainer.value?.offsetWidth, 'parent width:', pianoContainer.value?.parentElement?.offsetWidth)
  
  // Append to container
  pianoContainer.value.appendChild(pianoSvg.element)
  
  // Calculate viewBox dimensions based on render size
  // 7 white keys × 250px = 1750px wide, 1000px tall
  const svgWidth = 250 * 7
  const svgHeight = 1000
  
  // Use viewBox - let it scale proportionally to fit container
  pianoSvg.element.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
  pianoSvg.element.setAttribute('width', '100%')
  pianoSvg.element.removeAttribute('height')
  pianoSvg.element.style.width = '100%'
  pianoSvg.element.style.height = 'auto'
  pianoSvg.element.style.maxWidth = 'none'
  
  console.log('[Piano] SVG viewBox:', svgWidth, '×', svgHeight, '- scales proportionally')
  
  // Add event listeners and labels to keys
  const keyElements = pianoSvg.element.querySelectorAll('rect[data-noteid]')
  keyElements.forEach((keyEl, index) => {
    // pianosvg gives data-noteid based on position in the rendered slice (0-23)
    // We need to map this to the actual MIDI note
    const actualMidiId = startMidi + index // Map visual position to actual MIDI note
    
    // Add note label with correct MIDI
    addKeyLabel(actualMidiId, keyEl, pianoSvg.element)
    
    keyEl.addEventListener('mousedown', () => playNote(actualMidiId))
    keyEl.addEventListener('mouseup', () => stopNote(actualMidiId))
    keyEl.addEventListener('mouseleave', () => stopNote(actualMidiId))
    keyEl.addEventListener('touchstart', (e) => {
      e.preventDefault()
      playNote(actualMidiId)
    })
    keyEl.addEventListener('touchend', (e) => {
      e.preventDefault()
      stopNote(actualMidiId)
    })
  })
}

const addKeyLabel = (midiId, keyEl, svgElement) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midiId / 12) - 1
  const noteName = notes[midiId % 12]
  const label = `${noteName}${octave}`
  
  // Get key position
  const x = parseFloat(keyEl.getAttribute('x'))
  const y = parseFloat(keyEl.getAttribute('y'))
  const width = parseFloat(keyEl.getAttribute('width'))
  const height = parseFloat(keyEl.getAttribute('height'))
  
  // Create text element for label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.setAttribute('x', x + width / 2)
  text.setAttribute('y', y + height - 10) // Position near bottom
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('font-size', noteName.includes('#') ? '10' : '11')
  text.setAttribute('font-weight', 'bold')
  text.setAttribute('fill', noteName.includes('#') ? '#fff' : '#333')
  text.setAttribute('pointer-events', 'none')
  text.setAttribute('user-select', 'none')
  text.textContent = label
  
  svgElement.appendChild(text)
}

// Audio functions
const onAudioToggle = () => {
  console.log('[Audio] Toggle clicked, audioEnabled:', audioEnabled.value)
  
  if (audioEnabled.value) {
    // Initialize audio context on enable
    if (!audioContext) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        audioContext = new AudioContextClass()
        console.log('[Audio] ✓ AudioContext created, state:', audioContext.state)
        
        // Try to resume immediately
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('[Audio] ✓ Context resumed')
          }).catch(err => {
            console.error('[Audio] Failed to resume:', err)
          })
        }
      } catch (err) {
        console.error('[Audio] ✗ Failed to create AudioContext:', err.message)
        audioEnabled.value = false
        return
      }
    } else {
      console.log('[Audio] Context already exists, state:', audioContext.state)
      // Try to resume if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('[Audio] ✓ Context resumed')
        }).catch(err => {
          console.error('[Audio] Failed to resume:', err)
        })
      }
    }
    console.log('[Audio] ✓ Audio enabled')
  } else {
    console.log('[Audio] Audio disabled')
    stopAllNotes()
  }
}

const playNote = (midiId) => {
  console.log(`[Piano] Playing MIDI ${midiId}`)
  
  activeKeyMidi.value = midiId
  const noteName = midiToNoteName(midiId)
  currentTone.value = noteName
  const baseFreq = midiToFreq(midiId)
  currentFreq.value = baseFreq
  
  // Update piano display
  keyStates[midiId] = 2 // Active state
  updatePianoDisplay(midiId)
  
  // Call parent callback for pitch detection
  props.onToneStart({
    midi: midiId,
    frequency: baseFreq,
    note: noteName,
    loopback: loopbackMode.value
  })
  
  // Play audio if enabled
  if (audioEnabled.value) {
    playAudioTone(baseFreq)
  }
}

const stopNote = (midiId) => {
  console.log(`[Piano] Stopped MIDI ${midiId}`)
  
  if (activeKeyMidi.value === midiId) {
    activeKeyMidi.value = null
    currentTone.value = null
    currentFreq.value = null
  }
  
  // Update piano display
  keyStates[midiId] = 1 // Normal state
  updatePianoDisplay(midiId)
  
  // Stop audio
  if (audioEnabled.value) {
    stopAudioTone()
  }
  
  props.onToneStop({ midi: midiId })
}

const stopAllNotes = () => {
  for (let i = 0; i < 128; i++) {
    if (keyStates[i] === 2) {
      stopNote(i)
    }
  }
}

const updatePianoDisplay = (midiId) => {
  if (!pianoSvg) return
  
  const keyElements = pianoSvg.element.querySelectorAll('rect[data-noteid]')
  keyElements.forEach(keyEl => {
    const id = parseInt(keyEl.getAttribute('data-noteid'))
    if (id === midiId) {
      if (keyStates[midiId] === 2) {
        keyEl.classList.add('piano-key-active')
      } else {
        keyEl.classList.remove('piano-key-active')
      }
    }
  })
}

const playAudioTone = (frequency) => {
  // Debug output
  console.log('[Audio] playAudioTone called with frequency:', frequency)
  console.log('[Audio] audioEnabled:', audioEnabled.value)
  console.log('[Audio] audioContext:', audioContext ? `exists (state: ${audioContext.state}, sampleRate: ${audioContext.sampleRate}, destination: ${audioContext.destination})` : 'null')
  
  // Ensure audio is enabled and context exists
  if (!audioEnabled.value) {
    console.log('[Audio] ✗ Audio disabled')
    return
  }
  
  if (!audioContext) {
    console.warn('[Audio] ✗ AudioContext null, attempting to create...')
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('[Audio] ✓ Created AudioContext')
    } catch (err) {
      console.error('[Audio] ✗ Cannot create AudioContext:', err.message)
      return
    }
  }
  
  try {
    console.log('[Audio] Context state before:', audioContext.state)
    
    // Resume if suspended
    if (audioContext.state === 'suspended') {
      console.log('[Audio] Resuming suspended context...')
      audioContext.resume().catch(err => {
        console.error('[Audio] Resume failed:', err)
      })
    }
    
    // Stop any existing tone first
    if (currentOscillator) {
      console.log('[Audio] Stopping existing oscillator')
      stopAudioTone()
    }
    
    const now = audioContext.currentTime
    // Default volume slider to 80% if not set, and ensure at least 0.3 gain
    const volumePercent = volume.value || 80
    const gainValue = Math.max(0.3, Math.min(1, volumePercent / 100)) // Ensure minimum 0.3 volume
    
    console.log('[Audio] Creating oscillator and gain nodes')
    console.log('[Audio] Volume setting:', volumePercent, '-> gain:', gainValue)
    
    // Create fresh oscillator and gain
    currentOscillator = audioContext.createOscillator()
    currentGain = audioContext.createGain()
    
    // Configure oscillator
    currentOscillator.type = 'sine'
    currentOscillator.frequency.value = frequency
    
    console.log('[Audio] Oscillator frequency:', currentOscillator.frequency.value)
    
    // Configure gain - set volume
    currentGain.gain.setValueAtTime(gainValue, now)
    
    console.log('[Audio] Gain value:', currentGain.gain.value)
    
    // Connect chain: oscillator -> gain -> destination
    currentOscillator.connect(currentGain)
    currentGain.connect(audioContext.destination)
    
    console.log('[Audio] Connections made:')
    console.log('[Audio]   oscillator.connect(gain) ✓')
    console.log('[Audio]   gain.connect(destination) ✓')
    console.log('[Audio]   destination:', audioContext.destination)
    console.log('[Audio] Starting oscillator at time:', now)
    
    // Start playing
    currentOscillator.start(now)
    
    console.log('[Audio] ✓✓✓ AUDIO PLAYING: ' + frequency.toFixed(1) + 'Hz @ ' + (gainValue*100).toFixed(0) + '% volume')
  } catch (err) {
    console.error('[Audio] ✗ Exception:', err.message, err)
    currentOscillator = null
    currentGain = null
  }
}

const stopAudioTone = () => {
  if (!currentOscillator || !audioContext) {
    return
  }
  
  try {
    const now = audioContext.currentTime
    
    // Immediate stop for cleaner cessation
    currentOscillator.stop(now)
    currentOscillator.disconnect()
    
    if (currentGain) {
      currentGain.disconnect()
    }
    
    currentOscillator = null
    currentGain = null
    
    console.log('[Audio] ✓ Stopped')
  } catch (err) {
    console.error('[Audio] Error stopping:', err.message)
    currentOscillator = null
    currentGain = null
  }
}

const testAudio = () => {
  console.log('[Audio] ===== TEST AUDIO BUTTON CLICKED =====')
  console.log('[Audio] Current state:')
  console.log('[Audio]   audioEnabled:', audioEnabled.value)
  console.log('[Audio]   audioContext:', audioContext ? `exists (${audioContext.state})` : 'null')
  console.log('[Audio]   volume:', volume.value)
  
  // Force enable audio
  audioEnabled.value = true
  console.log('[Audio] Forced audioEnabled = true')
  
  // Create fresh context
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      console.log('[Audio] Creating new AudioContext...')
      audioContext = new AudioContextClass()
      console.log('[Audio] ✓ AudioContext created, state:', audioContext.state)
    } catch (err) {
      console.error('[Audio] ✗ FATAL: Cannot create AudioContext:', err)
      return
    }
  }
  
  // Resume context
  console.log('[Audio] Context state before resume:', audioContext.state)
  if (audioContext.state === 'suspended') {
    console.log('[Audio] Attempting to resume...')
    audioContext.resume().then(() => {
      console.log('[Audio] ✓ Resumed, now playing tone')
      playTestTone()
    }).catch(err => {
      console.error('[Audio] ✗ Resume failed:', err)
      playTestTone() // Try anyway
    })
  } else {
    console.log('[Audio] Context already running, playing tone')
    playTestTone()
  }
}

const playTestTone = () => {
  console.log('[Audio] playTestTone starting...')
  if (!audioContext) {
    console.error('[Audio] ✗ No audioContext!')
    return
  }
  
  try {
    const now = audioContext.currentTime
    const freq = 440
    const gain = 0.3
    
    console.log('[Audio] Creating oscillator and gain...')
    const osc = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    osc.type = 'sine'
    osc.frequency.value = freq
    gainNode.gain.setValueAtTime(gain, now)
    
    console.log('[Audio] Connecting nodes...')
    osc.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    console.log('[Audio] Starting oscillator...')
    osc.start(now)
    
    console.log('[Audio] ✓✓✓ TONE STARTED: 440Hz at 30% volume')
    
    // Stop after 500ms
    setTimeout(() => {
      console.log('[Audio] Stopping oscillator...')
      osc.stop(audioContext.currentTime)
      osc.disconnect()
      gainNode.disconnect()
      console.log('[Audio] ✓ Stopped')
    }, 500)
  } catch (err) {
    console.error('[Audio] ✗ playTestTone failed:', err.message, err.stack)
  }
}

const changeOctave = (direction) => {
  const newOctave = startOctave.value + direction
  if (newOctave >= 2 && newOctave <= 6) {
    startOctave.value = newOctave
    renderPiano()
  }
}

// Initialize piano keys states (all visible)
const initKeyStates = () => {
  const startMidi = startOctave.value * 12
  const endMidi = startMidi + 24
  for (let i = startMidi; i <= endMidi; i++) {
    keyStates[i] = 1 // Normal state
  }
}

// Lifecycle
onMounted(() => {
  console.log('[Audio] Component mounted')
  
  // Test audio system immediately
  console.log('[Audio] Testing audio system on mount...')
  setTimeout(() => {
    try {
      const TestContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('[Audio] ✓ Test AudioContext created successfully:', TestContext.state)
      
      // Try creating nodes
      const testOsc = TestContext.createOscillator()
      const testGain = TestContext.createGain()
      testOsc.connect(testGain)
      testGain.connect(TestContext.destination)
      console.log('[Audio] ✓ Test nodes created and connected successfully')
      
      // Start and stop test (correct order)
      testOsc.start()
      testOsc.stop()
      TestContext.close()
      console.log('[Audio] ✓ Audio system fully functional')
    } catch (err) {
      console.error('[Audio] ✗ Audio system test failed:', err.message)
    }
  }, 100)
  
  initKeyStates()
  renderPiano()
})

onUnmounted(() => {
  stopAllNotes()
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close()
  }
})

// Watch for octave changes
watch(startOctave, () => {
  initKeyStates()
  renderPiano()
})

// Expose loopback mode
defineExpose({ loopbackMode })
</script>

<style scoped>
.virtual-keyboard-svg {
  width: 100%;
  max-width: 100%;
}

.piano-svg-wrapper {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 8px;
  padding: 20px;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1);
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
}

/* Piano SVG styling */
:deep(.piano-svg) {
  display: block !important;
  margin: 0 auto !important;
}

:deep(.piano-white-key) {
  fill: #f5f5f5;
  stroke: #333;
  stroke-width: 1;
  transition: fill 0.05s ease-out;
  cursor: pointer;
}

:deep(.piano-white-key:hover) {
  fill: #e0e0e0;
}

:deep(.piano-white-key.piano-key-active) {
  fill: #64b5f6;
  stroke: #2196f3;
}

:deep(.piano-black-key) {
  fill: #1a1a1a;
  stroke: #000;
  stroke-width: 1;
  transition: fill 0.05s ease-out;
  cursor: pointer;
}

:deep(.piano-black-key:hover) {
  fill: #2c2c2c;
}

:deep(.piano-black-key.piano-key-active) {
  fill: #0d47a1;
  stroke: #1976d2;
}

:deep(text) {
  pointer-events: none;
  user-select: none;
}

:deep(.piano-black-key.piano-key-active) {
  fill: #0d47a1;
  stroke: #1976d2;
}
</style>
