-- NOT YET APPLIED. Paid API keys without the desk (master plan v2, build item 3; decision D-016).
--
-- When a Paystack charge for the Team and API plan (checkout plans data_team and data_team_ke) is confirmed, the app
-- issues an API key at once, shows it once on /thank-you and emails it with the receipt. The key expires at the end of
-- the paid period plus three days' grace; a later payment by the same email for the same plan extends that key rather
-- than issuing a second one. Analyst has no API access and is not touched here.
--
-- Paystack reports one charge twice (the webhook and the buyer's return to /thank-you), in either order, so every
-- step below is keyed on the payment reference and happens once:
--   * paid_key_payments: one row per reference (primary key), linking the payment to the key it issued or extended
--   * af_paid_key_issue: claims the reference first; a repeat returns 'duplicate' with what the first call did
--   * af_paid_key_reveal: lets /thank-you show a key issued by the webhook, once, within three days, and only when
--     the key the app re-derives matches the stored hash
--   * af_paid_key_mark: records whether the key email went out (the desk sees "key issued, email failed")
--   * af_payment_receipt_claim: the receipt and the desk note go out once per reference (until now both paths sent them)
--
-- The database never sees a key: the app derives it from the reference with a server-only secret (PAID_KEY_SECRET on
-- Vercel, which is not stored here) and passes only its SHA-256 hash and display prefix, exactly the data_keys model of
-- 0028. Expiry is already enforced by af_api_key_use (0035).
--
-- Safe to apply on the live database: two new nullable columns on data_keys and payments, one new table, four new
-- functions. No existing function, row or constraint changes, so existing keys, trial keys, payments and the desk keep
-- working exactly as before. Until it is applied the app falls back to today's behaviour (the desk issues the key).
--
-- Same model as 0028 / 0035: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

alter table public.data_keys add column if not exists paid_until timestamptz;
alter table public.payments add column if not exists receipt_sent_at timestamptz;

create table if not exists public.paid_key_payments (
  reference text primary key check (length(reference) between 6 and 120),
  key_id bigint references public.data_keys (id) on delete set null,
  email text not null check (length(email) <= 200),
  plan text not null,
  months int not null check (months between 1 and 12),
  outcome text not null check (outcome in ('issued', 'renewed')),
  is_test boolean not null default false,
  paid_until timestamptz not null,
  expires_at timestamptz not null,
  revealed_at timestamptz,         -- shown on /thank-you (once)
  emailed_at timestamptz,          -- the key or renewal email went out
  email_error text,                -- why it did not, for the desk
  created_at timestamptz not null default now()
);
alter table public.paid_key_payments enable row level security;
create index if not exists paid_key_payments_email_idx on public.paid_key_payments (email, created_at desc);
create index if not exists paid_key_payments_key_idx on public.paid_key_payments (key_id);

-- Issue or extend the paid key for a recorded payment.
--
-- The payment must already be in payments (af_record_payment runs first) with status 'success', or 'test' when the
-- app passes p_allow_test (only outside production). Email, plan and paid_at are taken from that row, not from the
-- caller. p_months is the number of paid months the app worked out from the amount (1 to 12).
--
-- Returns, or null for a wrong secret:
--   {status: 'issued',  key_id, prefix, paid_until, expires_at}            a new key; the app holds the key itself
--   {status: 'renewed', key_id, prefix, paid_until, expires_at}            the existing key now runs longer
--   {status: 'duplicate', outcome, key_id, prefix, expires_at, revealed, emailed}   this reference was handled already
--   {status: 'no_payment' | 'not_paid' | 'test_refused' | 'wrong_plan' | 'bad_input'}  nothing issued
create or replace function public.af_paid_key_issue(
  p_secret text,
  p_reference text,
  p_months int,
  p_key_hash text,
  p_prefix text,
  p_label text,
  p_allow_test boolean,
  p_reveal boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay public.payments%rowtype;
  v_email text;
  v_test boolean;
  v_link public.paid_key_payments%rowtype;
  v_key public.data_keys%rowtype;
  v_paid_until timestamptz;
  v_expires timestamptz;
  v_id bigint;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  if p_reference is null or length(p_reference) not between 6 and 120 or p_months is null or p_months not between 1 and 12
     or coalesce(p_key_hash, '') !~ '^[0-9a-f]{64}$' or coalesce(p_prefix, '') !~ '^afk_[0-9a-f]{6}$' then
    return jsonb_build_object('status', 'bad_input');
  end if;

  select * into v_pay from public.payments where reference = p_reference;
  if not found then return jsonb_build_object('status', 'no_payment'); end if;
  if v_pay.plan is null or v_pay.plan not in ('data_team', 'data_team_ke') then return jsonb_build_object('status', 'wrong_plan'); end if;
  v_email := lower(trim(coalesce(v_pay.email, '')));
  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(v_email) > 200 then return jsonb_build_object('status', 'bad_input'); end if;
  v_test := v_pay.status = 'test';
  if v_test and not coalesce(p_allow_test, false) then return jsonb_build_object('status', 'test_refused'); end if;
  if v_pay.status <> 'success' and not v_test then return jsonb_build_object('status', 'not_paid'); end if;

  -- One buyer at a time, so a webhook and a return page (or two renewals) cannot both issue.
  perform pg_advisory_xact_lock(hashtext('af_paid_key:' || v_email));

  select * into v_link from public.paid_key_payments where reference = p_reference;
  if found then
    return jsonb_build_object('status', 'duplicate', 'outcome', v_link.outcome, 'key_id', v_link.key_id,
      'prefix', (select prefix from public.data_keys where id = v_link.key_id), 'paid_until', v_link.paid_until,
      'expires_at', v_link.expires_at, 'revealed', v_link.revealed_at is not null, 'emailed', v_link.emailed_at is not null);
  end if;

  -- Renewal: the latest unrevoked key this email was issued by payment (test keys only renew test keys).
  select k.* into v_key from public.data_keys k
  where k.revoked_at is null and k.plan = 'data_api'
    and exists (select 1 from public.paid_key_payments l where l.key_id = k.id and l.outcome = 'issued' and l.email = v_email and l.is_test = v_test)
  order by k.expires_at desc nulls last
  limit 1;

  if v_test then
    v_paid_until := now() + interval '1 day';   -- test keys are short-lived whatever the amount
    v_expires := v_paid_until;
  elsif v_key.id is not null then
    -- Paid early: the new month starts where the old one ends. Lapsed: it starts on the day of payment.
    v_paid_until := greatest(coalesce(v_key.paid_until, v_pay.paid_at), coalesce(v_pay.paid_at, now())) + make_interval(months => p_months);
    v_expires := v_paid_until + interval '3 days';
  else
    v_paid_until := coalesce(v_pay.paid_at, now()) + make_interval(months => p_months);
    v_expires := v_paid_until + interval '3 days';
  end if;

  if v_key.id is not null then
    update public.data_keys set paid_until = v_paid_until, expires_at = greatest(v_expires, coalesce(expires_at, v_expires))
    where id = v_key.id
    returning expires_at into v_expires;
    insert into public.paid_key_payments (reference, key_id, email, plan, months, outcome, is_test, paid_until, expires_at)
    values (p_reference, v_key.id, v_email, v_pay.plan, p_months, 'renewed', v_test, v_paid_until, v_expires);
    return jsonb_build_object('status', 'renewed', 'key_id', v_key.id, 'prefix', v_key.prefix, 'paid_until', v_paid_until, 'expires_at', v_expires);
  end if;

  insert into public.data_keys (key_hash, prefix, label, plan, expires_at, email, domain, paid_until)
  values (p_key_hash, p_prefix, left(coalesce(nullif(trim(p_label), ''), 'Team and API: ' || v_email), 120), 'data_api',
          v_expires, v_email, split_part(v_email, '@', 2), v_paid_until)
  returning id into v_id;
  insert into public.paid_key_payments (reference, key_id, email, plan, months, outcome, is_test, paid_until, expires_at, revealed_at)
  values (p_reference, v_id, v_email, v_pay.plan, p_months, 'issued', v_test, v_paid_until, v_expires,
          case when coalesce(p_reveal, false) then now() end);
  if coalesce(p_reveal, false) then
    update public.payments set access_sent_at = coalesce(access_sent_at, now()) where reference = p_reference;
  end if;
  return jsonb_build_object('status', 'issued', 'key_id', v_id, 'prefix', p_prefix, 'paid_until', v_paid_until, 'expires_at', v_expires);
exception
  when unique_violation then return jsonb_build_object('status', 'bad_input');   -- the same key hash already exists
  when check_violation then return jsonb_build_object('status', 'bad_input');
end;
$$;

-- /thank-you shows a key the webhook issued: once, within three days of issue, only for a live key whose stored hash
-- matches the one the app re-derived. Returns {status: 'revealed', prefix, expires_at} or {status: 'unavailable'};
-- null for a wrong secret.
create or replace function public.af_paid_key_reveal(p_secret text, p_reference text, p_key_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_expires timestamptz;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  update public.paid_key_payments l
  set revealed_at = now()
  from public.data_keys k
  where l.reference = p_reference and l.outcome = 'issued' and l.revealed_at is null and l.created_at > now() - interval '3 days'
    and k.id = l.key_id and k.key_hash = p_key_hash and k.revoked_at is null and (k.expires_at is null or k.expires_at > now())
  returning k.prefix, k.expires_at into v_prefix, v_expires;
  if v_prefix is null then return jsonb_build_object('status', 'unavailable'); end if;
  update public.payments set access_sent_at = coalesce(access_sent_at, now()) where reference = p_reference;
  return jsonb_build_object('status', 'revealed', 'prefix', v_prefix, 'expires_at', v_expires);
end;
$$;

-- Whether the key (or renewal) email went out. A sent email also marks the payment's access as sent on /desk.
create or replace function public.af_paid_key_mark(p_secret text, p_reference text, p_emailed boolean, p_error text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  update public.paid_key_payments
  set emailed_at = case when p_emailed then coalesce(emailed_at, now()) else emailed_at end,
      email_error = case when p_emailed then null else left(coalesce(p_error, 'failed'), 200) end
  where reference = p_reference;
  if not found then return false; end if;
  if p_emailed then
    update public.payments set access_sent_at = coalesce(access_sent_at, now()) where reference = p_reference;
  end if;
  return true;
end;
$$;

-- The receipt and the desk note go out once per reference: true for the first caller, false afterwards (also false
-- for an unknown reference); null for a wrong secret.
create or replace function public.af_payment_receipt_claim(p_secret text, p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  update public.payments set receipt_sent_at = now() where reference = p_reference and receipt_sent_at is null;
  return found;
end;
$$;

revoke all on function public.af_paid_key_issue(text, text, int, text, text, text, boolean, boolean) from public;
revoke all on function public.af_paid_key_reveal(text, text, text) from public;
revoke all on function public.af_paid_key_mark(text, text, boolean, text) from public;
revoke all on function public.af_payment_receipt_claim(text, text) from public;
grant execute on function public.af_paid_key_issue(text, text, int, text, text, text, boolean, boolean) to anon, authenticated, service_role;
grant execute on function public.af_paid_key_reveal(text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_paid_key_mark(text, text, boolean, text) to anon, authenticated, service_role;
grant execute on function public.af_payment_receipt_claim(text, text) to anon, authenticated, service_role;
