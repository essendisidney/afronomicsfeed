-- "Call it" (docs/rebuild/phase-7b-plan.md, 7b-4 item 1): before each Kenya Treasury bill auction, readers guess the
-- weighted average rate for the 91-, 182- and 364-day bills; when the CBK publishes the result, each guess is scored
-- against it and against our own published range (data/forecasts/kenya_tbills.json). Entering needs an email address,
-- which also joins the Morning list (app/api/call-it); a handle is shown on the board only if the reader opts in.
--
-- RLS on, no public policies: nobody reads or writes the table through the API. Saving a guess needs the shared 'cron'
-- secret (af_secrets, migration 0012), so only the site's server can call it, and it refuses a guess after bids close.
-- The board function returns counts and opted-in handles with their guesses, never an email address.
--
-- Additive: one new table, two new functions. Nothing existing changes. Until it is applied, /markets/kenya-tbills/
-- call-it says "opens soon" and the API answers 503.

create table if not exists public.call_it_guesses (
  id uuid primary key default gen_random_uuid(),
  value_date date not null,                       -- the auction's value date (its Monday), as in the forecast ledger
  email text not null check (length(email) between 6 and 200 and position('@' in email) > 1),
  handle text check (handle is null or handle ~ '^[A-Za-z0-9 _.-]{2,24}$'),
  show_handle boolean not null default false,
  g91 numeric(6, 3) check (g91 is null or (g91 > 0 and g91 < 40)),
  g182 numeric(6, 3) check (g182 is null or (g182 > 0 and g182 < 40)),
  g364 numeric(6, 3) check (g364 is null or (g364 > 0 and g364 < 40)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (g91 is not null or g182 is not null or g364 is not null)
);
alter table public.call_it_guesses enable row level security;

-- One guess per address per auction; a second entry before the close replaces the first.
create unique index if not exists call_it_guesses_uniq on public.call_it_guesses (value_date, lower(email));
create index if not exists call_it_guesses_created_idx on public.call_it_guesses (created_at);

-- Save (or replace) a guess. p_closes is the auction's bids-close time from the forecast ledger, passed by the server.
-- Returns jsonb {status}: 'saved', 'updated', 'closed' (after bids close), 'limited' (too many entries an hour overall).
create or replace function public.af_call_it_guess(
  p_value_date date, p_closes timestamptz, p_email text, p_handle text, p_show boolean,
  p_g91 numeric, p_g182 numeric, p_g364 numeric, p_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_handle text := nullif(trim(coalesce(p_handle, '')), '');
  v_id uuid;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  if p_closes is null or now() >= p_closes or p_value_date < (p_closes at time zone 'UTC')::date then
    return jsonb_build_object('status', 'closed');
  end if;
  if (select count(*) from public.call_it_guesses g where g.created_at > now() - interval '1 hour') >= 2000 then
    return jsonb_build_object('status', 'limited');
  end if;

  select g.id into v_id from public.call_it_guesses g where g.value_date = p_value_date and lower(g.email) = v_email;
  if found then
    update public.call_it_guesses
      set handle = v_handle, show_handle = coalesce(p_show, false) and v_handle is not null,
          g91 = round(p_g91, 3), g182 = round(p_g182, 3), g364 = round(p_g364, 3), updated_at = now()
      where id = v_id;
    return jsonb_build_object('status', 'updated');
  end if;

  insert into public.call_it_guesses (value_date, email, handle, show_handle, g91, g182, g364)
  values (p_value_date, v_email, v_handle, coalesce(p_show, false) and v_handle is not null, round(p_g91, 3), round(p_g182, 3), round(p_g364, 3));
  return jsonb_build_object('status', 'saved');
end;
$$;

-- The board for one auction: how many guessed, and the opted-in handles with their guesses. No email ever leaves.
create or replace function public.af_call_it_board(p_value_date date)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'entries', (select count(*) from public.call_it_guesses g where g.value_date = p_value_date),
    'shown', (select coalesce(jsonb_agg(jsonb_build_object('handle', g.handle, 'g91', g.g91, 'g182', g.g182, 'g364', g.g364) order by g.created_at), '[]'::jsonb)
              from public.call_it_guesses g where g.value_date = p_value_date and g.show_handle and g.handle is not null)
  );
$$;

revoke all on function public.af_call_it_guess(date, timestamptz, text, text, boolean, numeric, numeric, numeric, text) from public;
revoke all on function public.af_call_it_board(date) from public;
grant execute on function public.af_call_it_guess(date, timestamptz, text, text, boolean, numeric, numeric, numeric, text) to anon, authenticated, service_role;
grant execute on function public.af_call_it_board(date) to anon, authenticated, service_role;
