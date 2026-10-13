# Country pricing: a proposal (13 Oct 2026)

**Status: PROPOSAL ONLY.** Nothing here changes a live price, `lib/billing/*`, Paystack plans or the site. Prices
are the founder's decision. Labels: **VERIFIED** (our code or database, or a primary page), **SOURCED** (a
third-party page, cited, not re-checked at source), **ESTIMATED** (reasoned, not measured). The research tools could
search but not open pages, so every figure below comes from a search extract. Re-check before quoting it externally.

## 1. What we sell today (VERIFIED, `lib/billing/ratecard.ts`, `plans.ts`, `app/api/checkout/route.ts`)

- **Institutional ladder (data licences):** Analyst USD 250 a month, Team and API USD 1,500, Enterprise from USD
  5,000, with a 30-day free pilot. Always invoiced in USD and never sold through checkout.
- **Readers:** Open (free); Pro KES 1,500 a month (KES 15,000 a year); Team KES 6,000 (five seats); Kenya desk
  trial KES 200 for 14 days; WhatsApp auction alerts KES 300; Sunday SMS KES 100 (not launched yet).
- **Kenya institutions:** Investment Committee Pack KES 12,000; Pack with alerts KES 18,000; single pack KES
  1,000; benchmarking KES 40,000 a quarter; Startup licence KES 7,500; widget KES 40,000; listings; tender alerts
  KES 500 (parked, D-002).
- **Checkout:** one Paystack account that charges **KES only**. `PAYSTACK_CURRENCY=USD` switches Pro to USD 12
  and Team to USD 49. A Nigerian or South African reader pays in KES, and their card converts the charge.
  `KES_PER_USD = 129`.
- **Where readers come from** (VERIFIED, `page_views`, last 30 days): KE 284 views (28 visitors), IE 151, US 118,
  NL 35, NG 18 (12 visitors), ZA 16 (6). No views from UG, TZ, RW, GH, EG, MA, ZM, MW, MZ or XOF countries. The
  IE and NL traffic is probably cloud or bot traffic (ESTIMATED).

**What this means:** outside Kenya, local prices will barely move reader revenue until there is reader traffic. They
matter most for the **second wedge**, domestic institutions (D-004 kill path), and for not losing a buyer who sees
"KES" or "USD 250" and assumes the product isn't for them.

## 2. Inputs per market

