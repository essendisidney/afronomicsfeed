---
title: "The shilling that stopped falling: KES 314,200 off a US$10,000 loan, KES 15,710 off a US$500 transfer"
date: "2026-10-15"
type: verdict
status: published
sector: markets
entities:
  - "Central Bank of Kenya"
  - "Republic of Kenya"
series: kenya-shilling
verdict: "The shilling's recovery was real and, in every CBK bulletin we read, it has held for two and a half years, but it was a transfer, not a gift: anyone who owes or pays in dollars now needs about a fifth fewer shillings, and every family living on dollars from abroad gets about a fifth fewer."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "The CBK rate hit KES 161.36 to the US dollar on 23 January 2024. By 28 March 2024 it was KES 131.80, and on 8 October 2026 it was KES 129.94. A US$10,000 debt now costs KES 314,200 less in shillings; a US$500 monthly transfer from abroad buys KES 15,710 less."
desk: "Afronomics Markets Desk"
disclosure: "Afronomics and its founder hold no US-dollar loans, US-dollar deposits or currency positions."
sources:
  - name: "CBK Weekly Bulletin, 26 January 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1198707913_Weekly%20CBK%20Bulletin%20January%2026,%202024.pdf"
    date: "2024-01-26"
  - name: "CBK Weekly Bulletin, 19 January 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1202498382_Weekly%20CBK%20Bulletin%20January%2019,%202024.pdf"
    date: "2024-01-19"
  - name: "CBK Weekly Bulletin, 9 February 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1955278631_Weekly%20CBK%20Bulletin%20February%209%202024.pdf"
    date: "2024-02-09"
  - name: "CBK Weekly Bulletin, 16 February 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1936571086_Weekly%20CBK%20Bulletin%20February%2016%202024.pdf"
    date: "2024-02-16"
  - name: "CBK Weekly Bulletin, 23 February 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1070783140_Weekly%20CBK%20Bulletin%20February%2023%202024.pdf"
    date: "2024-02-23"
  - name: "CBK Weekly Bulletins, 1 December 2023 to 9 October 2026 (Table 1, Kenya Shilling Exchange Rates)"
    url: "https://www.centralbank.go.ke/releases/weekly-bulletin/"
    date: "2026-10-09"
  - name: "CBK Weekly Bulletin, 20 December 2024"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1163750015_Weekly%20CBK%20Bulletin%20December%2020%202024.pdf"
    date: "2024-12-20"
  - name: "CBK Weekly Bulletin, 9 October 2026"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/321370149_Weekly%20CBK%20Bulletin,%20October%209,%202026.pdf"
    date: "2026-10-09"
  - name: "CBK Weekly Bulletin, 21 November 2025"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/199222480_Weekly%20CBK%20Bulletin%20November%2021,%202025.pdf"
    date: "2025-11-21"
  - name: "CBK Weekly Bulletin, 28 November 2025"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/917842649_Weekly%20CBK%20Bulletin%20November%2028%202025.pdf"
    date: "2025-11-28"
  - name: "CBK, MPC press release, meeting of 3 April 2024"
    url: "https://www.centralbank.go.ke/uploads/mpc_press_release/309290372_MPC%20Press%20Release%20-%20Meeting%20of%20April%203%202024.pdf"
    date: "2024-04-03"
  - name: "Afronomics remittance file, World Bank Remittance Prices Worldwide (January to March 2025)"
    url: "https://remittanceprices.worldbank.org/data-download"
    date: "2025-03-31"
calls:
  - statement: "The CBK rate is between KES 125 and KES 135 to the US dollar on 31 March 2027"
    measure: "CBK indicative mean rate, KES per US dollar, for 31 March 2027 (or the last working day before it), CBK Weekly Bulletin Table 1"
    comparator: "between"
    threshold: [125, 135]
    unit: "KES per US$"
    check_source: "CBK Weekly Bulletin, Table 1, Kenya Shilling Exchange Rates"
    check_date: "2027-03-31"
  - statement: "The shilling is weaker on 31 March 2027 than its 8 October 2026 rate of KES 129.94"
    measure: "CBK indicative mean rate, KES per US dollar, for 31 March 2027 (or the last working day before it)"
    comparator: ">"
    threshold: 129.94
    unit: "KES per US$"
    check_source: "CBK Weekly Bulletin, Table 1, Kenya Shilling Exchange Rates"
    check_date: "2027-03-31"
  - statement: "CBK foreign exchange reserves still cover at least five months of imports in the last Weekly Bulletin of March 2027"
    measure: "CBK foreign exchange reserves, months of import cover, latest date in the last Weekly Bulletin published in March 2027 (Table 2)"
    comparator: ">="
    threshold: 5
    unit: "months of import cover"
    check_source: "CBK Weekly Bulletin, Table 2, Foreign Exchange Reserves"
    check_date: "2027-03-31"
