<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <div id="header-container"></div>
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl">Practice Scales</span>
      </div>
      <div style="max-width: 400px; margin: 2em auto">
        <router-link to="/practice" class="mtsFormatPracticeButtons">
          <span
            class="material-symbols-outlined align-middle mr-2"
            aria-hidden="true"
            >music_note</span
          >
          Return to Practice
        </router-link>
      </div>
    </main>
    <div id="footer-container"></div>
  </div>
</template>
<script setup>
// Header and footer are injected by scripts/header-fetch.js and scripts/footer-fetch.js
</script>
