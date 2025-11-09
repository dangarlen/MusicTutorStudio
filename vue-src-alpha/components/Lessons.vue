<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatLessonPages"
      >
        <span class="material-symbols-outlined">menu_book</span>
        <span class="text-2xl font-bold">Lessons</span>
      </div>
      <div
        class="flex flex-col gap-6 max-w-xs mx-auto mt-8"
        style="
          display: flex;
          flex-direction: column;
          gap: 1.5em;
          max-width: 400px;
          margin: 2em auto;
        "
      >
        <RouterLink to="/lessons-create" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >add_circle</span
          >
          Create Lessons
        </RouterLink>
        <RouterLink to="/lessons-manage" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >launch</span
          >
          Manage Lessons
        </RouterLink>
        <RouterLink to="/lessons-start" class="mtsFormatLessonButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >play_circle</span
          >
          Start Lesson
        </RouterLink>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import { RouterLink } from "vue-router";
</script>
