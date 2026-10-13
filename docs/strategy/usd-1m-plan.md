# Afronomics: the path to USD 1 million a month

Written 12 Oct 2026; updated 13 Oct 2026 to match decisions D-006 to D-012 (`decision-log.md`). Re-read and update
monthly. Live numbers are on the desk's command centre (/desk). The model is
`docs/strategy/afronomics-financial-model.xlsx` and `data/strategy/model.json`, both written by
`python scripts/financial_model.py`.

Labels used throughout: **VERIFIED** = checked in our own systems or code on the date given; **ESTIMATED** =
reasoned from cited research, not measured; **ASSUMED** = a guess written down so evidence can replace it.

## Where we actually are (13 Oct 2026)

| Measure | Value | Label and source |
|---|---|---|
| Revenue collected | USD 0 (one test payment) | VERIFIED, `payments` table |
| Paying customers (institutions or readers) | 0 | VERIFIED, `deals`, `paid_subscriptions` |
| Pilots (trial keys issued) | 0 | VERIFIED, desk |
| Institutions contacted | 6, on 12 Oct 2026 | VERIFIED, desk deal log |
| Prospects researched | 55 | VERIFIED, desk deal log |
| Outside readers | about 70 a week | VERIFIED, `page_views` |
| Payments | Paystack live key set | VERIFIED (D-003) |
| Buyer pool for the debt wedge | 100–180 institutions worldwide | ESTIMATED (`competitive-landscape.md`) |
| Ceiling of the debt wedge | about USD 2–3m a year at list price | ESTIMATED (pool x ladder) |

Nothing below is revenue. Every projection is the output of assumptions, shown so it can be replaced by evidence.

## The first product: African local-currency government debt data

**The problem a specific buyer pays to solve.** JPMorgan's GBI-EM Edge (frontier local-currency government bonds,
launched end-Sep 2026) puts about 44.5% of its weight on Africa: Egypt and Morocco at the 8% cap, Nigeria 7.4%,
Kenya 6.9%, Tunisia 5.3%, Uganda 4.8%, Zambia, Ghana, Côte d'Ivoire and Angola (VERIFIED from press reports; see
`competitive-landscape.md`). The index holds bonds of more than 2.5 years, so the product is **bond auctions**, with
T-bills as short-end context. Funds benchmarked to it now have to follow primary auctions scattered across a dozen
official websites in PDFs, images and tables.

**What is live (VERIFIED, 13 Oct).** Bond auctions for Kenya, Nigeria, Egypt, Uganda, Zambia and the eight WAEMU
markets (via UMOA-Titres), from official sources, with an API and CSV for each market; T-bill auctions in ten
markets; the product page `/data/frontier-local-debt` with a 30-day pilot request; the Debt Monitor; the weekly
auction wrap; the East Africa hub. Morocco reads the newest Treasury results; its history is still being filled in.
Tunisia, Ghana and Angola are gaps, shown as gaps.

**Who pays (in order).** Frontier and EM local-debt teams at asset managers; EM research and trading desks and
African bank treasuries; DFIs and multilaterals; then pension funds, insurers and fund managers in Kenya and
Nigeria (the natural second wedge).

**Price: one ladder, one rate card** (VERIFIED, `institutionalLadder` in `lib/billing/ratecard.ts`; invoiced in
USD, never sold through checkout):

| Tier | Price | For |
|---|---|---|
| Analyst | USD 250 a month | One user: web tables and full-history downloads |
| Team and API | USD 1,500 a month | An API key, alerts, usage reporting, a named contact |
| Enterprise | from USD 5,000 a month | Redistribution, several teams, custom delivery, a service agreement |

A 30-day free pilot comes first. The ladder fills the empty USD 3–20k a year band between retail data (USD 25–120)
and terminal seats (USD 12–32k a year, ESTIMATED). Whether buyers accept it is untested.

## The D-004 test: status on 13 Oct 2026

| Step | Target | Status |
|---|---|---|
| Qualified contacts | 25 by week 2 (about 26 Oct) | **6 of 25** contacted on 12 Oct (VERIFIED). Drafts for Ninety One and Allan Gray await the founder: send or drop |
| Replies | at least 5 | 0 so far |
| Pilot keys and weekly users | at least 3 keys, 2 weekly users by week 4 | 0 |
| First payment | at least 1 by week 8 | USD 0 |
| List-price licences | 2 by week 12 | 0 |

**Kill rule (unchanged):** no pilot after 25 qualified contacts, or no payment after 3 used pilots. Next candidate
is the pension and SACCO Investment Committee Pack. No new markets until the first replies are in (D-012).

## The model (36 months from Oct 2026)

`scripts/financial_model.py` builds revenue bottom-up from the ladder, by month and scenario:

contacts → pilots (contact-to-pilot rate) → paid customers after the pilot and procurement lag → split across
Analyst, Team and API and Enterprise by an assumed mix, at list price times a realisation factor → less churn, plus
Analyst-to-Team upgrades. Contacts are capped by the buyer pool; a contact that did not pilot can be approached again
after 12 months at a lower rate. Small lines on top: custom work (a share of ladder revenue), reader Pro (KES 1,500),
newsletter sponsorship, remittance referrals. Every input, with its label and one-line basis, is on the workbook's
"Inputs" sheet.

Key inputs (all ASSUMED unless marked):

| Input | Conservative | Base | Aggressive |
|---|---|---|---|
| Buyer pool (ESTIMATED) | 100 | 140 | 180 (+150 from adjacent datasets from month 19) |
| New contacts a month | 8 | 15 | 25 |
| Contact to pilot | 6% | 12% (the D-004 bar) | 20% |
| Pilot to paid | 25% | 35% | 45% |
| Pilot-to-invoice lag | 4 months | 3 | 2 |
| Mix Analyst / Team / Enterprise | 60 / 35 / 5% | 45 / 45 / 10% | 35 / 50 / 15% |
| Average Enterprise deal | USD 5,000 | 6,000 | 8,000 |
| Share of list paid | 80% | 90% | 100% |
| Logo churn a year | 25% | 15% | 10% |

