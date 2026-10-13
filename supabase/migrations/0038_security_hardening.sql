-- Security review, 13 Oct 2026 (docs/security/security-review-2026-10-13.md). NOT APPLIED: apply after the app
-- change that calls the two-argument archive functions is deployed (lib/agents/archive.ts falls back to the old
-- functions until this runs, so the order "deploy, then apply" never breaks the daily archive).
--
-- 1. FX and headline archive writes need the cron secret (finding H-2). Until now af_archive_fx(jsonb) and
--    af_archive_wire(jsonb) were callable by anyone with the public (publishable) key. fx_daily keeps the first row
--    per (day, base, code) ("on conflict do nothing"), so a stranger could write tomorrow's USD/KES before the 04:15
--    archive and the Morning note, the Weekly and the paid committee pack would compute FX moves from it.
-- 2. Legacy anonymous entry points nothing calls any more lose anonymous EXECUTE: af_subscribe (v1, replaced by
--    af_subscribe_v2) and af_hit_v2 (replaced by af_hit_v3).
-- 3. af_job_submit only accepts an apply link that is http(s) or an email address (finding M-6).
--
-- Note: the secret comparison inside these functions (k.value = p_secret) is an ordinary string comparison, not a
-- constant-time one; SQL offers no constant-time compare. Over the network, through PostgREST, the timing signal is
-- far below the noise and the secret is 43 random characters, so this is accepted rather than worked around.

create or replace function public.af_archive_fx(p_rows jsonb, p_secret text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    raise exception 'forbidden';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 250 then
    raise exception 'invalid payload';
  end if;
  insert into public.fx_daily (day, base, code, rate, source)
  select (r->>'day')::date, 'USD', upper(r->>'code'), (r->>'rate')::numeric, left(coalesce(r->>'source', ''), 80)
  from jsonb_array_elements(p_rows) r
  where (r->>'code') ~ '^[A-Za-z]{3}$'
    and (r->>'rate')::numeric > 0
    and (r->>'day')::date between current_date - 3 and current_date + 1
  on conflict (day, base, code) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.af_archive_wire(p_rows jsonb, p_secret text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then
    raise exception 'forbidden';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 600 then
    raise exception 'invalid payload';
  end if;
  insert into public.wire_archive (url, title, publisher, published_at, summary, countries, desks)
  select
    left(r->>'url', 600),
    left(r->>'title', 400),
    left(r->>'publisher', 80),
    (r->>'published_at')::timestamptz,
    left(coalesce(r->>'summary', ''), 400),
    coalesce((select array_agg(left(x, 2)) from jsonb_array_elements_text(r->'countries') x), '{}'),
    coalesce((select array_agg(left(x, 20)) from jsonb_array_elements_text(r->'desks') x), '{}')
  from jsonb_array_elements(p_rows) r
  where (r->>'url') ~ '^https?://'
    and length(coalesce(r->>'title', '')) between 3 and 400
    and (r->>'published_at')::timestamptz between now() - interval '30 days' and now() + interval '1 day'
  on conflict (url) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.af_archive_fx(jsonb, text) from public;
revoke all on function public.af_archive_wire(jsonb, text) from public;
grant execute on function public.af_archive_fx(jsonb, text) to anon, authenticated, service_role;
grant execute on function public.af_archive_wire(jsonb, text) to anon, authenticated, service_role;

-- The old, ungated versions stay for the service role only (nothing in the app needs them once the above exists).
revoke execute on function public.af_archive_fx(jsonb) from public, anon, authenticated;
revoke execute on function public.af_archive_wire(jsonb) from public, anon, authenticated;

-- Unused legacy entry points.
revoke execute on function public.af_subscribe(text, text, text) from public, anon, authenticated;
revoke execute on function public.af_hit_v2(text, text, text, boolean) from public, anon, authenticated;

-- Job listings: the apply link is shown as a link on /jobs once paid, so only http(s) or an email address.
create or replace function public.af_job_submit(p_title text, p_institution text, p_location text, p_role_type text, p_closes date, p_apply_url text, p_description text, p_email text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_id bigint;
begin
  if p_title is null or length(p_title) < 4 or length(p_title) > 120 then raise exception 'title'; end if;
  if p_institution is null or length(p_institution) < 2 or length(p_institution) > 120 then raise exception 'institution'; end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'email'; end if;
  if length(coalesce(p_description, '')) > 4000 or length(coalesce(p_apply_url, '')) > 500 or length(coalesce(p_location, '')) > 80 or length(coalesce(p_role_type, '')) > 40 then raise exception 'length'; end if;
  if p_apply_url is not null and p_apply_url !~* '^(https?://[^\s]+|[^@\s/:]+@[^@\s]+\.[^@\s]+)$' then raise exception 'link'; end if;
  if (select count(*) from public.af_jobs where lower(email) = lower(p_email) and created_at > now() - interval '1 day') >= 5 then raise exception 'limit'; end if;
  insert into public.af_jobs (title, institution, location, role_type, closes, apply_url, description, email)
  values (p_title, p_institution, p_location, p_role_type, p_closes, p_apply_url, p_description, lower(p_email))
  returning id into v_id;
  return v_id;
end;
$$;
