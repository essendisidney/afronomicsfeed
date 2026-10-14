# Phase 6 plan: Clean up

Written 14 Oct 2026 for `docs/rebuild/BRIEF.md` (section 8, item 6). **Status: approved 14 Oct 2026 ("remove anything not being used").** Branch `rebuild/phase-6`; one PR; merge only with your approval.

## What it is

The last rebuild phase. It adds no new pages: it removes what the brief parked, brings the written guides up to date,
and checks the whole rebuild against "Done means" (brief, section 9). After it, the site is the new structure only,
and the docs describe the site as it is.

## 1. Remove parked pages from the build (redirects stay)

The 15 parked routes already redirect permanently (`next.config.ts`, `parked`), so no visitor reaches their pages
today. Their code is still built and shipped. This phase deletes the page files; git keeps the history.

| Route | Files | Redirects to (unchanged) |
| --- | --- | --- |
| `/tenders` | `page.tsx`, `pay/page.tsx` | `/for-institutions` |
| `/jobs` | `page.tsx`, `post/page.tsx` | `/for-institutions` |
| `/send-money` | `page.tsx`, `[country]/page.tsx` | `/rates/remittances` |
| `/radio` | `page.tsx` | `/morning` |
| `/rent-check`, `/pay-check` | one page each | `/numbers` |
| `/diaspora` | `page.tsx` | `/rates/remittances` |
| `/trade`, `/technology`, `/climate`, `/capital`, `/economy` | one page each | `/numbers` |
| `/ask` | `page.tsx` | `/search` |
| `/signals` | `page.tsx` | `/` |

**`/chama` is not removed in this phase.** You decided on 14 Oct to keep it live until the end of October 2026
(LinkedIn launch, survey). It still appears in two link lists in `lib/site.ts`. I'll set a reminder for 1 November to
park it the same way: redirect to `/learn`, then remove the page in a small follow-up PR, with your go-ahead.

**What goes with the pages.** Components that only the parked pages import are deleted too. From a first look:
- `AskBox`
- `JobPostForm`
- `TenderAlertForm`
- `SendMoneyTable`
- `FairCheckPage`

Before deleting each file, I check with a search that nothing else imports it, and the build confirms it.

**What stays:**
- every data file and collector script;
- every data loader in `lib/data/`. The brief says sector pages come back later as Coverage pages, so `projects`,
  `signals`, `tenders` and `wire` stay even where nothing reads them today;
- `lib/tenders-core.ts`, `lib/editions/radio.ts` and `lib/ask.ts`, which other code still uses.

**API routes behind parked pages.** These are the endpoints the parked pages' forms call:
- `/api/ask`
- `/api/jobs`
- `/api/tender-alerts` (with `confirm` and `unsubscribe`)

Each of the three is checked against the database before anything changes. I count rows written in the last 90 days
and existing subscribers, without printing anyone's details.
- **Recommended:** keep `/api/tender-alerts/unsubscribe` working for as long as anyone is subscribed, so nobody loses
  the way out of an email they signed up for. The sign-up and confirm endpoints stop accepting new sign-ups and answer
  with a short "this service is paused" message.
- `/api/ask` and `/api/jobs` are removed if nothing has used them in 90 days.

These figures go in the PR.

## 2. Unused tables

`docs/rebuild/unused-tables.md` already lists 27 tables (Phase 1). This phase:
- re-runs its check against the code as it is after Phases 2 to 6;
- adds any table that the removed pages were the last to read (likely the jobs and tender-alert tables, if they
  exist);
- refreshes the row estimates;
- notes that the Phase 3 registry was built from the regulators' files, not from `entities`.

**Nothing is dropped.**

## 3. Bring the three guides up to date

- **`README.md`.** It still describes the first build: "Daily Brief" Markdown, and no mention of the registry, casebook,
  ledger or Watch pack. It will be rewritten as a short guide for a new contributor:
  - what the site is;
  - how to run it and the checks;
  - where each part lives (data, readers, pages, desk);
  - the honesty rules;
  - links to the other two guides.
