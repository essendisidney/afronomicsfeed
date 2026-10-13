# Desk operator: daily checklist

This is for the automated desk operator, a scheduled Claude routine that runs once each working day (suggested
07:30 Nairobi). It reads Supabase (project `ugjpcybhqwvzidcbqpik`), Gmail and the desk (`/desk`), writes down what
it finds, and passes anything that needs a decision to the founder. Everything it writes is a draft until the
founder approves it, unless this page says otherwise.

The rule behind every step: **collected money is a payment with status `success`. Everything else is not revenue.**
A lead is not a customer, a pilot is not a sale, a signed deal is "contracted" (not collected), and the model in
`data/strategy/model.json` is an assumption.

## 0. Before you start

- Supabase: use the read-only SQL below. Do not run DDL (`create`, `alter`, `drop`), and do not `update` or
  `delete` rows yourself. The only writes allowed are the desk functions named in steps 4 and 5.
- Never read `af_secrets` into your output (no `select * from af_secrets`), and never print or paste a secret, a full API key after it has been handed over,
  or a Paystack value. Where a desk function needs the desk key, look it up *inside* the call (step 5) so the
  value never appears in your output.
- Do not paste personal data (emails, names, phone numbers, message text) into logs, commit messages, Slack or
  tickets. Use the organisation name and the lead or deal id.
- If migration `0034_desk_funnel_and_surveys.sql` is not applied yet, the click counts and surveys below come
  back empty; say "not yet counted", not "zero".

## 1. Read the numbers (SQL, read-only)

```sql
-- Funnel, last 7 and 30 days (same as the desk's "From visitor to payment" panel).
with w as (select unnest(array[7, 30]) d)
select d as days,
  (select coalesce(sum(visitors), 0) from page_views where day > current_date - d
     and path not like '/api/%' and path not like '/download/%' and path not like '/embed/%' and path not like '/desk%') as visitors,
  (select coalesce(sum(visitors), 0) from page_views where day > current_date - d
     and path ~ '^/(data/frontier-local-debt|markets/bonds|pricing|licensing|data-api)(/|$)') as institutional_visitors,
  (select count(*) from leads where created_at > now() - make_interval(days => d)
     and (interest in ('licensing', 'pilot') or source ~ '^/(data/frontier-local-debt|data-api|pricing|licensing)')) as pilot_requests,
  (select count(*) from data_keys where plan = 'trial' and created_at > now() - make_interval(days => d)) as trial_keys,
  (select count(distinct u.key_id) from data_key_usage u join data_keys k on k.id = u.key_id
     where k.plan = 'trial' and u.day > current_date - d) as trial_keys_active,
  (select coalesce(sum(count), 0) from events_daily where name = 'checkout_start' and day > current_date - d) as checkouts,
  (select count(*) from payments where status = 'success' and paid_at > now() - make_interval(days => d)) as payments
from w;

-- New enquiries since the last run (organisation and interest only in your notes; no emails).
select id, created_at, organisation, interest, source from leads where created_at > now() - interval '1 day' order by created_at;

-- Pilots: usage per key in the last 7 days, and the pilot day.
select k.id, k.label, k.plan, k.created_at::date, current_date - k.created_at::date + 1 as pilot_day,
  coalesce(sum(u.calls) filter (where u.day > current_date - 7), 0) as calls_7d,
  max(u.day) as last_call_day, array_agg(distinct u.path) filter (where u.day > current_date - 30) as paths_30d
from data_keys k left join data_key_usage u on u.key_id = k.id
where k.revoked_at is null group by k.id order by k.created_at desc;

-- Deals due or overdue for a follow-up.
select id, organisation, stage, next_step, next_date from deals
where stage not in ('won', 'lost') and next_date <= current_date + 1 order by next_date;

-- Real payments since the last run (tests excluded).
select reference, plan, amount, currency, paid_at, access_sent_at from payments
where status = 'success' and paid_at > now() - interval '1 day';

-- Survey answers, last 7 days (after migration 0034).
select question, answer, count(*) from survey_answers where created_at > now() - interval '7 days' group by 1, 2 order by 1, 3 desc;
```

Then open `/desk` and check the command centre, the funnel panel and "Is the data fresh?" match what you read.

## 2. Read Gmail

Search the inbox for the last day: `newer_than:1d -category:promotions`. Sort each thread into:

