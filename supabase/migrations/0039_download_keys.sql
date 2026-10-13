-- NOT APPLIED. Full-history downloads in a browser, and download keys for Analyst buyers (decision D-016).
--
-- 1. data_keys.plan gains 'analyst': a key for full-history CSV downloads only. The app refuses it on the JSON API
--    (lib/api.ts DOWNLOAD_ONLY_PLANS) and accepts it on /api/data CSV files, by header or browser session.
-- 2. af_api_key_use_hash: the same check-and-count as af_api_key_use (0028, 0035), by the key's SHA-256 fingerprint.
--    A browser download session (/downloads, lib/downloads.ts) holds only that fingerprint, never the key, so each
--    download can still be refused for a revoked or expired key and counted per key in data_key_usage.
-- 3. af_paid_key_issue also issues (and renews) a key for Analyst payments (checkout plans analyst, analyst_ke), as
--    plan 'analyst'; Team and API (data_team, data_team_ke) is unchanged, plan 'data_api'. A renewal extends the
--    buyer's key of the same tier only, so an Analyst payment never extends a Team key or the reverse.
--
-- Safe to apply on the live database, in any order with the deploy:
--   * the plan check is replaced by a strictly wider one (every existing row still passes);
--   * one new function; af_paid_key_issue keeps its signature and its behaviour for Team and API.
-- Before it is applied the app keeps working: download sessions are honoured for their 12 hours without per-download
-- checks or counts (the sign-in itself is checked and counted by af_api_key_use), and Analyst payments get
-- "Analyst keys need migration 0039" and go to the desk, as today.
--
-- Same model as 0028 / 0035 / 0036: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

-- 1. The plan check. Postgres named the inline check in 0028 data_keys_plan_check; drop any check on plan whatever
--    its name, then add the wider one.
do $$
declare
  c record;
begin
  for c in
    select con.conname from pg_constraint con
    where con.conrelid = 'public.data_keys'::regclass and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%plan%'
  loop
    execute format('alter table public.data_keys drop constraint %I', c.conname);
  end loop;
end;
$$;
alter table public.data_keys add constraint data_keys_plan_check
  check (plan in ('startup', 'institution', 'data_api', 'enterprise', 'trial', 'analyst'));

