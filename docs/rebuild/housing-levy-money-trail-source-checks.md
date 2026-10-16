# Source checks: Housing Levy money trail Receipt

Receipt: `content/receipts/2026-10-15-housing-levy-money-trail.md` (status `draft`). Checked 15 October 2026.

Research note: the desk sandbox cannot open external sites, so pages were fetched by the GitHub Actions Probe workflow
(`scripts/probe.py`) on 15 October 2026:

- job 116661110905: Kenya Law, Affordable Housing Act 2024 and the High Court judgment of 28 Nov 2023;
- job 116661092772: five Parliament library PDFs, pp. 1-3, to identify them (Auditor-General on the Affordable Housing
  Board 2024/25 = bitstream df92136e; on the Affordable Housing Fund 2024/25 = f4556698; on the Board's three months to
  June 2024 = faf6c97b; two Affordable Housing Finance Project reports, not used);
- job 116662516810: pattern search of f4556698, df92136e and the special audit (2532ce07);
- job 116663122411: special audit, full text pp. 1-14, 34-44;
- job 116663752226: special audit, full text pp. 15-24, 45-62;
- job 116663136001: Board 2024/25 report, full text pp. 4-30;
- job 116663160348: High Court judgment orders, Citizen Digital, Capital FM, The Kenya Times;
- job 116664430730: Business Daily (two articles; Nation returned 403);
- job 116665167091: Citizen Digital and The Kenya Times dates and wording;
- job 116666013397: Business Daily article date (raw HTML).

The Parliament library PDFs are scans with an OCR text layer of uneven quality. Page numbers below are PDF pages. The
Affordable Housing Fund's own 2024/25 statements (f4556698, 79 pages) have almost no text layer, so its revenue and
spending figures could not be read.

