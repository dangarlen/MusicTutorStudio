<template>
  <div>
    <label for="note-input" class="font-bold mb-2 block">Note Input:</label>
    <input
      id="note-input"
      v-model="modelValue.notes"
      class="input input-bordered w-full"
      placeholder="Enter notes (e.g. C4 D4 E4)"
    />
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps({ config: Object, modelValue: Object });
const emit = defineEmits(["update:modelValue"]);
</script>
