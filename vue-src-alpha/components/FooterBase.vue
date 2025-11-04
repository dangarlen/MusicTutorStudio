<template>
  <footer class="w-full py-4 bg-base-300 text-base-content text-center mt-auto">
    <div class="flex flex-col items-center gap-2">
      <span class="text-xs">
        {{ metaText }}
      </span>
    </div>
  </footer>
</template>
<script setup>
defineProps({
  metaText: {
    type: String,
    default:
      "A Work in Process. Release: vue-src-alpha - Music Tutor Studio © 2025",
  },
});
</script>
