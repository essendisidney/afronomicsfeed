# Sector opportunities: which datasets to add next

Written 13 Oct 2026, as a companion to `usd-1m-plan.md` and `scripts/financial_model.py`. It answers one question:
which African sectors are growing fastest **and** have institutions that pay for data, and which datasets should
Afronomics add, in what order, to get from USD 0 towards USD 1m a month.

Labels, as in the plan: **VERIFIED** = checked in our own code or data on 13 Oct 2026; **V (press)** = a figure
quoted from the cited page or a press summary of a primary report (re-check against the primary before quoting
externally); **ESTIMATED** = reasoned from cited figures, not measured; **ASSUMED** = a guess written down so evidence
can replace it. No figure below is revenue.

Nothing here overrides the gates in `usd-1m-plan.md`: D-004 (pilot and paid gates), D-012 (no new markets until
the first replies are in) and gate 4 (open a new pool only when pilots or customers ask for it). This is the
queue for when those gates open, not a licence to build now.

## 1. What we already have (VERIFIED, `ls data/`, `scripts/*.py`, 13 Oct 2026)

| Asset | Files | Use for the next datasets |
|---|---|---|
| Bond auctions: Kenya, Nigeria, Egypt, Uganda, Zambia, Morocco, WAEMU (UMOA-Titres) | `scripts/*_bonds.py`, `umoa_bonds.py`, `data/*/bond_auctions.json`, `data/waemu/`, `data/morocco/` | The wedge; every adjacent dataset is sold to these buyers first |
| T-bill auctions in ten markets | `scripts/*_tbills.py`, `bills_common.py` | Short-end context, the bill index |
| Eurobond yields: **Nigeria and Kenya only** | `scripts/eurobonds.py`, `data/eurobonds.json` | Seed of the sovereign external-debt dataset |
| Central-bank policy rates and MPC calendar | `policy_rates.py`, `kenya_mpc.py`, `data/policy_rates.json`, `data/mpc_calendar.json` | Seed of a macro release calendar |
| Bank lending and deposit rates (Kenya, Ghana, Nigeria) | `kenya_rates.py`, `west_africa_rates.py`, `data/*/bank_rates.json` | Rates context for FX and CPI |
| Kenya money-market funds, CMA CIS data, SACCOs, DCP directory, mobile-loan charges | `cma_mmf.py`, `kenya_dcp.py`, `data/kenya/*.json` | The pension and fund-manager wedge (Investment Committee Pack) |
| Nigeria savings bond | `nigeria_savings_bond.py` | Retail debt |
| Remittance prices by corridor (World Bank RPW) | `remittance_prices.py`, `data/remittances/corridors.json` | Fintech and payments, lightly |
| Kenya government tenders (PPRA OCDS) | `kenya_tenders.py`, `data/kenya/tenders.json` | Procurement; parked by D-002 |
| Data health checks, story finder | `data_health.py`, `story_check.py`, `story_finder.py` | Reused by every new reader |

Gaps worth noting: there is **no dedicated FX reader** in `scripts/` although the Startup licence text in
`lib/billing/ratecard.ts` mentions "the FX archive"; **no CPI/inflation reader**; Eurobonds cover two issuers.

## 2. Sector evidence (every figure cited)

