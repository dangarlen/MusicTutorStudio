<template>
  <div
    class="collapse collapse-arrow bg-gray-50 border border-gray-300 mb-4 rounded-xl"
  >
    <input type="checkbox" class="peer" />
    <div
      class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex justify-between items-center"
    >
      <span>Staff Formatting</span>
      <span
        class="text-right text-base font-normal text-gray-600"
        v-if="localSelections.staffOptions"
      >
        Options:
        <span v-if="localSelections.staffOptions.keySignature"
          >Key Signature,
        </span>
        <span v-if="localSelections.staffOptions.barLines">Bar Lines, </span>
        <span v-if="localSelections.staffOptions.timeSignature"
          >Time Signature,
        </span>
        <span v-if="localSelections.staffOptions.accidentals"
          >Accidentals.
        </span>
        <span
          v-if="localSelections.staffOptions.accidentalFamily === 'auto-key'"
          >Auto: Based on Key</span
        >
        <span
          v-else-if="
            localSelections.staffOptions.accidentalFamily === 'auto-direction'
          "
          >Auto: Based on Asc/Desc</span
        >
        <span
          v-else-if="
            localSelections.staffOptions.accidentalFamily === 'force-sharps'
          "
          >Force: Sharps</span
        >
        <span
          v-else-if="
            localSelections.staffOptions.accidentalFamily === 'force-flats'
          "
          >Force: Flats</span
        >
        <template v-if="!hideSummaryExtras">
          <span class="mx-2">|</span>
          <span>Spacing: {{ spacingLabel }}</span>
          <span class="mx-2">|</span>
          <span>Ledger: {{ ledgerLabel }}</span>
        </template>
      </span>
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
          <!-- Warning when both Key Signature and Accidentals are off -->
          <div
            v-if="
              localSelections?.staffOptions &&
              !localSelections.staffOptions.keySignature &&
              !localSelections.staffOptions.accidentals
            "
            class="text-red-600 text-xs pl-6"
            role="alert"
          >
            If neither Key Signature or Accidentals is selected then notes will
            not indicate sharps or flats.
          </div>
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
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="localSelections.staffOptions.enforceLedgerLimits"
            />
            Enforce Ledger Limits
            <span
              class="text-blue-600 cursor-help"
              title="When enabled, notes outside configured ledger line limits will not render. When off, all valid notes render."
              >ⓘ</span
            >
          </label>
          <!-- Spacing is locked to VexFlow Default; no toggle/select shown -->
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
        measuresPerLineMax: 2,
        enforceLedgerLimits: false,
        accidentalFamily: "auto-key",
      },
    }),
  },
  hideSummaryExtras: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:scaleSelections"]);

const localSelections = computed({
  get: () => props.scaleSelections,
  set: (val) => emit("update:scaleSelections", val),
});

const spacingLabel = computed(() => "Default");

const ledgerLabel = computed(() =>
  localSelections.value?.staffOptions?.enforceLedgerLimits ? "Enforced" : "Off"
);
</script>
