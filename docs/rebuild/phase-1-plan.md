# Phase 1 plan: Shell

Written 14 Oct 2026 for the brief in `docs/rebuild/BRIEF.md`. **Status: waiting for founder approval.** No code is
written until this is approved.

## What Phase 1 delivers

1. **New navigation:** Today · Compare · Casebook · Numbers · Stories · For institutions, plus a Kiswahili switch.
   - On a phone it becomes a grouped menu.
   - **Footer:** Method · Our record · Corrections · Learn · About · Kiswahili.
2. **New look:** colour and type tokens.
   - Archivo stays, with tabular figures everywhere numbers line up.
   - Source Serif 4 is added, self-hosted under the Open Font Licence, for headlines and case titles.
   - One accent colour; colour only for rise, fall and warning.
   - No gradients. The current night-panel gradients and the blurred accent glows go.
3. **Two new components** in `components/evidence/`:
   - **`EvidenceTag`:** source and as-of date on every figure; tap opens the source. It replaces the ad-hoc source
     lines over time; this phase uses it on Today and the hub pages.
   - **`Timeline`:** dated events, each with a source. Built and tested now; first real use is the casebook in Phase 2.
4. **Today**, the new home page, wired to existing data only. Details in the next section.
5. **Hub pages** that gather the existing pages under the new structure: `/numbers`, `/stories`, `/compare` and
   `/for-institutions` (rebuilt).
6. **Redirect map** for every parked route, plus updates to the sitemap, `llms.txt`, the footer and the site QA page
   list.

**No data changes.** Nothing in `data/`, `scripts/*.py`, the workflows, the API, billing or Supabase is touched.

## Today (home), block by block

Every figure comes from existing loaders, is computed by code, and carries an `EvidenceTag`.

| Block | Source | Notes |
| --- | --- | --- |
| **What changed** | `lib/data/signals.ts` and the auction loaders | The three biggest moves since the previous print, each with who it touches and the effect in shillings |
| **Watching** | none until Phase 2 | Hidden. There is no casebook yet, and we don't show placeholder content |
| **From the casebook** | none until Phase 2 | Hidden for the same reason |
| **Our record** | `lib/data/auction-intel.ts` `trackRecord` (tested and inside) | Honest label: "T-bill ranges: X of Y auctions landed inside our range". The full forecast ledger comes in Phase 4 |
| **For institutions** band | rate card | Board Watch and the pilot, with prices from `lib/billing/ratecard.ts` |

"What changed" works like this:
- The shilling effect is computed only where the formula is plain arithmetic, for example a rate move applied to a
  stated KES 100,000 for a stated period. Otherwise the line shows the move and who it touches, with no shilling
  figure.
- "Who it touches" comes from a fixed mapping per series, e.g. T-bill rate → savers in T-bills and money market
  funds. The mapping is written in code and reviewed in this PR, never generated.

The Wire headlines, country league tables and the debt hero move off the home page. They stay reachable from
Numbers and Stories.

## Hubs: move or link? (decision 1)

**Recommendation: in Phase 1 the hubs link to the existing pages, and their addresses don't change.** Moving 34
market and rate pages, with their dated sub-pages, under `/numbers/...` would change about 1,300 addresses at once.
Those addresses are:
- indexed and cited;
- in the 32 pilot emails sent this week (`/data/frontier-local-debt`, `/licensing#local`);
- carrying today's pilot offer and the shilling survey.

Every move would work through a 301 redirect, but a mass move resets search ranking and adds risk for little
reader benefit. The new structure lives in the navigation, the hubs and the breadcrumbs. If you want the addresses
to move too, I'd do it in Phase 6, one section at a time.

