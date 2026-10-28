# Afronomics Feed: founder strategy pack

28 October 2026. Prepared for the founder as the answer to the "founding strategic partner and chief architect" brief.

**How to read this.** Each claim carries one of four labels:
- **[V] Verified**: checked against our own database, code or site on 28 Oct 2026.
- **[S] Sourced**: from a cited public source (numbered in the appendix).
- **[E] Estimated**: reasoned from sourced figures.
- **[A] Assumed**: a guess written down so the 90-day test can replace it.

Nothing here is legal advice; section N and appendix B list what a Kenyan lawyer must confirm.

The model behind section I is `scripts/kes_model.py`, which writes `data/strategy/kes-model.json`. The older USD model, `scripts/financial_model.py`, covers the global-fund data ladder and stays as the comparison case.

**Standing rules this pack respects:**
- D-028: no grade or ranking of a named institution.
- D-030/D-033: no email is sent.
- D-034: no outreach until the founder lifts the hold.
- 22 Oct: no new reader features until the site is active.

The 90-day plan in section K **cannot start without the founder lifting D-034**, because selling needs conversations. That is the first of the five actions in section N.

---

## The answer in one paragraph

Stop selling the global data licence as the lead product. Sell a **Kenya Treasury Desk** to the people who sign off where institutional shillings sit:
- SACCO treasurers and boards;
- pension-scheme trustees and their administrators;
- the smaller fund managers.

The Treasury Desk is the Investment Committee Pack we already sell, plus same-day auction alerts and a quarterly benchmarking page.

The test is concrete:
- **Prices:** KES 18,000 a month for a Board Pack and about KES 65,000 for a multi-scheme Treasury Desk.
- **Who sells:** founder-led, 40 conversations in 90 days.
- **Success:** 10 paying institutions with at least KES 300,000 a month booked.
- **Kill:** fewer than 3 paying institutions by day 90.

The global API stays on sale but gets no new sales effort until a buyer arrives on their own.

---

## A. One-page investment thesis

**What we have that is hard to copy [V]:**
- **Primary-auction results from 18 African markets:** about 22,300 rows, each with a link to its source document.
- **The WAEMU regional market in English:** 1,625 rows.
- **Kenya in depth:** 2,295 T-bill rows back to 2011 and 390 bond rows.
- **Live data with an API:** pipelines that load new results within days of each auction, and an API with keys, plans and a Paystack checkout.

**What the market says [S]:**
- Terminals cost about $22k (LSEG) to $28–32k (Bloomberg) a seat a year [C1][C6].
- Narrow APIs cost $19–199 a month (Mansa), and Mansa's auction endpoints are still marked "soon" [C21][C23][C26].
- Single-country auction results are free from each central bank [C41–C44].
- Free historical panels exist: the Kiel-linked African Debt Database covers 54 countries back to 2000 [C49][C50].
- **So the raw data is not the moat. The clean, live, normalised, sourced feed and what it is turned into are.**

**What buyers have done so far [V]:**
- 35 global and African institutions contacted, 12–22 Oct.
- Zero genuine replies: only customer-service replies and automatic receipts.
- One pilot form, from a Ugandan university.
- Three API keys issued; none used since 14 Oct.
- Zero real payments.
- The pages for institutions and the API are read mostly from outside Africa.
- Kenyans come for the market pages and the money tools.

**The thesis:**
- **Where we start:** the first money comes from Kenyan institutions that must put a sourced view of rates in front of a board every month or quarter.
  - 357 regulated SACCOs [S1].
  - 1,032 registered pension schemes, 197 of them with more than KES 1bn [S2].
  - 47+ licensed fund managers running KES 949bn of collective investment schemes [S3].
- **Why they will pay:** today they assemble that view by hand from CBK PDFs, or take it from a fund manager who is selling to them.
- **What independence means:** the pack is sourced to the line, on time, and comes from nobody with a product to sell.
- **Price:** KES 18,000–65,000 a month is small against the KES 15,000–40,000 of analyst time it replaces each month [A]. It is also tiny against the assets it informs.
- **The next step, if Kenya works:** the same engine produces Uganda, Tanzania and Rwanda packs, then a regional desk for banks and funds. The global data licence becomes the second product for the funds and fintechs that ask for it.

**Why now:**
- **Pension assets** rose 24.6% to KES 2.81 trillion in 2025 [S2].
- **Fund assets** have nearly doubled since 2024 [S3].
- **Treasury-bond demand is heavy:** the 19 Oct auction drew KES 60bn of bids for one 30-year bond [V].
- **SACCO governance is under scrutiny** after the KUSCCO collapse [S1].
- Boards are spending more time on where money sits, and are being asked to show their reasoning.

**Why we might be wrong (see N):**
- Boards may be happy with their fund manager's free report.
- Procurement in SACCOs may be slow and committee-driven.
- Selling research to institutions about securities may need a CMA licence.
- The founder's time is the binding constraint.

**Capital needed [E]:**
- **Base case:** about KES 1.3m before monthly break-even (section I).
- **Conservative case:** KES 0.7m, if hiring waits for revenue.
- No outside capital is needed for the 90-day test. It costs the founder's time, about KES 60,000 in lawyer and registration fees, and printing.

---

## B. Competitor matrix (with sources)

Full research notes are in appendix C. The 13 Oct `competitive-landscape.md` stays valid; this table adds the Kenyan institutional view.