GDP per capita PPP 2025 (IMF WEO April 2026 via [Worldometer, GDP by country PPP](https://www.worldometers.info/gdp/gdp-by-country/?region=africa&year=2025&metric=ppp)).
That site shows two vintages that differ by 5–15% (its [per-capita table](https://www.worldometers.info/gdp/gdp-per-capita/?region=africa&year=2025&metric=ppp)
is higher). The lower set is used throughout. FX is the mid-market rate on the date given (SOURCED).

| Market | PPP/cap | USD rate (date) | Analyst/treasury pay, a month | Local comparables |
|---|---|---|---|---|
| Kenya (KES) | 6,644 | 129.7 (11 Oct) [Xe](https://www.xe.com/en-us/currencyconverter/convert/?Amount=1&From=USD&To=KES), [Forbes](https://www.forbes.com/advisor/money-transfer/currency-converter/usd-kes/) | KES 92k median, Nairobi ([Glassdoor](https://www.glassdoor.com/Salaries/nairobi-kenya-financial-analyst-salary-SRCH_IL.0,13_IM1085_KO14,31.htm)) | Business Daily premium KES 350 ([Subger](https://subger.com/en/service/business-daily-ke)) |
| Uganda (UGX) | 3,273 | 3,751 (28 Aug) [currencyconvert](https://currencyconvert.online/usd/ugx) | not found | USE debt data UGX 1m a month local vs USD 500 international ([USE price list](https://www.use.or.ug/sites/default/files/USE%20Data%20Vending%20Pricing%20-%20%20Approved.pdf)) |
| Tanzania (TZS) | 4,221 | 2,655 (5 Aug) [Tradersunion](https://tradersunion.com/currencies/price/usd-tzs/) | not found | not found |
| Rwanda (RWF) | 3,711 | 1,463 (1 Aug) [currencyconvert](https://currencyconvert.online/usd/rwf) | not found | not found |
| Nigeria (NGN) | 9,087 | about 1,376 (undated, recent) [Pluang](https://pluang.com/en/tools/currency-converter/usd-ngn) | NGN 242k net ([MySalaryScale](https://www.mysalaryscale.com/salary/financial-analyst--t)) | Stears NGN 4,000 a month or NGN 35,000 a year ([FAQ](https://api.stearsng.com/faq/)); BusinessDay NGN 835–1,500 (old, [BusinessDay](https://businessday.ng/life-arts/article/letter-from-the-publisher/)); FMDQ licences NGN 13–34m a year (competitive-landscape.md) |
| Ghana (GHS) | 8,020 | 11.77 (10 Oct) [moneyexchangerate](https://moneyexchangerate.org/currencyexchange/usd/ghs/25) | GHS 3.1k–7.6k ([Paylab](https://www.paylab.com/gh/salaryinfo/banking/financial-analyst?lang=en)) | B&FT e-paper (price not found) |
| Egypt (EGP) | 19,094 | 49.81 (6 Aug) [goldpricez](https://goldpricez.com/currency-rates/egypt) | EGP 9k–75k, sources conflict ([Payscale](https://www.payscale.com/research/EG/Job=Financial_Analyst/Salary)) | Enterprise is free, paid for by advertisers ([Enterprise](https://enterpriseam.com/about-us/)) |
| Morocco (MAD) | 10,415 | 9.37 (25 Jul) [currencyconvert](https://currencyconvert.online/usd/mad) | not found | Le Desk 80 DH for one month, 40 DH a month on the annual plan; Médias24 paywall since 2023 ([Médias24](https://medias24.com/2023/05/02/medias24-lance-son-offre-abonnements/)) |
| South Africa (ZAR) | 15,456 | 16.36 (11 Aug) [KeyCurrency](https://keycurrency.co.uk/convert-usd-to-zar/) | ZAR 31.7k ([Indeed](https://za.indeed.com/career/financial-analyst/salaries)) | BusinessLIVE R129 a month, Premium Plus R369 ([FAQ](https://www.businesslive.co.za/subsfaqs/)); News24 R75 ([Subger](https://subger.com/en/za/service/news24-premium)); Daily Maverick pay what you want from R75 (2018); JSE L2 terminal R456 per user a month (2021, [JSE](https://www.jse.co.za/sites/default/files/media/documents/2021-05/JSE%20Market%20Data%20Training%20-%2014%20April%202021.pdf)) |
| Zambia (ZMW) | 4,215 | 18.72 (3 Aug) [currencyconvert](https://currencyconvert.online/usd/zmw) | not found | not found |
| Malawi (MWK) | 1,858 | 1,734 (22 Jul) [fx-rate](https://fx-rate.net/MWK/USD/) | not found | not found |
| Mozambique (MZN) | 1,705 | 63.9 (29 Sep) [currencyconvert](https://currencyconvert.online/usd/mzn/20) | not found | not found |
| CI / SN (XOF) | 7,669 / 5,071 | about 567: the peg of 655.957 per EUR, at EUR/USD 1.156 (9 Aug) [currencyconvert](https://currencyconvert.online/eur/usd) | not found | Sika Finance premium from XOF 40,000, period not stated ([Sika](https://www.sikafinance.com/marches/le-classement-global-des-banques-les-plus-profitables-de-cote-divoire-et-du-senegal_20058)) |
| Global (USD) | n/a | 1 | n/a | Finance newsletters USD 10–30; Stears USD 10 a month; Trading Economics API about USD 149–299 a month (ESTIMATED, competitive-landscape.md) |

**Payments (SOURCED).** Paystack channels: cards on every account; **mobile money only for Ghana, Kenya and Côte
d'Ivoire businesses**; Pesalink for Kenyan businesses ([docs](https://paystack.com/docs/payments/payment-channels/)).
M-Pesa through Paystack: up to KES 250,000 per transaction and **no recurring billing** ([help](https://support2.paystack.com/hc/en-us/articles/9741649633052-Pay-with-M-PESA)).
**Subscriptions charge cards only** ([help](https://support.paystack.com/hc/en-us/articles/360009881520-Subscriptions)).
A Kenyan account takes cards, Apple Pay and M-Pesa and settles in KES or USD ([blog](https://paystack.com/blog/company-news/kenya)).
USD collection is open only to Kenyan and Nigerian businesses, at 3.8% for international cards ([help](https://support.paystack.com/hc/en-us/articles/360009973799-Can-I-accept-payments-in-USD-)).
Charging NGN, GHS or ZAR needs a **separate Paystack business account for each currency**
([Chargebee docs](https://www.chargebee.com/docs/payments/2.0/payment-gateways-and-configuration/paystack)).
Egypt and Rwanda appear only as "notify me" on [paystack.com/countries](https://paystack.com/countries). Côte d'Ivoire
has MTN and Orange money and cards ([beta post](https://paystack.com/blog/company-news/civ-rwanda-egypt-beta)).
Flutterwave lists mobile money for UGX, RWF and TZS, cards plus mobile money for XOF, and cards plus Fawry for EGP.
It lists no MAD ([docs](https://developer.flutterwave.com/v3.0/docs/payment-methods)). Ghana's mobile money moved
GH¢4.54tn in 2025 ([Ghanaian Times](https://ghanaiantimes.com.gh/mobile-money-transactions-hit-gh¢4-54trn-in-2025-bog/)).
Moroccan card e-commerce was MAD 18bn in 2025, and cash on delivery is still common ([wafir](https://wafir.ma/en/actu/cmi-cartes-bancaires-maroc-2026-record-21-millions-paiements-tpe)).

## 3. The proposal: main table

**Reader price** is Pro, a month, followed by WhatsApp alerts. An alert price applies only once that market's
alert exists; today only Kenya has one. **Local-institution prices** are a month, per the qualification rule in §4.
Rounded USD equivalents are in brackets.

| Country | Currency | Payment methods (realistic, today → next) | Reader: Pro · alerts | Local-inst. Analyst | Local-inst. Team & API | Notes |
|---|---|---|---|---|---|---|
| Kenya | KES | M-Pesa, cards, Apple Pay, Pesalink (Paystack KE, live) | **KES 1,500** (12) · KES 300 | KES 16,000 (123) | KES 95,000 (732) | Unchanged reader prices. Local Analyst sits above the Pack (KES 12,000) |
| Uganda | UGX | USD card via Paystack → Flutterwave MTN/Airtel MoMo; invoice | UGX 30,000 (8) · UGX 6,000 | UGX 375,000 (100) | UGX 2,250,000 (600) | USE itself charges locals about 47% less than foreigners |
| Tanzania | TZS | USD card → Flutterwave mobile money; invoice | TZS 25,000 (9) · TZS 5,000 | TZS 265,000 (100) | TZS 1,600,000 (603) | No reader traffic yet |
| Rwanda | RWF | USD card → Flutterwave MoMo (Paystack RW not live) | RWF 12,500 (9) · RWF 2,500 | RWF 145,000 (99) | RWF 875,000 (598) | |
| Nigeria | NGN | USD card via Paystack KE (Nigerian cards have USD limits) → Paystack NG account (cards, transfer, USSD) | NGN 7,500 (5) · NGN 1,500 | NGN 175,000 (127) | NGN 1,000,000 (727) | PPP says about USD 13; comparables (Stears NGN 4,000) say much lower. Comparables win |
| Ghana | GHS | USD card → Paystack GH account (MoMo, cards) | GHS 100 (8) · GHS 20 | GHS 1,500 (127) | GHS 9,000 (765) | Pay is low relative to PPP |
| Egypt | EGP | USD card; invoice in USD → Flutterwave (cards, Fawry) | EGP 450 (9) · EGP 100 | EGP 7,500 (151) | EGP 45,000 (903) | High PPP but a weak pound and free competitors |
| Morocco | MAD | USD card; invoice in USD (no Paystack, no Flutterwave MAD) | MAD 99 (11) · MAD 20 | MAD 1,400 (149) | MAD 8,500 (907) | Le Desk 80 DH is the reader anchor |
| South Africa | ZAR | USD card → Paystack ZA account (cards, EFT) | ZAR 199 (12) · ZAR 39 | ZAR 2,450 (150) | ZAR 14,500 (886) | Under 2x BusinessLIVE (R129) |
| Zambia | ZMW | USD card; invoice → Flutterwave | ZMW 175 (9) · ZMW 35 | ZMW 1,850 (99) | ZMW 11,000 (588) | Kwacha moved about 18% in a year: FX rule applies |
| Malawi | MWK | USD card; invoice | MWK 12,000 (7) · MWK 2,500 | MWK 175,000 (101) | MWK 1,050,000 (606) | |
| Mozambique | MZN | USD card; invoice | MZN 450 (7) · MZN 100 | MZN 6,400 (100) | MZN 38,000 (595) | |
| CI / SN (WAEMU) | XOF | Paystack CI (Orange, MTN, cards) needs a CI account; USD card now → Flutterwave | XOF 5,000 (9) · XOF 1,000 | XOF 70,000 (123) | XOF 425,000 (750) | Peg to EUR keeps it stable |
| Global / rest of world | USD | Card via Paystack (USD enabled on the KE account), invoice, wire | **USD 15** (today USD 12) · USD 3 | USD 250 (list) | USD 1,500 (list) | Enterprise and redistribution: USD only, from 5,000, everywhere |

**How the reader numbers were set.** Kenya's USD 11.6 is the anchor. Each market starts at the anchor times √(PPP ÷
Kenya PPP), held between 0.6 and 1.3. A square root is used because finance professionals' pay differs between
countries less than average income does. That figure is then capped near 2–4x the leading local business
subscription, kept between USD 5 and 15, and rounded to a clean local number. Team (five seats) stays at 4x Pro in
every currency. **Annual = 10x monthly** (two months free; the current Pro rule). The **Open** tier stays free
everywhere (D-007: no consumer paywall). The 14-day trial stays Kenya-only until a market has local mobile money.

**Local-institution ladder.** There are three bands, each a share of the USD list. Band 1 at 60% (ZA, EG, MA):
USD 150 and 900. Band 2 at 50% (KE, NG, GH, XOF): USD 125 and 750. Band 3 at 40% (UG, TZ, RW, ZM, MW, MZ):
USD 100 and 600. The evidence is the Uganda Securities Exchange's own split: UGX 1m (about USD 267) for local
subscribers against USD 500 for international ones, about 47% off. Annual prepaid = 10x monthly. The pilot is the
same 30 days. Enterprise is never local-priced.

## 4. Who qualifies for a local-institution price (rule)

1. The contracting entity is **incorporated, headquartered and licensed** in that country: a pension scheme or
   administrator, SACCO, bank, insurer, MFI, broker or dealer, or local fund manager.
2. Its **ultimate parent is African and headquartered in the same country**. A Kenyan subsidiary of a non-African
   group (or of a pan-African group headquartered elsewhere) pays the USD list price, or the parent's band if the
   parent is African and the founder allows it (decision 1).
3. **All users sit in that country**, the data is used for the domestic book, and there is no redistribution.
4. Invoiced to the local entity and paid **from a local account**. The licence states the qualification, and a false
   claim moves the contract to list price from day one.
5. Global and regional asset managers, sell-side CIB desks and DFIs pay list price wherever their desk sits. These
   are the 100–180 core buyers, and they must not be undercut.

Geolocation **never** decides institutional price. It only picks the default currency shown.

## 5. How to show it (for when it is built; no code now)

- The default currency comes from `x-vercel-ip-country`. We already read it in `/api/hit`. It is set on every Vercel
  deployment, is not set locally, and fails behind a proxy ([Vercel](https://vercel.com/guides/geo-ip-headers-geolocation-vercel-functions)).
  Unknown and non-listed countries see USD.
- A manual **currency switcher** stored in a cookie overrides the header. Every price shows its code ("KES 1,500",
  "USD 15"), never a bare "$", with "≈ USD" underneath in grey.
- Keep pages statically cacheable: render the price table for all currencies and choose one on the client (or in
  middleware via a cookie), rather than making `/pricing` dynamic per country.
- The checkout charges the currency the account can take. Until local accounts exist, a non-KES buyer sees the
  local price and pays its **USD equivalent, fixed in the price table** (not converted live) by card. One rate-card
  table per currency replaces `KES_PER_USD` arithmetic.

## 6. Expected effect (ESTIMATED) and risks

- **Readers, next 6 months:** about USD 0–100 a month extra. Non-Kenyan African traffic is about 30 views a month
  (VERIFIED). The upside is removing a visible "this isn't for me" signal. It isn't revenue.
- **Local institutions:** the plan's second wedge (Kenya has about 1,000 schemes, usd-1m-plan.md). ASSUMED: at list
  price perhaps 2–3 of the first 50 local institutions convert; at 40–60% of list, perhaps 6–10. 8 × USD 125 =
  USD 1,000 a month against 3 × USD 250 = USD 750. The test is the D-004 rule applied to the Pack and Analyst offer.
- **Global buyers:** no change. Reader USD 12 → 15 is about +25% on the few USD Pro buyers (none today).
- **Risks:** (a) *Arbitrage.* VPN readers save about USD 6–10 a month, which isn't worth policing; prefer local
  payment methods (M-Pesa, MoMo) as the proof of country. Institutions are covered by contract (§4). (b)
  *Cannibalisation.* Pan-African banks (Standard Bank, Absa, top-10 prospects) asking for the local band; rule 2
  and rule 5 decide. (c) *FX.* (d) *Support load* of 13 currencies: launch only where we have traffic or a deal
  (KE, NG, ZA, then on request).
- **FX re-pricing rule:** check on the first of each quarter. Re-price a market when its **30-day average rate is
  more than 10% away** from the rate in the price table, or immediately on a move above 20% (a devaluation). Rounding
  stays to clean local numbers. Increases reach existing subscribers with 30 days' notice, at most once every 6
  months; decreases apply at once. Annual contracts are fixed for their term. Zambia would have triggered this rule
  in the past year (about 22.8 in Oct 2025 to 18.7 in Aug 2026, [CEIC](https://www.ceicdata.com/en/indicator/zambia/exchange-rate-against-usd)).

## 7. Decisions for the founder

1. **Approve the local-institution bands (60/50/40% of the USD list) and the qualification rule.** In particular,
   should African-headquartered groups' CIB and global-markets desks (Standard Bank, Absa) be excluded and pay list?
   Recommended: yes.
2. **Payment rails.** Phase 1: keep the one Kenyan Paystack account, show local prices and charge their fixed USD
   equivalent by card, with institutions invoiced. Phase 2: open Paystack NG, GH or ZA accounts, or Flutterwave for
   UG, TZ, RW, XOF and EG, so buyers can pay locally (mobile money, transfer). Choose whether and when to go to
   phase 2. Each new account means its own legal entity and KYC.
3. **Timing.** Publish the local-institution sheet now, sent on request with the pilot offer. Build the geo-priced
   reader page only after the paid gate (D-004/D-012). Approve the global reader price of USD 15 (today USD 12) and
   the 10% FX rule.
