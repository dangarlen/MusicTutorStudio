// Centralized Supabase client (singleton) for the Vue SPA
// Avoids multiple GoTrueClient instances across HMR/component reloads
import { createClient } from "@supabase/supabase-js";

// TODO: If you want to avoid committing keys, load from environment instead.
// For now we use the provided project URL and anon key.
const SUPABASE_URL = "https://rlcepiyvbxfzjtrxpqad.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsY2VwaXl2Ynhmemp0cnhwcWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDYzNzgsImV4cCI6MjA3ODAyMjM3OH0.OHVFiRYMPNdplLsH4Wp1TO9oxkWiGJ4QDQiVSH3PUJE";

// NOTE: Previously forced to use the 'api' schema. Our new tables (lessons, lesson_units)
// live in the 'public' schema. Switch the default schema to 'public' so standard
// supabase.from('lessons') resolves correctly. If we later migrate everything
// into 'api' just flip this back.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: "public",
  },
});
export default supabase;
