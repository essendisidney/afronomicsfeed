---
title: "KES 100,000 over the next year: from KES 3,009 in savings to KES 7,680 locked in a T-bill"
date: "2026-10-13"
authors:
  - "Afronomics Desk"
category: brief
labels:
  - Facts
  - Analysis
topics:
  - treasury-bills
  - money-markets
  - mpc
institutions:
  - cbk
  - cma
sources:
  - name: "Central Bank of Kenya — Treasury bill results, auction dated 12 October 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/71747979_RESULTS%202703-091%202677-182%202632-364%20DATED%2012-10-2026.pdf"
    date: "2026-10-12"
  - name: "Central Bank of Kenya — Treasury bill results, auction dated 13 April 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1981948736_RESULTS%202677-091%202651-182%202606-364%20DATED%2013-04-2026.pdf"
    date: "2026-04-13"
  - name: "Central Bank of Kenya — Treasury bill results, auction dated 7 April 2025"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1753784555_RESULTS%202624-091%202598-182%202552-364%20DATED%2007-04-2025.pdf"
    date: "2025-04-07"
  - name: "Central Bank of Kenya — commercial banks' weighted average rates"
    url: "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
    date: "2026-10-13"
  - name: "Etica Capital — Unit Trust Funds fact sheet, 30 September 2026"
    url: "https://eticacap.com/wp-content/uploads/2026/10/Etica-Unit-Trust-Funds-Fact-Sheet-September-30-2026.pdf"
    date: "2026-09-30"
  - name: "Madison Investment Managers — Madison Money Market Fund"
    url: "https://www.madison.co.ke/investmentmanagers/madison-money-market-fund/"
    date: "2026-10-13"
  - name: "Capital Markets Authority Kenya — Collective Investment Schemes report, Q2 2026"
    url: "https://www.cmarcp.or.ke/images/Docs/cisreports/2026/CISReportQ2-2026.pdf"
    date: "2026-06-30"
  - name: "Central Bank of Kenya — next MPC meeting notice"
    url: "https://www.centralbank.go.ke/2026/09/07/next-mpc-meeting-5/"
    date: "2026-09-07"
asOf: "2026-10-13"
summary: "Kenya's one-year Treasury bill locks in 9.04% today; a money market fund floats with the market. We ran three paths for rates to October 2027 and worked out what each option would leave a saver with KES 100,000 after tax. Scenarios, not advice."
teaser:
  - "The average savings account leaves KES 3,009 a year after tax on KES 100,000; the one-year bill, about KES 7,680."
  - "If rates fall back to April's low, locking the bill beats rolling three-month bills by KES 558."
  - "If they rise to April 2025's level, rolling wins by KES 342."
gated: false
urgency: watch
minutes: 6
fileFor: "savers, chamas, diaspora families with money at home"
soWhat: "The one-year bill is the only figure here known in advance. Everything that floats, from three-month bills to money market funds, depends on where rates go, and the weekly auction results will show which path Kenya is on."
unknowns:
  - "Inflation: we do not yet track it, so these are shilling returns before any loss of buying power."
  - "Fund yields a year from now: a fund's published yield is a recent figure, not a promise."
  - "The CBK's next MPC date, not yet published in our calendar."
charts:
  - title: "Kenya's one-year Treasury bill rate since October 2024, with our three scenario levels"
    type: "line with reference lines"
    data: "data/kenya/tbill_auctions.json"
    series: "tenor 364, weighted_avg_rate by value_date from 2024-10-01; reference lines at 8.27 (13 Apr 2026), 9.0352 (12 Oct 2026), 10.3865 (7 Apr 2025)"
  - title: "What KES 100,000 earns in a year after 15% withholding tax, today"
    type: "horizontal bar"
    data: "data/kenya/rates.json (bank_rates 2026-08; money_market_funds Etica, Madison) + data/kenya/tbill_auctions.json (2026-10-12)"
    series: "100,000 × rate × 0.85 for savings, deposit, 91-day, 364-day, two funds"
  - title: "KES 100,000 after tax in three rate scenarios to October 2027"
    type: "grouped bar"
    data: "derived from data/kenya/tbill_auctions.json and data/kenya/rates.json (rule in the article)"
    series: "lower / steady / higher for savings account, one-year bill, rolled 91-day bill, fund at 10.33%"
