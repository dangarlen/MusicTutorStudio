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
import { ref, onMounted } from "vue";

const metaText = ref("");

onMounted(async () => {
  try {
    const res = await fetch("/fragments/footer.json");
    const data = await res.json();
    const phase = data.phase
      ? `Phase: ${data.phase.charAt(0).toUpperCase()}${data.phase.slice(1)}`
      : "";
    const version = data.version ? ` | Version: ${data.version}` : "";
    const lastUpdate = data.lastUpdate ? ` | Updated: ${data.lastUpdate}` : "";
    metaText.value = `${phase}${version}${lastUpdate}`;
  } catch (e) {
    metaText.value = "";
  }
});
</script>
