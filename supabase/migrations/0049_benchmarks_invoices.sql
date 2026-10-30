-- NOT YET APPLIED. Apply only on the founder's yes. Treasury Desk wave 2 (founder-strategy-pack.md section M,
-- phases 2 and 3; D-035, D-036): benchmark uploads through a private link, the desk's review before release, KES
-- invoices, and the institution's KRA PIN for the invoice.
--
-- Adds:
--   * desk_benchmark_uploads: one row per organisation and quarter, deleted 15 months after upload (privacy notice). Holdings are stored as parsed JSON (instrument,
--     kind, amount, rate, dates); no personal data is asked for or kept. Replaced by a new upload until released.
--   * af_benchmark_upload (needs a live benchmarking entitlement, or the Treasury Desk), af_benchmark_released,
--     af_desk_benchmarks, af_desk_benchmark_get, af_desk_benchmark_review.
--   * af_desk_invoice_create (numbers AF-INV-YYYY-NNN in order), af_desk_invoice_paid, af_desk_invoices,
--     af_desk_org_get, af_desk_org_kra.
--
-- Same model as 0048: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret. Nothing existing is
-- changed or deleted. Depends on 0048 (desk_orgs, desk_invoices, af_secret_ok, af_has_entitlement).

create table if not exists public.desk_benchmark_uploads (
  id bigint generated always as identity primary key,
  org_id bigint not null references public.desk_orgs (id) on delete cascade,
  quarter text not null check (quarter ~ '^\d{4}-Q[1-4]$'),
  holdings jsonb not null check (jsonb_typeof(holdings) = 'array' and jsonb_array_length(holdings) between 1 and 200),
  file_name text check (length(file_name) <= 160),
  uploaded_at timestamptz not null default now(),
  reviewed_by text check (length(reviewed_by) <= 80),
  reviewed_at timestamptz,
  released_at timestamptz,
  unique (org_id, quarter)
);
alter table public.desk_benchmark_uploads enable row level security;

