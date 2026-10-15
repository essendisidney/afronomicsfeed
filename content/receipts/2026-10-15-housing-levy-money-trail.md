---
title: "Where the Housing Levy money went: KES 114.5bn collected, and no project on the list finished at audit"
date: "2026-10-15"
type: verdict
status: draft
sector: public-money
entities:
  - "Affordable Housing Board"
  - "State Department for Housing and Urban Development"
  - "Kenya Revenue Authority"
  - "Office of the Auditor-General"
series: housing-levy
verdict: "The Housing Levy collects like a tax and builds like a promise: KES 114.5 billion came in on time, while the houses it was sold on are mostly still building sites and plans."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "From August 2023 to April 2025 KRA collected KES 114.5 billion in Housing Levy. Of the first KES 34.7 billion, more went into Treasury bills than into houses. When the Auditor-General's team visited in April 2025, none of 142 affordable housing projects on the Board's list was finished. A worker on KES 50,000 a month pays KES 750, and their employer pays another KES 750."
desk: "Afronomics Public Money Desk"
disclosure: "[founder to confirm] Afronomics and its founder hold no contracts, units or allocations under the Affordable Housing Programme."
sources:
  - name: "Affordable Housing Act, 2024 (Kenya Law)"
    url: "https://new.kenyalaw.org/akn/ke/act/2024/2/eng@2024-03-21"
    date: "2024-03-21"
  - name: "High Court, Finance Act 2023 judgment, [2023] KEHC 25872 (KLR)"
    url: "https://new.kenyalaw.org/akn/ke/judgment/kehc/2023/25872/eng@2023-11-28"
    date: "2023-11-28"
  - name: "Auditor-General, special audit of the Affordable Housing Programme (status at 31 March 2025)"
    url: "https://libraryir.parliament.go.ke/bitstreams/2532ce07-f9d4-44bb-963c-902b11ac173a/download"
    date: "2026-02-01"
  - name: "Affordable Housing Board, annual report and financial statements 2024/25"
    url: "https://libraryir.parliament.go.ke/bitstreams/df92136e-03b5-4ab3-94a8-fc4f53f99f72/download"
    date: "2025-12-19"
  - name: "Afronomics payroll file (KRA, SHA rates)"
    url: "https://www.kra.go.ke/news-center/public-notices/2099-collection-of-the-affordable-housing-levy-by-kenya-revenue-authority"
    date: "2026-10-15"
  - name: "Business Daily, housing levy spending in the Economic Survey 2026"
    url: "https://www.businessdailyafrica.com/bd/markets/real-estate/state-cuts-housing-levy-investment-in-t-bills-as-projects-up-5441244"
    date: "2026-04-29"
  - name: "Citizen Digital, Court of Appeal upholds the Affordable Housing Act"
    url: "https://citizen.digital/article/court-of-appeal-upholds-affordable-housing-act-dismisses-challenge-n390871"
    date: "2026-09-25"
  - name: "The Kenya Times, Court delivers fresh verdict on affordable housing"
    url: "https://thekenyatimes.com/breaking-news/court-delivers-fresh-verdict-on-affordable-housing/"
    date: "2026-09-25"
calls:
  - statement: "The Affordable Housing Board's 2025/26 annual report counts fewer than 20,000 completed housing units"
    measure: "Housing units reported complete in the Affordable Housing Board's annual report and financial statements for the year ended 30 June 2026"
    comparator: "<"
    threshold: 20000
    unit: "units"
    check_source: "Affordable Housing Board, annual report and financial statements 2025/26 (tabled in Parliament with the Auditor-General's report)"
    check_date: "2027-03-31"
  - statement: "Housing Levy collected in 2025/26 is below KES 90 billion"
    measure: "Affordable Housing Levy revenue for the year ended 30 June 2026, Affordable Housing Fund audited financial statements"
    comparator: "<"
    threshold: 90
    unit: "KES bn"
    check_source: "Affordable Housing Fund, annual report and financial statements 2025/26 (Auditor-General)"
    check_date: "2027-03-31"
  - statement: "The levy is still 1.5% of gross salary for the employee, matched by the employer, on 30 June 2027"
    measure: "Rate in section 4(2) of the Affordable Housing Act in force on 30 June 2027"
    comparator: "is"
    threshold: "1.5%"
    check_source: "Affordable Housing Act on Kenya Law"
    check_date: "2027-06-30"
followUps:
  - { date: "2027-03-31", what: "Affordable Housing Board and Fund reports for 2025/26: units completed, levy collected, money spent" }
  - { date: "2027-06-30", what: "Grade the three Housing Levy calls" }
tiles:
  - label: "Levy collected, Aug 2023 to Apr 2025"
    value: "KES 114.5bn"
    note: "KES 42.73bn to April 2024, KES 71.80bn from May 2024 to April 2025, as KRA reported to the Auditor-General"
    source: "Auditor-General, special audit of the Affordable Housing Programme (status at 31 March 2025)"
  - label: "Affordable housing projects finished at audit"
    value: "0 of 142"
    note: "Site checks in April 2025: 60 under way, 78 not started, 4 not visited"
    source: "Auditor-General, special audit of the Affordable Housing Programme (status at 31 March 2025)"