| Competitor | What they sell | Price | Kenyan institutional treasury view? | Gap for us |
|---|---|---|---|---|
| Bloomberg Terminal | Terminal, African local-currency indices with AfDB | ~$28–32k a seat a year [C1][C2] | Yes, but few SACCOs or schemes hold a seat | Price; no board-ready output |
| LSEG Workspace | Terminal, evaluated bond prices | ~$22k a seat a year (estimate) [C6] | JSE bonds; no public African T-bill auction coverage [C7] | Same |
| ICAP Africa (Parameta) | OTC FX and rates quotes, Kenya included | Not public [C8] | Secondary-market quotes for banks | Not primary auction; not for boards |
| Cbonds | Bond database | Not public, tiered [C17] | Bond-level pages; auction statistics not confirmed | No board pack; generic |
| Trading Economics | Macro and yields API | ~$149–299 a month [C18] | Headline yields only | No tender-level data |
| Mansa Markets / MansaAPI | Free pages; API $19–199 a month [C23] | Cheap | Kenya T-bill pages; auction API "soon" [C26] | **Closest threat** for the data API; no institutional pack |
| Stears | B2B intelligence, Nigeria-first [C11][C14] | Enterprise, not public | No | Not East Africa |
| Kilwa | AI investment scores for 54 markets; no raw data [C15] | Not public | No | Potential **buyer** of our feed |
| Tellimer | Frontier-market research, SDK [C32] | Not public | Research, not auction data | Not Kenya-local; not board format |
| African Debt Database (Kiel) | Free instrument history, 54 countries, 2000–2024 [C49] | Free | History, not live | Free history: do not charge for back-data alone |
| AfDB AFMI database | T-bill and bond portal | Free; current status unverified [C45] | Unclear | If it is dormant, we fill its role |
| Central banks (CBK, BoG, CBN …) | Auction results | Free [C41–C44] | Raw PDFs | Fragmented, no format, no history view |
| Business Daily | Kenyan business news, auction stories | KES 450 a week premium [C36] | In articles | Not structured; not board-ready |
| Mwango Capital, Kenyan Wall Street | Free newsletters, sponsorship [C37][O52][O54] | Free | Commentary | Partners for distribution, not rivals for the pack |
| **Fund managers' and investment consultants' own reports** | Free market updates sent to trustees and SACCOs | Free, bundled with mandates | **Yes: this is the real incumbent** | Not independent; written by the party being paid |
| The client's own analyst | Spreadsheet from CBK PDFs | Staff time | Yes | Slow, unsourced, error-prone [A] |

Notes:
- Tender alerts, company intelligence and news are covered in appendix C. Each is commoditised, or blocked by law or cost.
- The incumbent for the flagship is not Bloomberg. It is the free report from the fund manager, and the analyst's spreadsheet. We win on independence, sourcing and time saved, not on depth of data.

---

## C. Customer and problem hypotheses

Each hypothesis has a test (run in section K) and a kill line.

