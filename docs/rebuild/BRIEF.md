# Afronomics rebuild brief

For Claude Code. Put this file at `docs/rebuild/BRIEF.md` in the `essendisidney/afronomicsfeed` repo and read it,
with `AGENTS.md`, before writing any code. Written 14 Oct 2026.

## 1. What we are doing

We are rebuilding the **front of the site** (structure, navigation, look and feel) and adding **the Desk layer**
(casebook, comparisons, forecast record, board Watch packs). We are **not** rebuilding the data engine. The
collectors, the daily history and the checks are the business's most valuable asset; they stay and keep running
throughout.

**What Afronomics is now:** Africa's dated record of what money did, why it happened, and what happened next. It
compares institutions and sectors, explains causes with evidence, warns when today looks like a past failure, and
grades its own forecasts in public.

**Who it serves, in this order:**

1. Boards and risk committees of Kenyan SACCOs, smaller banks, microfinance banks and pension schemes (first payers).
2. Analysts, funds, DFIs and researchers (data and casebook licences).
3. The ordinary reader (wananchi): free stories, in English and Kiswahili, on a phone.

## 2. Rules that do not change

- Every figure shows its source, a link and an as-of date. Nothing invented. No demo figures in production.
- Historical observations are appended, never overwritten. **Never delete or rewrite anything in `data/`.**
- **Code does the arithmetic; models only write words.** A model never produces a number that is shown to a reader.
- Every story and every pack passes `scripts/story_check.py` (or its successor) before it ships.
- Information, not advice: no buy/sell/hold, no promised returns.
- Named companies, institutions and people: one rule, in `docs/editorial/named-institutions.md` (D-028). Warnings
  about a SACCO's own position against SASRA's minimums stay private to its board (Watch pack).
- Labels: Facts, Analysis, Opinion, as in `docs/editorial/voice.md`.
- Least cost: no new paid services. Stay on Vercel, Supabase, GitHub Actions. Model calls only where words are written.
- Authority rests on the institution, not on one person. No founder photos or personal branding on the site.

## 3. How to work

- One phase at a time (section 8). Start each phase by writing a short plan in `docs/rebuild/phase-N-plan.md` and
  stopping for approval.
- Work on a branch `rebuild/phase-N`; open one pull request per phase. Do not merge to `main` without the
  founder's approval (decision D-005).
- Keep production running on the current site until a phase is approved. Use Vercel preview deployments to review.
- Do not drop Supabase tables. New tables come in new numbered migrations after `0041`.
- Every old URL that moves gets a permanent redirect. Nothing that is linked or cited may 404.
- Run `npm run build`, the tests and `scripts/site-qa.mjs` before every pull request; check every changed page at
  390px wide, light and dark.

## 4. Keep, fold, park, add

### Keep as they are (the engine)

| What | Where |
| --- | --- |
| All collected data and its history | `data/` |
| Collector scripts | `scripts/*.py` |
| Scheduled jobs (auctions, remittances, morning note, weekly edition, data health, tests, site QA) | `.github/workflows/` |
| Data loaders and maths | `lib/data/`, `lib/auction-math.ts` |
| Story engine and figure checker | `scripts/story_finder.py`, `scripts/story_check.py`, `docs/story-engine.md` |
| Auction ranges with track record (seed of the forecast desk) | `lib/data/auction-intel.ts` |
| Public API, keys, downloads | `app/api/`, `lib/api.ts`, migrations `0028`, `0035`, `0036`, `0039` |
| Payments (Paystack) and billing | `lib/billing/`, migrations `0005`, `0013`, `0023` |
| House standards | `/method`, `/corrections`, `/editorial-standards`, `docs/editorial/voice.md` |
| Published stories and explainers | `content/` |
| The Morning in English and Kiswahili | `/morning`, `lib/learn-i18n.ts` |
| Widgets and embeds, RSS, `llms.txt`, `/lite`, `/offline` | as now |
| Accessibility gains from the UI/UX audit | `docs/design/ui-ux-audit.md` |
| Internal desk | `/desk` |

### Fold into the new structure (move, then redirect)

| Old routes | New home |
| --- | --- |
| `/markets/*` (19 pages), `/rates/*` (15), `/prices`, `/east-africa`, `/countries/*`, `/data/*`, `/charts` | **Numbers** |
| `/brief/*`, `/weekly/*`, `/explainers/*`, `/news`, `/archive`, `/topics/*`, `/institutions/*` | **Stories** (with filters) |
| `/learn/*`, `/guides`, `/reference` | **Learn** |
| `/pricing`, `/licensing`, `/for-institutions`, `/data-api`, `/developers`, `/advisory`, `/advertise`, `/buying`, `/pack` | **For institutions** |
| `/signals` | **Watching** (rebuilt on the casebook, see section 6) |

### Park (remove from navigation, redirect to the nearest new page, keep the code in git history)

`/tenders` (parked under D-002), `/radio`, `/rent-check`, `/pay-check`, `/chama`, `/diaspora`, `/send-money`,
`/trade`, `/technology`, `/climate`, `/capital`, `/economy`, `/jobs`, `/ask`.

Sector pages (climate, economy, technology, trade and the rest) come back later as **Coverage** pages built on one
template (section 6). Do not delete their data or loaders.

Supabase tables from earlier plans that nothing reads (for example `startups`, `funding_rounds`,
`climate_projects`, `infrastructure_projects`, `trade_flows`): leave them in place, list them in
`docs/rebuild/unused-tables.md`, do not drop them.

