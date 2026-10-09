-- Applied 9 Oct 2026. A new rate alert: each month's Kenya money market fund ranking
-- (/rates/kenya/best-money-market-fund/<month>), sent once the month is finished. last_sent_key is the month (YYYY-MM).

alter table public.rate_alerts drop constraint if exists rate_alerts_kind_check;
alter table public.rate_alerts add constraint rate_alerts_kind_check
  check (kind in ('tbill_above', 'tbill_below', 'auction', 'ng_savings_bond', 'policy_change', 'mmf_month'));
