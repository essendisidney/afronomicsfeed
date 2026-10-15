# Source checks: banks lend to government Receipt

Receipt: `content/receipts/2026-10-15-banks-lend-to-government.md` (status `draft`). Checked 15 October 2026.

Every document below was read through the Probe workflow (`probe.yml`, repository essendisidney/afronomicsfeed). Run
ids are GitHub Actions run ids; each run was confirmed as ours from the URLs and pattern printed in its job log.

| Probe run | Job | Document |
| --- | --- | --- |
| 38804806732 (pattern `BANKSGOVT-RECEIPT-PROBE-B`, pages 3-10, 20-80) | 116662773454 | CBK Bank Supervision Annual Report 2025 |
| 38803985101 (pattern search, first 12 pages) | 116659960046 | CBK Bank Supervision Annual Report 2025 (178 pages, status 200) |
| 38804155041 | 116660547438 | CBK MPC press release, 7 October 2026 |
| 38804079762 | 116660288491 | KCB Group audited results 2025 (NSE); Co-op summary consolidated statements 2025 |
| 38804108994 (layout on) | 116660389784 | Equity Group Holdings audited financial statements and other disclosures 2025 (USE) |
| 38804544764 (pattern `BANKSGOVT-RECEIPT-PROBE-COOP1`, pages 150-229) | 116661879036 | Co-op 2025 integrated report (CMA) |
| 38804549577 (pattern `BANKSGOVT-RECEIPT-PROBE-COOP2`, pages 230-289) | 116661902766 | Co-op 2025 integrated report (CMA) |

## Sector figures: CBK Bank Supervision Annual Report 2025

| Figure in the Receipt | Exact text / table row seen | Status |
| --- | --- | --- |
| Government securities KES 2,499.3bn (2025), KES 2,114.8bn (2024); 29.9% of assets | Table 17 (PDF p69, printed p52): "Government securities 2,114,752 2,499,266 29.9" (Ksh.M) | Matches |
| Net loans KES 3,881.9bn (2025), KES 3,641.4bn (2024); 46.5% | Table 17: "Loans and advances (net) 3,641,392 3,881,913 46.5". (Table 20 gives Net Loans Dec-24 as 3,641,373; we use Table 17.) | Matches |
| Govt securities +KES 384.5bn (18.2%); loans +KES 240.5bn (6.6%) | p68 text: "increase in government securities by Ksh.384.5 billion (18.2 percent), loans and advances by Ksh.240.5 billion (6.6 percent)" | Matches, quoted |
| Interest on government securities KES 262.3bn (24.9%) → KES 287.2bn (27.8%) | Table 22 (PDF p74, printed p57): "Interest on Government Securities 262,322 24.9 287,211 27.8" | Matches |
| Interest on advances KES 540.9bn (51.3%) → KES 500.4bn (48.4%) | Table 22: "Interest on Advances 540,888 51.3 500,362 48.4" | Matches |
| Total income KES 1,032.9bn | Table 22: "Total Income 1,054,406 100 1,032,948 100" | Matches |
| Profit before tax KES 306.3bn from KES 260.3bn | Table 22: "Profit Before Tax 260,329 306,253" | Matches |
| Private-sector lending growth 5.9% Dec 2025, -2.9% Jan 2025 | PDF p79: "Lending to private sector grew by 5.9 percent in December 2025 having improved from negative 2.9 percent in January 2025." | Matches, quoted |
| Average lending rate 14.82% (Dec 2025) from 16.89% (Dec 2024) | PDF p66: "Commercial banks' average lending rates declined to 14.82 percent in December 2025 from 16.89 percent in December 2024." Also `data/kenya/rates.json` month 2025-12 lending 14.82 | Matches |
| 91-day bill 7.77% (Dec 2025) vs 10.32% (Dec 2024) | PDF p66: "91-day Treasury bill rate at 7.77 percent in December 2025 from 10.32 percent in December 2024." | Matches |
| Deposit rate 7.13% from 10.45% | PDF p66: "deposit rate also declined to 7.13 percent in December 2025 from 10.45 percent in December 2024" | Matches |
| Gross NPLs 16.0% of gross loans, end 2025 | Table 20: "Gross NPLs/Gross Loans (%) 17.1 16.0" | Matches |
| KES 64 of govt paper per KES 100 of loans (KES 58 in 2024) | 2,499,266 / 3,881,913 = 0.644; 2,114,752 / 3,641,392 = 0.581 | Matches (arithmetic) |
| Govt interest = 57% of loan interest (48% in 2024) | 287,211 / 500,362 = 0.574; 262,322 / 540,888 = 0.485 | Matches (arithmetic) |
| "Almost three times as fast" | 18.2 / 6.6 = 2.76 | Matches (arithmetic) |
| Source date in front matter | Set to 2025-12-31 (data date). The report's publication date was not printed in the pages read | Unconfirmed (date only) |

## Three largest banks by assets

| Figure | Source | Status |
| --- | --- | --- |
| KCB Bank Kenya KES 1,497.7bn, Equity Bank Kenya KES 1,040.6bn, Co-op Bank KES 759.4bn: the three largest by assets | `data/registry/cbk_figures.json`, metric `assets`, report 2025 (CBK BSA 2025 p117): 1,497,701; 1,040,612; 759,407; next NCBA 616,764. Note the file's `rank` field is not an asset rank (NCBA has rank 5 but more assets than Absa, rank 4), so the ranking was computed from the asset values | Matches |
| Each bank's own statement ties to CBK assets | KCB Bank Kenya total assets 1,497,701,115; Equity Bank (Kenya) 1,040,612,239; Co-op Bank (Bank Statement of Financial Position, report p153) 759,406,531 (Kshs 000) | Matches |

