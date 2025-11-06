<template>
  <div class="bg-base-200 flex flex-col min-h-screen">
    <Header />
    <main class="container mx-auto p-4 flex-1">
      <div
        class="flex items-center gap-2 mb-8 px-4 py-2 rounded mtsFormatPreferencePages"
      >
        <span class="material-symbols-outlined icon">settings</span>
        <span class="text-2xl font-bold">Preferences</span>
      </div>
      <!-- User Account Section -->
      <div
        class="collapse collapse-arrow bg-base-100 border border-base-300 mb-6 rounded-xl"
      >
        <input type="checkbox" class="peer" id="user-collapse-toggle" />
        <div
          class="collapse-title font-bold text-lg px-4 pt-4 pb-2 flex items-center justify-between w-full"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined">person</span>
            <span>User</span>
          </div>
          <div class="text-xs text-gray-500">
            <template v-if="userId && userId.length">
              ID: {{ userId
              }}<span v-if="sessionEmail && sessionEmail.length">
                ({{ sessionEmail }})</span
              >
            </template>
            <template v-else> Not signed in </template>
          </div>
        </div>
        <div class="collapse-content px-4 pb-4 space-y-4">
          <!-- Password Recovery UI -->
          <div
            v-if="resetMode"
            class="p-3 border border-warning rounded bg-warning/10"
          >
            <div class="font-semibold text-warning mb-1">
              Set a new password
            </div>
            <div class="form-control w-full max-w-xs">
              <label class="label" for="new-password">
                <span class="label-text">New password</span>
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                class="input input-bordered w-full"
              />
            </div>
            <div class="form-control w-full max-w-xs">
              <label class="label" for="confirm-password">
                <span class="label-text">Confirm new password</span>
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                class="input input-bordered w-full"
              />
            </div>
            <div class="mt-2 flex gap-2">
              <button
                class="btn btn-warning btn-sm"
                @click="handleApplyNewPassword"
              >
                Update Password
              </button>
              <button class="btn btn-ghost btn-sm" @click="resetMode = false">
                Cancel
              </button>
            </div>
          </div>

          <div class="form-control w-full max-w-xs">
            <label class="label" for="user-email">
              <span class="label-text">Email</span>
            </label>
            <input
              id="user-email"
              v-model="userEmail"
              type="email"
              placeholder="Enter your email"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label" for="user-password">
              <span class="label-text">Password</span>
            </label>
            <div class="relative">
              <input
                id="user-password"
                v-model="userPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="input input-bordered w-full pr-12"
              />
              <button
                type="button"
                class="absolute top-1/2 -translate-y-1/2 right-2 btn btn-xs btn-ghost"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined text-base">{{
                  showPassword ? "visibility_off" : "visibility"
                }}</span>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              id="signup-btn"
              class="btn btn-primary"
              @click="handleSignup"
            >
              Create Account
            </button>
            <button
              id="login-btn"
              class="btn btn-secondary"
              @click="handleLogin"
            >
              Login
            </button>
            <button
              v-if="userId"
              id="logout-btn"
              class="btn btn-outline"
              @click="handleLogout"
            >
              Logout
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              @click="handleForgotPassword"
            >
              Forgot password?
            </button>
          </div>
          <!-- Practice Privacy -->
          <div class="mt-4">
            <div class="font-semibold mb-1">Practice Privacy</div>
            <div class="flex items-center gap-6 text-sm">
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="shareMusic"
                  value="share"
                  v-model="privacySelection"
                />
                <span>Share</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="shareMusic"
                  value="private"
                  v-model="privacySelection"
                />
                <span>Personal Use ONLY</span>
              </label>
            </div>
            <div
              class="text-xs text-gray-500 mt-1"
              v-if="privacySelection === 'share'"
            >
              Your future practice units will be marked as shareable.
            </div>
            <div class="text-xs text-gray-500 mt-1" v-else>
              Units will be marked private (Personal Use ONLY).
            </div>
          </div>
          <div id="user-message" class="text-sm mt-2">{{ userMsg }}</div>
        </div>
      </div>
      <!-- Instrument selector (same component/behavior as Create Scales) -->
      <div class="mb-4">
        <InstrumentDropdown
          :instruments="store.instruments"
          v-model="store.instrument"
        />
      </div>
      <button
        id="save-btn"
        class="btn btn-active btn-success"
        @click="savePreferences"
      >
        <span class="material-symbols-outlined icon">save</span>
        Save Preferences
      </button>
      <div
        class="flex flex-col gap-4 max-w-xs mx-auto mt-8"
        style="
          display: flex;
          flex-direction: column;
          gap: 1em;
          max-width: 400px;
          margin: 2em 0;
        "
      >
        <button
          class="mtsFomatGlobal"
          style="
            border-radius: 9999px;
            padding: 0.75em 1.5em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.7em;
            border: none;
            cursor: pointer;
          "
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >cloud_upload</span
          >
          Backup Studio Workspace
        </button>
        <button
          class="mtsFomatGlobal"
          style="
            border-radius: 9999px;
            padding: 0.75em 1.5em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.7em;
            border: none;
            cursor: pointer;
          "
        >
          <span class="material-symbols-outlined" aria-hidden="true"
            >cloud_download</span
          >
          Restore Studio Workspace
        </button>
      </div>
    </main>
    <FooterStandard />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
// --- Supabase Auth wiring ---
// Use your actual Supabase project URL and anon key
// Use singleton client to avoid multiple GoTrueClient instances during HMR
import supabase from "../scripts/supabaseClient.js";

