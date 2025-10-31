<template>
  <div>
    <label for="scale-type" class="font-bold mb-2 block">Scale Type:</label>
    <select
      id="scale-type"
      v-model="modelValue.scaleType"
      class="select select-bordered w-full mb-2"
    >
      <option v-for="type in enums.scaleType" :key="type" :value="type">
        {{ type }}
      </option>
    </select>
    <label for="direction" class="font-bold mb-2 block">Direction:</label>
    <select
      id="direction"
      v-model="modelValue.direction"
      class="select select-bordered w-full mb-2"
    >
      <option v-for="dir in enums.direction" :key="dir" :value="dir">
        {{ dir }}
      </option>
    </select>
    <label for="octaves" class="font-bold mb-2 block">Octaves:</label>
    <input
      id="octaves"
      type="number"
      v-model="modelValue.octaves"
      class="input input-bordered w-full"
      min="1"
      max="4"
    />
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps({ enums: Object, modelValue: Object });
const emit = defineEmits(["update:modelValue"]);
</script>
