<template>
  <div
    class="collapse collapse-arrow bg-white mb-6 border-2 border-dotted border-gray-400"
  >
    <input type="checkbox" class="peer" />
    <div class="collapse-title font-bold text-lg px-4 pt-4 pb-2">
      Staff Formatting
    </div>
    <div class="collapse-content">
      <!-- Staff Display Options -->
      <div class="mb-4">
        <div class="font-semibold mb-2">Staff Display Options:</div>
        <div class="space-y-2 text-sm">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="localSelections.staffOptions.keySignature"
            />
            Key Signature
            <span
              class="text-blue-600 cursor-help"
              title="Shows the key signature at the beginning of the staff"
              >ⓘ</span
            >
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="localSelections.staffOptions.accidentals"
            />
            Accidentals
            <span
              class="text-blue-600 cursor-help"
              title="Shows individual accidentals next to notes"
              >ⓘ</span
            >
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="localSelections.staffOptions.barLines"
            />
            Bar Lines
            <span
              class="text-blue-600 cursor-help"
              title="Shows bar lines to separate measures"
              >ⓘ</span
            >
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="localSelections.staffOptions.timeSignature"
            />
            Time Signature
            <span
              class="text-blue-600 cursor-help"
              title="Shows the time signature at the beginning of the staff"
              >ⓘ</span
            >
          </label>
        </div>
      </div>
      <!-- Accidental Family -->
      <div class="mb-3">
        <div class="font-semibold mb-2">Accidental Family:</div>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accidental-family"
              value="auto-key"
              class="radio radio-primary"
              v-model="localSelections.staffOptions.accidentalFamily"
            />
            <span>Auto: Based on Key</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accidental-family"
              value="auto-direction"
              class="radio radio-primary"
              v-model="localSelections.staffOptions.accidentalFamily"
            />
            <span>Auto: Based on Asc/Desc</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accidental-family"
              value="force-sharps"
              class="radio radio-primary"
              v-model="localSelections.staffOptions.accidentalFamily"
            />
            <span>Force: Sharps</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accidental-family"
              value="force-flats"
              class="radio radio-primary"
              v-model="localSelections.staffOptions.accidentalFamily"
            />
            <span>Force: Flats</span>
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
