// Centralized Supabase client (singleton) for the Vue SPA
// Avoids multiple GoTrueClient instances across HMR/component reloads
import { createClient } from "@supabase/supabase-js";

// TODO: If you want to avoid committing keys, load from environment instead.
// For now we use the provided project URL and anon key.
const SUPABASE_URL = "https://rlcepiyvbxfzjtrxpqad.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsY2VwaXl2Ynhmemp0cnhwcWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDYzNzgsImV4cCI6MjA3ODAyMjM3OH0.OHVFiRYMPNdplLsH4Wp1TO9oxkWiGJ4QDQiVSH3PUJE";

// Your PostgREST is configured to expose ONLY the 'api' schema
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: "api",
  },
});
export default supabase;