---

Say you have KES 100,000 you will not need for a year. Left in the average Kenyan savings account, it earns **KES 3,009** after tax. Put into the one-year Treasury bill the Central Bank sold at its auction dated 12 October, it earns about **KES 7,680**, fixed on the day you buy.

The difference is KES 4,671. Two years ago the same bill would have earned KES 14,220, so the bill is far less generous than it was. But against the bank average it still pays more than twice as much.

The harder question is what happens to everything that does not lock in: three-month bills you roll over, and money market funds whose yield moves every day. That depends on where Kenyan rates go next. So we ran three paths.

## Where KES 100,000 stands today

| Option | Rate | Whose figure, when | After 15% tax, one year |
| --- | --- | --- | --- |
| Savings account, bank average | 3.54% | CBK, August 2026 | KES 3,009 |
| Fixed deposit, bank average | 6.91% | CBK, August 2026 | KES 5,874 |
| 91-day bill, rolled over at today's rate | 8.76% | CBK auction, 12 Oct | KES 7,447 |
| 364-day bill, held to the end | 9.04% | CBK auction, 12 Oct | KES 7,680 |
| Etica Money Market Fund, after fees | 10.33% | Manager's fact sheet, September average | KES 8,781 |
| Madison Money Market Fund, before fees | 10.41% | Manager's site, 13 Oct | KES 8,849 |

*Kenya's withholding tax for residents is 15% on bank interest, bill returns and fund returns. The two funds are the only ones we track that our data health check does not flag as possibly out of date; we leave the others out. Our fund pages may carry a manager's referral link; that never changes which funds we show or their order.*

Funds and bills are not the same thing. A bill is a loan to the government, repaid in full on a set date. A money market fund pools savers' money into short-term paper and is regulated by the Capital Markets Authority, but it is not a bank deposit, and its yield describes the recent past. Kenya's money market funds held KES 459.9bn at the end of June, dollar funds included, by the CMA's count.

## Lock or float

The one-year bill's rate is fixed for the year once you buy it. Whatever happens next, KES 100,000 invested at the auction dated 12 October returns about KES 7,680 after tax.

Everything else floats. A 91-day bill is reset every three months at that week's auction rate. A fund's yield drifts with the short-term paper it holds. (Analysis) So the real choice between locking and floating is a view on rates, whether you hold one or not.

## Three paths to October 2027

These are scenarios, not forecasts. Each end-point is a level Kenya's one-year bill has actually reached at a recent auction.

- **Lower:** the one-year bill falls back to **8.27%**, its low at the auction of 13 April 2026, a fall of 0.77 points.
- **Steady:** it stays at **9.04%**.
- **Higher:** it rises to **10.39%**, where it stood on 7 April 2025, a rise of 1.35 points.

We assume the floating options move by the same number of points as the one-year bill, evenly through the year, so over the year they earn today's rate plus half the move.

| KES 100,000, after tax, one year | Lower | Steady | Higher |
| --- | --- | --- | --- |
| Savings account (held at 3.54%) | 3,009 | 3,009 | 3,009 |
| One-year bill bought now | 7,680 | 7,680 | 7,680 |
| 91-day bill, rolled four times | 7,122 | 7,447 | 8,022 |
| Fund yielding 10.33% today | 8,455 | 8,781 | 9,355 |

Three things stand out (Analysis):

