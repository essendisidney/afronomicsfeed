# Master plan v2: from USD 0 to the first invoices, and the honest road beyond

Written 13 Oct 2026 by the architect pass. It brings together `usd-1m-plan.md`, `decision-log.md` (D-001 to D-014),
`competitive-landscape.md`, `sector-opportunities.md`, `seo-plan.md`, `country-pricing.md`, `docs/desk-operator.md`,
`data/strategy/model.json` and the code that shipped in #107. It replaces none of them. Where they disagree, the
decision log wins. Re-read it every Monday, after the growth report.

Labels: **VERIFIED** = checked in code or in the database on 13 Oct 2026 (read-only SQL on `ugjpcybhqwvzidcbqpik`);
**ESTIMATED** = reasoned from a cited figure; **ASSUMED** = a guess written down so evidence can replace it. Nothing
below counts as revenue unless it is a `payments` row with `status = 'success'`.

## 1. Where we are (VERIFIED, 13 Oct 2026 unless dated)

| Measure | Value | Source |
|---|---|---|
| Revenue collected | **USD 0**. 0 real payments; 1 row in total (a test) | `payments` |
| Paying customers / subscriptions | 0 / 0 | `deals`, `paid_subscriptions` |
| Deals | 21 `contacted` (12–13 Oct), 45 `prospect`, 0 pilot, 0 won | `deals` |
| Pilot requests / trial keys / live keys | 0 / 0 / 0 | `leads`, `data_keys` |
| Checkouts started (30 days) / survey answers | 0 / 0 | `events_daily`, `survey_answers` |
| Outside visitors, last 7 days | 151 visitor-days, 16 of them on institutional pages | `page_views` (daily uniques summed, not unique people) |
| Bond-auction coverage | 13 markets: Kenya, Nigeria, Egypt, Uganda, Zambia, Morocco and 7 WAEMU issuers. These carry at least 35.7 of Africa's 44.5 points in GBI-EM Edge. Missing: Tunisia, Ghana bonds, Angola | `competitive-landscape.md` §1 |
| Bill-auction coverage | 10 direct markets plus WAEMU BATs; 18 countries and about 22,300 rows in total | same |
| Refresh | `african-auctions.yml` runs every 2 h, 07:17–21:17 Nairobi on weekdays and 4× a day at weekends | workflow file |

**Live for buying, pilots and the desk (VERIFIED in code):**
- **Self-serve pilot.** The form posts to `app/api/pilot/route.ts`. It records a lead and a deal at stage `pilot`
  and, for a work address, issues a **30-day key on the spot** through `af_trial_key_issue` (migration 0035, applied;
  the function and `data_keys.expires_at` both exist). Expired keys are refused. Limits: 1 live key per email, 3 per
  domain in 90 days, 40 a day. Gmail-type addresses are recorded, and the desk issues their key by hand.
  The form requires the answer to **"which would you pay for next: FX, Eurobonds, inflation"** (`lib/billing/pilot.ts`).
- **Checkout.** `app/api/checkout` → Paystack. Analyst (`analyst`) and Team and API (`data_team`) are sold at the
  rate-card USD price, charged in KES at 129 unless `PAYSTACK_CURRENCY=USD`. Kenyan-institution prices are
  `analyst_ke` KES 16,000 and `data_team_ke` KES 95,000. Payments are recorded by both the webhook and the return
  page, idempotently (`lib/billing/record.ts`, `confirm.ts`). `app/thank-you` shows what was bought, what happens
  next and whether it renews.
- **Desk.** `FunnelPanel` (via `af_desk_funnel`, migration 0034) shows visitors → institutional pages → pilot
  requests → trial keys → active keys → checkouts → payments, plus per-key usage and survey totals. `lib/track.ts`
  counts `download_click`, `pricing_cta_click`, `pilot_form_start/submit`, `source_click` and `survey_answer`.

## 2. The revenue path today, step by step

