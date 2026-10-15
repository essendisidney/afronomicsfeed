# Source checks: Fuliza true cost Receipt

Receipt: `content/receipts/2026-10-15-fuliza-true-cost.md` (status `draft`). Checked 15 October 2026.

Network note: the drafting machine cannot reach safaricom.co.ke or centralbank.go.ke. Every external page below was read
through the Probe workflow (`.github/workflows/probe.yml`) on 15 October 2026; the run is named for each check. Run ids
are GitHub Actions run ids in `essendisidney/afronomicsfeed` (job ids in brackets).

## Probe runs used

| Run (job) | What it read |
| --- | --- |
| 38804105258 (116660379495) | Safaricom Fuliza page, both URLs (`main-mpesa/.../fuliza` and `main-m-pesa/.../fuliza-mobile`): charges paragraph |
| 38804110904 (116660398980) | Same two pages: tariff table |
| 38804114511 (116660409930) | Safaricom investor-relations results and annual-report pages (links); CBK weighted average rates page |
| 38804485404 (116661676998) | Safaricom full-year results page (links to the FY26 booklet, presentation and press release) |
| 38804553395 (116661908057) | Safaricom FY26 Results Booklet, full text |
| 38804557488 (116661923758) | Safaricom FY26 Investor Presentation and Press Release, full text (no Fuliza figures used from them) |
| 38804155041 (116660547438) | CBK MPC press release of 7 October 2026 (run by another desk; read for the September lending rate, not used in the Receipt) |

## Checks

