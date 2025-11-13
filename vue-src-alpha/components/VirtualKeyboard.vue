<template>
  <div class="virtual-keyboard bg-white p-4 rounded-lg shadow-md">
    <div class="mb-3">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">Virtual Keyboard (Testing)</h3>
      <div class="text-xs text-gray-500 mb-2">
        Click keys to simulate tone input • Octave: {{ currentOctave }}
      </div>
      <div class="flex items-center gap-2 mb-3">
        <button 
          class="btn btn-xs" 
          @click="changeOctave(-1)"
          :disabled="currentOctave <= 2"
        >
          Oct -
        </button>
        <span class="text-sm font-mono">{{ currentOctave }}</span>
        <button 
          class="btn btn-xs" 
          @click="changeOctave(1)"
          :disabled="currentOctave >= 7"
        >
          Oct +
        </button>
        <div class="divider divider-horizontal"></div>
        <button 
          class="btn btn-xs btn-error" 
          @click="stopTone"
        >
          Stop
        </button>
      </div>
    </div>
    
    <!-- Piano keyboard layout -->
    <div class="keyboard-container relative">
      <!-- White keys -->
      <div class="flex">
        <button
          v-for="note in whiteKeys"
          :key="`white-${note}`"
          class="white-key"
          :class="{ 'active': activeKey === `${note}/${currentOctave}` }"
          @mousedown="playNote(note)"
          @mouseup="stopTone"
          @mouseleave="stopTone"
        >
          <span class="key-label">{{ note }}</span>
          <span class="key-octave">{{ currentOctave }}</span>
        </button>
      </div>
      
      <!-- Black keys (positioned absolutely) -->
      <div class="absolute top-0 left-0 flex">
        <div v-for="(note, index) in blackKeyLayout" :key="`black-${index}`" class="black-key-container">
          <button
            v-if="note"
            class="black-key"
            :class="{ 'active': activeKey === `${note}/${currentOctave}` }"
            @mousedown="playNote(note)"
            @mouseup="stopTone"
            @mouseleave="stopTone"
          >
            <span class="key-label">{{ note }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Current tone display -->
    <div class="mt-3 text-center">
      <div class="text-sm">
        <span v-if="currentTone" class="badge badge-primary">
          {{ currentTone }} ({{ currentFreq?.toFixed(1) }} Hz)
        </span>
        <span v-else class="text-gray-400">No tone active</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props to receive callback functions from parent
const props = defineProps({
  onToneStart: {
    type: Function,
    default: () => {}
  },
  onToneStop: {
    type: Function,  
    default: () => {}
  }
})

// Keyboard state
const currentOctave = ref(4)
const activeKey = ref(null)
const currentTone = ref(null)
const currentFreq = ref(null)

// Piano key layouts
const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const blackKeyLayout = [
  'C#', null, 'D#', null, null, 'F#', null, 'G#', null, 'A#', null
]

// MIDI note number to frequency conversion
const midiToFreq = (midi) => {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// Note name to MIDI number conversion
const noteToMidi = (note, octave) => {
  const noteOffsets = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  }
  return (octave + 1) * 12 + noteOffsets[note]
}

// Play a note
const playNote = (note) => {
  const midi = noteToMidi(note, currentOctave.value)
  const freq = midiToFreq(midi)
  const spn = `${note}/${currentOctave.value}`
  
  activeKey.value = spn
  currentTone.value = spn
  currentFreq.value = freq
  
  // Call parent callback to simulate tone input
  props.onToneStart({
    note: spn,
    frequency: freq,
    midi: midi
  })
}

// Stop current tone
const stopTone = () => {
  activeKey.value = null
  currentTone.value = null
  currentFreq.value = null
  
  // Call parent callback
  props.onToneStop()
}

// Change octave
const changeOctave = (delta) => {
  const newOctave = currentOctave.value + delta
  if (newOctave >= 2 && newOctave <= 7) {
    currentOctave.value = newOctave
    stopTone() // Stop any active tone when changing octave
  }
}
</script>

<style scoped>
.keyboard-container {
  height: 120px;
}

.white-key {
  @apply bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100;
  @apply flex flex-col items-center justify-end;
  @apply transition-colors duration-75;
  width: 32px;
  height: 120px;
  position: relative;
  user-select: none;
}

.white-key.active {
  @apply bg-blue-100 border-blue-400;
}

.white-key:not(:last-child) {
  border-right: none;
}

.key-label {
  @apply text-xs font-semibold text-gray-700;
  margin-bottom: 4px;
}

.key-octave {
  @apply text-xs text-gray-400;
  margin-bottom: 8px;
}

.black-key-container {
  width: 32px;
  display: flex;
  justify-content: center;
  position: relative;
}

.black-key {
  @apply bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white;
  @apply flex flex-col items-center justify-end;
  @apply transition-colors duration-75;
  width: 20px;
  height: 75px;
  position: absolute;
  top: 0;
  border-radius: 0 0 4px 4px;
  user-select: none;
}

.black-key.active {
  @apply bg-blue-600;
}

.black-key .key-label {
  @apply text-xs font-semibold text-white;
  margin-bottom: 8px;
}

/* Black key positioning adjustments */
.black-key-container:nth-child(1) .black-key { left: 16px; }  /* C# */
.black-key-container:nth-child(3) .black-key { left: 16px; }  /* D# */
.black-key-container:nth-child(6) .black-key { left: 16px; }  /* F# */
.black-key-container:nth-child(8) .black-key { left: 16px; }  /* G# */
.black-key-container:nth-child(10) .black-key { left: 16px; } /* A# */
</style>