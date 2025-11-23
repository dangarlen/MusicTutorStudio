<template>
  <div class="toast-stack" aria-live="polite">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <div class="toast-body">
          <div class="toast-message">{{ t.message }}</div>
          <button class="toast-close" @click="$emit('dismiss', t.id)" aria-label="Dismiss">✕</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({ toasts: { type: Array, required: true } });
</script>

<style scoped>
.toast-stack { position: fixed; top: 1rem; right: 1rem; z-index: 1200; display: flex; flex-direction: column; gap: 0.5rem; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
.toast-enter-active, .toast-leave-active { transition: all 220ms cubic-bezier(.2,.8,.2,1); }
.toast { background: #111827; color: #fff; padding: .5rem .75rem; border-radius: 8px; min-width: 200px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); display:flex; align-items:center; }
.toast .toast-body { display:flex; align-items:center; width:100%; }
.toast .toast-message { flex:1; font-size:0.9rem; }
.toast .toast-close { background:transparent; border:0; color:rgba(255,255,255,0.8); cursor:pointer; padding:.25rem; margin-left:.5rem; }
.toast.info { background: #0b79f7; }
.toast.warn { background: #f59e0b; color: #111827; }
.toast.success { background: #10b981; }
</style>
