// Centralized Supabase client (singleton) for the Vue SPA
// Avoids multiple GoTrueClient instances across HMR/component reloads
import { createClient } from "@supabase/supabase-js";

// Load credentials from environment variables for security
// Vite exposes env vars prefixed with VITE_ to the client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "[supabaseClient] Missing Supabase environment variables. " +
    "Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env"
  );
}

// Configure Supabase client with enhanced options
// - Session persistence: Store auth session in localStorage for persistence across page reloads
// - Token auto-refresh: Automatically refresh expired tokens
// - Public schema: Use 'public' schema for all tables (lessons, practice_units, etc.)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage (default behavior, explicitly stated for clarity)
    storageKey: "mts-supabase-auth-token",
    storage: window.localStorage,
    
    // Auto-refresh tokens when they expire
    autoRefreshToken: true,
    
    // Persist session across page reloads
    persistSession: true,
    
    // Detect session from URL hash (for magic links and OAuth callbacks)
    detectSessionInUrl: true,
    
    // Flow type for PKCE (more secure for SPAs)
    flowType: "pkce",
  },
  db: {
    // Use 'public' schema where our tables live
    schema: "public",
  },
  global: {
    headers: {
      // Add custom header to identify the app
      "X-Client-Info": "music-tutor-studio-spa",
    },
  },
});

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const { data } = await supabase.auth.getSession();
  return !!data?.session?.user;
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

// Helper function to get current user ID
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

export default supabase;
