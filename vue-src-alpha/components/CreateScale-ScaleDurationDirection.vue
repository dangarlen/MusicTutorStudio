<template>
  <div
    class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
  >
    <input type="checkbox" class="peer" />
    <div
      class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
    >
      <span>Duration & Direction</span>
      <span
        class="text-right text-base font-normal text-gray-600"
        v-if="localSelections.direction && localSelections.noteDuration"
      >
        {{ localSelections.direction }}
        {{ durationLabel(localSelections.noteDuration) }} Scale
      </span>
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
      <!-- Time Signature -->
      <div class="mb-3">
        <div class="font-semibold mb-2">Time Signature:</div>
        <div class="flex items-center gap-4">
          <select
            class="select select-bordered max-w-xs"
            v-model="localSelections.timeSignature"
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="6/8">6/8</option>
            <option value="9/8">9/8</option>
            <option value="12/8">12/8</option>
          </select>
          <span class="text-sm text-gray-600"
            >Used by staff preview and export</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

function durationLabel(val) {
  switch (val) {
    case "eighth":
      return "Eighth Note";
    case "quarter":
      return "Quarter Note";
    case "half":
      return "Half Note";
    case "whole":
      return "Whole Note";
    default:
      return "";
  }
}
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
      timeSignature: "4/4",
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