1. **Locking beats rolling unless rates rise.** If rates fall to April's low, the one-year bill earns KES 558 more than rolling three-month bills. If they stay put, KES 233 more. Only in the higher path does rolling win, by KES 342.
2. **The fund's range is about KES 900** across the three paths, from KES 8,455 to KES 9,355. Its figure is highest in every column, but it is the least certain number in the table, and it assumes the fund keeps today's margin over bills.
3. **The savings account barely moves in any path.** The bank average fell only from 4.62% to 3.54% in the two years to August 2026, while the one-year bill fell from 16.73% in October 2024 to 9.04%.

## Our base case

We think the **steady** path is the most likely of the three for the next six months. The one-year bill has cleared between 8.99% and 9.07% at every auction since July, and the Central Bank Rate printed on the CBK's site is 8.75%, dated 7 October, the same as the rate dated 11 August. Lenders are not pricing a big move either way.

**What would push us to "higher":** the one-year bill selling above 9.5% at any weekly auction; the government paying up to fill the one-year offer, which drew fewer bids than offered at 20 of the 27 auctions since mid-April; dollar borrowing costs continuing to climb (Kenya's 2034 Eurobond yield rose from 7.96% to 9.31% between 14 August and 8 October).

**What would push us to "lower":** a CBK rate cut at its next meeting, and the one-year bill below 8.5% at any auction.

## What to watch, and when

- **Every week:** the CBK's bill results. The one-year rate is the signpost: above 9.5% or below 8.5%.
- **Every Friday:** the CBK's weekly bulletin, with Eurobond yields.
- **The next MPC meeting:** the CBK met on 11 August and 7 October; the next date is not yet in our calendar. If the two-month rhythm holds it would fall in early December, but that is our inference, not a CBK date.
- **The September bank averages,** due from the CBK in the coming weeks.

## What to check before you compare

Compare after tax, not before. Check how long the money is tied up: a bill is held to its date unless sold, while funds usually pay out within days. The CBK's minimum for a bill is KES 50,000, bought through its DhowCSD portal. For a fund, check that the yield is recent and whether it is before or after fees.

## How we worked this out

- **Bank rates:** `data/kenya/rates.json`, CBK weighted averages for August 2026: savings 3.54%, deposit 6.91%. KES 100,000 × 3.54% × 0.85 = KES 3,009.
- **Bills:** `data/kenya/tbill_auctions.json`, auction dated 12 October 2026: 364-day 9.0352%, 91-day 8.7615%. KES 100,000 × 9.0352% × 0.85 = KES 7,679.92, shown as 7,680. Bought at the auction price of 91.7343 per 100, KES 100,000 buys KES 109,010.5 of bills: a gain of KES 9,010.5 over 364 days, KES 7,658.9 after tax. The small difference is because the rate is stated for a 365-day year.
- **Funds:** `data/kenya/rates.json` and `data/kenya/mmf_history.json`, effective annual yields as each manager published them. Etica 10.33% × 0.85 = 8.7805%, shown as KES 8,781.
- **Scenario moves:** 8.27 − 9.0352 = −0.77 points; 10.3865 − 9.0352 = +1.35 points. Half-moves: −0.38 and +0.68.
- **Rolled 91-day, lower path:** (8.7615 − 0.3826) × 0.85 × 1,000 = KES 7,122. Higher: (8.7615 + 0.6757) × 0.85 × 1,000 = KES 8,022. Rolling ignores the small extra from reinvesting interest each quarter.
- **Fund, lower:** (10.33 − 0.3826) × 850 = KES 8,455. Higher: (10.33 + 0.6757) × 850 = KES 9,355.
- **Two years ago:** 364-day bill of 7 October 2024, 16.7291%: KES 100,000 × 16.7291% × 0.85 = KES 14,220.
- **Fund total:** `data/kenya/cma_mmf.json`, KES 459,874,570,485 at 30 June 2026.

See every option ranked after tax, updated daily: [where your shilling earns most](/rates/kenya) and [money market funds compared](/rates/kenya/money-market-funds). New to bills? [How a Treasury bill works](/explainers/learn-treasury-bills).

*Scenarios, not advice. Information, not advice.*