-- A client's upload through its private link. Refused without a live benchmarking (or Treasury Desk) entitlement,
-- and refused once that quarter's page has been released.
create or replace function public.af_benchmark_upload(p_secret text, p_org bigint, p_quarter text, p_holdings jsonb, p_file_name text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_id bigint;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if not public.af_has_entitlement(p_secret, p_org, 'benchmarking') then
    return jsonb_build_object('ok', false, 'reason', 'no live benchmarking subscription for this institution');
  end if;
  if p_quarter !~ '^\d{4}-Q[1-4]$' or jsonb_typeof(p_holdings) <> 'array' or jsonb_array_length(p_holdings) not between 1 and 200 then
    return jsonb_build_object('ok', false, 'reason', 'a quarter like 2026-Q3 and 1 to 200 holdings are required');
  end if;
  -- Retention (privacy notice): uploads are deleted 15 months after they are sent. Run here, on every upload.
  delete from public.desk_benchmark_uploads where uploaded_at < now() - interval '15 months';
  if exists (select 1 from public.desk_benchmark_uploads where org_id = p_org and quarter = p_quarter and released_at is not null) then
    return jsonb_build_object('ok', false, 'reason', 'this quarter''s page is already released; write to the desk to change it');
  end if;
  insert into public.desk_benchmark_uploads (org_id, quarter, holdings, file_name)
  values (p_org, p_quarter, p_holdings, left(p_file_name, 160))
  on conflict (org_id, quarter) do update set holdings = excluded.holdings, file_name = excluded.file_name,
    uploaded_at = now(), reviewed_by = null, reviewed_at = null
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end
$function$;

-- The released benchmark for an organisation and quarter (what the client's private link shows), or null.
create or replace function public.af_benchmark_released(p_secret text, p_org bigint, p_quarter text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else (
    select jsonb_build_object('quarter', u.quarter, 'holdings', u.holdings, 'released_at', u.released_at, 'name', o.name)
    from public.desk_benchmark_uploads u join public.desk_orgs o on o.id = u.org_id
    where u.org_id = p_org and u.quarter = p_quarter and u.released_at is not null) end
$function$;

create or replace function public.af_desk_benchmarks(p_secret text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else coalesce((
    select jsonb_agg(jsonb_build_object('id', u.id, 'org_id', u.org_id, 'name', o.name, 'quarter', u.quarter,
      'holdings', jsonb_array_length(u.holdings), 'uploaded_at', u.uploaded_at, 'reviewed_by', u.reviewed_by,
      'reviewed_at', u.reviewed_at, 'released_at', u.released_at) order by u.uploaded_at desc)
    from public.desk_benchmark_uploads u join public.desk_orgs o on o.id = u.org_id), '[]'::jsonb) end
$function$;

create or replace function public.af_desk_benchmark_get(p_secret text, p_id bigint)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else (
    select jsonb_build_object('id', u.id, 'org_id', u.org_id, 'name', o.name, 'quarter', u.quarter, 'holdings', u.holdings,
      'reviewed_by', u.reviewed_by, 'released_at', u.released_at)
    from public.desk_benchmark_uploads u join public.desk_orgs o on o.id = u.org_id where u.id = p_id) end
$function$;

-- The desk checks the page against the client's file, then releases it to the client's private link.
create or replace function public.af_desk_benchmark_review(p_secret text, p_id bigint, p_reviewed_by text, p_release boolean)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if coalesce(length(trim(p_reviewed_by)), 0) < 2 then return jsonb_build_object('ok', false, 'reason', 'the reviewer''s name is required'); end if;
  delete from public.desk_benchmark_uploads where uploaded_at < now() - interval '15 months';
  update public.desk_benchmark_uploads set reviewed_by = trim(p_reviewed_by), reviewed_at = now(),
    released_at = case when p_release then coalesce(released_at, now()) else released_at end
  where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such upload'); end if;
  return jsonb_build_object('ok', true);
end
$function$;

-- A KES (or USD) invoice for an organisation, numbered AF-INV-<year>-<NNN> in order within the year.
create or replace function public.af_desk_invoice_create(p_secret text, p_org bigint, p_amount numeric, p_currency text, p_issued_on date)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_year int := extract(year from coalesce(p_issued_on, current_date)); v_n int; v_number text; v_id bigint;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if not exists (select 1 from public.desk_orgs where id = p_org) then return jsonb_build_object('ok', false, 'reason', 'no such organisation'); end if;
  if not (p_amount > 0) or coalesce(p_currency, 'KES') not in ('KES', 'USD') then
    return jsonb_build_object('ok', false, 'reason', 'a positive amount in KES or USD is required');
  end if;
  perform pg_advisory_xact_lock(hashtext('desk_invoices'));
  select coalesce(max(split_part(number, '-', 4)::int), 0) + 1 into v_n from public.desk_invoices where number like 'AF-INV-' || v_year || '-%';
  v_number := 'AF-INV-' || v_year || '-' || lpad(v_n::text, 3, '0');
  insert into public.desk_invoices (org_id, number, amount, currency, issued_on)
  values (p_org, v_number, p_amount, coalesce(p_currency, 'KES'), coalesce(p_issued_on, current_date))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'number', v_number);
end
$function$;

create or replace function public.af_desk_invoice_paid(p_secret text, p_id bigint, p_paid_on date, p_method text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if p_method not in ('bank', 'mpesa', 'cheque', 'paystack') then return jsonb_build_object('ok', false, 'reason', 'method: bank, mpesa, cheque or paystack'); end if;
  update public.desk_invoices set paid_on = coalesce(p_paid_on, current_date), method = p_method where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such invoice'); end if;
  return jsonb_build_object('ok', true);
end
$function$;

create or replace function public.af_desk_invoices(p_secret text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else coalesce((
    select jsonb_agg(jsonb_build_object('id', i.id, 'number', i.number, 'org_id', i.org_id, 'name', o.name, 'kra_pin', o.kra_pin,
      'amount', i.amount, 'currency', i.currency, 'issued_on', i.issued_on, 'paid_on', i.paid_on, 'method', i.method) order by i.issued_on desc, i.id desc)
    from public.desk_invoices i join public.desk_orgs o on o.id = i.org_id), '[]'::jsonb) end
$function$;

create or replace function public.af_desk_org_get(p_secret text, p_org bigint)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else (
    select jsonb_build_object('id', id, 'name', name, 'kind', kind, 'kra_pin', kra_pin) from public.desk_orgs where id = p_org) end
$function$;

create or replace function public.af_desk_org_kra(p_secret text, p_org bigint, p_kra_pin text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if upper(trim(p_kra_pin)) !~ '^[A-Z][0-9]{9}[A-Z]$' then return jsonb_build_object('ok', false, 'reason', 'a KRA PIN looks like P051234567X'); end if;
  update public.desk_orgs set kra_pin = upper(trim(p_kra_pin)) where id = p_org;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such organisation'); end if;
  return jsonb_build_object('ok', true);
end
$function$;

revoke all on function public.af_benchmark_upload(text, bigint, text, jsonb, text) from public;
revoke all on function public.af_benchmark_released(text, bigint, text) from public;
revoke all on function public.af_desk_benchmarks(text) from public;
revoke all on function public.af_desk_benchmark_get(text, bigint) from public;
revoke all on function public.af_desk_benchmark_review(text, bigint, text, boolean) from public;
revoke all on function public.af_desk_invoice_create(text, bigint, numeric, text, date) from public;
revoke all on function public.af_desk_invoice_paid(text, bigint, date, text) from public;
revoke all on function public.af_desk_invoices(text) from public;
revoke all on function public.af_desk_org_get(text, bigint) from public;
revoke all on function public.af_desk_org_kra(text, bigint, text) from public;
grant execute on function public.af_benchmark_upload(text, bigint, text, jsonb, text) to anon, authenticated, service_role;
grant execute on function public.af_benchmark_released(text, bigint, text) to anon, authenticated, service_role;
grant execute on function public.af_desk_benchmarks(text) to anon, authenticated, service_role;
grant execute on function public.af_desk_benchmark_get(text, bigint) to anon, authenticated, service_role;
grant execute on function public.af_desk_benchmark_review(text, bigint, text, boolean) to anon, authenticated, service_role;
grant execute on function public.af_desk_invoice_create(text, bigint, numeric, text, date) to anon, authenticated, service_role;
grant execute on function public.af_desk_invoice_paid(text, bigint, date, text) to anon, authenticated, service_role;
grant execute on function public.af_desk_invoices(text) to anon, authenticated, service_role;
grant execute on function public.af_desk_org_get(text, bigint) to anon, authenticated, service_role;
grant execute on function public.af_desk_org_kra(text, bigint, text) to anon, authenticated, service_role;