const userEmail = ref("");
const userPassword = ref("");
const userMsg = ref("");
const userId = ref("");
const sessionEmail = ref("");
const resetMode = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const privacySelection = ref("private"); // 'share' | 'private'
const showPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

async function handleSignup() {
  userMsg.value = "";
  if (!userEmail.value || !userPassword.value) {
    userMsg.value = "Enter email + password first.";
    return;
  }
  try {
    const { error, data } = await supabase.auth.signUp({
      email: userEmail.value,
      password: userPassword.value,
    });
    if (error) {
      // 422 often means password policy or email already registered
      userMsg.value = `Signup failed: ${error.message}`;
    } else {
      userMsg.value = data?.user?.confirmed_at
        ? "Account created and confirmed."
        : "Signup requested. Check your email for confirmation link.";
      userId.value = data?.user?.id || userId.value;
    }
  } catch (e) {
    userMsg.value = "Unexpected signup error.";
    console.warn("[Preferences] handleSignup error", e);
  }
}

async function handleLogin() {
  userMsg.value = "";
  if (!userEmail.value || !userPassword.value) {
    userMsg.value = "Enter email + password first.";
    return;
  }
  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: userEmail.value,
      password: userPassword.value,
    });
    if (error) {
      userMsg.value = `Login failed: ${error.message}`;
    } else {
      userMsg.value = `Logged in as ${data?.user?.email}.`;
      userId.value = data?.user?.id || userId.value;
      sessionEmail.value = data?.user?.email || sessionEmail.value;
    }
  } catch (e) {
    userMsg.value = "Unexpected login error.";
    console.warn("[Preferences] handleLogin error", e);
  }
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      userMsg.value = `Logout failed: ${error.message}`;
    } else {
      userMsg.value = "Logged out.";
      userId.value = "";
      sessionEmail.value = "";
      store.practiceUnitHeader.User = "";
    }
  } catch (e) {
    userMsg.value = "Unexpected logout error.";
    console.warn("[Preferences] handleLogout error", e);
  }
}

async function handleForgotPassword() {
  userMsg.value = "";
  const email = (userEmail.value || "").trim();
  if (!email) {
    userMsg.value = "Enter email then tap 'Forgot password?'.";
    return;
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/alpha-vue-SPA/#/preferences`,
    });
    if (error) {
      userMsg.value = `Reset failed: ${error.message}`;
    } else {
      userMsg.value = "Reset link sent. Check your email.";
    }
  } catch (e) {
    userMsg.value = "Unexpected reset error.";
    console.warn("[Preferences] handleForgotPassword error", e);
  }
}
import Header from "./Header.vue";
import FooterStandard from "./FooterStandard.vue";
import InstrumentDropdown from "./InstrumentDropdown.vue";
import { usePracticeUnitScaleStore } from "../stores/practiceUnitScaleStore";

const store = usePracticeUnitScaleStore();
onMounted(() => {
  if (!store.instruments || store.instruments.length === 0) {
    store.loadInstruments();
  }
  // Preselect instrument from cookie if present and not already set
  const cookieInstrument = getCookie("instrument");
  if (cookieInstrument && !store.instrument && store.instruments?.length) {
    const match = store.instruments.find(
      (i) => i.instrument === cookieInstrument
    );
    if (match) store.instrument = match;
  }

  // Initialize auth state and subscribe to changes (non-async to avoid lifecycle warning)
  supabase.auth.getSession().then(({ data }) => {
    userId.value = data?.session?.user?.id || "";
    sessionEmail.value = data?.session?.user?.email || "";
  });
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      userId.value = session?.user?.id || "";
      sessionEmail.value = session?.user?.email || "";
      if (event === "PASSWORD_RECOVERY") {
        resetMode.value = true;
        userMsg.value =
          "Password recovery link verified. Please set a new password below.";
      }
      // Update store header user when session present
      if (session?.user?.id) {
        store.practiceUnitHeader.User = session.user.id;
      }
    }
  );
  onUnmounted(() => {
    try {
      authListener.subscription?.unsubscribe?.();
    } catch {}
  });
});

// Initialize privacySelection from store header if present
onMounted(() => {
  if (store.practiceUnitHeader.shareMusic === true)
    privacySelection.value = "share";
});

// Watch privacy selection and update store header
watch(privacySelection, (val) => {
  const shareFlag = val === "share";
  store.practiceUnitHeader.shareMusic = shareFlag;
});

// Ensure User field is kept in header if already logged in on mount
onMounted(() => {
  if (userId.value) {
    store.practiceUnitHeader.User = userId.value;
  }
});

async function handleApplyNewPassword() {
  userMsg.value = "";
  if (!newPassword.value || newPassword.value !== confirmPassword.value) {
    userMsg.value = "Passwords must match.";
    return;
  }
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });
    if (error) {
      userMsg.value = `Failed to update password: ${error.message}`;
    } else {
      userMsg.value = "Password updated. You can now log in.";
      resetMode.value = false;
      newPassword.value = "";
      confirmPassword.value = "";
    }
  } catch (e) {
    userMsg.value = "Unexpected error updating password.";
    console.warn("[Preferences] handleApplyNewPassword error", e);
  }
}

function savePreferences() {
  if (!store.instrument) {
    alert("Please select an instrument before saving.");
    return;
  }
  const name = store.instrument.instrument || "";
  // Persist for 1 year
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `instrument=${encodeURIComponent(
    name
  )}; path=/; max-age=${maxAge}`;
  alert(`Preferences saved. Instrument set to: ${name}`);
}

function getCookie(key) {
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + key.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
    )
  );
  return match ? decodeURIComponent(match[1]) : "";
}
</script>
