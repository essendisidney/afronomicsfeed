# Running Afronomics

How the site runs day to day with one person and a set of agents. For what the site is and where the code lives, see
`README.md`.

## What updates itself

Every job below is read from `.github/workflows/*.yml`, `vercel.json` and `supabase/migrations/`. Times are UTC, copied
from the cron lines; Nairobi is UTC+3 with no daylight saving. GitHub starts scheduled runs late, or drops them, when
it is busy, which is why the auction job runs often: a run with nothing new commits nothing.

A data commit to `main` triggers a Vercel deploy, so the site updates itself. Every job can also be run by hand from
the Actions tab (`workflow_dispatch`).

### Scheduled

| Job | Schedule (UTC) | What it does and writes | When it fails |
| --- | --- | --- | --- |
| **African auctions** (`african-auctions.yml`) | `17 4-18/2 * * 1-5` (every two hours, 04:17 to 18:17, weekdays); `17 5-17/4 * * 0,6` (05:17, 09:17, 13:17, 17:17, weekends) | Runs every bill, bond and rate reader (`scripts/*_tbills.py`, `*_bonds.py`, `kenya_rates.py`, `policy_rates.py`, `kenya_mpc.py`, `west_africa_rates.py`, `nigeria_savings_bond.py`, `eurobonds.py`, `cma_mmf.py`, `kenya_dcp.py`, `kenya_tenders.py`, Uganda with OCR), then `latency.py`, `data_health.py` and `telegram_post.py`. Commits `data/`. Then sends email rate alerts, tender alerts and bond-result alerts through the live site | Each reader is independent (`continue-on-error`), so one publisher down does not stop the rest. Read the failed step's log. Late or failed sources show on `/status` and the desk (`data/health.json`). Try the reader with **Reader dry run**; fix it against saved documents in `tests/readers/fixtures/` |
| **Kenya quick check** (`kenya-quick.yml`) | `*/20 12-16 * * 4` (every 20 minutes, 12:00 to 16:59, Thursdays) | `kenya_tbills.py`, `kenya_bonds.py`, `latency.py`; commits `data/kenya` and `data/latency.json`; sends rate and bond-result alerts | The next run, or the two-hourly auction job, catches the result. If CBK changed its notice, see African auctions |
| **Forecast ledger** (`forecast-ledger.yml`) | `7 6 * * *` and `37 15 * * *` (twice daily) | `scripts/forecast_ledger.py`: writes the next Kenya T-bill auction's ranges if due (only before bids close, Thursday 11:00 UTC), and grades any forecast whose CBK result is in. Commits `data/forecasts/`. The commit is the forecast's public time stamp | Run `python scripts/forecast_ledger.py --check` to see what it would write. Never edit the ledger by hand. A forecast missed before bids close cannot be written later: the script refuses it, and that week has no forecast |
| **Institutions registry** (`registry.yml`) | `41 5 3 * *` (05:41 on the 3rd of each month) | `sasra_list.py`, `sasra_annual.py`, `sasra_quarterly.py`, `cbk_directories.py`, `cbk_bsar.py`. Commits new editions to `data/registry/`. Most runs add nothing | The run fails if any reader refused its document (it did not add up). The other readers still commit. Read the document with **Probe** (use `pages` for long PDFs), fix the reader with fixture tests. Renames and mergers go in `data/registry/aliases.json` |
| **Remittance prices** (`remittances.yml`) | `23 6 1,15 * *` (06:23 on the 1st and 15th) | `remittance_prices.py`: World Bank Remittance Prices Worldwide; commits `data/` when a new quarter appears | Rerun by hand. If the World Bank changed its file, use **Reader dry run** with `remittance_prices` |
| **Morning note** (`morning-note.yml`) | `0 4 * * 1-5` (07:00 Nairobi, weekdays) | Snapshots `/api/edition/morning` (and its LinkedIn text) into `editions/morning/`; sends to subscribers through `/api/send/morning` | A snapshot failure means the live site did not answer: check Vercel, then rerun. Without `AF_CRON_SECRET` the send is skipped; without `RESEND_API_KEY` on Vercel nothing goes out |
| **Weekly edition snapshot** (`weekly-edition.yml`) | `0 4 * * 1` (Mondays) | Snapshots `/api/edition/weekly` into `editions/<week>/` and `editions/latest/`. The publishing agent posts `editions/latest/linkedin.txt` | Rerun by hand before the LinkedIn post goes out, or the post repeats last week |
| **Index release** (`index-release.yml`) | `30 4 * * 1` (Mondays) | Snapshots the weekly Sovereign Bill Index release into `editions/index/`; sends it to the press list (`/api/send/index`) and the owner's weekly email (`/api/send/desk`) | Rerun by hand. A send failure with a good snapshot means the mail endpoint or `AF_CRON_SECRET` |
| **Site QA** (`site-qa.yml`) | `10 2 * * *` daily; also on every pull request and push to `main` | Builds the site and runs `scripts/site-qa.mjs` over `tests/site/pages.json` at 390px and 1280px, light and dark. Uploads a report and failure screenshots. Commits nothing | Open the `site-qa-report` artifact. A failure on the daily run with no code change usually came with new data. See `docs/qa.md` |
| **Reader tests** (`tests.yml`) | On every pull request and push to `main` | `python -m pytest tests/readers tests/site`, offline | Run the same command locally; a reader test failing means a parser no longer matches its saved document |
| **Archive** (Vercel cron, `vercel.json`) | `15 4 * * *` | `/api/cron/archive`: writes FX reference rates and Wire headlines to Supabase (`fx_daily`, `wire_archive`) | Check the function log in Vercel. A missed day is not recoverable (the sources only give "latest") |
| **Push alerts** (Supabase `pg_cron`, migration `0011`) | `*/20 5-19 * * 1-5` | Calls the `af-push-check` edge function, which sends browser push alerts for new results | Check the edge function log in Supabase |

