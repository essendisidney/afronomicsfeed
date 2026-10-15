---
title: "The T-bill party is over: KES 500,000 in a one-year bill now earns KES 33,700 a year less"
date: "2026-10-15"
type: verdict
status: draft
sector: markets
entities:
  - "Central Bank of Kenya"
  - "National Treasury of Kenya"
  - "Capital Markets Authority"
series: kenya-tbills
verdict: "The fall from 17% to 9% is the price of lower inflation and cheaper loans, and the savers who treated 2024's rates as normal are the ones paying it."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "In April 2024 the 364-day Treasury bill paid 16.99%. At today's auction it paid 9.04%. On KES 500,000, that is KES 72,009 a year after tax then and KES 38,308 now. The CBK cut its rate from 13% to 8.75%, and savers moved to money market funds, which have grown from KES 171 billion to KES 460 billion in two years."
desk: "Afronomics Markets Desk"
disclosure: "[founder to confirm] Afronomics and its founder hold no Kenyan Treasury bills and no units in any money market fund."
sources:
  - name: "Afronomics auction file, CBK Treasury bill results"
    url: "https://www.centralbank.go.ke/bills-bonds/treasury-bills/"
    date: "2026-10-19"
  - name: "Afronomics auction file, CBK Treasury bill results of 25 March 2024"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/715918254_RESULTS%202570-091%202543-182%202497-364%20%20DATED%2025-03-24.pdf"
    date: "2024-03-25"
  - name: "Afronomics auction file, CBK Treasury bill results of 1 April 2024"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/234245447_RESULTS%202571-091%202544-182%202498-364%20%20DATED%2001-04-24.pdf"
    date: "2024-04-01"
  - name: "Afronomics auction file, CBK Treasury bill results of 13 April 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1981948736_RESULTS%202677-091%202651-182%202606-364%20DATED%2013-04-2026.pdf"
    date: "2026-04-13"
  - name: "Afronomics auction file, CBK Treasury bill results of 19 October 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1647758237_RESULTS%202704-091%202678-182%202633-364%20DATED%2019-10-2026.pdf"
    date: "2026-10-19"
  - name: "CBK, MPC raises CBR to 13.00 percent"
    url: "https://www.centralbank.go.ke/2024/02/06/mpc-raises-cbr-to-13-00-percent/"
    date: "2024-02-06"
  - name: "CBK, MPC press release, meeting of 6 August 2024"
    url: "https://centralbank.go.ke/uploads/mpc_press_release/2095801539_MPC%20Press%20Release%20-%20Meeting%20of%20August%206%202024.pdf"
    date: "2024-08-06"
  - name: "CBK, MPC press release, meeting of 10 February 2026"
    url: "https://www.centralbank.go.ke/uploads/mpc_press_release/2101347475_MPC%20Press%20Release%20-%20Meeting%20of%20February%2010%202026.pdf"
    date: "2026-02-10"
  - name: "CBK, MPC press release, meeting of 7 October 2026"
    url: "https://www.centralbank.go.ke/uploads/mpc_press_release/224745454_MPC%20Press%20Release%20-%20Meeting%20of%20October%207%202026.pdf"
    date: "2026-10-07"
  - name: "CBK, Frequently asked questions on Government securities (Treasury bill withholding tax worked example)"
    url: "https://www.centralbank.go.ke/images/FAQs/FAQsGoKSecurities.pdf"
    date: "2026-10-15"
  - name: "Income Tax Act (Cap. 470), Third Schedule, resident withholding tax rates"
    url: "https://new.kenyalaw.org/akn/ke/act/1973/16/eng@2026-07-01"
    date: "2026-07-01"
  - name: "CMA, Collective Investment Schemes report, Q2 2024"
    url: "https://www.cmarcp.or.ke/images/Docs/2024/CIS_Report_Q2-2024-3.pdf"
    date: "2024-06-30"
  - name: "CMA, Collective Investment Schemes report, Q2 2026, Table 16 and Table 11 (Afronomics money market fund size file)"
    url: "https://www.cmarcp.or.ke/images/Docs/cisreports/2026/CISReportQ2-2026.pdf"
    date: "2026-06-30"
  - name: "Afronomics money market fund file, yields read from fund managers' websites"
    url: "https://www.afronomicsfeed.com/rates/kenya/money-market-funds"
    date: "2026-10-15"
  - name: "CBK, commercial banks' weighted average rates"
    url: "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
    date: "2026-08-31"
  - name: "CBK, results of IFB1/2019/016, IFB1/2021/018 and IFB1/2021/021 dated 17 August 2026"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/1214594764_RESULTS%20IFB1-2019-016%20IFB1-2021-018%20AND%20IFB1-2021-021%20DATED%2017-08-2026.pdf"
    date: "2026-08-17"
