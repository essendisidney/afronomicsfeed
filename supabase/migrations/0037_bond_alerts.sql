-- Applied 13 Oct 2026. Bond-result email alerts for API key holders (master plan v2, build item 2; decision D-016).
--
-- Every live API key with an email (pilot or paid: data_keys.email, from 0035; not revoked, not expired) gets one
-- email per market per auction day when a reader adds new bond auction results: the market, the date, each line
-- (tenor or ISIN, rate, bid cover, amount), the source link and the market page. Sent by app/api/send/bond-alerts,
-- which the African auctions workflow calls after its data commit. New results come from data/latency.json (the
-- results each run first saw, written by scripts/latency.py), so history never goes out.
--
-- Until this is applied the sender reports "not set up" and sends nothing.
--
--   key_alert_prefs   one row per key-holder email: its unsubscribe token, an opt-out, and (for later) markets to
--                     limit the emails to (null = every market). Rows are created by af_bond_alert_recipients.
--   key_alert_sends   one row per email, market and auction day, claimed before the send: the primary key is what
--                     makes a second send of the same auction impossible, even from two overlapping runs.
--
-- Same model as the other alert tables: RLS on, no policies, SECURITY DEFINER functions. Listing, claiming and
-- releasing need the 'cron' secret; unsubscribe takes the email's own token as proof.
-- Callers: app/api/send/bond-alerts (recipients, claim, release), app/api/bond-alerts/unsubscribe (unsubscribe).

create table if not exists public.key_alert_prefs (
  email text primary key check (email = lower(email) and length(email) between 6 and 200 and position('@' in email) > 1),
  token text not null unique,
  markets text[],
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table public.key_alert_prefs enable row level security;

create table if not exists public.key_alert_sends (
  email text not null,
  market text not null check (length(market) between 2 and 40),
  auction_date date not null,
  claimed_at timestamptz not null default now(),
  primary key (email, market, auction_date)
);
alter table public.key_alert_sends enable row level security;

-- Who gets bond alerts now: the distinct emails on live keys (not revoked, not expired), each with its token and
-- markets, leaving out anyone who unsubscribed. Creates the preference row (and token) the first time it sees an email.
create or replace function public.af_bond_alert_recipients(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  insert into public.key_alert_prefs (email, token)
  select e.email, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  from (
    select distinct lower(trim(k.email)) as email
    from public.data_keys k
    where k.email is not null and position('@' in k.email) > 1
      and k.revoked_at is null and (k.expires_at is null or k.expires_at > now())
  ) e
  where length(e.email) between 6 and 200
  on conflict (email) do nothing;
  return coalesce((
    select jsonb_agg(jsonb_build_object('email', p.email, 'token', p.token, 'markets', p.markets) order by p.email)
    from public.key_alert_prefs p
    where p.unsubscribed_at is null
      and exists (
        select 1 from public.data_keys k
        where lower(trim(k.email)) = p.email and k.revoked_at is null and (k.expires_at is null or k.expires_at > now())
      )
  ), '[]'::jsonb);
end;
$$;

-- Claim one email for one market's auction day before sending: true only the first time, ever.
create or replace function public.af_bond_alert_claim(p_secret text, p_email text, p_market text, p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return false;
  end if;
  insert into public.key_alert_sends (email, market, auction_date) values (lower(trim(p_email)), p_market, p_date)
  on conflict do nothing;
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

-- The send failed: hand the claim back so the next run tries again.
create or replace function public.af_bond_alert_release(p_secret text, p_email text, p_market text, p_date date)
returns boolean
language sql
security definer
set search_path = public
as $$
  with gone as (
    delete from public.key_alert_sends
    where email = lower(trim(p_email)) and market = p_market and auction_date = p_date
      and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
    returning 1
  )
  select exists (select 1 from gone);
$$;

-- One-click stop from the email's link. Returns how many addresses were stopped (0 or 1).
create or replace function public.af_bond_alert_unsubscribe(p_token text)
returns int
language sql
security definer
set search_path = public
as $$
  with stopped as (
    update public.key_alert_prefs set unsubscribed_at = now()
    where token = p_token and length(p_token) >= 32 and unsubscribed_at is null
    returning 1
  )
  select count(*)::int from stopped;
$$;

revoke all on function public.af_bond_alert_recipients(text) from public;
revoke all on function public.af_bond_alert_claim(text, text, text, date) from public;
revoke all on function public.af_bond_alert_release(text, text, text, date) from public;
revoke all on function public.af_bond_alert_unsubscribe(text) from public;
grant execute on function public.af_bond_alert_recipients(text) to anon, authenticated, service_role;
grant execute on function public.af_bond_alert_claim(text, text, text, date) to anon, authenticated, service_role;
grant execute on function public.af_bond_alert_release(text, text, text, date) to anon, authenticated, service_role;
grant execute on function public.af_bond_alert_unsubscribe(text) to anon, authenticated, service_role;
