<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">queue_music</span>
        <span class="text-2xl font-bold">Create Scale</span>
      </div>
      <div style="max-width: 400px; margin: 2em auto">
        <RouterLink to="/creator" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined align-middle mr-2"
            >edit_square</span
          >
          Return to Creator
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
