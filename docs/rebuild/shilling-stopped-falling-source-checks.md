# Source checks: "The shilling that stopped falling" Receipt

Receipt: `content/receipts/2026-10-15-shilling-stopped-falling.md` (status `draft`). Checked 15 October 2026.

Research note: the desk sandbox cannot open external sites, so every CBK document was read through the GitHub Actions
Probe workflow (`scripts/probe.py`) on 15 October 2026:

- **Job 116660159333** (run 38804041929): CBK Weekly Bulletins of 19 Jan, 2 Feb, 9 Feb, 16 Feb and 23 Feb 2024, pages 1-3;
  CBK MPC press release of 3 April 2024 (2 pages, full text).
- **Job 116660257548** (run 38804070549): CBK weekly-bulletin listing page (links), used only to find bulletin URLs.
- **Job 116663245183** (run 38804941311): CBK Weekly Bulletins of 1, 8, 15 and 22 Dec 2023; 5, 12 and 26 Jan 2024;
  8 and 28 Mar 2024; 28 Jun, 27 Sep and 20 Dec 2024; 28 Mar, 27 Jun, 26 Sep and 24 Dec 2025; 27 Mar, 26 Jun and
  9 Oct 2026, pages 1-2.

All exchange rates are the CBK "indicative mean rate" in Table 1 (Kenya Shilling Exchange Rates), USD column, PDF p. 2,
unless stated. Our own data files hold no CBK exchange-rate series (`lib/data/fx.ts` reads ExchangeRate-API, not the CBK),
so nothing here comes from `data/` except the remittance-cost row. "Unconfirmed" rows are in the Receipt's `verify` list.

## Exchange rates

