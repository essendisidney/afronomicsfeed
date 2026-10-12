-- Applied 12 Oct 2026. Pay and rent check: "Is my salary fair?" and "Is my rent fair?" (master plan).
--
-- Readers report a monthly gross salary for a job, or a monthly rent for a kind of home, in a town. Published
-- only as the median and middle range of at least 5 reports for the same country, town and job or home over the
-- last 12 months (and country-wide once 5 exist across towns); never one person's figure. Figures more than three
-- times away from the cell's median are left out first.
--
-- Same model as reader_reports (0019): RLS on with no policies; only these SECURITY DEFINER functions, gated by the
-- cron secret, so only the server calls them. p_voter is a daily-salted hash made on the server; no address kept.

create table if not exists public.fair_reports (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('pay', 'rent')),
  country text not null check (country ~ '^[A-Z]{2}$'),
  town text not null check (town ~ '^[a-z0-9_]{2,40}$'),
  category text not null check (category ~ '^[a-z0-9_]{2,40}$'),
  amount numeric(14, 2) not null check (amount > 0),
  voter text not null check (length(voter) between 8 and 80),
  status text not null default 'new' check (status in ('new', 'hidden')),
  created_at timestamptz not null default now()
);
alter table public.fair_reports enable row level security;
create index if not exists fair_reports_cell_idx on public.fair_reports (kind, country, category, town, created_at);

-- Add a report: 'ok', 'replaced' (the same reader's figure of this kind today was updated), 'limited', or null.
create or replace function public.af_fair_report_add(
  p_secret text, p_kind text, p_country text, p_town text, p_category text, p_amount numeric, p_voter text
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
  if (select count(*) from public.fair_reports r where r.voter = p_voter and r.created_at > now() - interval '1 day') >= 6
     or (select count(*) from public.fair_reports r where r.created_at > now() - interval '1 hour') >= 1500 then
    return 'limited';
  end if;
  -- One salary and one rent per reader a day: a second replaces the first, so nobody can stack a median.
  select r.id into v_id from public.fair_reports r
  where r.voter = p_voter and r.kind = p_kind and r.created_at > now() - interval '1 day' limit 1;
  if found then
    update public.fair_reports set country = p_country, town = p_town, category = p_category, amount = round(p_amount, 2), created_at = now() where id = v_id;
    return 'replaced';
  end if;
  insert into public.fair_reports (kind, country, town, category, amount, voter)
  values (p_kind, p_country, p_town, p_category, round(p_amount, 2), p_voter);
  return 'ok';
end;
$$;

-- Medians per country, job or home, and town ('all' = country-wide). Cells under 5 reports come back with
-- their count only, so the page can say how many more are needed.
create or replace function public.af_fair_report_summary(p_secret text, p_kind text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with live as (
    select r.country, r.town, r.category, r.amount
    from public.fair_reports r
    where exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
      and r.kind = p_kind and r.status <> 'hidden' and r.created_at > now() - interval '365 days'
  ),
  cells as (
    select country, town, category, amount from live
    union all
    select country, 'all', category, amount from live
  ),
  mid as (
    select country, town, category, percentile_cont(0.5) within group (order by amount) as m from cells group by 1, 2, 3
  ),
  kept as (
    select c.* from cells c join mid using (country, town, category) where c.amount between mid.m / 3 and mid.m * 3
  ),
  agg as (
    select country, town, category, count(*)::int as n,
      percentile_cont(0.25) within group (order by amount) as low,
      percentile_cont(0.5) within group (order by amount) as median,
      percentile_cont(0.75) within group (order by amount) as high
    from kept group by 1, 2, 3
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'country', country, 'town', town, 'category', category, 'n', n,
    'low', case when n >= 5 then round(low::numeric) end,
    'median', case when n >= 5 then round(median::numeric) end,
    'high', case when n >= 5 then round(high::numeric) end
  ) order by country, category, town), '[]'::jsonb)
  from agg;
$$;

revoke all on function public.af_fair_report_add(text, text, text, text, text, numeric, text) from public;
revoke all on function public.af_fair_report_summary(text, text) from public;
grant execute on function public.af_fair_report_add(text, text, text, text, text, numeric, text) to anon, authenticated, service_role;
grant execute on function public.af_fair_report_summary(text, text) to anon, authenticated, service_role;
