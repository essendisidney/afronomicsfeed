-- Applied 12 Oct 2026. Tender alerts: a business gives an email and up to 10 keywords ("ICT", "cleaning",
-- "Kisumu") and gets every open Kenyan government tender matching them, then each new match every morning.
-- Double opt-in like rate alerts (0017): nothing is sent until the emailed link is opened. Free for 14 days from
-- confirming; then paid_until (set from the desk when a payment is received) keeps it running. While no payment
-- method is configured (af_secrets 'tender_pay'), alerts keep running free: nobody is cut off without a way to pay.
--
-- RLS on, no public policies; only these SECURITY DEFINER functions. Create, list, mark and extend need the shared
-- 'cron' secret; confirm and unsubscribe take the alert's own token as proof.
-- Callers: app/api/tender-alerts (create), …/confirm, …/unsubscribe, app/api/send/tender-alerts (list, mark),
-- app/api/desk (extend).

create table if not exists public.tender_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) between 6 and 200 and position('@' in email) > 1),
  keywords text[] not null check (cardinality(keywords) between 1 and 10),
  token text not null unique,
  created_at timestamptz not null default now(),
  confirm_sent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  trial_until date,
  paid_until date,
  last_sent_at timestamptz,          -- tenders first seen after this are new to the reader
  sends int not null default 0,
  reminded_at timestamptz            -- when the trial-ended payment note was last sent
);
alter table public.tender_alerts enable row level security;
create unique index if not exists tender_alerts_live_uniq on public.tender_alerts (lower(email)) where unsubscribed_at is null;
create index if not exists tender_alerts_created_idx on public.tender_alerts (created_at);

-- Create or re-request. Returns {status: 'pending'|'active'|'limited', token?, resend?}. A pending request takes
-- the new keywords; an active alert is left as it is (the form never changes someone else's alert).
create or replace function public.af_tender_alert_create(p_secret text, p_email text, p_keywords text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.tender_alerts%rowtype;
  v_token text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or cardinality(p_keywords) not between 1 and 10 then
    return jsonb_build_object('status', 'limited');
  end if;
  select * into v_row from public.tender_alerts r where lower(r.email) = v_email and r.unsubscribed_at is null;
  if found then
    if v_row.confirmed_at is not null then
      return jsonb_build_object('status', 'active');
    end if;
    update public.tender_alerts set keywords = p_keywords where id = v_row.id;
    if v_row.confirm_sent_at < now() - interval '10 minutes' then
      update public.tender_alerts set confirm_sent_at = now() where id = v_row.id;
      return jsonb_build_object('status', 'pending', 'token', v_row.token, 'resend', true);
    end if;
    return jsonb_build_object('status', 'pending', 'resend', false);
  end if;
  if (select count(*) from public.tender_alerts r where lower(r.email) = v_email and r.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.tender_alerts r where r.confirmed_at is null and r.created_at > now() - interval '1 hour') >= 200 then
    return jsonb_build_object('status', 'limited');
  end if;
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.tender_alerts (email, keywords, token) values (v_email, p_keywords, v_token);
  return jsonb_build_object('status', 'pending', 'token', v_token, 'resend', true);
end;
$$;

-- Confirm from the emailed link: starts the 14-day trial. Returns the keywords, or null for an unknown token.
create or replace function public.af_tender_alert_confirm(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.tender_alerts
  set confirmed_at = coalesce(confirmed_at, now()),
      trial_until = coalesce(trial_until, ((now() at time zone 'Africa/Nairobi')::date + 14))
  where token = p_token and length(p_token) >= 32 and unsubscribed_at is null
  returning jsonb_build_object('keywords', keywords, 'trial_until', trial_until);
$$;

create or replace function public.af_tender_alert_unsubscribe(p_token text)
returns int
language sql
security definer
set search_path = public
as $$
  with stopped as (
    update public.tender_alerts set unsubscribed_at = now()
    where token = p_token and length(p_token) >= 32 and unsubscribed_at is null
    returning 1
  )
  select count(*)::int from stopped;
$$;

-- Confirmed, live alerts for the sender, with the payment instructions (null while none is configured).
create or replace function public.af_tender_alerts_live(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  return jsonb_build_object(
    'pay', (select k.value from public.af_secrets k where k.name = 'tender_pay'),
    'alerts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'email', r.email, 'keywords', r.keywords, 'token', r.token, 'trial_until', r.trial_until,
        'paid_until', r.paid_until, 'last_sent_at', r.last_sent_at, 'reminded_at', r.reminded_at, 'sends', r.sends
      ) order by r.created_at)
      from public.tender_alerts r
      where r.confirmed_at is not null and r.unsubscribed_at is null
    ), '[]'::jsonb)
  );
end;
$$;

-- Compare-and-set the last send, so overlapping runs never send twice. p_reminded stamps the payment note instead.
create or replace function public.af_tender_alert_mark(p_secret text, p_id uuid, p_prev timestamptz, p_at timestamptz, p_reminded boolean default false)
returns boolean
language sql
security definer
set search_path = public
as $$
  with done as (
    update public.tender_alerts
    set last_sent_at = case when p_reminded then last_sent_at else p_at end,
        sends = sends + case when p_reminded then 0 else 1 end,
        reminded_at = case when p_reminded then p_at else reminded_at end
    where id = p_id
      and (case when p_reminded then reminded_at else last_sent_at end) is not distinct from p_prev
      and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
    returning 1
  )
  select exists (select 1 from done);
$$;

-- A payment was received: extend the alert on that address by p_months from today or from its paid date.
create or replace function public.af_tender_alert_extend(p_secret text, p_email text, p_months int)
returns date
language sql
security definer
set search_path = public
as $$
  update public.tender_alerts
  set paid_until = greatest(coalesce(paid_until, current_date), coalesce(trial_until, current_date), current_date) + make_interval(months => p_months),
      reminded_at = null
  where lower(email) = lower(trim(p_email)) and unsubscribed_at is null and confirmed_at is not null and p_months between 1 and 24
    and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
  returning paid_until;
$$;

revoke all on function public.af_tender_alert_create(text, text, text[]) from public;
revoke all on function public.af_tender_alert_confirm(text) from public;
revoke all on function public.af_tender_alert_unsubscribe(text) from public;
revoke all on function public.af_tender_alerts_live(text) from public;
revoke all on function public.af_tender_alert_mark(text, uuid, timestamptz, timestamptz, boolean) from public;
revoke all on function public.af_tender_alert_extend(text, text, int) from public;
grant execute on function public.af_tender_alert_create(text, text, text[]) to anon, authenticated, service_role;
grant execute on function public.af_tender_alert_confirm(text) to anon, authenticated, service_role;
grant execute on function public.af_tender_alert_unsubscribe(text) to anon, authenticated, service_role;
grant execute on function public.af_tender_alerts_live(text) to anon, authenticated, service_role;
grant execute on function public.af_tender_alert_mark(text, uuid, timestamptz, timestamptz, boolean) to anon, authenticated, service_role;
grant execute on function public.af_tender_alert_extend(text, text, int) to anon, authenticated, service_role;
