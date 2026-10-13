-- NOT YET APPLIED. The desk's money funnel, per-pilot usage, new action counts and the one-question surveys.
--
-- 1. af_event accepts six more action names (still one anonymous daily count per action, page and country):
--      download_click     a CSV / JSON data link clicked (path = the page it was clicked on)
--      pricing_cta_click  a call to action on /pricing, or any element tagged data-track="pricing_cta_click"
--      pilot_form_start   first edit of the pilot request form (emitted by lib/track.ts trackPilotForm)
--      pilot_form_submit  the pilot request form sent successfully (same helper)
--      source_click       a reader opened a central bank's own notice from our tables
--      survey_answer      someone answered a one-question survey (the answer itself goes to survey_answers)
-- 2. survey_answers: anonymous answers to the one-question surveys (no email, no IP, no identifier; country from
--    the host header). Kept apart from `feedback` so the desk's "found what they came for" rate is not diluted.
-- 3. af_survey: validated insert, 30 a minute site-wide cap (same as af_feedback).
-- 4. af_desk_funnel: the desk's funnel (7 and 30 days), deals by stage, next follow-ups, per-key usage and
--    survey totals in one read-only call, gated by the 'cron' secret (the desk key) like every desk function.
--
-- Real numbers only: payments count status 'success' (Paystack test payments are stored as 'test' and excluded);
-- deal values are not summed here, so nothing estimated is mixed into the funnel.

