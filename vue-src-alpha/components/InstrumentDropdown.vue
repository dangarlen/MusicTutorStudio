<template>
  <div>
    <label for="instrument-select" class="font-bold mb-2 block"
      >Instrument:</label
    >
    <select
      id="instrument-select"
      v-model="selected"
      class="select select-bordered w-full"
      @change="onChange"
    >
      <option v-for="inst in instruments" :key="inst.instrument" :value="inst">
        {{ inst.instrument }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
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
const selected = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => {
    selected.value = val;
  }
);
function onChange() {
  emit("update:modelValue", selected.value);
}
</script>

<style scoped>
.select {
  margin-bottom: 1rem;
}
</style>
