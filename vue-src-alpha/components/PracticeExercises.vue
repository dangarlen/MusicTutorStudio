<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl">Practice Exercises</span>
      </div>
      <PracticeReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import PracticeReturn from "./PracticeReturn.vue";
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
</script>
