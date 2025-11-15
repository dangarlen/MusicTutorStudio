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
          @click="changeOctave(-1)"
          :disabled="currentOctave <= 2"
        >
          −
        </button>
        <span class="text-lg font-bold font-mono text-gray-800 w-8 text-center">{{ currentOctave }}</span>
        <button 
          class="btn btn-sm btn-circle" 
          @click="changeOctave(1)"
          :disabled="currentOctave >= 7"
        >
          +
        </button>
        <button 
          class="btn btn-sm btn-error ml-4" 
          @click="stopTone"
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
    
    <!-- Realistic Piano Keyboard -->
    <div class="piano-container">
      <!-- Piano body/frame -->
      <div class="piano-body">
        <!-- Music stand/sheet holder (decorative) -->
        <div class="music-stand">
          <div class="music-stand-lip"></div>
        </div>
        
        <!-- Brand name area (decorative) -->
        <div class="piano-brand">
          <span class="brand-text">MTS Virtual</span>
        </div>
        
        <!-- Key bed (the area containing keys) -->
        <div class="key-bed">
          <!-- White keys -->
          <div class="white-keys-container">
            <button
              v-for="(note, index) in whiteKeys"
              :key="`white-${note}-${index}`"
              class="white-key"
              :class="{ 
                'active': activeKey === `${note}/${getKeyOctave(index)}`,
                'c-key': note === 'C',
                'e-key': note === 'E',
                'f-key': note === 'F',
                'b-key': note === 'B'
              }"
              @mousedown="playNote(note, index)"
              @mouseup="stopTone"
              @mouseleave="stopTone"
              @touchstart.prevent="playNote(note, index)"
              @touchend.prevent="stopTone"
            >
              <!-- Key surface with subtle texture -->
              <div class="key-surface">
                <div class="key-reflection"></div>
              </div>
              <!-- Note labels -->
              <div class="key-labels">
                <span class="note-name">{{ note }}</span>
                <span class="octave-number">{{ getKeyOctave(index) }}</span>
              </div>
            </button>
          </div>
          
          <!-- Black keys -->
          <div class="black-keys-container">
            <div v-for="(position, index) in blackKeyPositions" :key="`black-${index}`" class="black-key-slot">
              <button
                v-if="position"
                class="black-key"
                :class="{ 'active': activeKey === `${position.note}/${currentOctave + position.octave}` }"
                @mousedown="playBlackNote(position.note, position.octave)"
                @mouseup="stopTone"
                @mouseleave="stopTone"
                @touchstart.prevent="playBlackNote(position.note, position.octave)"
                @touchend.prevent="stopTone"
              >
                <!-- Black key surface -->
                <div class="black-key-surface">
                  <div class="black-key-highlight"></div>
                </div>
                <!-- Note label -->
                <div class="black-key-label">
                  <span class="note-name">{{ position.note }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Piano fallboard (decorative lower panel) -->
        <div class="fallboard">
          <div class="fallboard-detail"></div>
        </div>
      </div>
    </div>
    
    <!-- Current tone display -->
    <div class="mt-4 text-center">
      <div class="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block">
        <div v-if="currentTone" class="text-sm">
          <div class="font-bold text-lg">{{ currentTone }}</div>
          <div class="text-xs text-gray-300">
            {{ adjustedFreq?.toFixed(1) }} Hz 
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
import { ref, computed, watch } from 'vue'

// Props to receive callback functions from parent
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

// Keyboard state
const currentOctave = ref(props.initialOctave || 4)
const activeKey = ref(null)
const currentTone = ref(null)
const currentFreq = ref(null)

// Audio playback state
const audioEnabled = ref(false)
const volume = ref(50)
const synth = ref(null)
const audioContext = ref(null)

// Pitch adjustment state
const tuningMode = ref('in-tune') // 'flat', 'in-tune', 'sharp'
const centsOffset = ref(20) // Cents to adjust (5-50)

// Piano key layouts - 2 octaves
const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B']

// Black key positions: aligned with white key gaps
// Each position corresponds to the gap after each white key (C-D gap, D-E gap, etc.)
// null = no black key in that gap (E-F and B-C have no sharps)
const blackKeyPositions = [
  { note: 'C#', octave: 0 },  // Between C and D (octave 1)
  { note: 'D#', octave: 0 },  // Between D and E (octave 1) 
  null,                       // No black key between E and F
  { note: 'F#', octave: 0 },  // Between F and G (octave 1)
  { note: 'G#', octave: 0 },  // Between G and A (octave 1)
  { note: 'A#', octave: 0 },  // Between A and B (octave 1)
  null,                       // No black key between B and C
  { note: 'C#', octave: 1 },  // Between C and D (octave 2)
  { note: 'D#', octave: 1 },  // Between D and E (octave 2)
  null,                       // No black key between E and F
  { note: 'F#', octave: 1 },  // Between F and G (octave 2)
  { note: 'G#', octave: 1 },  // Between G and A (octave 2)
  { note: 'A#', octave: 1 },  // Between A and B (octave 2)
]

// Computed properties for pitch adjustment
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

// Helper function to get octave for white keys (spanning 2 octaves)
const getKeyOctave = (whiteKeyIndex) => {
  return currentOctave.value + Math.floor(whiteKeyIndex / 7);
}

// Play a white key note
const playNote = (note, whiteKeyIndex = null) => {
  const keyOctave = whiteKeyIndex !== null ? getKeyOctave(whiteKeyIndex) : currentOctave.value;
  const midi = noteToMidi(note, keyOctave)
  const baseFreq = midiToFreq(midi)
  const spn = `${note}/${keyOctave}`
  
  // Apply pitch adjustment
  const centsFactor = Math.pow(2, currentPitchOffset.value / 1200)
  const adjustedFrequency = baseFreq * centsFactor
  
  activeKey.value = spn
  currentTone.value = spn
  currentFreq.value = baseFreq // Store base frequency for display
  
  // Play audio if enabled
  if (audioEnabled.value && synth.value) {
    playAudioTone(adjustedFrequency);
  }
  
  // Call parent callback to simulate tone input with adjusted frequency
  props.onToneStart({
    note: spn,
    frequency: adjustedFrequency,
    cents: currentPitchOffset.value,
    baseFrequency: baseFreq,
    midi: midi
  })
}

// Play a black key note
const playBlackNote = (note, octaveOffset) => {
  const keyOctave = currentOctave.value + octaveOffset;
  const midi = noteToMidi(note, keyOctave)
  const baseFreq = midiToFreq(midi)
  const spn = `${note}/${keyOctave}`
  
  // Apply pitch adjustment
  const centsFactor = Math.pow(2, currentPitchOffset.value / 1200)
  const adjustedFrequency = baseFreq * centsFactor
  
  activeKey.value = spn
  currentTone.value = spn
  currentFreq.value = baseFreq // Store base frequency for display
  
  // Play audio if enabled
  if (audioEnabled.value && synth.value) {
    playAudioTone(adjustedFrequency);
  }
  
  // Call parent callback to simulate tone input with adjusted frequency
  props.onToneStart({
    note: spn,
    frequency: adjustedFrequency,
    cents: currentPitchOffset.value,
    baseFrequency: baseFreq,
    midi: midi
  })
}

// Audio tone functions
const playAudioTone = (frequency) => {
  try {
    if (synth.value && window.Tone) {
      // Stop any existing tones
      synth.value.releaseAll();
      
      // Convert frequency to note name for Tone.js
      const noteFromFreq = window.Tone.Frequency(frequency).toNote();
      
      // Trigger the note
      synth.value.triggerAttack(noteFromFreq);
    }
  } catch (error) {
    console.warn('Audio playback error:', error);
  }
};

const stopAudioTone = () => {
  try {
    if (synth.value) {
      synth.value.releaseAll();
    }
  } catch (error) {
    console.warn('Audio stop error:', error);
  }
};

// Stop current tone
const stopTone = () => {
  activeKey.value = null
  currentTone.value = null
  currentFreq.value = null
  stopAudioTone() // Stop audio playback
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

// Audio setup functions
const initializeAudio = async () => {
  try {
    // Load Tone.js dynamically
    if (typeof window !== 'undefined' && !window.Tone) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }
    
    if (window.Tone && !synth.value) {
      // Create a polyphonic synthesizer for realistic piano sound
      synth.value = new window.Tone.PolySynth(window.Tone.Synth, {
        oscillator: {
          type: 'triangle'
        },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.2,
          release: 1.5
        }
      }).toDestination();
      
      // Set initial volume
      synth.value.volume.value = volumeToDecibels(volume.value);
    }
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
};

const volumeToDecibels = (volumePercent) => {
  if (volumePercent === 0) return -Infinity;
  return Math.log10(volumePercent / 100) * 20;
};

// Watch for audio enable/disable
watch(audioEnabled, async (enabled) => {
  if (enabled) {
    await initializeAudio();
  } else {
    stopAudioTone();
  }
});

// Watch for volume changes
watch(volume, (newVolume) => {
  if (synth.value) {
    synth.value.volume.value = volumeToDecibels(newVolume);
  }
});

// Watch for prop changes to update octave
watch(() => props.initialOctave, (newOctave) => {
  if (newOctave && newOctave !== currentOctave.value) {
    currentOctave.value = newOctave;
    stopTone(); // Stop any active tone when changing octave
  }
});
</script>

<style scoped>
/* Realistic Piano Styling - Mobile optimized */
.piano-container {
  perspective: 1000px;
  padding: 15px 10px;
  background: linear-gradient(135deg, #8B4513 0%, #5D2F0A 50%, #3D1F07 100%);
  border-radius: 12px;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
  max-width: 100%;
  overflow-x: auto;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.piano-body {
  background: linear-gradient(180deg, #2C1810 0%, #1A0F08 100%);
  border-radius: 8px;
  padding: 20px 15px 25px 15px;
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.4),
    inset 0 -2px 4px rgba(255,255,255,0.05);
  position: relative;
}

/* Music Stand */
.music-stand {
  height: 60px;
  background: linear-gradient(180deg, #8B4513 0%, #5D2F0A 100%);
  border-radius: 6px 6px 0 0;
  margin-bottom: 10px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.music-stand-lip {
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 8px;
  background: linear-gradient(180deg, #A0522D 0%, #6B3410 100%);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

/* Brand Name */
.piano-brand {
  text-align: center;
  margin-bottom: 15px;
}

.brand-text {
  font-family: 'Georgia', serif;
  font-size: 18px;
  font-weight: bold;
  color: #D4AF37;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  letter-spacing: 2px;
}

/* Key Bed */
.key-bed {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 8px;
  padding: 8px;
  position: relative;
  box-shadow: 
    inset 0 3px 6px rgba(0,0,0,0.6),
    0 1px 0 rgba(255,255,255,0.1);
  width: fit-content;
  margin: 0 auto;
}

/* White Keys - 2 octaves mobile-friendly */
.white-keys-container {
  display: flex;
  height: 160px;
  position: relative;
  z-index: 1;
  justify-content: center;
  align-items: center;
}

.white-key {
  width: 35px;
  min-width: 35px;
  height: 100%;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease-out;
  flex-shrink: 0;
}

.key-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    #ffffff 0%, 
    #f8f9fa 20%, 
    #e9ecef 80%, 
    #dee2e6 100%);
  border: 1px solid #adb5bd;
  border-radius: 0 0 8px 8px;
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(255,255,255,0.8),
    inset 1px 0 0 rgba(255,255,255,0.4),
    inset -1px 0 0 rgba(0,0,0,0.1);
}

.key-reflection {
  position: absolute;
  top: 8px;
  left: 4px;
  right: 4px;
  height: 30px;
  background: linear-gradient(180deg, 
    rgba(255,255,255,0.3) 0%, 
    rgba(255,255,255,0.1) 50%, 
    rgba(255,255,255,0) 100%);
  border-radius: 4px;
  pointer-events: none;
}

/* White Key Variants (for natural spacing) - Reduced for mobile */
.white-key.c-key, .white-key.f-key {
  margin-right: 1px;
}

.white-key.e-key, .white-key.b-key {
  margin-left: 1px;
}

/* Key Labels - Mobile optimized */
.key-labels {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  z-index: 3;
}

.note-name {
  display: block;
  font-size: 10px;
  font-weight: bold;
  color: #495057;
  text-shadow: 0 1px 1px rgba(255,255,255,0.8);
  margin-bottom: 1px;
}

.octave-number {
  display: block;
  font-size: 8px;
  color: #6c757d;
  font-weight: 500;
}

/* White Key States */
.white-key:hover .key-surface {
  background: linear-gradient(180deg, 
    #f8f9fa 0%, 
    #e9ecef 20%, 
    #dee2e6 80%, 
    #ced4da 100%);
  transform: translateY(1px);
}

.white-key:active .key-surface,
.white-key.active .key-surface {
  background: linear-gradient(180deg, 
    #e3f2fd 0%, 
    #bbdefb 20%, 
    #90caf9 80%, 
    #64b5f6 100%);
  border-color: #2196f3;
  box-shadow: 
    inset 0 2px 4px rgba(33, 150, 243, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.6),
    0 2px 4px rgba(0,0,0,0.2);
  transform: translateY(3px);
}

.white-key.active .note-name {
  color: #1976d2;
}

/* Black Keys - Properly aligned with white keys */
.black-keys-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  z-index: 2;
}

.black-key-slot {
  width: 35px;
  min-width: 35px;
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

/* Position black keys between white keys - proper alignment for 2 octaves */
.black-key-slot:nth-child(1) { transform: translateX(17px); } /* C# - between C and D */
.black-key-slot:nth-child(2) { transform: translateX(18px); } /* D# - between D and E */
.black-key-slot:nth-child(3) { transform: translateX(0); }    /* Empty E-F gap */
.black-key-slot:nth-child(4) { transform: translateX(17px); } /* F# - between F and G */
.black-key-slot:nth-child(5) { transform: translateX(18px); } /* G# - between G and A */
.black-key-slot:nth-child(6) { transform: translateX(18px); } /* A# - between A and B */
.black-key-slot:nth-child(7) { transform: translateX(0); }    /* Empty B-C gap */
.black-key-slot:nth-child(8) { transform: translateX(17px); } /* C# - between C and D (oct 2) */
.black-key-slot:nth-child(9) { transform: translateX(18px); } /* D# - between D and E (oct 2) */
.black-key-slot:nth-child(10) { transform: translateX(0); }   /* Empty E-F gap (oct 2) */
.black-key-slot:nth-child(11) { transform: translateX(17px); }/* F# - between F and G (oct 2) */
.black-key-slot:nth-child(12) { transform: translateX(18px); }/* G# - between G and A (oct 2) */
.black-key-slot:nth-child(13) { transform: translateX(18px); }/* A# - between A and B (oct 2) */

.black-key {
  width: 22px;
  height: 90px;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease-out;
}

.black-key-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    #2c3e50 0%, 
    #1a252f 20%, 
    #0f1419 80%, 
    #000000 100%);
  border: 1px solid #000000;
  border-radius: 0 0 6px 6px;
  box-shadow: 
    0 6px 12px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 1px 0 0 rgba(255,255,255,0.05),
    inset -1px 0 0 rgba(0,0,0,0.3);
}

.black-key-highlight {
  position: absolute;
  top: 4px;
  left: 2px;
  right: 2px;
  height: 20px;
  background: linear-gradient(180deg, 
    rgba(255,255,255,0.15) 0%, 
    rgba(255,255,255,0.05) 50%, 
    rgba(255,255,255,0) 100%);
  border-radius: 2px;
  pointer-events: none;
}

.black-key-label {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  z-index: 3;
}

.black-key-label .note-name {
  font-size: 9px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}
.black-key-slot:nth-child(8) .black-key { left: 26px; }  /* G# */
.black-key-slot:nth-child(9) { pointer-events: none; }   /* Gap */
.black-key-slot:nth-child(10) .black-key { left: 26px; } /* A# */
.black-key-slot:nth-child(11) { pointer-events: none; }  /* Gap */

/* Black Key States */
.black-key:hover .black-key-surface {
  background: linear-gradient(180deg, 
    #34495e 0%, 
    #2c3e50 20%, 
    #1a252f 80%, 
    #0d1117 100%);
  transform: translateY(1px);
}

.black-key:active .black-key-surface,
.black-key.active .black-key-surface {
  background: linear-gradient(180deg, 
    #1565c0 0%, 
    #0d47a1 20%, 
    #062a5c 80%, 
    #001122 100%);
  border-color: #1976d2;
  box-shadow: 
    inset 0 2px 4px rgba(13, 71, 161, 0.4),
    0 3px 6px rgba(0,0,0,0.3);
  transform: translateY(2px);
}

.black-key.active .black-key-label .note-name {
  color: #64b5f6;
}

/* Fallboard (bottom decorative panel) */
.fallboard {
  height: 40px;
  background: linear-gradient(180deg, #8B4513 0%, #5D2F0A 100%);
  border-radius: 0 0 6px 6px;
  margin-top: 15px;
  position: relative;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

.fallboard-detail {
  position: absolute;
  top: 50%;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #D4AF37 20%, 
    #D4AF37 80%, 
    transparent 100%);
  transform: translateY(-50%);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .piano-container {
    padding: 10px 5px;
  }
  
  .piano-body {
    padding: 15px 10px 20px 10px;
  }
  
  .white-key {
    width: 32px;
    min-width: 32px;
  }
  
  .black-key-slot {
    width: 32px;
    min-width: 32px;
  }
  
  .black-key {
    width: 20px;
  }
  
  .note-name {
    font-size: 9px;
  }
  
  .octave-number {
    font-size: 7px;
  }
  
  .black-key-label .note-name {
    font-size: 8px;
  }
}

/* Range slider custom styling */
.range {
  @apply bg-gray-200;
}

.range::-webkit-slider-thumb {
  @apply bg-white border-2 border-gray-400 rounded-full shadow-md;
  width: 16px;
  height: 16px;
}

.range-error::-webkit-slider-thumb {
  @apply border-red-500;
}

.range-warning::-webkit-slider-thumb {
  @apply border-orange-500;
}
</style>