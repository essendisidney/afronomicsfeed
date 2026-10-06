-- Applied 6 Oct 2026. Email rate alerts: a reader asks to be told when a rate moves (Kenya T-bill above/below a level, every Kenya
-- auction, a new Nigeria savings bond offer, any central-bank policy rate change). Double opt-in: nothing is sent
-- until the link in the confirmation email is opened. Every alert email carries a one-click unsubscribe link.
--
-- RLS on, no public policies: nobody reads or writes the table through the API. The site works only through the
-- SECURITY DEFINER functions below. Creating an alert and reading the list need the shared 'cron' secret
-- (af_secrets, migration 0012; AF_CRON_SECRET on Vercel), so a token is only ever released to the server, which
-- emails it to the address given. Confirm and unsubscribe take the token itself as proof.
--
-- Callers: app/api/rate-alerts (create), app/api/rate-alerts/confirm, app/api/rate-alerts/unsubscribe,
-- app/api/send/rate-alerts (list + mark sent, called by the African auctions / Kenya quick check workflows).

create table if not exists public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) between 6 and 200 and position('@' in email) > 1),
  kind text not null check (kind in ('tbill_above', 'tbill_below', 'auction', 'ng_savings_bond', 'policy_change')),
  tenor smallint check (tenor in (91, 182, 364)),
  threshold numeric(6, 2) check (threshold > 0 and threshold < 100),
  token text not null unique,
  created_at timestamptz not null default now(),
  confirm_sent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_key text,                 -- what the reader was last told about (auction value date, offer name, ...)
  last_sent_at timestamptz,
  check ((kind in ('tbill_above', 'tbill_below')) = (tenor is not null and threshold is not null))
);
alter table public.rate_alerts enable row level security;

-- One live alert per address and setting.
create unique index if not exists rate_alerts_live_uniq
  on public.rate_alerts (lower(email), kind, coalesce(tenor, 0), coalesce(threshold, -1))
  where unsubscribed_at is null;
create index if not exists rate_alerts_email_idx on public.rate_alerts (lower(email));
create index if not exists rate_alerts_created_idx on public.rate_alerts (created_at);

