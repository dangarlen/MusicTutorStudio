<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPreferencePages"
      >
        <span class="material-symbols-outlined icon">settings</span>
        <span class="text-2xl font-bold">Preferences</span>
      </div>
      <!-- Instrument selector (same component/behavior as Create Scales) -->
      <div class="mb-4">
        <InstrumentDropdown
          :instruments="store.instruments"
          v-model="store.instrument"
        />
      </div>
      <button
        id="save-btn"
        class="btn btn-active btn-success"
        @click="savePreferences"
      >
        <span class="material-symbols-outlined icon">save</span>
        Save Preferences
      </button>
      <div
        class="flex flex-col gap-4 max-w-xs mx-auto mt-8"
        style="
          display: flex;
          flex-direction: column;
          gap: 1em;
          max-width: 400px;
          margin: 2em 0;
        "
      >
        <button
          class="mtsFomatGlobal"
          style="
            border-radius: 9999px;
            padding: 0.75em 1.5em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.7em;
            border: none;
            cursor: pointer;
          "
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >cloud_upload</span
          >
          Backup Studio Workspace
        </button>
        <button
          class="mtsFomatGlobal"
          style="
            border-radius: 9999px;
            padding: 0.75em 1.5em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.7em;
            border: none;
            cursor: pointer;
          "
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >cloud_download</span
          >
          Restore Studio Workspace
        </button>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import { onMounted } from "vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";

const store = usePracticeUnitScaleStore();
onMounted(() => {
  if (!store.instruments || store.instruments.length === 0) {
    store.loadInstruments();
  }
  // Preselect instrument from cookie if present and not already set
  const cookieInstrument = getCookie("instrument");
  if (cookieInstrument && !store.instrument && store.instruments?.length) {
    const match = store.instruments.find(
      (i) => i.instrument === cookieInstrument
    );
    if (match) store.instrument = match;
  }
});

function savePreferences() {
  if (!store.instrument) {
    alert("Please select an instrument before saving.");
    return;
  }
  const name = store.instrument.instrument || "";
  // Persist for 1 year
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `instrument=${encodeURIComponent(
    name
  )}; path=/; max-age=${maxAge}`;
  alert(`Preferences saved. Instrument set to: ${name}`);
}

function getCookie(key) {
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + key.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
    )
  );
  return match ? decodeURIComponent(match[1]) : "";
}
</script>