create or replace function public.af_event(p_name text, p_path text, p_country text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_name not in ('newsletter_signup', 'alert_signup', 'push_alert_on', 'reader_report', 'reader_story', 'rate_check', 'share', 'enquiry',
                    'checkout_start', 'partner_click', 'bot_query',
                    'download_click', 'pricing_cta_click', 'pilot_form_start', 'pilot_form_submit', 'source_click', 'survey_answer') then return; end if;
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return; end if;
  insert into public.events_daily (day, name, path, country, count)
  values (current_date, p_name, p_path, case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end, 1)
  on conflict (day, name, path, country) do update set count = events_daily.count + 1;
end;
$function$;

create table if not exists public.survey_answers (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  question text not null check (question in ('pay_next', 'use_for')),
  answer text not null check (length(answer) between 1 and 40),
  note text check (length(note) <= 300),
  country text not null default ''
);
alter table public.survey_answers enable row level security;
create index if not exists survey_answers_created_idx on public.survey_answers (created_at desc);

create or replace function public.af_survey(p_path text, p_question text, p_answer text, p_note text, p_country text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_path is null or p_path !~ '^/[A-Za-z0-9/_.,-]{0,200}$' then return false; end if;
  if not (
    (p_question = 'pay_next' and p_answer in ('fx', 'eurobonds', 'inflation', 'other'))
    or (p_question = 'use_for' and p_answer in ('work', 'investing', 'business', 'study', 'personal', 'other'))
  ) then return false; end if;
  if (select count(*) from public.survey_answers where created_at > now() - interval '1 minute') > 30 then return false; end if;
  insert into public.survey_answers (path, question, answer, note, country)
  values (p_path, p_question, p_answer, nullif(left(trim(coalesce(p_note, '')), 300), ''),
          case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end);
  perform public.af_event('survey_answer', p_path, p_country);
  return true;
end;
$function$;

create or replace function public.af_desk_funnel(p_secret text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  with ok as (select exists (select 1 from public.af_secrets k where k.name = 'cron' and k.value = p_secret) as yes),
  pv as (
    select day, path, views, visitors from public.page_views
    where (select yes from ok) and day > current_date - 30
      and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%' and path not like '/desk%'
  ),
  ev as (select day, name, count from public.events_daily where (select yes from ok) and day > current_date - 30),
  w as (select unnest(array[7, 30]) as days)
  select case when not (select yes from ok) then null else jsonb_build_object(
    'windows', (select jsonb_agg(jsonb_build_object(
        'days', w.days,
        'people', (select coalesce(sum(visitors), 0) from pv where day > current_date - w.days),
        'views', (select coalesce(sum(views), 0) from pv where day > current_date - w.days),
        'inst_people', (select coalesce(sum(visitors), 0) from pv where day > current_date - w.days
          and path ~ '^/(data/frontier-local-debt|markets/bonds|pricing|licensing|data-api)(/|$)'),
        'inst_views', (select coalesce(sum(views), 0) from pv where day > current_date - w.days
          and path ~ '^/(data/frontier-local-debt|markets/bonds|pricing|licensing|data-api)(/|$)'),
        'pilot_requests', (select count(*) from public.leads where created_at > now() - make_interval(days => w.days)
          and (interest in ('licensing', 'pilot') or source ~ '^/(data/frontier-local-debt|data-api|pricing|licensing)')),
        'trial_keys', (select count(*) from public.data_keys where plan = 'trial' and created_at > now() - make_interval(days => w.days)),
        'keys_active', (select count(distinct u.key_id) from public.data_key_usage u join public.data_keys k on k.id = u.key_id
          where u.day > current_date - w.days),
        'trial_keys_active', (select count(distinct u.key_id) from public.data_key_usage u join public.data_keys k on k.id = u.key_id
          where k.plan = 'trial' and u.day > current_date - w.days),
        'checkouts', (select coalesce(sum(count), 0) from ev where name = 'checkout_start' and day > current_date - w.days),
        'payments', (select count(*) from public.payments where status = 'success' and paid_at > now() - make_interval(days => w.days)),
        'paid', (select coalesce(jsonb_agg(jsonb_build_object('currency', currency, 'amount', a)), '[]'::jsonb)
          from (select currency, sum(amount) a from public.payments where status = 'success' and paid_at > now() - make_interval(days => w.days) group by currency) y),
        'actions', (select coalesce(jsonb_object_agg(name, c), '{}'::jsonb)
          from (select name, sum(count) c from ev where day > current_date - w.days group by name) a)
      ) order by w.days) from w),
    'deals_by_stage', (select coalesce(jsonb_object_agg(stage, n), '{}'::jsonb)
      from (select stage, count(*) n from public.deals where (select yes from ok) group by stage) d),
    'follow_ups', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'organisation', organisation, 'stage', stage, 'next_step', next_step, 'next_date', next_date)
        order by next_date, id), '[]'::jsonb)
      from (select * from public.deals where (select yes from ok) and stage not in ('won', 'lost') and next_date is not null
            order by next_date, id limit 20) f),
    'no_follow_up', (select count(*) from public.deals where (select yes from ok) and stage not in ('won', 'lost') and next_date is null),
    'keys', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', k.id, 'label', k.label, 'plan', k.plan, 'created_at', k.created_at, 'revoked_at', k.revoked_at, 'last_used_at', k.last_used_at,
        'calls_7d', (select coalesce(sum(u.calls), 0) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 7),
        'calls_30d', (select coalesce(sum(u.calls), 0) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 30),
        'last_day', (select max(u.day) from public.data_key_usage u where u.key_id = k.id),
        'paths_30d', (select coalesce(jsonb_agg(distinct u.path), '[]'::jsonb) from public.data_key_usage u where u.key_id = k.id and u.day > current_date - 30)
      ) order by k.created_at desc), '[]'::jsonb)
      from public.data_keys k where (select yes from ok)),
    'surveys', (select coalesce(jsonb_agg(jsonb_build_object('question', question, 'answer', answer, 'n', n) order by question, n desc), '[]'::jsonb)
      from (select question, answer, count(*) n from public.survey_answers where (select yes from ok) and created_at > now() - interval '30 days' group by 1, 2) s),
    'survey_notes', (select coalesce(jsonb_agg(jsonb_build_object('when', created_at, 'question', question, 'answer', answer, 'path', path, 'note', note) order by created_at desc), '[]'::jsonb)
      from (select * from public.survey_answers where (select yes from ok) and note is not null order by created_at desc limit 10) n)
  ) end;
$function$;

revoke all on function public.af_survey(text, text, text, text, text) from public;
revoke all on function public.af_desk_funnel(text) from public;
grant execute on function public.af_survey(text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.af_desk_funnel(text) to anon, authenticated, service_role;