| Step | What happens | Automated | Manual | Gap (verified in code) |
|---|---|---|---|---|
| 1. Email | Founder-approved pilot notes, 21 sent on 12–13 Oct. One follow-up each on 21–22 Oct (scheduled routines) | Follow-ups | Ninety One draft still waiting on the founder (D-013); any new contact | Only 21 of the 25 contacts D-004 needs |
| 2. Site | `/data/frontier-local-debt`, `/markets/bonds`, `/pricing`, `/data-api` | Pages, Dataset markup, sitemap | — | **Dated per-auction pages exist only for Kenya bonds** (`app/markets/kenya-bonds/[date]`). Bills have them for every market (`tbills/[country]/[date]`). Google verification tag is in `app/layout.tsx`. **Sitemap submission to Search Console cannot be checked from code**; `seo-plan.md` lists it as still to do |
| 3. Pilot key | Self-serve key, emailed and shown on screen. Deal logged, desk notified | Yes (work email) | Webmail requests; desk routine nudges idle pilots (drafts) | No automatic day-7 / day-23 usage email with a buy link |
| 4. API use | `lib/api.ts` checks the key, counts calls per path in `data_key_usage`, serves uncached | Yes | — | **The paid key buys almost nothing technical.** The open API serves the same rows with no key, cached for 5 minutes, and `/developers#terms` makes "internal analysis" free. That is exactly what a fund does. No bond-result alerts (`supabase/functions/af-push-check` and `lib/rate-alerts-core.ts` cover bills, mostly Kenya). No webhooks are sent anywhere, though the Startup licence copy promises one. No Excel, Sheets or Python delivery (`/data-api` says "on the enterprise plan"). **Latency is not measured**: `af_seen.source_published_at` is empty on all 31 rows, and bonds are not tracked there at all |
| 5. Checkout | Paystack charge → payment row → receipt → desk email | Yes | **Access is manual.** For `data_team`, "within one working day the desk sends your API key" (`record.ts` `nextStep`). For Analyst, the desk "confirms your seat" | **No API key is issued automatically after a Team purchase** (tender alerts are automated in the same function; data plans are not). A key made with `af_api_key_create` has no expiry, so it outlives the paid month. There is no USD invoice generator and no standard licence text (founder, `usd-1m-plan.md`) |
| 6. Renewal | One-off charge unless a `PAYSTACK_PLAN_*` code is set (`plans.ts`) | Subscription webhooks are recorded if plans exist | Everything | **Plan codes not set** (ASSUMED from the brief; env values are not readable from code, and `/thank-you` would show "Nothing renews automatically"). There is no renewal reminder, so every month-2 dollar today depends on the founder remembering |

**Reading it.** The front half (outreach → pilot key) is automated and working. It has had no input yet: 0 pilot
requests. The back half (key → money → month 2) is manual or missing, and so is the reason to pay rather than use
the free API. Those two facts set the order of the build list.

## 3. Which datasets come next, and when (evidence-gated)

Order from `sector-opportunities.md` §4. **Nothing in this section is built before the D-004 result** (25
contacts, ≥3 pilots, ≥2 weekly users; D-012). The pilot form's required "pay for next" answer and the desk survey are
the evidence. Read them each Monday.

| If the evidence says | Build next | Size | Buyers | Gate |
|---|---|---|---|---|
| D-004 passes and **FX** leads the answers | 1. FX and reserves monitor (official fixings, NFEM turnover, reserves), sold as the reason to move from Analyst to Team | S–M | 300–500 institutions (ESTIMATED) | ≥3 pilot answers "FX" |
| D-004 passes and **Eurobonds** leads | 3. Eurobond terms, issuance calendar and maturity wall (extend `scripts/eurobonds.py` from 2 issuers to about 20). No scraped dealer prices | M | Same funds plus advisers | ≥3 answers "Eurobonds", or a paying customer asks |
| **Inflation** leads | 4. CPI and auction-implied real yields, bundled, never sold alone | S | Retention, not new logos | ≥3 answers, or a paying customer asks |
| D-004 **fails** (kill rule) | 2. Pension, insurance and fund-manager dataset feeding the KES Investment Committee Pack (Kenya, about 1,000 schemes) | M | Local institutions | Kill rule fires |
| After 10 paying institutions | 5. DFI and private-capital deal-flow tracker | M–L | New pool, 300–600 (ESTIMATED) | Repeatability gate |
| A named prospect says a missing market blocks purchase | Edge gaps: Ghana bonds, South Africa bonds, then Tunisia and Angola; backfill Uganda, Zambia, Morocco | M each | Global PMs | A written objection on a deal |

