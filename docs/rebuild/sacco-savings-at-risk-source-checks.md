# Source checks: SACCO savings at risk Receipt

Receipt: `content/receipts/2026-10-15-sacco-savings-at-risk.md` (status `draft`). Checked 15 October 2026.

Network note: from the drafting environment sasra.go.ke, kenyalaw.org, parliament.go.ke and kdic.go.ke could not be
opened directly. Every document below was read through the Probe workflow (`.github/workflows/probe.yml`); the run id
is given for each. Figures marked **Matches our file** come from `data/registry/*.json` or `data/kenya/saccos.json`,
whose rows carry the SASRA source URLs. Anything not confirmed is **Unconfirmed** and sits in the Receipt's `verify`
list, or was cut.

## Probe runs used

| Run id | What it read |
| --- | --- |
| 38804130322 | SASRA Annual Report 2025 (`?wpdmdl=1772`), pages 1–14 and 30–40 (274 pages) |
| 38804322870 | SASRA Annual Report 2025, pages 15–24, 41–42, 67–68, 76–77 |
| 38804169026 | sasra.go.ke index pages: annual reports list (2025 report dated 28 September 2026), licence lists |
| 38804339877 | sasra.go.ke download pages: file ids 1377 (2025 list), 1136 (2024 list), 817 (2023 list), 1575 (2024 report) |
| 38804138360 | SASRA 2026 licence list (`?wpdmdl=1573`), pages 1–2 |
| 38804430456 | SASRA 2025 list (`?wpdmdl=1377`) and 2024 list (`?wpdmdl=1136`), page 1; 2023 list (`?wpdmdl=817`) is a scan |
| 38804134313 | Kenya Law, Sacco Societies Act (version 2025-06-20): sections 2, 55; Mzalendo text of Bill No. 32 of 2025 |
| 38804269763 | Kenya Law, Act: sections 51, 52, 55, 56. parliament.go.ke Bill PDF: 24 pages, no text layer (scan) |
| 38804408401 | Kenya Law, Act: sections 57–60 |
| 38804870216 | KDIC FAQs page; Kenya Law returned 403 on this run |

## Figures and claims

