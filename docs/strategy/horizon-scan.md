# Horizon scan: the themes that will keep Afronomics in front, 2027–2031

Written 13 Oct 2026. `sector-opportunities.md` ranked the next five **datasets**; this file ranks **themes** for the next 1–5 years: the stories, trackers and products that give readers and buyers a reason to come back every week. Read it with
`master-plan-v2.md`, `partners-and-revenue.md` and `decision-log.md`.

**Labels.** **VERIFIED** = checked in our repo on 13 Oct 2026. **V (press)** = from the cited page, usually a press summary of a primary source (re-check the primary before quoting it outside). **ESTIMATED** = our reasoning. **NOT PUBLISHED** = no official
date or figure found on 13 Oct; nothing is filled in. No figure here is revenue.

**The gate still applies.** D-004 and D-012: no new **dataset** (a reader in `scripts/`, an API endpoint, a paid product) before ≥3 pilots. Only **editorial work and cheap reader trackers** move now (section 3). **Sandbox note (VERIFIED):** our tool proxy
could not reach imf.org or centralbank.go.ke on 13 Oct, so every new reader must be tested from GitHub Actions, where our readers already run.

**What we hold (VERIFIED, `ls data/ scripts/ lib/data/ app/`).** Bond auctions in 13 markets and bills in 10 plus WAEMU; policy rates; an MPC calendar with published dates for SARB, BoG, BoT and RBM (`data/mpc_calendar.json`; CBN, BoU, CBE and BoZ recorded as
"not published"); Nigeria and Kenya Eurobond yields (`data/eurobonds.json`); bank rates (Kenya, Ghana, Nigeria); RPW remittance costs for 97 corridors; Kenya MMFs, SACCOs, tenders (parked); World Bank projects; spot FX from a free aggregator (not an official
fix). Pages exist for `/climate`, `/diaspora`, `/send-money`, `/rates/policy`, `/markets/eurobonds`, `/trade`. There is **no** IMF, ratings, CPI, minerals or carbon reader.

## 1. Ranked top 10 themes (ESTIMATED ranking)

The ranking weighs four things: overlap with buyers we already court (debt funds, DFIs, pensions); how often the theme makes news; open official data we can read automatically; and whether we can be first or only. Size: **S** ≤1 week, **M** 2–4 weeks, **L** >1
month of one engineer (ESTIMATED).

