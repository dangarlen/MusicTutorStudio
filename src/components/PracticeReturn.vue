<template>
  <div style="max-width: 400px; margin: 2em auto">
    <RouterLink to="/practice" class="mtsFormatPracticeButtons">
      <span
        class="material-symbols-outlined align-middle mr-2"
        aria-hidden="true"
        >music_note</span
      >
      Return to Practice
    </RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from "vue-router";
</script>