| Claim in the Receipt | Source / exact text seen | Status |
| --- | --- | --- |
| 357 regulated SACCOs: 179 DT, 178 NWDT, end-2025 | AR 2025 p33: "357-Regulated SACCOs consisting of 179-DT-SACCOs and 178-NWDT-SACCOs ... in 2025"; Table 4 "No. of Institutions" 174/177/179 DT, 183/178/178 NWDT (2023–25). Also `data/kenya/saccos.json` (`regulated_saccos` 357) | Matches (run 38804130322) |
| Deposits end-2025 KES 832.74bn: DT 726.50, NWDT 106.24 | AR 2025 Table 4, "Customer Deposits (Kshs. Billion)" 2025: DT 726.50, NWDT 106.24; sum 832.74. `saccos.json` `total_deposits_kes_bn` 832.74; `sasra_sector.json` report 2026-06-30, period 2025-12-31, segment all, deposits 832.74 | Matches. Note Table 16/21 grand total is 832.80 (used only for the account-band table) |
| 14 microfinance banks held KES 44.99bn; SACCOs about 18 times | AR 2025 Table 4, Microfinance banks 2025: deposits 44.99, institutions 14. 832.74 / 44.99 = 18.5 | Matches (arithmetic) |
| 7.87 million members, end-2025 | AR 2025 p41, Table 8: total 7,873,095; "increased by 6.60% in 2025 to reach 7.87 million members" | Matches (run 38804322870) |
| Deposits KES 884.83bn at 30 June 2026 (tile, lede, chart) | `data/registry/sasra_sector.json`, report 2026-06-30, period 2026-06-30, segment all, metric deposits, 884.83 (source `?wpdmdl=1757`) | Matches our file; the June 2026 quarterly PDF itself was not re-opened |
| Chart 2 series: 782.3, 795.78, 814.64, 832.74, 870.02, 884.83 | `sasra_sector.json`, report 2026-06-30, segment all, deposits, periods 2025-03-31 to 2026-06-30 | Matches our file |
| KES 89.05bn more, 11.2%, June 2025 to June 2026 | 884.83 − 795.78 = 89.05; 89.05 / 795.78 = 11.19% | Matches (arithmetic) |
| Annual report published 28 September 2026 | sasra.go.ke annual reports page: "Sacco Supervision Annual Report 2025 6.11 MB ... September 28, 2026" | Matches (run 38804169026) |
| Act s55 establishes the Fund (quote) | Kenya Law: "Part VI – THE DEPOSIT GUARANTEE FUND 55. Establishment of the Deposit Guarantee Fund (1) There is hereby established a Fund to be known as the Deposits Guarantee Fund." | Matches (runs 38804134313, 38804269763) |
| s59 protects "deposits, but not shares", up to a ceiling | Kenya Law: "59. Protection of deposits (1) The Deposit Guarantee Fund shall provide protection for members' deposits, but not shares, up to an amount of one ..." (text cut by the probe) | Wording Matches; **ceiling amount Unconfirmed**, not stated in the Receipt, in `verify` |
| s59(5): member may claim "upon the society becoming insolvent" | Kenya Law: "(5) A member of a Sacco society may upon the society becoming insolvent, lodge a claim with the Authority ... for payment to him out of the Deposit Guarantee Fund" | Matches (run 38804408401) |
| s60: every SACCO a contributor | Kenya Law: "60. Contribution to the Deposit Guarantee Fund (1) Every Sacco society shall be a contributor to the Deposit Guarantee Fund" | Matches (run 38804408401) |
| s51: statutory management; restrict withdrawals | Kenya Law: "51. Supervisory enforcement actions ... (n) issue an order placing the society under statutory management; (o) restrict the withdrawal of deposits from the society" | Matches (run 38804269763) |
| SASRA: Bill No. 32 of 2025 "seeks to operationalize the Deposit Guarantee Fund by addressing the existing legal gaps"; ready "once enacted" | AR 2025 p16 (Board message): "the Government published the Sacco Societies (Amendment) Bill, No. 32 of 2025, which was subsequently introduced into the National Assembly. The proposed bill seeks to operationalize the Deposit Guarantee Fund by addressing the existing legal gaps ... The Authority confirms its readiness in implementing the provisions of this Bill once enacted" | Matches (run 38804322870) |
| Bill s59A: no payments "unless a date for the commencement of such payments has been appointed and published in the Gazette by the Cabinet Secretary" | Mzalendo copy of the Bill: "59A. Despite anything provided in this Part, no payments of claims shall be made out of the Deposit Guarantee Fund unless a date for the commencement of such payments has been appointed and published in the Gazette by the Cabinet Secretary in consult[ation ...]" | Matches Mzalendo's copy; official PDF is a scan, **Unconfirmed against it**, in `verify` |
| Bill date 30 June 2025 (source metadata) | Mzalendo tracker per search result only | Unconfirmed, in `verify` (Bill item) |
| KDIC: "Kshs. 500,000 per person in an institution", paid on liquidation, further payments as recoveries made | KDIC FAQs: "The current Protection or Coverage limit is Kshs . 500,000 ... only made available to depositors (paid) when a bank is placed under liquidation"; "Kshs . 500,000 per person in an institution, and further payments as per recoveries made" | Matches (run 38804870216) |
| 2026 list: 176 DT licensed; 5 restricted (credit only, no new deposits); 1 DT revoked after merger; 1 NWDT expired | 2026 list p1: "the 176 Sacco Societies listed in SCHEDULE I ... licensed"; "the FIVE (5) Sacco Societies listed in SCHEDULE III ... Conditionally Restricted Licenses and Authorizations limiting their SACCO businesses to Credit-Only ... strictly prohibited from taking new and/or any further deposits"; Schedule IV "voluntarily ceased to undertake deposit-taking business ... having merged its membership with that of another Sacco Society"; Schedule V "did not apply for the renewal its authorizations certificate". `sasra_licences.json`: III = 3 dt + 2 nwdt | Matches (run 38804138360) |
| 2025 list: 178 DT licensed; 2 NWDT authorisations expired | 2025 list p1: "the 178 Sacco Societies listed in SCHEDULE I"; "the two (2) Sacco Societies listed in SCHEDULE III herein, did not apply for the renewal their authorizations certificates upon expiry on 31st December 2024 ... automatically revoked" | Matches (run 38804430456) |
| 2024 list: 176 DT licensed; 2 DT licences listed as revoked (not renewed) | 2024 list p1: "the 176 Sacco Societies listed in SCHEDULE I"; "the license of the two (2) Sacco Societies listed in SCHEDULE III were not renewed upon expiry on 31st December 2022, and thus stand revoked" | Matches (run 38804430456). Signing date not read; source date is the start of the licence year, in `verify` |
| "Licences restricted: none listed" for 2024 and 2025 | Page 1 of each list sets out every schedule; neither has a restriction schedule | Matches page 1 only |
| SASRA report: merger to support struggling SACCOs; no statutory management in the licensing chapter | AR 2025 pp16–17: amalgamation "as a practical tool ... for supporting struggling SACCOs while ensuring continuity of services to members"; AR pp38–40 (licensing chapter, section 4.4 revoked licences) mention no statutory management | Matches pages read; the rest of the 274-page report was not searched, so the Receipt limits the claim to "the licensing chapter we read" |
| SACCOs leaving the list "expected to wind-up ... as provided in the Cooperative Societies Act" | AR 2025 p40: "prohibited from undertaking any form of regulated SACCO business in Kenya with effect from 1st January 2026 and are therefore expected to wind-up their businesses as provided in the Cooperative Societies Act" | Matches (run 38804130322) |
| SASRA warns against entities not on its lists | AR 2025 p38: "Members of the public are continuously cautioned against undertaking transactions with any entity purporting to be a SACCO Society but which do not appear in the published lists" | Matches |
| Account bands (accounts, deposits, shares) | AR 2025 Table 21 (2025): <50k 16,875k accounts, KES 44.61bn; 50k–100k 526k, 35.64; 100k–300k 761k, 134.35; 300k–1m 638k, 298.55; >1m 154k, 319.66; total 18,953k, 832.80. Table 22 shares of accounts 89.03/2.77/4.01/3.37/0.81 and of deposits 5.36/4.28/16.13/35.85/38.38 | Matches (run 38804322870) |
| "Accounts, not members ... two or more" | AR 2025 p76: "on average a member may be operating two (2) or more deposit accounts" | Matches |
| 17.40m of 18.95m accounts (91.8%) hold KES 100,000 or less, with KES 80.25bn (9.6%) | 16,875 + 526 = 17,401k; / 18,953 = 91.81%. 44.61 + 35.64 = 80.25; / 832.80 = 9.64% | Matches (arithmetic) |
| 0.79m accounts above KES 300,000 hold KES 618.21bn (74.2%) | 638 + 154 = 792k; 298.55 + 319.66 = 618.21; / 832.80 = 74.23% | Matches (arithmetic) |
| Chart 1 values | AR 2025 Table 22, deposit-amount shares, 2025 subtotals | Matches |
| Registry routes `/registry`, `/registry?kind=sacco_dt`, `/registry?status=restricted` | `app/registry/page.tsx` (query params `kind`, `status`); `lib/registry.ts` kind `sacco_dt`; status `restricted` from `sasra_licences.json` | Matches the code |
| Disclosure | `data/owner/holdings.json` not checked | Unconfirmed, `[founder to confirm]` |