followUps:
  - { date: "2027-03-31", what: "Grade the exchange-rate and reserves calls" }
tiles:
  - label: "CBK rate, 23 Jan 2024"
    value: "KES 161.36"
    note: "Shillings per US dollar; the weakest in the CBK tables we read"
    source: "CBK Weekly Bulletin, 26 January 2024"
  - label: "CBK rate, 8 Oct 2026"
    value: "KES 129.94"
    note: "About 19.5% fewer shillings for each dollar than on 23 Jan 2024"
    source: "CBK Weekly Bulletin, 9 October 2026"
charts:
  - type: line
    title: "The shilling hit KES 161 in January 2024, was back near 130 by March, and has sat near 130 in every bulletin we read since"
    unit: "KES per US dollar, CBK indicative mean rate"
    source: "CBK Weekly Bulletins, 1 December 2023 to 9 October 2026 (Table 1, Kenya Shilling Exchange Rates)"
    data:
      - { label: "Nov 23", value: 153.15 }
      - { label: "Jan 24", value: 161.36 }
      - { label: "Mar 24", value: 131.80 }
      - { label: "Jun 24", value: 129.15 }
      - { label: "Jun 25", value: 129.29 }
      - { label: "Jun 26", value: 129.63 }
      - { label: "Oct 26", value: 129.94 }
    highlight: ["Jan 24"]
    annotations:
      - { from: "Jan 24", to: "Mar 24", label: "Feb 2024: CBK rate to 13%, US$1.5bn Eurobond" }
      - { from: "Jun 24", to: "Oct 26", label: "KES 128.55 to 129.96 in every bulletin we read" }
  - type: bar
    title: "The same dollar bill costs a fifth less in shillings than in January 2024"
    unit: "KES needed, thousands"
    source: "CBK Weekly Bulletin, 9 October 2026"
    data:
      - { label: "US$5,000 fees, Jan 2024", value: 806.8 }
      - { label: "US$5,000 fees, Oct 2026", value: 649.7 }
      - { label: "US$10,000 loan, Jan 2024", value: 1613.6 }
      - { label: "US$10,000 loan, Oct 2026", value: 1299.4 }
    highlight: ["US$5,000 fees, Oct 2026", "US$10,000 loan, Oct 2026"]
---

On 23 January 2024 one US dollar cost KES 161.36 at the Central Bank of Kenya's rate. On 8 October 2026 it cost KES 129.94.

That gap is money. A US$10,000 debt is KES 314,200 smaller in shillings. A US$500 transfer from a relative abroad buys KES 15,710 less, every month.

**The Afronomics verdict: the shilling's recovery was real and, in every CBK bulletin we read, it has held for two and a half years, but it was a transfer, not a gift: anyone who owes or pays in dollars now needs about a fifth fewer shillings, and every family living on dollars from abroad gets about a fifth fewer.**

## What happened

(Facts) The shilling slid through late 2023. The CBK's indicative mean rate was KES 153.15 to the US dollar on 30 November 2023, KES 154.69 on 21 December and KES 157.39 on 4 January 2024. It passed KES 160 on 15 January (KES 160.24) and reached KES 161.36 on 23 January 2024, the weakest daily rate in every CBK table we read. All rates here are from Table 1 of the CBK Weekly Bulletin.

(Facts) On 6 February 2024 the CBK's Monetary Policy Committee raised the Central Bank Rate from 12.5% to 13.0%. The CBK's bulletin of 9 February says the MPC noted "the continued, albeit reduced pressures on the exchange rate" and wanted to address "residual pressures on the exchange rate". The rate was still KES 160.09 on 8 February.

(Facts) The turn came the next week. The CBK's bulletin of 16 February reports that Kenya "successfully issued a new six year Eurobond of USD 1.5 billion", to be used for "liability management operations relating to the Eurobond set to mature in June 2024", at a coupon of 9.75%. The shilling went from KES 160.09 on 8 February to KES 153.20 on 15 February and KES 142.78 on 21 February. By 28 March it was KES 131.80. [Our Receipt on the 2024 Eurobond buyback](/receipts/2026-10-15-eurobond-buyback-2024) has what that bond cost.

(Facts) The CBK's own explanation came at its next meeting. Its press release of 3 April 2024 says "its previous measures have lowered inflation, addressed the exchange rate pressures, and anchored inflationary expectations". It also says fuel inflation fell "largely reflecting the impact of the shilling's appreciation which resulted in a decrease in electricity prices and a downward adjustment in pump prices."

