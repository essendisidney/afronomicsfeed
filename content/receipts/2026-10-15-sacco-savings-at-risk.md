---
title: "KES 885 billion in SACCOs, and a deposit guarantee that still cannot pay"
date: "2026-10-15"
type: verdict
status: draft
sector: banking
entities:
  - "Sacco Societies Regulatory Authority"
  - "Kenya Deposit Insurance Corporation"
series: sacco-safety
verdict: "Kenya's SACCO members hold KES 885 billion behind a deposit guarantee fund that exists in the Act but, on the regulator's own account, still needs a new law before it can pay anyone; a bank saver has a KES 500,000 safety net, a SACCO saver has a promise."
labels:
  - Facts
  - Analysis
  - Opinion
asOf: "2026-10-15"
summary: "Regulated SACCOs held KES 884.8 billion of members' deposits in June 2026. The Sacco Societies Act sets up a Deposit Guarantee Fund, but SASRA says a Bill now before Parliament is needed to make it work. Until it does, members of a failed SACCO depend on what a winding-up recovers, not on a fund."
desk: "Afronomics Banking Desk"
disclosure: "[founder to confirm] Afronomics and its founder hold no deposits or shares in any SASRA-regulated SACCO."
sources:
  - name: "SASRA, Sacco Supervision Annual Report 2025"
    url: "https://www.sasra.go.ke/?wpdmdl=1772"
    date: "2026-09-28"
  - name: "Afronomics SACCO file, SASRA Quarterly Statistical and Soundness Report, June 2026"
    url: "https://www.sasra.go.ke/?wpdmdl=1757"
    date: "2026-06-30"
  - name: "SASRA, list of licensed and authorised SACCO societies for 2026"
    url: "https://www.sasra.go.ke/?wpdmdl=1573"
    date: "2026-01-30"
  - name: "SASRA, list of licensed and authorised SACCO societies for 2025"
    url: "https://www.sasra.go.ke/?wpdmdl=1377"
    date: "2025-01-27"
  - name: "SASRA, list of licensed and authorised SACCO societies for 2024"
    url: "https://www.sasra.go.ke/?wpdmdl=1136"
    date: "2024-01-01"
  - name: "Sacco Societies Act (Cap. 490B), Kenya Law"
    url: "https://new.kenyalaw.org/akn/ke/act/2008/14/eng@2025-06-20"
    date: "2025-06-20"
  - name: "Sacco Societies (Amendment) Bill, 2025 (National Assembly Bill No. 32 of 2025)"
    url: "https://www.parliament.go.ke/sites/default/files/2025-07/THE%20SACCO%20SOCIETIES%20%28AMENDMENT%29%20BILL%2C2025.pdf"
    date: "2025-06-30"
  - name: "Mzalendo, text of the Sacco Societies (Amendment) Bill, 2025"
    url: "https://mzalendo.com/legislative-trends/bills/na/485/"
    date: "2025-07-01"
  - name: "Kenya Deposit Insurance Corporation, FAQs"
    url: "https://www.kdic.go.ke/faqs"
    date: "2026-10-15"
calls:
  - statement: "The Sacco Societies (Amendment) Bill, 2025 is still not law on 30 June 2027"
    measure: "Bill No. 32 of 2025 assented to and published as an Act on or before 30 June 2027"
    comparator: "is"
    threshold: "no"
    check_source: "Kenya Gazette and Kenya Law, Acts of 2026 and 2027"
    check_date: "2027-06-30"
  - statement: "No Gazette notice opens payments from the SACCO Deposit Guarantee Fund before 31 December 2027"
    measure: "Kenya Gazette notice appointing a date for the start of payments of claims from the SACCO Deposit Guarantee Fund, published on or before 31 December 2027"
    comparator: "is"
    threshold: "no"
    check_source: "Kenya Gazette"
    check_date: "2027-12-31"
  - statement: "Deposits in regulated SACCOs reach at least KES 920 billion at 31 December 2026"
    measure: "Total deposits of all regulated SACCOs (DT and NWDT) at 31 December 2026"
    comparator: ">="
    threshold: 920
    unit: "KES bn"
    check_source: "SASRA Quarterly Statistical and Soundness Report, December 2026 (Afronomics SACCO file)"
    check_date: "2027-06-30"
followUps:
  - { date: "2027-03-31", what: "SASRA's 2027 licence list: which SACCOs lost or had licences restricted" }
  - { date: "2027-06-30", what: "Grade the Bill and deposits calls; check the December 2026 quarterly report" }
  - { date: "2027-12-31", what: "Grade the Deposit Guarantee Fund call" }