**Honest revenue bridge.** The model (`data/strategy/model.json`, ASSUMED inputs) gives USD 0.9k, 9.1k or 80k a
month at month 36 (conservative, base, aggressive), and **no scenario reaches USD 1m within 36 months**. The plan case
in `sector-opportunities.md` §5 (ESTIMATED) reaches about USD 35k a month by end 2028, about USD 300k by end 2030, and
**USD 1m a month in 2033 at the earliest**. That needs about 800 paying institutions, raised capital, sellers and 3–4
data engineers. The debt wedge alone tops out near USD 2–3m a year (ESTIMATED). If the debt pilots fail, the
fallback lines point to roughly USD 100–200k a month by 2033 (ESTIMATED). The next 90 days are about the first
invoice, not the million.

## 4. How we beat competitors (concrete moves)

The real competitor is "an analyst with 13 browser tabs" (`competitive-landscape.md` §2c). We win on harmonisation,
history, provenance and speed. The tape is free to read, so speed and workflow have to be what people pay for.

- **Kenya.** CBK on X, Business Daily, Cytonn PDFs and Mwango hold the audience. Moves: (1) send Business Daily's markets
  desk a clean CSV within an hour of each CBK print, so we become the cited table; (2) offer Mwango a co-branded
  weekly (sponsor swap, no cash); (3) win the Kenya queries in `seo-plan.md` with rate and date in the titles;
  (4) the IC Pack and WhatsApp alerts only if D-004 fails, or once the CIS legal check (LN 173/2023) clears.
- **East Africa.** Nobody harmonises the region; USE sells debt prices at USD 500 a month. Moves: dated Uganda and
  Tanzania auction pages and an "EAC league table" story every month (`seo-plan.md` weeks 3–8); backfill Uganda bonds
  before Nov 2024 (Edge weight 4.84) when a pilot asks; an "East Africa curve pack" pitch to TDB and EADB treasuries
  after the first payment.