Results (model output, not revenue):

| Milestone (revenue a month) | Conservative | Base | Aggressive |
|---|---|---|---|
| USD 10k | not within 36 months | month 25 (Oct 2028) | month 5 (Feb 2027) |
| USD 50k | not within 36 months | not within 36 months | month 22 (Jul 2028) |
| USD 100k | not within 36 months | not within 36 months | not within 36 months |
| USD 250k | not within 36 months | not within 36 months | not within 36 months |
| USD 500k | not within 36 months | not within 36 months | not within 36 months |
| **USD 1m** | **not within 36 months** | **not within 36 months** | **not within 36 months** |
| Model revenue, month 12 / 24 / 36 | USD 0.6k / 1.0k / 0.9k | USD 6.7k / 9.9k / 9.1k | USD 36k / 61k / 80k |
| Paying institutions, month 36 | about 1 | about 6 | about 33 |

Reading it honestly:
- **The debt wedge alone does not reach USD 1m a month, in any scenario or any time frame.** Its ceiling is about
  USD 2–3m a year at list (ESTIMATED). It can prove that institutions pay, and fund the next step.
- The conservative case is effectively the kill rule firing: about one customer after three years. If the first 25
  contacts give no pilot, we are in it, and the plan moves to the second wedge.
- The base case plateaus near USD 10k a month because the 140-institution pool is worked through in under a year
  and re-approaches convert at half the rate. Growth beyond that needs a bigger pool, not more effort on the same one.
- The aggressive case needs capital, a seller, and a second dataset on sale by mid-2028.
- The first real numbers replace these guesses within 8–12 weeks: reply rate, pilot rate, pilot-to-paid rate, the
  tier buyers choose, and the sales cycle.

## The expansion path beyond the debt wedge (needed for USD 1m a month)

USD 1m a month is USD 12m a year: four to six times the whole debt wedge at list price. One illustrative mix that
adds up (every count and price ASSUMED; none is evidenced yet):

| Line | Arithmetic | USD a month |
|---|---|---|
| Debt wedge at deep penetration | 120 institutions x USD 1,700 blended | 204,000 |
| Adjacent datasets (FX, Eurobonds, policy rates, fiscal and issuance data) to the same and new buyers | 250 institutions x USD 1,200 | 300,000 |
| Enterprise redistribution and index licensing (a licensable auction-yield index) | 15 contracts x USD 10,000 | 150,000 |
| Marketplace distribution (Bloomberg App Portal, LSEG, Snowflake), our share | | 100,000 |
| Second wedge: pension, SACCO and fund-manager Investment Committee Pack (Kenya about 1,000 schemes, VERIFIED; Nigeria) | 400 x USD 300 | 120,000 |
| Custom data and research projects | | 80,000 |
| Readers, sponsorship, remittance referrals | | 50,000 |
| **Total** | about 800 paying institutions plus channels | **about 1,004,000** |

What that implies:
- **Buyer count.** About 800 paying institutions against a debt-wedge pool of 100–180: at least four new pools
  must open (adjacent datasets, local institutions, index licensing, marketplaces). Each is a separate test with its
  own evidence gate.
- **Time.** At the aggressive model's best pace (about one new institution a month in year 3, then a sales team),
  800 customers is a 6–8 year build, not 36 months.
- **Capital and team.** A sales team, data engineers for each new dataset, and legal work on redistribution and index
  licences. Raising capital is a founder decision; nothing here assumes it is done.
- **Concentration.** No line above is more than 30% of the total; the debt wedge would be about 20%.

## Gates (unchanged in spirit; numbers from the ladder)

1. **Pilot gate.** 25 qualified contacts, at least 3 pilots, 2 weekly users (D-004).
2. **Paid gate.** At least 1 payment by week 8, 2 list-price licences by week 12, recorded in `payments`. Until then,
   nothing is revenue.
3. **Repeatability gate.** 10 paying institutions, logo churn under 15% a year, a measured sales cycle. Only then
   hire a seller.
4. **Expansion gate.** Open the next pool (adjacent datasets or the second wedge) only on evidence that existing
   customers or pilots ask for it.

Consumer tools stay parked (D-001); tenders stay parked (D-002); no consumer paywall (D-007).

## What is verified and what is assumed

| Verified (VERIFIED) | Estimated (ESTIMATED) | Assumed (ASSUMED) |
|---|---|---|
| USD 0 collected; 0 customers; 0 pilots | Buyer pool 100–180 institutions | Contact-to-pilot and pilot-to-paid rates |
| 6 institutions contacted on 12 Oct; 55 prospects | Wedge ceiling USD 2–3m a year at list | Tier mix and average Enterprise deal |
| Ladder prices: USD 250 / 1,500 / from 5,000 | Terminal seat prices (USD 12–32k a year) | Churn, upgrades, sales cycle |
| Bond coverage: Kenya, Nigeria, Egypt, Uganda, Zambia, WAEMU | Edge weights (as reported by the press) | Reader growth, sponsorship, referrals |
| About 70 outside readers a week | | Everything in the expansion table; all costs |

## What only the founder can do

- Send or drop the Ninety One and Allan Gray drafts; reach 25 qualified contacts; log each reply on the desk.
- Choose the outreach route: drafts the founder sends, or automatic sending.
- Legal: the Kenya CIS advertising check (LN 173/2023), a standard data licence and pilot terms.
- Repository visibility; whether to re-enable the weekly sprint; whether to raise capital.
