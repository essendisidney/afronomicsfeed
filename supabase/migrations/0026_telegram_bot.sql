-- Applied 12 Oct 2026. The Telegram bot answers questions (app/api/telegram).
--
-- af_event also counts 'bot_query' (path /bot/<command>; no message text or user is kept).
-- af_telegram_config also returns the webhook secret (af_secrets 'telegram_webhook_secret', set by hand, never
-- committed), which Telegram sends with every update so the webhook can refuse anything else.

create or replace function public.af_event(p_name text, p_path text, p_country text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_name not in ('newsletter_signup', 'alert_signup', 'push_alert_on', 'reader_report', 'reader_story', 'rate_check', 'share', 'enquiry', 'checkout_start', 'partner_click', 'bot_query') then return; end if;
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.events_daily (day, name, path, country, count)
  values (current_date, p_name, p_path, case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1)
  on conflict (day, name, path, country) do update set count = events_daily.count + 1;
end;
$function$;

create or replace function public.af_telegram_config(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else jsonb_build_object(
    'token', (select value from public.af_secrets where name = 'telegram_bot_token'),
    'channel', (select value from public.af_secrets where name = 'telegram_channel'),
    'webhook_secret', (select value from public.af_secrets where name = 'telegram_webhook_secret'))
  end;
$$;

revoke all on function public.af_telegram_config(text) from public;
grant execute on function public.af_telegram_config(text) to anon, authenticated, service_role;
