-- Applied 12 Oct 2026. The Telegram bot's settings for scripts/telegram_post.py, which runs in GitHub Actions.
-- The token and channel are rows in af_secrets ('telegram_bot_token', 'telegram_channel'), set by hand and never
-- committed; this returns them only to a caller holding the cron secret (af_secrets 'cron', migration 0012).

create or replace function public.af_telegram_config(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
  else jsonb_build_object(
    'token', (select value from public.af_secrets where name = 'telegram_bot_token'),
    'channel', (select value from public.af_secrets where name = 'telegram_channel'))
  end;
$$;

revoke all on function public.af_telegram_config(text) from public;
grant execute on function public.af_telegram_config(text) to anon, authenticated, service_role;