tiles:
  - label: "Members' deposits in regulated SACCOs"
    value: "KES 884.8bn"
    note: "357 SACCOs, 30 June 2026"
    source: "Afronomics SACCO file, SASRA Quarterly Statistical and Soundness Report, June 2026"
  - label: "Bank saver's cover from KDIC"
    value: "KES 500,000"
    note: "Per person per bank, paid when a bank is liquidated"
    source: "Kenya Deposit Insurance Corporation, FAQs"
charts:
  - type: bar
    title: "Accounts above KES 300,000 hold three-quarters of SACCO deposits"
    unit: "Share of regulated SACCO deposits by account balance, end-2025, %"
    source: "SASRA, Sacco Supervision Annual Report 2025"
    data:
      - { label: "Under 50k", value: 5.36 }
      - { label: "50k–100k", value: 4.28 }
      - { label: "100k–300k", value: 16.13 }
      - { label: "300k–1m", value: 35.85 }
      - { label: "Over 1m", value: 38.38 }
    highlight: ["300k–1m", "Over 1m"]
  - type: line
    title: "Members put in KES 89 billion more in the year to June 2026"
    unit: "Deposits in regulated SACCOs, KES bn"
    source: "Afronomics SACCO file, SASRA Quarterly Statistical and Soundness Report, June 2026"
    data:
      - { label: "Mar 25", value: 782.3 }
      - { label: "Jun 25", value: 795.78 }
      - { label: "Sep 25", value: 814.64 }
      - { label: "Dec 25", value: 832.74 }
      - { label: "Mar 26", value: 870.02 }
      - { label: "Jun 26", value: 884.83 }
    highlight: ["Jun 26"]
verify:
  - "Sacco Societies Act, section 59(1): read the protection ceiling in full on Kenya Law. Our probe saw 'up to an amount of one ...' before the text was cut; Kenya Law then returned 403. Third-party copies say KES 100,000. The Receipt does not state the figure until it is confirmed."
  - "Sacco Societies (Amendment) Bill, 2025: the parliament.go.ke PDF is a scan with no text layer, so clauses 57A, 59 and 59A were read from Mzalendo's copy. Check the quoted wording against the official Bill, and confirm the Bill's current stage on the National Assembly's bills tracker."
  - "2024 licence list: the signing date was not read (the date given is the start of the licence year). Confirm the Gazette notice number and date."
  - "Disclosure: confirm against data/owner/holdings.json."
---

At the end of 2025, 7.87 million members had KES 832.74 billion of deposits in the 357 SACCOs that SASRA regulates, about 18 times what Kenya's 14 microfinance banks held. By June 2026 the deposits had reached KES 884.8 billion.

If one of those SACCOs fails, there is no fund that pays its members out today. The Sacco Societies Act creates one. The regulator says it needs a new law before it can work.

**The Afronomics verdict: Kenya's SACCO members hold KES 885 billion behind a deposit guarantee fund that exists in the Act but, on the regulator's own account, still needs a new law before it can pay anyone; a bank saver has a KES 500,000 safety net, a SACCO saver has a promise.**

## What happened

(Facts) SASRA's 2025 annual report, published on 28 September 2026, says 179 deposit-taking (DT) SACCOs and 178 non-withdrawable deposit-taking (NWDT) SACCOs were regulated at the end of 2025: 357 in all. Together they held KES 832.74 billion of members' deposits (DT KES 726.50 billion, NWDT KES 106.24 billion). SASRA's June 2026 quarterly report puts the total at KES 884.83 billion.

(Facts) The Sacco Societies Act sets up a Deposit Guarantee Fund. Section 55 reads: "There is hereby established a Fund to be known as the Deposits Guarantee Fund." Section 59 says the Fund protects members' deposits, "but not shares", up to a ceiling set in the Act, and that a member may claim "upon the society becoming insolvent". Section 60 makes every SACCO a contributor.

(Facts) SASRA's own report says the fund is not yet working. Its 2025 report says the Sacco Societies (Amendment) Bill, No. 32 of 2025, "seeks to operationalize the Deposit Guarantee Fund by addressing the existing legal gaps", and that SASRA is ready to implement it "once enacted". The Bill adds a new section 59A: no claims are to be paid from the Fund "unless a date for the commencement of such payments has been appointed and published in the Gazette by the Cabinet Secretary".

(Facts) Banks are different. The Kenya Deposit Insurance Corporation says its cover is "Kshs. 500,000 per person in an institution", paid when a bank is placed in liquidation, with "further payments as per recoveries made".

