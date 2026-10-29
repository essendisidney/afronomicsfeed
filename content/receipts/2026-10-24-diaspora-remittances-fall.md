---
title: "Kenya's diaspora money: North America sent US$245m less in nine months, and the US tax is only 1%"
date: "2026-10-24"
type: verdict
status: published
sector: markets
entities:
  - "Central Bank of Kenya"
  - "US Internal Revenue Service"
  - "World Bank"
series: kenya-remittances
verdict: "In our view, the US remittance tax is too small and too narrow to explain an 11.19% fall in money from North America on its own; the bigger, steadier cost for most senders is still the fee, and the shilling can absorb this fall, but a family that depends on one relative in America cannot."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-24"
summary: "Kenyans abroad sent home US$3.769bn from January to September 2026, US$5.2m less than a year earlier. North America sent US$245.2m less, down 11.19%. The new US tax is 1% and applies only to transfers paid in cash or similar paper. The average fee on US$200 from the US was 5.2% in the last World Bank survey in our file."
desk: "Afronomics Markets Desk"
disclosure: "Afronomics and its founder hold no stake in any remittance provider. Afronomics may earn a referral fee from some providers listed on its send-money pages; this Receipt names and ranks none."
sources:
  - name: "CBK, Diaspora Remittances, monthly inflows by source, data to September 2026"
    url: "https://www.centralbank.go.ke/diaspora-remittances/"
    date: "2026-10-20"
  - name: "CBK Weekly Bulletin, 16 October 2026"
    url: "https://www.centralbank.go.ke/uploads/weekly_bulletin/1082633218_Weekly%20CBK%20Bulletin%20October%2016%202026.pdf"
    date: "2026-10-16"
  - name: "CBK, MPC press release, meeting of 7 October 2026"
    url: "https://www.centralbank.go.ke/uploads/mpc_press_release/224745454_MPC%20Press%20Release%20-%20Meeting%20of%20October%207%202026.pdf"
    date: "2026-10-07"
  - name: "Business Daily, US remittance dip wipes out gains from Europe, Asia and Africa"
    url: "https://www.businessdailyafrica.com/bd/economy/us-remittance-dip-wipes-out-gains-from-europe-asia-and-africa-5635128"
    date: "2026-10-18"
  - name: "US Public Law 119-21, 4 July 2025"
    url: "https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf"
    date: "2025-07-04"
  - name: "26 U.S. Code section 4475, tax on remittance transfers"
    url: "https://www.law.cornell.edu/uscode/text/26/4475"
    date: "2025-07-04"
  - name: "US Treasury and IRS, proposed regulations, Excise Tax on Remittance Transfers, Federal Register"
    url: "https://www.govinfo.gov/content/pkg/FR-2026-04-13/pdf/2026-07085.pdf"
    date: "2026-04-13"
  - name: "Afronomics remittance file, World Bank Remittance Prices Worldwide (January to March 2025)"
    url: "https://remittanceprices.worldbank.org/data-download"
    date: "2025-03-31"
calls:
  - statement: "Money from North America in October 2026 is below October 2025's"
    measure: "North America inflows, October 2026 against October 2025, % change, CBK Diaspora Remittances table (monthly inflows by source)"
    comparator: "<"
    threshold: 0
    unit: "%"
    check_source: "CBK, Diaspora Remittances page (monthly inflows by source); CBK Weekly Bulletin carrying October 2026 remittances"
    check_date: "2026-11-20"
  - statement: "Kenya's total remittances for 2026 come in below 2025's"
    measure: "Cumulative remittance inflows for the 12 months to December 2026, % change on a year earlier, as the CBK Weekly Bulletin reports it"
    comparator: "<"
    threshold: 0
    unit: "%"
    check_source: "CBK Weekly Bulletin carrying December 2026 remittances; CBK, Diaspora Remittances page"
    check_date: "2027-01-22"
  - statement: "Money from North America for the whole of 2026 is down by more than 8% on 2025"
    measure: "North America inflows, January to December 2026 against January to December 2025, % change, CBK Diaspora Remittances table"
    comparator: "<"
    threshold: -8
    unit: "%"
    check_source: "CBK, Diaspora Remittances page (monthly inflows by source)"
    check_date: "2027-01-29"
followUps:
  - { date: "2026-11-20", what: "October 2026 remittances: grade the North America October call" }
  - { date: "2027-01-22", what: "Full-year 2026 remittances in the CBK Weekly Bulletin: grade the yearly call" }
  - { date: "2027-01-29", what: "Full-year table by region: grade the North America call" }
