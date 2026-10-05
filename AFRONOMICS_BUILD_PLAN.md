# Afronomics — Plan

**What it is:** the price of money in Africa, from the source, for everyone.
**Goal:** when anyone in Africa asks what money costs (a reporter, a bank treasurer, a saver choosing between a
SACCO and a money market fund), the answer they are given is "check Afronomics".

Revised 5 Oct 2026. This replaces the September plan, whose 136 phases described shell pages that were removed
in the rebuild.

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
| Economy files | 54 countries, World Bank series, FX, DFI pipeline, the Wire (publisher RSS) | `/countries`, `/data`, `/capital`, `/news` |
| Public API and CSVs | Free with attribution | `/developers`, `/api/v1/*`, `/api/data/*` |
| Money | Paystack: Pro, Team, committee packs; jobs board | `/pricing`, `/pack`, `/jobs` |

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
- The navigation leads with the price of money. Economy, Capital, Climate, Technology and Trade stay live
  in the footer but are not where effort goes.