| Figure in the Receipt | Source / exact row seen | Status |
| --- | --- | --- |
| KES 153.15 on 30 Nov 2023 | Bulletin 1 Dec 2023, Table 1: `30-Nov-23 153.15`; p. 1 "exchanged at KSh 153.15" | Matches (job 116663245183) |
| KES 154.69 on 21 Dec 2023 | Bulletin 22 Dec 2023, Table 1: `21-Dec-23 154.69` | Matches (job 116663245183) |
| KES 157.39 on 4 Jan 2024 | Bulletin 5 Jan 2024, Table 1: `4-Jan-24 157.39`; p. 1 "exchanged at KSh 157.39" | Matches (job 116663245183) |
| KES 160.24 on 15 Jan 2024 (first above 160) | Bulletin 19 Jan 2024 and 26 Jan 2024, Table 1: `15-Jan-24 160.24`; 12 Jan 159.85 | Matches (jobs 116660159333, 116663245183) |
| KES 160.79 on 18 Jan 2024 | Bulletin 19 Jan 2024, p. 1 "It exchanged at KSh 160.79 per US dollar on January 18"; Table 1 `18-Jan-24 160.79` | Matches (job 116660159333) |
| **KES 161.36 on 23 Jan 2024, weakest in the tables read** | Bulletin 26 Jan 2024 and 2 Feb 2024, Table 1: `23-Jan-24 161.36 205.39 175.81 ...` (22 Jan 160.25, 24 Jan 160.19) | Matches (jobs 116660159333, 116663245183). Highest USD value in every Table 1 row read: daily 17 Nov 2023 to 7 Mar 2024 except 8-9 Feb gap filled by the 16 Feb bulletin. All-time/full-series claim not made; full daily series Unconfirmed (verify item 1) |
| KES 8.01 lost, 13 Dec 2023 to 23 Jan 2024 | Bulletin 15 Dec 2023, Table 1 `13-Dec-23 153.35`; 161.36 − 153.35 = 8.01 | Matches (arithmetic) |
| KES 160.09 on 8 Feb 2024 | Bulletin 9 Feb 2024, p. 1 "exchanged at KSh 160.09 per US dollar on February 8"; Table 1 `8-Feb-24 160.09` | Matches (job 116660159333) |
| KES 153.20 on 15 Feb 2024 | Bulletin 16 Feb 2024, p. 1 "exchanged at KSh 153.20 per US dollar on February 15"; Table 1 `15-Feb-24 153.20` | Matches (job 116660159333) |
| KES 142.78 on 21 Feb 2024 | Bulletin 23 Feb 2024, Table 1 `21-Feb-24 142.78` | Matches (job 116660159333) |
| KES 142.07 on 7 Mar 2024 (chart) | Bulletin 8 Mar 2024, Table 1 `7-Mar-24 142.07` | Matches (job 116663245183) |
| KES 131.80 on 28 Mar 2024 | Bulletin 28 Mar 2024, p. 1 "exchanged at KSh 131.80"; Table 1 `28-Mar-24 131.80` | Matches (job 116663245183) |
| KES 129.15 on 27 Jun 2024 (chart) | Bulletin 28 Jun 2024, Table 1 `27-Jun-24 129.15` | Matches (job 116663245183) |
| KES 129.29 on 19 Dec 2024 (chart) | Bulletin 20 Dec 2024, Table 1 `19-Dec-24 129.29` | Matches (job 116663245183) |
| KES 129.29 on 26 Jun 2025 (chart) | Bulletin 27 Jun 2025, Table 1 `26-Jun-25 129.29` | Matches (job 116663245183) |
| KES 129.00 on 24 Dec 2025 (chart) | Bulletin 24 Dec 2025, Table 1 `24-Dec-25 129.00` | Matches (job 116663245183) |
| KES 129.63 on 25 Jun 2026 (chart) | Bulletin 26 Jun 2026, Table 1 `25-Jun-26 129.63` | Matches (job 116663245183) |
| **KES 129.94 on 8 Oct 2026 (today's rate)** | Bulletin 9 Oct 2026, p. 1 "It exchanged at KSh 129.94 per U.S. dollar on October 8, compared to KSh 129.71 on October 1"; Table 1 `08-Oct-26 129.94` | Matches (job 116663245183). Latest bulletin listed on the CBK page (job 116660257548); the 16 Oct bulletin is not out on 15 Oct. Same figure as the published Eurobond buyback Receipt |
| Band KES 128.55 to 129.94, 14 Jun 2024 to 8 Oct 2026, ten bulletins | Lowest row: Bulletin 28 Jun 2024 `21-Jun-24 128.55` and `24-Jun-24 128.55`; highest: `08-Oct-26 129.94`. Ten bulletins: 28 Jun, 27 Sep, 20 Dec 2024; 28 Mar, 27 Jun, 26 Sep, 24 Dec 2025; 27 Mar, 26 Jun, 9 Oct 2026 (two weeks of daily rows each). Other rows: Sep 2024 129.18-129.30; Mar 2025 129.37-129.51; Sep 2025 129.24-129.26; Dec 2025 128.93-129.00; Mar 2026 129.30-129.72; Jun 2026 129.39-129.66 | Matches the rows read; days between samples Unconfirmed (verify item 2). Text says "in every CBK table we read" |
| Moved less than KES 1.40 | 129.94 − 128.55 = 1.39 | Matches (arithmetic) |

## Policy, the Eurobond and reserves

| Figure / claim | Source / exact text seen | Status |
| --- | --- | --- |
| MPC raised CBR from 12.5% to 13.0% on 6 Feb 2024 | Bulletin 9 Feb 2024, p. 1: "During its Meeting on February 6, 2024, the Monetary Policy Committee (MPC) raised the Central Bank Rate (CBR) from 12.5 percent to 13.0 percent." | Matches (job 116660159333) |
| Quotes "the continued, albeit reduced pressures on the exchange rate"; "residual pressures on the exchange rate" | Same page: "the MPC noted the continued, albeit reduced pressures on the exchange rate ... as well as addressing residual pressures on the exchange rate." | Matches |
| New six-year US$1.5bn Eurobond, 9.75% coupon, for liability management of the June 2024 Eurobond | Bulletin 16 Feb 2024, p. 1: "The Kenya Government successfully issued a new six year Eurobond of USD 1.5 billion, to be used to finance liability management operations relating to the Eurobond set to mature in June 2024. The Eurobond was issued at a coupon rate of 9.75 percent, with a yield of 10.3 percent." | Matches (job 116660159333) |
| CBK: "its previous measures have lowered inflation, addressed the exchange rate pressures, and anchored inflationary expectations" | MPC press release 3 Apr 2024, p. 2, same words ("The MPC noted that its previous measures ...") | Matches (job 116660159333) |
| Fuel inflation fell "largely reflecting the impact of the shilling's appreciation which resulted in a decrease in electricity prices and a downward adjustment in pump prices" | MPC press release 3 Apr 2024, p. 1, same words | Matches |
| Usable reserves US$6,814m, 3.64 months, 18 Jan 2024 | Bulletin 19 Jan 2024, Table 2: `18-Jan-24 6,814` and months `3.64`; p. 1 "USD 6,814 million (3.6 months of import cover)" | Matches (job 116660159333) |
| "endeavor to maintain at least 4 months of import cover" | Bulletin 19 Jan 2024, p. 1, same words (the bulletin also says "This meets the CBK's statutory requirement", although 3.6 < 4; the Receipt states only the numbers) | Matches |
| Reserves US$14,736m, 5.9 months, 8 Oct 2026 | Bulletin 9 Oct 2026, p. 1 "USD 14,736 million (5.9 months of import cover) as of October 8"; Table 2 `08-Oct-26 14,736`, `5.9` | Matches (job 116663245183) |
| Label changed from "usable" by Dec 2025 | Bulletin 26 Sep 2025 Table 2 "CBK Usable Foreign Exchange Reserves (USD Million)*", footnote "*Excludes encumbered reserves", 10,735; Bulletin 24 Dec 2025 Table 2 "CBK Foreign Exchange Reserves (USD Million)", 12,168, no footnote | Matches what the tables say; whether the definition changed is Unconfirmed (verify item 3) |
| Eurobond cost cross-reference | Published Receipt `/receipts/2026-10-15-eurobond-buyback-2024` | Linked, not restated beyond the CBK coupon |

## Households, remittances and oil

| Figure | Source / working | Status |
| --- | --- | --- |
| 19.5% fewer shillings per dollar | (161.36 − 129.94) / 161.36 = 19.47% | Matches (arithmetic) |
| KES 31.42 gap | 161.36 − 129.94 = 31.42 | Matches (arithmetic) |
| US$10,000 loan: KES 1,613,600 vs 1,299,400; KES 314,200 less | 10,000 × 161.36; 10,000 × 129.94; difference 314,200 | Matches (arithmetic) |
| US$5,000 fees: KES 806,800 vs 649,700; KES 157,100 less | 5,000 × each rate | Matches (arithmetic) |
| US$500 a month: KES 80,680 vs 64,970; KES 15,710 less | 500 × each rate | Matches (arithmetic) |
| A year: KES 968,160 vs 779,640; KES 188,520 less | 12 × 80,680; 12 × 64,970; 12 × 15,710 | Matches (arithmetic) |
| Remittances 12 months to Nov 2024 US$4,872m, up 16.7% from US$4,175m; US 53.4% | Bulletin 20 Dec 2024, p. 1: "The cumulative inflows for the 12 months to November 2024 increased by 16.7 percent to USD 4,872 million compared to USD 4,175 million in a similar period in 2023 ... The US remains the largest source of remittances to Kenya, accounting for 53.4 percent in November 2024." | Matches (job 116663245183) |
| US to Kenya cost 5.2% for the equivalent of US$200, Jan-Mar 2025 | `data/remittances/corridors.json`, period `2025_1Q`, corridor src USA, dst KEN, `avg_cost_pct` 5.2 (31 services) | Matches our data file |
| Murban US$78.47 a barrel on 18 Jan 2024 | Bulletin 19 Jan 2024, p. 1: "Murban oil price rose to USD 78.47 per barrel on January 18" | Matches (job 116660159333) |
| Murban US$101.67 a barrel on 8 Oct 2026 | Bulletin 9 Oct 2026, p. 1: "Murban crude oil prices increased to USD 101.67 per barrel on October 8" | Matches (job 116663245183) |
| Barrel in shillings KES 12,617 → 13,211, up 4.7% | 78.47 × 160.79 = 12,617.19; 101.67 × 129.94 = 13,211.00; 13,211.00 / 12,617.19 = 1.0471 | Matches (arithmetic). Benchmark, not Kenya's landed fuel cost |
| Kenya's landed fuel import cost | No primary source found in this pass (EPRA pump-price notices not opened) | Not used; the Receipt says so |

## Calls

| Call | Settled by | Note |
| --- | --- | --- |
| CBK rate between KES 125 and 135 on 31 Mar 2027 | CBK Weekly Bulletin, Table 1 | Today 129.94 |
| CBK rate above KES 129.94 on 31 Mar 2027 | CBK Weekly Bulletin, Table 1 | Directional; drift since Sep 2026 (129.62 on 25 Sep to 129.94 on 8 Oct) and reserves down from 15,253 (10 Sep) to 14,736 (8 Oct), Bulletin 9 Oct 2026 Table 2 |
| Reserves at least 5 months of import cover, last bulletin of March 2027 | CBK Weekly Bulletin, Table 2 | Today 5.9 |

## Disclosure

`[founder to confirm]`: the owner's holdings file was not checked for US-dollar loans, deposits or currency positions.