## What the numbers show

(Facts) SASRA's yearly licence lists, published in the Kenya Gazette, show who left the regulated list:

| Licence year | DT licensed | Licences restricted | Licences revoked or expired |
| --- | --- | --- | --- |
| 2024 | 176 | none listed | 2 DT licences listed as revoked (not renewed) |
| 2025 | 178 | none listed | 2 NWDT authorisations expired (no renewal applied for) |
| 2026 | 176 | 5 (3 DT, 2 NWDT): credit only, no new deposits | 1 DT (merged into another SACCO), 1 NWDT (no renewal) |

*Source: SASRA lists of licensed and authorised SACCO societies for 2024, 2025 and 2026.*

(Facts) The Act also lets SASRA place a SACCO under statutory management or "restrict the withdrawal of deposits" (section 51). SASRA's 2025 report records one merger, used "for supporting struggling SACCOs while ensuring continuity of services to members", and the revocations above. The licensing chapter we read records no statutory management in 2025.

(Analysis) Who would a guarantee protect? SASRA counts deposit accounts by size. At the end of 2025 there were 18.95 million accounts holding KES 832.80 billion:

| Account balance | Accounts | Share of accounts | Deposits | Share of deposits |
| --- | --- | --- | --- | --- |
| Under KES 50,000 | 16.88m | 89.0% | KES 44.61bn | 5.4% |
| KES 50,000 to 100,000 | 0.53m | 2.8% | KES 35.64bn | 4.3% |
| KES 100,000 to 300,000 | 0.76m | 4.0% | KES 134.35bn | 16.1% |
| KES 300,000 to 1m | 0.64m | 3.4% | KES 298.55bn | 35.9% |
| Over KES 1m | 0.15m | 0.8% | KES 319.66bn | 38.4% |

*Source: SASRA Sacco Supervision Annual Report 2025, Tables 21 and 22. Accounts, not members: SASRA says a member often has two or more.*

(Analysis) About nine accounts in ten hold KES 100,000 or less: 17.40 million of 18.95 million, or 91.8%. They hold KES 80.25 billion, 9.6% of the money. The 0.79 million accounts above KES 300,000 hold KES 618.21 billion, 74.2%. A small ceiling would cover most savers and little of the money; a ceiling like KDIC's KES 500,000 would reach much further.

(Analysis) Members kept adding. Deposits rose from KES 795.78 billion in June 2025 to KES 884.83 billion in June 2026, KES 89.05 billion more, or 11.2%.

## Check your SACCO

(Facts) Every SACCO on SASRA's lists, with its licence status for 2026 and the figures SASRA publishes for it, is in the [Afronomics registry](/registry). Filter to [deposit-taking SACCOs](/registry?kind=sacco_dt) or to [restricted licences](/registry?status=restricted). SASRA's report warns the public against dealing with any entity that calls itself a SACCO but is not on its published lists.

## Our verdict

(Opinion) **Kenya's SACCO members hold KES 885 billion behind a deposit guarantee fund that exists in the Act but, on the regulator's own account, still needs a new law before it can pay anyone; a bank saver has a KES 500,000 safety net, a SACCO saver has a promise.**

SASRA has not been idle. It restricts SACCOs to credit only, revokes licences, and backs mergers to keep struggling SACCOs serving their members. The numbers it publishes are good, and the sector grew 11% in a year.

But supervision is not insurance. The Fund is in the Act without the machinery to pay; its own regulator speaks of "existing legal gaps". If a large SACCO failed tomorrow, its members would wait on a winding-up under the Co-operative Societies Act, the route SASRA's report sets out for SACCOs that leave its list. A bank depositor would have KDIC's cheque. That difference is a policy choice, and it has lasted long enough.

### What would change our mind

The Bill becoming law, a Gazette notice opening the Fund for claims, and the Fund publishing its size and its first accounts. Or a SASRA statement that the Fund is already collecting contributions and can pay.

*Information, not advice.*

<!-- full-file -->

## The full file (Pro)

- **Every exit, by name:** each SACCO SASRA has revoked, restricted or let lapse since 2020, with the reason it gave, from the Gazette lists.
- **The ceiling test:** how much of KES 885 billion a fund would cover at KES 100,000, 300,000 and 500,000, from SASRA's account bands.
- **The Bill, clause by clause:** what the 2025 Bill changes in Part VI of the Act, once checked against the official text.
- **Follow-ups:** the 2027 licence list, the Bill's progress, and each grade of the calls above.
