<style>
@import "../styles/theme.css";
</style>
<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatCreatorPages"
      >
        <span class="material-symbols-outlined">edit_square</span>
        <span class="text-2xl font-bold">Creator</span>
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
        <RouterLink to="/create-scales" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >queue_music</span
          >
          Create Scale
        </RouterLink>

        <RouterLink to="/create-exercises" class="mtsFormatCreatorButtons">
          <span class="material-symbols-outlined" aria-hidden="true"
            >add_circle</span
          >
          Create Exercise
        </RouterLink>

        <RouterLink
          to="/create-practice-unit-view"
          class="mtsFormatCreatorButtons"
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >visibility</span
          >
          Preview Practice Unit
        </RouterLink>
        <br />

        <!-- Create Lessons button removed: now available under Lessons page -->
      </div>
    </main>
    <FooterStandard />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
</script>