Data health has no job of its own: `scripts/data_health.py` runs inside African auctions and writes `data/health.json`,
which `/status` and the desk read.

### Manual tools (commit nothing to `main`)

| Tool | Start | What it does |
| --- | --- | --- |
| **Probe** (`probe.yml`) | By hand, with URLs and a pattern; options for links, full text, raw HTML, PDF `pages` and `layout` | Prints what a publisher's page or PDF says, from GitHub's network. Used to write or fix a reader, and for the live check after a release |
| **Reader dry run** (`reader-dry.yml`) | By hand, with a script name from `scripts/` and its arguments (default `--inspect`) | Runs one reader in inspect or dry mode on GitHub's network |
| **Save reader fixtures** (`fixtures.yml`) | Push a file `tests/readers/fixtures/<folder>.request` (one `name=url` per line) to any branch except `main`; or by hand | Downloads each file (20 MB limit) into `tests/readers/fixtures/<folder>/` and commits it to that branch, so a reader can be tested offline. Never runs on `main` |
| **Pilot smoke** (`pilot-smoke.yml`) | By hand | Walks the institutional pilot path on the live site using Resend's test inbox. Remove the test rows afterwards (`docs/qa.md`) |

## Release routine

Every change to the site's structure goes through these steps. The rebuild phases (`docs/rebuild/`) followed it.

1. **Plan.** Write a short plan (for the rebuild, `docs/rebuild/phase-N-plan.md`) and stop.
2. **Founder approval** of the plan before any code.
3. **Branch** `rebuild/phase-N` (or a named feature branch). Never work on `main`.
4. **Checks:** `npx tsc --noEmit`, `npx eslint`, `python -m pytest tests/site tests/readers`, `npm run build`,
   `node scripts/site-qa.mjs`.
5. **Screenshots** of every changed page at 390px and 1280px, light and dark.
6. **Pull request**, with the checks, screenshots and Vercel preview link.
7. **Squash-merge** only with the founder's approval (decision D-005).
8. **Live check** with the **Probe** workflow against the production URLs that changed.

## The archive agent