-- Create (or re-request) an alert. Returns jsonb {status, token?, resend?}:
--   status 'pending'  token + resend: send (or re-send) the confirmation email when resend is true
--   status 'active'   already confirmed; nothing to send
--   status 'limited'  too many requests for this address, too many alerts on it, or too many unconfirmed overall
-- p_baseline is the current data key, so a new alert only reports what is published after it was set.
create or replace function public.af_rate_alert_create(
  p_email text, p_kind text, p_tenor int, p_threshold numeric, p_baseline text, p_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_tenor smallint := case when p_kind in ('tbill_above', 'tbill_below') then p_tenor else null end;
  v_threshold numeric(6, 2) := case when p_kind in ('tbill_above', 'tbill_below') then round(p_threshold, 2) else null end;
  v_row public.rate_alerts%rowtype;
  v_token text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;

  select * into v_row from public.rate_alerts r
  where lower(r.email) = v_email and r.kind = p_kind
    and coalesce(r.tenor, 0) = coalesce(v_tenor, 0) and coalesce(r.threshold, -1) = coalesce(v_threshold, -1)
    and r.unsubscribed_at is null;

  if found then
    if v_row.confirmed_at is not null then
      return jsonb_build_object('status', 'active');
    end if;
    -- Re-send the confirmation at most once every 10 minutes.
    if v_row.confirm_sent_at < now() - interval '10 minutes' then
      update public.rate_alerts set confirm_sent_at = now() where id = v_row.id;
      return jsonb_build_object('status', 'pending', 'token', v_row.token, 'resend', true);
    end if;
    return jsonb_build_object('status', 'pending', 'resend', false);
  end if;

  -- Limits: 5 new requests an hour per address, 20 live alerts per address, 300 unconfirmed requests an hour overall.
  if (select count(*) from public.rate_alerts r where lower(r.email) = v_email and r.created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.rate_alerts r where lower(r.email) = v_email and r.unsubscribed_at is null) >= 20
     or (select count(*) from public.rate_alerts r where r.confirmed_at is null and r.created_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('status', 'limited');
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.rate_alerts (email, kind, tenor, threshold, token, last_sent_key)
  values (v_email, p_kind, v_tenor, v_threshold, v_token, nullif(left(p_baseline, 200), ''));
  return jsonb_build_object('status', 'pending', 'token', v_token, 'resend', true);
end;
$$;

-- Confirm from the emailed link. Returns the alert's settings, or null for an unknown or stopped token.
create or replace function public.af_rate_alert_confirm(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.rate_alerts set confirmed_at = coalesce(confirmed_at, now())
  where token = p_token and length(p_token) >= 32 and unsubscribed_at is null
  returning jsonb_build_object('kind', kind, 'tenor', tenor, 'threshold', threshold);
$$;

-- One-click unsubscribe. p_all stops every alert on the same address. Returns the number of alerts stopped
-- (0 for an unknown token or one already stopped).
create or replace function public.af_rate_alert_unsubscribe(p_token text, p_all boolean default false)
returns int
language sql
security definer
set search_path = public
as $$
  with target as (select lower(email) as email from public.rate_alerts where token = p_token and length(p_token) >= 32),
  stopped as (
    update public.rate_alerts r set unsubscribed_at = now()
    where r.unsubscribed_at is null
      and (r.token = p_token or (p_all and lower(r.email) in (select email from target)))
    returning 1
  )
  select count(*)::int from stopped;
$$;

-- Confirmed, live alerts for the sender. Released only to a caller holding the shared secret.
-- (Housekeeping is added in 0018.)
create or replace function public.af_rate_alerts_live(p_secret text)
returns table(id uuid, email text, kind text, tenor smallint, threshold numeric, token text, last_sent_key text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return;
  end if;
  return query
    select r.id, r.email, r.kind, r.tenor, r.threshold, r.token, r.last_sent_key
    from public.rate_alerts r
    where r.confirmed_at is not null and r.unsubscribed_at is null
    order by r.created_at
    limit 5000;
end;
$$;

-- Record what an alert last reported, so nothing goes out twice. Compare-and-set: only moves last_sent_key from
-- p_prev to p_key, and returns false if another run got there first. The sender claims an alert this way before
-- sending and moves it back (p_prev = new key, p_key = old key, p_sent false) if the send fails.
-- p_sent false records a baseline (or a rollback) without stamping last_sent_at.
create or replace function public.af_rate_alert_mark_sent(p_secret text, p_id uuid, p_prev text, p_key text, p_sent boolean default true)
returns boolean
language sql
security definer
set search_path = public
as $$
  with done as (
    update public.rate_alerts
    set last_sent_key = left(p_key, 200), last_sent_at = case when p_sent then now() else last_sent_at end
    where id = p_id
      and last_sent_key is not distinct from p_prev
      and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
    returning 1
  )
  select exists (select 1 from done);
$$;

revoke all on function public.af_rate_alert_create(text, text, int, numeric, text, text) from public;
revoke all on function public.af_rate_alert_confirm(text) from public;
revoke all on function public.af_rate_alert_unsubscribe(text, boolean) from public;
revoke all on function public.af_rate_alerts_live(text) from public;
revoke all on function public.af_rate_alert_mark_sent(text, uuid, text, text, boolean) from public;
grant execute on function public.af_rate_alert_create(text, text, int, numeric, text, text) to anon, authenticated, service_role;
grant execute on function public.af_rate_alert_confirm(text) to anon, authenticated, service_role;
grant execute on function public.af_rate_alert_unsubscribe(text, boolean) to anon, authenticated, service_role;
grant execute on function public.af_rate_alerts_live(text) to anon, authenticated, service_role;
grant execute on function public.af_rate_alert_mark_sent(text, uuid, text, text, boolean) to anon, authenticated, service_role;