| # | Customer | Problem | They pay because | Test | Kill if |
|---|---|---|---|---|---|
| H1 | SACCO CEO, finance manager or treasurer (179 deposit-taking SACCOs; 34 with at least KES 10bn [S1]) | The board meets monthly or quarterly and wants to know where surplus funds earn most and whether the SACCO is behind the market. The pack is built by hand from CBK and fund factsheets | A sourced board pack with their name on it saves a day a month and makes the treasurer look prepared; no conflict of interest | 20 conversations; 5 free sample packs with their name on the cover; ask for a 12-month order | Fewer than 2 of 20 pay within 60 days of the sample |
| H2 | Pension-scheme trustee secretary or principal officer (1,032 schemes, 197 with more than KES 1bn [S2]) | Trustees must judge their fund manager's returns but see only the manager's own report | An independent benchmark (the same money at the auctions and in the market's funds, sourced) for the trustee meeting | 10 conversations via administrators; 3 benchmarking samples | No scheme agrees to pay KES 40,000 a quarter |
| H3 | Pension administrators, investment consultants and smaller fund managers (47+ fund managers [S3]) | They produce many board packs for many schemes or clients | Treasury Desk: one licence, packs for every scheme they serve, data downloads, alerts | 10 conversations; 2 sample multi-scheme packs | No one accepts KES 65,000 a month or more in principle |
| H4 | Global fund, DFI, research house (existing D-004 list) | They need clean African local-debt data | Saves building scrapers | No new effort; answer inbound only | (Already 35 contacts, 0 replies; parked) |
| H5 | Kenyan individuals (Mwananchi) | Where to keep savings; the cost of loans | Very low willingness to pay: news paywalls are KES 250–500 a month [O47–O49] | None now (the founder's 22 Oct rule) | — |

---

## D. Flagship product and positioning

**Product:** *The Kenya Treasury Desk*. It is the independent, sourced monthly view of Kenyan rates for the people who decide where institutional shillings sit.

**What the buyer gets:**
1. **The Investment Committee Pack**: four A4 pages on the first working day of each month, with the institution's name on the cover. It covers:
   - Kenya T-bill and bond auction results for the month: offered, bids, accepted, rates, demand;
   - the yield curve;
   - published money-market and fixed-income fund yields, with source and date and no ranking (D-028);
   - the shilling;
   - the auction calendar;
   - one page on the region: Uganda, Tanzania, Rwanda, Nigeria and Ghana bills.

   Every figure carries its source document.
2. **The auction alert**: an email or WhatsApp message the day each CBK result lands, with the change on the week.
3. **The quarterly benchmark** (Treasury Desk tier): the client sends its holdings and we return one page. It compares, in shillings, what the same money earned against what it would have earned at the auctions and in the market's published funds. It is facts only, with no recommendation (see section N on the CMA line).
4. **Data downloads**: CSV and Excel files of every series in the pack.

**Positioning line (homepage, sales deck):**
> "Your board's rates page, done. Sourced to every line, independent of anyone selling you a fund, on your table on the first working day of the month."

**Against the alternatives:**
- Against **the fund manager's report**: they are independent; we are.
- Against **the analyst's spreadsheet**: it takes a day; we take none, and we cite every figure.
- Against **Bloomberg**: about 1/20th of the price, and in the format the board reads.

**What it is not:** advice on what to buy. No "recommended allocation", no ratings, no model portfolio (section N).

---

## E. PRD for the minimum viable product (what to build, and what not to)

**Principle: sell before you build.** Most of the MVP exists [V]:
- the `/pack` page, a sample and Paystack checkouts for `pack` and `pack_plus`;
- the Kenya data;
- the Morning note;
- PDF generation (build 7e).

The MVP for the 90-day test is **manual-first**.

| Need | Status | Days 0–90 (validation) | Only after 5 paying (scale) |
|---|---|---|---|
| Sample pack with the prospect's name | Sample page exists [V] | Founder makes each sample by hand from the generator; 1 hour each | Automated naming at checkout |
| Monthly pack production | PDF engine exists [V] | Produced by script; the founder checks every number | Scheduled job, QA checklist, analyst hire at KES 400k MRR |
| Auction alert | Email alerts exist [V]; WhatsApp is listed as a product | Email only | WhatsApp via an approved provider |
| Quarterly benchmark | Product listed, KES 40,000 [V] | Done in a spreadsheet by the founder for 3 pilots | Upload form, template, entitlement |
| Invoicing | Paystack checkout [V] | Plus bank invoice and LPO for SACCOs (most will not pay by card) [A] | Invoice generator in the desk |
| Organisation accounts and seats | Not built | Not needed: email list per customer | Org, membership and entitlement tables (section H) |

**Acceptance for the MVP:**
- A prospect can receive a named sample within 24 hours of a conversation.
- A paying customer receives the pack on the first working day, with zero unsourced figures.
- An alert arrives the same day the CBK posts the result.
- An invoice can be issued in KES with KRA PIN details.

---

## F. Site map and key journeys

**Do not restructure the site now** (the 22 Oct rule). The changes below are only to the institutional path, and only once the test shows demand.

```
/                       Today (unchanged)
/for-institutions       → becomes the Treasury Desk landing page (L1 copy)
  /pack                 Investment Committee Pack: sample, prices, order
  /pack/sample          Named sample request (form → desk queue)
  /benchmarking         Quarterly benchmark: what it shows, sample page, order
  /licensing, /data-api Data licence and API (unchanged; secondary)
/markets, /rates        Free data pages (unchanged; the marketing)
/trust, /method         Sources, corrections, independence policy (add the CMA disclaimer)
/desk                   Founder's desk (internal)
```

**Journey 1: SACCO treasurer (primary)**
1. They meet the founder at a SACCO forum, through an introduction, or via a LinkedIn post. Any of these needs D-034 lifted.
2. They receive a named sample pack within 24 hours.
3. The board sees it at the next meeting.
4. The treasurer asks for a quote.
5. We send an invoice or LPO for 12 months (KES 216,000, or KES 194,400 if prepaid).
6. The first pack arrives on the first of the month.
7. At month 3, a call to confirm the board uses it and to ask for one introduction.

**Journey 2: pension administrator**
1. A demo.
2. A sample pack for two of their schemes.
3. Treasury Desk at KES 65,000 a month, with packs for up to 10 schemes.
4. A quarterly benchmark for one flagship scheme.

**Journey 3: global data buyer (secondary, inbound only)**
1. /data-api.
2. A trial key.
3. Checkout or an enterprise quote (as today).

---

## G. Data architecture and source plan (the data moat)

### G1. Source registry

The registry lives in `data/registry` and the pipelines. Formalise each entry with: source, publisher, URL pattern, format, frequency, licence status, permission status, last success and owner.

| Source | Use | Format | Licence position [S, appendix B] | Action |
|---|---|---|---|---|
| CBK T-bill and bond results | Core of the pack | PDF | Facts not protected; no Kenyan database right; "all rights reserved" on some CBK pages; no open licence | Attribute every figure. **Write to CBK for written permission for commercial redistribution through the API** |
| CBK rates, FX, MPC | Pack | HTML, Excel | As above | As above |
| CMA quarterly CIS reports | Fund-assets context | PDF | Public report | Attribute; publish no ranking (D-028) |
| Fund factsheets and published yields | Pack fund page | Web, PDF | Facts with attribution | Source and date on every figure; never "best" |
| SASRA annual supervision report | SACCO context, private Watch pack | PDF | Public report | Attribute; Watch pack private to the client |
| RBA industry briefs | Pension context | PDF | Public | Attribute |
| NSE prices | **Exclude** | — | Distribution licence needed [B] | Show no NSE prices until licensed |
| Bank of Uganda | Regional page | PDF | **Written permission needed** [B] | Request it before using Uganda in the paid pack |
| CBN Nigeria | Regional page | Web | Reuse allowed with attribution, unaltered [B] | Attribute |
| BoG, BoT, BNR, BCEAO/UMOA-Titres | Regional page | Web, PDF | Not checked | Check each before it enters a paid product |

### G2. Quality process (already partly built)

Each new observation passes these checks:
1. **Parse** with a schema check (types, ranges, tenor known).
2. **Reconcile** within the auction: accepted ≤ received, and bid-to-cover equals received ÷ offered within 0.5%.
3. **Check continuity** against the series: a rate move of more than 150 basis points in a week is flagged for a person to look at.
4. **Store the source link** and the file hash on the row.
5. **Check before release:** the pack generator refuses any figure without a source.
6. **Log corrections publicly** at `/corrections`.

Target: zero unsourced figures in any paid output, and every error corrected within one working day.

### G3. Provenance

Every row stores `source_url` (already true [V]). Add the following:
- `source_hash`;
- `retrieved_at`;
- `parser_version`;
- `checked_by` (person or job).

The pack footer cites each source document. This is the product's core promise, not a nice-to-have.

### G4. Legal

Details are in appendix B. In short:
- Attribute everything.
- Licence only our own derived work.
- Exclude NSE prices.
- Get written permission from CBK and BoU before redistributing them through the API.
- Register as a data controller with the ODPC once turnover passes KES 5m or staff reach 10. Do it earlier if the newsletter is "mainly direct marketing".
- Put transfer clauses in place for Vercel, Supabase and the email provider.

---

## H. Database schema and API spec

This builds on what exists: Supabase, RLS, the `af_*` security-definer RPCs and the data_keys tables. **Build only after 5 paying customers** (section M, phase 1).

### H1. Canonical data model

```sql
-- Reference data
source(id, publisher, name, url_pattern, licence, permission_status, frequency, owner, last_success_at)
series(id, source_id, market, instrument, tenor_days, measure, unit, title)        -- e.g. KE / tbill / 91 / weighted_avg_rate / pct
observation(series_id, as_of date, value numeric, source_url, source_hash,
            retrieved_at, parser_version, checked_by, primary key(series_id, as_of))
auction(id, market, instrument, tenor_days, issue, value_date, offered, received, accepted,
        competitive, noncompetitive, weighted_avg_rate, market_weighted_rate, price_per_100,
        coupon, source_url, source_hash)                                           -- one row per auction line
correction(id, table_name, row_key, field, old_value, new_value, reason, corrected_at)

-- Customers and access
org(id, name, kind check (kind in ('sacco','pension','administrator','fund_manager','bank','insurer','dfi','fintech','other')),
    country, kra_pin, billing_email, created_at)
member(org_id, user_id, role check (role in ('owner','member')), primary key(org_id, user_id))
product(id, code, name, currency, amount, period)                                  -- mirrors lib/billing/ratecard.ts
entitlement(org_id, product_code, seats, scheme_limit, starts_at, ends_at, source check (source in ('paystack','invoice','pilot')))
pack_issue(id, org_id, period, file_path, generated_at, checked_by, sent_at)
benchmark_upload(id, org_id, quarter, file_path, uploaded_at, status)              -- client holdings; personal data excluded
invoice(id, org_id, number, amount, currency, issued_at, paid_at, method)
audit_log(id, actor, action, target, at)
```

**RLS:**
- Reference data (`source`, `series`, `observation`, `auction`) can be read by all, as today: the free pages are the marketing.
- `org`, `member`, `entitlement`, `pack_issue`, `benchmark_upload` and `invoice` can be read only by members of the org: `exists (select 1 from member m where m.org_id = <table>.org_id and m.user_id = auth.uid())`.
- Writes go only through security-definer RPCs with the service role.
- Benchmark files live in a private storage bucket with per-org paths.
- A function `has_entitlement(org_id, product_code) returns boolean` checks `now()` between `starts_at` and `ends_at`. It is used by the RPCs and by `/api/v1`.

### H2. API (versioned; the existing key system stays)

```
GET  /api/v1/series?market=KE&instrument=tbill            list series (open)
GET  /api/v1/series/{id}/observations?from=&to=           open: last 12 months; key: full history
GET  /api/v1/auctions?market=KE&from=&to=                 auction lines with source_url (key for >12 months)
GET  /api/v1/packs                                        (member) list this org's pack issues
GET  /api/v1/packs/{period}.pdf                           (member, entitlement 'pack'|'desk') signed URL, 10 min
POST /api/v1/benchmarks                                   (member, entitlement 'desk') upload holdings CSV
GET  /api/v1/benchmarks/{quarter}.pdf                     (member, entitlement 'desk')
Webhook: auction.published {market, instrument, tenor, value_date, weighted_avg_rate, change_bp, source_url}
```

**Errors:**
- 401: no key or session.
- 403: no entitlement. The body names the product needed.
- 429: rate limit, with the existing per-plan limits.

---

## I. 36-month financial model (KES)

**Source:** `python scripts/kes_model.py`. Every input is labelled in the script and stored in `data/strategy/kes-model.json`.

**Starting point [V]:** KES 0 and 0 customers.

**Tiers:**

| Tier | Price a month | Basis |
|---|---|---|
| Board Pack | KES 18,000 | [V] the live price |
| Treasury Desk | KES 65,000 | [A] |
| Data licence | KES 194,000 ($1,500) | [V] |

Other assumptions:
- Services (training, research, extra benchmarks) add 5–15% of monthly recurring revenue [A].
- Staff are hired only when monthly recurring revenue first crosses a threshold:

| Monthly revenue reaches | Hire | Cost a month |
|---|---|---|
| KES 0.4m | Analyst | KES 180k |
| KES 1m | Seller | KES 250k |
| KES 2m | Engineer | KES 350k |
| KES 3.5m | Second analyst | KES 180k |
| KES 5m | Head of research and compliance | KES 400k |
| KES 7.5m | Second seller plus customer success | KES 400k |

**Results:**

| | Conservative | Base | Upside |
|---|---|---|---|
| Monthly revenue, month 6 (KES) | 102k | 319k | 689k |
| Monthly revenue, month 12 (KES) | 482k | 1.54m | 3.24m |
| Monthly revenue, month 24 (KES) | 1.23m | 4.93m | 13.90m |
| Monthly revenue, month 36 (KES) | 1.76m | 8.46m | 24.03m |
| Paying customers, month 12 | 16 | 43 | 76 |
| Paying customers, month 36 | 56 | 234 | 559 |
| Month monthly revenue first reaches KES 1m | 20 | 10 | 7 |
| Month monthly revenue first reaches KES 5m | not in 36 months | 25 | 14 |
| Month monthly revenue first reaches KES 10m | not in 36 months | not in 36 months | 20 |
| Break-even month (after month 6) | 8 | 9 | 8 |
| Cash needed before break-even (KES) | 713k | 1.26m | 2.51m |
| Team size, month 36 | 3 | 7 | 7 |

**Scenario inputs [A]:**

| Input | Conservative | Base | Upside |
|---|---|---|---|
| New Board Pack customers a month (start → month 12) | 0.5 → 2 | 1.5 → 5 | 3 → 8 |
| New Treasury Desk customers a month (start → month 12) | 0.2 → 0.7 | 0.5 → 2 | 1 → 3.5 |
| Yearly churn | 30% | 20% | 12% |
| Share of list price realised | 80% | 88% | 95% |
| Regional packs | Never | From month 19 (×1.6 new customers) | From month 13 (×2) |

**Customers needed for each revenue target:**

| Target monthly revenue | Assumed mix (Board / Desk / Data) | Blended revenue a customer | Customers | Board | Desk | Data |
|---|---|---|---|---|---|---|
| KES 1m | 75% / 22% / 3% | KES 32,544 | 31 | 23 | 7 | 1 |
| KES 5m | 60% / 33% / 7% | KES 44,363 | 113 | 68 | 37 | 8 |
| KES 10m | 55% / 35% / 10% | KES 50,384 | 198 | 109 | 69 | 20 |

**Reading it honestly:**
- **KES 1m a month** needs about 31 institutions. That is under 10% of the regulated SACCOs alone [E]. It is the realistic first target, and the base case reaches it in month 10.
- **KES 5m a month** needs about 113 customers. That means Kenya well penetrated, plus either the regional packs or a dozen data licences.
- **KES 10m a month** needs about 200. It is not credible from Kenya alone (pool estimates in the script: 250–600 Board buyers and 60–120 Desk buyers [E]). It needs the region and the data licence to work.
- **Break-even comes early in every case** because the costs are mostly the founder. That is also the risk: the model has no slack for a founder who is selling and producing at the same time. The first hire (the analyst at KES 0.4m) is the step that matters.
- **The conservative case pays its way but never builds a company:** KES 1.76m a month by month 36, team of 3. If the 90-day test lands near conservative, decide deliberately whether this is a business or a well-run side income.

---

## J. Packaging and price tests

| Package | List price | Test | What to learn |
|---|---|---|---|
| Board Pack (pack with alerts) | KES 18,000 a month; KES 194,400 a year prepaid (10% off) | Quote it first in every SACCO conversation | Price acceptance; annual against monthly |
| Pack only | KES 12,000 a month [V] | Offer only as a fallback when 18,000 is refused | How far the price can fall before a sale still happens |
| **Founding-member offer** | KES 12,000 a month locked for 24 months, first 10 institutions only, annual invoice | Use as the closing tool from conversation 10 onwards | Does scarcity speed procurement? |
| Treasury Desk | **Test three prices: KES 45k / 65k / 95k** a month across administrators and fund managers (one price per prospect, rotated) | Van Westendorp-style questions after the demo plus a real quote | Price elasticity at the top |
| Quarterly benchmark | KES 40,000 a quarter [V] | Sell standalone to trustees | Whether trustees pay separately |
| Trustee or SACCO board training | KES 200,000 a half day [V] | Offer to one association | Door-opener; cash early |
| Data licence | $1,500 a month (Team and API) [V] | No active test; inbound only | — |

**Rules:**
- Quote in KES to Kenyan buyers and invoice with VAT once registered.
- Never discount below KES 12,000 a month.
- Every discount buys something in return: a 12-month prepay, a case study, or an introduction.

---

## K. 90-day validation plan

**Precondition: the founder lifts D-034** for a defined list of up to 60 named Kenyan institutions, with founder-written messages only. Email stays on hold (D-030/D-033) unless the founder also lifts it, so the channels are:
- LinkedIn messages from the founder's own account;
- phone;
- introductions;
- in person.

**Weeks 1–2: get ready (no outreach yet)**
- Lawyer opinion on the CMA "investment adviser" question for the pack and the benchmark: budget KES 40–60k.
- Add the disclaimer to `/pack` and `/trust`.
- Write to CBK for redistribution permission.
- Pick 60 named targets:
  - 30 SACCOs (the 34 with at least KES 10bn first [S1]);
  - 15 pension administrators and large schemes;
  - 15 fund managers and investment consultants.
- Prepare 5 named sample packs.

**Weeks 3–8: 40 conversations**
- Pace: 5–7 conversations a week.
- Every conversation ends with an offer of a named sample.
- Log each one in the desk deal log: stage, objection, price quoted, decision-maker, next board date.

**Weeks 6–12: convert**
- Follow up only where the prospect asked us to. This respects D-034 in spirit: no unsolicited nudges.
- Close at the founding-member offer.
- Deliver the first packs on 1 Dec, 1 Jan and 1 Feb.

**Measures (tracked weekly on the desk):**

| Metric | Day 45 | Day 90 |
|---|---|---|
| Qualified conversations (decision-maker or treasurer) | 20 | 40 |
| Named samples sent | 10 | 25 |
| Paying institutions | 2 | **10** |
| Monthly revenue booked (KES) | 30k | **300k** |
| At least one Treasury Desk (KES 45k or more) | — | 2 |
| Packs opened or used at a board meeting (asked at month 1) | — | 70% of paying |

**Kill criteria (any one ends the Kenyan institutional thesis in its current form):**
1. Fewer than **3 paying institutions** by day 90, after at least 40 qualified conversations.
2. More than half of objections are "our fund manager gives us this free", and the sample does not change it.
3. The lawyer's opinion is that the pack or benchmark needs a CMA investment-adviser licence, and the licence cost is out of reach.
4. Producing each pack takes more than 4 founder-hours a customer a month by month 3.

**If killed:** keep the site and data as a media asset. Run sponsorship and the data licence as the only revenue, and decide whether to continue as a side business.

---

## L1. Sample homepage copy (for `/for-institutions`, not the main homepage)

> **Your board's rates page, done.**
> Every Treasury bill and bond auction, the yield curve, the funds' published yields and the shilling, on four sourced A4 pages with your institution's name on the cover, on the first working day of each month.
>
> **Independent.** We do not manage money, sell funds or take commissions. We report what the market did.
> **Sourced to the line.** Every figure links to the CBK, CMA or fund document it came from. If we get one wrong, we correct it publicly within a day.
> **On time.** Same-day auction alerts, and the pack before your committee meets.
>
> *For SACCOs* — the Board Pack, KES 18,000 a month.
> *For pension administrators and fund managers* — the Treasury Desk: packs for every scheme you serve, quarterly benchmarking and the data. From KES 65,000 a month.
>
> [Get a sample with your name on it]  [See this month's pack]
>
> *Afronomics Feed publishes general financial information. It is not investment advice and is not licensed by the Capital Markets Authority as an investment adviser.*

## L2. Sample flagship report (page 1 of the Investment Committee Pack, November 2026)

Figures are the real October auction results from `data/kenya/tbill_auctions.json` and `bond_auctions.json` [V]. The yearly comparison is left as [fill from data] rather than invented.

> **[Institution name] · Investment Committee Pack · November 2026**
> **Page 1: Kenya Treasury bills and bonds, October 2026**
>
> **The short version.**
> - **The 91-day bill was in heavy demand.** It drew six times the amount offered on 12 Oct (628%) and 19 Oct (622%).
> - **The 364-day bill was not.** It was undersubscribed on 19 Oct at 66%.
> - **Rates are nearly flat across bill tenors:** 8.75% for 91 days, 8.86% for 182 days and 9.04% for 364 days on 19 Oct.
> - **The extra yield is in bonds.** The new 30-year FXD1/2026/030 cleared at 14.18% against a 12.5% coupon, on KES 60.1bn of bids for KES 33.9bn accepted.
>
> | Auction 19 Oct 2026 | Offered (KES bn) | Bids (KES bn) | Accepted (KES bn) | Avg rate | Demand |
> |---|---|---|---|---|---|
> | 91-day bill | 8.0 | 49.8 | 34.2 | 8.750% | 622% |
> | 182-day bill | 10.0 | 12.1 | 11.5 | 8.860% | 121% |
> | 364-day bill | 10.0 | 6.6 | 6.6 | 9.038% | 66% |
> | FXD1/2026/030 (30-yr) | — | 60.1 | 33.9 | 14.183% | — |
> | SDB1/2011/030 (reopened) | — | 23.7 | 19.2 | 13.651% | — |
>
> **Month on month.** The 364-day rate held between 9.035% and 9.040% across the 5, 12 and 19 October auctions, and the 91-day rate eased from 8.769% to 8.750%. [Year-on-year change: fill from data.]
>
> **What this means for a treasury holding shillings.** The market is paying almost nothing extra to lock money into bills for a year rather than three months. The term premium is in bonds of 15 years and longer. *This is a description of the market, not a recommendation; your committee should take advice from its licensed adviser.*
>
> Sources: CBK Treasury bill results, issues of 5, 12 and 19 Oct 2026; CBK Treasury bond results, 7 and 19 Oct 2026 (links to each PDF in the footer). Afronomics Feed, independent; no position in any security.

**Pages 2–4:**
- **Page 2:** the yield curve, with this month against 3 and 12 months ago.
- **Page 3:** money-market and fixed-income funds' published yields, with source and date, in alphabetical order and not ranked (D-028); the shilling.
- **Page 4:** the auction calendar and the regional bills page.

---

## M. Technology roadmap with acceptance criteria

Each phase is a Cursor- or Claude-ready ticket. **No phase starts until its gate is met.**

| Phase | Gate | Scope | Acceptance tests |
|---|---|---|---|
| **0. Validation kit** (now, about 3 days) | D-034 lifted | (a) Disclaimer component on /pack, /benchmarking and /trust; (b) a `scripts/pack_sample.py --org "Name"` that renders a named sample PDF from live data; (c) desk deal-log fields for stage, objection, price quoted and board date | Sample PDF renders in under 60 seconds with the name on the cover and zero figures without a source link (test fails on a missing `source_url`); disclaimer present on the three pages (site-qa check) |
| **1. Organisations and entitlements** | 5 paying | Tables `org`, `member`, `entitlement`, `pack_issue`, `invoice` with RLS (H1); `has_entitlement()`; Paystack webhook and manual invoice both write an entitlement | pytest plus SQL tests: a member of org A cannot read org B's packs (RLS test with two users); expired entitlement → 403; Paystack test event creates the entitlement once (idempotent) |
| **2. Pack automation** | 10 paying, or production above 2 hours a customer | Monthly job: generate, run checks (G2), hold for a person to approve on the desk, send; `pack_issue` log | Job produces one PDF per active entitlement; refuses to send if any check fails; desk shows each issue's status; time from CBK publication to alert under 2 hours |
| **3. Benchmark service** | 3 paying benchmark customers | Upload form (CSV template), private bucket, benchmark generator, desk review | Upload rejected if the schema is wrong; PDF reproduces a hand-worked example to within KES 1; files readable only by the org's members (storage policy test) |
| **4. Regional packs** | KES 1m monthly revenue and BoU permission | Uganda, Tanzania and Rwanda pack variants from the existing pipelines | Every regional figure carries a source; country-level permission status is "granted" or "not needed" in `source` before the variant can be sold |
| **5. API v1 and webhooks** | Two data-licence buyers ask for it | `/api/v1` (H2), `auction.published` webhook, `source_hash` and `parser_version` on observations | Contract tests on every endpoint; 12-month limit enforced without a key; webhook fires within 10 minutes of a load; key revocation takes effect immediately |

---

## N. Top risks, kill criteria and next five actions

### Risks (ranked by likelihood × damage)

| # | Risk | Likelihood | Damage | Mitigation |
|---|---|---|---|---|
| 1 | **Nobody sells.** The founder cannot run outreach under D-034/D-030 and also produce the content | High | Fatal | Lift D-034 for a named list; cut publishing to the minimum during the 90 days |
| 2 | **"Our fund manager gives us this for free"** | High | High | Lead on independence and sourcing; target boards that are reviewing their manager; the benchmark is the wedge |
| 3 | **CMA "investment adviser" perimeter.** Cap 485A s.2/s.23 covers anyone who issues analyses or reports on securities for pay as a business; the newspaper exclusion may not cover a digital outlet [B] | Medium | High | Lawyer opinion in weeks 1–2; facts only, no recommendations, no commissions from licensees; if needed, partner with a licensed adviser for the benchmark |
| 4 | **Slow SACCO procurement** (board approval, LPO, cheque) | High | Medium | Annual invoice; founding-member offer timed to board dates; M-Pesa paybill for small amounts |
| 5 | **Mansa or another player ships a pan-African auction API** | Medium | Medium for the API, low for the pack | Pack and board format are the defence; keep the sourcing and Kenyan depth ahead |
| 6 | **Source permission** (CBK "all rights reserved", BoU permission required, NSE licence) [B] | Medium | Medium | Attribution now; written requests in week 1; exclude NSE |
| 7 | **Data-protection non-compliance** (ODPC registration threshold, cross-border transfers) | Low now | Medium (fines up to KES 5m) | Register when the threshold is near; transfer clauses; consent records already kept |
| 8 | **Single founder** (illness, burnout) | Medium | High | Analyst hire at KES 0.4m monthly revenue; production runbook |
| 9 | **Supabase bill unpaid** ($152.42 outstanding) | Known | Service interruption | Founder pays it this week |

### Kill criteria (summary)
- **Kenyan institutional thesis:** fewer than 3 paying by day 90 after 40 qualified conversations. Or more than half of objections are "free from manager" and survive the sample. Or a licence requirement that cannot be met. Or more than 4 hours of production a customer.
- **Global data licence (D-004):** already met its own kill line (35 contacts, 0 genuine replies, 0 key use). **Move it to inbound-only now.**
- **Whole company:** monthly revenue below KES 300k at month 9 under any product. At that point, decide between a side business and stopping.

### Next five actions (founder)
1. **Decide on D-034:** lift the outreach hold for a list of up to 60 named Kenyan institutions, through the founder's own channels. Nothing in section K starts without it.
2. **Pay the Supabase invoice** ($152.42), so the data and the desk stay up during the test.
3. **Book a Kenyan capital-markets lawyer** for one written opinion on the five points in appendix B. Budget KES 40–60k.
4. **Approve the move of the global data licence to inbound-only**, and the Treasury Desk as the lead product (a new decision-log entry, D-035).
5. **Name the first 10 targets you can reach personally** (a former colleague, a SACCO CEO you know, a trustee). I will prepare a named sample pack for each the day you send the list.

---

## The final question, answered

> *If you owned Afronomics Feed and your own capital were at risk, what exact product would you launch first, which customer would pay for it, why would they pay rather than use existing alternatives, how would you obtain the data legally, how would you secure the first ten paying customers, and what evidence would convince you to invest further?*

**The product.** The Kenya Treasury Desk Board Pack at KES 18,000 a month. It has three parts:
- a four-page, fully sourced monthly pack with the client's name on the cover, covering auctions, curve, fund yields, shilling and calendar;
- same-day auction alerts;
- a quarterly benchmark for those who pay more.

It is mostly built: the pack, checkout, data and PDF engine all exist. I would build nothing new until five institutions pay.

**The customer.** Start with the finance manager or treasurer of one of Kenya's 179 deposit-taking SACCOs, beginning with the 34 holding at least KES 10bn [S1]. Their board asks every month where the surplus sits and why. Second, the principal officers and administrators of the 197 pension schemes with more than KES 1bn [S2], who must judge a fund manager using the fund manager's own report.

**Why they pay rather than use the alternatives.** The alternatives are:
- a free report from the fund manager who is being paid to manage the money;
- a day of an analyst's time spent copying CBK PDFs;
- a Bloomberg seat at about $28,000 a year [C1].

We are independent, sourced to every line, on time, and about one-twentieth of a terminal. The decisive argument is independence: in the post-KUSCCO climate, a board that can show it checked its treasury against the market is protecting itself.

**Getting the data legally:**
- Auction results, CMA reports, SASRA and RBA reports and fund yields are published facts. Kenya has no separate database right, and fair dealing covers reporting with attribution [B].
- We attribute every figure and licence only our own derived work.
- We exclude NSE prices until we hold an NSE distribution licence.
- We ask CBK and Bank of Uganda in writing for permission before redistributing their tables through a paid API.
- We describe and never recommend, and get a lawyer's written view on the CMA investment-adviser line before the first invoice.

**The first ten paying customers.** Founder-led, by name, once you lift D-034:
- Sixty named institutions.
- Forty conversations through people you know, SACCO and trustee forums, and LinkedIn from your own account.
- Every conversation ends with a sample pack carrying their name, delivered within 24 hours, before their next board meeting.
- Close at a founding-member price (KES 12,000 a month locked for two years, first ten only) on an annual invoice.
- One trustee or SACCO board training session (KES 200,000) as a paid door-opener into an association's members.
- Ask every paying client for one introduction at month three.

**What would convince me to invest further:**

| Evidence by day 90 | Evidence by month 6 |
|---|---|
| 10 institutions paying (at least KES 300,000 a month booked) | No cancellations at the first renewal |
| At least 2 on the KES 45,000+ Treasury Desk | Production under 2 hours a customer a month |
| At least 7 of 10 confirm the pack was used at a board or committee meeting | At least 3 customers arrived through a referral |
| Sales cycle under 45 days from first conversation to invoice | — |
| A lawyer's view that the product is information, not licensed advice | — |

With that evidence I would hire the analyst, automate the pack and open Uganda and Tanzania. Short of it, by the kill lines in K, I would stop selling to institutions and run the site as a media asset.

---

## Appendix A. Six concepts scored

Scores run from 1 (bad) to 5 (good). The total is unweighted; regulatory risk is scored so that 5 means low risk.

| Concept | Pain | Willingness to pay (evidence) | Legal data access | Defensibility | Speed to revenue | Fits what exists | Regulatory risk | Total | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| **Decision Desk** (Treasury Desk / IC Pack for institutions) | 4 | 3 (institutions pay ~KES 117k a year for NSE data [O41]; untested for us) | 4 | 3 | 4 | 5 | 3 | **26** | **Launch first** |
| Alerts / APIs (global data licence) | 3 | 2 (35 contacts, 0 replies [V]) | 3 | 3 | 2 | 5 | 4 | 22 | Keep, inbound only |
| Economic Pulse (free macro and markets content) | 2 | 1 | 4 | 2 | 2 | 5 | 4 | 20 | Marketing for the Desk, not a product |
| Mwananchi Money Intelligence (consumer tools) | 4 | 1 (news paywalls KES 250–500 a month [O47–O49]) | 4 | 2 | 1 | 4 | 3 | 19 | Paused by the founder (22 Oct); audience builder later |
| Opportunity Radar (tenders, investments, regulation) | 3 | 1 (rivals at KES 800–3,000 a month; free official portals; name taken [O20][O21]) | 5 | 1 | 2 | 2 | 4 | 18 | No (D-002 confirmed); a weekly "who won what" story at most |
| Company Intelligence | 3 | 2 | 1 (CR12 at KES 650 each, no bulk; beneficial ownership not public; DPA limits [O29–O34]) | 2 | 1 | 1 | 2 | 12 | No |

## Appendix B. Legal and regulatory obligations

This summarises the regulatory scan of 28 Oct 2026. It is research, not legal advice.

**Kenya:**
- **Capital Markets Act Cap 485A:**
  - s.2 defines an "investment adviser" to include issuing analyses or reports on securities for pay as a regular business.
  - s.23 requires a licence for that business.
  - The newspaper-proprietor exclusion needs a Books and Newspapers Act permit, and is weakened by the 2022 amendment. **Lawyer needed.**
- **CMA public cautions** (11 Sep 2026 and May 2026): there is no finalised influencer rulebook. Check every named fund or broker against the CMA register.
- **Data Protection Act 2019:**
  - s.18 registration: exempt only below KES 5m turnover **and** under 10 staff. Firms "mainly in direct marketing" must register whatever their size.
  - s.37 direct marketing: consent and opt-out.
  - s.48 cross-border transfer safeguards.
  - s.63 fines: up to KES 5m or 1% of turnover.
- **Media Council Act 2013:** accredit editorial staff and adopt the Code.
- **Copyright Act 2001:**
  - Compilations are literary works, but bare facts are not protected.
  - There is no database right.
  - s.26 fair dealing covers reporting with acknowledgement.
- **Computer Misuse and Cybercrimes Act ss.22–23** (false publication): struck down by the Court of Appeal on 6 Mar 2026; an appeal is at the Supreme Court. Keep the correction log.
- **Consumer Protection Act s.12:** label sponsored content.
- **Data owners:**
  - CBK: no open licence; attribute, and ask in writing before commercial redistribution.
  - NSE: a distribution licence is needed.
  - BoU: written permission is needed.
  - CBN: reuse is allowed with attribution, unaltered.

**Nigeria:**
- ISA 2025 and SEC warnings on influencers.
- NDPA 2023: registration as an entity "of major importance" above 200 data subjects in 6 months.

**South Africa:**
- FAIS s.1: "advice" excludes factual and objective information.
- POPIA s.69 opt-in for electronic marketing.

**Where information ends and advice begins:**

| Information (safe if done carefully) | Advice (licence risk) |
|---|---|
| Reporting results | "What *you* should buy or sell" |
| Explaining instruments | Personalised replies |
| Side-by-side published yields with source and date, unranked | Model portfolios |
| General commentary | Paid buy/sell ratings |
| Data feeds | Any fee or commission from a product we write about |

**Disclaimer** (for /pack, /trust and every pack footer):
> "Afronomics Feed publishes general financial information and journalism. It is not investment, legal or tax advice and does not consider your personal circumstances. Afronomics is not licensed by the Capital Markets Authority as an investment adviser. Past yields do not guarantee future returns. Verify any provider on the CMA/CBK registers and consult a licensed adviser before investing. Data: CBK and others as cited; provided 'as is'."

**Five points for the lawyer:**
1. Does the Cap 485A exclusion survive the 2022 amendment, and does it cover a digital publisher?
2. Is a paid institutional pack, or a factual benchmark, "investment adviser" business?
3. CBK, NSE and BoU reuse terms for a paid API.
4. DPA s.48 transfer contracts.
5. Nigerian and South African registration if we sell there.

## Appendix C. Sources

**Kenyan market size:**
- [S1] SASRA SACCO Supervision Annual Report 2025, as summarised at https://paybillke.com/news/sasra-sacco-supervision-annual-report-2025: 357 regulated SACCOs, 179 deposit-taking, 34 with at least KES 10bn. Licensing notices give 176–178 (https://thekenyatimes.com/business/sasra-names-saccos-barred-from-operating-in-kenya/). **Check against the SASRA report itself.**
- [S2] RBA, "Kenya's pension assets rise to Ksh2.81 trillion in 2025", https://www.rba.go.ke/kenyas-pension-assets-rise-to-ksh2-81-trillion-in-2025. The scheme count (1,032 schemes, 197 with more than KES 1bn) is from Capital FM, Sep 2025: https://www.capitalfm.co.ke/business/2025/09/enwealth-pension-fund-up-49pc-to-sh1-056bn
- [S3] CMA, 47 licensed fund managers (Sep 2025), https://www.cma.or.ke/?p=6135. CIS assets of KES 948.7bn at 30 Jun 2026 are from https://khusoko.com/?p=53863 (secondary; to be confirmed against the CMA quarterly report). KES 851.7bn at Mar 2026 is from https://dealroom.co/news/144830-kenyas-cma-clears-eight-new-funds-as-industry-assets-hit-ksh-851-7b/

**Competitors (C):**
- [C1] https://connect.neugroup.com/public/blogs/bloomberg-terminals-how-much-more-youll-pay-next-year
- [C2] https://www.mfw4a.org/news/african-development-bank-and-bloomberg-collaborate-african-bond-index
- [C6] https://www.rfp.wiki/investment/capital-markets-software/calypso/lseg
- [C7] https://www.lseg.com/en/data-catalogue/fixed-income/pricing/exchange-traded-bond-johannesburg-stock-exchange-jse
- [C8] https://www.parametasolutions.com/wp-content/uploads/2026/06/260610_ICAP_Africa_Factsheet_LSEG.pdf
- [C11] https://techcabal.com/2023/10/04/stears-pivot-b2b/
- [C14] https://techcabal.com/2022/10/11/nigerian-data-and-intelligence-company-stears-raises-3-3-million-to-solve-africas-data-dearth/
- [C15] https://www.kilwa.io/platform
- [C17] https://cbonds.com/intro/
- [C18] https://apis.io/plans/tradingeconomics/tradingeconomics-plans-pricing/
- [C21] https://mansaapi.com/blog/african-central-bank-rates-api-launch
- [C23] https://mansaapi.com/
- [C26] https://mansamarkets.com/developers
- [C32] https://tellimer.com/about
- [C36] https://x.com/BD_Africa/status/2104769889928184053
- [C37] https://mwangocapital.substack.com/about
- [C41] https://www.bog.gov.gh/gog_auction_results/
- [C42] https://www.cbe.org.eg/en/auctions/egp-t-bills
- [C43] https://www.bankofbotswana.bw/content/government-securities
- [C44] https://www.dmo.gov.ng/fgn-bonds/nigerian-treasury-bills
- [C45] https://www.mfw4a.org/blog/african-financial-markets-initiative-afmi-hosts-annual-local-currency-bonds-and-financial
- [C49] https://cepr.org/voxeu/columns/africas-domestic-debt-boom-new-evidence-african-debt-database
- [C50] https://nachrichten.idw-online.de/2025/10/16/new-database-brings-transparency-to-africas-public-debt

**Opportunity, company intelligence and willingness to pay (O):**
- [O2] Kenya PPIP open data (OCDS), https://data.open-contracting.org/en/publication/147
- [O20] https://www.progigfinder.com/business/tenders
- [O21] "OpportunityRadar" on Selar, https://selar.com/8j92y13833
- [O29] BRS fee schedule, https://brs.go.ke/fee-schedule-companies-registry/
- [O32] https://www.afriwise.com/blog/access-to-beneficial-ownership-information-in-kenya-private-companies
- [O34] DP General Regulations 2021, https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-GENERAL-REGULATIONS-2021-1.pdf
- [O41] NSE dataset pricing (2021), https://peopledaily.digital/business/cma-invites-discourse-on-nse-data-set
- [O47] https://www.kenyans.co.ke/node/62009
- [O48] https://subger.com/el/service/nation-ke
- [O49] https://subger.com/en/service/nation-ke-premium
- [O52] https://my.motherbase.ai/company/54411-the-kenyan-wall-street
- [O54] https://mwangocapital.substack.com/about

**Legal (B):**
- Capital Markets Act, https://kenyalaw.org/akn/ke/act/1989/17/eng@2025-12-11
- CMA caution, https://www.cma.or.ke/public-caution-against-investment-scams/
- Data Protection Act, https://www.odpc.go.ke/wp-content/uploads/2024/02/TheDataProtectionAct__No24of2019.pdf
- ODPC FAQs, https://www.odpc.go.ke/faqs/
- Copyright Act, https://www.wipo.int/wipolex/en/text/506082
- Cybercrimes ruling, https://bowmanslaw.com/insights/kenya-court-of-appeal-upholds-cybercrime-law-but-strikes-down-fake-news-offences/
- CBK disclaimer, https://www.centralbank.go.ke/privacypolicy/
- NSE vendors, https://www.nse.co.ke/dataservices/nse-licensed-information-vendors/
- BoU copyright, https://bou.or.ug/bouwebsite/RelatedPages/copyright.html
- CBN legal, https://www.cbn.gov.ng/Legal.html
- FAIS advice, https://fia.org.za/2019/07/08/when-does-conduct-constitute-financial-advice/
- POPIA direct marketing, https://www.cliffedekkerhofmeyr.com/en/news/publications/2025/Sectors/Technology-Communications/Technology-and-Communications-Alert-29-january-Navigating-the-Information-Regulators-guidance-note-on-direct-marketing

**Caveat on the research:** the session's network policy blocked direct fetches of several primary sites (kenyalaw.org, cma.or.ke, odpc.go.ke, centralbank.go.ke, kilwa.io and others). The figures above come from search-indexed copies and need a direct check before they go into a sales document.
