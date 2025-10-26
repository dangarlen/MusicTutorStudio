<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatLessonPages"
      >
        <span class="material-symbols-outlined">add_circle</span>
        <span class="text-2xl font-bold">Create Lessons</span>
      </div>
      <LessonsReturn />
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import LessonsReturn from "./LessonsReturn.vue";
</script>
