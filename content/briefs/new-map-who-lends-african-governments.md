---
title: "The new map of who lends to African governments: the home crowd bids 1.5 times the ask"
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
institutions:
  - cbk
  - treasury
  - cma
sources:
  - name: "Central Bank of Kenya — Treasury bill results, auction dated 12 October 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/71747979_RESULTS%202703-091%202677-182%202632-364%20DATED%2012-10-2026.pdf"
    date: "2026-10-12"
  - name: "Central Bank of Kenya — Treasury bond results, FXD3/2019/015 and FXD1/2019/020, 5 October 2026"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/250350777_RESULTS%20FOR%20FXD3-2019-015%20AND%20%20FXD1-2019-020%20DATED%2005-10-2026.pdf"
    date: "2026-10-05"
  - name: "Central Bank of Kenya — Weekly Bulletin, 9 October 2026 (Eurobond yields, Table 6)"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/321370149_Weekly%20CBK%20Bulletin,%20October%209,%202026.pdf"
    date: "2026-10-09"
  - name: "Debt Management Office Nigeria — Eurobond closing prices and yields, 9 October 2026"
    url: "https://www.dmo.gov.ng/6103-nigeria-s-eurobonds-closing-prices-and-yields-as-at-friday-october-9-2026/file"
    date: "2026-10-09"
  - name: "Debt Management Office Nigeria — FGN bond auction results, September 2026"
    url: "https://www.dmo.gov.ng/6051-summary-of-fgn-bond-auction-results-for-september-2026"
    date: "2026-09-14"
  - name: "Debt Management Office Nigeria — FGN Savings Bond offer, October 2026"
    url: "https://www.dmo.gov.ng/6092-fgn-savings-bond-offer-for-subscription-october-2026/file"
    date: "2026-10-05"
  - name: "Bank of Ghana — auction results"
    url: "https://www.bog.gov.gh/gog_auction_results/"
    date: "2026-10-09"
  - name: "Bank of Zambia — Treasury bill results"
    url: "https://www.boz.zm/markets-securities/treasury-bills"
    date: "2026-10-01"
  - name: "Bank of Uganda — Treasury bill auction results"
    url: "https://www.bou.or.ug/bouwebsite/FinancialMarkets/tbillsauctionresults.html"
    date: "2026-09-30"
  - name: "Bank of Tanzania — Treasury bills"
    url: "https://www.bot.go.tz/TBills?lang=en"
    date: "2026-10-07"
  - name: "Central Bank of Egypt — EGP T-bills historical data"
    url: "https://www.cbe.org.eg/en/auctions/egp-t-bills/historical-data"
    date: "2026-10-13"
  - name: "Capital Markets Authority Kenya — Collective Investment Schemes report, Q2 2026"
    url: "https://www.cmarcp.or.ke/images/Docs/cisreports/2026/CISReportQ2-2026.pdf"
    date: "2026-06-30"
asOf: "2026-10-13"
summary: "Bill auctions in Kenya, Ghana and Zambia now draw about 1.5 times what the government asks for, up from roughly 1.0 to 1.4 a year ago. Over the same weeks, borrowing in dollars got dearer. What the shift means for savers, funds and finance ministries, and three ways it could go."
teaser:
  - "Kenya's 91-day bill drew KES 50.2bn of bids for KES 8bn on 12 October; the one-year fell short of its offer again."
  - "Bid cover at bill auctions, April to October: Kenya 1.50, Ghana 1.46, Zambia 1.51, each up on a year earlier."
  - "Kenya's 2034 dollar bond yield rose 1.35 points between 14 August and 8 October."
gated: false
urgency: watch
minutes: 7
fileFor: "fund managers, bank treasurers, savers, finance ministries"
soWhat: "African governments are leaning on lenders at home, who have money but want to lend it short. Abroad, dollar lenders are charging more. That combination means more frequent refinancing at home and a narrower gap between local and dollar borrowing costs."
unknowns:
  - "Who bids: central banks publish totals, not the names or types of bidders."
  - "Exchange rates: we do not yet hold them, so we cannot say what the dollar-to-local gap is worth after currency moves."
  - "Nigeria's bill auctions: some amounts in our file are inconsistent with the CBN's units and are under review, so Nigeria is left out of the bid-cover table."