## KCB Bank Kenya (KCB Group audited results, "KCB BANK KENYA" column, Kshs 000)

| Figure | Line seen | Status |
| --- | --- | --- |
| Govt securities KES 332.2bn | 3. "Kenya Government and other securities held for dealing purposes 46,185,911"; 5a(a) "Kenya Government securities 135,234,914"; 5b(a) "Kenya Government securities 150,780,055". Sum 332,200,880. Line 3 is labelled "and other" | Matches (sum) |
| Net loans KES 866.9bn | 9. "Loans and advances to customers (net) 866,930,793" | Matches |
| Interest from govt KES 36.4bn | 1.2 "Government securities 36,370,142" | Matches |
| Interest from loans KES 109.2bn | 1.1 "Loans and advances 109,246,154" | Matches |
| Govt share 24.2% | 36,370,142 / 1.5 "Total interest income 150,419,466" = 24.18% | Matches (arithmetic) |
| KES 38 per KES 100 of loans | 332,200,880 / 866,930,793 = 0.383 | Matches (arithmetic) |
| Source date 2026-03-11 | "The financial statements were approved by the Board of Directors on 11 March 2026" | Matches |

## Equity Bank (Kenya) Limited (Equity Group Holdings filing, "EQUITY BANK (KENYA) LIMITED BANK" column, Shs 000)

| Figure | Line seen | Status |
| --- | --- | --- |
| Govt securities KES 307.1bn | 3. held for dealing "-"; 5a(a) "Kenya Government securities 7,872,079"; 5b(a) "Kenya Government securities 299,245,918". Sum 307,117,997. "Other securities" at FVOCI (103,804,746) excluded | Matches (sum) |
| Net loans KES 409.4bn | 9. "Loans and advances to customers (net) 409,447,447" | Matches |
| Interest from govt KES 44.0bn | 1.2 "Government securities 43,997,577" | Matches |
| Interest from loans KES 58.2bn | 1.1 "Loans and advances 58,228,059" | Matches |
| Govt share 42.1% | 43,997,577 / "Total interest income 104,609,426" = 42.06% | Matches (arithmetic) |
| KES 75 per KES 100 of loans; "three shillings for every four" | 307,117,997 / 409,447,447 = 0.750; 43,997,577 / 58,228,059 = 0.756 | Matches (arithmetic) |
| Source date 2026-03-17 | "the board approved them on Tuesday, 17th March, 2026" | Matches |
| Filing hosted on the Uganda Securities Exchange site, not Equity's own site | URL as listed | Note |

## The Co-operative Bank of Kenya Limited (2025 integrated report, "Bank" columns, KShs 000)

| Figure | Line seen | Status |
| --- | --- | --- |
| Govt securities KES 224.5bn | Note 14 (p250, amortised cost, Bank 2025): treasury bills 5,688,208 + 17,909,189, treasury bonds 89,357,265 (corporate bonds 915,681 excluded); Note 10(b) (p244, FVOCI, Bank 2025): 110,900,202, all treasury bills and bonds; Note 10(a) FVTPL government treasury bonds 630,701. Sum 224,485,565 | Matches (sum) |
| Net loans KES 393.5bn | Note 13 (p249): "Net loans and advances to customers ... 393,498,551" (Bank 2025); Bank statement of financial position "Loans and advances to customers 393,498,551" | Matches |
| Interest from govt KES 26.7bn | Note 34 (p271, Bank 2025): "Debt instruments at amortised cost 16,145,439"; "Debt instruments at FVOCI 10,554,295". Sum 26,699,734. Includes interest on KES 0.9bn of corporate bonds; not split out. Disclosed in the table note | Matches (sum), with caveat stated |
| Interest from loans KES 56.8bn | Note 34: "Loans and advances to customers ... 56,791,338" | Matches |
| Govt share 30.9% | 26,699,734 / "Total interest and similar income 86,528,895" = 30.86% | Matches (arithmetic) |
| Source date 2026-04-01 | Summary consolidated statements (co-opbank.co.ke) state the audit report on the full statements is "dated 1 April 2026" | Matches |

## MPC press release, 7 October 2026

| Figure | Text seen | Status |
| --- | --- | --- |
| Private-sector lending growth 10.6% in September 2026; -2.9% in January 2025 | "Growth in commercial banks' lending to the private sector remained strong at 10.6 percent in September 2026, compared to 10.3 percent in August 2026 and -2.9 percent in January 2025." | Matches, quoted |
| MPC meets again in December 2026 (follow-up) | "The Committee will meet again in December 2026." | Matches |

## Our data files

| Figure | Source | Status |
| --- | --- | --- |
| Lending rate benchmark 14.34% in August 2026 | `data/kenya/rates.json`, `bank_rates.rows` month 2026-08, `lending` 14.34; source URL https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/ (the benchmark `/rates/kenya/loan-cost` displays) | Matches |
| 364-day bill 9.0383% (auction for 19 Oct 2026) | `data/kenya/tbill_auctions.json`, tenor 364, issue 2633, value date 2026-10-19 | Matches |

## Not used / cut

- Group-level figures (KCB Group, Equity Group, Co-op Group) were read but not used; the Receipt uses the Kenyan bank figures that tie to the CBK's asset table.
- Third-party summaries (Cytonn, Khusoko, africanfinancials) were seen in search results only and are not cited.
- Claims about the 2016-2019 interest-rate cap were cut rather than sourced.
- Disclosure: `data/owner/holdings.json` not found in the repo. Placeholder left for the founder.