## Cut or not used

- Named SACCOs: the Receipt names none. SASRA's documents name the five restricted SACCOs, the merged SACCO and the SACCO
  whose authorisation lapsed; the registry shows them with SASRA's own status wording. No wrongdoing is alleged.
- The KES 100,000 ceiling in section 59 (third-party copies and press) and SASRA's reported support for a KES 100,000
  ceiling under the Bill (press only): not stated until the Act's text is read in full.
- The Bill's stage in Parliament (committee, public participation) rests on press reports (The Star, People Daily,
  July 2026); not stated beyond SASRA's "introduced into the National Assembly" and "once enacted".
- Press figures on losses at other co-operative bodies: not used.
- The DT average deposit rate: the report gives both 6.41% and 7.02% for 2025 on p35; not used.

## Second check (15 October 2026)

Independent re-check by a second agent. Every probe below was run fresh on 15 October 2026; run ids are the
Probe workflow's.

| Run id | What it read |
| --- | --- |
| 38806090810 | Kenya Law, Sacco Societies Act, versions 2025-06-20 (HTML and `/source` PDF) and 2018-01-01: section 59(1) in full. kenyalaw.org (old site) PDF: 403. sasra.go.ke `/legislation/` and `/sacco-societies-act/`: 404 (no legislation page there) |
| 38806147424 | SASRA Annual Report 2025, pages 13–22, 33, 38–41, 75–77 (Board message, Table 4, licensing chapter, Table 8, Tables 21–22) |
| 38806320906, 38806325735, 38806328517, 38806332761 | SASRA Annual Report 2025, the remaining pages except 103–104 and 185–198 (cut from the fetched log), scanned for "Guarantee"; the only Fund passages are pp16, 156 and 158 |
| 38806095846 | parliament.go.ke bills and bills-tracker pages; Mzalendo Bill page (links to the official PDF; its text is OCR of the scan); kenyalaw.org (old site) 403 |
| 38806188252 | parliament.go.ke bills page links: the tracker is at `/house-business/bill-tracker` |
| 38806522553 | parliament.go.ke bill tracker (no Sacco entry in the page text; the table is not in the HTML), Order Paper 15 October 2026 (no Sacco item), Order Paper 1 April 2026 |
| 38806152366 | Order Paper 1 April 2026; SASRA 2024 licence list (`?wpdmdl=1136`) |
| 38806561755 | Mzalendo's "original PDF" copy of the Bill: 24 pages, no text layer (same scan). new.kenyalaw.org gazettes and bills listings: 403 |
| 38806897423 | Kenya Law Act page: "This is the latest version of this Act" (20 June 2025, amended by Act No. 6 of 2025); no section 59A or secondary-Sacco text |
| 38806961983 | Mzalendo Bill page: masthead "Kenya Gazette Supplement No. 106 (National Assembly Bills No.32) ... NAIROBI, 30th June, 2025" |
| 38807050987 | SASRA 2024 and 2025 licence lists: signing dates |

