-- NOT YET APPLIED. Apply only after the founder approves the U2 pull request ("Shillings found",
-- docs/rebuild/upgrade-U2-plan.md, decided as D-029). Until it is applied, POST /api/found counts nothing and fails
-- quietly, and the counter on Today, /method and /sw stays hidden.
--
-- Shillings found: an anonymous daily total of the differences readers were shown at the end of the money tools
-- (lib/found.ts): what the reader's option costs or earns against the cheapest or best-earning option we hold.
--
-- What is stored: one row per day, tool, market and currency, holding how many results were counted and their sum in
-- minor units (cents). No input is stored: no amount, rate, product, fund or service picked, no IP address, no device
-- or page-view id, no cookie, and no path beyond the tool name. Nothing here identifies a person (Kenya Data Protection
-- Act: no personal data).
--
-- Pattern of migrations 0038 and 0043: row level security on with no policies, so the table is reached only through
-- the two SECURITY DEFINER functions below.
--   af_found_add(tool, market, currency, minor, secret)  adds one result; needs the 'cron' secret, so only the server
--                                                         (app/api/found/route.ts, after it has recomputed and capped
--                                                         the difference) can call it, never a browser.
--   af_found_total(since)                                totals by tool, market and currency since a date (all time
--                                                         when null), with the first counted day; read-only and public,
--                                                         as the counter is.
--
-- Safe to apply at any time: a new table and two new functions; nothing existing changes.

create table if not exists public.found_daily (
  day date not null default current_date,
  tool text not null check (tool in ('save_check', 'mobile_loans', 'fuliza', 'mmf', 'remit')),
  market text not null check (market ~ '^[a-z][a-z-]{1,29}$'),
  currency text not null check (currency in ('KES', 'GHS', 'NGN', 'USD')),
  results integer not null default 0 check (results >= 0),
  total_minor bigint not null default 0 check (total_minor >= 0),
  primary key (day, tool, market, currency)
);

alter table public.found_daily enable row level security;
-- No policies: anon and authenticated cannot read or write the table directly.
revoke all on table public.found_daily from anon, authenticated;

create or replace function public.af_found_add(p_tool text, p_market text, p_currency text, p_minor bigint, p_secret text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cap bigint;
  v_today integer;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    raise exception 'forbidden';
  end if;
  if p_tool not in ('save_check', 'mobile_loans', 'fuliza', 'mmf', 'remit') then return false; end if;
  if p_market is null or p_market !~ '^[a-z][a-z-]{1,29}$' then return false; end if;
  -- A backstop behind the route's own caps (KES 500,000 a year; USD 2,000; cedis and naira at the day's rate):
  -- generous enough for any exchange rate, small enough that no single call can swamp the total.
  v_cap := case p_currency
    when 'KES' then 50000000          -- KES 500,000.00
    when 'USD' then 200000            -- USD 2,000.00
    when 'GHS' then 20000000          -- GHS 200,000.00
    when 'NGN' then 2000000000        -- NGN 20,000,000.00
    else null end;
  if v_cap is null or p_minor is null or p_minor < 1 or p_minor > v_cap then return false; end if;
  -- At most 5,000 results a day per tool, market and currency.
  select results into v_today from public.found_daily
    where day = current_date and tool = p_tool and market = p_market and currency = p_currency;
  if coalesce(v_today, 0) >= 5000 then return false; end if;
  insert into public.found_daily (day, tool, market, currency, results, total_minor)
  values (current_date, p_tool, p_market, p_currency, 1, p_minor)
  on conflict (day, tool, market, currency)
  do update set results = found_daily.results + 1, total_minor = found_daily.total_minor + excluded.total_minor;
  return true;
end;
$function$;

create or replace function public.af_found_total(p_since date default null)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'since', (select min(day) from public.found_daily where results > 0),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('tool', tool, 'market', market, 'currency', currency, 'results', results, 'total_minor', total_minor)
                       order by currency, tool, market)
      from (
        select tool, market, currency, sum(results)::bigint as results, sum(total_minor)::bigint as total_minor
        from public.found_daily
        where p_since is null or day >= p_since
        group by tool, market, currency
      ) t
    ), '[]'::jsonb)
  );
$function$;

revoke all on function public.af_found_add(text, text, text, bigint, text) from public;
revoke all on function public.af_found_total(date) from public;
grant execute on function public.af_found_add(text, text, text, bigint, text) to anon, authenticated, service_role;
grant execute on function public.af_found_total(date) to anon, authenticated, service_role;
