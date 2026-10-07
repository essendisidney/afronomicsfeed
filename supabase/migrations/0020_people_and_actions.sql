-- People and actions (7 Oct 2026). Three additions to the privacy-first counter:
--   1. visitors: the first view of the day from a browser (a date in localStorage, no identifier), so the desk can
--      count people per day, not only page views.
--   2. events_daily: one daily total per action (newsletter sign-up, rate check, reader report, share, ...) and page.
--   3. The owner's devices are not counted at all: the browser marks itself when the desk is opened (client-side).
-- af_hit_v2 stays in place so the site keeps counting while the new code deploys.

alter table public.page_views add column if not exists visitors integer not null default 0;

create or replace function public.af_hit_v3(p_path text, p_referrer text, p_country text, p_returning boolean default false, p_visitor boolean default false)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.page_views (day, path, referrer, country, views, returning_views, visitors)
  values (current_date, p_path, left(coalesce(lower(p_referrer), ''), 100),
          case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1,
          case when p_returning then 1 else 0 end, case when p_visitor then 1 else 0 end)
  on conflict (day, path, referrer, country) do update
    set views = page_views.views + 1,
        returning_views = page_views.returning_views + case when p_returning then 1 else 0 end,
        visitors = page_views.visitors + case when p_visitor then 1 else 0 end;
end;
$function$;

create table if not exists public.events_daily (
  day date not null,
  name text not null,
  path text not null,
  country text not null default '',
  count integer not null default 0,
  primary key (day, name, path, country)
);
alter table public.events_daily enable row level security;

create or replace function public.af_event(p_name text, p_path text, p_country text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_name not in ('newsletter_signup', 'alert_signup', 'push_alert_on', 'reader_report', 'reader_story', 'rate_check', 'share', 'enquiry', 'checkout_start') then return; end if;
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.events_daily (day, name, path, country, count)
  values (current_date, p_name, p_path, case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1)
  on conflict (day, name, path, country) do update set count = events_daily.count + 1;
end;
$function$;

-- People and actions for the desk.
create or replace function public.af_desk_people(p_secret text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else jsonb_build_object(
    'people_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'people', p, 'views', v) order by day), '[]'::jsonb)
      from (select day, sum(visitors) p, sum(views) v from page_views
            where day > current_date - 30 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'
            group by day) d),
    'people_7d', (select coalesce(sum(visitors), 0) from page_views
      where day > current_date - 7 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'),
    'people_prev_7d', (select coalesce(sum(visitors), 0) from page_views
      where day > current_date - 14 and day <= current_date - 7 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'),
    'people_sources_7d', (select coalesce(jsonb_agg(jsonb_build_object('source', s, 'people', p) order by p desc), '[]'::jsonb)
      from (select coalesce(nullif(referrer, ''), '(direct or app)') s, sum(visitors) p from page_views
            where day > current_date - 7 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'
            group by 1 having sum(visitors) > 0 order by 2 desc limit 12) x),
    'people_countries_7d', (select coalesce(jsonb_agg(jsonb_build_object('country', c, 'people', p) order by p desc), '[]'::jsonb)
      from (select coalesce(nullif(country, ''), '?') c, sum(visitors) p from page_views
            where day > current_date - 7 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'
            group by 1 having sum(visitors) > 0 order by 2 desc limit 12) x),
    'actions_7d', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', c, 'prev', p) order by c desc), '[]'::jsonb)
      from (select name, sum(count) filter (where day > current_date - 7) c, sum(count) filter (where day <= current_date - 7) p
            from events_daily where day > current_date - 14 group by name) x),
    'actions_pages_7d', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'path', path, 'count', c) order by c desc), '[]'::jsonb)
      from (select name, path, sum(count) c from events_daily where day > current_date - 7 group by name, path order by 3 desc limit 15) x)
  ) end;
$function$;

revoke all on function public.af_hit_v3(text, text, text, boolean, boolean) from public;
revoke all on function public.af_event(text, text, text) from public;
revoke all on function public.af_desk_people(text) from public;
grant execute on function public.af_hit_v3(text, text, text, boolean, boolean) to anon, authenticated, service_role;
grant execute on function public.af_event(text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_desk_people(text) to anon, authenticated, service_role;
