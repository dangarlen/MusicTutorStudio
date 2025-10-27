<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-2xl font-bold">View Scale</span>
      </div>
      <!-- Mimic create-scales format here -->
      <div class="card bg-base-100 shadow-xl p-6 mt-4">
        <h2 class="card-title text-lg font-semibold mb-2">Scale Viewer</h2>
        <div
          class="mtsFormatVexFlowContainer border border-gray-300 rounded p-4 min-h-[200px]"
        >
          <!-- VexFlow staff or scale rendering goes here -->
        </div>
      </div>
    </main>
    <div style="max-width: 400px; margin: 2em auto">
      <button
        class="mtsFormatCreatorButtons flex items-center gap-2"
        @click="$router.push('/creator')"
      >
        <span
          class="material-symbols-outlined align-middle mr-2"
          aria-hidden="true"
          >edit_square</span
        >
        Return to Creator
      </button>
    </div>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
</script>
