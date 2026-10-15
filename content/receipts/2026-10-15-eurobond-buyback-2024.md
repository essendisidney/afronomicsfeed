---
title: "Kenya's Eurobond rescue: US$43m a year more in interest to clear its first bond"
date: "2026-10-15"
type: verdict
status: published
sector: public-money
entities:
  - "Republic of Kenya"
  - "The National Treasury"
  - "Central Bank of Kenya"
series: kenya-eurobonds
verdict: "Kenya paid off its first Eurobond in full, but only by borrowing at 10.375%, a price that showed how close markets thought it was to the edge, and one taxpayers will pay until 2031."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "In February 2024 Kenya sold a US$1.5 billion bond at 10.375% to buy back most of a US$2 billion bond that cost 6.875%. The default scare ended. The interest bill went up, and it stays up until 2031."
desk: "Afronomics Public Money Desk"
disclosure: "Afronomics and its founder hold no Kenya Eurobonds."
sources:
  - name: "Republic of Kenya, offering circular for the 9.750% Amortising Notes due 2031"
    url: "https://www.rns-pdf.londonstockexchange.com/rns/1867D_1-2024-2-14.pdf"
    date: "2024-02-14"
  - name: "Capital FM, order book for the 2031 bond"
    url: "https://capitalfm.africa/kenyas-eurobond-attracts-more-than-sh957-billion-in-orders/"
    date: "2024-02-13"
  - name: "CBK Weekly Bulletin, 16 February 2024"
    url: "https://centralbank.go.ke/uploads/weekly_bulletin/1936571086_Weekly%20CBK%20Bulletin%20February%2016%202024.pdf"
    date: "2024-02-16"
  - name: "Business Daily, Kenya settles the 2024 balance with World Bank cash"
    url: "https://www.businessdailyafrica.com/bd/economy/kenya-settles-sh72bn-eurobond-debt-balance-with-world-bank-cash-4668024"
    date: "2024-06-24"
  - name: "Kenya News Agency, pricing of the US$1.5bn 2036 Eurobond"
    url: "https://www.kenyanews.go.ke/govt-announces-pricing-of-1-5bn-eurobond/"
    date: "2025-02-27"
  - name: "Republic of Kenya, Result of Tender Offer - Replacement (7.000% notes due 2027)"
    url: "https://www.investegate.co.uk/announcement/rns/the-republic-of-kenya--19wx/result-of-tender-offer-replacement-/8762753"
    date: "2025-03-04"
  - name: "Republic of Kenya, Result of Tender Offer (7.250% notes due 2028)"
    url: "https://www.investegate.co.uk/announcement/rns/the-republic-of-kenya--19wx/result-of-tender-offer/9163366"
    date: "2025-10-10"
  - name: "Republic of Kenya, Result of Tender Offer (2028 and 2032 notes)"
    url: "https://www.investegate.co.uk/announcement/rns/the-republic-of-kenya--19wx/result-of-tender-offer/9449389"
    date: "2026-02-26"
  - name: "The Star, Treasury prices the 2034 and 2039 Eurobonds"
    url: "https://www.the-star.co.ke/news/2026-02-20-treasury-prices-sh292bn-eurobond-in-debt-strategy-push"
    date: "2026-02-20"
  - name: "Afronomics Eurobond file, CBK Weekly Bulletin of 9 October 2026"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/321370149_Weekly%20CBK%20Bulletin,%20October%209,%202026.pdf"
    date: "2026-10-09"
  - name: "Afronomics Eurobond file, Nigeria DMO closing prices of 14 October 2026"
    url: "https://www.dmo.gov.ng/6108-nigeria-s-eurobonds-closing-prices-and-yields-as-at-wednesday-october-14-2026/file"
    date: "2026-10-14"
calls:
  - statement: "Kenya's 2031 Eurobond yields less than 9% on 31 March 2027"
    measure: "Yield on Kenya's 2031 Eurobond for 31 March 2027, CBK Weekly Bulletin Table 6"
    comparator: "<"
    threshold: 9
    unit: "%"
    check_source: "CBK Weekly Bulletin, Table 6 (Afronomics Eurobond file)"
    check_date: "2027-03-31"
  - statement: "Kenya's 2031 Eurobond still yields more than Nigeria's January 2031 Eurobond on 31 March 2027"
    measure: "Kenya 2031 yield minus Nigeria 8.747% January 2031 yield on 31 March 2027, in points"
    comparator: ">"
    threshold: 0
    unit: "points"
    check_source: "CBK Weekly Bulletin Table 6 and Nigeria DMO daily Eurobond prices (Afronomics Eurobond file)"
    check_date: "2027-03-31"
  - statement: "Kenya pays the 16 February 2027 coupon on the 2031 notes, US$73.125 million, on the due date"
    measure: "16 February 2027 coupon on the 9.750% notes due 2031 paid on the due date"
    comparator: "is"
    threshold: "yes"
    check_source: "National Treasury, monthly public debt bulletin for February 2027"
    check_date: "2027-03-31"
  - statement: "Kenya's next new dollar Eurobond carries a coupon below the 9.75% of the 2031 notes"
    measure: "Coupon of the first new Kenya US-dollar Eurobond priced between 15 October 2026 and 30 June 2027 (void if none is priced)"
    comparator: "<"
    threshold: 9.75
    unit: "%"
    check_source: "National Treasury pricing press release"
    check_date: "2027-06-30"
