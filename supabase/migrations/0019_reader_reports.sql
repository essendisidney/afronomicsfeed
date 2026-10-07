-- Reader reports: what readers paid (a price, or a rate they were paid or charged) and stories for the editor.
-- Prices and rates are published only as medians and middle ranges of at least 3 reports in the last 30 days,
-- per country and item, never one person's figure, town or contact. Stories are read on the desk and never
-- published automatically.
--
-- RLS on, no public policies: the site works only through the SECURITY DEFINER functions below, each of which
-- needs the shared 'cron' secret (af_secrets, migration 0012; AF_CRON_SECRET on Vercel), so only the server calls
-- them. p_voter is a daily-salted hash made on the server; no address is stored.
--
-- Callers: app/api/reader-reports (add), app/rates/reader-prices (summary), app/desk (list), app/api/desk (hide).

create table if not exists public.reader_reports (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('price', 'rate', 'story')),
  country text not null check (country ~ '^[A-Z]{2}$'),
  item text check (item ~ '^[a-z0-9_]{2,40}$'),
  amount numeric(14, 2) check (amount > 0),
  place text check (length(place) <= 80),
  note text check (length(note) <= 2000),
  contact text check (length(contact) <= 200),
  voter text not null check (length(voter) between 8 and 80),
  status text not null default 'new' check (status in ('new', 'hidden')),
  created_at timestamptz not null default now(),
  check ((kind = 'story') = (item is null and amount is null)),
  check (kind <> 'story' or length(note) >= 20)
);
alter table public.reader_reports enable row level security;
create index if not exists reader_reports_created_idx on public.reader_reports (created_at);
create index if not exists reader_reports_item_idx on public.reader_reports (country, item, created_at);

-- Add a report. Returns 'ok', 'replaced' (the same reader's figure for the same item today was updated), 'limited',
-- or null for a wrong secret.
create or replace function public.af_reader_report_add(
  p_secret text, p_kind text, p_country text, p_item text, p_amount numeric, p_place text, p_note text, p_contact text, p_voter text
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
  -- Limits: 12 reports a day per reader, 3 stories a day per reader, 1,500 reports an hour overall.
  if (select count(*) from public.reader_reports r where r.voter = p_voter and r.created_at > now() - interval '1 day') >= 12
     or (p_kind = 'story' and (select count(*) from public.reader_reports r where r.voter = p_voter and r.kind = 'story' and r.created_at > now() - interval '1 day') >= 3)
     or (select count(*) from public.reader_reports r where r.created_at > now() - interval '1 hour') >= 1500 then
    return 'limited';
  end if;
  -- One figure per reader, item and day: a second one replaces the first, so nobody can stack the median.
  if p_kind <> 'story' then
    select r.id into v_id from public.reader_reports r
    where r.voter = p_voter and r.country = p_country and r.item = p_item and r.created_at > now() - interval '1 day'
    limit 1;
    if found then
      update public.reader_reports set amount = round(p_amount, 2), place = nullif(left(trim(p_place), 80), ''), created_at = now() where id = v_id;
      return 'replaced';
    end if;
  end if;
  insert into public.reader_reports (kind, country, item, amount, place, note, contact, voter)
  values (
    p_kind, p_country,
    case when p_kind = 'story' then null else p_item end,
    case when p_kind = 'story' then null else round(p_amount, 2) end,
    nullif(left(trim(p_place), 80), ''),
    nullif(left(trim(p_note), 2000), ''),
    nullif(left(trim(p_contact), 200), ''),
    p_voter
  );
  return 'ok';
end;
$$;

-- Medians and middle ranges per country and item over the last p_days. Figures more than three times away from
-- the item's median are left out before the summary is taken. Items with fewer than 3 reports come back with
-- their count only, so the page can say how many more are needed.
create or replace function public.af_reader_report_summary(p_secret text, p_days int default 30)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with live as (
    select r.country, r.item, r.amount, r.created_at
    from public.reader_reports r
    where exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
      and r.kind <> 'story' and r.status <> 'hidden'
      and r.created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
  ),
  mid as (
    select country, item, percentile_cont(0.5) within group (order by amount) as m from live group by country, item
  ),
  kept as (
    select l.* from live l join mid using (country, item)
    where l.amount between mid.m / 3 and mid.m * 3
  ),
  agg as (
    select country, item, count(*)::int as n,
      percentile_cont(0.25) within group (order by amount) as low,
      percentile_cont(0.5) within group (order by amount) as median,
      percentile_cont(0.75) within group (order by amount) as high,
      max(created_at) as latest
    from kept group by country, item
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'country', country, 'item', item, 'n', n,
    'low', case when n >= 3 then round(low::numeric, 2) end,
    'median', case when n >= 3 then round(median::numeric, 2) end,
    'high', case when n >= 3 then round(high::numeric, 2) end,
    'latest', latest
  ) order by country, item), '[]'::jsonb)
  from agg;
$$;

-- The newest reports, for the desk (stories with their contact, figures with their place).
create or replace function public.af_reader_report_list(p_secret text, p_limit int default 50)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb)
  from (
    select r.id, r.kind, r.country, r.item, r.amount, r.place, r.note, r.contact, r.status, r.created_at
    from public.reader_reports r
    where exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
    order by r.created_at desc
    limit least(greatest(p_limit, 1), 200)
  ) x;
$$;

-- Hide a report from the summaries (a figure that is plainly wrong, or a story dealt with).
create or replace function public.af_reader_report_hide(p_secret text, p_id bigint)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.reader_reports set status = 'hidden'
  where id = p_id and exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
  returning true;
$$;

revoke all on function public.af_reader_report_add(text, text, text, text, numeric, text, text, text, text) from public;
revoke all on function public.af_reader_report_summary(text, int) from public;
revoke all on function public.af_reader_report_list(text, int) from public;
revoke all on function public.af_reader_report_hide(text, bigint) from public;
grant execute on function public.af_reader_report_add(text, text, text, text, numeric, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_reader_report_summary(text, int) to anon, authenticated, service_role;
grant execute on function public.af_reader_report_list(text, int) to anon, authenticated, service_role;
grant execute on function public.af_reader_report_hide(text, bigint) to anon, authenticated, service_role;
