---
title: "Africa's borrowing bill: one-year rates fell up to 4.5 points in a year. Where they head into 2027"
date: "2026-10-13"
authors:
  - "Afronomics Desk"
category: brief
labels:
  - Facts
  - Analysis
topics:
  - treasury-bills
  - mpc
institutions:
  - cbk
  - treasury
sources:
  - name: "Bank of Zambia — Treasury bill results, tender 20/2026, 1 October 2026"
    url: "https://www.boz.zm/sites/default/files/2026-10/Treasury-Bills-Results-Tender-No-20-2026-01-10-2026.pdf"
    date: "2026-10-01"
  - name: "Bank of Ghana — auction results, tender 2028, 9 October 2026"
    url: "https://www.bog.gov.gh/wp-content/uploads/2026/10/Auctresults-2028.pdf"
    date: "2026-10-09"
  - name: "Central Bank of Kenya — Treasury bill results, auction dated 12 October 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/71747979_RESULTS%202703-091%202677-182%202632-364%20DATED%2012-10-2026.pdf"
    date: "2026-10-12"
  - name: "Central Bank of Kenya — Treasury bond results, FXD3/2019/015 and FXD1/2019/020, 5 October 2026"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/250350777_RESULTS%20FOR%20FXD3-2019-015%20AND%20%20FXD1-2019-020%20DATED%2005-10-2026.pdf"
    date: "2026-10-05"
  - name: "Central Bank of Nigeria — Government securities (NTB results)"
    url: "https://www.cbn.gov.ng/rates/GovtSecurities.html"
    date: "2026-10-07"
  - name: "Debt Management Office Nigeria — FGN bond auction results, September 2026"
    url: "https://www.dmo.gov.ng/6051-summary-of-fgn-bond-auction-results-for-september-2026"
    date: "2026-09-14"
  - name: "Bank of Uganda — Treasury bill auction results, 30 September 2026"
    url: "https://bou.or.ug/uploads/Press_Release_Report_for_the_91_Days_182_Days_364_Days_T_Bills_Auction_30_SEP_2026_032913612f.docx"
    date: "2026-09-30"
  - name: "Bank of Tanzania — Treasury bills"
    url: "https://www.bot.go.tz/TBills?lang=en"
    date: "2026-10-07"
  - name: "Central Bank of Egypt — EGP T-bills historical data"
    url: "https://www.cbe.org.eg/en/auctions/egp-t-bills/historical-data"
    date: "2026-10-13"
  - name: "South African Reserve Bank — current market rates"
    url: "https://www.resbank.co.za/en/home/what-we-do/statistics/key-statistics/current-market-rates"
    date: "2026-10-12"
  - name: "Banco de Moçambique — Treasury bill auction series"
    url: "https://www.bancomoc.mz/media/ousnhsom/s%C3%A9rie-leil%C3%B5es-bilhetes-de-tesouro.xlsx"
    date: "2026-10-07"
  - name: "Central Bank of Kenya — Weekly Bulletin, 9 October 2026 (Eurobond yields)"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/321370149_Weekly%20CBK%20Bulletin,%20October%209,%202026.pdf"
    date: "2026-10-09"
  - name: "Policy rates and meeting dates as printed on each central bank's own site (Afronomics data/policy_rates.json, data/mpc_calendar.json)"
    url: "https://afronomicsfeed.com/rates/policy"
    date: "2026-10-13"
asOf: "2026-10-13"
summary: "Across nine markets in our auction records, the one-year government bill costs less than a year ago in five, more in three and the same in one. Ghana's and Nigeria's bills sit far below their policy rates; South Africa's has risen at every auction since 3 August. Our base case, two alternatives, and the dates that will decide between them."
teaser:
  - "Zambia's one-year bill fell from 14.50% to 10.00% in a year; Uganda's by 3.50 points, Ghana's by 3.12."
  - "Nigeria's one-year bill cleared at 15.85%, 10.65 points under the 26.50% policy rate."
  - "South Africa's has risen at every auction since 3 August, from 7.17% to 7.54%."
gated: false
urgency: watch
minutes: 7
fileFor: "treasurers, fund managers, savers, anyone who borrows in a local currency"
soWhat: "The broad fall in local borrowing costs is over in Kenya, Tanzania and South Africa and still running in Ghana, Nigeria and Zambia. The central bank meetings of 18, 19 and 25 November will show which way the next leg goes."
unknowns:
  - "Inflation and exchange rates: we do not yet hold them, and a price or currency shock would move every scenario here."
  - "Policy rates and meeting dates for Uganda, Nigeria, Egypt and Zambia: not published in a form we can read."
  - "Who bid at each auction: central banks publish totals, not bidders."