(Facts) Since then, in the bulletins we read, the rate has barely moved. In every CBK table we read from 14 June 2024 to 8 October 2026, thirteen weekly bulletins, the daily rate stayed between KES 128.55 (21 June 2024) and KES 129.96 (20 November 2025). We did not read every week.

(Facts) The reserves behind it grew. On 18 January 2024 the CBK's table showed "CBK Usable Foreign Exchange Reserves" of US$6,814 million, 3.64 months of import cover, below the four months the CBK must "endeavor to maintain". On 8 October 2026 it showed "CBK Foreign Exchange Reserves" of US$14,736 million, 5.9 months of cover. The label is the only change we found: the bulletin of 21 November 2025 still said "Usable" (with the note "Excludes encumbered reserves"), the bulletin of 28 November dropped the word and the note, and both printed the same figure for 20 November 2025, US$12,009 million. We found no CBK note explaining the change.

## What the numbers show

(Analysis) At KES 161.36 a dollar cost 31.42 shillings more than at KES 129.94. That is 19.5% fewer shillings for every dollar now. Here is what it means for four ordinary bills:

| In dollars | At KES 161.36 (23 Jan 2024) | At KES 129.94 (8 Oct 2026) | Difference |
| --- | --- | --- | --- |
| A US$10,000 loan | KES 1,613,600 | KES 1,299,400 | KES 314,200 less |
| US$5,000 school fees | KES 806,800 | KES 649,700 | KES 157,100 less |
| US$500 sent home each month | KES 80,680 | KES 64,970 | KES 15,710 less a month |
| The same, for a year | KES 968,160 | KES 779,640 | KES 188,520 less |

*CBK indicative mean rates from the Weekly Bulletins of 26 January 2024 and 9 October 2026. Banks and money transfer firms buy and sell at their own rates, either side of the CBK rate.*

(Analysis) The winners are anyone who owes or spends in dollars: a business or household with a dollar loan, a parent paying fees abroad, an importer. The losers are anyone who earns in dollars and spends in shillings: the family receiving money from a relative in the US, and the exporter. A family getting US$500 a month has KES 188,520 less a year to spend than it would have at the January 2024 rate.

(Facts) More dollars did come home. The CBK's bulletin of 20 December 2024 says remittances for the 12 months to November 2024 were US$4,872 million, up 16.7% from US$4,175 million a year earlier, with the US the largest source at 53.4%. The fee is a smaller matter than the rate: sending the equivalent of US$200 from the US to Kenya cost 5.2% on average in January to March 2025, according to the World Bank survey in our remittance file.

(Analysis) A steady shilling does not mean cheap fuel. The CBK quotes Murban crude, a Gulf oil benchmark, at US$78.47 a barrel on 18 January 2024, when the shilling was KES 160.79. On 8 October 2026 it was US$101.67, at KES 129.94. In shillings, that barrel went from about KES 12,617 to about KES 13,211, up 4.7%. The stronger shilling has been more than eaten by the oil price. This is the benchmark price, not what Kenya pays to land fuel, which we did not find in a primary source.

## Our verdict

(Opinion) **The shilling's recovery was real and, in every CBK bulletin we read, it has held for two and a half years, but it was a transfer, not a gift: anyone who owes or pays in dollars now needs about a fifth fewer shillings, and every family living on dollars from abroad gets about a fifth fewer.**

The stability is the part worth valuing. A rate that moved by no more than KES 1.41 across thirteen bulletins in more than two years lets a school, an importer or a borrower plan. Kenya did not have that between 13 December 2023 and 23 January 2024, when the shilling lost KES 8.01 against the dollar.

But a currency's "strength" is not a prize everyone shares. The same move that took KES 157,100 off a family's fee bill took KES 15,710 a month off another family's income from abroad. The headlines in 2024 counted only the first.

And the timing matters. The CBK says its own policy did the work. The rate turned in the week the Eurobond was sold, and that six-year bond costs Kenya a 9.75% coupon every year it is outstanding. The calm was partly bought, and taxpayers are still paying for it.

### What would change our mind

A shilling that holds near KES 130 while oil prices rise and the CBK's reserves fall, which would show the stability does not depend on fresh dollar borrowing. Or evidence that the families receiving dollars were made whole by higher remittances in dollars, which the CBK's 12-month figures hint at but do not prove for any one household.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **The daily series:** every CBK indicative mean rate from 17 November 2023 to 8 October 2026 that we have read, with the bulletin each one came from.
- **Your own bill:** a calculator for any dollar amount, at the 23 January 2024 rate and at today's CBK rate.
- **Reserves, week by week:** the CBK's reserves and months of import cover from December 2023 to October 2026, with the change in how the CBK labels them.
- **Follow-ups:** a Receipt when the calls are graded on 31 March 2027.