| Figure or claim in the Receipt | Source, quote or row | Probe job | Status |
| --- | --- | --- | --- |
| Levy is 1.5% of an employee's gross salary, or of other gross income not levied | Act s.4(2): "at the rate of one point five percent of— (a) the gross salary of an employee; or (b) the gross income of a person received or accrued which is not subject to the Levy under paragraph (a)" | 116661110905 | Matches |
| Employer deducts the employee's share and pays an equal amount | Act s.5(1): "(a) deduct and remit the amount referred to in section 4 (2)(a) from the gross salary of an employee; and (b) remit an amount equivalent to the amount deducted" | 116661110905 | Matches |
| Paid to KRA (the collector) by the ninth working day, for the Fund | Act s.4(3): "payable to the collector, for remittance into the Fund, not later than the ninth working day after the end of the month"; s.2: "collector" means the Commissioner-General of KRA | 116661110905 | Matches |
| Assented 19 March 2024; published in the Gazette 21 March 2024 | Kenya Law header: "Published in Kenya Gazette Vol. CXXVI—No. 34 on 21 March 2024 Assented to on 19 March 2024 Commenced on 22 March 2024" | 116661110905 | Matches |
| Rate also in `data/kenya/payroll_rates.json` | `housing_levy: { employee_pct: 1.5, employer_pct: 1.5 }` | repo | Matches |
| 28 Nov 2023: High Court declared s.84 Finance Act 2023 unconstitutional, null and void (Arts 10(2)(b),(c) and 201) and barred collection under it | [2023] KEHC 25872 (KLR) orders: "a declaratory order be and issued that the Section 84 of Finance Act, 2023 violates Article 10 (2) (b) and (c) and 201 of the Constitution and is therefore unconstitutional, null and void"; "... from charging, levying or in any way collecting tax, otherwise known as the 'Affordable Housing Levy' on the basis of the aforesaid Section 84" | 116663160348 | Matches |
| Court found the levy lacked a comprehensive legal framework | Kenya Law summary: "section 84 of the Finance Act, 2023 lacked a comprehensive legal framework in violation of articles 10, 201, 206 and 210" | 116663160348 | Matches |
| Levy started mid-2023 | Special audit para 3.3.5: "Since the operationalization of the Affordable Housing Levy (AHL) in mid-2023" (PDF p. 44); SLA "effective 1 July, 2023" (p. 45) | 116663122411, 116663752226 | Matches |
| KES 42.73bn (Aug 2023 to Apr 2024); KES 71.80bn (May 2024 to Apr 2025); total KES 114.52bn | Special audit Table 4 (PDF p. 45): "2023/2024 August 2023 to April 2024 42,725,951,485; 2024/2025 May 2024 to April 2025 71,796,303,309; Total 114,522,254,794" | 116663752226 | Matches |
| Remitted KES 111.32bn: KES 34.72bn to SDHUD, KES 76.60bn to the Affordable Housing Fund; KES 2.38bn in transit; KES 0.82bn KRA commission | Special audit paras 1.6.6-1.6.7 (pp. 13), 3.3.12-3.3.13 and Table 5 (pp. 46-47): 34,720,678,394; 76,595,334,642; 2,383,178,457; 823,063,301 | 116663122411, 116663752226 | Matches; 34.72 + 76.60 + 2.38 + 0.82 = 114.52 |
| Of SDHUD's KES 34.72bn: KES 14.51bn to projects; KES 20bn in Treasury bills on 17 May 2024; KES 0.19bn back to the Treasury | Special audit para 3.4.4 and Table 6 (p. 48): 14,510,414,220; 20,000,000,000 "invested in Treasury Bills on 17 May, 2024"; 194,747,463 "refunded to The National Treasury"; residual 15,516,711 | 116663752226 | Matches; chart 1 values 20.0, 14.51, 0.19 |
| Treasury bills later handed to the Board | Special audit para 3.4.7 (p. 49): "transferred to an investment account held at the Central Bank of Kenya on 17 May, 2025 and was subsequently surrendered to the Affordable Housing Board" | 116663752226 | Matches |
| Audit requested by the Board; dated February 2026 | Special audit cover (p. 1): "PROJECT STATUS AS AT 31 MARCH, 2025 FEBRUARY 2026"; para 1.1.3 / 2.1.1: the Board "requested audit support" (letter of 29 Aug 2024) | 116663122411, 116663752226 | Matches; source date set to 2026-02-01 (no day given): in `verify` |
| Budget KES 63.22bn (2023/24) and KES 64.69bn (2024/25), financed from the levy | Special audit Table 3 (p. 44): "2023/2024 63,220,000,000; 2024/2025 64,688,537,398" and para 3.3.1 | 116663122411 | Matches |
| No consolidated feasibility study, no documented cost-benefit analysis or affordability threshold | Special audit para 3.1.15 (p. 40): "No formal cost-benefit analysis or project appraisal framework was documented"; "No formal affordability threshold analysis"; para 1.8.2 | 116663122411, 116663752226 | Matches |
| Plan target 250,000 units a year (MTP IV) | Special audit para 3.1.4 (p. 36): "with a revised annual target of 250,000 housing units" | 116663122411 | Matches |
| April 2025: of 142 affordable housing projects, 0 complete, 60 ongoing, 78 not commenced, 4 not visited | Special audit para 1.6.13 table (p. 15), row 1: "Affordable Housing Projects 142 0 60 78 0 [4] 142", remark "Four (4) projects were not visited due to limitation of accessibility". OCR shows the not-verified cell as "I"; 0 + 60 + 78 + 0 + 4 = 142 and the remark both give 4 | 116663752226 | Matches (one OCR cell read from the row total and the remark) |
| Causes: procurement and approvals delays, contract records, site readiness, supervision | Special audit para 1.6.14 (p. 15) | 116663752226 | Matches |
| Board: "pipeline of 178,627 housing units ... with 3,171 units complete"; KES 125bn collected since the levy began | Board annual report 2024/25, PDF p. 8: "The Board has directly enabled a pipeline of 178, 627 housing units at different stages of construction with 3,171 units complete"; "From inception of the levy collection, KES 125 billion has been collected by the Kenya Revenue Authority (KRA)" | 116663136001 | Matches. The figure for the year itself is garbled ("rsns z:. t billion") and is not used |
| Board's performance table (PDF p. 14) target 200,000 units for the year | OCR row "200,000 36t I 196,389 ..." reads as actual about 3,611 (200,000 − 196,389), which conflicts with the 3,171 on p. 8 | 116663136001 | Not used in the Receipt (garbled and inconsistent) |
| Auditor-General's report on the Board dated 19 December 2025 | Board report, PDF p. 27: "AUDITOR-GENERAL Nairobi 19 December, 2025" | 116663136001 | Matches |
| 3,171 is about 1% of 250,000 | 3,171 / 250,000 = 1.27% | arithmetic | Matches |
| Business Daily: Economic Survey 2026 shows 96.3% of KES 79.03bn spent in 2024/25, 32.6% of KES 78.18bn the year before | Business Daily, 29 Apr 2026: "absorption of funds from housing levy collections surged to 96.3 percent of the Sh79.03 billion budget in the financial year ended June 2025, compared to 32.6 percent of Sh78.18 billion the previous year"; date from `datePublished` "2026-04-29T17:48:22Z" | 116664430730, 116666013397 | Press report matches; KNBS Survey not opened: in `verify`. The same article also says "Actual spending on housing more than tripled to Sh79.03 billion", which conflicts with 96.3% of 79.03; not used |
| 22 Oct 2024: three-judge High Court bench dismissed the petitions and upheld the Act | The Kenya Times, 25 Sep 2026: "On October 22, 2024, a three-judge High Court bench comprising Justices Sewe, Chigiti and Mong'are dismissed the petitions and upheld the constitutionality of the Act" | 116665167091 | Matches the press report; judgment not opened: in `verify` |
| 25 Sep 2026: Court of Appeal dismissed the appeal and upheld the Act | Citizen Digital, "September 25, 2026": "In a judgment delivered in Nairobi on September 25, 2026, the court found no merit in the appeal"; "In its final orders, the Court of Appeal dismissed the appeal"; The Kenya Times, 25 Sep 2026: "The Court of Appeal upheld the constitutionality of the Affordable Housing Act, 2024" | 116663160348, 116665167091 | Two independent publications agree; judgment not opened: in `verify` |
| Court faulted the process: CRA should have considered the Bill | Citizen Digital: "the Commission on Revenue Allocation (CRA) should have been given an opportunity to consider the Bill and make recommendations before it was debated and passed by Parliament" | 116663160348 | Matches; attributed to Citizen Digital in the body |
| Appeal case numbers E832 of 2024 and E019 of 2025 | Capital FM: Registrar's letter confirmed "Civil Appeal No. E832 of 2024 and Civil Appeal No. E019 of 2025" | 116663160348 | Press only, article date not read: kept out of the body, listed in `verify` |
| The levy is still collected | `data/kenya/payroll_rates.json`, checked 2026-10-15 (KRA levy notice) | repo | Matches |
| KRA treats the levy as a deduction before PAYE | `data/kenya/payroll_rates.json` note ("SHIF, the Housing Levy, and pension contributions ... are deducted before PAYE, as KRA's PAYE page sets out"); `lib/salary-calc.ts` | repo | Matches our data file |