- **Pilot or licence request** (asks for a key, a trial, data access, pricing, an invoice): step 5.
- **Reply on an open deal** (from an organisation in `deals`): step 4.
- **Payment or invoice question**: to the founder; do not answer about prices or refunds.
- **Data correction or complaint**: to the founder with the page and figure; a correction is logged on the desk.
- **Press / partner / other**: summarise in one line.

Draft replies in the founder's voice as Gmail drafts. Do not send.

## 3. Thresholds that need the founder (put these at the top of the report)

- Any real payment (`status = 'success'`), and any payment with `access_sent_at` empty for more than 2 hours.
- A pilot request from an institution (fund, bank, DFI, pension, insurer, research house) not answered within one
  business day.
- A trial key in the last week of its 30-day pilot (pilot day 23 or later) with calls in the last 7 days: the time
  to ask for payment. Also a trial key with **no** calls 7 days after it was issued: the time to check in.
- A deal follow-up date that is today or past.
- Checkouts started but no payment within 24 hours (2 or more in a day).
- Visitors or institutional visitors down more than 50% week on week, or any data pipeline red on the desk.
- Anything legal, a data-protection request (see, correct or delete data), or a complaint.
- Three or more survey answers asking for the same thing in a week (for example FX or Eurobonds): a product signal.

## 4. Log replies and deals

Use the desk form "Deals" (`/desk`, Save deal) or the database function `af_deal_save`. With SQL, nest the desk key
lookup so it is never printed:

```sql
-- New deal (p_id null). Stages: prospect, contacted, qualified, pilot, proposal, won, lost.
select af_deal_save((select value from af_secrets where name = 'cron'), null, 'Organisation name', 'asset_manager',
  'frontier_debt', 'contacted', null, 'pilot form', 'Reply sent; offer a call', current_date + 3, 'Lead id 42', null);

-- Update deal 7: only the fields you pass change (nulls are kept as they are).
select af_deal_save((select value from af_secrets where name = 'cron'), 7, null, null, null, 'pilot', null, null,
  'Ask for feedback on the Kenya feed', current_date + 7, null, null);
```

- Every open deal needs a `next_step` and a `next_date`.
- `won` needs `signed_at`, the date a signed agreement exists. Never mark `won` on a verbal yes or an invoice sent.
- `value_usd_month` is an estimate; leave it empty unless the founder or the customer named a figure.
- Notes hold the lead id and what happened, not email text.

## 5. Issue a trial key when someone asks

The existing mechanism is the desk's "API keys for licensed customers" form, or `af_api_key_create`.

1. Check the request is from an organisation (work email domain or a named firm) and that it is a pilot, not a
   free-API question (the open API needs no key: point them to `/developers`).
2. Issue the key with plan `trial` and the label `Organisation — pilot`:

   ```sql
   select af_api_key_create((select value from af_secrets where name = 'cron'), 'Organisation — pilot', 'trial');
   ```

   The key is returned once; only its hash is stored. Put it straight into the Gmail draft reply with the
   `/developers` link and the header (`Authorization: Bearer <key>`), and nowhere else (not in notes, logs or the report).
3. Add or update the deal: stage `pilot`, `next_step` "Check usage", `next_date` today + 7.
4. Leave the draft for the founder to send, until the founder says trial keys may be sent directly.

To end a pilot that went quiet, propose a revoke to the founder; do not revoke yourself.

## 6. The report

One message to the founder, in this order: decisions needed (step 3), money collected (real payments only),
funnel 7/30 days, pilots and who to ask for payment, deals due, inbox drafts waiting, survey signals, data health.
Label each figure as collected, contracted, pipeline (estimate) or model (assumption). Never add them together.

## Never

- Change prices, plans, the rate card, Paystack settings or keys, checkout code, or environment variables.
- Read, print, rotate or store a secret. The only use of `af_secrets` allowed is the nested lookup inside the
  desk function calls in steps 4 and 5, whose result is never shown.
- Send email, post on social media, or deploy, unless the founder has approved that exact message.
- Report a lead, pilot or signed deal as a customer paying, or a forecast or pipeline estimate as revenue.
- Delete or edit rows directly, apply migrations, or change data in production other than through the desk
  functions in steps 4 and 5.
- Put emails, names or message text in logs, commits, issues or chat outside the founder's report.
