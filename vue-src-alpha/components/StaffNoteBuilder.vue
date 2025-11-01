<template>
  <div>
    <label for="note-input" class="font-bold mb-2 block">Note Input:</label>
    <input
      id="note-input"
      v-model="noteInput"
      class="input input-bordered w-full"
      placeholder="Enter notes (e.g. C4 D4 E4)"
      @input="onInputChange"
    />
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
const props = defineProps({ config: Object, modelValue: Object });
const emit = defineEmits(["update:modelValue"]);

const noteInput = ref("");

function parseNotes(input) {
  // Example: "C4 D4 E4" => [{ key: "c/4", duration: "q" }, ...]
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => {
      const match = n.match(/^([A-Ga-g][b#]?)(\d)$/);
      if (!match) return null;
      const key = match[1].toLowerCase() + "/" + match[2];
      return { key, duration: "q" };
    })
    .filter(Boolean);
}

function onInputChange() {
  const notesArr = parseNotes(noteInput.value);
  emit("update:modelValue", { ...props.modelValue, noteArray: notesArr });
}

// If modelValue.notes changes externally, update input field
watch(
  () => props.modelValue.noteArray,
  (newNotes) => {
    if (Array.isArray(newNotes)) {
      noteInput.value = newNotes.map((n) => n.key.replace("/", "")).join(" ");
    }
  },
  { immediate: true }
);
</script>
