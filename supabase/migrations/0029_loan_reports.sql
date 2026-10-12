-- Applied 12 Oct 2026. Loan app scorecard (master plan): what Kenya's licensed digital lenders really cost.
--
-- Borrowers report a loan from a lender on the CBK's directory (scripts/kenya_dcp.py): amount borrowed, total
-- repaid, days, and whether the app contacted their friends or family. Each report becomes a cost per KES 1,000
-- for 30 days. Published per lender only as the median and middle range of at least 5 reports over 12 months,
-- with the share reporting contact-shaming; figures more than three times from the lender's median are dropped.
--
-- Same model as fair_reports (0027): RLS on with no policies; SECURITY DEFINER functions gated by the cron
-- secret, so only the server calls them; p_voter is a daily-salted hash made on the server; no address kept.

create table if not exists public.loan_reports (
  id bigint generated always as identity primary key,
  lender text not null check (length(lender) between 2 and 120),
  borrowed numeric(12, 2) not null check (borrowed between 100 and 1000000),
  repaid numeric(12, 2) not null check (repaid >= borrowed and repaid <= borrowed * 5),
  days int not null check (days between 1 and 365),
  shamed boolean,
  cost_per_1000_30d numeric(10, 2) generated always as (round((repaid - borrowed) / borrowed * 1000 * 30 / days, 2)) stored,
  voter text not null check (length(voter) between 8 and 80),
  status text not null default 'new' check (status in ('new', 'hidden')),
  created_at timestamptz not null default now()
);
alter table public.loan_reports enable row level security;
create index if not exists loan_reports_lender_idx on public.loan_reports (lender, created_at);

-- Add a report: 'ok', 'replaced' (the same reader's report today was updated), 'limited', or null.
create or replace function public.af_loan_report_add(
  p_secret text, p_lender text, p_borrowed numeric, p_repaid numeric, p_days int, p_shamed boolean, p_voter text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  if (select count(*) from public.loan_reports r where r.created_at > now() - interval '1 hour') >= 1500 then
    return 'limited';
  end if;
  -- One loan per reader a day: a second replaces the first, so nobody can stack a lender's median.
  select r.id into v_id from public.loan_reports r where r.voter = p_voter and r.created_at > now() - interval '1 day' limit 1;
  if found then
    update public.loan_reports set lender = p_lender, borrowed = round(p_borrowed, 2), repaid = round(p_repaid, 2), days = p_days, shamed = p_shamed, created_at = now() where id = v_id;
    return 'replaced';
  end if;
  insert into public.loan_reports (lender, borrowed, repaid, days, shamed, voter)
  values (p_lender, round(p_borrowed, 2), round(p_repaid, 2), p_days, p_shamed, p_voter);
  return 'ok';
end;
$$;

-- Per lender: count, and once there are 5, the median and middle half of the cost per KES 1,000 for 30 days and
-- the share of reports saying the app contacted friends or family.
create or replace function public.af_loan_report_summary(p_secret text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with live as (
    select r.lender, r.cost_per_1000_30d as c, r.shamed
    from public.loan_reports r
    where exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
      and r.status <> 'hidden' and r.created_at > now() - interval '365 days'
  ),
  mid as (select lender, percentile_cont(0.5) within group (order by c) as m from live group by lender),
  kept as (
    select l.* from live l join mid using (lender)
    where mid.m = 0 or l.c between mid.m / 3 and mid.m * 3
  ),
  agg as (
    select lender, count(*)::int as n,
      percentile_cont(0.25) within group (order by c) as low,
      percentile_cont(0.5) within group (order by c) as median,
      percentile_cont(0.75) within group (order by c) as high,
      count(*) filter (where shamed is not null) as asked,
      count(*) filter (where shamed) as shamed
    from kept group by lender
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'lender', lender, 'n', n,
    'low', case when n >= 5 then round(low::numeric) end,
    'median', case when n >= 5 then round(median::numeric) end,
    'high', case when n >= 5 then round(high::numeric) end,
    'shamed_pct', case when n >= 5 and asked >= 5 then round(100.0 * shamed / asked) end
  ) order by lender), '[]'::jsonb)
  from agg;
$$;

revoke all on function public.af_loan_report_add(text, text, numeric, numeric, int, boolean, text) from public;
revoke all on function public.af_loan_report_summary(text) from public;
grant execute on function public.af_loan_report_add(text, text, numeric, numeric, int, boolean, text) to anon, authenticated, service_role;
grant execute on function public.af_loan_report_summary(text) to anon, authenticated, service_role;