followUps:
  - { date: "2027-02-16", what: "Coupon of US$73.125m due on the 2031 notes" }
  - { date: "2028-02-28", what: "The 7.25% 2028 notes mature: about US$281m left after the 2025 and 2026 buybacks" }
  - { date: "2029-02-16", what: "First US$500m instalment of the 2031 notes falls due" }
tiles:
  - label: "Extra interest, every year to 2029"
    value: "US$43.1m"
    note: "On US$1.5bn: 9.75% is US$146.25m a year, 6.875% would be US$103.125m"
    source: "Republic of Kenya, offering circular for the 9.750% Amortising Notes due 2031"
  - label: "In shillings, at today's rate"
    value: "KES 5.6bn a year"
    note: "US$43.125m at the CBK rate of KES 129.94 on 8 October 2026"
    source: "Afronomics Eurobond file, CBK Weekly Bulletin of 9 October 2026"
charts:
  - type: bar
    title: "Kenya now pays more interest a year on US$500m less debt"
    unit: "Coupon a year, US$ million"
    source: "Republic of Kenya, offering circular for the 9.750% Amortising Notes due 2031"
    data:
      - { label: "Old bond: US$2bn at 6.875%", value: 137.5 }
      - { label: "New bond: US$1.5bn at 9.75%", value: 146.25 }
    highlight: ["New bond: US$1.5bn at 9.75%"]
  - type: line
    title: "The market now charges Kenya far less than the 10.375% it locked in"
    unit: "Yield on Kenya's 2031 Eurobond, %"
    source: "Afronomics Eurobond file, CBK Weekly Bulletin of 9 October 2026"
    data:
      - { label: "14 Aug 2026", value: 7.28 }
      - { label: "21 Aug", value: 7.38 }
      - { label: "28 Aug", value: 7.225 }
      - { label: "4 Sep", value: 7.207 }
      - { label: "11 Sep", value: 7.482 }
      - { label: "18 Sep", value: 7.582 }
      - { label: "25 Sep", value: 7.884 }
      - { label: "2 Oct", value: 8.1248 }
      - { label: "8 Oct", value: 8.0999 }
    highlight: ["8 Oct"]
    reference: { value: 10.375, label: "Yield at issue, February 2024" }
---

Kenya's first Eurobond, US$2 billion borrowed in 2014, cost 6.875% a year. To pay most of it off in February 2024, Kenya borrowed US$1.5 billion at 10.375%.

It worked: the bond was cleared and the default scare ended. The bill for that is about US$43 million a year in extra interest, roughly KES 5.6 billion at today's rate, and taxpayers pay it until 2029, then less each year to 2031.

**The Afronomics verdict: Kenya paid off its first Eurobond in full, but only by borrowing at 10.375%, a price that showed how close markets thought it was to the edge, and one taxpayers will pay until 2031.**

## What happened

(Facts) On 7 February 2024 Kenya offered to buy back its US$2 billion 6.875% notes due in June 2024, paying for them with a new bond. The new bond is US$1.5 billion of 9.750% amortising notes due 2031, sold at 97.270% of face value, according to the offering circular dated 14 February 2024. Interest is paid each 16 February and 16 August, and the face value is repaid in three US$500 million instalments on 16 February 2029, 2030 and 2031.

(Facts) Capital FM reported on 13 February 2024 that the bond had drawn orders of more than US$6 billion, and that the old notes were due on 24 June 2024. Business Daily puts the amount Kenya bought back at US$1.44 billion.

(Facts) That left US$560 million. Business Daily reported on 24 June 2024, citing the Central Bank of Kenya, that it had been paid off the previous Friday with part of a US$1.2 billion World Bank loan, along with a final interest payment of US$19.25 million.

## What the numbers show

(Analysis) A price of 97.27 means Kenya received US$97.27 for every US$100 it owes. On US$1.5 billion it raised US$1.459 billion (1,500 × 0.9727 = 1,459.05) and must repay the full US$1.5 billion: US$40.95 million more than it received, before any fees. That gap, spread over the bond's life on top of the 9.75% coupon, is why the yield is 10.375% and not 9.75%. We checked: the price, the coupon and the 2029–2031 repayment dates give a yield of 10.375% to three decimal places. The CBK's Weekly Bulletin of 16 February 2024 rounds it to 10.3%; the Treasury, as quoted by Capital FM, to 10.4%.

