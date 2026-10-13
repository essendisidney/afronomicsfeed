-- NOT APPLIED. The founder's morning desk (docs/desk-redesign.md): the "Today" strip, the inbox with "mark handled",
-- pilot days-used for the D-004 gate, and content traffic by campaign.
--
-- Adds:
--   * desk_handled: which inbox items the founder has dealt with (kind + row id). Nothing else is changed or deleted.
--   * af_desk_today(p_secret): real money today (since midnight Nairobi) / 7 d / 30 d / all time (status 'success' only, so 'test' and every
--     other status are never counted), days used per data key (the "pilot used on 5+ days" test), views by utm
--     campaign (7 and 30 days) and views of /brief/ stories. No emails.
--   * af_desk_inbox(p_secret, p_days): leads (enquiries, pilot requests, invoice requests), survey notes and
--     page feedback from the last p_days (default 30, at most 90), newest first, with handled_at. Lead emails are
--     returned because the desk already shows them (af_desk 'leads'); survey and feedback rows hold none.
--   * af_desk_handle(p_secret, p_kind, p_id, p_undo): mark an inbox item handled, or undo it.
--
-- Safe to apply on the live database at any time: one new table, three new functions; no existing object changes.
-- Before it is applied, /desk still works: money comes from af_payments / af_desk_money, the inbox is built from
-- af_desk and af_desk_funnel without "mark handled", and the gate shows "needs migration 0040" for days used.
--
-- Same model as 0028 / 0033 / 0034: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

create table if not exists public.desk_handled (
  kind text not null check (kind in ('lead', 'survey', 'feedback')),
  ref_id bigint not null,
  handled_at timestamptz not null default now(),
  primary key (kind, ref_id)
);
alter table public.desk_handled enable row level security;

create or replace function public.af_desk_today(p_secret text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  paid as (
    select currency, amount, paid_at from public.payments
    where (select yes from ok) and status = 'success' and paid_at is not null
  ),
  campaigns as (
    select referrer, day, views, visitors, path from public.page_views
    where (select yes from ok) and day > current_date - 30 and referrer like 'utm:%'
  )
  select case when not (select yes from ok) then null else jsonb_build_object(
    'money', (select coalesce(jsonb_agg(jsonb_build_object(
        'currency', currency,
        'today', today, 'd7', d7, 'd30', d30, 'all_time', all_time,
        'n_today', n_today, 'n_all', n_all) order by currency), '[]'::jsonb)
      from (select currency,
              coalesce(sum(amount) filter (where paid_at >= (date_trunc('day', now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi')), 0) today,
              coalesce(sum(amount) filter (where paid_at > now() - interval '7 days'), 0) d7,
              coalesce(sum(amount) filter (where paid_at > now() - interval '30 days'), 0) d30,
              coalesce(sum(amount), 0) all_time,
              count(*) filter (where paid_at >= (date_trunc('day', now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi')) n_today,
              count(*) n_all
            from paid group by currency) m),
    'key_days', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', k.id, 'plan', k.plan, 'expires_at', k.expires_at, 'revoked_at', k.revoked_at,
        'days_used', (select count(distinct u.day) from public.data_key_usage u where u.key_id = k.id),
        'days_used_7d', (select count(distinct u.day) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 7)
      ) order by k.id), '[]'::jsonb)
      from public.data_keys k where (select yes from ok)),
    'campaigns', (select coalesce(jsonb_agg(jsonb_build_object(
        'campaign', substr(referrer, 5), 'views_7d', v7, 'people_7d', p7, 'views_30d', v30, 'top_path', top_path) order by v30 desc), '[]'::jsonb)
      from (select referrer,
              coalesce(sum(views) filter (where day > current_date - 7), 0) v7,
              coalesce(sum(visitors) filter (where day > current_date - 7), 0) p7,
              coalesce(sum(views), 0) v30,
              (select c2.path from campaigns c2 where c2.referrer = c.referrer group by c2.path order by sum(c2.views) desc limit 1) top_path
            from campaigns c group by referrer order by 4 desc limit 30) x),
    'briefs', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'views_7d', v7, 'views_30d', v30, 'linkedin_30d', li) order by v30 desc), '[]'::jsonb)
      from (select path,
              coalesce(sum(views) filter (where day > current_date - 7), 0) v7,
              coalesce(sum(views), 0) v30,
              coalesce(sum(views) filter (where referrer like 'utm:linkedin%' or referrer in ('linkedin.com', 'lnkd.in')), 0) li
            from public.page_views
            where (select yes from ok) and day > current_date - 30 and path like '/brief/%'
            group by path order by 3 desc limit 30) b)
  ) end;
$function$;

create or replace function public.af_desk_inbox(p_secret text, p_days int default 30)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  since as (select now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 90)) as t),
  items as (
    select 'lead'::text kind, l.id, l.created_at, l.interest, l.source, l.organisation, l.name, l.email,
           left(l.message, 600) text, null::text path
    from public.leads l where l.created_at > (select t from since)
    union all
    select 'survey', s.id, s.created_at, s.question || ':' || s.answer, null, null, null, null, s.note, s.path
    from public.survey_answers s where s.note is not null and s.created_at > (select t from since)
    union all
    select 'feedback', f.id, f.created_at, case when f.found then 'found' else 'not_found' end, f.role, null, null, null,
           left(f.looking_for, 600), f.path
    from public.feedback f where (f.looking_for is not null or f.found = false) and f.created_at > (select t from since)
  )
  select case when not (select yes from ok) then null else coalesce((
    select jsonb_agg(jsonb_build_object(
      'kind', i.kind, 'id', i.id, 'at', i.created_at, 'interest', i.interest, 'source', i.source, 'organisation', i.organisation,
      'name', i.name, 'email', i.email, 'text', i.text, 'path', i.path, 'handled_at', h.handled_at
    ) order by i.created_at desc)
    from (select * from items order by created_at desc limit 150) i
    left join public.desk_handled h on h.kind = i.kind and h.ref_id = i.id
  ), '[]'::jsonb) end;
$function$;

create or replace function public.af_desk_handle(p_secret text, p_kind text, p_id bigint, p_undo boolean default false)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) then return null; end if;
  if p_kind not in ('lead', 'survey', 'feedback') or p_id is null then return null; end if;
  if coalesce(p_undo, false) then
    delete from public.desk_handled where kind = p_kind and ref_id = p_id;
  else
    insert into public.desk_handled (kind, ref_id) values (p_kind, p_id) on conflict (kind, ref_id) do nothing;
  end if;
  return true;
end;
$function$;

revoke all on function public.af_desk_today(text) from public;
revoke all on function public.af_desk_inbox(text, int) from public;
revoke all on function public.af_desk_handle(text, text, bigint, boolean) from public;
grant execute on function public.af_desk_today(text) to anon, authenticated, service_role;
grant execute on function public.af_desk_inbox(text, int) to anon, authenticated, service_role;
grant execute on function public.af_desk_handle(text, text, bigint, boolean) to anon, authenticated, service_role;