### Re-verified (all match)

- 357 SACCOs (179 DT, 178 NWDT); deposits KES 726.50bn + 106.24bn = 832.74bn; microfinance banks KES 44.99bn
  (832.74 / 44.99 = 18.5); 7,873,095 members: AR 2025 Table 4 p33 and Table 8 p41.
- Account bands, Table 21 (p76) and Table 22 (p77): every account count, deposit amount and share in the Receipt and
  chart 1. Recomputed: 16,875 + 526 = 17,401k of 18,953k = 91.8%; 44.61 + 35.64 = 80.25bn, 9.6% of 832.80; 638 + 154
  = 792k; 298.55 + 319.66 = 618.21bn, 74.2%. 884.83 − 795.78 = 89.05bn, 11.19%.
- Board message p16–17: Bill No. 32 of 2025 "seeks to operationalize the Deposit Guarantee Fund by addressing the
  existing legal gaps"; readiness "once enacted"; Nufaika–Fortune merger "for supporting struggling SACCOs". p38: 2026
  list is Kenya Gazette Notice No. 1146 dated 30 January 2026; public caution. p40: winding-up "as provided in the
  Cooperative Societies Act".
- Not re-opened: the June 2026 quarterly figures (884.83 and the chart 2 series) rest on `data/registry/sasra_sector.json`
  as in the first check; KDIC FAQ (first check run 38804870216).

