-- Applied 12 Oct 2026. The institutional sales pipeline behind the founder command centre on /desk (the USD 1
-- million a month plan, docs/strategy/usd-1m-plan.md). One row per organisation and product. Stages are kept
-- strictly apart so a projection is never shown as revenue: only 'won' (a signed agreement) counts as contracted,
-- and only `payments` count as collected. value_usd_month is the expected monthly value if won, an estimate.
--
-- RLS on, no policies; only these SECURITY DEFINER functions, gated by the 'cron' secret (the desk key).

create table if not exists public.deals (
  id bigint generated always as identity primary key,
  organisation text not null check (length(organisation) between 2 and 160),
  segment text not null default 'other' check (segment in ('asset_manager', 'bank', 'dfi', 'research', 'pension', 'insurer', 'corporate', 'government', 'media', 'other')),
  product text not null default 'frontier_debt' check (product in ('frontier_debt', 'data_api', 'enterprise', 'pack', 'widget', 'listing', 'research', 'tenders', 'other')),
  stage text not null default 'prospect' check (stage in ('prospect', 'contacted', 'qualified', 'pilot', 'proposal', 'won', 'lost')),
  value_usd_month numeric(12, 2) check (value_usd_month is null or value_usd_month >= 0),
  source text check (length(source) <= 200),
  next_step text check (length(next_step) <= 500),
  next_date date,
  notes text check (length(notes) <= 4000),
  signed_at date,                       -- set when a signed agreement exists; required for 'won'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stage <> 'won' or signed_at is not null)
);
alter table public.deals enable row level security;
create index if not exists deals_stage_idx on public.deals (stage, updated_at desc);

-- Add (p_id null) or update a deal. Returns the id, or null for a wrong key or bad input.
create or replace function public.af_deal_save(
  p_secret text, p_id bigint, p_organisation text, p_segment text, p_product text, p_stage text,
  p_value_usd_month numeric, p_source text, p_next_step text, p_next_date date, p_notes text, p_signed_at date
)
returns bigint
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
  if p_stage = 'won' and p_signed_at is null then
    return null; -- nothing is "won" without a signed agreement
  end if;
  if p_id is null then
    insert into public.deals (organisation, segment, product, stage, value_usd_month, source, next_step, next_date, notes, signed_at)
    values (trim(p_organisation), coalesce(p_segment, 'other'), coalesce(p_product, 'frontier_debt'), coalesce(p_stage, 'prospect'),
            p_value_usd_month, p_source, p_next_step, p_next_date, p_notes, p_signed_at)
    returning id into v_id;
  else
    update public.deals set
      organisation = coalesce(nullif(trim(p_organisation), ''), organisation),
      segment = coalesce(p_segment, segment),
      product = coalesce(p_product, product),
      stage = coalesce(p_stage, stage),
      value_usd_month = coalesce(p_value_usd_month, value_usd_month),
      source = coalesce(p_source, source),
      next_step = coalesce(p_next_step, next_step),
      next_date = coalesce(p_next_date, next_date),
      notes = coalesce(p_notes, notes),
      signed_at = coalesce(p_signed_at, signed_at),
      updated_at = now()
    where id = p_id
    returning id into v_id;
  end if;
  return v_id;
exception when check_violation or not_null_violation then
  return null;
end;
$$;

create or replace function public.af_deals_list(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(d) order by case d.stage when 'won' then 0 when 'proposal' then 1 when 'pilot' then 2 when 'qualified' then 3 when 'contacted' then 4 when 'prospect' then 5 else 6 end, d.updated_at desc)
    from public.deals d
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.af_deal_save(text, bigint, text, text, text, text, numeric, text, text, date, text, date) from public;
revoke all on function public.af_deals_list(text) from public;
grant execute on function public.af_deal_save(text, bigint, text, text, text, text, numeric, text, text, date, text, date) to anon, authenticated, service_role;
grant execute on function public.af_deals_list(text) to anon, authenticated, service_role;
