<template>
  <div class="flex flex-col items-center justify-center min-h-[40vh]">
    <div class="bg-base-100 border border-base-300 rounded-xl p-6 shadow-md max-w-lg w-full">
      <h2 class="text-xl font-bold mb-2">Authenticating...</h2>
      <div v-if="error" class="text-error mb-2">{{ error }}</div>
      <div v-if="recoveryMode">
        <form @submit.prevent="handlePasswordReset" class="space-y-2">
          <div class="form-control">
            <label class="label" for="new-password">
              <span class="label-text">New password</span>
            </label>
            <input id="new-password" v-model="newPassword" type="password" class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label" for="confirm-password">
              <span class="label-text">Confirm new password</span>
            </label>
            <input id="confirm-password" v-model="confirmPassword" type="password" class="input input-bordered w-full" />
          </div>
          <button class="btn btn-warning btn-sm mt-2" :disabled="redirecting">Set New Password</button>
        </form>
      </div>
      <div v-else-if="!error" class="text-gray-600 mb-2">Processing authentication callback. Please wait...</div>
      <button v-if="redirecting" class="btn btn-primary btn-sm mt-2" disabled>Redirecting...</button>
      <button v-else class="btn btn-primary btn-sm mt-2" @click="goHome">Go Home</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import supabase from '../scripts/supabaseClient.js';

const router = useRouter();
const route = useRoute();
const error = ref('');
const redirecting = ref(false);
const recoveryMode = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const diagnostics = ref("");

function logDiag(msg, obj) {
  diagnostics.value += `\n${msg}: ${JSON.stringify(obj)}`;
  console.log(`[AuthCallbackHandler] ${msg}`, obj);
}

function goHome() {
  router.push('/');
}

async function handlePasswordReset() {
  error.value = "";
  logDiag('handlePasswordReset called', { newPassword: newPassword.value, confirmPassword: confirmPassword.value });
  if (!newPassword.value || newPassword.value !== confirmPassword.value) {
    error.value = "Passwords must match.";
    logDiag('Password mismatch', { newPassword: newPassword.value, confirmPassword: confirmPassword.value });
    return;
  }
  try {
    redirecting.value = true;
    logDiag('Calling supabase.auth.updateUser', {});
    const { error: supaError } = await supabase.auth.updateUser({ password: newPassword.value });
    logDiag('updateUser result', { supaError });
    if (supaError) {
      error.value = 'Password reset failed: ' + supaError.message;
      redirecting.value = false;
      return;
    }
    error.value = '';
    router.push('/preferences');
  } catch (e) {
    error.value = 'Unexpected error: ' + (e.message || e);
    logDiag('Exception in handlePasswordReset', e);
    redirecting.value = false;
  }
}

function parseParams() {
  let params = {};
  // Parse hash fragment (after #)
  if (window.location.hash) {
    let hash = window.location.hash;
    // Remove leading #
    if (hash.startsWith('#')) hash = hash.substring(1);
    // Remove leading / if present (for /#/ format)
    if (hash.startsWith('/')) hash = hash.substring(1);
    // If hash contains ?, split and parse
    if (hash.includes('?')) {
      hash = hash.split('?')[1];
    }
    // Split on & and parse key-value pairs
    hash.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  // Also parse search params (after ?)
  if (window.location.search) {
    window.location.search.substring(1).split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  // Also parse route params (after /#/)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    let route = window.location.hash.substring(2); // remove #/
    route.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  return params;
}

onMounted(async () => {
  logDiag('onMounted: location', { hash: window.location.hash, search: window.location.search });
  const params = parseParams();
  logDiag('Parsed params', params);

  // Password recovery flow
  if ((params.type === 'recovery' && params.token) || (params.type === 'recovery' && params.access_token)) {
    recoveryMode.value = true;
    logDiag('Recovery mode detected', params);
    return;
  }

  // If access_token is present, update session
  if (params.access_token) {
    try {
      redirecting.value = true;
      logDiag('Calling supabase.auth.setSession', { access_token: params.access_token, refresh_token: params.refresh_token });
      const { data, error: supaError } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token || ''
      });
      logDiag('setSession result', { data, supaError });
      if (supaError) {
        error.value = 'Authentication failed: ' + supaError.message;
        redirecting.value = false;
        return;
      }
      // Redirect to home or preferences
      router.push('/preferences');
    } catch (e) {
      error.value = 'Unexpected error: ' + (e.message || e);
      logDiag('Exception in setSession', e);
      redirecting.value = false;
    }
    return;
  }

  error.value = 'No authentication token found in URL.';
  logDiag('No authentication token found', params);
});
</script>
