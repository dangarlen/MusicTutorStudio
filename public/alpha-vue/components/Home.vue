<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <main class="container mx-auto p-4 flex-1">
      <div class="flex flex-col gap-4 max-w-xs mx-auto">
        <RouterLink to="/creator" class="btn btn-primary shadow-lg">
          <span class="material-symbols-outlined align-middle mr-2"
            >edit_square</span
          >
          Creator
        </RouterLink>
        <RouterLink to="/practice" class="btn btn-secondary shadow-lg">
          <span class="material-symbols-outlined align-middle mr-2"
            >music_note</span
          >
          Practice
        </RouterLink>
        <RouterLink to="/lessons" class="btn btn-accent shadow-lg">
          <span class="material-symbols-outlined align-middle mr-2"
            >menu_book</span
          >
          Lessons
        </RouterLink>
        <RouterLink to="/preferences" class="btn btn-info shadow-lg">
          <span class="material-symbols-outlined align-middle mr-2"
            >settings</span
          >
          Preferences
        </RouterLink>
        <RouterLink to="/about" class="btn btn-warning shadow-lg">
          <span class="material-symbols-outlined align-middle mr-2">info</span>
          About
        </RouterLink>
      </div>
    </main>
    <!-- Footer is injected by index.html -->
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>
