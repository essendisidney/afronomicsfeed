---
title: "Kenya's 18.46% tax-free bond: savers' best deal was taxpayers' dearest loan"
date: "2026-10-15"
type: verdict
status: draft
sector: public-money
entities:
  - "Central Bank of Kenya"
  - "National Treasury of Kenya"
series: kenya-bonds
verdict: "The best deal Kenyan savers ever got from their government was bought with taxpayers' money at the worst moment to borrow, and they will be paying for it until 2032."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "In February 2024 Kenya sold KES 241 billion of an infrastructure bond at 18.46%, tax-free. To a saver that is worth 21.72% on a taxed bond. To the taxpayer it costs about KES 44.5 billion a year in interest until the first repayment in 2027, and about KES 302 billion over its life."
desk: "Afronomics Public Money Desk"
disclosure: "[CONFIRM: Afronomics and its founder hold no IFB1/2024/8.5 bonds]"
verify:
  - "Eurobond context: confirm against a National Treasury press release that Kenya sold a new US$1.5bn Eurobond due 2031 at 10.375% in February 2024 to buy back the US$2bn bond due June 2024. Our source is two publications (Mwango Capital, Credendo) read through search results only."
  - "Records: 'highest IFB rate' and 'largest single acceptance' are true of our bond file (390 rows from 2010). Confirm the file is complete for IFBs before publishing either claim as an all-time record."
sources:
  - name: "CBK, results of IFB1/2024/8.5 dated 19 February 2024"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/84469011_RESULTS%20FOR%20IFB1-2024-8.5%20DATED%2019-02-2024.pdf"
    date: "2024-02-19"
  - name: "CBK, prospectus for IFB1/2024/8.5"
    url: "https://www.centralbank.go.ke/uploads/treasury_bonds_prospectuses/2087959385_February%202024%20IFB1-2024-8.5%20%20DATED%2019-02-2024.pdf"
    date: "2024-01-24"
  - name: "Afronomics bond auction file, CBK Treasury bond results"
    url: "https://www.centralbank.go.ke/bills-bonds/treasury-bonds/"
    date: "2026-10-19"
  - name: "CBK, results of IFB1/2023/6.5 and IFB1/2023/17 reopenings dated 19 August 2024"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/107706422_RESULTS%20FOR%20REOPENED%20IFB1-2023-6.5%20AND%20IFB1-2023-17%20DATED%2019-08-2024.pdf"
    date: "2024-08-19"
  - name: "CBK, results of IFB1/2019/016, IFB1/2021/018 and IFB1/2021/021 dated 17 August 2026"
    url: "https://www.centralbank.go.ke//uploads/historical_treasury_bond_results/1214594764_RESULTS%20IFB1-2019-016%20IFB1-2021-018%20AND%20IFB1-2021-021%20DATED%2017-08-2026.pdf"
    date: "2026-08-17"
  - name: "Afronomics auction file, CBK Treasury bill results of 19 February 2024"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1422310000_RESULTS%202565-091%202538-182%202492-364%20%20DATED%2019-02-24.pdf"
    date: "2024-02-19"
  - name: "Afronomics auction file, CBK Treasury bill results of 19 October 2026"
    url: "https://www.centralbank.go.ke/uploads/91_day_historical_treasury_bill_results/1647758237_RESULTS%202704-091%202678-182%202633-364%20DATED%2019-10-2026.pdf"
    date: "2026-10-19"
  - name: "CBK, commercial banks' weighted average rates"
    url: "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
    date: "2026-08-31"
  - name: "Mwango Capital, Kenya back in the market"
    url: "https://mwangocapital.substack.com/p/12-02-2024-kenya-back-in-the-market"
    date: "2024-02-12"
  - name: "Credendo, successful Eurobond removes looming repayment threat"
    url: "https://credendo.com/en/knowledge-hub/kenya-successful-eurobond-removes-looming-repayment-threat-though-longer-term-risks"
    date: "2024-02-20"
calls:
  - statement: "No infrastructure bond, new or reopened, clears at a weighted average rate above 15% at any auction before 30 June 2027"
    measure: "Highest weighted average rate accepted at any IFB auction, 16 October 2026 to 30 June 2027"
    comparator: "<="
    threshold: 15
    unit: "%"
    check_source: "CBK Treasury bond auction results (Afronomics bond auction file)"
    check_date: "2027-06-30"
  - statement: "The 364-day Treasury bill clears below 10% at the last auction of June 2027"
    measure: "364-day bill weighted average rate, last auction with a value date in June 2027"
    comparator: "<"
    threshold: 10
    unit: "%"
    check_source: "CBK Treasury bill auction results (Afronomics auction file)"
    check_date: "2027-06-30"
  - statement: "Any new infrastructure bond issued before 31 December 2027 carries a coupon below 14%"
    measure: "Highest coupon on a new IFB issued between 16 October 2026 and 31 December 2027"
    comparator: "<"
    threshold: 14
    unit: "%"
    check_source: "CBK Treasury bond auction results (Afronomics bond auction file)"
    check_date: "2027-12-31"
