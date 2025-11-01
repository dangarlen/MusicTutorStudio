<template>
  <div
    class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
  >
    <input type="checkbox" class="peer" />
    <div
      class="collapse-title font-bold text-lg px-4 flex justify-between items-center"
    >
      <span>Instrument</span>
      <span
        class="text-right text-base font-normal text-gray-600"
        v-if="selectedInstrumentName"
      >
        {{ selectedInstrumentName.split(",")[0] }}
      </span>
    </div>
    <div class="collapse-content px-4">
      <select
        id="instrument-select"
        v-model="selectedInstrumentName"
        class="select select-bordered w-full"
        @change="onChangeInstrument"
      >
        <option
          v-for="inst in instruments"
          :key="inst.instrument"
          :value="inst.instrument"
        >
          {{ inst.instrument }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  instruments: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["update:modelValue"]);
const selectedInstrumentName = ref(props.modelValue?.instrument || "");
watch(
  () => props.modelValue,
  (val) => {
    selectedInstrumentName.value = val?.instrument || "";
  }
);
function onChangeInstrument() {
  const instObj = props.instruments.find(
    (inst) => inst.instrument === selectedInstrumentName.value
  );
  emit("update:modelValue", instObj || null);
}
</script>

<style scoped>
.select {
  margin-bottom: 1rem;
}
</style>
