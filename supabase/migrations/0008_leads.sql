-- Commercial enquiries (sponsorship, data licensing, research, access requests).
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  email text not null,
  name text,
  organisation text,
  interest text not null,
  message text,
  source text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
-- No public policies: rows are readable only with the service role / dashboard.

create or replace function public.af_lead(p_email text, p_name text, p_org text, p_interest text, p_message text, p_source text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email is null or p_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(p_email) > 200 then
    raise exception 'invalid email';
  end if;
  if p_interest not in ('sponsorship', 'licensing', 'research', 'access', 'widgets', 'other') then
    raise exception 'invalid interest';
  end if;
  -- Throttle: at most 5 enquiries per address per day.
  if (select count(*) from public.leads where email = lower(p_email) and created_at > now() - interval '1 day') >= 5 then
    return false;
  end if;
  insert into public.leads (email, name, organisation, interest, message, source)
  values (lower(p_email), left(p_name, 120), left(p_org, 160), p_interest, left(p_message, 4000), left(p_source, 200));
  return true;
end;
$$;

revoke all on function public.af_lead(text, text, text, text, text, text) from public;
grant execute on function public.af_lead(text, text, text, text, text, text) to anon, authenticated;