## Arithmetic (Afronomics)

Using `lib/salary-calc.ts` logic and `data/kenya/payroll_rates.json` (re-run in Python, NSSF 0, 2,160 and 4,320: same result):

| Figure | Working |
| --- | --- |
| Levy on KES 50,000 | 50,000 × 1.5% = 750; employer the same |
| Levy on KES 100,000 | 100,000 × 1.5% = 1,500; employer the same |
| Take-home falls KES 525 (50k) | Net with levy 41,129.15 vs without 41,654.15 (NSSF 0): difference 525.00; PAYE 6,745.85 vs 6,970.85, lower by 225 |
| Take-home falls KES 1,050 (100k) | Net 74,641.65 vs 75,691.65: difference 1,050.00; PAYE lower by 450 |
| A year, worker and employer | (750 + 750) × 12 = 18,000; (1,500 + 1,500) × 12 = 36,000 |
| Both in the 30% band | Taxable pay after SHIF (2.75%) and levy: 47,875 and 95,750 at most, above 32,333 and below 500,000 |
| Remittance check | 34,720,678,394 + 76,595,334,642 = 111,316,013,036; + 2,383,178,457 + 823,063,301 = 114,522,254,794 |

## Not used

- Treasury QEBR and Controller of Budget figures: no primary document opened. Press reports say the levy sits outside
  the Controller of Budget's oversight; not stated in the Receipt.
- Business Daily (4 Sep 2025) "KRA collected Sh73.2 billion in 2024/25 against Sh63.2 billion target": press only;
  the audit's May 2024 to April 2025 figure (KES 71.80bn) is used instead.
- Nation (Sh206bn over three years): returned 403.
- Court of Appeal stay ruling of 26 January 2024 (Civil Application E577 of 2023): secondary sources only; cut.

## Second check (15 October 2026)

Independent re-check by a second agent. Probe runs (GitHub Actions, Probe workflow):