| # | Theme | News frequency | Build (tracker → dataset) | Gate |
|---|---|---|---|---|
| 1 | Sovereign debt cycle: IMF programmes, restructurings, the Eurobond wall | Weekly | S → M | Tracker now (editorial); dataset = sector #3, gated |
| 2 | Money across borders: PAPSS, instant payments, remittances, diaspora bonds, AfCFTA settlement | Weekly–monthly | S → M | Editorial now; FX dataset (sector #1) gated |
| 3 | Credit ratings and the cost of capital (big three, AfCRA) | 2–4 a month | S | Tracker now |
| 4 | Budgets, Finance Bills and tax shifts (digital and SEP taxes, Nigeria's new tax laws) | Seasonal spikes | S | Editorial calendar now |
| 5 | Inflation drivers: food, fertiliser, climate shocks and ARC payouts → real yields | Monthly | S → M | Reader board now; CPI dataset (sector #4) gated |
| 6 | Critical minerals and resource nationalism (cobalt quotas, lithium bans, copper) | Weekly | M | Editorial now; dataset after a paying ask |
| 7 | Stablecoins, crypto rules and CBDCs (honest version) | Monthly | S | Regulation tracker now (editorial) |
| 8 | Climate finance: green/SLB bonds, debt-for-nature swaps, carbon markets | Monthly; peaks at COP | M | Editorial now; ledger after pilots |
| 9 | Capital-market deepening: listings, pensions going offshore, private credit and DFIs | Monthly | M–L | Editorial now; DFI tracker = sector #5, gated |
| 10 | Power: IPP tariffs, regulator tariff reviews, AI/data-centre demand | Monthly | M | Editorial only until a buyer asks |

### 1. Sovereign debt cycle: IMF, Common Framework, refinancing wall
- **Why it matters.** It moves every bond and bill we publish. Readers get the "will my country cope?" story; debt funds, DFIs and restructuring advisers need the timeline. Zambia reached staff level on a new 36-month ECF of about USD 1.47bn on 9 Oct 2026
  ([IMF](https://www.imf.org/en/news/articles/2026/10/09/pr26331-zambia-new-ecf)), with Board approval expected around December (V press,
  [Devdiscourse](https://www.devdiscourse.com/article/international/3989942-zambia-secures-imf-staff-level-backing-for-new-15-billion-programme)). Ghana finished its USD 3bn ECF in July 2026 and moved to a non-financing PCI
  ([GNA](https://gna.org.gh/2026/07/ghana-completes-imf-ecf-programme-secures-final-us371m/)). Ethiopia agreed a 12% haircut on its USD 1bn Eurobond on 29 Jun 2026
  ([Ecofin](https://www.ecofinagency.com/news-finances/3006-56913-ethiopia-and-bondholders-reach-new-preliminary-deal-on-1-billion-eurobond-restructuring)), and the OCC confirmed comparability in August (V press, [Capital
  Ethiopia](https://capitalethiopia.com/2026/08/22/ethiopia-steps-closer-to-debt-relief-as-occ-validates-eurobond-agreement/)). Kenya is still negotiating a new programme (V press,
  [Dawan](https://www.dawan.africa/news/kenya-prepares-for-fresh-imf-funding-talks-as-new-mission-heads-to-nairobi)) and plans another buyback of up to USD 500m ([The
  Star](https://www.the-star.co.ke/business/kenya/2026-07-15-kenya-plans-fresh-sh646bn-eurobond-buyback)). African countries owed the IMF about SDR 39.9bn on 15 Sep 2026 (V press,
  [Yen](https://yen.com.gh/business-economy/312136-list-top-10-african-countries-biggest-imf-loans-september-2026/)). SSA Eurobond maturities are about USD 6.6bn in 2027 and USD 7.5bn in 2029 (World Bank via
  [Myjoyonline](https://myjoyonline.com/eurobond-repayment-ghana-faces-us6-4bn-repayment-burden-between-2027-and-2030-world-bank)).
- **Open data.** IMF Financial Data by Country ([exfin1](https://www.imf.org/external/np/fin/tad/exfin1.aspx)); IMF MONA arrangements database ([MONA](https://www.imf.org/external/np/pdr/mona/index.aspx)); IMF press releases; DMO and treasury statements; our
  own `data/eurobonds.json`.
- **Product.** The **IMF and Debt-Relief Tracker** (section 3A); a monthly "Debt Clock" column; a Eurobond countdown for each 2027–2028 maturity. Nigeria's USD 1.5bn 6.5% note matures in Nov 2027 (VERIFIED, `data/eurobonds.json`).
- **Who pays.** Debt funds and advisers, as part of Team and API (sector #3). Readers pay nothing; the tracker builds traffic and citations.
- **News.** Every IMF Board date, staff-level agreement, OCC statement or buyback.

### 2. Money across borders: PAPSS, instant payments, remittances, diaspora bonds
- **Why it matters.** It is the plumbing behind the FX dataset, and it is where fintech readers and diaspora readers overlap. PAPSS reports 24 central banks, more than 200 commercial banks and PSPs, and transaction volumes up about 1,000% year on year. It
  publishes growth rates only, not absolute counts (V press, [TechTrends](https://techtrendske.co.ke/2026/09/17/papss-targets-faster-adoption-as-transaction-volumes-jump-1000pc/)). GhIPSS Instant Pay reached GH¢712bn in 2025, up 100.5% (BoG via [Ghanaian
  Times](https://ghanaiantimes.com.gh/mobile-money-transactions-hit-gh¢4-54trn-in-2025-bog/)); the GhIPSS platform total was GHS 1.73tn ([GhIPSS](https://ghipss.net/industry-performance/)). Kenya's fast payment system has no published launch date
  ([TechCabal](https://techcabal.com/2025/01/06/kenyan-banks-cbk-system/)), and a National Payment System Bill 2026 is out for public comment ([Kenya
  Times](https://thekenyatimes.com/latest-kenya-times-news/treasury-cbk-seek-public-views-on-new-national-payment-system-bill-2026/)). AfCFTA preferences can be claimed in only about 25 countries (V press, [Rio
  Times](https://www.riotimesonline.com/afcfta-status-2026/)). Diaspora bonds have a mixed record: Nigeria's 2017 issue raised about USD 300m
  ([GlobalCapital](https://globalcapital.com/article/28mt6xsk44eget3erykn4/emerging-markets/africa/nigeria-pioneers-with-first-sec-reg-diaspora-bond-eyes-sukuk)), and Mali is pitching new ones (V press,
  [Capmad](https://www.capmad.com/post/at-fid-2026-bamako-bets-on-diaspora-bonds-to-channel-usd-12-billion-in-transfers)).
- **Open data.** World Bank RPW, quarterly (we hold it); BoG payment-systems oversight reports; GhIPSS industry performance; CBK national payments statistics; AfCFTA e-Tariff Book; PAPSS releases (no data series).
- **Product.** A quarterly **"Cost to Send Home" index** from RPW data we already hold (extends `/send-money`), plus a "Payments Rails Scorecard" (each instant system: live or not, interoperable or not, linked to PAPSS or not).
- **Who pays.** Remittance referrals (D-007); fintechs on the Startup licence; DFI-funded research such as FSD Africa (`partners-and-revenue.md` line 2).
- **News.** Quarterly RPW releases; PAPSS COWRY on 26–27 Nov 2026 in Addis Ababa (V press, [TechEconomy](https://techeconomy.ng/papss-targets-accelerated-adoption-transaction-growth-as-network-expands-across-africa)).

### 3. Credit ratings and the cost of capital
- **Why it matters.** A rating action reprices Eurobonds and local bills, and readers want to know what it means for them. The AU set 7 Oct 2026 to launch the African Credit Rating Agency in Mauritius
  ([Nairametrics](https://nairametrics.com/2026/09/02/au-to-launch-african-credit-rating-agency-on-october-7/), [BusinessDay SA](https://www.businessday.co.za/news/2026-10-07-au-to-launch-continents-first-credit-rating-agency/)). We found no published AfCRA
  rating as of 13 Oct.
- **Open data.** Agency sovereign calendars, which EU rules require ([Capital Intelligence 2026](https://ciratings.com/wp-content/uploads/2025/12/Sovereign-Ratings-Calendar-2026-Issued-December-2025.pdf); [MNI
  compilation](https://media.marketnews.com/MNI_Sovereign_Rating_Review_Calendar_2026_29077cbd54.pdf)). Agency press releases are free to read; full reports are paid.
- **Product.** A **Ratings Scorecard**: for each country, the current rating from each agency (entered by hand, with a link to the press release), the next scheduled review date, and the Eurobond yield on the day before and the day after. We hold that yield
  for Nigeria and Kenya.
- **Who pays.** No one directly; it raises the value of Team and API. AfCRA could become a data partner.
- **News.** Fixed dates on the calendars, plus AfCRA's first ratings.

### 4. Budgets, Finance Bills and tax shifts
- **Why it matters.** Budgets set borrowing, which sets auction supply, the core of our wedge. Kenya's Finance Bill 2026 widened "royalty" to cover card schemes and software, and put VAT on digital financial services
  ([TechCabal](https://techcabal.com/2026/05/13/kenya-moves-to-tax-card-networks-and-software-giants/), [Bowmans](https://bowmanslaw.com/insights/kenya-finance-bill-2026/)). Nigeria's tax acts took effect on 1 Jan 2026, and the Nigeria Revenue Service replaced
  FIRS ([Forvis Mazars](https://www.forvismazars.com/ng/en/insights/local-publications/local-insights/nigeria-tax-reforms-2026)).
- **Open data.** Treasury budget documents, borrowing plans and DMO auction calendars, read alongside our auction data.
- **Product.** A **"Budget to Auction" explainer** on each budget day: the net domestic borrowing target against what auctions raised year to date. This is only possible because we hold the auctions.
- **Who pays.** Sponsors of the budget-day editions (`partners-and-revenue.md` line 6). It also makes good pilot follow-up material.
- **News.** Tent-poles in the section 2 calendar.

### 5. Inflation drivers: food, fertiliser, climate shocks → real yields
- **Why it matters.** Inflation decides whether a 91-day bill makes a saver richer, and it is the most-read macro number. After the Hormuz shock, global urea more than halved from its peak, but African farm-gate prices did not follow (V press,
  [Ecofin](https://www.ecofinagency.com/news-agriculture/1407-57382-global-fertilizer-prices-are-falling-african-farmers-aren-t-feeling-it); [BISI](https://bisi.org.uk/reports/fertiliser-shock-raises-africas-food-price-risks)). ARC paid USD 5.5m to Somalia in
  2026 ([Reinsurance News](https://www.reinsurancene.ws/somalia-secures-5-5m-drought-parametric-payout-from-arc/)) and USD 2m to Mozambique for 2025–26 ([Reinsurance
  News](https://www.reinsurancene.ws/mozambique-receives-2m-parametric-payout-for-drought-protection-from-arc/)).
- **Open data.** The FAO Food Price Index, released on fixed dates ([FAO](https://www.fao.org/worldfoodsituation/FoodPricesIndex/en)); IFDC/AfricaFertilizer country prices ([IFDC](https://ifdc.org/2026/06/02/global-fertilizer-markets-today/)); national
  statistics offices' CPI; ARC press releases.
- **Product.** The **Real-Yield Board** (section 3C), and a monthly "What moved prices" note on the day of the FAO release.
- **Who pays.** Readers, through traffic and the newsletter. Pension and IC Pack buyers get real yields bundled (sector #4).
- **News.** Monthly. Each country's CPI release is its own news moment.

### 6. Critical minerals and resource nationalism
- **Why it matters.** Minerals drive FX and the budget in the DRC, Zambia and Zimbabwe, and they drive Zambia's bond auctions, which we hold. The DRC's 2026 cobalt quota is 96,600 t: 87,000 t base (7,250 t a month) and 9,600 t strategic ([IEA policy
  database](https://www.iea.org/policies/29138-drc-arecoms-decision-no-0042025-cobalt-quota-system)). ARECOMS can adjust it quarterly
  ([Fastmarkets](https://www.fastmarkets.com/insights/drc-may-reduce-cobalt-quota-if-market-needs-rebalancing-arecoms-says-exclusive/)). Zimbabwe's stated policy bans lithium-concentrate exports from Jan 2027, with quotas and conditions in between (V press,
  [Mining Focus Africa](https://miningfocusafrica.com/2026/04/09/zimbabwe-to-introduce-lithium-export-quotas-as-it-pushes-for-local-processing), [IBZIM](https://ibzim.com/news/zimbabwe-lithium-export-ban-new-conditions-2026)). Zambia targets 3 Mt of copper by
  2031 ([IEA](https://www.iea.org/policies/29665)) and expects more than 1 Mt in 2026 (V press, [FinGaz](https://fingaz.co.zw/2026/01/27/zambia-restates-copper-ambition-after-posting-record-output/)).
- **Open data.** ARECOMS decisions, Zambia's Ministry of Mines, Bank of Zambia, Zimbabwe gazettes, the IEA policy database. Prices belong to Fastmarkets and Argus: **do not scrape them**.
- **Product.** A **"Minerals and Money" quarterly**: official quotas and volumes set against the kwacha, Zambia bond yields and fiscal revenue. Only the official-volumes angle fits us (`sector-opportunities.md`).
- **Who pays.** Metals funds and traders, later and by quote. ESTIMATED low fit until a buyer asks.
- **News.** Quarterly quota resets, export bans and mining-code changes.

### 7. Stablecoins, crypto rules and CBDCs (the honest version)
- **Why it matters.** It is how many young readers actually hold dollars. SSA received about USD 205bn on-chain in Jul 2024–Jun 2025, up about 52%, and Nigeria USD 92.1bn. Those figures cover centralised exchanges only (Chainalysis via
  [Tech.Africa](https://tech.africa/sub-saharan-africa-crypto-205bn/)). Kenya's VASP Act is law; final regulations were reported gazetted as LN 134 of 2026 (V press, [Khusoko](https://khusoko.com/2026/07/28/kenya-vasp-regulations-2026-capital-requirements/)).
  The draft rules proposed capital of up to KES 500m ([Finance Magnates](https://www.financemagnates.com/cryptocurrency/new-kenyan-rules-would-make-stablecoin-issuers-hold-hefty-capital-buffers/)). The CBDC lesson: the IMF found 98.5% of eNaira wallets unused
  in any given week ([Nairametrics](https://nairametrics.com/2023/05/19/imf-scores-enaira-low-on-adoption-in-new-report/)), and the CBN's Vision 2028 now repositions it for government and cross-border payments ([Central
  Banking](https://www.centralbanking.com/central-banks/payments/7976086/nigeria-to-reposition-its-struggling-cbdc)).
- **Open data.** Gazettes, CBK, CMA, SEC Nigeria and CBN circulars. There is no official volume data: label Chainalysis figures as vendor estimates.
- **Product.** A **Digital-Money Rulebook tracker**: for each country, the status of crypto and stablecoin rules, CBDC status and the licensed venues, with a date and source on every cell. We will **not** run a stablecoin remittance-cost comparison until a
  neutral source exists; vendor cost claims are marketing.
- **Who pays.** Fintechs and law firms, lightly. Mainly readers.
- **News.** Monthly, as regulations, licences and enforcement land.

### 8. Climate finance: green and SLB bonds, debt-for-nature swaps, carbon markets
- **Why it matters.** It is a new source of sovereign and utility funding, and DFIs pay for evidence on it. African sustainable debt reached almost USD 13bn in 2024, still under 1% of the global total ([S&P
  Global](https://www.spglobal.com/en/research-insights/special-reports/look-forward/unlocking-africa/sustainable-finance-africa-growth-challenges)). SENELEC issued a XOF 120bn green and SLB bond ([Financial
  Afrik](https://www.financialafrik.com/en/2025/10/01/senegal-senelec-becomes-the-first-public-company-in-africa-to-issue-a-214-million-green-bond/)). TNC is negotiating swaps worth USD 500m with three unnamed African countries
  ([Polity](https://polity.org.za/article/trio-of-african-countries-eyeing-debt-for-nature-swaps-nature-conservancy-says-2026-03-23)). Kenya launched its national carbon registry in Feb 2026
  ([ASM](https://africasustainabilitymatters.com/kenya-launches-national-carbon-registry-to-strengthen-climate-finance-and-expand-access-to-global-carbon-markets/)) and a 2026 guide that caps Article 6 trading at about 10 Mt through 2030 (V press,
  [Serrari](https://serrarigroup.com/kenya-caps-article-6-carbon-credit-exports-through-2030/)).
- **Open data.** The Kenya carbon registry; Verra and Gold Standard public registries; exchange RNS for green bond listings; ACMI reports.
- **Product.** A **Climate Finance Ledger** built for COP: every African labelled bond, swap and Article 6 deal, each with a source link.
- **Who pays.** DFIs and FSD Africa-type commissioned research (`partners-and-revenue.md` line 2); a COP sponsor.
- **News.** Monthly, with a peak at COP31 (9–20 Nov 2026, Antalya; [Wikipedia](https://en.wikipedia.org/wiki/2026_United_Nations_Climate_Change_Conference)).

### 9. Capital-market deepening: listings, pensions, private credit, DFIs
- **Why it matters.** It is the pension wedge (D-004's kill path) and the DFI pool (sector #5). The Ethiopian Securities Exchange is adding bank listings (V press, [The Reporter](https://www.thereporterethiopia.com/48368/)), while East African bourses went
  through an IPO drought ([The EastAfrican](https://theeastafrican.co.ke/tea/business-tech/another-year-ipo-drought-east-africa-bourses-eye-change-2026-5316760)). European DFIs backed a USD 250m African private-credit fund
  ([Daba](https://dabafinance.com/fr/nouvelles/european-dfis-back-250m-african-private-credit-fund)).
- **Open data.** Exchange notices, CMA and SEC approvals, RBA and PenCom reports, and DFI project portals (World Bank projects is already read by `lib/data/projects.ts`).
- **Product.** A **Listings and Flows monthly**: IPOs, approvals, pension allocation shifts and DFI commitments.
- **Who pays.** IC Pack and DFI tracker buyers, later.
- **News.** Monthly.

### 10. Power: IPP tariffs, tariff reviews, AI and data-centre demand
- **Why it matters.** Tariffs feed CPI and utility credit, and data centres are the newest source of demand. EPRA opened Kenya's 2026/27–2028/29 retail tariff review
  ([Kenyans.co.ke](https://www.kenyans.co.ke/news/123731-epra-begins-new-electricity-tariff-review-2026-2029-period)). Africa has about 360 MW of data-centre capacity live and 238 MW under construction (ADCA via
  [Serrari](https://serrarigroup.com/analyst-desk/africa-markets/ai-capex-african-infrastructure)). MTN plans about 150 MW of AI data centres
  ([Nairametrics](https://nairametrics.com/2026/08/26/mtn-to-develop-150mw-ai-data-centres-in-nigeria-south-africa-with-uae-backed-investor/)).
- **Open data.** EPRA, NERC and NERSA tariff orders; regulators' quarterly reports. PPAs are mostly confidential.
- **Product.** Editorial only: a "Tariff watch" item in the Weekly. **No** dataset until a buyer asks (gate 4; `sector-opportunities.md` scored energy 18/30).
- **Who pays.** IPP lenders and infrastructure funds, by quote, later.

### Also scanned, below the top 10 (ESTIMATED fit)
| Theme | Why lower | Data | Cheapest move |
|---|---|---|---|
| Urban housing and mortgages | Thin official series. KMRC's May 2026 bond paid a 12.2% coupon ([Kenyan Wall Street](https://kenyanwallstreet.com/kmrc-tranche-2-bond)); the Kenya average lending rate was 14.34% in Aug 2026 (VERIFIED, `data/kenya/rates.json`) | CBK rates (held), KMRC disclosures | A "mortgage vs T-bill" explainer using rates we already hold |
| Youth employment and digital labour | High reader interest, no buyer, weak data. Africa has about 532m people aged 15–35 ([World Data Lab](https://ayec-wp.worlddata.io/?p=84733)) | ILOSTAT, national labour surveys | Use as a story lens, not a product |
| AI and data centres (as an investment theme) | Incumbents (TeleGeography, ADCA); `sector-opportunities.md` scored it 16/30 | ADCA, regulators | Folded into theme 10 |
| Public procurement | Parked (D-002) | Kenya OCDS (held) | None until D-002 is reopened |
| AfCFTA trade volumes | Conflicting totals (sector doc); slow, annual data | AfCFTA e-Tariff Book, Afreximbank | Folded into theme 2 |

## 2. 12-month editorial calendar (Oct 2026 – Oct 2027)

**Recurring flagship series** (ESTIMATED cadence, all built on data we hold or on official pages):
- **Weekly:** Auction Week (live); **"The Week Ahead"** (Monday, from tracker 3B); the Eurobond line (Nigeria and Kenya yields, VERIFIED source pages).
- **Monthly:** **Debt Clock** (first Tuesday, from tracker 3A); **Real-Yield Board** update (after each CPI release, 3C); "What moved prices" on FAO day; Listings and Flows; the Digital-Money Rulebook.
- **Quarterly:** Cost to Send Home (after each RPW update); the Ratings Scorecard review; Minerals and Money; the Climate Finance Ledger.
- **Annual:** "State of African Local Debt" (`partners-and-revenue.md` line 3), timed for the Spring Meetings.

**Tent-pole dates.** Dated = published by the organiser. "Expected" or NOT PUBLISHED = no fixed date found; nothing is invented.

| Date | Moment | Source | Our angle |
|---|---|---|---|
| 21 Oct 2026, 14:00 | South Africa MTBPS | [National Treasury](https://www.treasury.gov.za/comm_media/press/2026/2026083101%20Media%20Advisory%20-%202026%20MTBPS%20Lockup%20Registration%20is%20open.pdf) | Borrowing plan vs SA bill auctions (held since 2000) |
| 29 Oct 2026 | Malawi MPC | `data/mpc_calendar.json` (RBM) | Malawi bills |
| Early Nov 2026 (legal deadline 15 Nov) | Ghana 2027 budget | [Myjoyonline](https://www.myjoyonline.com/ato-forson-eyes-first-week-november-for-2027-budget-promises-jobs-and-major-infrastructure-push/) | First budget under the PCI, set against Ghana bill yields |
| 6 Nov, 4 Dec 2026 | FAO Food Price Index | [FAO](https://www.fao.org/worldfoodsituation/FoodPricesIndex/en) | "What moved prices" (2027 dates NOT PUBLISHED) |
| 9–20 Nov 2026 | COP31, Antalya | [Wikipedia](https://en.wikipedia.org/wiki/2026_United_Nations_Climate_Change_Conference) | Climate Finance Ledger launch |
| 18 Nov 2026 | Bank of Ghana MPC | `data/mpc_calendar.json` (BoG PDF) | Real-Yield Board |
| 18–20 Nov 2026 | Africa Fintech Summit, Kigali | `partners-and-revenue.md` | Payments Rails Scorecard |
| 19 Nov 2026 | SARB MPC | `data/mpc_calendar.json` | Rates |
| 26–27 Nov 2026 | PAPSS COWRY, Addis Ababa | [TechEconomy](https://techeconomy.ng/papss-targets-accelerated-adoption-transaction-growth-as-network-expands-across-africa) | Cross-border payments explainer |
| Dec 2026 (expected) | IMF Board on Zambia's new ECF | [Devdiscourse](https://www.devdiscourse.com/article/international/3989942-zambia-secures-imf-staff-level-backing-for-new-15-billion-programme) | Debt Clock and Zambia bond yields |
| Dec 2026 (expected; the 2026 budget came on 19 Dec 2025) | Nigeria 2027 budget | [AllAfrica](https://allafrica.com/stories/202512190506.html) | Borrowing plan vs FGN auctions |
| 31 Dec 2026 | AU deadline to ratify the AfCFTA protocols, including Digital Trade | [tralac](https://www.tralac.org/documents/resources/cfta/7495-au-assembly-decision-on-report-of-1st-meeting-of-assembly-committee-of-heads-of-state-and-government-implementation-afcfta-february-2026.html) | Ratification count |
| 1 Jan 2027 | Zimbabwe lithium-concentrate export ban (stated policy) | [Mining Focus Africa](https://miningfocusafrica.com/2026/04/09/zimbabwe-to-introduce-lithium-export-quotas-as-it-pushes-for-local-processing) | Minerals and Money |
| 7 Jan, 1 Apr 2027 | Bank of Tanzania MPC | `data/mpc_calendar.json` | Tanzania bills |
| 28 Jan, 18 Mar, 27 May, 22 Jul, 29 Sep 2027 | SARB MPC | `data/mpc_calendar.json` | Rates |
| Feb 2027 (NOT PUBLISHED) | AU Assembly, with the first annual AfCFTA progress report | tralac decision above | AfCFTA scorecard |
| 8–11 Feb 2027 | Mining Indaba, Cape Town | [Trade Commissioner](https://www.tradecommissioner.gc.ca/en/trade-events-training/2027/02/mining-indaba.html) | Minerals and Money Q1 |
| Late Feb 2027 (expected; 2026's was on 25 Feb) | South Africa Budget | [BusinessDay](https://www.businessday.co.za/politics/2026-02-25-watch-live-finance-minister-enoch-godongwana-delivers-budget-2026-speech/) | Budget to Auction |
| Mid-Apr 2027 (NOT PUBLISHED; 2026's ran 13–18 Apr) | IMF/World Bank Spring Meetings and REO | [World Bank](https://www.worldbank.org/en/meetings/splash/spring) | State of African Local Debt |
| 11–13 May 2027 | Invest in African Energy, Paris | [Zawya](https://www.zawya.com/en/press-release/africa-press-releases/invest-in-african-energy-iae-2027-in-paris-strengthens-its-role-as-africas-premier-capital-allocation-and-deal-fm3e406c) | Tariff watch |
| May 2027 (NOT PUBLISHED; 2026's ran 25–29 May) | AfDB Annual Meetings | [ABR Network](https://abrnetwork.org/?p=2982) | DFI flows |
| May–Jun 2027 | Kenya Finance Bill 2027 hearings | Pattern of 2026 ([Capital FM](https://capitalfm.africa/parliament-to-conclude-finance-bill-2026-public-hearings-as-submissions-deadline-lapses/)) | Tax tracker |
| Mid-Jun 2027 (expected; 2026's was 11 Jun, an EAC common date) | Kenya, Uganda and Tanzania budget day | [The Star](https://www.the-star.co.ke/news/2026-05-28-tresuary-to-unveil-202627-budget-statement-in-parliament-on-june-11) | Budget to Auction, three markets |
| Rolling | CBK MPC (posted after each meeting), CBN MPC, CBE MPC | `data/mpc_calendar.json` (CBN, CBE: NOT PUBLISHED) | Rates |
| Quarterly (end Dec, Mar, Jun, Sep) | DRC cobalt quota review window | [Fastmarkets](https://www.fastmarkets.com/insights/drc-may-reduce-cobalt-quota-if-market-needs-rebalancing-arecoms-says-exclusive/) | Minerals and Money |
| Nov 2027 (just beyond the window) | Nigeria 6.5% USD 1.5bn Eurobond matures; IATF2027 in Lagos, 5–11 Nov | VERIFIED `data/eurobonds.json`; [African Business](https://african.business/2026/03/trade-investment/nigeria-signs-hosting-agreement-for-intra-african-trade-fair-2027) | Countdown series from Q2 2027 |

Rating reviews: the agencies publish their 2027 sovereign calendars around December (2026's CI calendar was issued in Dec 2025, linked above). Add the dates when they are published. Until then they are **NOT PUBLISHED**.

## 3. Three "only Afronomics" trackers we can launch for readers within 30 days

All three are reader pages and editorial products, not API datasets. They add no paid line and do not jump the D-004 queue. Each row carries a source link and a "read on" date, as the rest of the site does. Each costs at most S.

### 3A. IMF and Debt-Relief Tracker (`/tracker/imf`), S
- **Why only us.** The IMF publishes this country by country, in tables built for officials. Nobody lays it out for Africa next to the country's own auction yields. We hold those for 18 countries.
- **Sources.** [IMF Financial Data by Country](https://www.imf.org/external/np/fin/tad/exfin1.aspx) (outstanding credit, arrangements); [IMF MONA](https://www.imf.org/external/np/pdr/mona/index.aspx) (review schedule, conditionality); IMF country press
  releases (Board dates, disbursements; e.g. [Zambia, 9 Oct 2026](https://www.imf.org/en/news/articles/2026/10/09/pr26331-zambia-new-ecf)); Official Creditor Committee and finance-ministry statements for restructurings.
- **Spec.** One row per African country with an IMF arrangement or restructuring: facility, approval date, length, access (SDR and USD), disbursed to date, last Board date, next review (marked "IMF schedule" or "expected (press)"), outstanding credit (SDR),
  latest auction yield (from our data). A **restructuring ladder** for Zambia, Ghana and Ethiopia: request → OCC MoU → bondholder AIP → OCC comparability → exchange done, each step dated and linked.
- **Build.** About 25 rows entered by hand in `data/imf_tracker.json` in week 1. A monthly check reads the exfin1 page per country from GitHub Actions (the sandbox proxy blocks imf.org) and flags any difference for an editor; no automatic overwrite. It feeds
  the monthly Debt Clock and a Telegram post on each Board decision.
- **Done when.** The page lists ≥20 countries, each with a source link, and the Zambia Board decision is posted within one working day of the IMF release.

### 3B. "The Fixture List": the African money calendar (`/calendar`, plus an `.ics` feed), S
- **Why only us.** Terminals have calendars, but no free calendar puts African MPCs, auction days, budget days, IMF Boards and Eurobond maturities in one place with a source on every row. We already hold most of the inputs.
- **Sources.** `data/mpc_calendar.json` (VERIFIED: SARB, BoG, BoT and RBM dates, each with its own URL); upcoming auction dates from each publisher's calendar (entered by hand; `lib/data/auction-week.ts` holds results, not schedules); maturities and coupons
  from `data/eurobonds.json` (DMO, CBK); the [FAO release dates](https://www.fao.org/worldfoodsituation/FoodPricesIndex/en); treasury notices (e.g. the [SA
  MTBPS](https://www.treasury.gov.za/comm_media/press/2026/2026083101%20Media%20Advisory%20-%202026%20MTBPS%20Lockup%20Registration%20is%20open.pdf)); IMF Board dates from 3A; agency rating calendars once published.
- **Spec.** Each event has a date, a country, a type (MPC, auction, budget, IMF, rating, maturity, data release), a status (`confirmed` / `expected` / `not published`), a source URL and the Afronomics page that will carry the result. It produces a public
  `.ics` feed, a Monday "Week Ahead" block for the Weekly and Telegram, and a filter by country.
- **Build.** A typed JSON file plus one page and one route. It reuses the MPC calendar reader. Editors add budget and IMF rows. **Never show a date that is not published as if it were confirmed.**
- **Done when.** The next 30 days of events for 10 or more markets are listed, the `.ics` feed opens in Google Calendar, and the first Week Ahead goes out.

### 3C. Real-Yield Board: "Is your T-bill beating inflation?" (`/markets/real-yields`), S
- **Why only us.** `sector-opportunities.md` notes that nobody publishes an auction-implied real yield after every auction. We have the auctions. The only missing input is one CPI figure a month per country.
- **Sources.** Our bill and bond auctions (VERIFIED, 10 markets); `data/policy_rates.json`; headline CPI typed in each month from the official release: [KNBS](https://www.knbs.or.ke) (advance release calendar:
  [PDF](https://www.knbs.or.ke/wp-content/uploads/2025/11/ADVANCE-RELEASE-CALENDAR-FY-2025-2026-1.pdf)), [NBS Nigeria](https://nigerianstat.gov.ng), [Stats SA](https://www.statssa.gov.za), [GSS](https://statsghana.gov.gh), [UBOS](https://www.ubos.org),
  [ZamStats](https://www.zamstats.gov.zm), [NBS Tanzania](https://www.nbs.go.tz), [CAPMAS](https://www.capmas.gov.eg), [NSO Malawi](https://www.nsomalawi.mw), [INE Mozambique](https://www.ine.gov.mz).
- **Spec.** For each market: the latest 91-day (or nearest) bill yield, the latest benchmark bond yield, the policy rate, headline CPI year on year (with month and link), and the simple real yield (nominal minus CPI). The method is stated: ex-post, not
  compounded, not a forecast. The board ranks markets and keeps a 12-month sparkline from our history. Caveat it shows: Nigeria's CPI was rebased and then revised in Jan 2026 (V press, [Stops and Gaps](https://stopsandgaps.substack.com/p/the-nbs-backtracks)).
- **Build.** About 10 numbers entered by hand each month in `data/cpi_manual.json`, plus one page. **There is no CPI reader and no API endpoint.** That stays gated as sector #4 until ≥3 pilots answer "inflation" on the pilot form.
- **Done when.** Ten markets show a real yield with both source links, and each CPI release is reflected within one working day.

## 4. What could make us obsolete, and what to watch

| Threat | Signal to watch | Evidence today | Our response |
|---|---|---|---|
| Publishers ship clean data (central banks and DMOs post machine-readable auction results or APIs), so harmonisation loses value | A new CSV or API on CBK, CBN, DMO or BoG pages; `data_health.py` sees the page format change | Several banks still load by script (VERIFIED, `data/mpc_calendar.json` "not_published") | Compete on history, cross-country harmonisation and published latency (`master-plan-v2.md` item 1); become the first redistributor of their feed |
| Global vendors add African local auctions because GBI-EM Edge weights Africa about 44.5% (D-004) | Bloomberg, LSEG or Cbonds release notes on African auctions | Cbonds already publishes African bond-volume indices ([Cbonds](https://cbonds.com/indexes/26689/)) | Price at a tenth of a seat; sell redistribution to them (`partners-and-revenue.md` line 1) |
| AI answer engines take the click | Search impressions rise while clicks fall in Search Console | Pew: 8% of visits clicked a result when an AI summary appeared, vs 15% without ([Pew](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links/)) | Be the cited source: `llms.txt` (exists), Dataset markup, an MCP/API connector after the first payer; send alerts directly (email, Telegram, `.ics`) so we do not depend on search |
| Rights challenges to redistribution | A publisher's terms change, or a takedown | The DMO says its Eurobond prices come from Bloomberg (VERIFIED, `data/eurobonds.json` note) | Keep official-source provenance; drop or license anything the publisher took from a vendor; F3 licence text |
| Public-good rivals: AfCRA, AU/AfDB portals, academic databases (Kiel/ADD) | AfCRA publishes ratings with data; AfDB or AFMI launch a bond portal | AfCRA launch set for 7 Oct 2026 ([Nairametrics](https://nairametrics.com/2026/09/02/au-to-launch-african-credit-rating-agency-on-october-7/)) | Partner, don't fight: cite them and be their daily feed |
| Data startups with agent connectors | Briter-style MCP or API bundles that add debt data | Briter sells an MCP connector (`competitive-landscape.md`) | Our own connector after the first payer; a licence to them instead |
| Regulatory risk to the consumer side | The CIS advertising rule; crypto promotion rules under the VASP regulations | Kenya LN 173/2023 (D-007); Kenya VASP regulations ([Khusoko](https://khusoko.com/2026/07/28/kenya-vasp-regulations-2026-capital-requirements/)) | The Digital-Money Rulebook reports rules and **never** promotes venues; legal check (F3) |
| A single point of failure in the readers | Proxy blocks or site redesigns (imf.org and the CBK were unreachable from the sandbox on 13 Oct) | VERIFIED today | Run every reader in Actions; health checks on every new source; human confirmation on 3A |

**Honest reading.** None of these themes changes the revenue path in `master-plan-v2.md`. The first invoice still comes from the debt wedge. What they add is reasons to come back: three cheap trackers (3A–3C) that create news on fixed dates, and a calendar
that keeps a story ready for every MPC, budget, IMF Board and COP. They also create evidence for which gated dataset to build next. Themes 1, 3 and 5 sit on the sector-#3 and #4 datasets, theme 2 on sector #1, and theme 9 on #2 and #5. Review this scan quarterly. Drop a theme that has produced no reader return or pilot question after two quarters.

