<template>
  <div
    class="alert shadow-sm bg-base-100 border border-base-300 flex items-center justify-between"
  >
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined" aria-hidden="true"
        >account_circle</span
      >
      <div v-if="loading">Checking sign-in…</div>
      <div v-else-if="user">
        <span class="font-medium">Signed in: </span>
        <span class="text-sm text-gray-600">{{ user.email }}</span>
      </div>
      <div v-else>
        <span class="font-medium">You're not signed in</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button v-if="user" class="btn btn-xs" @click="signOut">Sign out</button>
      <button v-else class="btn btn-xs" @click="goSignIn">Sign in</button>
      <button v-if="onRetry" class="btn btn-xs btn-outline" @click="onRetry">
        Retry
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import supabase from "../scripts/supabaseClient.js";

const props = defineProps({ onRetry: { type: Function, default: null } });
const router = useRouter();
const user = ref(null);
const loading = ref(true);
let unsub = null;

async function refreshSession() {
  loading.value = true;
  try {
    const { data } = await supabase.auth.getSession();
    user.value = data?.session?.user || null;
  } finally {
    loading.value = false;
  }
}

function goSignIn() {
  router.push({ name: "preferences" });
}

async function signOut() {
  await supabase.auth.signOut();
  await refreshSession();
}

onMounted(async () => {
  await refreshSession();
  const { data: listener } = supabase.auth.onAuthStateChange(() =>
    refreshSession()
  );
  unsub = listener?.subscription;
});

onBeforeUnmount(() => {
  try {
    unsub?.unsubscribe?.();
  } catch {}
});
</script>
