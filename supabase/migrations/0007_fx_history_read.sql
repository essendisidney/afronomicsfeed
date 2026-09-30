-- Public read of the archived FX reference (published mid-market rates; nothing private).
-- Returns at most 120 days, so the function cannot be used to scrape the table in one call.
create or replace function public.af_fx_history(p_days int default 14)
returns table(day date, code text, rate numeric)
language sql
stable
security definer
set search_path = public
as $$
  select f.day, f.code, f.rate
  from public.fx_daily f
  where f.base = 'USD'
    and f.day >= current_date - least(greatest(coalesce(p_days, 14), 1), 120)
  order by f.day, f.code;
$$;

revoke all on function public.af_fx_history(int) from public;
grant execute on function public.af_fx_history(int) to anon, authenticated;