charts:
  - type: bar
    title: "Of the first KES 34.7bn, more went into Treasury bills than into houses"
    unit: "Levy remitted to the State Department, June 2023 to March 2024, KES billion"
    source: "Auditor-General, special audit of the Affordable Housing Programme (status at 31 March 2025)"
    data:
      - { label: "Treasury bills", value: 20.0 }
      - { label: "Housing projects", value: 14.51 }
      - { label: "Back to Treasury", value: 0.19 }
    highlight: ["Treasury bills"]
  - type: bar
    title: "In April 2025 auditors found none of 142 affordable housing projects finished"
    unit: "Affordable housing projects on the Board's list, by status, April 2025"
    source: "Auditor-General, special audit of the Affordable Housing Programme (status at 31 March 2025)"
    data:
      - { label: "Not started", value: 78 }
      - { label: "Under way", value: 60 }
      - { label: "Not visited", value: 4 }
      - { label: "Finished", value: 0 }
    highlight: ["Finished"]
  - type: bar
    title: "Tax relief softens it: the levy takes KES 525 a month from take-home pay on KES 50,000"
    unit: "KES a month"
    source: "Afronomics payroll file (KRA, SHA rates)"
    data:
      - { label: "50k: levy deducted", value: 750 }
      - { label: "50k: take-home falls", value: 525 }
      - { label: "50k: employer pays", value: 750 }
      - { label: "100k: levy deducted", value: 1500 }
      - { label: "100k: take-home falls", value: 1050 }
      - { label: "100k: employer pays", value: 1500 }
    highlight: ["50k: take-home falls", "100k: take-home falls"]
verify:
  - "Business Daily's report that KNBS's Economic Survey 2026 shows 96.3% of a KES 79.03bn housing budget spent in 2024/25 (32.6% of KES 78.18bn in 2023/24): check against the Economic Survey 2026 housing tables (the PDF in Parliament's library is about 221 MB and was not opened)."
  - "Court of Appeal judgment of 25 September 2026 and High Court judgment of 22 October 2024 on the Affordable Housing Act: find both on Kenya Law, record the case numbers (press reports give Civil Appeal Nos. E832 of 2024 and E019 of 2025 for the appeals) and check our wording against the judgments. So far from Citizen Digital and The Kenya Times only."
  - "Auditor-General special audit: the cover says 'February 2026' without a day; the source date is set to 1 February 2026. Confirm the date it was tabled."
  - "Affordable Housing Board 2024/25 report: the levy figure for the year itself is garbled in the scan ('rsns z:. t billion'); only the KES 125bn since inception was read. Read the Affordable Housing Fund's own 2024/25 statements (Auditor-General report, libraryir bitstream f4556698, a scan with no text layer) for the year's levy revenue and spending."
  - "Disclosure: confirm against data/owner/holdings.json."
---

The Housing Levy started in mid-2023. Between August 2023 and April 2025 the Kenya Revenue Authority collected KES 114.5 billion of it, from workers and their employers, the Auditor-General found.

When the Auditor-General's team checked the sites in April 2025, none of the 142 affordable housing projects on the Affordable Housing Board's list was finished. Seventy-eight had not started.

**The Afronomics verdict: the Housing Levy collects like a tax and builds like a promise: KES 114.5 billion came in on time, while the houses it was sold on are mostly still building sites and plans.**

## What happened

(Facts) The levy was first imposed by section 84 of the Finance Act, 2023. On 28 November 2023 the High Court declared section 84 unconstitutional, "null and void", for violating Articles 10(2)(b) and (c) and 201 of the Constitution, and barred the government from collecting the levy under it ([2023] KEHC 25872 (KLR)). The court found the levy lacked a comprehensive legal framework.

(Facts) Parliament then passed the Affordable Housing Act, 2024. It was assented to on 19 March 2024 and published in the Kenya Gazette on 21 March 2024. Section 4 sets the levy at "one point five percent" of an employee's gross salary, or of other gross income not already levied. Section 5 makes the employer deduct the employee's 1.5% and pay an equal amount on top. Both go to KRA, the collector, by the ninth working day after the end of the month, for the Affordable Housing Fund.

(Facts) The Auditor-General's special audit, requested by the Affordable Housing Board and dated February 2026, traced the money to April 2025:

| | KES billion |
| --- | --- |
| Collected by KRA, August 2023 to April 2024 | 42.73 |
| Collected by KRA, May 2024 to April 2025 | 71.80 |
| **Total collected** | **114.52** |
| Sent to the State Department for Housing (before the Act) | 34.72 |
| Sent to the Affordable Housing Fund (after the Act) | 76.60 |
| Cash in transit at April 2025 | 2.38 |
| Kept by KRA as commission | 0.82 |