followUps:
  - { date: "2027-02-15", what: "First repayment of IFB1/2024/8.5 (20% of principal, per the prospectus) and a coupon" }
  - { date: "2027-06-30", what: "Grade the IFB and 364-day bill calls" }
  - { date: "2030-02-11", what: "Second repayment of IFB1/2024/8.5 (30% of what is then outstanding)" }
  - { date: "2032-08-09", what: "Final repayment of IFB1/2024/8.5" }
tiles:
  - label: "Tax-free interest a year"
    value: "KES 44.5bn"
    note: "18.4607% on KES 240.96bn accepted, until the first repayment in February 2027"
    source: "CBK, results of IFB1/2024/8.5 dated 19 February 2024"
  - label: "Same deal on a taxed bond"
    value: "21.72%"
    note: "18.4607% ÷ (1 − 0.15), the rate a 15%-taxed bond would need to pay the same"
    source: "CBK, results of IFB1/2024/8.5 dated 19 February 2024"
charts:
  - type: line
    title: "February 2024 set the highest infrastructure-bond rate in our file"
    unit: "Highest weighted average rate accepted at an IFB sale, % a year"
    source: "Afronomics bond auction file, CBK Treasury bond results"
    data:
      - { label: "2016", value: 13.339 }
      - { label: "2017", value: 13.555 }
      - { label: "2018", value: 12.505 }
      - { label: "2019", value: 12.655 }
      - { label: "2020", value: 12.051 }
      - { label: "2021", value: 12.737 }
      - { label: "2022", value: 13.938 }
      - { label: "2023", value: 17.9327 }
      - { label: "2024", value: 18.4607 }
      - { label: "2025", value: 14.2806 }
      - { label: "2026", value: 13.052 }
    highlight: ["2024"]
  - type: bar
    title: "Two and a half years on, the same kind of bond sells about six points cheaper"
    unit: "Weighted average rate accepted, % a year, tax-free"
    source: "Afronomics bond auction file, CBK Treasury bond results"
    data:
      - { label: "IFB1/2023/6.5, Nov 2023", value: 17.9327 }
      - { label: "IFB1/2024/8.5, Feb 2024", value: 18.4607 }
      - { label: "IFB1/2023/6.5 reopened, Aug 2024", value: 18.2989 }
      - { label: "IFB1/2023/17 reopened, Feb 2025", value: 14.2806 }
      - { label: "IFB1/2018/15 reopened, Aug 2025", value: 12.9934 }
      - { label: "IFB1/2021/21 reopened, Aug 2026", value: 13.052 }
      - { label: "IFB1/2019/16 reopened, Aug 2026", value: 12.196 }
    highlight: ["IFB1/2024/8.5, Feb 2024"]
---

In February 2024 the Central Bank of Kenya asked for KES 70 billion for an eight-and-a-half-year infrastructure bond. Investors offered KES 288.66 billion. The government took KES 240.96 billion, at 18.4607% a year, free of tax.

For savers it was the best rate a Kenyan infrastructure bond has paid in our records. For taxpayers it is about KES 44.5 billion of interest a year, every year, until the first repayment in February 2027.

**The Afronomics verdict: the best deal Kenyan savers ever got from their government was bought with taxpayers' money at the worst moment to borrow, and they will be paying for it until 2032.**

## What happened

(Facts) The bond, IFB1/2024/8.5, was dated 19 February 2024 and matures on 9 August 2032. The CBK's results show KES 288,661.86 million bid and KES 240,957.57 million accepted, more than three times the KES 70 billion offered. The coupon was set at the weighted average rate of accepted bids, 18.4607%, so the average price was exactly KES 100 per KES 100 of bond.

(Facts) Infrastructure bonds are exempt from withholding tax. A normal Treasury bond or bill under ten years pays 15% withholding tax on its interest; bonds of ten years or more pay 10%.

(Facts) It is the largest amount accepted for a single bond in our file of 390 CBK bond auctions going back to 2010, ahead of IFB1/2023/007 (KES 213.40 billion, June 2023). Its rate is the highest any infrastructure bond has cleared in the same file.

(Facts) The prospectus says the bond is repaid in three parts: 20% of the outstanding principal on 15 February 2027, 30% of the unencumbered outstanding principal on 11 February 2030, and the rest on 9 August 2032. Holdings of up to KES 1 million per account are repaid in full at each repayment. Interest is paid twice a year, 17 times from 19 August 2024. The money was "for funding of infrastructure projects in the FY 2023/2024 budget estimates". The CBK's results show KES 70.49 billion of it went to repay maturing debt and KES 170.47 billion was new borrowing.

