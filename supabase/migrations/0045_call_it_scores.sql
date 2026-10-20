-- "Call it" score emails (app/api/send/call-it): once the CBK publishes a Treasury bill result, every reader who called
-- that auction gets one email with their miss, their place and the next round. This adds what the sender needs:
--
-- 1. call_it_guesses.scored_at: when that guess's score email went. Claimed before the send (null -> now), handed
--    back if the send fails, so overlapping runs never email anyone twice.
-- 2. af_call_it_entries(p_value_date, p_secret): every guess for one auction, with its address, for the server only
--    (the shared 'cron' secret, af_secrets, migration 0012). The public board (af_call_it_board) still never returns
--    an address.
-- 3. af_call_it_mark_scored(p_id, p_sent, p_secret): the claim and the hand-back.
--
-- Additive: one nullable column, two new functions. Nothing existing changes and no row is altered. Until it is
-- applied the sender answers "needs migration 0045" and sends nothing.

alter table public.call_it_guesses add column if not exists scored_at timestamptz;

create or replace function public.af_call_it_entries(p_value_date date, p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return null;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', g.id, 'email', g.email, 'handle', g.handle, 'show', g.show_handle,
      'g91', g.g91, 'g182', g.g182, 'g364', g.g364, 'scored_at', g.scored_at
    ) order by g.created_at)
    from public.call_it_guesses g where g.value_date = p_value_date
  ), '[]'::jsonb);
end;
$$;

-- p_sent true claims the guess (only if not yet claimed) and returns whether this call claimed it; false hands it back.
create or replace function public.af_call_it_mark_scored(p_id uuid, p_sent boolean, p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    return false;
  end if;
  if p_sent then
    update public.call_it_guesses set scored_at = now() where id = p_id and scored_at is null;
  else
    update public.call_it_guesses set scored_at = null where id = p_id;
  end if;
  get diagnostics n = row_count;
  return n = 1;
end;
$$;

revoke all on function public.af_call_it_entries(date, text) from public;
revoke all on function public.af_call_it_mark_scored(uuid, boolean, text) from public;
grant execute on function public.af_call_it_entries(date, text) to anon, authenticated, service_role;
grant execute on function public.af_call_it_mark_scored(uuid, boolean, text) to anon, authenticated, service_role;
