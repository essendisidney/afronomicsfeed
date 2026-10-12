-- Applied 12 Oct 2026. Referral clicks: each "Send money" (or later "Open account") button goes through /go/<partner>,
-- which counts one 'partner_click' per day, partner path and country before redirecting. No person is identified.
-- af_desk_referrals gives the desk the clicks per partner over the last 7 and 30 days.

create or replace function public.af_event(p_name text, p_path text, p_country text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_name not in ('newsletter_signup', 'alert_signup', 'push_alert_on', 'reader_report', 'reader_story', 'rate_check', 'share', 'enquiry', 'checkout_start', 'partner_click') then return; end if;
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.events_daily (day, name, path, country, count)
  values (current_date, p_name, p_path, case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1)
  on conflict (day, name, path, country) do update set count = events_daily.count + 1;
end;
$function$;

create or replace function public.af_desk_referrals(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else coalesce((
    select jsonb_agg(jsonb_build_object('path', path, 'clicks_7d', c7, 'clicks_30d', c30) order by c30 desc)
    from (select path, coalesce(sum(count) filter (where day > current_date - 7), 0) c7, sum(count) c30
          from public.events_daily where name = 'partner_click' and day > current_date - 30 group by path) x), '[]'::jsonb)
  end;
$$;

revoke all on function public.af_desk_referrals(text) from public;
grant execute on function public.af_desk_referrals(text) to anon, authenticated, service_role;
