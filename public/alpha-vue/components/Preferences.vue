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
      <label for="instrument-select" class="block mb-2 font-semibold">
        Select Instrument:
      </label>
      <select id="instrument-select" class="w-full p-2 border rounded mb-4">
        <option value="">(Instrument list here)</option>
      </select>
      <!--
      <label for="range-select" class="block mb-2 font-semibold">
        Select Range:
      </label>
      <select id="range-select" class="w-full p-2 border rounded mb-4">
        <option value="standard">Standard</option>
        <option value="extended">Extended</option>
      </select>
      -->
      <div class="mb-4">
        <span class="block mb-2 font-semibold">Fingering Display:</span>
        <label class="inline-flex items-center mr-4">
          <input
            type="radio"
            name="fingering-alt"
            value="false"
            checked
            class="form-radio"
          />
          <span class="ml-2">Standard</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="radio"
            name="fingering-alt"
            value="true"
            class="form-radio"
          />
          <span class="ml-2">Alternate</span>
        </label>
      </div>
      <button id="save-btn" class="btn btn-active btn-success">
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
</script>
