# Competitive landscape (rewritten 13 Oct 2026)

Supersedes the 12 Oct version. Read with `usd-1m-plan.md` and the rate card (`lib/billing/ratecard.ts`).

**Labels.** **VERIFIED** = from the cited URL (a search extract unless noted; WebFetch could not reach cbonds.com or
tradingeconomics.com on 13 Oct, so re-open those pages before quoting externally). **REPO** = counted from our own
files on 13 Oct. **ESTIMATED** = third-party estimate or our reasoning, stated. **UNVERIFIED** = carried from the
12 Oct pass or common knowledge, with no URL found today. No price, revenue or customer count here is invented: where
a vendor publishes none, the cell says "by quote".

## 1. Our position today (REPO, counted 13 Oct 2026)

| What | Fact | Where |
|---|---|---|
| Primary-auction results held | about 22,300 rows across 17 auction files | `data/*/*auction*.json` |
| Bond-auction markets | 13: Kenya (388 rows, from 2010), Nigeria (395, from 2013), Egypt (1,578, from 2004), Uganda (87, from Nov 2024), Zambia (43, from Dec 2025), Morocco (29, from Dec 2025), and 7 WAEMU issuers via UMOA-Titres (Côte d'Ivoire 588 rows, Mali 259, Senegal 239, Burkina Faso 217, Niger 170, Togo 91, Benin 61; OAT and BAT, from Sep 2022). Guinea-Bissau: 0 rows | `lib/data/sovereign-bonds.ts`, `data/waemu/auctions.json` |
| Bill-auction markets | 10 direct (Kenya, Nigeria, Ghana, Uganda, Tanzania, Egypt, South Africa, Zambia, Malawi, Mozambique; South Africa from 2000, Egypt from 2002) plus WAEMU BATs | `lib/data/sovereign-bills.ts` |
| Distinct countries with primary-auction data | 18 | above |
| Fields per row | offered, received, accepted, bid-to-cover, weighted/marginal rate, min/max, coupon, maturity, ISIN where published, **source URL on every row** | `BondRow` type |
| Delivery | open JSON API `/api/v1/bonds/[market]`, `/api/v1/tbills/[country]`, `/api/v1/measures`, `/api/v1/index`; CSV; keyed Team API on the ladder | `app/api/v1` |
| Freshness monitoring | `data/health.json`: 33 ok, 5 late, 1 gap, 0 failed on 13 Oct | REPO |
| Adjacent data | Nigeria Eurobond closes (DMO), policy rates (9 markets), MPC calendar, remittance corridors, Kenya MMF/SACCO rates | `data/` |
| Commercial traction | USD 0 collected, 0 paying, 0 pilots live; 21 institutions offered a 30-day pilot on 12–13 Oct | `usd-1m-plan.md`, desk |

**GBI-EM Edge fit.** Africa is about 44.5% of the index: Egypt 8, Morocco 8, Nigeria 7.4, Kenya 6.91, Tunisia 5.32,
Uganda 4.84, Zambia 0.52, Ghana 0.27, plus Côte d'Ivoire and Angola (VERIFIED,
[BusinessDay](https://businessday.ng/companies/article/africa-takes-44-5-of-jpmorgans-new-328bn-frontier-bond-index/),
[Nairametrics](https://nairametrics.com/2026/09/14/j-p-morgan-includes-nigeria-in-new-emerging-market-bond-index-with-7-4-weight/)).
We hold bond auctions for markets carrying at least **35.7 of those 44.5 points** (Egypt, Morocco, Nigeria, Kenya,
Uganda, Zambia) plus Côte d'Ivoire (weight not published). **Missing: Tunisia (5.32), Ghana bonds (0.27), Angola.**

## 2. Competitor map

"Primary auctions" = do they sell structured, per-auction bill/bond results (offered, bid, accepted, cut-off)?

### 2a. Global terminals and data vendors

| Competitor | Sells / to whom | Price (public?) | Primary auctions | Speed | API | Weakness we attack |
|---|---|---|---|---|---|---|
| **Bloomberg** | Terminal to every buy-side desk | Not published; about USD 28–32k a seat a year, 2-year minimum (ESTIMATED, [CostBench](https://costbench.com/software/financial-data-terminals/bloomberg-terminal/), [Eulerpool](https://eulerpool.com/blog/bloomberg-terminal-cost)) | Runs the auction *system* for SA fixed-rate bonds and Mauritius ([SA Treasury](https://investor.treasury.gov.za/Debt%20Operations%20and%20Data/), [Bloomberg/BoM](https://www.bom.mu/sites/default/files/bloomberg_bank_of_mauritius_ebond_launch_release_2018_final.pdf)); calculates the AfDB African bond index ([AfDB](https://www.afdb.org/en/news-and-events/the-african-development-bank-announces-expansion-of-its-african-bond-index-16944/)). A harmonised cross-Africa auction-results screen: **UNVERIFIED** (none found) | Real-time where it is the venue | Yes, priced separately, "often six figures" for licensing (ESTIMATED, CostBench) | Small-market auction history is thin or uneven (UNVERIFIED); price; no source document per figure |
| **LSEG Workspace** | Terminal, feeds (carries ICAP/Parameta Africa OTC) | Not published; about USD 22k a seat, thinner configs from about USD 3.6k (ESTIMATED, [rfp.wiki](https://www.rfp.wiki/investment/capital-markets-software/calypso/lseg)) | UNVERIFIED | Real-time OTC | Yes | Same as Bloomberg |
| **S&P Capital IQ** | Fundamentals, credit | By quote | UNVERIFIED (not its focus) | n/a | Yes | Not a local-debt tool |
| **Cbonds** | Bond reference DB (1m+ bonds, 350+ price sources), web, Excel add-in, API | By quote; 7-day trial; prospectuses Premium-only ([cbonds.com](https://cbonds.com/bonds/210179/), [cbonds.hk](https://cbonds.hk/subscription/)) | Has SA and Uganda government bond pages; some fields greyed "not available within the selected subscription" (VERIFIED, search extract) | Daily | Yes | Bond-by-bond reference, not an auction tape; small-market fields paywalled and patchy. **Closest substitute; also a possible data customer** |
| **Trading Economics** | Macro indicators, headline 10-y yields; API | Standard about USD 149–199 a month, Professional about USD 299, Enterprise custom; only Full-API plans allow redistribution (ESTIMATED, figures conflict: [apis.io](https://apis.io/plans/tradingeconomics/tradingeconomics-plans-pricing/), [TE pricing](https://id.tradingeconomics.com/api/pricing.aspx)) | No: headline yields/indicators, not per-auction results (ESTIMATED from product description) | Daily | Yes | No offered/bid/accepted, no per-tenor auction detail, no source link per point |
| **CEIC / EMIS / Haver / Macrobond** | Macro time series | By quote (UNVERIFIED) | Monthly aggregates (UNVERIFIED) | Monthly | Yes | Lag; aggregates |
| **Tellimer** | Insights platform: research for 170+ EM/frontier markets, monthly end-of-month EM bond prices (with 7 Chord), AI tools ([Tellimer](https://tellimer.com/about), [fi-desk](https://www.fi-desk.com/tellimer-launches-end-of-month-emerging-market-bond-pricing-data/)) | Not published (no price found) | No (monthly secondary prices, mostly hard-currency; ESTIMATED) | Monthly | Not found | Monthly, not auction-level. **Best distribution partner, not a rival** |
| **JPMorgan / FTSE / S&P / Bloomberg-AfDB indices** | Benchmarks | Licensed | Index-eligible universe only | Daily | Via terminals | We should not build a rival index yet; we *feed* index-aware users |

### 2b. Country risk and macro research

| Competitor | Sells / to whom | Price | Primary auctions | Weakness we attack |
|---|---|---|---|---|
| **Fitch Solutions / BMI** | Country risk and industry reports, 200 markets ([BMI](https://bmiresearch.com/)) | Single Africa report USD 1,390 list (VERIFIED but old, ~2020, [BMI Africa](https://your.bmiresearch.com/africa)); subscriptions by quote | No (narrative and forecasts) | Narrative, not data; slow cycle |
| **Oxford Economics Africa** | Forecasts for 54 African countries to 2050; free trial on request ([OE](https://www.oxfordeconomics.com/service/subscription-services/macro/africa-forecasting-service/)) | By quote | No | Model forecasts, not market prints |
| **Capital Economics Africa** | 15 countries, 3–4 publications a week, archive, economist access ([CE](https://www.capitaleconomics.com/africa-economics)) | By quote; 10 free credits on trial | Writes an "Africa Markets Monitor" (narrative, [CE](https://www.capitaleconomics.com/clients/publications/africa-economics/africa-markets-monitor/africa-a-weak-month-for-local-markets)) | No downloadable auction tape; WAEMU and small markets absent from its 15 |
| **EIU, Control Risks** | Country risk | EIU up to about USD 80k a year (UNVERIFIED, 12 Oct pass) | No | Not our fight |
| **Standard Bank Research** | *Africa Markets Revealed*: 2-year forecasts for 21 economies, FX/fixed-income trade ideas ([Standard Bank](https://corporateandinvestment.standardbank.com/cib/global/insights/african-markets-revealed)) | Bundled with client relationship | Commentary on auctions | Bank research is bundled with trading; **they are buyers/partners** |
| **Absa / OMFIF AFMI** | Annual Africa Financial Markets Index, 29 countries, 50+ institutions surveyed ([OMFIF](https://www.omfif.org/absa-africa-financial-markets-index-2025-launch/)) | Free report | No (annual readiness index) | Annual; a citation and validation partner |

### 2c. Open and official data

| Source | What | Price | Primary auctions | Our angle |
|---|---|---|---|---|
| **Kiel / Geneva African Debt Database (ADD)** | 50,000+ domestic and external instruments, 54 governments, 2000–2024, sourced from auction reports and prospectuses; open access ([idw](https://nachrichten.idw-online.de/2025/10/16/new-database-brings-transparency-to-africas-public-debt), [VoxDev](https://www.voxdev.org/topic/methods-measurement/africas-domestic-debt-boom-new-evidence-african-debt-database)) | Free | **Yes, historically**: the strongest free substitute for history | Ends 2024; research cadence. We are the live layer. Offer a data link-up, cite it, never claim deeper history than ADD where it has it |
| **IMF/World Bank QPSD** | Quarterly public-sector debt stocks by instrument and currency; API ([World Bank](https://www.worldbank.org/en/programs/debt-statistics/qpsd)) | Free | No (stocks, not auctions) | Context only |
| **EMTA** | Quarterly EM debt trading-volume survey; local markets about 72% of USD 1.56tn in 3Q24 ([EMTA](https://emta.org/media/madjtop5/press-release-3q24.pdf)) | Free releases | No | Market-size evidence for decks; no African breakout found |
| **Central banks / debt offices** (CBK, DMO, CBE, BoU, BoZ, UMOA-Titres, SA Treasury) | The source itself. CBK posts results same day on X and in a press statement ([People Daily](https://peopledaily.digital/business/cbk-raises-ksh30-1b-in-30-year-bond-auction)) | Free | Yes, one market each, PDFs/images/tables | Our real competitor is *an analyst with 13 browser tabs*. We sell harmonisation, history and alerts |
| **Exchange data** (FMDQ, NSE, USE) | Licensed prices | FMDQ redistribution NGN 13.4m–33.6m a year ([FMDQ 2026 framework](https://fmdqgroup.com/exchange/wp-content/uploads/2026/08/FMDQ-Exchange-2026-Fees-and-Dues-Framework-2.pdf)); USE real-time debt data USD 500 a month international ([USE](https://www.use.or.ug/sites/default/files/USE%20Data%20Vending%20Pricing%20-%20%20Approved.pdf)); NSE data revenue KES 93.5m a year ([Business Daily](https://www.businessdailyafrica.com/bd/markets/capital-markets/nairobi-exchange-s-data-revenue-rallies-to-sh93m--4254888)) | No (secondary) | **Do not redistribute secondary prices** without a licence. Useful price anchors: one small exchange charges USD 6k a year for one market's debt prices |

### 2d. African media, research and data startups

| Competitor | Country | Sells / to whom | Price | Primary auctions | Weakness we attack |
|---|---|---|---|---|---|
| **Business Daily (NMG)** | Kenya | Business news; ePaper KES 80 (VERIFIED, [Kenyans.co.ke](https://www.kenyans.co.ke/news/100738-price-business-daily-newspaper-go-ksh-40)) | Low | Reports CBK results as news | Articles, not data; no history download |
| **Cytonn Investments research** | Kenya | Free weekly/monthly PDFs with T-bill/bond subscription rates ([Cytonn](https://cytonn.com/uploads/downloads/cytonn-weekly-492023-v5-december-8-2023.pdf)) | Free (marketing for its funds) | Kenya only, in PDF | Not machine-readable; conflicted (sells funds); Kenya only |
| **Mwango Capital** | Kenya | Weekly East Africa capital-markets newsletter and podcast; 3,000+ Substack subscribers (undated, [Substack](https://mwangocapital.substack.com/p/episode-32-revitalizing-the-nse)) | Free (no paid tier found) | Commentary | Community, not data. **Partner/sponsor candidate** |
| **Stears** | Nigeria | B2B data and intelligence (clients incl. UNDP, EIB, InfraCredit, [TechCabal](https://techcabal.com/2023/10/04/stears-pivot-b2b/)); enterprise >75% of 2022 revenue ([TechCrunch via search](https://techcrunch.com/?p=2421462)); consumer USD 99 or NGN 35,000 a year ([Stears](https://api.stearsng.com/subscriptions)) | Low consumer; B2B by quote | Not a focus (ESTIMATED) | Nigeria-centric; research and market sizing, not an auction feed |
| **Proshare** | Nigeria | Markets platform (fixed income, FX, CIS), FMDQ ticker on site ([FMDQ](https://fmdqgroup.com/fmdq-collaborates-with-proshare-launches-fixed-income-fx-price-ticker-tape-on-proshare-website/)) | About USD 25 a year and a donation appeal (UNVERIFIED, 12 Oct pass; not re-found today) | Reports DMO/CBN results | Nigeria only; dated UX |
| **Nairametrics** | Nigeria | Free news incl. auction stop rates, with Zedcrest daily notes ([Nairametrics](https://nairametrics.com/?p=135129)) | Free | As news | Not structured |
| **african-markets.com** | Pan-African | Equities EOD prices, 11,000+ annual reports; Premium USD 10 a month; group plans by quote ([african-markets.com](https://african-markets.com/en/subscribe)) | USD 120 a year | No (equities) | Equity-only; complementary |
| **Briter** | Pan-African | Startup/deals intelligence platform plus MCP AI connector for subscribers ([Briter](https://www.briter.co/products/briter-intelligence), [AI connector](https://www.briter.co/products/ai-connector)) | By demo | No | Different segment, **but shows the playbook: an MCP connector to Claude/ChatGPT as a paid feature** |
| **TechCabal Insights** | Pan-African | Digital-economy consultancy, reports, events ([TC Insights](https://insights.techcabal.com/reports)) | By quote | No | Tech, not markets |
| **Business Insider Africa** | Pan-African | News. (BI South Africa closed Feb 2023, [Daily Maverick](https://www.dailymaverick.co.za/article/2023-02-27-another-one-bites-the-dust-business-insider-sa-news-website-to-close/)) | Free | No | News only |
| **EnterpriseAM** | Egypt | Daily business newsletter, appears free and ad-supported ([Enterprise](https://enterpriseam.com/about-us/)) | Free | Reports CBE auctions as news | Prose, not data; Arabic/English Egypt-first |
| **Sika Finance, Financial Afrik, APA** | Francophone W. Africa | BRVM/UMOA news; Sika is cited for UMOA issuance totals ([Économie Ivoirienne](https://economie-ivoirienne.ci/index.php/actualites/la-cote-divoire-renforce-sa-position-sur-le-marche-de-lumoa-avec-une-levee-de-10955)) | Not found | Single-auction news ([Financial Afrik](https://www.financialafrik.com/2020/12/18/obligations-du-tresor-le-senegal-leve-27500-milliards-de-fcfa-sur-le-marche-financier-de-lumoa)) | No English structured tape for WAEMU: **our 1,625-row UMOA dataset is a real edge** |
| **Daba Finance** | Francophone/pan-African | Investing app giving access to WAEMU government securities; Daba Pro stock research USD 49.99 a year (2024, [Daba](https://dabafinance.com/en/learn/blogs/what-is-daba-pro), [UMOA news](https://www.dabafinance.com/en/news/umoa-titres-secondary-market-quotation-platform)) | Retail | Distribution, not data | **Partner**: widget/data licence for its WAEMU securities screens |
| **South Africa** (Iress, Sharenet, JSE) | SA | Equity/bond terminals and feeds | By quote (UNVERIFIED) | SA Treasury publishes auctions itself | SA is deep and served; low priority except bond backfill for completeness |

**Finding (ESTIMATED, from the absence of any vendor offering it across 30+ checked):** nobody we found sells a
harmonised, English-language, multi-country African primary-auction tape (bills and bonds, per auction, source link per
row) with an API. The nearest things are Kiel's ADD (historical, ends 2024), Cbonds (bond reference, patchy small
markets) and Trading Economics (headline yields). Terminals may hold parts of it; we could not verify depth.

## 3. Ahead, behind, and the cheapest gaps to close

**Where we are genuinely ahead (REPO-verified)**
1. **WAEMU in English, auction by auction**: 1,625 OAT/BAT results for 7 issuers since Sep 2022. No competitor found offers this.
2. **Breadth of primary auctions in one schema**: 18 countries, about 22,300 results, one `BondRow` shape, every row linked to its source document.
3. **Long free history where others charge**: South Africa bills from 2000, Egypt bills from 2002, Egypt bonds from 2004, Kenya bonds from 2010.
4. **Price band**: Analyst USD 3k a year and Team USD 18k a year against a single terminal seat at about USD 28–32k (ESTIMATED).
5. **Monitoring in public**: `data/health.json` flags late and missing markets daily. Vendors do not show this.

**Where we are behind**
| Gap | Who has it | Cost to close |
|---|---|---|
| No customers, no track record, one person | Everyone | Only pilots fix it |
| **Latency is claimed ("within hours"), not measured** | Terminals (real-time where they host the auction) | **Cheapest**: log publisher-release time vs our record time per row; publish p50/p90. 1–2 days |
| Edge gaps: Tunisia, Ghana bonds, Angola; South Africa bonds | Terminals, Cbonds | Ghana bonds: medium (we already read Ghana bills). SA bonds: low-medium (Treasury publishes). Tunisia, Angola: medium-high (French/Portuguese PDFs) |
| Short bond history: Uganda (from Nov 2024), Zambia and Morocco (from Dec 2025) | ADD to 2024, terminals | Medium: backfill from archives; cross-check against ADD |
| No secondary prices or curves | Bloomberg, LSEG, FMDQ, exchanges | Do not compete (licences). Offer **auction-implied curves** instead |
| No Excel add-in, Python package, Snowflake, MCP connector | Cbonds (Excel), TE (Excel/Python), Briter (MCP) | Low: Sheets `IMPORTDATA` template + thin Python client + MCP server over `/api/v1`: about a week total |
| No vendor security pack (SOC 2, DPA) | All large vendors | Medium: one-page security note and standard data-licence terms first |
| Guinea-Bissau 0 rows; Malawi late | — | Low |

## 4. Positioning

**Category claim (defensible today):**
> *Afronomics is the primary-auction tape for African local-currency government debt: every bill and bond auction in 18
> African markets, 13 of them bond markets covering at least 35.7 of the 44.5 points of Africa's GBI-EM Edge weight, in
> one schema, with a source link on every row and an API.*

Evidence: REPO counts in §1; Edge weights from BusinessDay/Nairametrics; "only" is deliberately not claimed. Say "the
tape" not "the only tape" until a terminal's coverage is checked. Upgrade to "with measured latency of X hours" once
the latency log exists.

**Three wedge offers**

| # | Against | Offer | Why it wins |
|---|---|---|---|
| 1 | **Bloomberg / LSEG seat** (frontier local-debt PMs and analysts) | "Every African Edge-market auction, harmonised, from USD 3,000 a year (Analyst), about 1/10 of a terminal seat; Team and API at USD 18k a year, below one seat." | They keep the terminal for prices; we replace the 13 browser tabs and the intern spreadsheet. Pilot: one month, their own model's inputs |
| 2 | **Cbonds / Trading Economics** (data, quant and risk teams) | "Auction-level, not headline: offered, bid, accepted, cut-off and bid-to-cover per tenor for 18 markets, source link per row, API key, USD 1,500 a month." | TE has headline yields; Cbonds has bond reference with greyed small-market fields. Show a side-by-side for Uganda, Zambia and Côte d'Ivoire |
| 3 | **Free PDFs: Cytonn, central-bank sites, Kiel ADD** (Kenyan pensions, SACCOs, bank treasuries, DFIs) | "The live layer: results in your inbox or WhatsApp the day they print, and a monthly Investment Committee Pack (KES 12,000 a month)." For DFIs and researchers: "ADD to 2024, Afronomics from 2024 to today, same fields." | Free sources are slow, PDF, or stop in 2024. We are the update stream |

## 5. Who wins each audience today, and how we take share

| Audience | Who wins today | Our move (concrete) |
|---|---|---|
| **Kenya** (pensions, SACCOs, bank treasuries, fund managers, retail) | CBK itself (same-day on X), Business Daily (news), Cytonn (free PDFs), Mwango (community) | (1) WhatsApp auction alert KES 300 a month and IC Pack KES 12,000 to the about 1,000 schemes; (2) co-branded weekly with Mwango (sponsor swap, no cash); (3) be the cited table in Business Daily: send their markets desk a clean CSV within an hour of each CBK print; (4) legal check on fund listings (CIS Regulations 2023) before selling them |
| **East Africa** (Uganda, Tanzania, Rwanda, Ethiopia) | Nobody harmonised; each central bank; USE sells prices at USD 500 a month | (1) Backfill Uganda bonds before Nov 2024 (Edge weight 4.84); (2) add Tanzania bonds (we already read its bills); (3) sell the "East Africa curve pack" to Kenyan and Ugandan bank treasuries and regional DFIs (TDB, EADB) |
| **Africa-wide** (pan-African banks, DFIs, Stears/Tellimer readers) | Standard Bank and Absa research (bundled), Stears (Nigeria), Tellimer (frontier research) | (1) Data licence to Tellimer or Stears so their research cites our tables (Enterprise, from USD 5,000 a month, or rev-share); (2) offer AfDB AFMI and OMFIF/Absa AFMI a free feed for citation; (3) data partnership note with the Kiel ADD team |
| **Global** (frontier local-debt PMs: Ninety One, Ashmore, William Blair, Global Evolution, TCX) | Bloomberg/LSEG + JPMorgan index documents + sell-side notes | (1) Convert the 21 pilot offers with a named deliverable: "Edge Africa auction tape" with coverage map and measured latency; (2) after the first payer, list on Snowflake Marketplace and apply to Bloomberg App Portal; (3) MCP connector over the API so analysts query it from Claude/ChatGPT (Briter already sells this) |

## 6. Top 5 moves, ranked by revenue impact

| Rank | Move | Revenue logic (ASSUMED until a pilot converts) | Cost |
|---|---|---|---|
| 1 | **Convert the 21 pilots**: measured-latency log, per-prospect coverage sheet for their Edge book, "Edge Africa auction tape" as the named deliverable | 3 Team and API conversions = USD 4,500 a month; the only gate that matters (D-004) | 2–3 days |
| 2 | **Close the Edge gaps**: Ghana bonds and South Africa bonds now; Tunisia and Angola next; backfill Uganda, Zambia, Morocco | Removes the first objection from global PMs ("you don't have Tunisia"); lifts pilot-to-paid | 1–3 weeks |
| 3 | **One distribution/redistribution deal** (Tellimer, Stears, Daba or Cbonds as a data customer) | One Enterprise contract from USD 5,000 a month = more than 3 Team seats; reaches buyers we cannot | Founder's time; standard licence |
| 4 | **Workflow connectors**: Sheets template, Python client, MCP server; then Snowflake listing | Raises Analyst-to-Team upgrades; marketplace reach after first payer | About 1 week |
| 5 | **Kenya second wedge**: IC Pack and WhatsApp alerts to pensions, SACCOs and bank treasuries, with Mwango/Business Daily as amplifiers | 40 packs x KES 12,000 = about USD 3,700 a month; tests the 400-institution line in the USD 1m plan | Ongoing |

None of these reaches USD 1m a month alone; see `usd-1m-plan.md` for the expansion path. Re-run this scan monthly
and after every lost pilot ("who did you choose instead?").
