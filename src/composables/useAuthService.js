/**
 * Authentication Service Composable
 * Centralized authentication methods for Supabase
 */
import { ref } from "vue";
import supabase from "../scripts/supabaseClient.js";

export function useAuthService() {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Sign up a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: object|null, error: string|null}>}
   */
  async function signUp(email, password) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        error.value = signUpError.message;
        return { user: null, error: signUpError.message };
      }

      user.value = data?.user || null;
      return { 
        user: data?.user || null, 
        error: null,
        needsConfirmation: !data?.user?.confirmed_at
      };
    } catch (e) {
      error.value = e.message;
      return { user: null, error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: object|null, session: object|null, error: string|null}>}
   */
  async function signInWithPassword(email, password) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        error.value = signInError.message;
        return { user: null, session: null, error: signInError.message };
      }

      user.value = data?.user || null;
      return { 
        user: data?.user || null, 
        session: data?.session || null,
        error: null 
      };
    } catch (e) {
      error.value = e.message;
      return { user: null, session: null, error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Sign in with magic link (passwordless)
   * @param {string} email - User email
   * @param {string} redirectTo - Optional redirect URL after sign in
   * @returns {Promise<{error: string|null}>}
   */
  async function signInWithMagicLink(email, redirectTo = null) {
    loading.value = true;
    error.value = null;
    try {
      const options = {};
      if (redirectTo) {
        options.emailRedirectTo = redirectTo;
      }

      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options,
      });

      if (magicLinkError) {
        error.value = magicLinkError.message;
        return { error: magicLinkError.message };
      }

      return { error: null };
    } catch (e) {
      error.value = e.message;
      return { error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: string|null}>}
   */
  async function signOut() {
    loading.value = true;
    error.value = null;
    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        error.value = signOutError.message;
        return { error: signOutError.message };
      }

      user.value = null;
      return { error: null };
    } catch (e) {
      error.value = e.message;
      return { error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} redirectTo - URL to redirect to after reset
   * @returns {Promise<{error: string|null}>}
   */
  async function resetPasswordForEmail(email, redirectTo) {
    loading.value = true;
    error.value = null;
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        error.value = resetError.message;
        return { error: resetError.message };
      }

      return { error: null };
    } catch (e) {
      error.value = e.message;
      return { error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<{user: object|null, error: string|null}>}
   */
  async function updatePassword(newPassword) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        error.value = updateError.message;
        return { user: null, error: updateError.message };
      }

      user.value = data?.user || null;
      return { user: data?.user || null, error: null };
    } catch (e) {
      error.value = e.message;
      return { user: null, error: e.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get current session
   * @returns {Promise<{session: object|null, user: object|null}>}
   */
  async function getSession() {
    try {
      const { data } = await supabase.auth.getSession();
      user.value = data?.session?.user || null;
      return { 
        session: data?.session || null, 
        user: data?.session?.user || null 
      };
    } catch (e) {
      console.error("[useAuthService] getSession error:", e);
      return { session: null, user: null };
    }
  }

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function to execute on auth state change
   * @returns {Object} Subscription object with unsubscribe method
   */
  function onAuthStateChange(callback) {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null;
      callback(event, session);
    });
    return listener?.subscription;
  }

  return {
    // State
    user,
    loading,
    error,

    // Methods
    signUp,
    signInWithPassword,
    signInWithMagicLink,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    getSession,
    onAuthStateChange,
  };
}