| Hub | Gathers (no change to these addresses) | Organised by |
| --- | --- | --- |
| `/numbers` | `/markets/*`, `/rates/*`, `/prices`, `/east-africa`, `/countries/*`, `/data/*`, `/charts` | Questions, e.g. "What does the government pay to borrow?" |
| `/stories` | `/brief`, `/weekly`, `/explainers`, `/news`, `/archive`, `/topics/*`, `/institutions/*` | Filters by type, topic and country, one list |
| `/compare` | Existing peer tables: money market fund yields, SACCO rates, bank rates, loan apps, T-bills by country | Phase 3 replaces it with the registry and comparator |
| `/for-institutions` | `/pricing`, `/licensing`, `/data-api`, `/developers`, `/advisory`, `/advertise`, `/buying`, `/pack` | Board Watch, casebook licence, data and API, studies, clinics |

What happens to the existing index pages:
- **Redirected now** (they duplicate their hub): `/news` and `/archive` → `/stories`; `/markets` → `/numbers`;
  `/charts` → `/numbers`.
- **Kept:** every detail page and dated page.

## Casebook in the navigation (decision 2)

**Recommendation: leave Casebook out of the navigation until Phase 2 ships real cases.** An empty section would break
the "nothing invented, no placeholders" rule. The Phase 1 navigation is Today · Compare · Numbers · Stories · For
institutions; Casebook joins in Phase 2.

## Parked routes: redirect map (decision 3)

All of these are permanent (308) redirects. The code stays in git; the pages leave navigation and the sitemap.
Existing legacy redirects that point at parked pages are re-pointed, so there are no chains.

| Parked | Goes to | Flag |
| --- | --- | --- |
| `/tenders`, `/tenders/pay` | `/for-institutions` | Paid tender alerts stop being sold (none bought) |
| `/jobs`, `/jobs/post` | `/for-institutions` | Paid job posts stop being sold (none bought) |
| `/radio` | `/morning` | |
| `/rent-check`, `/pay-check` | `/numbers` | The reader-submitted reports stay in Supabase |
| `/chama` | `/learn` | **Launched on LinkedIn on 14 Oct and carries the new survey.** Keep it until the launch post has run its course? |
| `/diaspora`, `/send-money`, `/send-money/*` | `/rates/remittances` | |
| `/trade`, `/technology`, `/climate`, `/capital`, `/economy` | `/numbers` | Coming back as Coverage pages later; data and loaders untouched |
| `/ask` | `/search` | |
| `/signals` | `/` (Today, "What changed") | Rebuilt as Watching in Phase 2 |

Also in this phase, `docs/rebuild/unused-tables.md` lists the Supabase tables nothing reads. It's a read-only check
of the code against the schema, and nothing is dropped.

## Kiswahili (decision 4)

- **Phase 1:** the switch links to the Kiswahili pages that already exist (`/morning/sw` and `/learn/sw/*`).
- **Later:** Today in Kiswahili needs every "What changed" line translated. The numbers come from code and only the
  words are translated. I'd add it in Phase 2 alongside the casebook; it isn't needed to approve this phase.

## How it is checked before the PR

- `npm run build`, `tsc`, `eslint`, `pytest tests/site tests/readers`, and `scripts/site-qa.mjs` on all 46 pages at
  390 and 1280, light and dark. The page list gains the hubs.
- **A redirect test:** every route in today's sitemap, plus every parked route, answers 200 or one permanent
  redirect to a page that answers 200. No chains and no 404s.
- Screenshots of Today and each hub at 390 and 1280, light and dark, on the Vercel preview.
- The PR goes to `main` only with your approval (D-005).

## Not in Phase 1

The casebook, the institutions registry, the comparator, the forecast ledger, Watch packs, impact tags beyond
"What changed", Coverage pages, moving deep addresses, and any change to data, collectors, API, billing or schema.

## Decisions needed from you

1. **Hubs:** link to the existing pages now, with addresses unchanged (recommended), or move them under the new
   paths now?
2. **Casebook in the navigation:** hide until Phase 2 (recommended), or show it now with an "in preparation" page?
3. **Parked routes:** approve the map above, especially `/chama`, which launched today: park now, or keep until
   the end of October?
4. **Kiswahili Today:** fine to add it in Phase 2?

Estimated size: one PR with about 25 to 35 changed files, a few days of work. Production stays on the current
site until you approve.
