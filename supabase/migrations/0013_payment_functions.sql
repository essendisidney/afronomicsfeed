-- Paystack records without a service-role key on the server: the webhook and the return page call these
-- SECURITY DEFINER functions with the shared secret (af_secrets name='cron', also AF_CRON_SECRET on Vercel).
alter table public.payments add column if not exists institution text;
alter table public.payments add column if not exists access_sent_at timestamptz;

create or replace function public.af_record_payment(
  p_secret text,
  p_reference text,
  p_email text,
  p_plan text,
  p_amount bigint,
  p_currency text,
  p_status text,
  p_channel text,
  p_paid_at timestamptz,
  p_raw jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return false;
  end if;
  if p_reference is null or length(p_reference) > 120 then
    return false;
  end if;
  insert into public.payments (reference, email, plan, amount, currency, status, channel, paid_at, raw)
  values (p_reference, lower(p_email), p_plan, coalesce(p_amount, 0), p_currency, coalesce(p_status, 'success'), p_channel, coalesce(p_paid_at, now()), p_raw)
  on conflict (reference) do update
    set email = coalesce(excluded.email, payments.email),
        plan = coalesce(excluded.plan, payments.plan),
        amount = greatest(excluded.amount, payments.amount),
        currency = coalesce(excluded.currency, payments.currency),
        status = excluded.status,
        channel = coalesce(excluded.channel, payments.channel),
        paid_at = coalesce(excluded.paid_at, payments.paid_at),
        raw = coalesce(excluded.raw, payments.raw);
  return true;
end;
$$;

create or replace function public.af_record_subscription(
  p_secret text,
  p_code text,
  p_email text,
  p_plan_code text,
  p_status text,
  p_next timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return false;
  end if;
  if p_code is null or length(p_code) > 120 then
    return false;
  end if;
  insert into public.paid_subscriptions (subscription_code, email, plan_code, status, next_payment_date, updated_at)
  values (p_code, lower(p_email), p_plan_code, p_status, p_next, now())
  on conflict (subscription_code) do update
    set email = coalesce(excluded.email, paid_subscriptions.email),
        plan_code = coalesce(excluded.plan_code, paid_subscriptions.plan_code),
        status = excluded.status,
        next_payment_date = coalesce(excluded.next_payment_date, paid_subscriptions.next_payment_date),
        updated_at = now();
  return true;
end;
$$;

-- Owner's view for /desk: recent payments and running totals by currency.
create or replace function public.af_payments(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case
    when not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then null
    else jsonb_build_object(
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object(
          'reference', p.reference, 'email', p.email, 'plan', p.plan, 'amount', p.amount, 'currency', p.currency,
          'status', p.status, 'channel', p.channel, 'paid_at', p.paid_at, 'access_sent_at', p.access_sent_at)
          order by p.paid_at desc)
        from (select * from public.payments order by paid_at desc limit 50) p), '[]'::jsonb),
      'totals', coalesce((
        select jsonb_agg(jsonb_build_object('currency', t.currency, 'count', t.n, 'amount', t.amount, 'month_amount', t.month_amount))
        from (
          select currency, count(*) n, sum(amount) amount,
                 sum(amount) filter (where paid_at >= date_trunc('month', now())) month_amount
          from public.payments where status = 'success' group by currency) t), '[]'::jsonb),
      'subscriptions', coalesce((
        select jsonb_agg(jsonb_build_object('code', s.subscription_code, 'email', s.email, 'plan_code', s.plan_code,
          'status', s.status, 'next', s.next_payment_date) order by s.updated_at desc)
        from (select * from public.paid_subscriptions order by updated_at desc limit 50) s), '[]'::jsonb)
    ) end;
$$;

revoke all on function public.af_record_payment(text, text, text, text, bigint, text, text, text, timestamptz, jsonb) from public;
revoke all on function public.af_record_subscription(text, text, text, text, text, timestamptz) from public;
revoke all on function public.af_payments(text) from public;
grant execute on function public.af_record_payment(text, text, text, text, bigint, text, text, text, timestamptz, jsonb) to anon;
grant execute on function public.af_record_subscription(text, text, text, text, text, timestamptz) to anon;
grant execute on function public.af_payments(text) to anon;
