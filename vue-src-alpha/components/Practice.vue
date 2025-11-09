<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPracticePages"
      >
        <span class="material-symbols-outlined">music_note</span>
        <span class="text-2xl font-bold">Practice</span>
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
        <RouterLink to="/practice-active-unit" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >play_circle</span
          >
          Active Unit Practice
        </RouterLink>

        <RouterLink to="/practice-recall-practice-unit" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true">download</span>
          Recall Saved Practice Unit
        </RouterLink>
        
        <RouterLink to="/practice-notes" class="mtsFormatPracticeButtons">
          <span class="material-symbols-outlined" aria-hidden="true">sticky_note_2</span>
          Student Notes
        </RouterLink>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
</script>
