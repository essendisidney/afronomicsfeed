# Afronomics: the path to USD 1 million a month

Written 12 Oct 2026. Re-read and update monthly. The live numbers are on the desk's command centre (/desk), the model is
`docs/strategy/afronomics-financial-model.xlsx` (regenerate with `python scripts/financial_model.py`).

## Where we actually are (12 Oct 2026)

| Measure | Value | Source |
|---|---|---|
| Revenue collected | USD 0 (one test payment) | `payments` table |
| Signed contracts | 0 | `deals` table (new) |
| Paying subscribers | 0 | `paid_subscriptions` |
| Commercial leads | 0 | `leads` |
| Outside readers | about 70 a week; Google sent 10 page views in 14 days | `page_views` |
| Payments | Paystack live key set (verified 12 Oct) | tender-alert sender reports `paid: true` |

Nothing below is revenue. Every forecast is an assumption written down so it can be replaced by evidence.

## The strongest first product: African local-currency government debt data

**The problem a specific buyer pays to solve.** JPMorgan's frontier local-currency bond index (GBI-EM Edge), launched at
the end of September 2026, covers about USD 330 billion across 26 countries, and African markets carry about 44.5%
of its weight: Egypt at the 8% cap, Nigeria 7.4%, Kenya 6.9%, Uganda 4.8%, Zambia, Ghana and Senegal, as reported
before launch ([Reuters via Kitco](https://www.kitco.com/news/off-the-wire/2026-09-14/jpmorgan-launch-frontier-market-local-currency-debt-index-month-end),
[CNBC Africa](https://www.cnbcafrica.com/2026/jpmorgan-to-launch-long-awaited-frontier-local-currency-debt-index),
[Enterprise](https://enterpriseam.com/egypt/2026/09/16/jpmorgans-new-frontier-index-gives-egypt-its-biggest-possible-weighting/)).
Every fund benchmarked to it now has to follow African primary auctions it rarely had to watch closely. The
releases are scattered across a dozen central-bank websites in PDFs, images and tables in different formats.

**Why Afronomics can win it.** We already read and check every primary T-bill auction of ten African central banks,
over 16,000 results in the standard 91-, 182- and 364-day tenors, with history back to 2000 in places, and Kenya's bond auctions since 2010. We have six of
the seven African index markets for bills today. Nobody we found publishes this as one clean, checked, documented
feed for this buyer. Bloomberg carries much of it inside a terminal at about USD 32,000 a user a year
([NeuGroup, Oct 2024](https://connect.neugroup.com/public/blogs/bloomberg-terminals-how-much-more-youll-pay-next-year)),
which is the price anchor the buyer already knows.

**The honest gap.** The index holds bonds of more than 2.5 years. We hold bond auctions for Kenya only. The first
pilots decide whether Nigeria (DMO), Egypt, Uganda, Zambia or Ghana bonds come first.

**Who pays (ideal customer, in order).**
1. Frontier and EM local-debt teams at asset managers (London, Cape Town, Johannesburg, New York, Nairobi, Lagos).
2. EM research and trading desks at banks, and African bank treasuries.
3. Development finance institutions and multilaterals tracking domestic debt.
4. Pension funds and insurers in Kenya (about 1,000 schemes under the RBA, [The Star](https://www.the-star.co.ke/business/kenya/2025-11-20-rba-marks-25-years-of-pension-milestones)) and Nigeria, and their 47 licensed Kenyan fund managers ([CMA, Sep 2025](https://www.cma.or.ke/?p=5818)).

**Price.** Data API USD 1,500 a month; redistribution and custom delivery from USD 5,000 a month (already on
/data-api). A 30-day free pilot for qualified institutions, then an annual licence.

**Comparables (evidence, not targets).** Stears (Nigeria) moved from a USD 100 a year consumer subscription to
institutional data and intelligence, with clients such as UNDP, the European Investment Bank and Citibank Nigeria,
on a USD 3.3m seed round ([TechCabal](https://techcabal.com/2022/10/11/nigerian-data-and-intelligence-company-stears-raises-3-3-million-to-solve-africas-data-dearth/),
[Tech In Africa](https://www.techinafrica.com/nigerian-data-company-stears-transition-into-b2b-intelligence-solutions/)).
Briter sells emerging-markets intelligence from USD 29.99 a user a month up to unpublished enterprise plans with API
access ([Briter pricing](https://www.briter.co/pricing)). Neither publishes revenue; no African intelligence company
we found reports anything near USD 1 million a month. That is the scale of the ambition.

## Validation before scale (the gates)

1. **Pilot gate.** 10 qualified institutions request a pilot; 5 use the key in the first 14 days (the desk counts
   calls per key). If fewer than 3 use it, the problem or the buyer is wrong: change one of them before building more.
2. **Paid gate.** 2 pilots convert to a paid licence (USD 1,500+ a month), paid through Paystack or invoice and
   recorded in `payments`. Until then, nothing is "revenue".
3. **Repeatability gate.** 10 paying institutions, logo churn under 15% a year, a sales cycle we can measure. Only
   then hire the first salesperson.
4. **Expansion gate.** Bonds for the index markets, Senegal (UMOA-Titres), then adjacent datasets the same buyers ask
   for in pilots (FX, policy rates, Eurobonds, fiscal data), then other sectors (energy, telecoms, agriculture).

Other revenue streams are kept, not expanded, until gate 2: money-transfer referrals, fund listings, tender alerts
(KES 500 a month, honest about the regulator's monthly data), jobs, sponsorship.

## The model (summary of `afronomics-financial-model.xlsx`)

Ten years, month by month, three scenarios. Revenue streams: institutional licences, research and custom work,
consumer and SME subscriptions, advertising and referrals. Costs: data delivery and AI inference (gross margin
78-82%), a team hired ahead of revenue and with revenue, sales cost per new institution, audience acquisition, fixed
costs. Institutions slow as they approach a ceiling of plausible buyers (350 / 900 / 2,000).

| | Conservative | Base | Aggressive |
|---|---|---|---|
| USD 10k a month | month 28 | month 12 | month 7 |
| USD 50k a month | month 59 | month 29 | month 16 |
| USD 100k a month | month 74 | month 39 | month 22 |
| USD 250k a month | month 105 | month 54 | month 32 |
| USD 500k a month | not in 10 years | month 66 | month 40 |
| **USD 1 million a month** | **not in 10 years** | **month 81 (about 2033)** | **month 49 (about 2030)** |
| Monthly revenue end of year 3 | USD 16k | USD 84k | USD 369k |
| Paying institutions end of year 5 | 40 | 141 | 507 |
| Capital needed before profit | about USD 1.5m | about USD 1.3m | about USD 2.8m |
| First profitable month | 91 | 58 | 47 |
| Largest stream's share (concentration) | 89% licences | 86% | 82% |

Reading it honestly:
- USD 1 million a month is reachable only if the first product works and the company then expands across datasets,
  countries and sectors, sells to hundreds of institutions, and raises capital. The base case needs about seven
  years; the aggressive case about four, and it needs outside money and a sales team early.
- The conservative case never gets there in ten years. Which case we are in will show within 6-9 months: pilot
  usage, the first paid conversions and the sales cycle replace the assumptions.
- Concentration is the main structural risk: over 80% of revenue from licences. Research, events and a strong
  consumer product are the hedge, built after gate 3.
- CAC and LTV are assumptions (CAC USD 9-12k per institution). Measure real CAC from the first ten sales.

## What is operational today (12 Oct 2026)

| Built | Status |
|---|---|
| Ten-market auction data, health checks, status page, open API, keyed API with usage per key | Operational |
| Data API and enterprise price list, Paystack checkout for all consumer and SME products | Operational (no institutional sale yet) |
| /data/frontier-local-debt: coverage by index market and a pilot request | Operational from this release |
| Founder command centre on /desk: collected vs contracted vs pipeline vs pilots, milestone ladder, deal log | Operational from this release |
| Bond auctions outside Kenya, Senegal, webhooks, Excel delivery | Not built (prototype or on request only) |
| AI newsroom with human oversight, customer-intelligence platform, enterprise CRM automation | Partly (story engine with checks, desk analytics); not yet an operating newsroom |

## What only the founder can do

- Contact prospective pilot institutions (the session does not send outreach), log each in the desk's deal form,
  and issue a trial key when one starts.
- Decide on raising capital: the base case needs about USD 1.3m before profit.
- Legal: a standard data licence agreement and pilot terms (redistribution, liability) before the first paid
  licence.
