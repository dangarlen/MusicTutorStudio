<template>
  <div
    class="collapse collapse-arrow bg-white mb-6 border-2 border-dotted border-gray-400"
  >
    <input type="checkbox" class="peer" />
    <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
      Duration & Direction
    </div>
    <div class="collapse-content">
      <!-- Direction -->
      <div class="flex items-center gap-4 mb-3">
        <label class="font-semibold w-32">Direction:</label>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="direction"
              value="Ascending"
              class="radio radio-primary"
              v-model="localSelections.direction"
            />
            <span>▲ Ascending</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="direction"
              value="Descending"
              class="radio radio-primary"
              v-model="localSelections.direction"
            />
            <span>▼ Descending</span>
          </label>
        </div>
      </div>
      <!-- Note Duration -->
      <div class="mb-3">
        <div class="font-semibold mb-2">Note Duration:</div>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="note-duration"
              value="eighth"
              class="radio radio-primary"
              v-model="localSelections.noteDuration"
            />
            <span>Eighth Notes</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="note-duration"
              value="quarter"
              class="radio radio-primary"
              v-model="localSelections.noteDuration"
            />
            <span>Quarter Notes</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="note-duration"
              value="half"
              class="radio radio-primary"
              v-model="localSelections.noteDuration"
            />
            <span>Half Notes</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="note-duration"
              value="whole"
              class="radio radio-primary"
              v-model="localSelections.noteDuration"
            />
            <span>Whole Notes</span>
          </label>
        </div>
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
</script>
