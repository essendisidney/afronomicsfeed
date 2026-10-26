# Afronomics — Plan

**What it is:** the price of money in Africa, from the source, for everyone.
**Goal:** when anyone in Africa asks what money costs (a reporter, a bank treasurer, a saver choosing between a
SACCO and a money market fund), the answer they are given is "check Afronomics".

Revised 14 Oct 2026, after rebuild Phases 1 to 5 (`docs/rebuild/BRIEF.md`); Phase 6 clean-up is in progress. The
5 Oct revision replaced the September plan, whose 136 phases described shell pages that were removed in the rebuild.

---

## 1. What exists today

| Layer | What it is | Where |
| --- | --- | --- |
| T-bill auctions, 10 markets | Every central-bank result, read from the banks' own notices. History from 2000 (South Africa), 2002 (Egypt, Nigeria), 2011 (Kenya); the shortest is Zambia from 2018 | `data/*/tbill_auctions.json`, `scripts/*_tbills.py`, `/markets/tbills` |
| Kenya bonds | Every auction, yield curve, what KES 100,000 earns | `data/kenya/bond_auctions.json`, `/markets/kenya-bonds` |
| Kenya savings and loans | Bills, bonds, money market funds and CBK bank averages after tax; "Is my rate fair?" | `data/kenya/rates.json`, `/rates/kenya`, `/rates/kenya/check` |
| Money market fund history | Each fund's published yield, one row per fund per day, from 1 Oct 2026 | `data/kenya/mmf_history.json`, `/rates/kenya/money-market-funds`, `/api/data/kenya-mmf` |
| Sovereign Bill Index | Weekly ten-market index and release | `/markets/bill-index`, `editions/index/` |
| The Morning | Weekday note at 07:00 Nairobi, English and Kiswahili, email and WhatsApp text | `/morning`, `.github/workflows/morning-note.yml` |
| Alerts | Browser push the moment a market publishes | `supabase/functions/af-push-check` |
| Economy files | 54 countries, World Bank series, FX, DFI pipeline, the Wire (publisher RSS). **Partly parked:** `/capital` redirects to `/numbers`; data and loaders kept for later Coverage pages. `/countries` and `/data` sit under Numbers, `/news` under Stories | `/countries`, `/data`, `/news` |
| Public API and CSVs | Free with attribution | `/developers`, `/api/v1/*`, `/api/data/*` |
| Money | Paystack: Pro, Team, committee packs. **The jobs board and tender alerts were removed on 14 Oct 2026** (no listings, subscribers or payments); `/jobs` and `/tenders` redirect to `/for-institutions` | `/pricing`, `/pack`, `/for-institutions` |
| The shell (Phase 1) | Today, the new home page: what changed since the last print, with its source and who it touches. Navigation: Today · Compare · Numbers · Stories · For institutions; footer line Method · Our record · Corrections · Learn · About · Kiswahili. Hubs for Numbers and Stories. Kiswahili Today (Phase 2) | `/`, `/sw`, `/numbers`, `/stories`, `lib/site.ts`, `components/evidence/` |
| Casebook (Phase 2) | Structured cases of past money events, one file per case. Three cases, all DRAFT until the founder signs them off; drafts show only in previews and on `/desk`. Not yet in the main navigation | `content/cases/`, `/casebook`, `/casebook/[id]`, `scripts/case_check.py` |
| Registry and Compare (Phase 3) | Every licensed SACCO, microfinance bank and bank, from the regulators' own documents: SASRA's 2026 list (176 licensed deposit-taking SACCOs, 176 authorised non-withdrawable-deposit SACCOs, 5 restricted, 1 revoked, 1 expired), CBK's directories (38 banks and 1 mortgage lender, Jul 2026; 14 microfinance banks, Feb 2026) and the 2025 annual reports' figures. Peer tables with no scores or grades. Monthly job | `data/registry/`, `/registry`, `/registry/[slug]`, `/compare`, `/api/registry`, `registry.yml` |
| Our record (Phase 4) | The forecast ledger: Kenya T-bill ranges written before bids close and graded by code when CBK publishes. The commit is the time stamp. The backtest is shown separately and never added to the live figures | `data/forecasts/kenya_tbills.json`, `/record`, `/api/record`, `forecast-ledger.yml` |
| Watch pack (Phase 5) | A private quarterly pack about one SACCO for its board: its figures beside its SASRA tier median and SASRA's minimums, the sector this quarter, where surplus funds earn, casebook lessons. Included in "Pack with alerts" for SACCOs. Signed private links, issued from the desk; the public sample is a median large-tier SACCO | `lib/watch.ts`, `/watch/sample`, `/watch/<slug>/<token>`, `/desk/watch` |

