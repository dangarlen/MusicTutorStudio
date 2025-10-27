<template>
  <div style="max-width: 400px; margin: 2em auto">
    <RouterLink to="/lessons" class="mtsFormatLessonButtons">
      <span class="material-symbols-outlined align-middle mr-2">menu_book</span>
      Return to Lessons
    </RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from "vue-router";
</script>
