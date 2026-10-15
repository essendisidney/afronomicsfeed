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
