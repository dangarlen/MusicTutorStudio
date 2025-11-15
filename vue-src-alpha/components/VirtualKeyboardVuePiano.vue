<template>
  <div class="virtual-keyboard-vue-piano bg-gradient-to-b from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg border border-gray-300">
    <!-- Header Controls -->
    <div class="mb-4">
      <h3 class="font-bold text-base text-gray-800 mb-3 text-center">🎹 Virtual Piano Keyboard</h3>
      
      <!-- Octave Controls -->
      <div class="flex justify-center items-center gap-3 mb-3">
        <span class="text-sm font-medium text-gray-600">Starting Octave:</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="startingOctave = Math.max(0, startingOctave - 1)"
          :disabled="startingOctave <= 0"
        >
          −
        </button>
        <span class="text-lg font-bold font-mono text-gray-800 w-8 text-center">{{ startingOctave }}</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="startingOctave = Math.min(8, startingOctave + 1)"
          :disabled="startingOctave >= 8"
        >
          +
        </button>
        <button 
          class="btn btn-sm btn-error ml-4" 
          @click="allNotesOff"
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

    <!-- Piano Keyboard Container -->
    <div class="piano-keyboard-container bg-gray-900 p-4 rounded-lg overflow-x-auto">
      <PianoKeyboard
        ref="pianoKeyboard"
        :start-note="startNote"
        :end-note="endNote"
        :active-notes="activeNotes"
        @notedown="handleNoteDown"
        @noteup="handleNoteUp"
      />
    </div>

    <!-- Current tone display -->
    <div class="mt-4 text-center">
      <div class="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block">
        <span class="text-sm">
          <span v-if="currentNote">🎵 {{ currentNote }} ({{ currentFreq.toFixed(1) }}Hz)</span>
          <span v-else class="text-gray-500">No note playing</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import PianoKeyboard from 'vue-piano-keyboard'

export default {
  name: 'VirtualKeyboardVuePiano',
  components: {
    PianoKeyboard
  },
  props: {
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
  },
  setup(props) {
    const pianoKeyboard = ref(null)
    const startingOctave = ref(props.initialOctave)
    const audioEnabled = ref(true)
    const volume = ref(70)
    const tuningMode = ref('in-tune')
    const centsOffset = ref(20)
    const activeNotes = ref([])
    const currentNote = ref(null)
    const currentFreq = ref(0)

    // Calculate MIDI note numbers for start and end
    const startNote = computed(() => (startingOctave.value + 1) * 12) // C of starting octave
    const endNote = computed(() => startNote.value + 12) // One octave

    const currentPitchOffset = computed(() => {
      if (tuningMode.value === 'in-tune') return 0
      return tuningMode.value === 'flat' ? -centsOffset.value : centsOffset.value
    })

    const midiToFreq = (midi) => {
      return 440 * Math.pow(2, (midi - 69) / 12)
    }

    const midiToNoteName = (midi) => {
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const octave = Math.floor(midi / 12) - 1
      const note = notes[midi % 12]
      return `${note}/${octave}`
    }

    const handleNoteDown = (note) => {
      console.log('[Piano] Note down:', note)
      currentNote.value = midiToNoteName(note)
      currentFreq.value = midiToFreq(note)
      
      if (!activeNotes.value.includes(note)) {
        activeNotes.value.push(note)
      }

      props.onToneStart({
        midi: note,
        frequency: currentFreq.value,
        note: currentNote.value,
        loopback: false
      })
    }

    const handleNoteUp = (note) => {
      console.log('[Piano] Note up:', note)
      activeNotes.value = activeNotes.value.filter(n => n !== note)
      
      if (activeNotes.value.length === 0) {
        currentNote.value = null
        currentFreq.value = 0
      }

      props.onToneStop({ midi: note })
    }

    const allNotesOff = () => {
      console.log('[Piano] All notes off')
      activeNotes.value = []
      currentNote.value = null
      currentFreq.value = 0
      if (pianoKeyboard.value) {
        pianoKeyboard.value.allNotesOff()
      }
    }

    return {
      pianoKeyboard,
      startingOctave,
      startNote,
      endNote,
      audioEnabled,
      volume,
      tuningMode,
      centsOffset,
      currentPitchOffset,
      activeNotes,
      currentNote,
      currentFreq,
      handleNoteDown,
      handleNoteUp,
      allNotesOff
    }
  }
}
</script>

<style scoped>
.piano-keyboard-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  margin: 20px 0;
}

:deep(.piano-keyboard) {
  width: 100%;
  max-width: 100%;
}
</style>
