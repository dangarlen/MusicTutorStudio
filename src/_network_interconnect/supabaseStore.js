// High-level data helpers for persisting network JSON in Supabase
// Exposes simple CRUD functions. Keep UI logic in components.
import getSupabase from './supabaseClient'

const TABLE = 'network_topologies' // expected columns: id(uuid pk), name(text), data(jsonb), created_at, updated_at

export async function listTopologies() {
  const sb = getSupabase()
  if (!sb) return { data: [], error: 'Supabase not configured' }
  const { data, error } = await sb
    .from(TABLE)
    .select('id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })
  return { data: data || [], error }
}

export async function saveTopology(name, jsonObj) {
  const sb = getSupabase()
  if (!sb) return { data: null, error: 'Supabase not configured' }
  if (!name || typeof name !== 'string') return { data: null, error: 'A non-empty name is required' }
  const payload = { name, data: jsonObj }
  // upsert by name for convenience
  const { data, error } = await sb
    .from(TABLE)
    .upsert(payload, { onConflict: 'name' })
    .select('id, name, updated_at')
    .single()
  return { data, error }
}

export async function fetchTopologyById(id) {
  const sb = getSupabase()
  if (!sb) return { data: null, error: 'Supabase not configured' }
  const { data, error } = await sb
    .from(TABLE)
    .select('id, name, data, updated_at')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function deleteTopology(id) {
  const sb = getSupabase()
  if (!sb) return { data: null, error: 'Supabase not configured' }
  const { error } = await sb
    .from(TABLE)
    .delete()
    .eq('id', id)
  return { data: id, error }
}

export default {
  listTopologies,
  saveTopology,
  fetchTopologyById,
  deleteTopology,
}