### Verify items

- **Act s59(1) ceiling: cleared.** Kenya Law 2025-06-20 (latest version) and 2018-01-01: "The Deposit Guarantee Fund
  shall provide protection for members' deposits, but not shares, up to an amount of one hundred thousand shillings in
  respect of each member." The Receipt now states KES 100,000 (summary, lede, What happened, analysis, verdict).
- **Bill wording and stage: cleared by rewording.** No official copy with a text layer exists that the probe can reach:
  the parliament.go.ke PDF and Mzalendo's original are the same scan; Kenya Law's bills and gazette listings return
  403. The Receipt no longer quotes the Bill (the 59A quotation from Mzalendo's OCR is cut). It now describes the
  Bill from SASRA's own report (section 10.1, p158), which states the same substance: the gaps are the "absence of a
  moratorium to build the fund, thus exposing the government to liability to pay claims immediately it is
  operationalized" and "ambiguity in the appointment of independent members of the Board of Trustees", and "the Bill
  establishes a moratorium which allows the fund to make payments only upon accumulation of sufficient money to meet
  its obligations". Stage: the National Assembly's order paper for 1 April 2026 lists the Bill for First Reading; the
  15 October 2026 order paper has no Sacco item; the bill tracker's table does not load without a browser. Kenya
  Law's latest version of the Act (20 June 2025) has no 59A. The Receipt states only the April 2026 order paper.
  The Bill's date (30 June 2025) is the Gazette Supplement masthead as transcribed by Mzalendo.
- **2024 licence list date: cleared.** "Dated at Nairobi this 30th day of January 2024", Peter Njuguna, CEO. It is a
  SASRA public notice; no Gazette notice number appears in its text. Source date changed to 2024-01-30. The 2025
  list is dated 28 January 2025 (source date corrected from 2025-01-27). The table's lead-in no longer says every list
  ran in the Gazette; it cites Gazette Notice No. 1146 for 2026 only.
- **Disclosure: remains** (founder to confirm; not touched).

### Changes made to the Receipt

1. **"Cannot pay" softened.** SASRA never says the Fund cannot pay. It says the Bill would "operationalize" it and
   that the current Act lacks a moratorium, so claims would be payable "immediately it is operationalized". The
   problem is that the Fund has not been made operational, not that the law forbids payment; and the Bill SASRA backs
   would add a wait, not remove one. Title now "a deposit guarantee fund that has yet to be switched on"; verdict
   (three places) "has yet to be made operational ... a SACCO saver a KES 100,000 promise on paper"; summary and lede
   reworded to match; Opinion section notes the Bill "would make members wait while the Fund fills up";
   "would wait on a winding-up" softened to "would most likely".
2. Section 59 ceiling now quoted. Analysis line ties the account bands to the KES 100,000 ceiling, counted by account.
3. Bill 59A quotation (Mzalendo OCR) replaced by SASRA's own description; order-paper stage added; Mzalendo source
   replaced by the 1 April 2026 order paper.
4. Call 2 reworded so it does not depend on the unconfirmed Gazette mechanism ("a date ... appointed and published").
5. "What would change our mind": "a Gazette notice opening the Fund" now "a date set for the Fund to start paying
   claims".
6. Source dates: 2024 list 2024-01-30, 2025 list 2025-01-28.

`python3 scripts/receipt_check.py`: 12 Receipts, 0 problems. `pytest tests/site -k receipt`: 13 passed.
