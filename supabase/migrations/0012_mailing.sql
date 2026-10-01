-- The mailing route runs with the publishable key, so the subscriber list is only released to a caller
-- holding the shared secret (also set as AF_CRON_SECRET on Vercel and in GitHub Actions; value inserted out of band).
create table if not exists public.af_secrets (name text primary key, value text not null);
alter table public.af_secrets enable row level security;

create or replace function public.af_subscribers(p_secret text)
returns table(email text)
language sql
security definer
set search_path = public
as $$
  select s.email from public.subscribers s
  where s.unsubscribed_at is null
    and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
  order by s.created_at
  limit 5000;
$$;

create or replace function public.af_unsubscribe(p_email text, p_secret text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.subscribers set unsubscribed_at = now()
  where lower(email) = lower(p_email)
    and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret);
$$;

revoke all on function public.af_subscribers(text) from public;
revoke all on function public.af_unsubscribe(text, text) from public;
grant execute on function public.af_subscribers(text) to anon;
grant execute on function public.af_unsubscribe(text, text) to anon;

-- Owner dashboard (/desk): one function returns every figure, only to a caller with the shared secret.
-- Definition applied 2026-10-01; see pg_get_functiondef('public.af_desk'::regproc) for the live body.
