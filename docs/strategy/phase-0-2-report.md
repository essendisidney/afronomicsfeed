# Afronomics Feed: Phase 0–2 report (audit, money map, wedge)

Prepared 12 Oct 2026 for the founder's decision. **Nothing in production was changed to produce this report.** The
Wednesday money sprint, which shipped code on its own, was paused pending approval.

Labels: **VERIFIED** (source named), **ESTIMATED** (reasoning given), **ASSUMED** (to be tested).

---

## 1. What exists today: the facts (VERIFIED from our own database and repository, 12 Oct 2026)

| | Value |
|---|---|
| Revenue collected | **USD 0** (one payment, status "test", KES 200) |
| Paying customers, signed contracts, leads, pilot keys | **0, 0, 0, 0** |
| Readers | 88 people since 7 Oct, when counting of people began; 409 page views since 30 Sep; 89 returning views (30 days) |
| Where readers come from (30 days) | direct 306 views; LinkedIn about 80 views; Google 10; ChatGPT 10; email 2 |
| Readers' countries (30 days) | US 25, Kenya 25, Nigeria 11, Sweden 6, then 1–2 each |
| Email list | 3 subscribers; 0 rate-alert, 0 tender-alert sign-ups |
| Reader-report tools (prices, pay, rent, loans) | 1 report in total |
| API use (30 days) | 144 calls; 136 from one Irish address on 3 days (not identified, possibly a bot) |
| Payments | Paystack live key set (verified 12 Oct via the tender-alert sender) |
| Site | 97 pages, 41 API routes, 72 components, 28 Python data readers, 33 database migrations, 202 commits since 30 Sep 2026 |
| Code dependencies | 6 runtime packages (Next.js 16, React 19, markdown) — very lean |
| Repository | **public** on GitHub |
| Automated tests | none (type-check, lint and build only) |
| Security headers in code | none set (CSP, frame, referrer policy); live headers not yet checked |

Not verified, so not used: LinkedIn and Telegram follower counts, Google Search Console data, Vercel and Supabase
plan costs.

---

## 2. Phase 0 audit: KEEP / IMPROVE / PARK / RETIRE

Run cost is ESTIMATED unless stated. Revenue link: **W** = serves the chosen wedge, **L** = later revenue path, **–** = none.

### KEEP (works and serves the business; leave alone)

| Item | What it is | Cost to run | Contributes | Link |
|---|---|---|---|---|
| African auction data pipelines | 10 central banks' T-bill auctions (16,276 results in standard tenors, back to 2000 in places), Kenya bonds (388 since 2010), policy rates (9), MMF yields, CBK loan-app directory (281) | GitHub Actions, free on a public repo; about 7–20 min a run | The core asset; nobody else we found publishes it as one checked feed | **W** |
| Data health checks and /status | Flags late or unread figures after every run (now: 3 late, 1 gap) | ~0 | Trust, which institutions buy | **W** |
| Open API v1, keyed API with usage per key | Free API; keys count calls | ~0 | Pilot delivery and usage evidence | **W** |
| /method, /reference, /corrections | Open methodology and a public corrections log | ~0 | Trust and citability | **W** |
| Kenya auction tool | Likely range before the auction, "did my bid win?" after | ~0 | Shows the data's analytical use | **W/L** |
| Desk and command centre | Owner view: traffic, money, pipeline (deals table added 12 Oct) | ~0 | The founder's single view | **W** |
| Paystack integration | Checkout, webhook, receipts, idempotent recording | % of sales only | Ready to bill | **W/L** |
| Story engine with checker | Finds data stories, blocks unsourced numbers and advice | ~0 | Content without fabrication | **L** |
| Telegram channel and bot | Auto-posts results; answers /tbills, /kenya etc. | ~0 | A small distribution channel | **L** |
| Brand and visual identity | Name, typography, palette, voice ("Information, not advice") | – | Credibility | all |

### IMPROVE (valuable but weak)

