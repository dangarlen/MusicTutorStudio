<template>
  <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4">
    <input type="checkbox" class="peer" />
    <div
      class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
    >
      <span>Scale Range Settings</span>
      <span
        class="text-right text-base font-normal text-gray-600"
        v-if="localSelections.octaveCount && localSelections.startingOctave"
      >
        Scale Range: {{ localSelections.octaveCount }} octave{{
          localSelections.octaveCount > 1 ? "s" : ""
        }}
        starting at {{ localSelections.startingOctave }}
      </span>
    </div>
    <div class="collapse-content flex flex-row gap-8 px-4">
      <!-- Starting Octave with +/- controls -->
      <div class="flex items-center gap-3">
        <label for="starting-octave-label" class="font-semibold w-32"
          >Starting Octave:</label
        >
        <button
          class="btn btn-sm btn-outline btn-primary flex items-center justify-center"
          aria-label="Decrease Octave"
          @click="
            localSelections.startingOctave = decrementOctave(
              localSelections.startingOctave
            )
          "
        >
          <span class="material-symbols-outlined">remove</span>
        </button>
        <span
          id="starting-octave-label"
          class="px-4 py-1 border rounded bg-white text-gray-800 font-mono text-xl font-bold"
          >{{ localSelections.startingOctave }}</span
        >
        <button
          class="btn btn-sm btn-outline btn-primary flex items-center justify-center"
          aria-label="Increase Octave"
          @click="
            localSelections.startingOctave = incrementOctave(
              localSelections.startingOctave
            )
          "
        >
          <span class="material-symbols-outlined">add</span>
        </button>
        <span style="display: inline-block; width: 2em"
          >&nbsp;&nbsp;&nbsp;</span
        >
      </div>
      <!-- Number of Octaves with +/- controls -->
      <div class="flex items-center gap-3">
        <label for="octave-count-label" class="font-semibold w-32"
          >Number of Octaves:</label
        >
        <button
          class="btn btn-sm btn-outline btn-primary flex items-center justify-center"
          aria-label="Decrease Number of Octaves"
          @click="
            localSelections.octaveCount = Math.max(
              1,
              localSelections.octaveCount - 1
            )
          "
        >
          <span class="material-symbols-outlined">remove</span>
        </button>
        <span
          id="octave-count-label"
          class="px-4 py-1 border rounded bg-white text-gray-800 font-mono text-xl font-bold"
          >{{ localSelections.octaveCount }}</span
        >
        <button
          class="btn btn-sm btn-outline btn-primary flex items-center justify-center"
          aria-label="Increase Number of Octaves"
          @click="localSelections.octaveCount = localSelections.octaveCount + 1"
        >
          <span class="material-symbols-outlined">add</span>
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
  return `${match[1]}${Number.parseInt(match[2]) + 1}`;
}
function decrementOctave(octave) {
  const match = octave.match(/^([A-G]#?)(\d)$/);
  if (!match) return octave;
  return `${match[1]}${Math.max(1, Number.parseInt(match[2]) - 1)}`;
}
</script>
