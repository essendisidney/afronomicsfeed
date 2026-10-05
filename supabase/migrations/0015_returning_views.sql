-- Returning visitors (applied 5 Oct 2026). The browser keeps one first-visit marker in localStorage and the
-- page counter sends a yes/no with each view; only the daily count is stored. No cookies, no identifiers.
-- Added beside af_hit rather than replacing it, so the site kept counting while the new code deployed.
alter table public.page_views add column if not exists returning_views integer not null default 0;

create or replace function public.af_hit_v2(p_path text, p_referrer text, p_country text, p_returning boolean default false)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.page_views (day, path, referrer, country, views, returning_views)
  values (current_date, p_path, left(coalesce(lower(p_referrer), ''), 100),
          case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1,
          case when p_returning then 1 else 0 end)
  on conflict (day, path, referrer, country) do update
    set views = page_views.views + 1,
        returning_views = page_views.returning_views + case when p_returning then 1 else 0 end;
end;
$function$;

revoke all on function public.af_hit_v2(text, text, text, boolean) from public;
grant execute on function public.af_hit_v2(text, text, text, boolean) to anon, authenticated, service_role;