`/api/cron/archive` runs daily (`vercel.json`) and writes every FX reference rate and every Wire headline to Supabase
(`fx_daily`, `wire_archive`). Public APIs only give "latest"; the archive becomes history nobody else holds.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Needed for |
| --- | --- |
| `AF_CRON_SECRET` | shared secret: the mail/desk/payment database functions, GitHub Actions and the /desk key |
| `CRON_SECRET` | optional: restricts the archive job to Vercel's scheduler |
| `DOWNLOAD_SECRET` | signs download sessions and Watch pack links (falls back to `PAID_KEY_SECRET`, then `AF_CRON_SECRET`; at least 16 characters). Rotating it withdraws every Watch pack link |
| `PAYSTACK_SECRET_KEY` | turns on checkout: Pro, Team and the trial on /pricing, the two pack tiers on /pack |
| `PAYSTACK_PLAN_PRO`, `PAYSTACK_PLAN_TEAM`, `PAYSTACK_PLAN_PACK`, `PAYSTACK_PLAN_PACK_PLUS` | optional Paystack plan codes (PLN_…); with one set, that tier becomes a recurring monthly subscription at the plan's price |
| `PAYSTACK_CURRENCY` | `KES` (default) or `USD` (needs USD enabled on Paystack). Prices are in `lib/billing/ratecard.ts` |
| `PAYMENTS_NOTIFY_EMAIL` | where the "new payment" note goes (default the contact address) |
| `RESEND_API_KEY` | sends the Morning, receipts, payment notes and alerts |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public contact address (default desk@afronomicsfeed.com) |
| `AF_HIDE_DRAFTS` | set to `1` to hide casebook drafts on a preview deployment (production never shows them) |
| `AFRONOMICS_PAYWALL` | set to `on` only once accounts exist |

GitHub Actions secrets: `AF_CRON_SECRET` (same value as on Vercel), `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL`
(optional; otherwise read from the database).

Database migrations live in `supabase/migrations` (up to `0041`). New tables come in new numbered migrations; no
table is dropped (unused ones are listed in `docs/rebuild/unused-tables.md`). Set the Vercel variables in one go with
`scripts/setup-env.ps1`.

## Payments

Paystack webhook URL: `https://www.afronomicsfeed.com/api/paystack/webhook` (Settings → API Keys & Webhooks, live and
test). Verified charges land in `payments` and subscriptions in `paid_subscriptions` through `af_record_payment` /
`af_record_subscription` (secret-gated; no service-role key on Vercel). The return page verifies the reference with
Paystack and records it too, so nothing is lost if the webhook is down. Each charge emails the buyer a receipt and the
desk a note; /desk lists payments and totals. There are no user accounts yet: grant access by email from /desk.

## Watch packs

Issue and preview each subscribing SACCO's private link from `/desk/watch`. A link is signed for one SACCO and works
for 120 days (`LINK_DAYS` in `lib/watch-link.ts`).
To withdraw a SACCO's links early, add an entry to `data/watch/revoked.json` and commit; the next deploy applies it.

## Adding coverage

- **New reader:** save the publisher's documents with **Save reader fixtures**, write `scripts/<name>.py` with offline
  tests in `tests/readers/`, then add it as a step in the right workflow. It appends only new rows and keeps each
  row's source link and as-of date.
- **New indicator:** add one entry to `indicatorDefs` in `lib/data/indicators.ts` (World Bank code).
- **New publisher on the Wire:** add its RSS URL to `feeds` in `lib/data/wire.ts`.
- **New official source:** add it to `lib/data/official.ts`.
- **New case:** add `content/cases/<id>.md`; `scripts/case_check.py` and `lib/cases.ts` check it. It stays a draft
  until the founder signs it off.

## Weekly routine

1. Monday: the weekly edition and the index release go out on their own. Check the snapshots in `editions/` before
   the LinkedIn post runs.
2. Check `/status` and the desk for late or failed sources, and the registry run on the 3rd of the month.
3. Publish one analysis piece in `content/` (Markdown with sources in frontmatter).
4. Log any correction in `lib/corrections.ts`.