charts:
  - title: "One-year government bill rate, nine African markets, October 2025 against October 2026"
    type: "dumbbell"
    data: "data/{kenya,nigeria,ghana,uganda,tanzania,egypt,southafrica,zambia,mozambique}/tbill_auctions.json"
    series: "tenor 364: latest row and the last row dated on or before 2025-10-13; weighted_avg_rate (stop_rate for Nigeria)"
  - title: "One-year bill rate minus policy rate, October 2026"
    type: "bar"
    data: "data/*/tbill_auctions.json + data/policy_rates.json"
    series: "latest 364-day rate minus policy_rates.rows[].rate, eight markets (Uganda omitted: no rate read)"
  - title: "South Africa, Nigeria, Zambia: one-year bill at each auction since July 2026"
    type: "line"
    data: "data/southafrica/tbill_auctions.json, data/nigeria/tbill_auctions.json, data/zambia/tbill_auctions.json"
    series: "tenor 364, weighted_avg_rate / stop_rate, auctions from 2026-07-01"
---

On 1 October the Bank of Zambia sold one-year Treasury bills at **10.00%**. A year earlier, on 2 October 2025, the same bill had cost the government **14.50%**. On a ZMW 1m loan, that is roughly ZMW 45,000 a year less in interest: a saving for the Treasury, and a loss for whoever lends to it.

That 4.5-point fall is the biggest among the nine African markets whose bill auctions we record. It is also the clearest picture of what 2026 did to the price of local-currency government borrowing: in most places it fell, and in some it fell a long way.

But not everywhere, and not any more in all of them. In South Africa the one-year rate has risen at every auction since early August. In Egypt it is exactly where it was a year ago. Here is the map, and what we think comes next.

## The one-year rate, nine markets

| Market | Latest one-year rate | A year earlier | Change (points) | Policy rate | Bill minus policy rate |
| --- | --- | --- | --- | --- | --- |
| Zambia | 10.00% (1 Oct) | 14.50% | −4.50 | 10.75% | −0.75 |
| Uganda | 11.50% (30 Sep) | 15.00% | −3.50 | not read | — |
| Ghana | 9.75% (9 Oct) | 12.87% | −3.12 | 14.00% | −4.25 |
| Kenya | 9.04% (12 Oct) | 9.39% | −0.35 | 8.75% | +0.29 |
| Mozambique | 12.09% (7 Oct) | 12.23% | −0.14 | 9.25% | +2.84 |
| Egypt | 25.67% (13 Oct) | 25.67% | 0.00 | 19.00% | +6.67 |
| Nigeria | 15.85% (7 Oct) | 15.77% | +0.08 | 26.50% | −10.65 |
| South Africa | 7.54% (5 Oct) | 6.95% | +0.59 | 7.25% | +0.29 |
| Tanzania | 6.28% (7 Oct) | 5.61% | +0.67 | 6.25% | +0.03 |

*Each central bank's own auction results; policy rates as printed on each bank's site on 13 October 2026. Egypt's is the overnight deposit rate. Sources and method below.*

Read down the last column and the continent splits into three groups.

## Group one: the fall is done, for now

In **Kenya, South Africa and Tanzania** the one-year bill sits within 0.3 points of the policy rate. Lenders are not asking for much more than the central bank's own rate, and not accepting much less. (Analysis) That usually means the market expects little change either way.

Kenya shows how the fall ended. The one-year bill bottomed at **8.27%** in April 2026, climbed back to 8.97% by late June, and has cleared between 8.99% and 9.07% at every auction since July. The Central Bank Rate printed on the CBK's site carries the date 7 October 2026 and reads **8.75%**, the same figure that was dated 11 August.

South Africa is moving the other way. Its one-year bill has risen at every auction since 3 August, from **7.17%** to **7.54%** on 5 October, and now sits above the Reserve Bank's 7.25%.

## Group two: the market is ahead of the central bank

In **Ghana, Nigeria and Zambia** the bill clears below the policy rate. Nigeria is the extreme case: the one-year bill cleared at **15.85%** on 7 October, **10.65 points** under the Central Bank of Nigeria's 26.50%. On 26 August it was 17.15%.

Ghana's one-year rate has fallen at eight weekly auctions in a row, from **12.50%** on 14 August to 9.75%. Its 91-day bill cleared at **4.60%** on 9 October, against a policy rate of 14.00%.

(Analysis) When lenders accept far less than the central bank's own rate, two readings are possible: they expect cuts, or they hold more cash than there are bills to buy. Our data shows the price, not the motive. Either way, a gap this wide tends to close one way or the other: the policy rate falls, or bill rates rise.

