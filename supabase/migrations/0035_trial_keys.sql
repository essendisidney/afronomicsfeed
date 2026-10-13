-- Applied 13 Oct 2026. Self-serve 30-day pilot keys for the frontier local-debt data (/api/pilot).
--
-- Until this is applied, /api/pilot records the lead and the deal and tells the requester the key arrives within one
-- working day (the desk issues it from /desk as today). Once applied, /api/pilot issues the key on the spot through
-- af_trial_key_issue; nothing else in the app needs to change.
--
-- Why a migration is needed before keys can be issued instantly: data_keys (0028) has no expiry, so a "30-day" key
-- issued by af_api_key_create would never stop working, and nothing limits how many keys one organisation can take.
-- This adds:
--   * data_keys.expires_at, .email, .domain (all nullable: existing keys keep working exactly as before)
--   * af_api_key_use refuses a key whose expires_at has passed (otherwise unchanged)
--   * af_trial_key_issue: one live trial key per email, at most 3 trial keys per email domain in 90 days,
--     at most 40 self-serve trial keys across everyone per day; free-webmail domains are refused in the app before
--     this is called and again here
--   * af_api_keys_list also returns expires_at and email, so the desk can see which keys are pilots and when they end
--
-- Same model as 0028: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

alter table public.data_keys add column if not exists expires_at timestamptz;
alter table public.data_keys add column if not exists email text check (email is null or length(email) <= 200);
alter table public.data_keys add column if not exists domain text check (domain is null or length(domain) <= 200);
create index if not exists data_keys_trial_domain_idx on public.data_keys (domain, created_at desc) where plan = 'trial';
create index if not exists data_keys_trial_email_idx on public.data_keys (email) where plan = 'trial';

-- Check a key and count the call: as in 0028, and an expired key is refused.
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
  where key_hash = encode(digest(coalesce(p_key, ''), 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now());
  if not found then return null; end if;
  update public.data_keys set last_used_at = now() where id = v_id;
  insert into public.data_key_usage (key_id, day, path, calls) values (v_id, current_date, left(coalesce(p_path, '/'), 200), 1)
  on conflict (key_id, day, path) do update set calls = data_key_usage.calls + 1;
  return v_plan;
end;
$$;

-- Issue a self-serve trial key. Returns {status: 'issued', key, prefix, expires_at} (the key itself, once),
-- {status: 'exists', expires_at} when this email already holds a live trial key, {status: 'limited'} when the
-- domain or daily cap is reached, {status: 'webmail'} for a free-mail domain, or null for a wrong secret / bad input.
create or replace function public.af_trial_key_issue(p_secret text, p_email text, p_label text, p_days int)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_domain text;
  v_days int := least(greatest(coalesce(p_days, 30), 1), 30);
  v_existing timestamptz;
  v_key text;
  v_expires timestamptz;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(v_email) > 200 then return null; end if;
  v_domain := split_part(v_email, '@', 2);
  if v_domain in ('gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com',
                  'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com', 'qq.com', 'ymail.com', 'msn.com', 'me.com') then
    return jsonb_build_object('status', 'webmail');
  end if;

  -- Serialise issuance per domain so two simultaneous requests cannot both pass the caps.
  perform pg_advisory_xact_lock(hashtext('af_trial_key:' || v_domain));

  select max(expires_at) into v_existing from public.data_keys
  where plan = 'trial' and email = v_email and revoked_at is null and expires_at > now();
  if v_existing is not null then
    return jsonb_build_object('status', 'exists', 'expires_at', v_existing);
  end if;
  if (select count(*) from public.data_keys where plan = 'trial' and domain = v_domain and created_at > now() - interval '90 days') >= 3 then
    return jsonb_build_object('status', 'limited');
  end if;
  if (select count(*) from public.data_keys where plan = 'trial' and email is not null and created_at > now() - interval '1 day') >= 40 then
    return jsonb_build_object('status', 'limited');
  end if;

  v_key := 'afk_' || encode(gen_random_bytes(24), 'hex');
  v_expires := now() + make_interval(days => v_days);
  insert into public.data_keys (key_hash, prefix, label, plan, expires_at, email, domain)
  values (encode(digest(v_key, 'sha256'), 'hex'), left(v_key, 10), left(coalesce(nullif(trim(p_label), ''), v_email), 120), 'trial', v_expires, v_email, v_domain);
  return jsonb_build_object('status', 'issued', 'key', v_key, 'prefix', left(v_key, 10), 'expires_at', v_expires);
exception when check_violation then
  return null;
end;
$$;

-- Keys with their use over the last 30 days, for the desk (as 0028, plus expires_at and email).
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
      'revoked_at', k.revoked_at, 'last_used_at', k.last_used_at, 'expires_at', k.expires_at, 'email', k.email,
      'calls_30d', (select coalesce(sum(u.calls), 0) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 30)
    ) order by k.created_at desc)
    from public.data_keys k), '[]'::jsonb)
  end;
$$;

revoke all on function public.af_trial_key_issue(text, text, text, int) from public;
grant execute on function public.af_trial_key_issue(text, text, text, int) to anon, authenticated, service_role;
