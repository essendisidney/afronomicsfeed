---
title: "What Fuliza really costs: KES 52 to borrow KES 1,000 for a week, 271% a year"
date: "2026-10-15"
type: verdict
status: published
sector: cost-of-living
entities:
  - "Safaricom PLC"
  - "NCBA Bank Kenya"
  - "KCB Bank Kenya"
  - "Sidian Bank"
  - "Central Bank of Kenya"
series: mobile-credit-costs
verdict: "Fuliza is priced in shillings a night, which is accurate but hard to add up; worked out as simple yearly rates, the published fees on a KES 1,000 balance come to 231% to 584% a year, sixteen to forty times the average bank loan rate."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "Using Safaricom's own published Fuliza charges, KES 1,000 kept for seven nights costs KES 52. As a simple yearly rate, by our arithmetic, that is 271%, against a 14.34% bank average and a 9.04% one-year Treasury bill. Kenyans drew KES 1.47 trillion on Fuliza in the year to March 2026."
desk: "Afronomics Cost of Living Desk"
disclosure: "Afronomics and its founder hold no shares in Safaricom, NCBA, KCB or Sidian Bank, and are not paid by any of them."
sources:
  - name: "Safaricom, Fuliza page (charges and tariff table)"
    url: "https://www.safaricom.co.ke/main-mpesa/m-pesa-services/credit-and-savings/fuliza"
    date: "2025-06-23"
  - name: "Safaricom PLC, FY26 Results Booklet (year ended 31 March 2026)"
    url: "https://www.safaricom.co.ke/images/Downloads/FY26-Earnings-Booklet-2026-7th-May-2026.pdf"
    date: "2026-05-07"
  - name: "Central Bank of Kenya, commercial banks weighted average rates"
    url: "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
    date: "2026-10-15"
  - name: "Central Bank of Kenya, Treasury bill results, 364-day issue 2633"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1647758237_RESULTS%202704-091%202678-182%202633-364%20DATED%2019-10-2026.pdf"
    date: "2026-10-19"
  - name: "Safaricom, M-Shwari page (loan fee)"
    url: "https://www.safaricom.co.ke/main-mpesa/m-pesa-services/credit-and-savings/m-shwari"
    date: "2026-10-05"
calls:
  - statement: "Fuliza disbursements grow again in Safaricom's year to March 2027, above the KES 1,465.8 billion of FY26"
    measure: "Fuliza value of disbursements (KShs Bn), FY27, Safaricom FY27 results booklet"
    comparator: ">"
    threshold: 1465.8
    unit: "KES bn"
    check_source: "Safaricom PLC, FY27 Results Booklet, Financial Services: Lending table"
    check_date: "2027-05-31"
  - statement: "The average Fuliza draw keeps shrinking: below KES 217.9 in the year to March 2027"
    measure: "Fuliza Average Ticket Size (KShs), FY27, Safaricom FY27 results booklet"
    comparator: "<"
    threshold: 217.9
    unit: "KES"
    check_source: "Safaricom PLC, FY27 Results Booklet, Financial Services: Lending table"
    check_date: "2027-05-31"
  - statement: "Safaricom's published total daily Fuliza charge on a KES 501 to 1,000 balance is still KES 6 on 31 March 2027"
    measure: "Total Charges for the 501-1000 band in the Fuliza tariff table on Safaricom's Fuliza page, 31 March 2027"
    comparator: "is"
    threshold: "6"
    check_source: "Safaricom, Fuliza page (charges and tariff table)"
    check_date: "2027-03-31"
followUps:
  - { date: "2027-05-31", what: "Safaricom FY27 results: Fuliza disbursements, ticket size, customers and revenue" }
tiles:
  - label: "KES 1,000 on Fuliza for 7 nights"
    value: "KES 52"
    note: "1% access fee (KES 10) plus KES 6 a night for 7 nights (KES 42)"
    source: "Safaricom, Fuliza page (charges and tariff table)"
  - label: "Bank loans, average yearly rate"
    value: "14.34%"
    note: "August 2026. The same week on Fuliza works out at 271% a year, simple"
    source: "Central Bank of Kenya, commercial banks weighted average rates"
