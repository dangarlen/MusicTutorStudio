<template>
  <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4">
    <input type="checkbox" class="peer" />
    <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
      Scale Selector
    </div>
    <div class="collapse-content card-body flex flex-row gap-8 px-4 pb-4">
      <!-- Key -->
      <div class="flex items-center gap-3">
        <label for="root-note" class="font-semibold w-32">Key:</label>
        <select
          id="root-note"
          class="flex-1 p-2 border rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="localSelections.key"
        >
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>
      <!-- Scale Type -->
      <div class="flex items-center gap-3">
        <span class="font-semibold w-32">Scale Type:</span>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="scale-type"
              value="major"
              class="radio radio-primary"
              v-model="localSelections.scaleType"
            />
            <span>Major</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="scale-type"
              value="minor"
              class="radio radio-primary"
              v-model="localSelections.scaleType"
            />
            <span>Minor</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="scale-type"
              value="chromatic"
              class="radio radio-primary"
              v-model="localSelections.scaleType"
            />
            <span>Chromatic</span>
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
    default: () => ({ key: "", scaleType: "" }),
  },
});
const emit = defineEmits(["update:scaleSelections"]);

const localSelections = computed({
  get: () => props.scaleSelections,
  set: (val) => emit("update:scaleSelections", val),
});
</script>