| Item | Problem | Fix | Why |
|---|---|---|---|
| Bond auction coverage | Kenya only; the wedge's buyers track bonds | Add Nigeria (DMO), Egypt, Uganda, Zambia, Ghana bond auctions, from official sources, in the order pilots ask | The wedge's main product gap |
| Repository visibility | Public: the full dataset, history and readers can be copied free | Founder decision: make it private (Actions then needs a paid allowance, ESTIMATED USD 20–40 a month), or keep public and sell freshness, history API, SLA and support | Protects the moat |
| Automated tests | None; an institutional feed needs proven correctness | Tests on each reader against saved releases, plus checks on totals | Pilots will test accuracy |
| Security headers | None set in code | CSP, frame-ancestors, referrer and permissions policies (verify what Vercel adds) | Institutional security reviews |
| Search visibility | Google sent 10 views in 14 days; sitemap is valid and verified | Search Console follow-up; pages that answer buyers' questions | The cheapest acquisition channel |
| Commercial pages | 5 overlapping pages (/pricing, /prices, /pack, /licensing, /data-api, /for-institutions) and 16 checkout plans; none ever sold | One institutional page and one consumer price page; keep plans in code | A buyer should find one clear offer |
| Data freshness | NCBA MMF stale since Aug, Zimele unchanged, Malawi late | Fix or mark; already flagged publicly | Trust |
| Eurobonds | 2 countries only | Expand only if pilots ask | – |
| Lead capture | 0 leads ever; Pack enquiries were silently dropped until 12 Oct (fixed) | Watch the first leads end to end | – |

### PARK (not useful now; freeze, keep live, stop promoting; nothing deleted)

| Item | Why park | Evidence |
|---|---|---|
| Pay check, rent check, reader price reports, loan-cost scorecard | Crowd-sourced; need traffic we don't have | 1 report ever across all four |
| Tender alerts (/tenders) | Open data is a monthly snapshot (97 open); the live list blocks automation | Read 12 Oct |
| Consumer Pro, Investment Committee Pack, WhatsApp alerts, widgets, fund and SACCO listings, jobs, benchmarking | No buyers yet; each needs audience or sales time | 0 sales |
| Chama hub, Diaspora desk, Learn (multilingual), Radio, Ask, Signals | Low traffic; maintained by automation at no cost | 0–2 people each in 30 days |
| News sections (/news wire, /economy, /technology, /climate, /capital, /trade) | Headline aggregation; little traffic, no differentiation | /trade 3 people in 30 days |
| Money-transfer referral links | No affiliate programme registered | 2 clicks in 30 days |
| LinkedIn company-page routines (daily) and the 5 tool-launch posts from 13 Oct | Main traffic source today; keep, but point them at the wedge | ~80 LinkedIn views in 30 days |

### RETIRE (proposals only; nothing removed without approval)

None meets the bar today: the default stance is to preserve, and nothing parked costs real money. Two items to
consider later:
1. Hide from navigation, not delete, pages that show empty crowd data (pay/rent/loan scorecards). An institutional
   visitor who sees "no data yet" may judge the whole site by it.
2. Retire the duplicate price page /prices in favour of /pricing once one consumer price page exists.

---

## 3. Phase 1: where the money for African intelligence flows