charts:
  - type: bar
    title: "The same fees, held longer, still cost far more than any bank rate"
    unit: "Simple yearly rate, %"
    source: "Safaricom, Fuliza page (charges and tariff table)"
    data:
      - { label: "Fuliza KES 1,000, 1 night", value: 584.0 }
      - { label: "Fuliza KES 100, 1 night", value: 365.0 }
      - { label: "Fuliza KES 1,000, 7 nights", value: 271.1 }
      - { label: "Fuliza KES 1,000, 30 nights", value: 231.2 }
      - { label: "M-Shwari, 30 days", value: 109.5 }
      - { label: "Bank average, Aug 2026", value: 14.34 }
      - { label: "1-year T-bill", value: 9.04 }
    highlight: ["Fuliza KES 1,000, 7 nights"]
  - type: bar
    title: "One shilling over KES 1,000 and the nightly fee jumps from KES 6 to KES 21.60"
    unit: "Daily fee incl. excise, KES"
    source: "Safaricom, Fuliza page (charges and tariff table)"
    data:
      - { label: "Up to 100", value: 0 }
      - { label: "101-500", value: 3 }
      - { label: "501-1,000", value: 6 }
      - { label: "1,001-1,500", value: 21.6 }
      - { label: "1,501-2,500", value: 24 }
      - { label: "2,501-70,000", value: 30 }
    highlight: ["1,001-1,500"]
  - type: bar
    title: "Kenyans drew KES 1.47 trillion on Fuliza in a year, up 49%"
    unit: "Fuliza disbursements, KES billion"
    source: "Safaricom PLC, FY26 Results Booklet (year ended 31 March 2026)"
    data:
      - { label: "FY25", value: 981.6 }
      - { label: "FY26", value: 1465.8 }
    highlight: ["FY26"]
---

Borrow KES 1,000 on Fuliza and keep it for a week, and by Safaricom's own price list the charges come to KES 52.

That sounds small, and it is small in shillings. As a simple yearly rate, by our arithmetic, it is 271%. The average bank loan in Kenya cost 14.34% a year in August 2026.

**The Afronomics verdict: Fuliza is priced in shillings a night, which is accurate but hard to add up; worked out as simple yearly rates, the published fees on a KES 1,000 balance come to 231% to 584% a year, sixteen to forty times the average bank loan rate.**

## What Fuliza charges

(Facts) Fuliza is an overdraft on M-PESA. Safaricom runs it with lenders: its FY26 results booklet names NCBA, KCB and Sidian Bank. Safaricom's Fuliza page sets out the price. "A customer will be charged a one off 1% access fee and a daily maintenance fee is applied the next day at midnight or 00.00 hrs. A customer will also be charged 20% Excise Duty on the daily maintenance fee."

(Facts) The daily fee depends on how much you owe, not on a percentage. Safaricom's table, with the excise duty included:

| Amount owed (KES) | Daily fee | Excise duty | Total a day |
| --- | --- | --- | --- |
| 0 to 100 | KES 0 | KES 0 | KES 0 |
| 101 to 500 | KES 2.50 | KES 0.50 | KES 3 |
| 501 to 1,000 | KES 5 | KES 1 | KES 6 |
| 1,001 to 1,500 | KES 18 | KES 3.60 | KES 21.60 |
| 1,501 to 2,500 | KES 20 | KES 4 | KES 24 |
| 2,501 to 70,000 | KES 25 | KES 5 | KES 30 |

*Source: Safaricom's Fuliza page, last updated 23 June 2025, read on 15 October 2026.*

(Facts) So a balance cleared before midnight on the day it was drawn pays only the 1% access fee. Each midnight it stays unpaid adds that night's fee.

## What the numbers show

(Analysis) We worked out the cost of four common cases from the table, then turned each into a simple yearly rate: the cost for the period multiplied up to a year, the way most loan rates are quoted, with no compounding. Nobody borrows on Fuliza for a year at a stretch; the yearly rate is there so the price can sit next to a bank's.

| Case | Cost | Share of the amount | Simple yearly rate |
| --- | --- | --- | --- |
| KES 1,000 for 1 night | KES 10 + 6 = KES 16 | 1.6% | 584% |
| KES 1,000 for 7 nights | KES 10 + 42 = KES 52 | 5.2% | 271% |
| KES 1,000 for 30 nights | KES 10 + 180 = KES 190 | 19.0% | 231% |
| KES 100 for 1 night | KES 1 + 0 = KES 1 | 1.0% | 365% |

*Arithmetic: yearly rate = cost ÷ amount × 365 ÷ nights. Example, 7 nights: 52 ÷ 1,000 = 5.2%; 5.2% × 365 ÷ 7 = 271.1%.*

(Analysis) The comparison. KES 1,000 for 30 days at the 14.34% average bank lending rate would cost about KES 11.79 in interest, before any bank fees. On Fuliza it costs KES 190. Lent to the government for 30 days at the latest one-year Treasury bill rate of 9.0383%, the same KES 1,000 would earn about KES 7.43. M-Shwari, the 30-day loan Safaricom offers with NCBA, charges a flat 9% including excise duty: KES 90 on KES 1,000, or 109.5% a year simple.