- **Africa-wide.** Standard Bank and Absa research comes bundled; Stears is Nigeria-only; nobody publishes WAEMU in
  English (we hold 1,625 UMOA rows). Moves: French WAEMU pages with hreflang (`seo-plan.md` action 6), pitched to
  Capmad and Financial Afrik; one data-licence conversation each with Tellimer, Stears, Daba and Cbonds as a data
  customer (founder's time; one Enterprise deal from USD 5,000 a month is worth more than 3 Team seats); a citation
  link-up with the Kiel/Geneva ADD ("ADD to 2024, Afronomics from 2024 to today").
- **Global.** Bloomberg and LSEG at about USD 22–32k a seat (ESTIMATED). Moves: sell "the Edge Africa auction tape" with
  a **published latency figure** (build item 1), at a tenth of a seat; side-by-side sheets against Cbonds and
  Trading Economics for Uganda, Zambia and Côte d'Ivoire; an MCP connector and Snowflake listing only after the first
  payer (Briter already sells an MCP connector).
- **Search everywhere.** We appeared in none of 27 high-intent queries on 13 Oct. The news sites that rank win
  because each auction gets its own URL; build item 8 copies that for bonds.

## 5. Ranked 90-day build list (max 10)

Rule: "build now" only where it supports the 21 pilots already offered. Everything else waits for its gate. Items
9–10 are Phase-4 expansion and wait for the D-004 result.

| # | Item | Why it moves collected revenue | Files | Size | Gate | Acceptance test |
|---|---|---|---|---|---|---|
| 1 | **Measured latency**: record the publisher's release time next to our first-seen time for every bill **and bond** result, then publish p50/p90 by market | Answers "how fast?" with a number, the cheapest gap against terminals; becomes the headline claim in pilot follow-ups | `supabase/functions/af-push-check/index.ts`, `scripts/*_bonds.py`, `scripts/umoa_bonds.py`, `scripts/bills_common.py`, new migration 0036 (bond `kind` in `af_seen`), `app/data/frontier-local-debt/page.tsx` | S–M | **Build now** | `af_seen` rows for bonds and bills have `source_published_at`; the product page shows p50/p90 hours per market from ≥5 real results, with the method stated; markets with fewer than 5 say "not enough results yet" |
| 2 | **Bond-result alerts for key holders** (email first): each trial or paid key picks markets and gets an email when a new bond auction lands | Turns the key into something the free API lacks, gives pilots a reason to come back weekly (the D-004 "weekly user"), and fixes the rate card, which promises bill alerts only | new `supabase/functions/af-bond-alert/index.ts` (or a step in `african-auctions.yml`), migration 0036 `key_alerts`, `app/api/pilot/route.ts` (default markets from the form), `lib/billing/ratecard.ts` copy (founder approves the wording) | M | **Build now** (email). Webhooks only when a pilot or buyer asks | A test key subscribed to Egypt gets one email within one reader run of a new Egypt bond result, with the figures and source link; no duplicate on the next run; unsubscribe works |
| 3 | **Paid access without the desk**: on a successful `data_team` or `data_team_ke` charge, issue the API key, email it once, and expire it at the end of the paid period plus 3 days; Analyst gets an automatic confirmation | A card buyer gets what they paid for in minutes, not a day; non-renewal ends access, so month 2 has to be paid | `lib/billing/record.ts` (next to the tender-alert grant), migration 0036 `af_paid_key_issue(reference, email, days)`, `app/thank-you/page.tsx`, `lib/billing/record.ts` `nextStep` | S–M | **Build now** (the first payment can arrive any day) | A Paystack test-mode charge for `data_team` produces exactly one key tied to the reference; a replayed webhook issues no second key; the key returns 401 after `expires_at` |
| 4 | **Make the free and paid lines coherent**: `/developers#terms` stops offering free "internal analysis" to institutions, and "Licensed from KES 7,500 … redistribution" is brought into line with the ladder (Enterprise owns redistribution) | Today a fund can legally use the free API for its own analysis, and the cheapest licence appears to include redistribution. Without this, conversion depends on goodwill | `app/developers/page.tsx`, `app/licensing/page.tsx`, `app/data-api/page.tsx`, `lib/billing/ratecard.ts` | S | **Founder decision F1 first** (a licence change) | One wording across the three pages and the rate card; a reviewer can answer "can a fund use the free API internally?" the same way from each |
| 5 | **Pilot lifecycle emails**: day 7 (usage so far, quick start again), day 23 (calls, markets used, the plan that fits, checkout and invoice links), day 30 (expired, how to continue) | Pilot → paid is where D-004 is decided (≥1 payment by week 8). Today it relies on the desk routine's drafts | new `app/api/cron/pilots/route.ts` or an edge function, migration (a nudge log), `lib/billing/pilot.ts` | S | **First trial key issued** | For a test key aged 7, 23 and 30 days, each email goes out exactly once with real usage counts; an unused key gets the day-7 nudge only |
| 6 | **Renewals**: until Paystack plans exist, email a renewal link 7 and 1 days before a one-off period ends; once plan codes are set, confirm `subscription.create` lands in `paid_subscriptions` | Month 2 is the first repeat revenue; without it, every sale churns by default | `lib/billing/record.ts`, new cron route, `lib/billing/plans.ts` (no price change) | S | **First real payment** | A one-off test payment dated 23 days ago produces exactly one reminder with a working checkout link; with a test plan code, the subscription row appears |
| 7 | **USD invoice path**: a numbered PDF invoice for Analyst, Team or Enterprise with bank details, plus the standard data-licence and pilot terms page | Global funds and DFIs pay by invoice, not by card in KES (`country-pricing.md`) | `lib/billing/invoice.ts` (new), `app/pricing/page.tsx` (#invoice), `app/licensing/page.tsx` | M | **An institution asks for an invoice**, or the founder signs off the licence text (F3) | The desk produces an invoice from `/desk` in under 2 minutes, numbered and logged against the deal |
| 8 | **Dated per-auction bond pages for every market**, with rate and date in titles, in the sitemap. Also the founder's Search Console and Bing submissions | Each auction gets a URL that can rank; this feeds inbound pilot requests beyond the 21 offers | `app/markets/bonds/[market]/[date]/page.tsx` (new, same pattern as `kenya-bonds/[date]`), `app/sitemap.ts`, `app/markets/bonds/[market]/page.tsx` | M | **Build now, after 1–3** | Every bond market with data has dated pages in the sitemap; titles carry the auction date and the main yield; Search Console shows them indexed within 30 days |
| 9 | **Workflow delivery**: Google Sheets `IMPORTDATA` template, Excel-ready CSV with all fields, a thin Python client | Raises usage among pilots who live in spreadsheets; Cbonds and Trading Economics have it | `lib/api.ts` (key as a query parameter, so Sheets can send it: a security trade-off to document), `app/data-api/page.tsx`, a new `clients/python/` folder | M | **≥1 pilot or buyer asks**, or usage shows CSV clicks but no API calls | A Sheets template refreshes Egypt bonds with a trial key; `pip install`-able client returns a DataFrame for any market |
| 10 | **The next pool**: FX and reserves monitor if D-004 passes and FX leads the answers; otherwise the pension / IC Pack dataset (kill path) | Opens the second buyer pool the USD 1m path needs (§3) | new `scripts/fx_*.py` on the `bills_common.py` pattern, or `scripts/cma_mmf.py` plus new pension readers, `app/data/...` | M | **D-004 result** (25 contacts, ≥3 pilots), plus ≥3 survey or pilot answers | The dataset is on the product page with source links, health checks and an API endpoint, and at least one pilot user calls it within 14 days |

Not on the list until a gate opens: new Edge markets (§3), MCP connector and Snowflake (after the first payer), the
consumer tools (D-001, parked), tenders (D-002), and local payment accounts outside Kenya (D-014).

## 6. Weekly operating rhythm

| When (Nairobi) | Routine (VERIFIED in the scheduled-routine list) | What it decides |
|---|---|---|
| Every 2 h, 07:07–21:07 | **Sale watch**: real payments, FIRST SALE alert | Collected money, nothing else |
| 08:41, 13:41, 17:41 weekdays | **Desk operator and support**: inbox, leads, pilots, deals, drafts | Pilot replies within one working day; idle-pilot nudges; "ask for payment" flags |
| Daily | LinkedIn company posts (Mon–Fri slots, Thursday T-bill result); the founder's personal-angle digest | Traffic to institutional pages |
| Mon, Wed, Fri 07:47 | **Story engine**: one checked brief and a company post | Inbound readers, SEO freshness |
| 07:47 daily | Site health check and repair | Data freshness (`data/health.json`) |
| Monday 08:07 | **Weekly growth report**, money first | This week's single target (below) |
| Wednesday 10:13 | **Money sprint**: one shipped move | Takes the top unblocked item from §5, not a new market (see F6) |

**The metrics that decide each week**, in this order. The first one that is off target sets the week's work:

1. **Collected USD** (payments `success`). Target: ≥1 by week 8 (about 7 Dec). If a payment is waiting with
   `access_sent_at` empty, that comes before everything else.
2. **Qualified contacts sent**: 21 of 25. Until it reaches 25, the founder's top job is four more.
3. **Replies → pilot keys → keys used in the last 7 days.** Targets ≥5 replies, ≥3 keys, ≥2 weekly users by week 4
   (about 9 Nov). A key unused after 7 days gets one nudge.
4. **"Pay for next" answers** (FX, Eurobonds, inflation). Three of one kind is a product signal (§3).
5. **Institutional visitors** (16 visitor-days in the last 7 days) and checkouts started (0 in the last 30 days).
6. Data health: no red market on the desk.

## 7. Decisions only the founder can make

- **F1 Licence line.** Is institutional internal use free? Recommendation: free for research, journalism and
  non-commercial use; any fund, bank or DFI using the data in its work needs Analyst or above. This unlocks item 4.
- **F2 Paystack.** Create monthly plans for `ANALYST`, `DATA_TEAM` and the `_KE` variants and set the env codes, and
  decide whether to ask Paystack for USD. Settings are the founder's (desk-operator "Never").
- **F3 Legal.** Standard data licence and pilot terms; the Kenya CIS advertising check (LN 173/2023).
- **F4 Outreach.** Send or drop the Ninety One draft, and name 4+ more qualified contacts to reach 25.
- **F5 Search Console and Bing.** Submit the sitemap from the founder's Google account.
- **F6 Money sprint prompt.** It still lists new Edge markets first and uses different gate numbers (10 requests,
  5 users) from D-004. Approve pointing it at §5 and D-004.
- **F7 Partners.** Whether to open data-licence talks with Tellimer, Stears, Daba and Cbonds, and with the ADD authors.
- **F8 Capital and hiring.** No raise or seller is assumed before the repeatability gate (10 payers).
