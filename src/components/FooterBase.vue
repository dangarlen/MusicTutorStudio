<template>
  <footer class="w-full py-4 bg-base-300 text-base-content text-center mt-auto">
    <div class="flex flex-col items-center gap-2">
      <span class="text-xs">
        {{ footerText }}
      </span>
    </div>
  </footer>
</template>
<script setup>
import { ref, onMounted } from 'vue';

const footerText = ref('Loading...');

onMounted(async () => {
  try {
    const response = await fetch('/data/footer.json');
    const data = await response.json();
    footerText.value = `A Work in Process. Version ${data.version}. Last Update: ${data.lastUpdate}. Music Tutor Studio © 2025`;
  } catch (error) {
    console.error('Failed to load footer data:', error);
    footerText.value = 'A Work in Process. Music Tutor Studio © 2025';
  }
});
</script>
