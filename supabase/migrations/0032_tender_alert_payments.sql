-- Applied 12 Oct 2026. Paystack pays for tender alerts: a confirmed charge for plan 'tender_alerts' (KES 500, a
-- month) or 'tender_alerts_year' (KES 5,000, twelve months) extends the live alert on the paying email. Paystack
-- reports a charge twice (webhook and the return page), so each reference grants once: the reference is recorded
-- here first and a repeat changes nothing.

create table if not exists public.tender_alert_payments (
  reference text primary key check (length(reference) between 6 and 120),
  email text not null,
  months int not null check (months between 1 and 12),
  paid_until date,
  created_at timestamptz not null default now()
);
alter table public.tender_alert_payments enable row level security;

-- Returns {status: 'granted' | 'duplicate' | 'no_alert', paid_until?}. 'no_alert': no confirmed, live alert on that
-- email; the payment stays recorded in payments and the desk is told, so it can be applied by hand.
create or replace function public.af_tender_alert_pay(p_secret text, p_reference text, p_email text, p_months int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_until date;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  if p_months not between 1 and 12 or p_reference is null or p_email is null then
    return jsonb_build_object('status', 'no_alert');
  end if;
  -- Claim the reference first, so two deliveries of the same charge can never both grant.
  insert into public.tender_alert_payments (reference, email, months) values (p_reference, lower(trim(p_email)), p_months)
  on conflict (reference) do nothing;
  if not found then
    return jsonb_build_object('status', 'duplicate');
  end if;
  update public.tender_alerts
  set paid_until = greatest(coalesce(paid_until, current_date), coalesce(trial_until, current_date), current_date) + make_interval(months => p_months),
      reminded_at = null
  where lower(email) = lower(trim(p_email)) and unsubscribed_at is null and confirmed_at is not null
  returning paid_until into v_until;
  if v_until is null then
    delete from public.tender_alert_payments where reference = p_reference; -- applied later by hand, or on a retry once the alert exists
    return jsonb_build_object('status', 'no_alert');
  end if;
  update public.tender_alert_payments set paid_until = v_until where reference = p_reference;
  return jsonb_build_object('status', 'granted', 'paid_until', v_until);
end;
$$;

revoke all on function public.af_tender_alert_pay(text, text, text, int) from public;
grant execute on function public.af_tender_alert_pay(text, text, text, int) to anon, authenticated, service_role;
