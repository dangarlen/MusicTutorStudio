<template>
  <footer class="w-full py-4 bg-base-300 text-base-content text-center mt-auto">
    <div class="flex flex-col items-center gap-2">
      <RouterLink to="/" class="btn btn-circle btn-primary shadow" title="Home">
        <span class="material-symbols-outlined text-2xl">home</span>
      </RouterLink>
      <FooterBase />
    </div>
  </footer>
</template>
<script setup>
import FooterBase from "./FooterBase.vue";
import { RouterLink } from "vue-router";
</script>