*Source: Auditor-General, special audit of the Affordable Housing Programme, Tables 4 and 5. The audit groups collections by legal period, not by financial year.*

(Facts) Of the KES 34.72 billion the State Department received, the audit found KES 14.51 billion was spent on projects. KES 20 billion was put into Treasury bills on 17 May 2024. KES 0.19 billion went back to the National Treasury at the year's end. The Treasury bills were later handed to the Affordable Housing Board.

(Facts) The State Department's budget for the programme was KES 63.22 billion in 2023/24 and KES 64.69 billion in 2024/25, to be paid for from the levy, the audit says. The audit also found the programme was launched without a consolidated feasibility study, and with no documented cost-benefit analysis or affordability threshold.

## Houses: promised and finished

(Facts) The government's plan (the Fourth Medium-Term Plan, 2023 to 2027) aims for 250,000 housing units a year, according to the audit. In April 2025 the auditors visited the projects on the Board's list. Of 142 affordable housing projects, none was complete, 60 were under way, 78 had not started and 4 were not visited. The audit lists slow procurement and approvals, weak contract records, site problems and thin supervision as causes.

(Facts) The Board's own annual report for 2024/25 tells a busier story. It says the Board "directly enabled a pipeline of 178,627 housing units at different stages of construction with 3,171 units complete", and that KRA had collected KES 125 billion since the levy began. The Auditor-General's report on the Board's accounts is dated 19 December 2025.

(Analysis) The two documents count different things. The audit counts projects on one list at one date; the Board counts units across all its work, including institutional housing. But on the Board's own figure, 3,171 completed units is about 1% of one year's 250,000 target.

(Facts) Business Daily reports that KNBS's Economic Survey 2026 shows 96.3% of a KES 79.03 billion housing budget was spent in 2024/25, up from 32.6% of KES 78.18 billion the year before. We have not yet checked this against the Survey itself.

## What it costs a worker

(Analysis) The levy is 1.5% of gross pay, with no cap. The employer pays the same again. KRA treats the levy as a deduction before PAYE, so part of it comes back as lower tax. On our net salary calculator's rates:

| Gross pay a month | Levy deducted | Employer pays | Your take-home falls by | A year, you and employer |
| --- | --- | --- | --- | --- |
| KES 50,000 | KES 750 | KES 750 | KES 525 | KES 18,000 |
| KES 100,000 | KES 1,500 | KES 1,500 | KES 1,050 | KES 36,000 |

*Arithmetic: 1.5% of gross. Both salaries sit in the 30% PAYE band, so the levy lowers PAYE by 30% of itself: KES 225 and KES 450. Rates from the Afronomics payroll file (KRA, SHA); the result is the same for any NSSF amount on the payslip.*

(Analysis) Put your own payslip into the [net salary calculator](/rates/kenya/net-salary) to see the levy and every other deduction.

## In court

(Facts) The 2023 levy fell in the High Court, as above. The new Act was challenged in turn. On 22 October 2024 a three-judge High Court bench dismissed the petitions and upheld the Act, The Kenya Times reports. On 25 September 2026 the Court of Appeal dismissed the appeal and upheld the Act, Citizen Digital and The Kenya Times report. Citizen Digital adds that the court faulted one step: the Commission on Revenue Allocation should have been allowed to consider the Bill before Parliament passed it. The levy is still collected.

## Our verdict

(Opinion) **The Housing Levy collects like a tax and builds like a promise: KES 114.5 billion came in on time, while the houses it was sold on are mostly still building sites and plans.**

The collection side works. KRA takes the money at source every month, and workers cannot opt out. The audit traced every shilling of the first KES 114.5 billion to an account.

The building side does not yet match it. Of the levy collected before the new Act, KES 20 billion sat in Treasury bills while KES 14.5 billion went into projects. A levy sold as houses for workers spent much of its first year as a government deposit. The audit traced that money, and the bills were handed over to the Board. But a worker on KES 50,000 paid KES 750 a month for a house programme that, on the audit's April 2025 count, had not finished one project on its affordable housing list.

The courts have now settled that the levy is lawful. That makes delivery the only test left. The fair measure is completed homes, handed over, against money collected, year by year, in the Board's audited reports.

### What would change our mind

The Board's 2025/26 audited report showing tens of thousands of completed units handed over, with levy cash spent on construction rather than held in bills. And an independent count, by the Auditor-General or KNBS, that matches the Board's own.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **The money trail, month by month:** KRA collections and remittances from July 2023, with the cash in transit and KRA's commission.
- **The project list:** all 842 projects the Board gave the Auditor-General, by county, type and status in April 2025.
- **The worker's ledger:** what the levy has cost a worker on KES 30,000, 50,000, 100,000 and 300,000 since July 2023, before and after tax relief.
- **The court file:** every ruling on the levy since 2023, with the orders as written.
- **Follow-ups:** a Receipt when the Board's and the Fund's 2025/26 audited reports are tabled.