| Sector | Size and growth | Deal flow / activity | Comparable data prices |
|---|---|---|---|
| Sovereign and corporate debt | African bond stock grew from USD 160bn (2007) to USD 730bn (2024); about 60% of marketable debt is fixed-rate local currency ([OECD Africa Capital Markets Report 2025](https://www.oecd.org/en/publications/2025/11/africa-capital-markets-report-2025_a973e07d/full-report/local-currency-bond-markets-for-development-financing-in-africa_b9d9f859.html)) | Sovereign international issuance about USD 18bn + EUR 2bn in 2025 vs USD 12.8bn in 2024 ([BusinessDay, citing S&P](https://premium.businessday.ng/article/insights/Lower-borrowing-costs-push-Africas-debt-haul-to-18bn-despite-credit-gaps)); USD 43.6bn of SSA Eurobond principal due 2024–2030, 2027 about USD 6.6bn and 2029 about USD 7.5bn (World Bank, via [Myjoyonline](https://myjoyonline.com/eurobond-repayment-ghana-faces-us6-4bn-repayment-burden-between-2027-and-2030-world-bank), [Economic Confidential](https://economicconfidential.com/nigeria-faces-eurobond-debt/)); DRC's first Eurobond USD 1.25bn ([Financial Afrik](https://www.financialafrik.com/en/2026/04/09/drc-rawbank-announces-the-success-of-the-countrys-very-first-sovereign-eurobond-raised-at-1-25-billion/)) | Terminals USD 12–32k a seat a year (ESTIMATED, `competitive-landscape.md`); FMDQ data licences NGN 13–34m a year (V, same file) |
| Fintech and payments | SSA mobile money about USD 1.4tn in 2025, about two-thirds of the USD 2tn global value ([Connecting Africa, on GSMA SOTIR 2026](https://www.connectingafrica.com/mobile-money/-1-4t-flowed-through-mobile-money-in-sub-saharan-africa-in-2025-gsma)); Africa USD 1.105tn in 2024, +15% ([Ecofin, on GSMA 2025](https://www.ecofinagency.com/finance/0904-46604-mobile-money-transactions-in-africa-surge-15-in-2024-gsma)); SSA remittances about USD 54bn in 2023, Nigeria USD 19.5bn ([ThisDay, on World Bank](https://www.thisdaylive.com/2024/07/01/wbank-at-19-5bn-nigeria-accounted-for-35-of-sub-saharan-africas-diaspora-remittance-in-2023/)) | Startups raised USD 3.2bn in 2025, +40%, led by energy and fintech ([MEA Tech Watch, on Africa: The Big Deal](https://meatechwatch.com/?p=43437)) | GSMA reports free; Crunchbase Pro USD 49–99 a month ([ZoomInfo](https://pipeline.zoominfo.com/sales/crunchbase-pricing)) |
| Energy and renewables | Private clean-energy investment in Africa from about USD 17bn (2019) to almost USD 40bn (2024); total 2025 energy investment about USD 105bn, 3% of global ([Mongabay](https://news.mongabay.com/short-article/2025/11/global-energy-outlook-sees-promise-in-africas-power-transition-funds-permitting/), [Ecofin](https://www.ecofinagency.com/news/0506-47169-global-energy-investment-to-hit-3-3trn-in-2025-but-africa-still-left-behind), both on IEA) | IEA: about 24 GW a year of new capacity to 2035, >70% renewable ([GreenTech Lead, on WEO 2025](https://greentechlead.com/renewable-energy/world-energy-outlook-2025-insights-on-africas-energy-investment-access-and-mineral-opportunities-51368)); carbon credits about 50 Mt issued in 2024 ([IETA](https://www.ieta.org/news/carbon-markets-are-critical-to-bridge-africas-climate-finance-gap)); ACMI target 300 Mt a year and about USD 6bn revenue by 2030 ([ACMI](https://africacarbonmarkets.org/wp-content/uploads/2023/05/20230410_Africa-Carbon-Markets-Initiative-ACMI-Overview.pdf)) | IJGlobal, BNEF: quote only, no public price found (searched 13 Oct) |
| Mining and critical minerals | African copper exports about USD 35bn in 2024; DRC USD 19.8bn, Zambia USD 7.6bn ([The Namibian / Simonis Storm](https://www.we.com.na/mw-main/africa’s-copper-opportunity-raw-material-exporter-or-value-chain-leader2025-08-11166480)); Zambia output 890,346 t in 2025, +8% ([Ecofin](https://www.ecofinagency.com/news-industry/2801-52339-zambias-2025-copper-output-rises-8-misses-1-million-tonne-target)) | DRC cobalt export ban Feb 2025, replaced by quotas of 96,600 t a year for 2026–27 ([Ecofin](https://www.ecofinagency.com/news-industry/2101-52126-cobalt-export-quotas-and-copper-supply-risks-shape-drc-revenue-outlook), [Engineering News](https://www.engineeringnews.co.za/article/glencore-outlines-cobalt-strategy-amid-lifting-of-drcs-cobalt-export-ban-2025-11-14)) | Fastmarkets and Argus cobalt assessments sold by subscription, price on request ([Argus](https://www.argusmedia.com/de/methodology/key-commodity-prices/argus-cobalt)) |
| Agriculture and soft commodities | Côte d'Ivoire record farmgate 2,800 CFA/kg for 2025/26; Ghana 58,000 cedis/t ([Ecofin](https://www.ecofinagency.com/news/0310-49245-ghana-raises-cocoa-price-after-cote-d-ivoire-sets-record-5-00/kg)); ICE cocoa down about 53% to USD 3,779/t by 12 Jun 2026 ([Ecofin](https://www.ecofinagency.com/news-agriculture/1506-56470-ghana-maintains-cocoa-farmgate-price-at-3-728-for-2025/26-mid-crop-season)); Kenya tea exports KES 186.9bn (USD 1.44bn) in 2025, −1% ([Ecofin](https://www.ecofinagency.com/news-agriculture/1302-52890-kenya-tea-exports-rise-in-2025-revenue-slips-on-lower-prices)) | Mombasa auction weekly prices by origin ([Standard](https://www.standardmedia.co.ke/sports/amp/business/2001558944/tea-factories-earn-sh919-million-from-mombasa-auction)) | ICCO, ICO reports partly free; Trading Economics API USD 149–299 a month ([apis.io](https://apis.io/plans/tradingeconomics/tradingeconomics-plans-pricing/)) |
| Trade, AfCFTA, FX | Intra-African trade USD 220.3bn in 2024, +12.4% (Afreximbank, via [East Leigh Voice](https://eastleighvoice.co.ke/africa%20trade/137172/trade-between-african-countries-up-8pc-to-sh27-trillion-in-2024-report-shows)); other editions give USD 202.7bn ([Guardian NG](https://guardian.ng/business-services/intra-african-trade-rises-by-5-5-as-regional-integration-gains-momentum/)) — conflicting | Nigeria NFEM turnover USD 14.45bn in 19 trading days of Aug 2026; EFEMS USD 52.47bn in H1 2025, +262% (CBN, via [ThisDay](https://www.thisdaylive.com/2026/09/02/nfem-turnover-up-13-8-to-14-45bn-as-naira-strengthens-to-n1-335-50/), [BusinessDay](https://businessday.ng/news/article/naira-fx-turnover-skyrockets-262-in-one-year-under-cbns-efems/)) | Trading Economics as above; terminals carry spot FX |
| Telecoms and data centres | Capacity about 0.4 GW, demand 1.5–2.2 GW by 2030, USD 10–20bn capex ([McKinsey](https://www.mckinsey.com/~/media/mckinsey/industries/technology%20media%20and%20telecommunications/telecommunications/our%20insights/building%20data%20centers%20for%20africas%20unique%20market%20dynamics/building-data-centers-for-africas-unique-market-dynamics.pdf)); other baselines 0.78–1.5 GW (conflicting) | Mobile about 8% of SSA GDP in 2021 ([GSMA 2022](https://gsma.com/mobileeconomy/wp-content/uploads/2022/10/The-Mobile-Economy-Sub-Saharan-Africa-2022)) | GSMA Intelligence, TeleGeography: quote only |
| Insurance and pensions | Kenya pension assets KES 2.81tn, Dec 2025, +24.57% ([RBA](https://www.rba.go.ke/kenyas-pension-assets-rise-to-ksh2-81-trillion-in-2025)); Nigeria N27.45tn, Dec 2025, from N22.51tn ([Nairametrics, on PenCom](https://nairametrics.com/?p=515118)); Kenya insurance assets KES 1.2tn, 69–71% in government securities ([Intelpoint](https://intelpoint.co/insights/government-securities-consistently-dominate-kenyas-insurance-assets-holding-over-69-of-the-total-share/)); Nigeria GWP N2.3tn 2025, +47.3% ([MEIR](https://meinsurancereview.com/News/TagSearch/from/edaily/TagId/653/id/86900)) | Kenya funds moved KES 105bn offshore ([Business Daily](https://www.businessdailyafrica.com/bd/markets/kenya-pension-funds-shift-sh105bn-offshore-to-cut-risks-5593732)) | Our IC Pack KES 12,000–18,000 a month (VERIFIED, ratecard.ts) |
| Real estate | Knight Frank Africa Report 2026/27 exists; no reliable sized figure found ([Knight Frank](https://www.bw.knightfrank.com/research/africa-report-12847.aspx)) | Thin, secondary only | Estate Intel and broker reports; no prices found |
| Public procurement | About USD 533bn a year (2025), an order-of-magnitude estimate at 17% of GDP ([Empower Africa](https://empowerafrica.com/africas-533-billion-public-procurement-market/)) | Kenya OCDS file is a monthly snapshot (VERIFIED, D-002) | L2B Africa-wide tenders R1,721.74 ([L2B](https://www.l2b.co.za/Tenders/Tender-Pricing)); Biddetail USD 249–2,495 ([Biddetail](https://biddetail.com/membership-plan)) |
| Private capital, VC, DFI | AVCA: USD 5.1bn over 530 deals in 2025, volume +8%, value −5%; private debt deals +57%; DFIs 64% of fundraising ([AVCA](https://www.avca.africa/data-intelligence/research-publications/2025-african-private-capital-activity-report/), [Financial Edge](https://www.financialedge.com.ng/africa-s-private-capital-market-stabilises-at-us-5-1bn-as-deal-activity-grows-and-exits-surge-despite-global-downturn)); VC USD 3.2bn (Big Deal) to USD 3.8bn (Briter) ([BusinessToday KE](https://businesstoday.co.ke/african-ventures-raise-us3-8billion-in-2025/)) | 81 exits, +27% (AVCA, above) | PitchBook USD 12–40k a user a year, unverified ([CostBench](https://costbench.com/software/financial-data-terminals/pitchbook)); Briter freemium + premium, price not public ([Briter](https://www.briter.co/products/briter-intelligence)) |
| Consumer prices, inflation | SSA growth 4.5% in 2025; median inflation 3.4% end-2025, seen rising to 5% (IMF REO Apr 2026, via [Gazette NG](https://gazettengr.com/sub-saharan-africa-recorded-fastest-economic-growth-in-over-10-years-imf/)); East Africa fastest region, 5.3% (2025), 6.1% (2026) ([AllAfrica, on AfDB](https://allafrica.com/stories/202502180048.html)) | Monthly releases from every statistics office | EMIS EUR 8.6–41k a year (2020 academic contract, [rfp.wiki](https://www.rfp.wiki/investment/msci/emis)); Trading Economics USD 149–299 a month |

## 3. Scores (1–5; ESTIMATED, from section 2 and our own code)

Competition is scored so that **5 = least crowded** (better for us). Official sources = how much is openly published
by public bodies we can read automatically.

| Sector | Growth | Paying buyers (who) | Willingness to pay | Official sources (named) | Fit | Competition | Total /30 |
|---|---|---|---|---|---|---|---|
| **FX and reserves** (within trade/FX) | 4 | 5 — every local-debt fund, EM FX desks, bank treasuries, corporate treasuries, fintechs, DFIs | 4 | 5 — CBK, CBN (NFEM rates and turnover), BoG, SARB, CBE, Bank Al-Maghrib, BoU, BoZ, BoT, RBM, BCEAO/BEAC | 5 | 3 (terminals carry spot; few carry official fixings + turnover + reserves) | **26** |
| Sovereign and corporate debt (extensions: Eurobonds, issuance calendars, maturity walls, corporate bonds and CP) | 3 | 4 — frontier and EM debt funds (Ninety One, Allan Gray, Ashmore, William Blair, Global Evolution), TCX, sell-side, DFIs | 4 | 5 — DMOs and treasuries (DMO Nigeria, Kenya National Treasury, Ghana MoF), stock exchange RNS for prospectuses, CMA/SEC for corporate issues | 5 | 3 | **24** |
| Insurance and pensions (fund-manager wedge) | 4 | 4 — about 1,000 Kenyan schemes (VERIFIED in plan), Nigerian PFAs, insurers, fund managers, SACCOs | 2 (KES-priced) | 4 — RBA, PenCom monthly reports, IRA Kenya, NAICOM, CMA Kenya CIS reports, SEC Nigeria | 5 | 4 | **23** |
| Consumer prices and inflation | 2 | 4 — the same debt and FX buyers; banks' economists | 2 (commoditised) | 5 — KNBS, NBS Nigeria, Stats SA, GSS, UBOS, ZamStats, NBS Tanzania, CAPMAS, HCP, INS Côte d'Ivoire, ANSD | 5 | 2 | **20** |
| Fintech and payments | 5 | 3 — fintechs, VCs, MNOs, remittance firms, payment regulators | 2 | 3 — CBK national payments statistics, BoG, BCEAO, World Bank RPW (have it) | 3 | 3 (GSMA free) | **19** |
| Energy and renewables | 4 | 4 — IPPs, infrastructure funds, DFIs, utilities' lenders | 4 | 2 — regulator tariff orders (EPRA, NERC, NERSA, ERERA); most PPAs confidential | 2 | 2 (IJGlobal, BNEF) | **18** |
| Mining and critical minerals | 4 | 3 — traders, miners, metals funds, OEM supply teams | 5 | 3 — Zambia Ministry of Mines, Bank of Zambia, DRC ARECOMS (cobalt quotas), Banque Centrale du Congo, Chamber of Mines SA, Minerals Council | 2 | 1 (Fastmarkets, Argus, S&P, Benchmark) | **18** |
| Agriculture and soft commodities | 3 | 3 — traders, banks' agri desks, insurers, commodity funds | 3 | 4 — Conseil du Café-Cacao, COCOBOD, ICCO, EATTA/Mombasa auction, Nairobi Coffee Exchange, KAMIS, ECX, ZAMACE | 2 | 3 | **18** |
| Private capital and DFI deal flow | 3 | 4 — DFIs, LPs, PE and private-debt funds, advisers, law firms | 3 | 3 — IFC Project Information Portal, AfDB project portal, BII, FMO, Proparco, EIB, DFC disclosures | 2 | 2 (AVCA, Briter, Big Deal, Partech) | **17** |
| Public procurement | 3 | 2 — mostly SMEs; some contractors and DFIs | 2 | 4 — Kenya PPIP OCDS (have it), SA eTenders OCDS, Nigeria NOCOPO, Ghana GHANEPS, World Bank/AfDB notices | 4 | 2 | **17** |
| Telecoms and data centres | 5 | 2 — operators, towercos, DC investors | 3 | 2 — CA Kenya quarterly statistics, NCC Nigeria, ICASA | 1 | 3 | **16** |
| Real estate | 2 | 2 | 2 | 1 — few official price indices | 1 | 3 | **11** |

Reading the table: the fastest-growing sectors (mobile money, data centres, renewables, critical minerals) are the
ones where we have the least fit, the fewest official machine-readable sources, or the strongest incumbents. The
best **next** datasets are adjacent to the debt wedge: same buyers, same kind of official source, same readers.
The top 5 below follows the totals with one exception: DFI deal flow (17) is ranked above minerals, agriculture
and energy (18 each) because its sources are official disclosures we can read openly and its buyers (DFIs) are
already in the debt-wedge prospect list, whereas the other three sell mainly on prices that incumbents own.

## 4. Ranked top 5 datasets to add

Counts are **new paying institutions attributable to the dataset** (some are upgrades of debt-wedge customers, noted).
All ESTIMATED; each assumes the D-004 pilot and paid gates pass first. If they fail, divide by about four.

### 1. African FX and reserves monitor (official fixings, market turnover, reserves, parallel spreads where official)
- **Buyers:** every debt-wedge buyer (a local-debt return is FX-driven), EM FX desks, African bank treasuries,
  multinational corporate treasuries, fintechs and remittance firms, DFIs. Pool ESTIMATED 300–500 institutions:
  the 100–180 debt pool plus corporate and bank treasuries in Kenya, Nigeria, Egypt, Ghana, South Africa.
- **Price:** inside **Team and API (USD 1,500)** as the reason to upgrade from Analyst; standalone Analyst
  USD 250; Startup licence KES 7,500 for fintechs.
- **Official sources:** CBK daily indicative rates and weekly reserves; CBN NFEM rates and turnover; BoG; SARB;
  CBE; Bank Al-Maghrib; BoU; BoZ; BoT; RBM; BCEAO and BEAC (pegged, for completeness).
- **Build:** **S–M** (ten HTML/PDF readers on the existing `bills_common.py` pattern; turnover series for Nigeria).
- **Paying institutions:** 12 months **3–6** (half upgrades); 36 months **25–50**. Reasoning: it is the most-asked
  context on any frontier bond; corporate treasuries widen the pool beyond the debt-only 100–180.

### 2. Pension, insurance and fund-manager allocation dataset (feeds the Investment Committee Pack)
- **Buyers:** Kenyan pension schemes and administrators, Nigerian PFAs, insurers, fund managers, SACCOs; their
  consultants and trustees. Kenya about 1,000 schemes (VERIFIED in plan); KES 2.81tn assets, +24.6% ([RBA](https://www.rba.go.ke/kenyas-pension-assets-rise-to-ksh2-81-trillion-in-2025)).
- **Price:** **IC Pack KES 12,000–18,000 a month (about USD 93–140)**; Analyst USD 250 for managers; the plan's
  blended USD 300 assumes some move to Analyst or Treasury benchmarking (KES 40,000 a quarter).
- **Official sources:** RBA industry reports; PenCom monthly portfolio reports; IRA Kenya quarterly returns; NAICOM;
  CMA Kenya CIS quarterly (already read by `cma_mmf.py`); SEC Nigeria fund NAVs.
- **Build:** **M** (pack engine exists; allocation and peer-return tables are new).
- **Paying institutions:** 12 months **10–25**; 36 months **80–200**. Reasoning: large local pool, low ticket, short
  procurement at KES prices; it is also the named fallback if the D-004 kill rule fires.

### 3. Sovereign external debt: Eurobond terms, issuance calendar, maturity wall, official yields
- **Buyers:** the debt-wedge funds, sell-side strategists, DFIs and restructuring advisers, rating-agency analysts.
- **Price:** add-on inside **Team and API**; ESTIMATED incremental USD 800–1,200 a month per buyer; Enterprise for
  advisers.
- **Official sources:** DMO Nigeria (already read), Kenya National Treasury, Ghana MoF, Egypt MoF, other DMOs;
  prospectuses on exchange news services; IMF DSAs; World Bank IDS. Secondary prices are dealer data: **do not
  scrape; licence or leave out** (`competitive-landscape.md`).
- **Build:** **M** (extend `eurobonds.py` from 2 to about 20 issuers; terms are static, the wall is derived).
- **Paying institutions:** 12 months **1–3** (mostly upgrades); 36 months **10–25**. Reasoning: USD 43.6bn due to
  2030 keeps the topic live, but buyers overlap almost fully with the wedge.

### 4. CPI, inflation and real-yield series (release calendar plus auction-implied real yields)
- **Buyers:** same as 1 and 3; banks' economists; fund managers in the pension wedge.
- **Price:** **bundled** in Analyst and Team; no standalone price (commoditised by Trading Economics at
  USD 149–299 a month).
- **Official sources:** KNBS, NBS Nigeria, Stats SA, GSS, UBOS, ZamStats, NBS Tanzania, CAPMAS, HCP, INS, ANSD.
- **Build:** **S** (monthly, one figure per release, extends `policy_rates.py` and the MPC calendar).
- **Paying institutions:** 12 months **0–2**; 36 months **5–15**. Its value is retention and the derived real
  yield nobody publishes per auction, not new logos.

### 5. DFI and private-capital deal-flow tracker (from official DFI disclosures)
- **Buyers:** DFIs (to see each other), PE and private-debt funds, LPs, advisers, law firms, infrastructure
  developers. DFIs were 64% of 2025 fundraising ([Financial Edge, on AVCA](https://www.financialedge.com.ng/africa-s-private-capital-market-stabilises-at-us-5-1bn-as-deal-activity-grows-and-exits-surge-despite-global-downturn)).
- **Price:** Analyst USD 250 / **Team and API USD 1,500**; Enterprise for DFIs that redistribute internally.
- **Official sources:** IFC Project Information and Data Portal, AfDB projects portal, BII, FMO, Proparco, EIB
  project register, DFC active projects, Norfund. These are disclosures, so coverage is DFI-led, not all deals.
- **Build:** **M–L** (many portals, entity matching across them).
- **Paying institutions:** 12 months **0–3**; 36 months **10–30**. Reasoning: a new pool (DFIs and private capital,
  ESTIMATED 300–600 institutions) against established rivals; differentiation is provenance and debt linkage.

**Next after these (not top 5):** critical minerals (DRC quotas, Zambia production; high willingness to pay but
Fastmarkets/Argus own prices, so only an official-volumes product fits) and soft commodities (official farmgate
and auction prices). Energy, telecoms, real estate and tenders stay out until a paying customer asks (gate 4;
tenders also D-002).

## 5. Revenue bridge from USD 0 to USD 1m a month (ESTIMATED)

Prices are the ladder (VERIFIED, `ratecard.ts`): Analyst USD 250, Team and API USD 1,500, Enterprise from
USD 5,000; IC Pack KES 12,000–18,000. Counts per line overlap (one fund can buy debt, FX and Eurobonds), so lines
add revenue, not unique logos; the unique count is given at the foot. This is a **plan case**, faster than the
model's base case (USD 9.9k at month 24) and close to its aggressive case (USD 61k at month 24), and it needs the
capital and sellers the plan already names.

| Line (dataset rank) | End 2028 | End 2030 | End 2033 |
|---|---|---|---|
| Local-debt wedge (live) | 10 × USD 1,200 = 12,000 | 50 × 1,500 = 75,000 | 120 × 1,700 = 204,000 |
| FX and reserves (#1) | 8 × 1,000 = 8,000 | 60 × 1,000 = 60,000 | 120 × 1,200 = 144,000 |
| Pension, insurance, fund managers (#2) | 30 × 140 = 4,200 | 150 × 200 = 30,000 | 400 × 300 = 120,000 |
| Eurobonds and external debt (#3) | 5 × 800 = 4,000 | 30 × 1,000 = 30,000 | 80 × 1,200 = 96,000 |
| CPI and real yields (#4, bundled uplift) | 0 | 10 × 500 = 5,000 | 40 × 500 = 20,000 |
| DFI and private-capital deal flow (#5) | 2 × 1,500 = 3,000 | 25 × 1,500 = 37,500 | 80 × 1,700 = 136,000 |
| Enterprise redistribution and index licensing | 0 | 3 × 8,000 = 24,000 | 15 × 10,000 = 150,000 |
| Marketplaces (Bloomberg App Portal, LSEG, Snowflake), our share | 0 | 10,000 | 100,000 |
| Custom data and commissioned research (USD 3–15k a piece) | 3,000 | 20,000 | 80,000 |
| Readers, sponsorship, remittance referrals | 1,000 | 10,000 | 50,000 |
| **Total, USD a month** | **about 35,000** | **about 300,000** | **about 1,100,000** |
| Unique paying institutions (ESTIMATED) | about 50 | about 300 | about 750–850 |

Milestones this implies (ESTIMATED, plan case; the model's base case is far slower):

| Step | Plausible year | What has to be true first |
|---|---|---|
| First invoice | 2027 | D-004 passes: 3 pilots, 1 payment by week 8 |
| USD 10k a month | 2027–2028 | 10 paying institutions (repeatability gate); FX added as the Team upgrade |
| USD 50k a month | 2029 | IC Pack selling in Kenya and Nigeria; Eurobonds live; first seller hired |
| USD 100k a month | 2029–2030 | DFI tracker on sale; first Enterprise redistribution deal |
| USD 250–500k a month | 2030–2031 | 5+ sellers, marketplace listings, a licensable auction-yield index |
| **USD 1m a month** | **2033 at the earliest** | about 800 institutions, capital raised, 3–4 data engineers |

**Honest reading.** USD 1m a month needs **more than five years**: about seven from today (2033) even in this plan
case, consistent with the 6–8 years in `usd-1m-plan.md`. No single sector gets there; the largest line is under 20%
of the total. If the debt pilots fail, lines 1, 3 and 4 shrink with them (same buyers), and the plan rests on the
pension wedge and DFI tracker, which at KES prices and against incumbents point to roughly USD 100–200k a month by
2033 (ESTIMATED), not USD 1m. In the model's base case none of these steps happens within 36 months.

## 6. What to do with this

1. Nothing new is built until D-004 has an answer (D-012).
2. If pilots happen, ask every pilot user one question: "which of FX, Eurobonds, inflation would you pay for
   inside this?" That is the evidence gate 4 needs, and it ranks 1, 3 and 4 above by buyer demand, not by this table.
3. If D-004 fails, start with dataset 2 (pension and fund-manager data) as the second wedge, as the plan says.
4. Re-run `scripts/financial_model.py` with an FX expansion pool once real conversion rates exist; the
   aggressive case's 150-institution expansion pool is consistent with the FX and DFI estimates above.

Source caveat: most figures above come from press summaries of primary reports (GSMA, IEA, AVCA, Afreximbank,
World Bank, IMF). Where two sources conflict (intra-African trade, data-centre baseline, tea prices) both are
shown. Re-check against the primary PDF before any figure goes on the site or into a pitch.
