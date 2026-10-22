# Afronomics Feed

The price of money in Africa, from the source. Kenya first.

Afronomics reads what central banks, treasuries and regulators publish (auction results, policy rates, bank and SACCO
returns), keeps a dated history of it, and shows it with its source. It compares institutions, keeps a casebook of
past money events, and grades its own forecasts in public. Information, not advice.

This guide is for a new contributor. How the site runs day to day is in [`OPERATIONS.md`](OPERATIONS.md); what it is
for and what comes next is in [`AFRONOMICS_BUILD_PLAN.md`](AFRONOMICS_BUILD_PLAN.md); the rebuild that gave the site
its current shape is in [`docs/rebuild/BRIEF.md`](docs/rebuild/BRIEF.md).

## Run it

Next.js 16 (App Router), TypeScript and Tailwind CSS v4. This Next.js has breaking changes from older versions: read
`AGENTS.md` and the guide in `node_modules/next/dist/docs/` before writing code.

```bash
npm install
npm run dev        # http://localhost:3000
```

The collectors and tests are Python 3.12 (`pip install pdfplumber requests openpyxl pytest pyyaml`).

## Checks before every pull request

```bash
npx tsc --noEmit
npx eslint
python -m pytest tests/site tests/readers
npm run build
node scripts/site-qa.mjs --serve      # after the build; see docs/qa.md
```

The same tests and site QA run on every pull request in GitHub Actions. Check every changed page at 390px and 1280px
wide, in light and dark. The full release routine is in `OPERATIONS.md`.

## Where things live

### Data and collectors

| What | Where |
| --- | --- |
| Collected data and its history (auctions, rates, registry, forecasts) | `data/` (one folder per country, plus `data/registry/`, `data/forecasts/`, `data/watch/`) |
| Readers and collectors, one per source | `scripts/*.py` |
| Offline reader tests and saved copies of publishers' documents | `tests/readers/`, `tests/readers/fixtures/` |
| Data loaders and arithmetic | `lib/data/`, `lib/auction-math.ts` |
| Scheduled jobs | `.github/workflows/`, `vercel.json` (listed in `OPERATIONS.md`) |
| Snapshots of the Morning, the weekly edition and the index release | `editions/` |
| Database migrations | `supabase/migrations/` |

`data/` is append-only. Never delete or rewrite a row: a correction is a new row that says what it corrects.

### Pages

| Section | Route | Where |
| --- | --- | --- |
| Today (home) | `/`, Kiswahili at `/sw` | `app/(home)/page.tsx`, `app/sw/` |
| Numbers | `/numbers`, gathering `/markets/*`, `/rates/*`, `/data/*`, `/countries/*` | `app/numbers/`, `lib/hubs.ts` |
| Stories | `/stories`, gathering `/brief`, `/weekly`, `/explainers` | `app/stories/`, `content/` |
| Learn | `/learn`, with Kiswahili and other languages | `app/learn/`, `content/learn/` |
| For institutions | `/for-institutions`, `/pricing`, `/pack`, `/licensing` | `app/for-institutions/`, prices in `lib/billing/ratecard.ts` |
| Casebook | `/casebook`, `/casebook/[id]` | `content/cases/<id>.md`, `lib/cases.ts`, checked by `scripts/case_check.py` |
| Registry | `/registry`, `/registry/[slug]`, CSV at `/api/registry` | `data/registry/`, `lib/registry.ts` |
| Compare | `/compare` | `app/compare/`, from the registry |
| Our record (forecast ledger) | `/record`, CSV at `/api/record` | `data/forecasts/`, `lib/ledger.ts`, `scripts/forecast_ledger.py` |
| Watch pack | public sample at `/watch/sample`; private links at `/watch/<slug>/<token>` | `lib/watch.ts`, `lib/watch-link.ts`, withdrawn links in `data/watch/revoked.json` |
| The desk (internal) | `/desk`, Watch packs at `/desk/watch` | `app/desk/` |

Casebook drafts show only in preview deployments and on `/desk`. Production shows a case only once it is published
and signed off by the founder. Watch pack links are signed for one SACCO, expire, and are never public.

### Writing a story

Briefs, weekly notes and explainers are Markdown files with YAML frontmatter in `content/briefs/`, `content/weekly/`
and `content/explainers/`. `lib/content.ts` refuses a file without `title`, `date`, `authors`, `category`, `labels`,
`sources` (each with `name`, `url` and `date`), `teaser` and `summary`. Labels are `Facts`, `Analysis` or `Opinion`.
Topics and institutions must come from `lib/taxonomy.ts`. A brief drafted from a story lead
(`scripts/story_finder.py`) is checked with `python scripts/story_check.py content/briefs/<slug>.md <lead id>` before
it ships (see `docs/story-engine.md`). The house voice is in `docs/editorial/voice.md`.

## The honesty rules

- Every figure shows its source, a link and an as-of date.
- Code does the arithmetic. A model never produces a number a reader sees.
- No demo or invented figures in production.
- Verdicts on named companies, institutions and people follow one rule: `docs/editorial/named-institutions.md`
  (D-028). The registry and Compare show regulators' figures with no grades; a SACCO is set against SASRA's minimums
  only in its own private Watch pack.
- Information, not advice: no buy, sell or hold; no promised returns.
- Historical data is appended, never overwritten. Corrections are logged in `lib/corrections.ts` and shown at
  `/corrections`.
