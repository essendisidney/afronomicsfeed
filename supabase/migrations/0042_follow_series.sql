-- Ships with the data-pages release. PARTLY APPLIED to production on 16 Oct 2026:
--   applied:     the series column; rate_alerts_kind_check with 'series'; rate_alerts_series_check; the unique index
--                rate_alerts_live_uniq_series; the new af_rate_alert_confirm (returns series).
--   still to run (founder, SQL editor): drop the old index rate_alerts_live_uniq; the 7-argument
--                af_rate_alert_create (and the drop of the 6-argument one, plus its revoke/grant); the new
--                af_rate_alerts_live that returns series (and its revoke/grant).
-- Every statement below is safe to re-run, so running the whole file completes it.
-- Until the rest runs, "Follow this number" cannot save anything: PostgREST has no af_rate_alert_create taking
-- p_series, so app/api/rate-alerts answers "Following isn't switched on yet. Please try again soon." (and logs
-- "create failed"). Every other alert kind keeps working (they call create without p_series), and the sender accepts
-- af_rate_alerts_live rows without a series field. Note: while the old index stands, one address could follow only
-- one series (it ignores the series column), so drop it before or with the new create function.
--
-- "Follow this number": a reader follows one rate series (a Kenya T-bill tenor, the CBK rate, a money market fund,
-- a bank average, another market's bill...) and gets an email when a new print differs from the last one they were
-- told about. Same table, same double opt-in, same one-click unsubscribe and same limits as every other rate alert
-- (migration 0017); the only new thing is which series the alert watches.
--
--   kind 'series'  with series = the series id from lib/data/rate-series.ts (e.g. 'kenya-91d', 'kenya-cbr')
--   last_sent_key  'series:<YYYY-MM-DD>:<value>', the print last reported (lib/rate-series-core.ts followKey)
--
-- Callers: app/api/rate-alerts (create, p_series), app/api/send/rate-alerts (af_rate_alerts_live now returns series).

alter table public.rate_alerts add column if not exists series text
  check (series is null or (length(series) between 2 and 60 and series ~ '^[a-z0-9]+(-[a-z0-9]+)*$'));

alter table public.rate_alerts drop constraint if exists rate_alerts_kind_check;
alter table public.rate_alerts add constraint rate_alerts_kind_check
  check (kind in ('tbill_above', 'tbill_below', 'auction', 'ng_savings_bond', 'policy_change', 'mmf_month', 'series'));

alter table public.rate_alerts drop constraint if exists rate_alerts_series_check;
alter table public.rate_alerts add constraint rate_alerts_series_check check ((kind = 'series') = (series is not null));

-- One live alert per address and setting, now including the series. The new index takes a new name (as applied on
-- 16 Oct), then the old one from 0017, which ignores the series, is dropped.
create unique index if not exists rate_alerts_live_uniq_series
  on public.rate_alerts (lower(email), kind, coalesce(tenor, 0), coalesce(threshold, -1), coalesce(series, ''))
  where unsubscribed_at is null;
drop index if exists public.rate_alerts_live_uniq;

-- The create function gains p_series (default null, so a call without it behaves exactly as before). The old
-- six-argument version is dropped so the two cannot be ambiguous to PostgREST.
drop function if exists public.af_rate_alert_create(text, text, int, numeric, text, text);
create or replace function public.af_rate_alert_create(
  p_email text, p_kind text, p_tenor int, p_threshold numeric, p_baseline text, p_secret text, p_series text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_tenor smallint := case when p_kind in ('tbill_above', 'tbill_below') then p_tenor else null end;
  v_threshold numeric(6, 2) := case when p_kind in ('tbill_above', 'tbill_below') then round(p_threshold, 2) else null end;
  v_series text := case when p_kind = 'series' then lower(trim(p_series)) else null end;
  v_row public.rate_alerts%rowtype;
  v_token text;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  if p_kind = 'series' and (v_series is null or v_series !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(v_series) > 60) then
    return null;
  end if;

  select * into v_row from public.rate_alerts r
  where lower(r.email) = v_email and r.kind = p_kind
    and coalesce(r.tenor, 0) = coalesce(v_tenor, 0) and coalesce(r.threshold, -1) = coalesce(v_threshold, -1)
    and coalesce(r.series, '') = coalesce(v_series, '')
    and r.unsubscribed_at is null;

  if found then
    if v_row.confirmed_at is not null then
      return jsonb_build_object('status', 'active');
    end if;
    if v_row.confirm_sent_at < now() - interval '10 minutes' then
      update public.rate_alerts set confirm_sent_at = now() where id = v_row.id;
      return jsonb_build_object('status', 'pending', 'token', v_row.token, 'resend', true);
    end if;
    return jsonb_build_object('status', 'pending', 'resend', false);
  end if;

  -- Limits unchanged from 0017: 5 new requests an hour per address, 20 live alerts per address, 300 unconfirmed an hour overall.
  if (select count(*) from public.rate_alerts r where lower(r.email) = v_email and r.created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.rate_alerts r where lower(r.email) = v_email and r.unsubscribed_at is null) >= 20
     or (select count(*) from public.rate_alerts r where r.confirmed_at is null and r.created_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('status', 'limited');
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.rate_alerts (email, kind, tenor, threshold, series, token, last_sent_key)
  values (v_email, p_kind, v_tenor, v_threshold, v_series, v_token, nullif(left(p_baseline, 200), ''));
  return jsonb_build_object('status', 'pending', 'token', v_token, 'resend', true);
end;
$$;

-- Confirm: unchanged behaviour, now also returns the series.
create or replace function public.af_rate_alert_confirm(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.rate_alerts set confirmed_at = coalesce(confirmed_at, now())
  where token = p_token and length(p_token) >= 32 and unsubscribed_at is null
  returning jsonb_build_object('kind', kind, 'tenor', tenor, 'threshold', threshold, 'series', series);
$$;

-- The live list for the sender, now with the series. The return type changes, so the function is dropped and
-- recreated; the housekeeping from 0018 is kept as it was.
drop function if exists public.af_rate_alerts_live(text);
create function public.af_rate_alerts_live(p_secret text)
returns table(id uuid, email text, kind text, tenor smallint, threshold numeric, series text, token text, last_sent_key text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return;
  end if;
  delete from public.rate_alerts r where r.confirmed_at is null and r.unsubscribed_at is null and r.created_at < now() - interval '7 days';
  delete from public.rate_alerts r where r.unsubscribed_at is not null and r.unsubscribed_at < now() - interval '30 days';
  return query
    select r.id, r.email, r.kind, r.tenor, r.threshold, r.series, r.token, r.last_sent_key
    from public.rate_alerts r
    where r.confirmed_at is not null and r.unsubscribed_at is null
    order by r.created_at
    limit 5000;
end;
$$;

revoke all on function public.af_rate_alert_create(text, text, int, numeric, text, text, text) from public;
revoke all on function public.af_rate_alerts_live(text) from public;
grant execute on function public.af_rate_alert_create(text, text, int, numeric, text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_rate_alerts_live(text) to anon, authenticated, service_role;
