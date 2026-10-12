-- Applied 12 Oct 2026. Data v1 (master plan): API keys for licensed data customers.
--
-- The open API (/api/v1) stays free and keyless. A key identifies a licensed customer: each keyed call is counted
-- per key, day and path (for invoices and support), served fresh rather than from the shared cache, and a revoked
-- or wrong key is refused. Keys are issued on the desk and shown once; only their SHA-256 hash is stored.
--
-- Tables are data_keys and data_key_usage (the unused api_keys/api_usage from 0001 are left alone).
-- Same model as the other desk functions: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

create table if not exists public.data_keys (
  id bigint generated always as identity primary key,
  key_hash text not null unique,
  prefix text not null,               -- first characters, so the desk can tell keys apart without the secret
  label text not null check (length(label) between 2 and 120),
  plan text not null check (plan in ('startup', 'institution', 'data_api', 'enterprise', 'trial')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
alter table public.data_keys enable row level security;

create table if not exists public.data_key_usage (
  key_id bigint not null references public.data_keys (id) on delete cascade,
  day date not null default current_date,
  path text not null,
  calls int not null default 0,
  primary key (key_id, day, path)
);
alter table public.data_key_usage enable row level security;

-- Issue a key: returns the key itself, once. Needs the cron secret (the desk key).
create or replace function public.af_api_key_create(p_secret text, p_label text, p_plan text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  v_key := 'afk_' || encode(gen_random_bytes(24), 'hex');
  insert into public.data_keys (key_hash, prefix, label, plan)
  values (encode(digest(v_key, 'sha256'), 'hex'), left(v_key, 10), left(trim(p_label), 120), p_plan);
  return jsonb_build_object('key', v_key, 'prefix', left(v_key, 10), 'label', left(trim(p_label), 120), 'plan', p_plan);
end;
$$;

-- Check a key and count the call: returns the plan, or null for a wrong or revoked key.
create or replace function public.af_api_key_use(p_secret text, p_key text, p_path text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id bigint;
  v_plan text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  select id, plan into v_id, v_plan from public.data_keys
  where key_hash = encode(digest(coalesce(p_key, ''), 'sha256'), 'hex') and revoked_at is null;
  if not found then return null; end if;
  update public.data_keys set last_used_at = now() where id = v_id;
  insert into public.data_key_usage (key_id, day, path, calls) values (v_id, current_date, left(coalesce(p_path, '/'), 200), 1)
  on conflict (key_id, day, path) do update set calls = data_key_usage.calls + 1;
  return v_plan;
end;
$$;

-- Revoke a key by its id (from the desk list).
create or replace function public.af_api_key_revoke(p_secret text, p_id bigint)
returns boolean
language sql
security definer
set search_path = public
as $$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  r as (update public.data_keys set revoked_at = now() where id = p_id and revoked_at is null and (select yes from ok) returning 1)
  select case when not (select yes from ok) then null else exists (select 1 from r) end;
$$;

-- Keys with their use over the last 30 days, for the desk.
create or replace function public.af_api_keys_list(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', k.id, 'prefix', k.prefix, 'label', k.label, 'plan', k.plan, 'created_at', k.created_at,
      'revoked_at', k.revoked_at, 'last_used_at', k.last_used_at,
      'calls_30d', (select coalesce(sum(u.calls), 0) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 30)
    ) order by k.created_at desc)
    from public.data_keys k), '[]'::jsonb)
  end;
$$;

revoke all on function public.af_api_key_create(text, text, text) from public;
revoke all on function public.af_api_key_use(text, text, text) from public;
revoke all on function public.af_api_key_revoke(text, bigint) from public;
revoke all on function public.af_api_keys_list(text) from public;
grant execute on function public.af_api_key_create(text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_api_key_use(text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_api_key_revoke(text, bigint) to anon, authenticated, service_role;
grant execute on function public.af_api_keys_list(text) to anon, authenticated, service_role;