- run 38806349501 / job 116668118838: special audit (2532ce07), pp. 1-4 and 13-17, layout kept;
- run 38806379205 / job 116668218035: Kenya Law search API (`/search/api/documents/?search=...`);
- run 38806408181 / job 116668320152: KNBS "Economic Survey 2026 Facts and Figures" PDF;
- runs 38806477844 / job 116668551527 and 38806533545 / job 116668743465: Kenya Law judgment page and a second search, both
  returned 403 Forbidden (nginx).

| Item | What the source says | Result |
| --- | --- | --- |
| Headline: none of 142 affordable housing projects finished | Special audit para 1.6.13 (PDF p. 15), "Physical verification exercise undertaken in April, 2025": row 1 "Affordable Housing Projects 142 0 60 78 0 [4] 142", remark "Four (4) projects were not visited". Para 1.6.12 (p. 14): the Board presented **842** projects in all, of which 142 were Affordable Housing Projects; the rest were institutional housing (159), social housing (24), ESP markets, market sheds, modern markets, floodlights, infrastructure and access roads. The table's total row shows 6 completed projects across the whole portfolio (markets and infrastructure), and the institutional-housing remark reads "Most of the Institutional Housing Projects had been completed and occupied hence 159 were not visited" (OCR cleaned) | Draft title "no project on the list finished" was wrong for the 842-project list. **Fixed**: title now "none of 142 affordable housing projects finished at audit"; the body adds the 159 institutional projects the auditors skipped as mostly completed and occupied |
| Report scope and date | Cover: "PROJECT STATUS AS AT 31 MARCH, 2025 / FEBRUARY 2026"; foreword signed "AUDITOR-GENERAL ... 27 February, 2026". Parliament's "Papers laid" stamp on p. 1 is illegible in the OCR | Source date set to 2026-02-27, body says "signed on 27 February 2026". Tabling date not stated anywhere in the Receipt. Verify item removed |
| Collection period | Para 1.6.6: "Between June, 2023 and April 2025, KRA collected a cumulative total of Kshs.114,522,254,794"; Table 4 labels the first period "August 2023 to April 2024" | The audit is inconsistent on the start month. Lede, summary and tile now say "by April 2025" / "to April 2025"; the table keeps Table 4's own labels |
| 34.72bn split: 14.51 projects, 20.0 T-bills, 0.19 to Treasury; 2.38 in transit; 0.82 commission | Para 1.6.7-1.6.8 (p. 13) | Matches |
| Court of Appeal judgment | Kenya Law search index (job 116668218035): "Gikenyi B & 5 others v Cabinet Secretary for Lands, Public Works, Housing, [and Urban] Development & 65 others (Civil Appeal E832 of 2024) [2026] KECA 1821 (KLR) (25 September 2026) (Judgment)", Court of Appeal, judges Muchelule, Odunga, Kiage, Karanja, Korir. The judgment text returned 403, so the outcome could not be read from it | Case and date confirmed on Kenya Law; outcome stays attributed to Citizen Digital and The Kenya Times. Court section cut to one attributed sentence with the citation. **Cut**: the 22 October 2024 High Court sentence (press only; not found) and the CRA process point (Citizen Digital only). Verdict line "the courts have now settled" softened to "The Act has now survived the Court of Appeal". Verify item removed |
| Business Daily / Economic Survey 2026 (96.3% of KES 79.03bn) | KNBS Facts and Figures 2026 (133 pp.) has almost no text layer: no match for housing levy, 79.0, 96.3 | KNBS table not read. **Cut** the paragraph and the Business Daily source. Verify item removed |
| Board 2024/25 year levy figure / Fund statements | Not used anywhere in the Receipt | Verify item removed (no claim depends on it) |
| Take-home arithmetic | `lib/salary-calc.ts` run directly (node --experimental-strip-types) with `data/kenya/payroll_rates.json`, levy on vs off, NSSF 0, 2,160, 4,320, 6,480: KES 50,000 net falls 525.00 (PAYE -225.00); KES 100,000 falls 1,050.00 (PAYE -450.00) at every NSSF value | Matches |
| Disclosure | `data/owner/holdings.json` does not exist | Left in `verify` for the founder |

Also changed: "The audit traced every shilling ... to an account" became "accounted for every shilling ...: remitted, in transit or kept as KRA's commission" (KES 2.38bn was in transit, not in an account).

`python3 scripts/receipt_check.py`: 12 Receipts, 0 problems. `pytest -q tests/site -k receipt`: 13 passed.
