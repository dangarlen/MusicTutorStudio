// Supabase client initializer for Vite-based apps
// Configure env in .env or system: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// Falls back to window.__SUPABASE_URL__ and window.__SUPABASE_ANON_KEY__ if provided.
import { createClient } from '@supabase/supabase-js'

const url = import.meta?.env?.VITE_SUPABASE_URL || (typeof window !== 'undefined' && window.__SUPABASE_URL__)
const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY || (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__)

let supabase = null

export function getSupabase() {
  if (!supabase) {
    if (!url || !key) {
      console.warn('[supabaseClient] Missing Supabase URL/Anon Key. Save/Recall disabled until configured.')
      return null
    }
    supabase = createClient(url, key)
  }
  return supabase
}

export function isSupabaseConfigured() {
  return Boolean(url && key)
}

export default getSupabase
