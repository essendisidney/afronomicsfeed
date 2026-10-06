-- NOT YET APPLIED: run in the Supabase SQL editor (it deletes rows, so the owner confirms it).
-- Housekeeping promised in the privacy notice: unconfirmed alert requests are deleted after 7 days, stopped alerts
-- 30 days after they were stopped. Runs inside the sender's list call, several times every weekday.
create or replace function public.af_rate_alerts_live(p_secret text)
returns table(id uuid, email text, kind text, tenor smallint, threshold numeric, token text, last_sent_key text)
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
    select r.id, r.email, r.kind, r.tenor, r.threshold, r.token, r.last_sent_key
    from public.rate_alerts r
    where r.confirmed_at is not null and r.unsubscribed_at is null
    order by r.created_at
    limit 5000;
end;
$$;