### Add (the Desk layer)

| New | What it is |
| --- | --- |
| **Institutions registry** | Every SACCO, bank and microfinance bank, with its licence, tier and published returns over time, from CBK and SASRA publications |
| **Comparator** | Peer tables and charts: liquidity, bad loans, capital, deposit growth, cost of credit, all in the same units (KES and USD, after inflation) |
| **Casebook** | Structured cases of African money events (section 5) |
| **Forecast ledger and record page** | Every forecast logged with its date and range; graded automatically when the result arrives; hit rate published |
| **Watch pack generator** | Builds a board's quarterly pack (HTML and PDF) from the registry, comparator and casebook |
| **Human impact tags** | Each fact tagged with who it touches (saver, borrower, farmer, commuter, SME owner, diaspora sender) and its effect in shillings a month where it can be computed |

## 5. The casebook format

One file per case in `content/cases/<id>.md`, frontmatter plus body. ID format: `AF-<country>-<year>-<nn>`, for
example `AF-KE-2016-01`.

Required frontmatter fields:

- `id`, `title`, `country`, `sector`, `institutions` (list), `start`, `end`
- `conditions_before`: list of measurable conditions, each with `metric`, `value`, `as_of`, `source`
- `trigger`: what set it off, with a source
- `timeline`: dated events, each with a source
- `who_lost`: groups affected and amounts where published
- `signals_visible_before`: the published numbers that pointed to it, with dates and sources
- `response`: what regulators and government did
- `lessons`: short checklist items a board or regulator can use
- `labels`: Facts / Analysis
- `sources`: every document used, with URL and date

The sentinel matches today's figures against `conditions_before` and `signals_visible_before` across all cases.
A case is published only after the founder signs it off.

## 6. New structure

### Main navigation

**Today · Compare · Casebook · Numbers · Stories · For institutions**

Footer: Method · Our record · Corrections · Learn · About · Kiswahili.

### Pages

- **Today (home).** "What changed": the three biggest moves since yesterday, each said in shillings and naming
  who it touches. "Watching": sector-level patterns that match past cases, with the case linked. "From the
  casebook": one case. "Our record": the current forecast hit rate. A band for institutions.
- **Compare.** Pick a sector and a peer group; see the table and charts; download the CSV. Public view shows
  published data only.
- **Casebook.** Filter by country, sector and year; each case page shows the timeline, the signals beforehand and
  the lessons.
- **Numbers.** Everything that is under Markets and Rates today, reorganised by question ("What does the
  government pay to borrow?", "What do savings pay after tax?") rather than by dataset.
- **Stories.** All briefs, weekly notes and explainers, filterable.
- **For institutions.** Board Watch, Casebook licence, Data and API, commissioned studies, director clinics, with
  prices from `lib/billing/ratecard.ts` and a sample pack.
- **Our record.** Every forecast, its range, the outcome, and the running hit rate.
- **Coverage (later).** One template per sector answering four questions: where the money comes from, where it
  goes, what it costs a household, who gets hurt when it fails.

## 7. Look and feel ("ambience")

The feeling is **a well-kept case file**: calm, exact, evidential. A reader should trust it before reading a word.

- **Type.** Keep Archivo for interface and numbers, with tabular figures everywhere numbers line up. Add one open
  serif for headlines and case titles (for example Source Serif 4, self-hosted) to give editorial weight.
- **Colour.** Paper and ink as today. One accent colour. Colour only carries meaning: rise, fall, warning. No
  gradients, no stock photos, no decorative illustration.
- **The evidence tag.** Every figure carries a small tag showing source and as-of date; tapping it opens the source.
  This is the signature element of the site.
- **Case numbers.** Cases show their ID (AF-KE-2016-01) like a file reference.
- **Timelines.** Cases and watch items use one shared timeline component.
- **Phones first.** Designed at 390px, fast on a slow connection, `/lite` kept. No horizontal page scroll.
- **Kiswahili.** A visible language switch; the Morning and every Today item available in Kiswahili.
- **Dark mode** kept. Accessibility at WCAG AA, as the audit left it.

## 8. Phases

Each phase ends with a pull request, a preview link and the checks in section 3. Do not start the next phase until
the founder approves.

1. **Shell.** New navigation, layout, type, colour tokens, evidence tag component, timeline component, Today page
   wired to existing data. Redirect map for every folded and parked route. No data changes.
2. **Casebook.** Case schema and validator, case list and case pages, 3 sample cases marked DRAFT for the founder
   to complete and sign off.
3. **Registry and Compare.** Institutions registry for SACCOs and microfinance banks from published SASRA and CBK
   data, collectors added to the scheduled jobs, Compare pages, CSV download.
4. **Forecast ledger.** Migration for forecasts and outcomes, logging from `auction-intel.ts`, automatic grading,
   Our record page.
5. **Watch pack.** Generator for one SACCO's quarterly pack from public data (HTML and PDF), private delivery, sample
   on For institutions.
6. **Clean up.** Remove parked routes from the build (redirects stay), list unused tables, update `README.md`,
   `OPERATIONS.md` and `AFRONOMICS_BUILD_PLAN.md`.

## 9. Done means

- Every old URL answers 200 or a permanent redirect.
- `data/` history unchanged except for new appended rows.
- Build, tests and site QA pass; no WCAG A/AA failures at 390px and 1280px, light and dark.
- Every figure on a new page has a source and as-of date.
- No model-generated number anywhere a reader can see it.