**Parked in the rebuild** (brief, section 4): `/tenders`, `/radio`, `/rent-check`, `/pay-check`, `/diaspora`,
`/send-money`, `/trade`, `/technology`, `/climate`, `/capital`, `/economy`, `/jobs`, `/ask` and `/signals`. Each
redirects permanently to the nearest new page (`parked` in `next.config.ts`); Phase 6 removes their page code, and git
keeps it. `/signals` is replaced by the Watching block on Today, still to be built on the casebook. `/chama` stays live
until the end of October 2026, then is parked the same way. Sector pages come back later as Coverage pages on one
template; their data and loaders stay.

How it runs day to day is in `OPERATIONS.md`.

## 2. Where it stands (first week, 30 Sep – 5 Oct 2026)

- About 170 human page views, almost all from Kenya; 1 newsletter subscriber; 1 payment.
- The 135 "API calls" logged from Ireland were our own push-alert checker. It is no longer counted (`lib/bots.ts`).
- Uganda's data stops at 3 Sep 2026: its script runs from a machine in the region, not the GitHub job.
- Every money market fund yield read has been unchanged since the first read on 1 Oct. Check whether the
  managers' pages are current before the fair-rate check leans on them; the league table now shows how long
  each yield has been unchanged.

The data and the automation are ahead of the audience. The next quarter is about being found and being cited.

## 3. Priorities, in order

### 1. Be cited (distribution)
- Publish every auction within minutes with a share image and one plain sentence; post to X, LinkedIn and a
  WhatsApp Channel.
- Newsroom programme: free use for Business Daily, Nation, The Star, Citizen, and Nigerian and Ghanaian desks in
  exchange for "Source: Afronomics" and a link.
- Push `/widgets` to SACCOs, fintechs and finance blogs: every embed is a backlink and a daily reminder.
- **Measure:** citations per week, sites embedding a widget, Morning subscribers.

### 2. Win the saver
- Grow the money market fund table from 4 funds toward every CMA-licensed fund; the history is the moat.
- "Is my rate fair?" for Nigeria and Ghana.
- Kiswahili as a full edition, not a page.
- **Measure:** fair-rate checks run, MMF page visits, returning visitors.

### 3. Cover the whole price of money
- Policy rates and an MPC calendar for all ten markets; interbank rates.
- Monthly CPI from national statistics offices (World Bank inflation is annual and lags).
- Eurobond yields; bond auctions beyond Kenya.
- Bring Uganda onto a schedule that runs.

### 4. Charge institutions, keep the public free
- Committee packs, API keys with higher limits, bulk licences for banks, pension funds, DFIs and treasuries.
- Paystack is live; the work is packaging, a sample per buyer type and direct sales.
- **Measure:** paying institutions, monthly recurring revenue.

### 5. Show who stands behind the numbers
- A named editor and a methodology owner on `/about` and `/method`; keep `/corrections` visible.

## 4. Rules that do not change

- Every figure carries its source, a link and an as-of date. Nothing invented, no demo prints.
- Headlines link out; no republished copy.
- Information, not advice: no buy/sell/hold language.
- Historical observations are appended, never silently overwritten.
- The navigation leads with the price of money. ~~Economy, Capital, Climate, Technology and Trade stay live
  in the footer but are not where effort goes.~~ Parked in the rebuild (14 Oct 2026): they redirect to `/numbers`
  and return later as Coverage pages.
- Verdicts on named companies, institutions and people follow `docs/editorial/named-institutions.md` (D-028). A SACCO
  is set against SASRA's minimums only in its own private Watch pack.
- Code does the arithmetic; a model never produces a number a reader sees.
