-- Schema scaffold for public.network_topologies
-- Safe to run in Supabase SQL Editor or via Supabase CLI migrations.
-- Notes:
-- - Upsert in the app uses ON CONFLICT (name) so we add a UNIQUE constraint on name.
-- - RLS policies include two options; choose ONE set.
-- - For production, prefer owner-based policies (Option B) and wire Supabase Auth.

-- Extensions commonly available in Supabase projects
create extension if not exists pgcrypto;

-- Table
create table if not exists public.network_topologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  data jsonb not null,
  owner uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists network_topologies_updated_at_idx on public.network_topologies (updated_at desc);
create index if not exists network_topologies_data_gin on public.network_topologies using gin (data jsonb_path_ops);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger network_topologies_set_updated_at
before update on public.network_topologies
for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.network_topologies enable row level security;

-- =========================
-- Option A: Dev-friendly policies (no Auth required)
-- WARNING: This allows anonymous read/write from clients using the anon key.
-- Uncomment if you want to start quickly without Supabase Auth.
-- drop policy if exists nt_dev_select on public.network_topologies;
-- drop policy if exists nt_dev_cud on public.network_topologies;
-- create policy nt_dev_select on public.network_topologies
--   for select using (true);
-- create policy nt_dev_cud on public.network_topologies
--   for all using (true) with check (true);

-- =========================
-- Option B: Owner-based policies (recommended)
-- 1) Use Supabase Auth in your app.
-- 2) Set the owner on insert to auth.uid() via a BEFORE INSERT trigger.
-- 3) Only owners can select/update/delete their rows.

-- Owner default trigger
create or replace function public.set_owner_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner is null then
    -- auth.uid() returns null for anonymous calls; ensure you require auth on the client
    new.owner := auth.uid();
  end if;
  return new;
end;$$;

create trigger network_topologies_set_owner
before insert on public.network_topologies
for each row execute procedure public.set_owner_on_insert();

-- Policies
drop policy if exists nt_owner_select on public.network_topologies;
drop policy if exists nt_owner_insert on public.network_topologies;
drop policy if exists nt_owner_update on public.network_topologies;
drop policy if exists nt_owner_delete on public.network_topologies;

create policy nt_owner_select on public.network_topologies
  for select using (owner = auth.uid());

create policy nt_owner_insert on public.network_topologies
  for insert with check (owner = auth.uid());

create policy nt_owner_update on public.network_topologies
  for update using (owner = auth.uid()) with check (owner = auth.uid());

create policy nt_owner_delete on public.network_topologies
  for delete using (owner = auth.uid());

-- Optional: Service role bypass via RPC or server-side usage (not needed if using service role key).
-- Service role key bypasses RLS automatically.

-- Done.
