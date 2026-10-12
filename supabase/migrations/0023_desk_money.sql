-- Applied 12 Oct 2026. The desk's money panel and funnels, in one read-only call.
--
-- revenue      per currency: all time, this month, last month (real payments only: status 'success')
-- by_product   per plan and currency, all time (real payments only)
-- tests        payments that were not real (Paystack test mode, failed, abandoned), counted apart
-- mrr          monthly recurring revenue: for each active Paystack subscription, the latest real payment
--              by the same email for a plan with a monthly price (amount in subunits, as Paystack sends it)
-- windows      the same funnels over the last 7 and 30 days:
--   signup: people -> newsletter sign-ups (event) -> new subscribers -> welcomed (guide emailed);
--           unsubscribed; alert sign-ups (event) -> alerts created -> confirmed
--   buyer:  people on the buying pages -> checkouts started -> enquiries -> payments
--
-- Same secret gate as the other desk functions (af_secrets 'cron', migration 0012).

create or replace function public.af_desk_money(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  paid as (select * from public.payments where status = 'success' and (select yes from ok)),
  pv as (
    select * from public.page_views
    where (select yes from ok) and day > current_date - 30
      and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%' and path not like '/desk%'
  ),
  w as (select unnest(array[7, 30]) as days)
  select case when not (select yes from ok) then null else jsonb_build_object(
    'revenue', (select coalesce(jsonb_agg(jsonb_build_object(
        'currency', currency, 'payments', n, 'all_time', total, 'this_month', this_month, 'last_month', last_month) order by total desc), '[]'::jsonb)
      from (select currency, count(*) n, sum(amount) total,
              coalesce(sum(amount) filter (where paid_at >= date_trunc('month', now())), 0) this_month,
              coalesce(sum(amount) filter (where paid_at >= date_trunc('month', now()) - interval '1 month' and paid_at < date_trunc('month', now())), 0) last_month
            from paid group by currency) r),
    'by_product', (select coalesce(jsonb_agg(jsonb_build_object('plan', plan, 'currency', currency, 'payments', n, 'amount', total) order by total desc), '[]'::jsonb)
      from (select coalesce(plan, '?') plan, currency, count(*) n, sum(amount) total from paid group by 1, 2) b),
    'tests', (select jsonb_build_object('payments', count(*), 'statuses', coalesce(jsonb_agg(distinct status), '[]'::jsonb))
      from public.payments where status <> 'success' and (select yes from ok)),
    'mrr', (select coalesce(jsonb_agg(jsonb_build_object('currency', currency, 'amount', total, 'subscriptions', n)), '[]'::jsonb)
      from (select currency, sum(amount) total, count(*) n from (
              select distinct on (s.subscription_code) p.currency, p.amount
              from public.paid_subscriptions s
              join paid p on lower(p.email) = lower(s.email)
              where s.status = 'active'
              order by s.subscription_code, p.paid_at desc) x
            group by currency) m),
    'windows', (select jsonb_agg(jsonb_build_object(
        'days', w.days,
        'people', (select coalesce(sum(visitors), 0) from pv where day > current_date - w.days),
        'newsletter_signups', (select coalesce(sum(count), 0) from public.events_daily where name = 'newsletter_signup' and day > current_date - w.days),
        'new_subscribers', (select count(*) from public.subscribers where created_at > now() - make_interval(days => w.days)),
        'welcomed', (select count(*) from public.subscribers where welcomed_at > now() - make_interval(days => w.days)),
        'unsubscribed', (select count(*) from public.subscribers where unsubscribed_at > now() - make_interval(days => w.days)),
        'active_subscribers', (select count(*) from public.subscribers where unsubscribed_at is null),
        'alert_signups', (select coalesce(sum(count), 0) from public.events_daily where name = 'alert_signup' and day > current_date - w.days),
        'alerts_created', (select count(*) from public.rate_alerts where created_at > now() - make_interval(days => w.days)),
        'alerts_confirmed', (select count(*) from public.rate_alerts where confirmed_at > now() - make_interval(days => w.days)),
        'buying_page_people', (select coalesce(sum(visitors), 0) from pv where day > current_date - w.days
          and path ~ '^/(pricing|for-institutions|pack|licensing|advertise|advisory|prices|developers|jobs/post)(/|$)'),
        'buying_page_views', (select coalesce(sum(views), 0) from pv where day > current_date - w.days
          and path ~ '^/(pricing|for-institutions|pack|licensing|advertise|advisory|prices|developers|jobs/post)(/|$)'),
        'checkouts', (select coalesce(sum(count), 0) from public.events_daily where name = 'checkout_start' and day > current_date - w.days),
        'enquiries', (select coalesce(sum(count), 0) from public.events_daily where name = 'enquiry' and day > current_date - w.days),
        'leads', (select count(*) from public.leads where created_at > now() - make_interval(days => w.days)),
        'payments', (select count(*) from paid where paid_at > now() - make_interval(days => w.days)),
        'paid', (select coalesce(jsonb_agg(jsonb_build_object('currency', currency, 'amount', a)), '[]'::jsonb)
          from (select currency, sum(amount) a from paid where paid_at > now() - make_interval(days => w.days) group by currency) y)
      ) order by w.days) from w)
  ) end;
$$;

revoke all on function public.af_desk_money(text) from public;
grant execute on function public.af_desk_money(text) to anon, authenticated, service_role;