| Per year | Old bond, 6.875% | New bond, 9.75% |
| --- | --- | --- |
| Interest on US$1.5bn | US$103.125m | US$146.25m |
| Interest on the full bond | US$137.5m (on US$2bn) | US$146.25m (on US$1.5bn) |
| Extra on US$1.5bn | | US$43.125m |
| Extra in shillings at KES 153.20 (15 Feb 2024) | | KES 6.61bn |
| Extra in shillings at KES 129.94 (8 Oct 2026) | | KES 5.60bn |

*Coupons from the offering circular. Exchange rates are CBK mean rates from its Weekly Bulletins of 16 February 2024 and 9 October 2026. Arithmetic: 1,500 × (9.75% − 6.875%) = 43.125.*

(Analysis) The second row is the one to remember. Kenya now pays US$146.25 million a year in interest on US$1.5 billion. On the whole US$2 billion of the old bond it paid US$137.5 million. It pays more interest on US$500 million less debt.

(Analysis) Over the bond's life, if Kenya pays every coupon and instalment as scheduled, the coupons alone come to US$877.5 million: US$146.25 million a year for five years, then US$97.5 million on the US$1 billion left in the sixth year and US$48.75 million on the last US$500 million in the seventh. At KES 129.94 that is about KES 114 billion in interest on a US$1.5 billion loan.

(Analysis) The stronger shilling has cut the cost in shillings. The extra interest was worth KES 6.61 billion a year at the rate on 15 February 2024, and KES 5.60 billion at the rate on 8 October 2026. Two weeks before the deal, on 2 February 2024, the CBK rate was KES 160.57.

## Where the bond trades now

(Facts) On 8 October 2026 Kenya's 2031 Eurobond yielded 8.10%, according to the CBK Weekly Bulletin. That is 2.28 points below its yield at issue. It has risen from 7.28% on 14 August 2026. On 14 October 2026 Nigeria's 8.747% bond due January 2031 yielded 7.23%, according to Nigeria's Debt Management Office.

(Analysis) The market now charges Kenya much less to borrow until 2031 than it did in February 2024, though more than it charges Nigeria. But the 9.75% coupon is fixed. Kenya pays it whatever the bond trades at.

## What Kenya has borrowed since

(Facts) Kenya has gone back to the market three times since, each time paired with a buyback of an older bond:

| Priced | New bonds | Coupon | Bought back |
| --- | --- | --- | --- |
| February 2024 | US$1.5bn due 2031 | 9.75% | US$1.44bn of the 2024 notes |
| February 2025 | US$1.5bn due 2036 | 9.50% | US$579.69m of the 2027 notes |
| October 2025 | US$1.5bn in two series | not shown | US$628.44m of the 2028 notes |
| February 2026 | US$900m due 2034; US$1.35bn due 2039 | 7.875%; 8.700% | US$415.4m of the 2028 and 2032 notes |

*Sources: offering circular and Business Daily (2024); Kenya News Agency and the Republic's tender result (February 2025); the Republic's tender result of 10 October 2025 (October 2025; the coupons of its two series are not shown because we could not open their terms); The Star and the Republic's tender result of 26 February 2026 (2026).*

(Analysis) The coupons fell. Kenya's 2034 bond, priced in February 2026, matures three years after the 2031 bond and pays 7.875% against its 9.75%. The February 2024 deal was the most expensive in this run.

## Our verdict

(Opinion) **Kenya paid off its first Eurobond in full, but only by borrowing at 10.375%, a price that showed how close markets thought it was to the edge, and one taxpayers will pay until 2031.**

The fair comparison is not 6.875% against 10.375%. The 6.875% was a 2014 price, and nobody was offering it in 2024. The real choice in February 2024 was between paying what the market asked and finding US$2 billion some other way by June, with the shilling above KES 160 to the dollar. Kenya chose to pay, and the deal did its job: the bond was cleared and the shilling recovered.

But a price that high is a verdict on the borrower. Kenya paid 10.375% because, in February 2024, lenders doubted it would find US$2 billion by June. The US$43 million a year is what that doubt costs on this one bond, and it does not fall when the doubt does.

The lesson is in the second table. The same government borrowed for longer at 7.875% two years later. The rate at which Kenya borrows tracks how much lenders trust its budget, and that is set in Nairobi as much as in London.

### What would change our mind

A sustained fall in Kenya's dollar borrowing costs that holds through a bad global month, not only a good one. A Treasury buyback of the 2031 notes at a price that saves money. And a budget that cuts how much of Kenya's revenue goes on interest.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **The full cash-flow schedule:** every coupon and instalment on the 2031 notes from August 2024 to February 2031, in dollars and in shillings at each date's CBK rate.
- **The yield check:** how 97.27, 9.75% and three instalments give 10.375%, worked out step by step.
- **What a buyback of the 2031s would save:** the interest saved at today's yield against the premium Kenya would have to pay.
- **The Eurobond tracker:** every Kenyan Eurobond, its coupon, what is left of it and its daily yield from the CBK Weekly Bulletin.
- **Follow-ups:** a Receipt on each coupon date, on the 2027 and 2028 maturities, and on Kenya's next Eurobond.
