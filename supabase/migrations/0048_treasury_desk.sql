-- NOT YET APPLIED. Apply only on the founder's yes (D-035, D-036; docs/strategy/founder-strategy-pack.md sections H and M).
-- The Treasury Desk: the 60 named targets in the deal log, organisations that pay, what each is entitled to, the
-- monthly pack issues and invoices.
--
-- Adds:
--   * deals: segments 'sacco' and 'administrator', products 'treasury_desk' and 'benchmarking', and the sales-log
--     fields the 90-day test reads (d036, objection, price_quoted_kes, board_date, decision_maker, sample_sent_on).
--     Existing rows and checks are unchanged apart from the two widened lists.
--   * desk_orgs, desk_entitlements, desk_pack_issues, desk_invoices: RLS on, no policies (the site has no customer
--     logins; everything goes through the secret-gated functions below, as in 0028, 0033, 0040).
--   * af_entitlement_from_payment: called by lib/billing/record.ts for every confirmed pack, pack-with-alerts and
--     benchmarking payment. Idempotent per Paystack reference.
--   * af_has_entitlement, af_desk_entitlement_grant (invoice and pilot), af_desk_targets_load (the D-036 list),
--     af_desk_target_update (refuses any deal outside the D-036 list: D-034 stays in force for everyone else),
--     af_desk_org_rename, af_desk_pack_issue_mark, af_desk_treasury (the desk's Treasury tab).
--
-- Safe to apply at any time: no data is deleted; before it is applied, the desk's Treasury tab says so and payments
-- are recorded exactly as today.

alter table public.deals drop constraint if exists deals_segment_check;
alter table public.deals add constraint deals_segment_check check (segment in (
  'asset_manager', 'bank', 'dfi', 'research', 'pension', 'insurer', 'corporate', 'government', 'media', 'other', 'sacco', 'administrator'));
alter table public.deals drop constraint if exists deals_product_check;
alter table public.deals add constraint deals_product_check check (product in (
  'frontier_debt', 'data_api', 'enterprise', 'pack', 'widget', 'listing', 'research', 'tenders', 'other', 'treasury_desk', 'benchmarking'));

alter table public.deals add column if not exists d036 boolean not null default false;
alter table public.deals add column if not exists objection text check (length(objection) <= 500);
alter table public.deals add column if not exists price_quoted_kes numeric(12, 2) check (price_quoted_kes is null or price_quoted_kes >= 0);
alter table public.deals add column if not exists board_date date;
alter table public.deals add column if not exists decision_maker boolean;
alter table public.deals add column if not exists sample_sent_on date;
create index if not exists deals_d036_idx on public.deals (d036) where d036;

create table if not exists public.desk_orgs (
  id bigint generated always as identity primary key,
  name text not null unique check (length(name) between 2 and 160),
  kind text not null default 'other' check (kind in ('sacco', 'pension', 'administrator', 'fund_manager', 'insurer', 'bank', 'corporate', 'dfi', 'fintech', 'other')),
  domain text check (domain is null or domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  deal_id bigint references public.deals (id) on delete set null,
  kra_pin text check (kra_pin is null or kra_pin ~ '^[A-Z][0-9]{9}[A-Z]$'),
  created_at timestamptz not null default now()
);
create unique index if not exists desk_orgs_domain_idx on public.desk_orgs (domain) where domain is not null;

create table if not exists public.desk_entitlements (
  id bigint generated always as identity primary key,
  org_id bigint not null references public.desk_orgs (id) on delete cascade,
  product text not null check (product in ('pack', 'pack_plus', 'treasury_desk', 'benchmarking')),
  amount_kes_month numeric(12, 2) not null default 0 check (amount_kes_month >= 0),
  schemes int not null default 1 check (schemes between 1 and 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  source text not null check (source in ('paystack', 'invoice', 'pilot')),
  reference text unique check (length(reference) <= 120),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists desk_entitlements_org_idx on public.desk_entitlements (org_id, ends_at desc);

create table if not exists public.desk_pack_issues (
  id bigint generated always as identity primary key,
  org_id bigint not null references public.desk_orgs (id) on delete cascade,
  period text not null check (period ~ '^\d{4}-\d{2}$'),
  checked_by text check (length(checked_by) <= 80),
  checked_at timestamptz,
  sent_at timestamptz,
  unique (org_id, period)
);

create table if not exists public.desk_invoices (
  id bigint generated always as identity primary key,
  org_id bigint not null references public.desk_orgs (id) on delete cascade,
  number text not null unique check (number ~ '^AF-INV-\d{4}-\d{3,}$'),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'KES' check (currency in ('KES', 'USD')),
  issued_on date not null default current_date,
  paid_on date,
  method text check (method in ('bank', 'mpesa', 'cheque', 'paystack'))
);

alter table public.desk_orgs enable row level security;
alter table public.desk_entitlements enable row level security;
alter table public.desk_pack_issues enable row level security;
alter table public.desk_invoices enable row level security;

create or replace function public.af_secret_ok(p_secret text)
returns boolean language sql stable security definer set search_path to 'public' as $function$
  select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret)
$function$;

-- Is this organisation entitled to this product right now?
create or replace function public.af_has_entitlement(p_secret text, p_org bigint, p_product text)
returns boolean language sql stable security definer set search_path to 'public' as $function$
  select public.af_secret_ok(p_secret) and exists (
    select 1 from public.desk_entitlements e
    where e.org_id = p_org and now() between e.starts_at and e.ends_at
      and (e.product = p_product or (e.product = 'treasury_desk' and p_product in ('pack', 'pack_plus', 'benchmarking'))
           or (e.product = 'pack_plus' and p_product = 'pack')))
$function$;

-- A confirmed Paystack payment for a Treasury Desk product becomes an entitlement, once per reference. The
-- organisation is found by the payer's email domain, or created; a personal address (gmail and the like) gets an
-- organisation the desk names later. Amounts arrive in minor units (cents), as Paystack sends them.
create or replace function public.af_entitlement_from_payment(p_secret text, p_reference text, p_email text, p_plan text, p_amount numeric, p_currency text, p_paid_at timestamptz)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare
  v_domain text := lower(split_part(coalesce(p_email, ''), '@', 2));
  v_personal boolean;
  v_org bigint;
  v_months int;
  v_monthly numeric;
  v_ent bigint;
  v_start timestamptz := coalesce(p_paid_at, now());
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if p_plan not in ('pack', 'pack_plus', 'benchmarking') or p_reference is null or coalesce(p_currency, 'KES') <> 'KES' then
    return jsonb_build_object('ok', false, 'reason', 'not a Treasury Desk payment');
  end if;
  if exists (select 1 from public.desk_entitlements where reference = p_reference) then
    return jsonb_build_object('ok', true, 'created', false);
  end if;
  v_personal := v_domain = '' or v_domain in ('gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'aol.com');
  if not v_personal then select id into v_org from public.desk_orgs where domain = v_domain; end if;
  if v_org is null then
    insert into public.desk_orgs (name, domain)
    values (case when v_personal then 'Unnamed payer ' || left(p_reference, 24) else v_domain end, case when v_personal then null else v_domain end)
    on conflict (name) do update set name = excluded.name
    returning id into v_org;
  end if;
  -- Benchmarking covers a quarter. A pack payment of ten months' price or more is a year paid in advance.
  if p_plan = 'benchmarking' then v_months := 3;
  elsif p_amount / 100 >= 10 * (case p_plan when 'pack' then 12000 else 18000 end) then v_months := 12;
  else v_months := 1;
  end if;
  v_monthly := round(p_amount / 100 / v_months, 2);
  insert into public.desk_entitlements (org_id, product, amount_kes_month, starts_at, ends_at, source, reference)
  values (v_org, p_plan, v_monthly, v_start, v_start + make_interval(months => v_months) + interval '3 days', 'paystack', p_reference)
  returning id into v_ent;
  return jsonb_build_object('ok', true, 'created', true, 'org_id', v_org, 'entitlement_id', v_ent, 'months', v_months);
end
$function$;

-- Invoice or pilot entitlements from the desk. Creates the organisation by name if needed.
create or replace function public.af_desk_entitlement_grant(p_secret text, p_org_name text, p_kind text, p_product text, p_months int, p_amount_kes_month numeric, p_source text, p_reference text, p_schemes int default 1)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_org bigint; v_ent bigint;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if coalesce(length(trim(p_org_name)), 0) < 2 or p_months not between 1 and 36 or p_source not in ('invoice', 'pilot') then
    return jsonb_build_object('ok', false, 'reason', 'organisation, 1 to 36 months and source invoice or pilot are required');
  end if;
  insert into public.desk_orgs (name, kind) values (trim(p_org_name), coalesce(nullif(p_kind, ''), 'other'))
  on conflict (name) do update set name = excluded.name returning id into v_org;
  update public.desk_orgs o set deal_id = d.id from public.deals d
  where o.id = v_org and o.deal_id is null and lower(d.organisation) = lower(o.name);
  insert into public.desk_entitlements (org_id, product, amount_kes_month, schemes, ends_at, source, reference)
  values (v_org, p_product, coalesce(p_amount_kes_month, 0), greatest(1, coalesce(p_schemes, 1)), now() + make_interval(months => p_months), p_source, nullif(trim(coalesce(p_reference, '')), ''))
  returning id into v_ent;
  return jsonb_build_object('ok', true, 'org_id', v_org, 'entitlement_id', v_ent);
end
$function$;

-- Load the D-036 list (data/sales/treasury-desk-targets.json rows: name, group, offer). New names become deals at
-- stage 'prospect'; names already in the log are marked d036 and keep their history.
create or replace function public.af_desk_targets_load(p_secret text, p_rows jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare r jsonb; v_added int := 0; v_marked int := 0; v_id bigint;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 100 then
    return jsonb_build_object('ok', false, 'reason', 'expected a list of at most 100 rows');
  end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    select id into v_id from public.deals where lower(organisation) = lower(r->>'name') limit 1;
    if v_id is null then
      insert into public.deals (organisation, segment, product, stage, source, d036)
      values (left(r->>'name', 160),
              case r->>'group' when 'sacco' then 'sacco' when 'fund_manager' then 'asset_manager'
                else case when (r->>'kind') ilike '%administrator%' then 'administrator' else 'pension' end end,
              case when r->>'offer' = 'Treasury Desk' then 'treasury_desk' else 'pack' end,
              'prospect', 'D-036 list', true);
      v_added := v_added + 1;
    else
      update public.deals set d036 = true, updated_at = now() where id = v_id and not d036;
      if found then v_marked := v_marked + 1; end if;
    end if;
    v_id := null;
  end loop;
  return jsonb_build_object('ok', true, 'added', v_added, 'marked', v_marked);
end
$function$;

-- Update a D-036 target. Refuses every other deal: under D-034 a deal changes only when someone writes to us.
-- Stage 'won' (paying) sets signed_at to today when it is not set.
create or replace function public.af_desk_target_update(p_secret text, p_id bigint, p_stage text, p_objection text, p_price_quoted_kes numeric,
  p_board_date date, p_decision_maker boolean, p_sample_sent_on date, p_next_step text, p_next_date date, p_note text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare d public.deals;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  select * into d from public.deals where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such deal'); end if;
  if not d.d036 then return jsonb_build_object('ok', false, 'reason', 'not on the D-036 list: D-034 applies'); end if;
  if p_stage is not null and p_stage not in ('prospect', 'contacted', 'qualified', 'pilot', 'proposal', 'won', 'lost') then
    return jsonb_build_object('ok', false, 'reason', 'unknown stage');
  end if;
  update public.deals set
    stage = coalesce(p_stage, stage),
    signed_at = case when coalesce(p_stage, stage) = 'won' then coalesce(signed_at, current_date) else signed_at end,
    objection = coalesce(nullif(trim(p_objection), ''), objection),
    price_quoted_kes = coalesce(p_price_quoted_kes, price_quoted_kes),
    board_date = coalesce(p_board_date, board_date),
    decision_maker = coalesce(p_decision_maker, decision_maker),
    sample_sent_on = coalesce(p_sample_sent_on, sample_sent_on),
    next_step = coalesce(nullif(trim(p_next_step), ''), next_step),
    next_date = coalesce(p_next_date, next_date),
    notes = case when nullif(trim(p_note), '') is null then notes
                 else right(concat_ws(E'\n', notes, to_char(current_date, 'YYYY-MM-DD') || ' desk: ' || left(trim(p_note), 300)), 4000) end,
    updated_at = now()
  where id = p_id;
  return jsonb_build_object('ok', true);
end
$function$;

-- Name an organisation properly (one created from a payment is named after its email domain) and set its kind.
create or replace function public.af_desk_org_rename(p_secret text, p_org bigint, p_name text, p_kind text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if coalesce(length(trim(p_name)), 0) not between 2 and 160 then return jsonb_build_object('ok', false, 'reason', 'name of 2 to 160 characters'); end if;
  if exists (select 1 from public.desk_orgs where lower(name) = lower(trim(p_name)) and id <> p_org) then
    return jsonb_build_object('ok', false, 'reason', 'another organisation has that name');
  end if;
  update public.desk_orgs set name = trim(p_name), kind = coalesce(nullif(p_kind, ''), kind) where id = p_org;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such organisation'); end if;
  update public.desk_orgs o set deal_id = d.id from public.deals d
  where o.id = p_org and o.deal_id is null and lower(d.organisation) = lower(o.name);
  return jsonb_build_object('ok', true);
end
$function$;

-- Mark this month's pack for an organisation as checked (by whom) and, optionally, sent.
create or replace function public.af_desk_pack_issue_mark(p_secret text, p_org bigint, p_period text, p_checked_by text, p_sent boolean)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if p_period !~ '^\d{4}-\d{2}$' or coalesce(length(trim(p_checked_by)), 0) < 2 then
    return jsonb_build_object('ok', false, 'reason', 'period YYYY-MM and the checker''s name are required');
  end if;
  insert into public.desk_pack_issues (org_id, period, checked_by, checked_at, sent_at)
  values (p_org, p_period, trim(p_checked_by), now(), case when p_sent then now() end)
  on conflict (org_id, period) do update set checked_by = excluded.checked_by, checked_at = excluded.checked_at,
    sent_at = coalesce(public.desk_pack_issues.sent_at, excluded.sent_at);
  return jsonb_build_object('ok', true);
end
$function$;

-- The desk's Treasury tab: the D-036 targets, stage counts, paying organisations, booked monthly revenue and the
-- packs due this month (Nairobi time). No emails.
create or replace function public.af_desk_treasury(p_secret text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  with ok as (select public.af_secret_ok(p_secret) as yes),
  period as (select to_char(now() at time zone 'Africa/Nairobi', 'YYYY-MM') as p),
  active as (
    select e.*, o.name as org_name, o.kind as org_kind from public.desk_entitlements e join public.desk_orgs o on o.id = e.org_id
    where (select yes from ok) and now() between e.starts_at and e.ends_at
  )
  select case when not (select yes from ok) then null else jsonb_build_object(
    'period', (select p from period),
    'targets', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', d.id, 'organisation', d.organisation, 'segment', d.segment, 'product', d.product, 'stage', d.stage,
        'objection', d.objection, 'price_quoted_kes', d.price_quoted_kes, 'board_date', d.board_date,
        'decision_maker', d.decision_maker, 'sample_sent_on', d.sample_sent_on, 'next_step', d.next_step,
        'next_date', d.next_date, 'updated_at', d.updated_at) order by d.stage, d.next_date nulls last, d.organisation), '[]'::jsonb)
      from public.deals d where d.d036),
    'stages', (select coalesce(jsonb_object_agg(stage, n), '{}'::jsonb) from (select stage, count(*) n from public.deals where d036 group by stage) s),
    'decision_makers', (select count(*) from public.deals where d036 and decision_maker),
    'samples_sent', (select count(*) from public.deals where d036 and sample_sent_on is not null),
    'paying', (select count(distinct org_id) from active),
    'desk_tier', (select count(distinct org_id) from active where product = 'treasury_desk'),
    'mrr_kes', (select coalesce(sum(amount_kes_month), 0) from active),
    'orgs', (select coalesce(jsonb_agg(jsonb_build_object('org_id', org_id, 'name', org_name, 'kind', org_kind, 'product', product,
        'amount_kes_month', amount_kes_month, 'ends_at', ends_at, 'source', source) order by org_name), '[]'::jsonb) from active),
    'packs_due', (select coalesce(jsonb_agg(jsonb_build_object('org_id', a.org_id, 'name', a.org_name, 'product', a.product,
        'checked_by', i.checked_by, 'checked_at', i.checked_at, 'sent_at', i.sent_at) order by a.org_name), '[]'::jsonb)
      from (select distinct on (org_id) * from active where product in ('pack', 'pack_plus', 'treasury_desk') order by org_id, ends_at desc) a
      left join public.desk_pack_issues i on i.org_id = a.org_id and i.period = (select p from period))
  ) end
$function$;

revoke all on function public.af_secret_ok(text) from public;
revoke all on function public.af_has_entitlement(text, bigint, text) from public;
revoke all on function public.af_entitlement_from_payment(text, text, text, text, numeric, text, timestamptz) from public;
revoke all on function public.af_desk_entitlement_grant(text, text, text, text, int, numeric, text, text, int) from public;
revoke all on function public.af_desk_targets_load(text, jsonb) from public;
revoke all on function public.af_desk_target_update(text, bigint, text, text, numeric, date, boolean, date, text, date, text) from public;
revoke all on function public.af_desk_pack_issue_mark(text, bigint, text, text, boolean) from public;
revoke all on function public.af_desk_treasury(text) from public;
revoke all on function public.af_desk_org_rename(text, bigint, text, text) from public;
grant execute on function public.af_has_entitlement(text, bigint, text) to anon, authenticated, service_role;
grant execute on function public.af_entitlement_from_payment(text, text, text, text, numeric, text, timestamptz) to anon, authenticated, service_role;
grant execute on function public.af_desk_entitlement_grant(text, text, text, text, int, numeric, text, text, int) to anon, authenticated, service_role;
grant execute on function public.af_desk_targets_load(text, jsonb) to anon, authenticated, service_role;
grant execute on function public.af_desk_target_update(text, bigint, text, text, numeric, date, boolean, date, text, date, text) to anon, authenticated, service_role;
grant execute on function public.af_desk_pack_issue_mark(text, bigint, text, text, boolean) to anon, authenticated, service_role;
grant execute on function public.af_desk_treasury(text) to anon, authenticated, service_role;
grant execute on function public.af_desk_org_rename(text, bigint, text, text) to anon, authenticated, service_role;