charts:
  - title: "Bid cover at Treasury bill auctions, 13 April to 13 October, 2024, 2025 and 2026"
    type: "grouped bar"
    data: "data/{kenya,ghana,zambia,uganda,tanzania,egypt}/tbill_auctions.json"
    series: "sum of received / sum of offered per window (Ghana: sum of bids / target_total_ghs_m per tender)"
  - title: "Kenya: bids as a share of the offer, 91-day against 364-day, each auction since April 2026"
    type: "line"
    data: "data/kenya/tbill_auctions.json"
    series: "subscription_pct for tenor 91 and tenor 364, value_date from 2026-04-13"
  - title: "Kenya borrowing to 2034: shilling bond auctions against the dollar bond"
    type: "line with points"
    data: "data/eurobonds.json (kenya.history, key 2034) + data/kenya/bond_auctions.json (issue FXD3/2019/015)"
    series: "daily Eurobond yield; weighted_avg_rate at each FXD3/2019/015 auction"
---

At the Central Bank of Kenya's auction dated 12 October, investors bid **KES 50.2bn** for three-month Treasury bills. The government had asked for **KES 8bn**. At the same auction, the one-year bill drew KES 9.6bn of bids for KES 10bn on offer: short again, as it has been at 20 of the 27 weekly auctions since mid-April.

That one result holds most of the story of who lends to African governments in late 2026. Lenders at home have money and want to lend it, but for a short time. Lenders abroad, in dollars, are charging more than they were in August.

## The home crowd is bidding more

The simplest measure of appetite is **bid cover**: the money bid at an auction divided by the money the government asked for. Above 1, the government can choose the cheapest bids. Below 1, it takes what it can get.

| Bill auctions, mid-April to mid-October | 2024 | 2025 | 2026 |
| --- | --- | --- | --- |
| Kenya | 1.24 | 1.38 | **1.50** |
| Ghana | 0.92 | 1.03 | **1.46** |
| Zambia | 1.01 | 1.08 | **1.51** |
| Uganda | 2.19 | 1.86 | 2.16 |
| Tanzania | 1.33 | 2.03 | 1.99 |
| Egypt | 1.77 | 2.46 | 2.43 |

*All bids divided by all amounts offered across every bill auction in each six-month window (Ghana: against its weekly target). Each central bank's own results; method below.*

In **Kenya, Ghana and Zambia**, cover has risen two years running. Ghana is the sharpest turn: in the same months of 2024 its auctions drew less than the government's target, 0.92 times. This year they drew 1.46 times.

**Egypt** tells the story from the other side. It put up EGP 5.37tn of bills in this year's window, against EGP 3.84tn a year earlier, about 40% more, and still drew 2.43 times what it asked.

(Analysis) Home lenders, meaning banks, pension schemes, insurers, funds and individuals, have become the lender of first resort, and in most of these markets they have more money on the table than a year ago.

## But they want to lend short

Kenya shows the catch. Split the cover by maturity:

| Kenya, mid-April to mid-October | 2025 | 2026 |
| --- | --- | --- |
| 91-day bill | 1.92 | **3.58** |
| 364-day bill | 1.83 | **0.73** |

A year ago investors were as keen on the one-year bill as the three-month. Now they bid more than three and a half times the offer for three months, and under three-quarters of it for a year.

(Analysis) The reward for waiting is thin. On 12 October the one-year bill paid 9.04% and the 91-day 8.76%: **0.27 points** more for lending four times as long. Short money can be lent again at a better rate if rates rise. For the Treasury, the cost is that more of its debt comes due every few weeks and must be refinanced at whatever rate the market sets that week.

## The dollar lenders want more

Abroad, the price went the other way. Kenya's dollar bond due 2034 yielded **7.96%** on 14 August and **9.31%** on 8 October, a rise of **1.35 points**, according to the yields the CBK publishes in its weekly bulletin. Nigeria's 2036 dollar bond went from 7.485% on 21 September to 8.125% on 9 October in the Debt Management Office's daily prices.

That changes the arithmetic of where to borrow. Kenya keeps reopening a shilling bond, FXD3/2019/015, first sold in 2019 as a 15-year and due in July 2034, the same year as the dollar bond.

| Same maturity, two currencies | 7 Sep 2026 | 5 Oct 2026 |
| --- | --- | --- |
| Shilling bond auction (FXD3/2019/015) | 12.76% | 12.73% |
| Dollar bond due 2034 (that day) | 7.98% | 9.23% |
| **Extra cost of borrowing in shillings** | **4.78 points** | **3.50 points** |