tiles:
  - label: "From North America, Jan to Sep 2026"
    value: "US$1.946bn"
    note: "Down 11.19% from US$2.191bn a year earlier"
    source: "CBK, Diaspora Remittances, monthly inflows by source, data to September 2026"
  - label: "The US tax"
    value: "1%"
    note: "Only on transfers paid with cash, a money order, a cashier's check or similar paper"
    source: "26 U.S. Code section 4475, tax on remittance transfers"
charts:
  - type: bar
    title: "North America sent US$245m less; Europe and the rest of the world sent US$240m more"
    unit: "Change in inflows, January to September 2026 against 2025, US$ millions"
    source: "CBK, Diaspora Remittances, monthly inflows by source, data to September 2026"
    data:
      - { label: "North America", value: -245.2 }
      - { label: "Europe", value: 115.3 }
      - { label: "Rest of world", value: 125.2 }
    highlight: ["North America"]
  - type: bar
    title: "From the US, the average fee on US$200 was five times the 1% tax"
    unit: "Average cost of sending the equivalent of US$200 to Kenya, % of the amount, January to March 2025"
    source: "Afronomics remittance file, World Bank Remittance Prices Worldwide (January to March 2025)"
    data:
      - { label: "United Kingdom", value: 4.44 }
      - { label: "United States", value: 5.2 }
      - { label: "Canada", value: 7.28 }
    highlight: ["United States"]
    reference: { value: 3, label: "3%: the UN target for 2030" }
keyNumbers:
  - value: "US$3.769bn"
    label: "Sent home by Kenyans abroad, January to September 2026, through banks and licensed providers"
    source: "CBK, Diaspora Remittances, monthly inflows by source, data to September 2026"
  - value: "11.19%"
    label: "The fall in money from North America over the same nine months"
    source: "CBK, Diaspora Remittances, monthly inflows by source, data to September 2026"
  - value: "5.2%"
    label: "Average cost of sending US$200 from the US to Kenya, in the last World Bank survey in our file"
    source: "Afronomics remittance file, World Bank Remittance Prices Worldwide (January to March 2025)"
forYou:
  - "If your family depends on money from North America, it is more likely to have seen less arrive this year: that region sent 11.19% less."
  - "If you send from the US, the 1% tax applies only when you pay in cash or similar paper; the provider's fee, 5.2% on average on US$200, is the bigger cost."
  - "For the shilling, the fall is small: over nine months the total was down US$5.2m, or 0.14%."
verify: []
---

From January to September 2026, Kenyans abroad sent home US$3.769bn through banks and licensed providers, says the Central Bank of Kenya (CBK). In the same months of 2025 they sent US$3.774bn.

The total barely moved. The mix did. Money from North America fell by US$245.2m, or 11.19%. That is about KES 31.83bn that did not reach families here, Business Daily worked out.

**Our verdict (Opinion): In our view, the US remittance tax is too small and too narrow to explain an 11.19% fall in money from North America on its own; the bigger, steadier cost for most senders is still the fee, and the shilling can absorb this fall, but a family that depends on one relative in America cannot.**

## What happened

(Facts) The CBK's table of inflows by source shows three regions moving apart over the nine months:

| Source | Jan to Sep 2025 | Jan to Sep 2026 | Change |
| --- | --- | --- | --- |
| North America | US$2.191bn | US$1.946bn | −11.19% |
| Europe | US$683.1m | US$798.4m | +16.87% |
| Rest of world | US$899.8m | US$1.025bn | +13.86% |
| **Total** | **US$3.774bn** | **US$3.769bn** | **−0.14%** |

*CBK, diaspora remittances by source, data to September 2026. Percentage changes as reported by Business Daily, 18 October 2026.*

(Facts) Europe and the rest of the world added US$240.5m between them. That almost covered North America's gap. It left the total US$5.2m short of 2025.

(Facts) The CBK reports North America as one region; it does not split out the United States. Business Daily notes that most North American inflows come from there.

(Facts) The latest month was better. Inflows were US$438.5m in September 2026, against US$419.6m in September 2025, the CBK's Weekly Bulletin of 16 October says. North America still sent less: US$215.5m, against US$245.9m.

(Facts) After the October Monetary Policy Committee meeting, Governor Kamau Thugge said remittances "slowed down, mainly reflecting reduced inflows from the USA and Saudi Arabia", while noting "some recovery" in the last two months. The CBK projects growth of 0.7% for 2026, Business Daily reported.

## Why: what the sources support, and what they do not