| Figure or claim in the Receipt | Source and exact text seen | Status |
| --- | --- | --- |
| "a one off 1% access fee"; daily fee "applied the next day at midnight or 00.00 hrs"; "20% Excise Duty on the daily maintenance fee" (quoted) | Safaricom Fuliza page, run 38804105258: "Fuliza Charges A customer will be charged a one off 1% access fee and a daily maintenance fee is applied the next day at midnight or 00.00 hrs. A customer will also be charged 20% Excise Duty on the daily maintenance fee." Same text on both URLs | Matches, quoted |
| Page last updated 23 June 2025 | Run 38803985847 (raw HTML of the fuliza-mobile URL): "Published: April 22, 2021 at 8:26 AM \| Last Updated: June 23, 2025 at 1:28 PM" | Matches |
| Tariff table: 0-100 KSh 0/0/0; 101-500 2.5/0.5/3; 501-1000 5/1/6; 1001-1500 18/3.6/21.6; 1501-2500 20/4/24; 2501-70000 25/5/30 | Run 38804110904: "FULIZA TARIFF Band Tariff 20% Excise Duty Total Charges 0 -100 KSh 0 KSh 0 KSh 0 101-500 KSh 2.5 KSh 0.5 KSh 3 501-1000 KSh 5 KSh 1 KSh 6 1001-1500 KSh 18 KSh 3.6 KSh 21.6 1501-2500 KSh 20 KSh 4 KSh 24 2501-70000 KSh 25 KSh 5 KSh 30". Also matches `data/kenya/mpesa_tariffs.json` `fuliza` | Matches |
| No "first three days free" on the current page | Run 38804105258: pattern included "three days"; no match on either URL | Matches (absence) |
| "A balance cleared before midnight on the day drawn pays only the access fee; each midnight unpaid adds that night's fee" | Our reading of "daily maintenance fee is applied the next day at midnight" | Interpretation of the quoted text; the calculator (`lib/mpesa-calc.ts`) uses the same model |
| Lenders: NCBA, KCB and Sidian Bank | FY26 Results Booklet p41, run 38804553395: "Fuliza In partnership with Kenyan lenders, NCBA, KCB and Sidian Bank, Safaricom Kenya operates an Overdraft (OD) facility dubbed 'Fuliza'... unsecured line of credit" | Matches |
| "charged a one-off access fee and daily maintenance fees on unpaid loan amounts" (context) | Booklet p41: "Customers who 'opt in' on Fuliza are charged a one-off access fee and daily maintenance fees on unpaid loan amounts based on a pre-determined matrix." | Matches |
| Disbursements KES 981.6bn (FY25), 1,465.8bn (FY26), +49.3% | Booklet p32, "c) Financial Services i. Lending FY26 FY25 % Change Fuliza Value of disbursements (KShs Bn) 1,465.8 981.6 49.3%" | Matches |
| Repayments 996.7bn / 1,487.3bn, +49.2%; 101.5% both years | Same table: "Value or Repayment (KShs Bn) 1,487.3 996.7 49.2% Repayment vs Disbursal rate 101.5% 101.5% (0.1ppt)" (the 0.1ppt change is rounding in the booklet) | Matches |
| Average ticket KES 241.2 / 217.9, −9.7% | Same table: "Average Ticket Size (KShs) 217.9 241.2 (9.7%)" | Matches |
| Revenue KES 4.1bn / 6.0bn, +46.0% | Same table: "Revenue (KShs Bn) 6.0 4.1 46.0%" | Matches |
| Distinct customers 7.9m / 17.7m, +123.7% | Same table: "Distinct Customers (Mn) 17.7 7.9 123.7%" | Matches |
| Year ended 31 March 2026 | Booklet cover: "AUDITED RESULTS FOR THE YEAR ENDED 31 MARCH 2026" | Matches |
| Booklet URL and 7 May 2026 date | Run 38804485404: "FY26 Results Booklet -> https://www.safaricom.co.ke/images/Downloads/FY26-Earnings-Booklet-2026-7th-May-2026.pdf" (date from the file name) | Matches |
| Bank average lending rate 14.34%, August 2026 | CBK weighted average rates page, run 38804114511: "2026 August 6.91 3.54 14.34 12.5" (Deposit, Savings, Lending, Overdraft). Also `data/kenya/rates.json` month 2026-08 | Matches |
| 364-day bill 9.0383% (shown as 9.04% in chart) | `data/kenya/tbill_auctions.json`, tenor 364, issue 2633, value date 2026-10-19, source URL as in the Receipt | Matches our file; PDF not re-opened |
| M-Shwari 9% flat including excise, one month | `data/kenya/mobile_loans.json`, row "M-Shwari loan", read_on 2026-10-05: "charged at 9% Being Loan Fees of 7.5% and 1.5% Excise Duty ... one month repayment period" | Matches our file; page not re-probed |
| KES 1,000, 1 night: KES 16; 1.6%; 584.0%; ~32,700% | 10 + 6 = 16; 16/1,000 = 1.6%; 1.6 × 365 = 584.0; 1.016^365 − 1 = 327.25 → 32,725% | Matches (arithmetic) |
| KES 1,000, 7 nights: KES 52; 5.2%; 271.1%; ~1,306% | 10 + 7 × 6 = 52; 5.2 × 365/7 = 271.1; 1.052^(365/7) − 1 = 13.06 → 1,306% | Matches (arithmetic) |
| KES 1,000, 30 nights: KES 190; 19.0%; 231.2%; ~730% | 10 + 30 × 6 = 190; 19 × 365/30 = 231.2; 1.19^(365/30) − 1 = 7.30 → 730% | Matches (arithmetic) |
| KES 100, 1 night: KES 1; 1%; 365%; ~3,678% | 1% access, daily fee 0 in the 0-100 band; 1.01^365 − 1 = 36.78 → 3,678% | Matches (arithmetic) |
| KES 100 for 30 nights still KES 1, about 12% a year | 1 / 100 × 365/30 = 12.2% | Matches (arithmetic) |
| KES 1,001 for 7 nights about KES 161; nightly fee 3.6 times | 10.01 + 7 × 21.6 = 161.21; 21.6 / 6 = 3.6 | Matches (arithmetic) |
| Bank: KES 1,000 for 30 days about KES 11.79 | 1,000 × 14.34% × 30/365 = 11.79 | Matches (arithmetic; ignores bank fees, as the text says) |
| T-bill: KES 1,000 for 30 days about KES 7.43 | 1,000 × 9.0383% × 30/365 = 7.43 | Matches (arithmetic) |
| M-Shwari KES 90 on 1,000; 109.5% simple | 9% × 1,000 = 90; 9 × 365/30 = 109.5 | Matches (arithmetic) |
| "Sixteen to forty times" the bank average | 231.2 / 14.34 = 16.1; 584.0 / 14.34 = 40.7 | Matches (arithmetic) |
| Average draw KES 217.9 is in the 101-500 band; KES 3 a night is about 1.4% | 3 / 217.9 = 1.38% | Matches (arithmetic) |
| "A shilling over can triple the bill" | 161.21 / 52 = 3.1 | Matches (arithmetic) |
| Fuliza revenue is Safaricom's line, not total customer fees; split with lenders not shown | Booklet p32 table shows only "Revenue (KShs Bn)"; no total-fee or lender-share line found in the booklet text | Matches (absence in the booklet) |
| Calculator routes `/rates/kenya/mpesa-charges` and `/rates/kenya/mobile-loans` | `app/rates/kenya/mpesa-charges/page.tsx`, `app/rates/kenya/mobile-loans/page.tsx` | Matches |
| Disclosure | `data/owner/holdings.json` not checked | Unconfirmed ([founder to confirm] placeholder) |

## Not used

- Press figures (Capital FM, Business Daily, Khusoko) on Fuliza growth: replaced by the booklet itself.
- The CBK MPC statement's 14.4% for September 2026: the Receipt uses the CBK table's latest month (August, 14.34%) so
  the figure, the tile and the chart share one source.
- Any estimate of total Fuliza fees paid (for example 1% of disbursements): the booklet does not say how draws and
  disbursements relate, so it was cut.
