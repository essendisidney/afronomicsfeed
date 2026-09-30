-- Auction alerts by web push. Subscriptions come from the installed app / browser; the af-push-check edge
-- function sends a notification when a market publishes a new auction result. RLS on, no public policies:
-- the site writes through the SECURITY DEFINER functions below, the edge function uses the service role.

create table if not exists public.af_push_subs (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  markets text[],            -- null = every market
  created_at timestamptz not null default now(),
  last_sent_at timestamptz
);
alter table public.af_push_subs enable row level security;

create table if not exists public.af_push_state (
  market text primary key,
  last_date text not null,
  last_rate numeric,
  updated_at timestamptz not null default now()
);
alter table public.af_push_state enable row level security;

-- VAPID key pair for signing pushes. The private key is inserted out of band, never committed.
create table if not exists public.af_push_keys (
  id int primary key default 1 check (id = 1),
  public_key text not null,
  private_key text not null,
  subject text not null default 'mailto:desk@afronomicsfeed.com'
);
alter table public.af_push_keys enable row level security;

create or replace function public.af_push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_markets text[] default null)
returns void
language sql
security definer
set search_path = public
as $$
  insert into af_push_subs (endpoint, p256dh, auth, markets)
  values (left(p_endpoint, 1000), left(p_p256dh, 200), left(p_auth, 100), p_markets)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, markets = excluded.markets;
$$;

create or replace function public.af_push_unsubscribe(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from af_push_subs where endpoint = p_endpoint;
$$;

revoke all on function public.af_push_subscribe(text, text, text, text[]) from public;
revoke all on function public.af_push_unsubscribe(text) from public;
grant execute on function public.af_push_subscribe(text, text, text, text[]) to anon;
grant execute on function public.af_push_unsubscribe(text) to anon;

-- Check for new results every 20 minutes on weekdays, 08:00-22:59 Nairobi.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule(
  'af-push-check',
  '*/20 5-19 * * 1-5',
  $$ select net.http_post(url := 'https://ugjpcybhqwvzidcbqpik.supabase.co/functions/v1/af-push-check', body := '{}'::jsonb, timeout_milliseconds := 30000); $$
);