(Facts) **The US tax.** Public Law 119-21, signed on 4 July 2025, added section 4475 to the US tax code. It puts a tax of 1% on the amount of a remittance transfer made after 31 December 2025. The sender pays it; the provider collects it and pays it over every quarter. It applies only when the sender pays with "cash, a money order, a cashier's check, or any other similar physical instrument". Transfers paid from an account at a bank or similar institution, or by a US-issued debit or credit card, are exempt. Draft rules on the detail were published on 13 April 2026.

(Facts) Business Daily links the fall in North American money to the tax and to higher living costs in the US. It also says the data do not show how much of the fall is due to the tax.

(Analysis) The arithmetic does not let the tax carry the whole fall. It is 1%. North America sent 11.19% less. Canada is in that region and has no such tax. Transfers paid from a bank account or a US card do not pay it at all. The tax could still push some senders to unregistered channels, which the CBK does not count. Nobody has measured how many.

(Analysis) **US immigration enforcement.** We found no CBK figure or study that measures its effect on money sent to Kenya. The CBK has not attributed the fall to it. We leave it as an unknown.

(Analysis) **The exchange rate.** It is not the reason dollars fell. The shilling has held near KES 130 to the dollar for more than two years ([our Receipt on the shilling](/receipts/2026-10-15-shilling-stopped-falling)). A steady rate also means no help: a dollar sent home buys about the same shillings as last year.

## What the numbers show

(Analysis) North America sent 51.6% of the nine-month total in 2026, by our arithmetic. In 2025 it sent 58.1%. Kenya's biggest source of family money is shrinking as a share, and the gap was filled by many smaller sources.

(Analysis) For the households it touches, the US$245.2m is about KES 3.5bn a month that did not arrive. Spread across a country, that is small. Concentrated in families whose money comes from one relative in the US or Canada, it is rent and school fees.

(Facts) **What senders pay.** The World Bank's survey for January to March 2025, in our remittance file, put the average cost of sending the equivalent of US$200 to Kenya at 5.2% from the US, across 31 services. It was 6.35% the quarter before. From the UK it was 4.44%; from Canada, 7.28%. The cost is the fee plus the exchange-rate margin. The survey predates the US tax.

| On a US$200 transfer from the US | US$ | KES at about 130 |
| --- | --- | --- |
| Average fee and margin, 5.2% | US$10.40 | about KES 1,350 |
| The 1% tax, only if paid in cash or similar paper | US$2.00 | about KES 260 |

*Afronomics remittance file (World Bank Remittance Prices Worldwide, January to March 2025); 26 U.S.C. 4475, at about KES 130 to the dollar.*

(Analysis) The fee is five times the tax on an average US$200 transfer, and it applies to every transfer, card or cash. The UN's target for 2030 is 3%. From all three of these sending countries, the average was above it.

(Analysis) **For the shilling**, the fall is small: over nine months the total was down US$5.2m, or 0.14%. The risk is a steady slide, not this year's dip.

## Our verdict

(Opinion) **In our view, the US remittance tax is too small and too narrow to explain an 11.19% fall in money from North America on its own; the bigger, steadier cost for most senders is still the fee, and the shilling can absorb this fall, but a family that depends on one relative in America cannot.**

The tax is the easy headline. A 1% charge on cash transfers did not, on its own, take a ninth off a region's money. Something else is happening to Kenyans in North America: what they earn, what they keep, or how they send. The data we have cannot say which.

The fee is the cost nobody campaigns about. At 5.2% on US$200, it took more than five times the tax, every time, before the tax existed.

The country is fine for now. Europe and the rest of the world sent more. But that is a national average. A household is not an average.

## Our calls

1. North America's inflows for October 2026 are below October 2025's. Checked against the CBK's table on 20 November 2026.
2. Kenya's total remittances for 2026 are below 2025's. Checked on 22 January 2027.
3. North America's inflows for the whole of 2026 are down by more than 8%. Checked on 29 January 2027.

### What would change our mind

A study or official figure showing that the tax, through a move to cash-free or informal channels, explains most of the fall. Or a recovery in North American money for the rest of 2026 strong enough to end the year close to 2025.

*Disclosure: Afronomics and its founder hold no stake in any remittance provider. Afronomics may earn a referral fee from some providers listed on its send-money pages.* We name no provider and rank none: the fee figures are averages across all the services the World Bank surveyed.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **Month by month:** inflows by region for every month of 2025 and 2026 from the CBK's table, with North America's share each month.
- **What a transfer costs:** the World Bank's averages for every corridor into Kenya in our file, with the quarter before, and the 1% tax added for cash-funded transfers from the US.
- **Follow-ups:** a Receipt when October's figures land (20 November 2026) and when the full year lands (22 and 29 January 2027).
