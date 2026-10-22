-- Reader signals (lib/signals-core.ts): how far stories are read, whether readers come back, and what they search
-- for and do not find. All anonymous: one daily count per action, page and country, like every other event. No
-- identifier, no IP address, no cookie; a search is stored only as cleaned words, never with contact details.
--
-- Changes:
--   1. af_event accepts five more names. Each keeps its bucket after a comma in the path, as shares keep their network:
--        read_depth     a story scrolled past 25 / 50 / 75 / 100%       ("/brief/x,50")
--        engaged        30 / 120 seconds of active reading on a story   ("/brief/x,30")
--        first_visit    a browser's first visit, by its ISO week        ("/,2026-w43")
--        return_reader  the first return in day 1-7 / 8-28 / 29-84     ("/,2026-w43.w1")
--        search_miss    a site search that found nothing               ("/search,dangote-ipo")
--   2. af_desk_signals(p_secret): the desk's "Stories that work" scorecard (30 days, per story: people, views, read to
--      half and to the end, engaged 30 s, shares, sign-ups made on the page), return rates by first-visit week, and the
--      top searches that found nothing. Read-only, gated by the 'cron' secret like every desk function.
--
-- Safe to apply on the live database at any time: af_event keeps every name it accepted before; one new function.
-- Until it is applied the new events are dropped silently (af_event ignores unknown names) and the desk panel says
-- "needs migration 0043".

create or replace function public.af_event(p_name text, p_path text, p_country text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_name not in ('newsletter_signup', 'alert_signup', 'push_alert_on', 'reader_report', 'reader_story', 'rate_check', 'share', 'enquiry',
                    'checkout_start', 'partner_click', 'bot_query',
                    'download_click', 'pricing_cta_click', 'pilot_form_start', 'pilot_form_submit', 'source_click', 'survey_answer',
                    'read_depth', 'engaged', 'first_visit', 'return_reader', 'search_miss') then return; end if;
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.events_daily (day, name, path, country, count)
  values (current_date, p_name, p_path, case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1)
  on conflict (day, name, path, country) do update set count = events_daily.count + 1;
end;
$function$;

create or replace function public.af_desk_signals(p_secret text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  ev as (
    select name, split_part(path, ',', 1) as page, split_part(path, ',', 2) as bucket, count, day
    from public.events_daily
    where (select yes from ok) and day > current_date - 30
  ),
  pages as (
    select path, sum(visitors) people, sum(views) views
    from public.page_views
    where (select yes from ok) and day > current_date - 30 and path ~ '^/(brief|receipts|learn|stories)/[^/]+$'
    group by path
  ),
  story as (
    select p.path, p.people, p.views,
      coalesce((select sum(count) from ev where ev.name = 'read_depth' and ev.page = p.path and ev.bucket = '50'), 0) read_half,
      coalesce((select sum(count) from ev where ev.name = 'read_depth' and ev.page = p.path and ev.bucket = '100'), 0) read_end,
      coalesce((select sum(count) from ev where ev.name = 'engaged' and ev.page = p.path and ev.bucket = '30'), 0) engaged_30,
      coalesce((select sum(count) from ev where ev.name = 'share' and ev.page = p.path), 0) shares,
      coalesce((select sum(count) from ev where ev.name in ('newsletter_signup', 'alert_signup') and ev.page = p.path), 0) signups
    from pages p
  ),
  firsts as (
    select bucket as week, sum(count) n from public.events_daily e, lateral (select split_part(e.path, ',', 2) bucket) b
    where (select yes from ok) and e.name = 'first_visit' group by bucket
  ),
  returns as (
    select split_part(bucket, '.', 1) as week, split_part(bucket, '.', 2) as slot, sum(count) n
    from public.events_daily e, lateral (select split_part(e.path, ',', 2) bucket) b
    where (select yes from ok) and e.name = 'return_reader' group by 1, 2
  )
  select case when not (select yes from ok) then null else jsonb_build_object(
    'stories', (select coalesce(jsonb_agg(to_jsonb(s) order by s.people desc), '[]'::jsonb)
      from (select * from story order by people desc limit 25) s),
    'cohorts', (select coalesce(jsonb_agg(jsonb_build_object(
        'week', f.week, 'first', f.n,
        'w1', coalesce((select n from returns r where r.week = f.week and r.slot = 'w1'), 0),
        'w2_4', coalesce((select n from returns r where r.week = f.week and r.slot = 'w2-4'), 0),
        'w5_12', coalesce((select n from returns r where r.week = f.week and r.slot = 'w5-12'), 0)
      ) order by f.week desc), '[]'::jsonb)
      from (select * from firsts order by week desc limit 10) f),
    'search_misses', (select coalesce(jsonb_agg(jsonb_build_object('query', bucket, 'count', n) order by n desc), '[]'::jsonb)
      from (select bucket, sum(count) n from ev where name = 'search_miss' and bucket <> '' group by bucket order by 2 desc limit 25) m)
  ) end;
$function$;
