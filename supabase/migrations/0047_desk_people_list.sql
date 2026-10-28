-- 0047: one row per person the desk knows, across every way to sign up with us.
-- Read-only. Desk key required (af_secrets 'cron'), like every af_desk_* function.
-- Ways: newsletter (subscribers, newsletter_subscribers), rate alerts, bond alerts for key holders,
-- Call it guesses, pilot / licensing requests (leads), API keys, and real payments (status <> 'test').
-- Organisation: what the person typed, else the paying institution, else the key label; the domain is
-- shown beside it, and personal mail domains are marked as such. Smoke-test domains are left out.

create or replace function public.af_desk_people_list(p_secret text, p_limit int default 200)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  touch as (
    select lower(email) email, 'newsletter' way, created_at at_, source, null::text org, unsubscribed_at is null active from public.subscribers
    union all select lower(email), 'newsletter', created_at, null, null, true from public.newsletter_subscribers
    union all select lower(email), 'rate alert', created_at, coalesce(series, kind), null, unsubscribed_at is null from public.rate_alerts
    union all select lower(email), 'bond alerts', created_at, null, null, unsubscribed_at is null from public.key_alert_prefs
    union all select lower(email), 'Call it', created_at, null, null, true from public.call_it_guesses
    union all select lower(email), case when interest = 'licensing' then 'pilot request' else coalesce(interest, 'enquiry') end, created_at, source, nullif(organisation, ''), true from public.leads
    union all select lower(email), 'API key', created_at, plan, nullif(label, ''), revoked_at is null and (expires_at is null or expires_at > now()) from public.data_keys where email is not null
    union all select lower(email), 'payment', coalesce(paid_at, created_at), plan, nullif(institution, ''), true from public.payments where status <> 'test' and email is not null
  ),
  t as (
    select * from touch
    where (select yes from ok) and email like '%@%' and split_part(email, '@', 2) not in ('resend.dev', 'example.com')
  ),
  p as (
    select email,
      split_part(email, '@', 2) domain,
      min(at_) first_seen,
      max(at_) last_seen,
      (array_agg(way order by at_))[1] first_way,
      (array_agg(source order by at_) filter (where source is not null))[1] first_source,
      (array_agg(org order by at_ desc) filter (where org is not null))[1] organisation,
      array_agg(distinct way) ways,
      bool_or(active) active,
      bool_or(way = 'payment') paid,
      bool_or(way = 'API key') has_key
    from t group by email
  )
  select case when not (select yes from ok) then null else jsonb_build_object(
    'total', (select count(*) from p),
    'new_7d', (select count(*) from p where first_seen > now() - interval '7 days'),
    'by_way', (select coalesce(jsonb_object_agg(way, n), '{}'::jsonb) from (select way, count(distinct email) n from t group by way) w),
    'people', (select coalesce(jsonb_agg(jsonb_build_object(
        'email', email, 'domain', domain,
        'personal', domain in ('gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com', 'ymail.com', 'aol.com'),
        'organisation', organisation, 'first_seen', first_seen, 'last_seen', last_seen, 'first_way', first_way,
        'first_source', first_source, 'ways', ways, 'active', active, 'paid', paid, 'has_key', has_key
      ) order by paid desc, has_key desc, first_seen desc), '[]'::jsonb)
      from (select * from p order by paid desc, has_key desc, first_seen desc limit greatest(1, least(p_limit, 1000))) q)
  ) end;
$function$;

-- Same access pattern as 0040: callable with the publishable key, but returns null without the desk key.
revoke all on function public.af_desk_people_list(text, int) from public;
grant execute on function public.af_desk_people_list(text, int) to anon, authenticated, service_role;
