# Competitive landscape (12 Oct 2026)

From five parallel research passes (global and African intelligence platforms; African local-debt data; official
bond-auction sources; African consumer money platforms; prospect institutions). Labels: **V** = verified from a
cited source (search extracts; several sites could not be opened, so re-check before quoting externally),
**E** = estimate with reasoning. Full source lists are in the research notes; the key ones are linked here.

## 1. The trigger, corrected

JPMorgan's GBI-EM Edge (frontier local-currency government bonds): about USD 328bn, 425 bonds, 26 countries, Africa
about 44.5% (**V**, [BusinessDay](https://businessday.ng/companies/article/africa-takes-44-5-of-jpmorgans-new-328bn-frontier-bond-index/)).
Reported African weights: Egypt 8% (cap), **Morocco 8% (cap)**, Nigeria 7.4%, Kenya 6.91%, **Tunisia 5.32%**, Uganda
4.84%, Zambia 0.52%, Ghana 0.27%, plus **Côte d'Ivoire and Angola**; Senegal not confirmed (**V**,
[Nairametrics](https://nairametrics.com/2026/09/14/j-p-morgan-includes-nigeria-in-new-emerging-market-bond-index-with-7-4-weight/)).
Eligibility: bonds of at least USD 250m with more than 2.5 years to maturity.

**What this means for us:** T-bills are not in the index. The product must be **bond auctions** (with bills as
short-end context), and our coverage must add Morocco, Tunisia, Côte d'Ivoire and Angola.

## 2. Who sells what, at what price

| Group | Players | Price signal | Africa depth | Where we stand |
|---|---|---|---|---|
| Terminals | Bloomberg, LSEG Workspace, FactSet, S&P Capital IQ | Bloomberg about USD 24–32k a seat a year; LSEG about USD 12–24k (**E**, third-party) | Deep but bundled; Bloomberg calculates the AfDB/AFMI African Bond Index | Every target buyer already has a seat; we must be the specialist layer, not a substitute |
| Bond reference and macro data | Cbonds, Trading Economics, CEIC, EMIS, Haver, Macrobond | Trading Economics API about USD 149–299 a month (**E**); others by quote | Headline yields and bond lists; not auction-level, harmonised history (**E**) | **Closest substitutes.** We win on auction-level detail, provenance per figure and small markets |
| OTC prices | ICAP Africa / Parameta (via LSEG), FMDQ | FMDQ data licences NGN 13–34m a year (**V**) | Dealer quotes in NG, KE, ZA, GH | **Do not compete**: secondary prices need exchange or dealer licences |
| Indices | JPMorgan, FTSE frontier EMGBI, S&P Africa Sovereign Bond, AfDB/Bloomberg ABABI, Absa AFMI (market-readiness) | n/a | Established | Only a niche or custom index is realistic, later |
| Country risk and research | EIU, Fitch/BMI, Oxford Economics, Capital Economics, Control Risks | EIU contracts to USD 80k a year (**V**) | Narrative and forecasts | Don't compete on narrative risk |
| Sell-side and frontier research | Standard Bank, Absa, RMB, Renaissance, Tellimer | Bundled with trading | Strong | **Partners or buyers**, not competitors |
| African data startups and media | Stears (USD 99 a year consumer; B2B was 75% of revenue by 2022, **V**), Briter, TechCabal Insights, Africa Confidential (about GBP 900–1,000 a year, **V**), Proshare (USD 25 a year, has asked readers for donations, **V**), african-markets.com (USD 10 a month), Cytonn (free weekly PDFs) | Low consumer prices | Country-focused, narrative or PDFs | Nobody found sells a harmonised, multi-country auction feed with an API |

## 3. The gap we fill (E, from the absence of any vendor offering it)

1. **Harmonised primary-auction data across many African countries**: offered, bid, accepted, cut-off, weighted
   average, bid-to-cover, per tenor and per bond, long history, an API, a source link for every figure.
2. **The small index markets** (Uganda, Zambia, Ghana) and the WAEMU markets, where terminal data is thinnest.
3. **The middle price band**: USD 3–20k a year sits empty between USD 25–120 retail and USD 12–32k terminals.
4. **Index-aware analytics**: auction calendars, issuance against targets, maturity walls, the Edge-eligible bond
   universe. No product found.

## 4. How to become number 1, defensibly

1. **Coverage of every African Edge market, bonds first**: Zambia, Egypt, UMOA-Titres (one reader for 8 WAEMU
   countries including Côte d'Ivoire and Senegal), Nigeria, South Africa backfill, Uganda, then Morocco, Tunisia,
   Angola.
2. **Speed with published latency**: time from the central bank's release to our structured record, measured and
   shown.
3. **Provenance**: every figure linked to its source document (and its hash); public corrections; open method.
4. **Derived data nobody else has**: auction-implied curves, bid-to-cover stress, the Edge-eligible universe,
   issuance against budget, maturity walls; later a licensable auction-yield index family.
5. **Workflow embedding**: Excel and Google Sheets, a Python package, S3 or Snowflake delivery, Slack or email alerts.
6. **Price ladder** (replaces the single USD 1,500 price): Analyst USD 250 a month; Team and API USD 1,500;
   Enterprise and redistribution from USD 5,000. Validate with 10–15 portfolio-manager interviews.
7. **Partners**: distribution through Tellimer, Daba or Semafor Africa; validation with AfDB AFMI or the Kiel
   Institute; marketplaces (Bloomberg App Portal, LSEG, Snowflake) once there is a track record.

## 5. Consumer side (what the evidence says)

- Paid consumer subscriptions for African data are weak: Stears pivoted to B2B, Proshare appealed for donations, and
  News24 needed a 60M-plus audience for about 110k subscribers (**V**).
- What works for small, trusted sites: free tools plus a newsletter, WhatsApp or Telegram audience, funded by
  sponsorship (TechCabal and Semafor Africa each reached about 100k newsletter subscribers, **V**).
- **Only remittance firms run public affiliate programmes**: WorldRemit about GBP 30 per new customer (**V**, search
  extract); Wise and Remitly smaller and unverified. Kenyan fund managers have no public cash programmes.
- **Kenya MMF comparison is crowded** (8+ SEO sites with conflicting yields); our edge is dated, sourced, net-of-tax
  figures. Safaricom's Ziidi (about 2M customers inside M-PESA, **V**) is the distribution giant to compare, not fight.
- **Legal flag:** Kenya's CIS Regulations 2023 (LN 173/2023) restrict advertising of collective investment schemes
  to licensed persons. Our "Open an account" fund buttons and any paid fund listing need a lawyer's view first.

## 6. Prospects

55 institutions with public evidence of need, loaded into the desk's deal log as "prospect" (no contact made). Top
10: Ninety One, Allan Gray (Africa ex-SA Bond Fund), William Blair (EM Frontier Debt), Ashmore (Frontier Blended),
Global Evolution, TCX, AfDB AFMI, Standard Bank CIB, Absa CIB, MCB Group (African Domestic Bond Fund ETF). The
estimated pool of serious buyers worldwide is 100–180 institutions (**E**), which caps this wedge at roughly USD
2–3m a year at list price: enough for the first milestones, not for USD 1m a month. That is why expansion to
adjacent datasets and buyers is built into the plan.
