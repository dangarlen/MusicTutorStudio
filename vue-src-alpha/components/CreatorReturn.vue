<template>
  <div style="max-width: 400px; margin: 2em auto">
    <RouterLink to="/creator" class="mtsFormatCreatorButtons">
      <span class="material-symbols-outlined align-middle mr-2"
        >edit_square</span
      >
      Return to Creator
    </RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from "vue-router";
</script>
