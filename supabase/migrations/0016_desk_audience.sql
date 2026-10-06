-- Desk: returning readers by day and visits from LinkedIn (applied 6 Oct 2026). Read by app/desk/page.tsx.
-- Posts link with utm_source=linkedin; app/api/hit/route.ts stores such a view's referrer as "utm:linkedin/<campaign>".
create or replace function public.af_desk_audience(p_secret text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else jsonb_build_object(
    'returning_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'views', views, 'returning', ret) order by day), '[]'::jsonb)
      from (select day, sum(views) views, sum(returning_views) ret from page_views
            where day > current_date - 30 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'
            group by day) d),
    'returning_7d', (select coalesce(sum(returning_views), 0) from page_views
      where day > current_date - 7 and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%'),
    'linkedin', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'source', referrer, 'views', views, 'views_7d', v7, 'last_day', last_day) order by views desc), '[]'::jsonb)
      from (select path, referrer, sum(views) views, sum(views) filter (where day > current_date - 7) v7, max(day) last_day from page_views
            where day > current_date - 90 and (referrer like 'utm:linkedin%' or referrer in ('linkedin.com', 'lnkd.in') or referrer like '%.linkedin.com' or referrer like 'com.linkedin.%')
            group by path, referrer) l)
  ) end;
$function$;

revoke all on function public.af_desk_audience(text) from public;
grant execute on function public.af_desk_audience(text) to anon, authenticated, service_role;