| Buyer | Pays today for | To whom, how much | Underserved where |
|---|---|---|---|
| EM and frontier debt investors (global asset managers, hedge funds) | Terminals, sell-side research, local brokers | Bloomberg about USD 32k a user a year ([NeuGroup](https://connect.neugroup.com/public/blogs/bloomberg-terminals-how-much-more-youll-pay-next-year), VERIFIED); LSEG seats from hundreds to low thousands a year, deals far higher ([CostBench](https://costbench.com/compare/factset-vs-refinitiv-eikon/), third-party, ESTIMATED) | African primary-auction detail is scattered across central-bank PDFs; JPMorgan's GBI-EM Edge (Africa about 44.5%) makes it newly necessary ([Reuters via Kitco](https://www.kitco.com/news/off-the-wire/2026-09-14/jpmorgan-launch-frontier-market-local-currency-debt-index-month-end), VERIFIED as reported) |
| Corporates, insurers, NGOs, governments (political and country risk) | Country risk services, newsletters | EIU: a US Treasury award of about USD 58k for 10 licences; library subscriptions up to USD 80k a year ([CRL/procurement records](https://www.govconinabox.com/explore/contractors/profile/the-economist-intelligence-unit-na-incorporated-jbmwbg), VERIFIED); Africa Confidential about GBP 900–1,000 a year, mostly institutional ([GIJN](https://gijn.org/stories/how-africa-confidential-covers-the-continent-with-a-subscription-model-that-works/), VERIFIED) | Crowded; incumbents trusted; needs analyst depth |
| Investors in African tech and startups | Deal and company data | Briter from USD 29.99 a user a month to enterprise with API ([Briter](https://www.briter.co/pricing), VERIFIED) | Served |
| African institutions (banks, DFIs, consultancies) | Custom research, macro data | Stears: UNDP, EIB, Citibank Nigeria as clients; USD 3.3m seed ([Tech In Africa](https://www.techinafrica.com/nigerian-data-company-stears-transition-into-b2b-intelligence-solutions/), [TechCabal](https://techcabal.com/2022/10/11/nigerian-data-and-intelligence-company-stears-raises-3-3-million-to-solve-africas-data-dearth/), VERIFIED); prices not public | Partly served; custom work does not scale for one person |
| Local pension funds, SACCOs, fund managers | Investment consultants, broker research | Kenya: about 1,000 pension schemes, 47 licensed fund managers ([The Star](https://www.the-star.co.ke/business/kenya/2025-11-20-rba-marks-25-years-of-pension-milestones), [CMA](https://www.cma.or.ke/?p=5818), VERIFIED); prices not public | Real need for monthly committee packs; small tickets |
| Retail investors and households | News subscriptions, free broker research | Business Daily about KES 350 a month (third-party tracker, ESTIMATED); Proshare Premium NGN 7,500 a month ([Proshare](https://proshare.co/Home/PricePlan), VERIFIED); Stears consumer USD 100 a year (2022) | Low willingness to pay; needs audience in the hundreds of thousands |
| SMEs bidding for government contracts | Tender alert services | Prices not verified | Our data source is monthly; parked |

**The gap that hurts enough to pay this quarter:** frontier local-debt investors now benchmarked to an index that is
nearly half African, watching auctions released in a dozen formats on a dozen sites. They already pay tens of
thousands a seat for terminals, so a USD 1,500 a month specialist feed is a small, defensible line in their budget.

---

## 4. Revenue-mix arithmetic

### To USD 1 million a month

| Mix | Arithmetic | Verdict |
|---|---|---|
| A. Institutional subscriptions only | 400 institutions × USD 2,500 a month (USD 30k a year) | **Plausible over 6–8 years**, only by widening from local debt to more datasets (FX, fiscal, energy, trade) and countries. 400 is near the ceiling of plausible buyers (ESTIMATED 900 in the base model) |
| B. Large enterprise contracts | 40 × USD 25,000 a month (USD 300k a year) | **Fantasy for years.** Few buyers pay USD 300k a year for African data, and not to a young vendor. Possible late, for redistribution or index licensing |
| C. Mass-market paid tier | 333,000 payers × USD 3 a month, needing roughly 10–30 million monthly readers at 1–3% conversion | **Fantasy.** We have about 90 readers a week; no African publisher we found reports anything near this |
| D. Mixed (the base case) | 250 institutions × USD 2,000 = 500k; 15 enterprise × USD 15k = 225k; index and data licensing 10 × USD 10k = 100k; research projects 75k; consumer 30,000 × USD 3 = 90k; sponsorship 10k → **about USD 1.0m** | **The plausible route**, about 7 years in the base model (month 81), with about USD 1.3m raised. Concentration risk: about 75% institutional |
| E. Benchmark licensing | An African local-debt index licensed to funds (a fee per fund or basis points on assets) | **Plausible upside, long-term**: needs governed methodology (IOSCO-style), a track record and a first licensee. This is the path to a billion-dollar valuation, not to the first USD 10k |

### To USD 10 million a month (rough)
Roughly 2,000 institutions × USD 4,000 a month (USD 48k a year) = USD 8m, plus index and data licensing of about USD
2m. That is bigger than any African information company we found, and comparable to established global data
vendors. **Only plausible if Afronomics becomes the standard source for African sovereign and macro data, with
indices others license.** Ten years or more; not something to plan resources against now.

**Valuation (method, not a number):** data companies are usually valued on recurring revenue multiples, with
growth, retention and margin deciding the multiple. Until there is recurring revenue, any valuation figure is
invented, so none is given.

---

## 5. Phase 2: the wedge

> **Frontier and EM local-currency debt teams (asset managers and bank EM desks) pay USD 1,500 a month (USD 18,000
> a year) for a checked, same-day feed of African primary auction results with full history, because it helps them
> decide how much to hold, and when and where to bid, in African local-currency government debt now that GBI-EM Edge
> makes it nearly half their benchmark.**

**Why this buyer pays first.** They have budgets (terminal seats at about USD 32k a year), an urgent new need (the
index launched end-Sep 2026), and a measurable decision (allocation and bidding). The ticket is small for them.

**Why we can deliver it better or cheaper.** We already read all ten central banks automatically, with checks and a
public status page. The cost of one more customer is near zero. Incumbents bundle this inside terminals; we sell
the African depth alone, with the source document for every figure.

**How much the existing assets cover.** Bills: 6 of the 7 African index markets, with history (VERIFIED). Bonds:
Kenya only. Senegal: not covered. API, keys, usage counting, status page, method page, institutional page and pilot
form: built. **Gap:** bond auctions for Nigeria, Egypt, Uganda, Zambia and Ghana; Senegal; webhooks; Excel delivery.

**Cost to produce each month (ESTIMATED).** Data runs free on GitHub Actions (public repository); hosting within
current plans; email under Resend's free tier; AI inference for drafting small. Founder time: about 1–2 hours a week to
review data health and answer pilots. **About 90% agent-run** (extraction, checks, delivery, monitoring); the founder
owns pilot conversations, contracts and corrections.

**What it leads to.** More datasets for the same desks (FX, policy, fiscal, Eurobonds) → bank treasuries and local
pension funds (the Investment Committee Pack becomes the local version) → an African local-debt index others license.

### Wedges considered and rejected

| Wedge | Why rejected (for now) |
|---|---|
| Kenyan retail investors (Pro, KES 1,500 a month) | Low willingness to pay; needs a large audience; we have about 90 readers a week |
| Tender alerts for SMEs | Data source is a monthly snapshot; the live list refuses automation; low price |
| Money-transfer referrals | Needs traffic and affiliate sign-ups; small fees per referral |
| Investment Committee Pack for pension funds and SACCOs | A real need, but small tickets and local, founder-heavy sales. **The best second wedge** |
| Loan-app licence check and scorecard | A public good with no clear payer (later: regulators or fintech compliance) |
| Custom research and advisory | Doesn't scale for one person; keep as an add-on to licences |
| Pan-African country risk (against EIU, BMI) | Crowded; trusted incumbents; needs analyst depth we don't have |
| Sovereign Bill Index licensing | The long-term moat, but needs governance and a track record first |
| Jobs, ads, sponsorship | Need audience first |

---

## 6. Phase 3 plan: prove someone will pay (needs your approval before anything goes out)

**Assets, all existing:** /data/frontier-local-debt (coverage and pilot form), the API with keys, the status page,
the method page. To add, privately, not published: a sample pack (CSV of the last 12 months for the six index
markets, plus a two-page PDF "African local-debt auction monitor" built from the data).

**Steps.**
1. I research a list of 40 named institutions from public sources: asset managers with EM or frontier local-debt
   funds, bank EM research desks, DFIs, the largest Kenyan and Nigerian pension funds and their managers. I
   record each in the desk's deal log as "prospect", with the public reason it fits. No contact is made.
2. I draft a short, plain outreach note and the sample pack. **You approve the wording; you send** from your own
   address or LinkedIn.
3. Each reply is logged ("contacted", "qualified"). A pilot = a trial API key issued from the desk.
4. Offer: a free 30-day pilot, then either the USD 1,500 a month licence or a **paid "founding customer" pilot at USD
   500 a month for three months**, so commitment shows in money early.

**Success tests, with dates.**

| By | Test | If it fails |
|---|---|---|
| Week 2 | 25 qualified contacts sent, ≥ 5 replies | Rewrite the offer; check we reach the right people |
| Week 4 | ≥ 3 pilot keys issued; ≥ 2 used at least weekly (desk counts calls) | Ask non-users why; fix the top reason |
| Week 8 | ≥ 1 paid (any amount, recorded in `payments`) | Stop; revisit the wedge (next candidate: the pension/SACCO pack) |
| Week 12 | 2 paid licences at list price | Enough to fund the bond coverage work and repeat |

**Kill criterion.** No pilot after 25 qualified contacts, or no payment after 3 used pilots: the wedge is wrong.
Say so, log it, go back to Phase 2.

---

## 7. Moat tracking (started; baseline today)

| Moat | Measure | Today |
|---|---|---|
| Proprietary data | Markets and series covered; years of history | 10 bill markets, Kenya bonds; back to 2000 |
| Trusted method | Public corrections; citations by others | 0 corrections logged; citations not tracked yet |
| Embeddedness | Customers using the API weekly | 0 |
| Margins | Gross margin on delivered data | n/a (no revenue) |
| Net revenue retention | | n/a |
| Revenue per founder hour | | 0 |

---

## 8. Decisions waiting on you

1. **Approve the wedge** (or choose another from section 5).
2. **Approve Phase 3**: the prospect research (no contact) and the outreach draft, which you would send yourself.
3. **Repository visibility**: keep public, or make private (ESTIMATED USD 20–40 a month for automation).
4. **Paused items**: the Wednesday money sprint (paused). The 5 tool-launch posts to the LinkedIn company page from
   13 Oct, and the Telegram launch queue, were approved earlier and are still scheduled; keep or pause?
5. **Already live before this directive (12 Oct):** tender alerts with Paystack, the frontier-local-debt page, the
   command centre. Keep as they are (my recommendation), or roll back any.