-- 2. Check a key by its fingerprint and count the call: the plan, or null for an unknown, revoked or expired key
--    (and for a wrong secret).
create or replace function public.af_api_key_use_hash(p_secret text, p_key_hash text, p_path text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_plan text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  if coalesce(p_key_hash, '') !~ '^[0-9a-f]{64}$' then return null; end if;
  select id, plan into v_id, v_plan from public.data_keys
  where key_hash = p_key_hash
    and revoked_at is null
    and (expires_at is null or expires_at > now());
  if not found then return null; end if;
  update public.data_keys set last_used_at = now() where id = v_id;
  insert into public.data_key_usage (key_id, day, path, calls) values (v_id, current_date, left(coalesce(p_path, '/'), 200), 1)
  on conflict (key_id, day, path) do update set calls = data_key_usage.calls + 1;
  return v_plan;
end;
$$;

revoke all on function public.af_api_key_use_hash(text, text, text) from public;
grant execute on function public.af_api_key_use_hash(text, text, text) to anon, authenticated, service_role;

-- 3. Issue or extend the paid key for a recorded payment: as in 0036, for Analyst too. Returns are unchanged:
--   {status: 'issued' | 'renewed', key_id, prefix, paid_until, expires_at}
--   {status: 'duplicate', outcome, key_id, prefix, expires_at, revealed, emailed}
--   {status: 'no_payment' | 'not_paid' | 'test_refused' | 'wrong_plan' | 'bad_input'}, or null for a wrong secret.
create or replace function public.af_paid_key_issue(
  p_secret text,
  p_reference text,
  p_months int,
  p_key_hash text,
  p_prefix text,
  p_label text,
  p_allow_test boolean,
  p_reveal boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay public.payments%rowtype;
  v_email text;
  v_test boolean;
  v_key_plan text;
  v_tier text;
  v_link public.paid_key_payments%rowtype;
  v_key public.data_keys%rowtype;
  v_paid_until timestamptz;
  v_expires timestamptz;
  v_id bigint;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  if p_reference is null or length(p_reference) not between 6 and 120 or p_months is null or p_months not between 1 and 12
     or coalesce(p_key_hash, '') !~ '^[0-9a-f]{64}$' or coalesce(p_prefix, '') !~ '^afk_[0-9a-f]{6}$' then
    return jsonb_build_object('status', 'bad_input');
  end if;

  select * into v_pay from public.payments where reference = p_reference;
  if not found then return jsonb_build_object('status', 'no_payment'); end if;
  v_key_plan := case
    when v_pay.plan in ('data_team', 'data_team_ke') then 'data_api'
    when v_pay.plan in ('analyst', 'analyst_ke') then 'analyst'
  end;
  if v_key_plan is null then return jsonb_build_object('status', 'wrong_plan'); end if;
  v_tier := case when v_key_plan = 'analyst' then 'Analyst' else 'Team and API' end;
  v_email := lower(trim(coalesce(v_pay.email, '')));
  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(v_email) > 200 then return jsonb_build_object('status', 'bad_input'); end if;
  v_test := v_pay.status = 'test';
  if v_test and not coalesce(p_allow_test, false) then return jsonb_build_object('status', 'test_refused'); end if;
  if v_pay.status <> 'success' and not v_test then return jsonb_build_object('status', 'not_paid'); end if;

  -- One buyer at a time, so a webhook and a return page (or two renewals) cannot both issue.
  perform pg_advisory_xact_lock(hashtext('af_paid_key:' || v_email));

  select * into v_link from public.paid_key_payments where reference = p_reference;
  if found then
    return jsonb_build_object('status', 'duplicate', 'outcome', v_link.outcome, 'key_id', v_link.key_id,
      'prefix', (select prefix from public.data_keys where id = v_link.key_id), 'paid_until', v_link.paid_until,
      'expires_at', v_link.expires_at, 'revealed', v_link.revealed_at is not null, 'emailed', v_link.emailed_at is not null);
  end if;

  -- Renewal: the latest unrevoked key of the same tier this email was issued by payment (test keys only renew test keys).
  select k.* into v_key from public.data_keys k
  where k.revoked_at is null and k.plan = v_key_plan
    and exists (select 1 from public.paid_key_payments l where l.key_id = k.id and l.outcome = 'issued' and l.email = v_email and l.is_test = v_test)
  order by k.expires_at desc nulls last
  limit 1;

  if v_test then
    v_paid_until := now() + interval '1 day';   -- test keys are short-lived whatever the amount
    v_expires := v_paid_until;
  elsif v_key.id is not null then
    -- Paid early: the new month starts where the old one ends. Lapsed: it starts on the day of payment.
    v_paid_until := greatest(coalesce(v_key.paid_until, v_pay.paid_at), coalesce(v_pay.paid_at, now())) + make_interval(months => p_months);
    v_expires := v_paid_until + interval '3 days';
  else
    v_paid_until := coalesce(v_pay.paid_at, now()) + make_interval(months => p_months);
    v_expires := v_paid_until + interval '3 days';
  end if;

  if v_key.id is not null then
    update public.data_keys set paid_until = v_paid_until, expires_at = greatest(v_expires, coalesce(expires_at, v_expires))
    where id = v_key.id
    returning expires_at into v_expires;
    insert into public.paid_key_payments (reference, key_id, email, plan, months, outcome, is_test, paid_until, expires_at)
    values (p_reference, v_key.id, v_email, v_pay.plan, p_months, 'renewed', v_test, v_paid_until, v_expires);
    return jsonb_build_object('status', 'renewed', 'key_id', v_key.id, 'prefix', v_key.prefix, 'paid_until', v_paid_until, 'expires_at', v_expires);
  end if;

  insert into public.data_keys (key_hash, prefix, label, plan, expires_at, email, domain, paid_until)
  values (p_key_hash, p_prefix, left(coalesce(nullif(trim(p_label), ''), v_tier || ': ' || v_email), 120), v_key_plan,
          v_expires, v_email, split_part(v_email, '@', 2), v_paid_until)
  returning id into v_id;
  insert into public.paid_key_payments (reference, key_id, email, plan, months, outcome, is_test, paid_until, expires_at, revealed_at)
  values (p_reference, v_id, v_email, v_pay.plan, p_months, 'issued', v_test, v_paid_until, v_expires,
          case when coalesce(p_reveal, false) then now() end);
  if coalesce(p_reveal, false) then
    update public.payments set access_sent_at = coalesce(access_sent_at, now()) where reference = p_reference;
  end if;
  return jsonb_build_object('status', 'issued', 'key_id', v_id, 'prefix', p_prefix, 'paid_until', v_paid_until, 'expires_at', v_expires);
exception
  when unique_violation then return jsonb_build_object('status', 'bad_input');   -- the same key hash already exists
  when check_violation then return jsonb_build_object('status', 'bad_input');
end;
$$;

revoke all on function public.af_paid_key_issue(text, text, int, text, text, text, boolean, boolean) from public;
grant execute on function public.af_paid_key_issue(text, text, int, text, text, text, boolean, boolean) to anon, authenticated, service_role;