(Analysis) Two quirks of the table are worth knowing. First, the bands are steps, not a slope. Owing KES 1,001 instead of KES 1,000 lifts the nightly fee from KES 6 to KES 21.60, 3.6 times as much for one more shilling. Seven nights on KES 1,001 cost about KES 161, against KES 52 on KES 1,000. Second, balances of KES 100 or less pay no daily fee at all, only the 1% access fee. KES 100 held for 30 nights still costs KES 1, about 12% a year: cheaper than a bank. The expensive part of Fuliza is the middle, where the daily fee is large next to the balance.

(Analysis) The same price looks small or large depending on how it is shown. KES 6 a night on KES 1,000 is 0.6% a day. Safaricom publishes it as shillings a night, which is accurate. Banks quote a yearly rate. Fuliza's charges are fees, not interest, so the yearly rates in this Receipt are our arithmetic on Safaricom's published table, not a rate Safaricom or its lenders quote.

## How much Kenyans use it

(Facts) Safaricom's FY26 results booklet, for the year to 31 March 2026, reports:

| Fuliza | FY25 | FY26 | Change |
| --- | --- | --- | --- |
| Value of disbursements | KES 981.6bn | KES 1,465.8bn | +49.3% |
| Value of repayments | KES 996.7bn | KES 1,487.3bn | +49.2% |
| Average ticket size | KES 241.2 | KES 217.9 | −9.7% |
| Distinct customers | 7.9m | 17.7m | +123.7% |
| Safaricom's Fuliza revenue | KES 4.1bn | KES 6.0bn | +46.0% |

*Source: Safaricom PLC, FY26 Results Booklet, Financial Services, Lending table (page 32).*

(Analysis) The average draw, KES 217.9, sits in the KES 101 to 500 band, where the nightly fee is KES 3: about 1.4% of the balance for each night it stays unpaid. The booklet's revenue line is Safaricom's own Fuliza revenue. It does not show the total fees customers paid or how they are split with the lenders, so we do not estimate them.

(Facts) The booklet puts repayments at 101.5% of disbursements in both years.

## Our verdict

(Opinion) **Fuliza is priced in shillings a night, which is accurate but hard to add up; worked out as simple yearly rates, the published fees on a KES 1,000 balance come to 231% to 584% a year, sixteen to forty times the average bank loan rate.**

The fair case for Fuliza is real. It is there at 11pm with no form, no branch and no security. A balance cleared the same day costs 1%, and very small balances pay no daily fee. For a till short by a few hundred shillings until payday tomorrow, a few shillings is a reasonable price for the convenience.

The difficulty, in our view, is the unit. A price in shillings a night is easy to accept and hard to add up: on its own it does not show that a month on KES 1,000 costs nineteen percent of the money borrowed. The band steps add a cliff of their own: the cheapest place to be is just under a threshold, and a shilling over it can triple the bill. The highest yearly figure, 584%, is for a single night, where most of the cost is the one-off 1% access fee; held for 30 nights, it is 231%.

The fees are not hidden; they are on Safaricom's own page. What a reader needs is the total, and that takes arithmetic. Our calculator does it, for any amount and any number of nights.

### What would change our mind

Evidence that Fuliza customers are shown the total cost and a yearly rate before each draw; we have not tested what the M-PESA menu shows, and Safaricom is welcome to tell us. A tariff that rises smoothly with the balance instead of in steps. Or results showing most Fuliza balances are cleared within a night, so the yearly figures above rarely apply in practice; the booklet does not publish how long balances stay unpaid.

**Check your own numbers:** the [M-PESA and Fuliza charges calculator](/rates/kenya/mpesa-charges) works out what a Fuliza balance costs by the night, and [mobile loans compared](/rates/kenya/mobile-loans) sets Fuliza beside M-Shwari, Tala and the bank average.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **Every band, every night:** the cost and yearly rate for each Fuliza band, from one night to 30, in one table.
- **The step map:** the balances just above each band threshold where one more shilling costs the most, and what the same week costs a shilling below.
- **Fuliza against every mobile loan we track:** M-Shwari, KCB M-PESA, Tala and others, as total shillings repaid and as yearly rates, against the CBK bank average.
- **The Fuliza tracker:** disbursements, repayments, ticket size, customers and revenue from every Safaricom results booklet, updated each May and November.
- **Follow-ups:** a Receipt on Safaricom's half-year and FY27 results, and on any change to the Fuliza tariff.