calls:
  - statement: "The 364-day Treasury bill clears between 8% and 10% at the last auction with a value date in March 2027"
    measure: "364-day bill weighted average rate of accepted bids, last auction with a value date in March 2027"
    comparator: "between"
    threshold: [8, 10]
    unit: "%"
    check_source: "CBK Treasury bill auction results (Afronomics auction file)"
    check_date: "2027-03-31"
  - statement: "The Central Bank Rate is at or below 8.75% after the last MPC meeting held before 30 June 2027"
    measure: "Central Bank Rate announced at the last MPC meeting held before 30 June 2027"
    comparator: "<="
    threshold: 8.75
    unit: "%"
    check_source: "CBK MPC press release"
    check_date: "2027-06-30"
  - statement: "Kenyan money market funds hold more than the KES 459.9 billion they held at 30 June 2026 when the CMA reports 31 December 2026"
    measure: "Total of the Money Market Funds table, CMA Collective Investment Schemes report for Q4 2026"
    comparator: ">"
    threshold: 459.9
    unit: "KES bn"
    check_source: "CMA Collective Investment Schemes quarterly report, Q4 2026 (Afronomics money market fund size file)"
    check_date: "2027-03-31"
followUps:
  - { date: "2026-12-31", what: "Next MPC decision, due in December 2026 according to the October release" }
  - { date: "2027-03-31", what: "Grade the 364-day bill and money market fund calls" }
  - { date: "2027-06-30", what: "Grade the Central Bank Rate call" }
tiles:
  - label: "What KES 500,000 kept in a year, April 2024"
    value: "KES 72,009"
    note: "364-day bill at 16.9899%, price 85.5115, after 15% withholding tax"
    source: "Afronomics auction file, CBK Treasury bill results of 1 April 2024"
  - label: "The same bill, sold today"
    value: "KES 38,308"
    note: "364-day bill at 9.0383%, price 91.7317, after 15% withholding tax: KES 33,702 less"
    source: "Afronomics auction file, CBK Treasury bill results of 19 October 2026"
charts:
  - type: line
    title: "The one-year bill lost eight points in two and a half years, and has crept back up since April"
    unit: "364-day bill, weighted average rate of accepted bids, % a year"
    source: "Afronomics auction file, CBK Treasury bill results"
    data:
      - { label: "Jan 24", value: 16.1 }
      - { label: "Apr 24", value: 16.9899 }
      - { label: "Aug 24", value: 16.9206 }
      - { label: "Dec 24", value: 12.4903 }
      - { label: "Jun 25", value: 10.0 }
      - { label: "Dec 25", value: 9.3759 }
      - { label: "Apr 26", value: 8.27 }
      - { label: "Oct 26", value: 9.0383 }
    highlight: ["Oct 2026"]
  - type: bar
    title: "KES 500,000 in a one-year bill now keeps about half what it kept in 2024"
    unit: "Interest kept after 15% tax, KES, one 364-day bill"
    source: "Afronomics auction file, CBK Treasury bill results"
    data:
      - { label: "Apr 2024, 16.99%", value: 72009 }
      - { label: "Oct 2026, 9.04%", value: 38308 }
    highlight: ["Oct 2026, 9.04%"]
verify:
  - "Disclosure line against data/owner/holdings.json"
---

In April 2024 Kenya's 364-day Treasury bill paid 16.99% a year. At today's auction it paid 9.04%.

On KES 500,000 that is the difference between keeping KES 72,009 a year after tax and keeping KES 38,308. The saver's income from the same bill has nearly halved.

**The Afronomics verdict: the fall from 17% to 9% is the price of lower inflation and cheaper loans, and the savers who treated 2024's rates as normal are the ones paying it.**

## What happened

(Facts) The 364-day bill dated 1 April 2024 cleared at a weighted average rate of 16.9899%, the highest in our auction file since 2023. The 91-day bill peaked a week earlier, at 16.7306% on 25 March 2024. Both figures are in the CBK's published results.

(Facts) At the auction held today, for bills dated 19 October 2026, the 364-day bill cleared at 9.0383% and the 91-day bill at 8.75%, the CBK's results show. The one-year rate has fallen by 7.95 points and the three-month rate by 7.98 points.

(Facts) It has not been a straight line down. The 364-day bill reached its low of 8.27% on 13 April 2026 and has since risen to just above 9%.

(Facts) The CBK raised the Central Bank Rate to 13.00% on 6 February 2024. On 6 August 2024 it cut to 12.75%, citing room for "a gradual easing of the monetary policy stance". By 10 February 2026 it had cut to 8.75%, where the Monetary Policy Committee left it on 7 October 2026.

## What the numbers show

(Analysis) A Treasury bill is sold at a discount and repaid at face value. The interest is the gap, and 15% of it goes in withholding tax, which the CBK collects upfront with the price, its own guide to Government securities shows. Here is what KES 500,000 at the auction price buys and keeps:

| One 364-day bill, KES 500,000 at the auction price | 1 April 2024 | 19 October 2026 |
| --- | --- | --- |
| Rate | 16.9899% | 9.0383% |
| Price per KES 100 | 85.5115 | 91.7317 |
| Repaid at maturity | KES 584,717 | KES 545,068 |
| Interest | KES 84,717 | KES 45,068 |
| Tax at 15%, paid upfront | KES 12,708 | KES 6,760 |
| Total paid at the auction | KES 512,708 | KES 506,760 |
| **Kept** | **KES 72,009** | **KES 38,308** |

*Source: CBK auction results (Afronomics auction file). Arithmetic: 500,000 × 100 ÷ price = face value; face value − 500,000 = interest; tax = 15% of interest.*

(Analysis) The gap is KES 33,702 a year, 47% less. A saver living on that interest has lost about KES 2,800 a month.

(Analysis) The 91-day bill shows the same fall in a shorter window. KES 500,000 in one 91-day bill kept KES 17,728 after tax in March 2024 and keeps KES 9,271 today.

## Why it fell

(Facts) The CBK's August 2024 statement said the Supplementary Budget was "expected to lower the fiscal deficit from 5.6 percent of GDP in FY2023/24 to 4.3 percent of GDP in FY2024/25". In October 2026 the Committee "noted the ongoing implementation of the FY2026/27 Government Budget, and the planned fiscal consolidation strategy".

(Analysis) Two things pushed rates down. The CBK cut its own rate by 4.25 points, and other shilling rates followed: the MPC says average bank lending rates fell from 17.2% in November 2024 to 14.4% in September 2026. And the Treasury planned to borrow less, so it did not need to take every bid. In 2024 investors bid KES 1.95 trillion for bills and the Treasury took KES 1.51 trillion. So far in 2026 (bills dated up to 19 October) they have bid KES 1.75 trillion and it has taken KES 1.40 trillion.

(Analysis) Demand has also moved to the short end. Today the 91-day bill drew bids of KES 49.8 billion for KES 8 billion on offer. The 364-day bill drew KES 6.6 billion for KES 10 billion. The 91-day rate now sits exactly at the Central Bank Rate, 8.75%.

## Where the money went

(Facts) Money market funds held KES 171.2 billion on 30 June 2024, 67% of all unit trust assets, according to the Capital Markets Authority. On 30 June 2026 they held KES 459.9 billion, out of KES 948.7 billion in all unit trusts. Both money market fund figures come from one series, the CMA's Table 16 in its June 2026 report.

(Analysis) Money market fund assets grew about 2.7 times in two years, while the bill rate halved. What a saver keeps from KES 500,000 for a year now, after 15% tax:

| Where | Rate | Kept |
| --- | --- | --- |
| Infrastructure bond IFB1/2019/016, reopened 17 Aug 2026 (tax-free) | 12.196% | KES 60,980 |
| Money market fund, middle of the five we read on 15 Oct 2026 | 10.35% | KES 43,988 |
| 364-day bill, 19 Oct 2026 | 9.0383% | KES 38,308 |
| Bank deposits, CBK average, Aug 2026 | 6.91% | KES 29,368 |

*Sources: CBK auction results; Afronomics money market fund file (yields as fund managers publish them; most are quoted before fees); CBK weighted average commercial bank rates. Not like for like: a fund's yield changes daily and is not guaranteed; a bill's is fixed at purchase, and its tax is paid upfront on top of the KES 500,000; the infrastructure bond locks money up for years.*

(Analysis) The fund yield is the manager's own published figure, and it moves every day. The bill's 9.04% is locked in for a year. A saver comparing them is comparing a promise with a forecast. You can run your own numbers on the [Treasury bill calculator](/markets/kenya-tbills/calculator).

## Our verdict

(Opinion) **The fall from 17% to 9% is the price of lower inflation and cheaper loans, and the savers who treated 2024's rates as normal are the ones paying it.**

The 2024 rates were not a reward. They were an emergency price, paid while the CBK was trying, in its own words, to "anchor inflationary expectations and contain exchange rate pressures". When the emergency eased, the price fell. That is the system working.

But the system does not send a letter. Someone who planned school fees or rent around KES 72,000 a year from half a million shillings now has KES 38,000. The money market funds have absorbed much of the move, and their yields will follow the bill rate down if the CBK keeps cutting.

### What would change our mind

A sustained rise in the 364-day rate back above 12%, without a jump in inflation or a weaker shilling. That would mean the 2024 rates reflected something lasting about Kenya's borrowing, not a passing crisis.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **Every auction since 2023:** the 91, 182 and 364-day rates week by week, with bids, offers and what the Treasury took.
- **The roll-over test:** what KES 500,000 kept rolling 91-day bills since March 2024, against holding one-year bills.
- **The money market fund league:** every fund's size from the CMA reports and its published yield, quarter by quarter.
- **Follow-ups:** a Receipt after the December 2026 MPC decision, and on each grade of the calls above.
