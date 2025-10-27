<template>
  <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4">
    <input type="checkbox" class="peer" />
    <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
      Scale Range Settings
    </div>
    <div class="collapse-content card-body flex flex-row gap-8 px-4 pb-4">
      <!-- Starting Octave with +/- controls -->
      <div class="flex items-center gap-3">
        <label for="starting-octave-label" class="font-semibold w-32"
          >Starting Octave:</label
        >
        <button
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          aria-label="Decrease Octave"
          @click="
            localSelections.startingOctave = decrementOctave(
              localSelections.startingOctave
            )
          "
        >
          -
        </button>
        <span
          id="starting-octave-label"
          class="px-3 py-1 border rounded bg-white text-gray-800 font-mono"
          >{{ localSelections.startingOctave }}</span
        >
        <button
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          aria-label="Increase Octave"
          @click="
            localSelections.startingOctave = incrementOctave(
              localSelections.startingOctave
            )
          "
        >
          +
        </button>
      </div>
      <!-- Number of Octaves with +/- controls -->
      <div class="flex items-center gap-3">
        <label for="octave-count-label" class="font-semibold w-32"
          >Number of Octaves:</label
        >
        <button
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          aria-label="Decrease Number of Octaves"
          @click="
            localSelections.octaveCount = Math.max(
              1,
              localSelections.octaveCount - 1
            )
          "
        >
          -
        </button>
        <span
          id="octave-count-label"
          class="px-3 py-1 border rounded bg-white text-gray-800 font-mono"
          >{{ localSelections.octaveCount }}</span
        >
        <button
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          aria-label="Increase Number of Octaves"
          @click="localSelections.octaveCount = localSelections.octaveCount + 1"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  scaleSelections: {
    type: Object,
    default: () => ({
      key: "C",
      scaleType: "major",
      startingOctave: "C4",
      octaveCount: 1,
      direction: "Ascending",
      noteDuration: "quarter",
      staffOptions: {
        keySignature: true,
        accidentals: true,
        barLines: true,
        timeSignature: true,
        accidentalFamily: "auto-key",
      },
    }),
  },
});
const emit = defineEmits(["update:scaleSelections"]);

const localSelections = computed({
  get: () => props.scaleSelections,
  set: (val) => emit("update:scaleSelections", val),
});

function incrementOctave(octave) {
  // Simple logic: C4 -> C5, D3 -> D4, etc.
  const match = octave.match(/^([A-G]#?)(\d)$/);
  if (!match) return octave;
  return `${match[1]}${parseInt(match[2]) + 1}`;
}
function decrementOctave(octave) {
  const match = octave.match(/^([A-G]#?)(\d)$/);
  if (!match) return octave;
  return `${match[1]}${Math.max(1, parseInt(match[2]) - 1)}`;
}
</script>
