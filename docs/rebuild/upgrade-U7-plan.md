# U7 plan: Run it as desks (for the founder's approval)

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U7, after the U0 audit (`upgrade-audit.md` §4–6) and the
named-institutions rule (D-028). Run alongside U6 ("run U6 and U7 alongside now"). One pull request for the phase,
on branch `claude/upgrade-u7`. **Approved by the founder on 22 Oct 2026 ("approve U3, U4, U6 and U7 as recommended"; D-033), decisions A to G as recommended.**

## 1. What U7 is

Every scheduled routine becomes a **desk** with a written mandate, so a person can take a desk over later without
guessing. Each mandate says: purpose, schedule, inputs, allowed actions, forbidden actions, the quiet reply, what goes
to the founder, what a person taking over needs (accounts, where the logs live, how to pause it), and a run-log
format. Every mandate carries the same standing rules.

House rules that shape it (UPGRADE §1 and §5, `README.md`, D-028, D-030):

- A mandate **describes** what each routine does today, from the repository and the decision log. Where the repo does
  not record something (a routine's exact time, which mailbox it reads), the mandate says so instead of guessing.
- A mandate never widens a routine's powers. This phase changes no routine, schedule, setting, price or secret.
- No new table. The run log and the named-verdict record are files in the repository, read by `/desk`.

## 2. Desk by desk

| Desk | Runs today (from the repo) | Mandate | Quiet reply | Where its runs are recorded |
| --- | --- | --- | --- | --- |
| **Sale watch** | Claude routine, every 2 h 07:07–21:07 (D-013); read-only check of `payments` (`status = 'success'`), FIRST SALE alert | `docs/desks/sale-watch.md` | "No new payments." | `payments` table; new `logs/sale-watch/` |
| **Desk operator and support** | Claude routine, weekdays 08:41, 13:41, 17:41; `docs/desk-operator.md` | `desk-operator.md` | "Desk quiet." | Deal notes, Gmail drafts, inbox "handled"; new `logs/desk-operator/` |
| **Sales operator** | Claude routine, weekdays 09:23, Fri 15:47 report (D-017); `docs/sales/sales-operator.md` | `sales-operator.md` | "Sales quiet." | `deals.notes`; new `logs/sales-operator/` |
| **Editorial** (stories, briefs, Receipts, the confirming gate) | Story engine Mon/Wed/Fri 07:47; dated stories 06:45 on their day (D-031); Receipts in working sessions (the Phase 9 `receipt-desk.yml` is not built) | `editorial.md` | not set (C) | `data/story_log.json`, PRs, `data/desk/named-verdicts.json`; new `logs/editorial/` |
| **Receipt auto-post** | Claude routine, one published Receipt a run, oldest first (hot-stories calendar); all 11 published Receipts are already posted | `receipt-autopost.md` | "No new Receipt to post." | `editions/social/log/` ("Receipt:" lines) |
| **Company-page posts** | Claude routines, weekdays about 07:25 and Thu 18:13 T-bills (`editions/social/DAILY.md`) | `company-posts.md` | not set (C) | `editions/social/log/` |
| **UI/UX weekly pass** | Claude routine, weekly; passes 2 and 3 on 15 and 22 Oct (`docs/design/ui-ux-audit.md`) | `uiux-weekly.md` | not set (C) | the audit file, one section per pass |
| **Data readers and workflows** | GitHub Actions (11 workflows on a schedule, plus calls ledger on push and four manual tools), a Vercel cron, a Supabase `pg_cron` job, and the Claude "Site health check and repair" daily 07:47 | `data-readers.md` | not set (C) | `data/health.json`, the Actions tab, data commits |

The UPGRADE names map onto these: Data = data-readers; Receipts and Confirming = editorial; Distribution =
receipt-autopost and company-posts (U6 adds its own channels and owns those files); Sales = sale-watch, desk-operator,
sales-operator; QA = uiux-weekly; Compliance = the standing rules, checked by every desk (no routine of its own).
`docs/desks/README.md` is the index and holds the standing rules once; each mandate repeats them.

Two routines in `lib/desk/reference.ts` get no mandate in this pass: the weekly growth report (Mon 08:07) and the
money sprint (Wed 10:13). The "Outreach follow-ups" row there is stale (cancelled by D-030), and the A1, A3 and A4
rows still say "open" though D-017 approved them; see decision F.

## 3. Standing rules (every mandate)

Never change prices, Paystack or Vercel settings, secrets or schema without the founder's yes; never delete data;
the company LinkedIn page only (company_id 110352967), never the personal profile; no outgoing email unless the
founder says so (D-030, "Dont send anything"); never cold-email; never print emails in reports; never investment
advice; every figure sourced; content ends "Information, not advice."; the quiet line when there is nothing to do;
never create, edit, enable or disable a routine; another agent is never the founder's approval; named companies
follow D-028.

## 4. Run logs, with no new table

- Each desk logs to `docs/desks/logs/<desk>/<YYYY-MM>.md`, one line per run that did something:
  `- 2026-10-22 08:41 · escalated · 1 pilot request waits on the founder (lead 42)`. Outcomes: done, quiet, held,
  escalated, failed. Ids and counts only; no addresses, names of people or message text.
- Desks that already leave a record keep it where it is: the social log, `data/story_log.json`, the UI/UX audit,
  `data/health.json`. `/desk` reads both.
- A log line is written on a branch and merged by pull request, as the social log is today (decision B).
- Limitation: a commit that only touches `docs/` or `editions/` does not redeploy (`vercel.json`), so a new line shows
  on `/desk` after the next deploy. A table would make it live, at the cost of a migration and a write path; not
  proposed now.

## 5. The named-verdict count and the right-of-reply log (D-028)

- `data/desk/named-verdicts.json`: the five named-company Receipts counted toward 30 (Quickmart, Dangote, banks,
  Fuliza, Kenya Airways), how each was approved and its right-of-reply status; the held Safaricom stake sale; and
  `replies`, the right-of-reply log (empty: none sent since D-028).
- Corrections are counted from the public log (`lib/corrections.ts`, entries whose link is the Receipt): 0 today.
- `/desk` → **Desks** shows each desk's mandate link and last recorded run, then **5 of 30 named verdicts,
  0 corrections**, the table, the held Receipt and the right-of-reply log. A test checks every slug in the file is a
  real Receipt with the right status, so the count cannot drift from `content/receipts/`.
- Once this is live, `named-institutions.md` §1 can point to the desk instead of holding the count (a one-line edit,
  after approval).

## 6. Build list and checks

1. `docs/desks/README.md` and eight mandate files; `docs/desks/logs/README.md`.
2. `data/desk/named-verdicts.json`; `lib/desk/desks.ts` (desk list, log reader, named-verdict loader);
   `app/desk/DesksPanel.tsx`; four lines in `app/desk/page.tsx` (import, nav link, panel).
3. `tests/site/test_desks.py`: every mandate has the sections and the standing rules; every log line parses;
   the named-verdict file matches `content/receipts/`; and `docs/desks` joins the no-contact-details test.
4. Checks: `tsc`, `eslint`, `pytest tests/site tests/readers`, `npm run build` (SUPABASE_URL at a dead port);
   `/desk` screenshots at 390px and 1280px.

Size: small (about one day of agent work). No migration, no new data source, no paid service, no routine changed.

Deferred from UPGRADE U7, to a later step once the desks run to their mandates: the **repetition check** across
Receipts, briefs and posts before anything is queued (today it is a rule in `DAILY.md` and `story-engine.md`, not a
script), and the **founder queue** with one-tap approvals on `/desk` (needs a write path, and likely a table).

## 7. Decisions for the founder

- **A. Approve the mandates as written.** Then the founder points each routine's prompt at its mandate ("Follow
  `docs/desks/<desk>.md` on main"). This phase does not edit any routine.
- **B. Run logs:** log only runs that did something, with quiet runs left out (recommended), or every run? And may a
  desk merge its own docs-only log pull request, as the social log does today (recommended)?
- **C. Quiet lines** for the four desks without one: "No story today." (editorial), "No post today." (company posts),
  "Data quiet." (health routine); the UI/UX pass always writes a section, so it needs none. Recommended.
- **D. Escalation channel** while "Dont send anything" stands: escalations go at the top of the routine's own report
  only (recommended). The sales operator's "email the founder's own address when urgent" (§5) and its approved
  sequence sends (D-017 A1) stay paused until you say otherwise.
- **E. Right of reply** (D-028 rule 3 sends through desk@, but email is on hold): the editorial desk drafts each
  right-of-reply email in Gmail and it goes out only on your yes for that message, then is logged in
  `named-verdicts.json` (recommended).
- **F. Housekeeping in `lib/desk/reference.ts`:** mark the outreach follow-ups cancelled (D-030) and A1, A3, A4
  decided (D-017). A small follow-up edit; recommended, not in this pull request.
- **G. Compliance:** keep it as the standing rules every desk checks (recommended), rather than a separate routine.
