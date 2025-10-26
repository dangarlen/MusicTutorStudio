<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <div id="header-container"></div>
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl">Practice Exercises</span>
      </div>
      <PracticeReturn />
    </main>
    <div id="footer-container"></div>
  </div>
</template>
<script setup>
import PracticeReturn from "./PracticeReturn.vue";
</script>