The gap shrank by 1.28 points in four weeks. Almost all of it came from the dollar side: the shilling yield moved 0.03 points; the dollar yield rose 1.25.

(Analysis) The gap is roughly what the government pays to avoid exchange-rate risk, and what a foreign investor earns for taking it. When it narrows because dollars got dearer, borrowing at home looks relatively better value to a finance ministry, and a little less rewarding to a foreign fund.

In Nigeria the gap is far wider. The new 10-year naira bond cleared at **16.79%** on 14 September; the dollar bond due January 2036 yielded **8.125%** on 9 October, about 8.7 points less. The two dates differ, so treat it as an order of magnitude.

## Who the home crowd is

Our auction files show totals, not names. Two pools are visible. Kenya's money market funds held **KES 459.9bn** at the end of June 2026, dollar funds included, by the Capital Markets Authority's count; by design they buy short-term paper. And Nigeria is going straight to individuals: its October Savings Bond offered **13.071%** for two years and **14.071%** for three, from a minimum of NGN 5,000.

## What it means

**For savers** (Analysis): the short end is crowded. In Kenya the three-month bill is many times oversubscribed and pays less than the one-year. Before comparing any fund, account or bill, check the rate after tax, how long the money is tied up, and whether the figure is current.

**For funds** (Analysis): a narrower local-to-dollar gap changes the trade-off between local bonds and Eurobonds. Our data cannot price the currency risk on either side.

**For finance ministries and treasurers** (Analysis): the home market is deep but short. Lengthening debt means paying up for it, as Kenya's 2034 shilling bond at 12.73% against a 9.04% one-year bill shows.

## Three ways it could go: our view

**Our base case: home lenders stay first, and stay short.** Cover at bill auctions holds above 1 in Kenya, Ghana and Zambia; Kenya's one-year keeps selling below its offer more often than not; the shilling-dollar gap stays near 3.5 points.

**The dollar door reopens.** Eurobond yields fall back towards their August levels, with Kenya's 2034 below 8%. Governments shift some borrowing abroad again, and local auctions face less supply.

**The squeeze.** Dollar yields keep rising while home lenders stay short. To sell longer debt at home, governments pay more: Kenya's 2034 shilling bond would clear above 13% at its next reopening, and the one-year bill above 9.5%.

**What to watch:** the CBK's weekly bill results and its Friday bulletin of Eurobond yields; the DMO's daily Eurobond prices; Kenya's bond auctions; and the Bank of Ghana's decision on 18 November.

## How we worked this out

- **Bid cover:** for each market, every bill auction dated 13 April to 13 October (12 October for 2025 and 2024 windows) in `data/<market>/tbill_auctions.json`: the sum of amounts received divided by the sum of amounts offered. Ghana publishes one target per weekly tender, so its cover is total bids over the target (`target_total_ghs_m`). Kenya 2026: KES 1,057.5bn bid ÷ KES 704.0bn offered = 1.50.
- **Kenya by maturity:** the same sums, 91-day and 364-day rows only.
- **20 of 27:** Kenya 364-day auctions from 13 April 2026 with `subscription_pct` below 100.
- **Egypt:** EGP 5.37tn ÷ 3.84tn = 1.40, about 40% more offered.
- **Eurobonds:** `data/eurobonds.json`. Kenya 2034: 9.3053 − 7.96 = 1.35. The 2034 yield on 7 September (7.98) and 5 October (9.2331) are matched to the auction dates.
- **Gap:** FXD3/2019/015 weighted average rate (`data/kenya/bond_auctions.json`) minus the dollar yield: 12.7631 − 7.98 = 4.78; 12.7338 − 9.2331 = 3.50. Narrowing 4.78 − 3.50 = 1.28.
- **Nigeria gap:** 16.79 − 8.125 = 8.665, shown as about 8.7.
- **Money market funds:** `data/kenya/cma_mmf.json`, total assets KES 459,874,570,485 at 30 June 2026.
- Nigeria's bill auctions are left out of the cover table: several rows in our file show bids in different units from the offers, which we are checking against the CBN.

Every auction, with the notice it came from: [bill rates across Africa](/markets/tbills), [Eurobond yields](/markets/eurobonds) and [Kenya's bill auctions](/markets/kenya-tbills).

*Information, not advice.*
