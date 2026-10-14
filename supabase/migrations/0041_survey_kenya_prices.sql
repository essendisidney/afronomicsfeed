-- Applied 14 Oct 2026.
-- 0041: a shilling-priced "Which would you pay for?" question on the Kenyan reader tools (docs/strategy/africa-demand-check.md).
-- Adds question 'pay_ke' to survey_answers and af_survey. Existing questions and answers are unchanged. Apply before
-- the deploy that ships components/ui/MicroSurvey.tsx with 'pay_ke'; until then those answers are dropped (af_survey
-- returns false), nothing breaks.
--
-- Answers (prices are what we ask about, not offers):
--   sms_50        auction result alerts by SMS, KES 50 a month
--   whatsapp_300  rate and auction alerts on WhatsApp, KES 300 a month
--   pro_1500      Pro (the Morning, every brief, tools), KES 1,500 a month
--   free_only     nothing: would use it only free
--   other         something else (with an optional note)

alter table public.survey_answers drop constraint if exists survey_answers_question_check;
alter table public.survey_answers add constraint survey_answers_question_check check (question in ('pay_next', 'use_for', 'pay_ke'));

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
    or (p_question = 'pay_ke' and p_answer in ('sms_50', 'whatsapp_300', 'pro_1500', 'free_only', 'other'))
  ) then return false; end if;
  if (select count(*) from public.survey_answers where created_at > now() - interval '1 minute') > 30 then return false; end if;
  insert into public.survey_answers (path, question, answer, note, country)
  values (p_path, p_question, p_answer, nullif(left(trim(coalesce(p_note, '')), 300), ''),
          case when coalesce(p_country, '') ~ '^[A-Z]{2}$' then p_country else '' end);
  perform public.af_event('survey_answer', p_path, p_country);
  return true;
end;
$function$;

revoke all on function public.af_survey(text, text, text, text, text) from public;
grant execute on function public.af_survey(text, text, text, text, text) to anon, authenticated, service_role;