(Facts) The sale closed in the same week Kenya returned to the dollar market. It sold a US$1.5 billion Eurobond due 2031 at 10.375% to buy back most of a US$2 billion bond due in June 2024, according to Mwango Capital and Credendo.

## What the numbers show

(Analysis) The yearly bill is simple. 18.4607% × KES 240.96 billion = KES 44.48 billion a year, paid as two coupons of KES 22.24 billion. Because the bond is repaid in parts, the bill shrinks: on the prospectus schedule it falls to KES 35.59 billion a year after February 2027 (80% left) and KES 24.91 billion after February 2030 (56% left: 30% of the 80% still owed is repaid).

(Analysis) Over its life, the coupons add up like this:

| Period | Coupons | Principal outstanding | Interest |
| --- | --- | --- | --- |
| Aug 2024 to Feb 2027 | 6 | 100% | 6 × KES 22.24bn = KES 133.45bn |
| Aug 2027 to Feb 2030 | 6 | 80% | 6 × KES 17.79bn = KES 106.76bn |
| Aug 2030 to Aug 2032 | 5 | 56% | 5 × KES 12.46bn = KES 62.28bn |
| **Total** | **17** | | **about KES 302.5bn** |

*Source: CBK results and prospectus for IFB1/2024/8.5; Afronomics arithmetic. Assumes equal half-year coupons; ignores the full early repayment of holdings up to KES 1 million, which lowers the total slightly.*

(Analysis) Add back the KES 240.96 billion of principal and the state pays out about KES 543.4 billion in total. Had it been a single repayment in 2032, the coupons alone would have been 8.5 × KES 44.48 billion, about KES 378.1 billion. Repaying in parts saves the Treasury about KES 75.6 billion of interest.

(Analysis) Tax-free matters twice. To a saver, 18.4607% with no tax is the same as 18.4607% ÷ 0.85 = 21.72% on a bond taxed at 15%. To the Treasury, a taxed bond hands 15% of its coupon back as withholding tax; this one hands back nothing. No taxable Treasury bond in our file has cleared above 18.77% since 2012.

What a saver kept from KES 100,000 for a year, after tax:

| Where | Rate | Tax | Kept |
| --- | --- | --- | --- |
| IFB1/2024/8.5, Feb 2024 | 18.4607% | 0% | KES 18,461 |
| 364-day bill, 19 Feb 2024 | 16.9188% | 15% | KES 14,381 |
| Bank deposits, CBK average, Feb 2024 | 10.32% | 15% | KES 8,772 |
| 364-day bill, 19 Oct 2026 | 9.0383% | 15% | KES 7,683 |

*Source: CBK auction results (Afronomics auction files); CBK weighted average commercial bank rates. Tax per lib/data/kenya-rates.ts.*

(Analysis) The bond beat the one-year bill sold the same day by about 4.1 points after tax, and the average bank deposit by about 9.7 points. Today's one-year bill keeps less than half of what the bond pays.

## Since then

(Facts) In August 2024 CBK reopened IFB1/2023/6.5 at 18.2989%, close to the February rate. By February 2025 a reopened IFB1/2023/17 cleared at 14.2806%. On 17 August 2026 three reopened infrastructure bonds cleared at 12.196%, 12.6877% and 13.052%.

(Analysis) If the KES 240.96 billion were borrowed at August 2026's 12.196%, the yearly coupon would be about KES 15.10 billion lower: (18.4607% − 12.196%) × KES 240.96 billion. That is a comparison, not a saving anyone can collect. The bond's coupon is fixed until 2032.

## Our verdict

(Opinion) **The best deal Kenyan savers ever got from their government was bought with taxpayers' money at the worst moment to borrow, and they will be paying for it until 2032.**

The Treasury was not careless. In February 2024 a US$2 billion Eurobond was four months from due, the one-year bill was already at 16.92%, and taxed bonds were clearing near 18.4%. Raising KES 241 billion at home, in shillings, bought time.

But it bought that time at a fixed price, for eight and a half years, and took three and a half times what it asked for. Everyone who bid got a rate that no ordinary deposit could match. The taxpayer, who did not bid, gets the KES 302 billion bill and none of the tax back.

### What would change our mind

A Treasury buyback or switch that retires part of this bond early at a lower cost. Or evidence, in the National Treasury's own debt reports, that the cash raised replaced borrowing that would have cost more.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **The coupon calendar:** every one of the 17 payments with the face value outstanding, from 19 August 2024 to 9 August 2032, once confirmed against the prospectus.
- **The tax that never came:** the withholding tax the Treasury would have collected had the same coupons been taxed at 15%, year by year.
- **Who got it cheaper:** every infrastructure bond since 2013 by rate, size and tax-equivalent rate, from our auction file.
- **Follow-ups:** a Receipt on 15 February 2027, the first repayment, and on each grade of the calls above.
