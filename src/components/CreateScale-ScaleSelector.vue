<template>
  <div class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4">
    <input type="checkbox" class="peer" />
    <div
      class="collapse-title font-bold text-lg px-4 flex justify-between items-center"
    >
      <span>Scale Selector</span>
      <span
        class="text-right text-base font-normal text-gray-600"
        v-if="localSelections.key && localSelections.scaleType"
      >
        {{ localSelections.key }}
        {{ capitalize(localSelections.scaleType) }} Scale
      </span>
    </div>
    <div class="collapse-content flex flex-row gap-8 px-4">
      <!-- Key -->
      <div class="flex items-center gap-3">
        <label for="root-note" class="font-semibold w-32">Key:</label>
        <select
          id="root-note"
          class="flex-1 p-2 border rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="localSelections.key"
        >
          <option v-for="(label, key) in scaleKeys" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
        <span style="display: inline-block; width: 2em"
          >&nbsp;&nbsp;&nbsp;</span
        >
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
import { ref, computed, onMounted } from "vue";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
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

const scaleKeys = ref({});
onMounted(async () => {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/scaleKeys.json`
    );
    if (!response.ok) throw new Error("Failed to load scaleKeys.json");
    scaleKeys.value = await response.json();
  } catch (e) {
    console.error("ScaleKeys fetch error:", e);
  }
});
</script>