## Group three: dear, and holding

**Egypt** pays 25.67%, unchanged on a year. **Mozambique**'s one-year bill has cleared at 12.09% at every auction since 9 September, 2.84 points over the central bank's MIMO rate. **Uganda**'s fell 3.50 points to 11.50%, but the Bank of Uganda does not publish its policy rate anywhere we can read automatically, so we cannot place it.

## The long end has not followed

Kenya's bond due in 2034 (first sold in 2019 as a 15-year) cleared at **12.73%** on 5 October, **3.70 points** above the one-year bill. Nigeria's new 10-year bond cleared at 16.79% on 14 September. Uganda paid 16.93% for 20 years on 7 October; Zambia 15.45% for 15 years on 25 September.

(Analysis) Governments that want to stretch their debt out, rather than roll bills every few months, are still paying heavily for the privilege. That is the bill that matters most for budgets in 2027.

## Where rates go into 2027: our view

These are scenarios, not forecasts of fact.

**Our base case: the gaps close from the policy side.** Ghana, Nigeria and Zambia cut towards where their bills already trade, so one-year rates there drift lower slowly rather than fall sharply again. Kenya, Tanzania and South Africa move sideways, close to their policy rates. By mid-2027 most one-year rates sit near today's bill levels, not today's policy rates.

**Higher rates (good for savers, bad for borrowers).** Dollar borrowing keeps getting dearer: the yield on Kenya's 2034 Eurobond rose from **7.96%** on 14 August to **9.31%** on 8 October, according to the CBK's weekly bulletin. If that pressure reaches local auctions, Kenya's one-year bill would climb back above 10%, a level last seen in June 2025, and South Africa's run of rises would continue.

**Lower rates (good for borrowers, bad for savers).** Central banks cut faster than bills already expect. Kenya's one-year bill would revisit its April low of 8.27%; Ghana's would go below 9%.

**What would make us wrong:** an exchange-rate or inflation shock. We do not yet track either, and both would show up there before they show up in auction results.

## Signposts and dates

| Date | What | What to look for |
| --- | --- | --- |
| Every week | Kenya, Ghana, South Africa, Egypt bill auctions | Kenya's one-year above 9.5% or below 8.5% |
| 18 Nov 2026 | Bank of Ghana decision | A cut towards the 9.75% bill rate |
| 19 Nov 2026 | South African Reserve Bank decision | Whether the rise in bills since August is matched |
| 25 Nov 2026 | Banco de Moçambique decision | Whether the 2.84-point bill premium narrows |
| 7 Jan 2027 | Bank of Tanzania decision | Bills have fallen since July; a cut would confirm |
| 28 Jan 2027 | South African Reserve Bank decision | Second read on the direction |

Kenya's next MPC date is not yet in our calendar; the CBK's two most recent meetings were on 11 August and 7 October. Nigeria, Uganda, Egypt and Zambia publish no forward calendar we can read.

## How we worked this out

- **One-year rates:** the 364-day row of each market's file in `data/<market>/tbill_auctions.json` (the latest auction, and the last auction on or before 13 October 2025). The measure is each bank's own headline rate: weighted average for Kenya, Ghana, Uganda, Tanzania, Egypt and Mozambique; the CBN's stop rate for Nigeria; the Bank of Zambia's cut-off yield; the SARB's average allotment rate.
- **Change:** latest minus year-earlier, using the rates rounded to two decimals as shown. Zambia: 10.00 − 14.50 = −4.50. Ghana: 9.75 − 12.87 = −3.12.
- **Bill minus policy rate:** latest one-year rate minus the rate in `data/policy_rates.json` (read 13 October 2026). Nigeria: 15.85 − 26.50 = −10.65.
- **Zambia interest on ZMW 1m:** 1,000,000 × (14.50% − 10.00%) = ZMW 45,000.
- **Kenya curve:** bond FXD3/2019/015, due July 2034, at 12.73% (`data/kenya/bond_auctions.json`, 5 October) minus the 9.04% one-year bill = 3.70 points.
- **Eurobond:** `data/eurobonds.json`, Kenya 2034 maturity, 7.96% on 14 August and 9.3053% on 8 October.
- **Meeting dates:** `data/mpc_calendar.json`, each quoted from the bank's own page. Malawi is left out: its auction data is overdue in our health check.

Every auction is free to check, with the notice it came from: [bill rates across Africa](/markets/tbills) and [policy rates and meeting dates](/rates/policy).

*Information, not advice.*