- **`OPERATIONS.md`.** Its "What updates itself" table lists the World Bank series, the Wire and Signals. It will list
  every scheduled job as it runs today, with its time (UTC), what it writes, and what to do when it fails:
  - auctions, remittances, the morning note, the weekly edition and the index release;
  - the registry (monthly) and the forecast ledger (twice daily);
  - site QA and data health.

  It also gains the release routine (checks, screenshots, merge with approval, live probe) and the reader fixture
  saver.
- **`AFRONOMICS_BUILD_PLAN.md`.** Its "What exists today" table gains the five rebuild layers (Today and the new
  navigation, Casebook, Registry and Compare, Our record, Watch pack). Anything it lists as planned that the rebuild
  replaced or parked is marked as such, not deleted.

Every number in these guides (job times, counts of SACCOs, banks and auctions) is read from the code or data files
when written, not from memory.

## 4. Fix what I found while checking Phase 5

On `/pricing`, my live check did not find the wording that says the Watch pack is included in "Pack with alerts"
for SACCOs. I'll read the rate card and the page, and fix it if the line is missing. Every page must show the same
offer.

## 5. Check the whole rebuild against "Done means"

One audit, with results in the PR:
- **Every old URL answers 200 or a permanent redirect.** The list comes from four places: the redirect map, the
  sitemaps before the rebuild (from git history), the links in published stories, and the 50 most-visited paths
  in Vercel's analytics if it has them. Each URL is fetched by the Probe workflow on the preview.
- **`data/` history unchanged except for new appended rows.** Every `data/` file is compared between the commit
  before Phase 1 and the end of this branch. A row that changed or disappeared is listed. A file that changed in
  any way other than appended rows is explained or fixed.
- **Build, tests and site QA pass**, with the WCAG A/AA check at 390px and 1280px, in light and dark.
- **Every figure on a new page has a source and as-of date.** Checked by hand on Today, Registry, an institution
  page, Compare, Our record, the casebook and the Watch pack sample.
- **No model-generated number a reader can see.**

## Not in Phase 6

- Removing `/chama` (after 31 October, as above).
- Coverage pages for the parked sectors (later, on one template).
- Dropping any table.
- New features, including the Watching block on Today and the registry backfill to 2020.

## Checks before the PR

- tsc, eslint, `pytest tests/site tests/readers`, `next build`.
- Site QA, plus the redirect test, which now also checks that no parked route has a page file.
- Screenshots:
  - one parked URL showing its redirect;
  - `/pricing` with the Watch pack line;
  - the rewritten README as rendered on GitHub.

## Decisions needed from you

1. **Tender alerts:** keep unsubscribe working and pause new sign-ups (recommended), or remove the endpoints as
   well once the database shows no active subscribers?
2. **`/chama`:** park it on 1 November as you decided (recommended), or keep it longer?
3. **Old-URL audit:** include Vercel analytics' most-visited paths if available (recommended), or only the redirect
   map and past sitemaps?

## What was decided (14 Oct)

You approved the plan with one change: remove anything not being used, not only the parked pages. So:
- **Code.** Files and exports that nothing uses are removed too. They were found with knip (`knip.json`) and each was
  checked with a search.
- **Tender alerts and the jobs board.** These had 0 subscribers, 0 payments and 0 job posts. You approved removing
  them on 14 Oct ("remove the jobs board and tender alerts"). That covers:
  - their API routes;
  - the checkout plans and the rate-card line;
  - the payment hooks;
  - the daily send step;
  - the privacy-page paragraph.

  The `/jobs` and `/tenders` redirects stay. The Kenya tenders collector and its data stay too, because data history
  cannot be rebuilt.
- **Tables.** The unused tables are listed, not dropped. Dropping a table cannot be undone, and some still hold
  rows. That needs its own go-ahead.
- **Data collectors and `data/` files stay**, even where no page reads them yet. A missed day of collection can never
  be recovered.
