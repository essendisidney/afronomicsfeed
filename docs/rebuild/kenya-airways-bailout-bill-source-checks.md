# Source checks: Kenya Airways bailout bill Receipt (draft)

Receipt: `content/receipts/2026-10-15-kenya-airways-bailout-bill.md` (status `draft`). Checked 15 October 2026.

**How this was checked.** The desk machine cannot open these sites, so pages and PDFs were fetched by the GitHub
Actions Probe workflow (`.github/workflows/probe.yml`). Runs on 15 October 2026 (run id / job id):

| Probe | What it read |
| --- | --- |
| 38804589684 / 116662036708 | Treasury APDMR FY2024/25, pp. 2-6 (contents). The FY2023/24 (`wp-content/uploads/2024/11/...`) and FY2022/23 (`wp-content/uploads/2024/01/...`) Treasury links both return 404 |
| 38804615317 / 116662136194 | USE news page for KQ's FY2025 results (PDF link); kenya-airways.com investor page (404); africanfinancials (403, Cloudflare) |
| 38804719158 / 116662476034 | APDMR FY2024/25, pp. 28-30 and 52-56 |
| 38804734954 / 116662526088 | KQ FY2025 summary audited results PDF (USE upload 69b181a2), full text; USE page for the 12 Oct 2026 cautionary notice |
| 38804932668 / 116663216061 | KQ cautionary notice PDF (USE upload be05c9dd), full text, 2 pages |
| 38804781833 / 116662687485 | USE KQ listing page (list of KQ filings); Parliament library copy of APDMR FY2022/23, pp. 1-5 |
| 38804983943 / 116663391680 | USE half-year 2026 page (PDF link); APDMR FY2022/23 pp. 6-10 (contents: KQ section on printed p. 80) |
| 38805092904 / 116663772867 | KQ half-year 2026 PDF (USE upload 59c7191e): 6 pages, **image only, no text**; APDMR FY2022/23 pp. 98-103 |
| 38805107282 / 116663834185 | Parliament library item pages (FY2022/23 and FY2024/25 reports and issue dates) |
| 38805298361 / 116664477630 | kenya-airways.com home, USE annual reports page, NSE market statistics and listed companies (no KQ price: pages load prices by JavaScript) |
| 38805418199 / 116664887842 | The Star 8 Apr 2026; tech-ish 1 Sep 2026; Kenyans.co.ke 126491; khusoko (503 twice) |

"Matches" means the figure is in the text of the named document as fetched. "Arithmetic" means our own sum from
figures above it. "Open" items are in the Receipt's `verify:` list.

## Kenya Airways cautionary notice, 9 October 2026 (run 38804932668)

| # | Claim in the Receipt | Exact text seen | Status |
| --- | --- | --- | --- |
| 1 | Notice dated 9 October 2026, published on USE 12 October | "Dated at Nairobi this 9th day of October 2026"; USE page "October 12, 2026" | Matches |
| 2 | "two related measures intended to support the Company's planned turnaround" | 1.1, verbatim | Matches |
| 3 | US$350m loan, about KES 45.15bn | 2.1 "a shareholder loan of US$350,000,000, equivalent to approximately Kes45.15 billion" | Matches |
| 4 | "immediate and non-deferrable operational obligations" | 2.1, verbatim (line break at "non-/deferrable") | Matches |
| 5 | Earmarked for aircraft maintenance and return to service of grounded aircraft | 2.2 | Matches |
| 6 | 10-year tenor; may convert to equity at the government's option, or be repaid earlier | 2.3 | Matches |
| 7 | About KES 122bn of existing government loans plus accrued interest into "an equity-qualifying tradeable instrument" | 3.1 "existing Government shareholder loans of approximately Kes122 billion, together with accrued interest, into an equity-qualifying tradeable instrument" | Matches |
| 8 | Aim: "from its current negative equity position to a positive equity position"; capital raise | 3.2 | Matches |
| 9 | Needs definitive agreements, shareholder approval, CMA and NSE consent; caution advised | 4.1, 5.1, 5.2 | Matches |
| 10 | Notice renewed within 60 days (follow-up 8 Dec 2026) | 5.3 "renewed at intervals of not more than sixty (60) days" | Matches; date is arithmetic from 9 Oct |
| 11 | KES 167.15bn | 122 + 45.15 | Arithmetic |

## Kenya Airways audited results for 2025 (run 38804734954)

| # | Claim | Row seen (KShs M, 2025 / 2024) | Status |
| --- | --- | --- | --- |
| 12 | Signed 24 March 2026 | "Kiprono Kittony, EBS Chairman 24 March 2026" | Matches |
| 13 | Total income KES 161.5bn / 188.5bn | "Total income 161,473 188,495" | Matches |
| 14 | Operating loss KES 5.6bn / profit 16.6bn | "Operating (loss)/profit (5,607) 16,621" | Matches |
| 15 | Finance costs KES 12.4bn / 11.2bn | "Finance costs (12,399) (11,163)" | Matches |
| 16 | Loss after tax KES 17.2bn / profit 5.4bn | "(Loss)/profit for the year (17,163) 5,432" | Matches |
| 17 | Total assets KES 183.2bn / 179.1bn | "TOTAL ASSETS 183,228 179,104" | Matches |
| 18 | Total liabilities KES 315.3bn / 297.4bn | "TOTAL LIABILITIES 315,293 297,355" | Matches |
| 19 | Total equity −KES 132.1bn / −118.3bn | "TOTAL EQUITY (132,065) (118,251)" | Matches |
| 20 | Chart: equity −138.1bn at 1 Jan 2024 | Statement of changes in equity, "At 1 January 2024 ... (138,063)" | Matches |
| 21 | Grounding quote | "severely impacted primarily by the temporary grounding of three of the wide body fleet, Boeing 787-8 Dreamliner aircraft. This was driven by the global supply chain constraints and limited engine availability." | Matches (quoted as two fragments) |
| 22 | Capacity −18%, passengers −13%, revenue −14% (KES 27bn) | "Revenue declined by 14% (KShs 27 billion) mainly driven by 13% decline in passenger numbers despite a 18% reduction in capacity"; ASKs 13,349m vs 16,227m | Matches. 188,495 − 161,473 = 27,022 |
| 23 | Gap covered ~92% if KES 122bn booked at face value | 122 / 132.065 = 0.924 | Arithmetic. Carrying value of the loans in KQ's books not checked |
| 24 | KES 167.15bn more than 2025 total income | 167.15 > 161.473 | Arithmetic |
| 25 | "before KQ has shown it can follow its 2024 profit with another" | 2024 profit 5,432; 2025 loss (17,163) | Matches for 2024-2025. Earlier years not checked; the line claims only that the latest two years were not both profitable |

## Half-year 2026 (open)

| # | Claim | Source | Status |
| --- | --- | --- | --- |
| 26 | Revenue about KES 81.2bn | tech-ish "KES 81.25 billion for the six months to 30 June 2026"; Kenyans.co.ke "Ksh81.2 billion in the first half of 2026" | Two publications agree. **Open**: primary PDF is a scanned image (run 38805092904) |
| 27 | Loss after tax about KES 16.1bn vs 12.2bn | tech-ish "KES 16.08 billion ... same period of 2025 was KES 12.15 billion"; Kenyans.co.ke "Ksh16.1 billion from Ksh12.2 billion" | Two agree. **Open** |
| 28 | Unaudited | tech-ish "They are unaudited." USE title "HALF-YEAR UNAUDITED FINANCIAL STATEMENTS" | Matches |
| — | Prior-year H1 revenue (not used) | tech-ish says KES 74.5bn; Kenyans.co.ke snippet shows "Ksh80.7 billion in the same period last year" | Conflict: **cut** |
| — | Operating loss KES 10.6bn (not used in text) | Kenyans.co.ke only | Cut |

## Treasury debt reports

| # | Claim | Exact text seen | Status |
| --- | --- | --- | --- |
| 29 | 2017 guarantee, US$525m, for "seven (7) aircrafts and one (1) engine"; PEFCO lender, backed by Exim Bank of the US, guaranteed by GoK; runs to FY2027/28 | APDMR FY2024/25 p. 54, s. 7.2 | Matches |
| 30 | Guarantee called in FY2021/22 "as a result of loan payment defaults" | Same, verbatim | Matches (Treasury's words, quoted and attributed) |
| 31 | Cabinet approved paying arrears and novating the balance; process concluded | Same: "The arrears have been paid and the novation process was concluded" | Matches |
| 32 | FY2024/25: KES 19.7bn principal | Same: "serviced guaranteed debt on behalf of Kenya Airways amounting to KSh 19.7 billion in principal repayment during FY 2024/25" | Matches |
| 33 | FY2022/23: KES 12.3bn = 10.6bn principal + 1.7bn interest | APDMR FY2022/23 (Parliament copy, OCR) pdf p. 99, s. 15.2: "Ksh 12,326.9 million ... principal repayment of Ksh 10,643.4 million and interest payment of Ksh. 1,683.5 million" | Matches; 10,643.4 + 1,683.5 = 12,326.9 |
| 34 | FY2023/24 not in reports read | Treasury URL for FY2023/24 returns 404; Parliament library item b89f4956 is the FY2022/23 report | Gap stated in the Receipt. Press (ch-aviation, Business Daily) report KES 17.4bn for nine months to March 2024; not used |
| 35 | At least KES 32.0bn in two years | 12,326.9 + 19,700 = 32,026.9 | Arithmetic |
| 36 | Local-bank guarantee KES 9.7bn at June 2025 | APDMR FY2024/25 p. 53, Table 16: "2017 Kenya Airways Guarantee (for Local Banks) MTC Trust & Corporate Services Limited ... 9,690" | Matches |
| — | APDMR FY2024/25 date 7 Oct 2025 | Parliament library "dc.date.issued 2025-10-07"; report itself says FY2024/25, no day seen | **Open** |
| — | APDMR FY2022/23 date 5 Oct 2023 | Parliament library "dc.date.issued 2023-10-05"; cover "SEPTEMBER 2023" | Matches the library record |

## Shareholding (open)

| # | Claim | Source | Status |
| --- | --- | --- | --- |
| 37 | Treasury 48.90%, KQ Lenders Co 2017 36.30%, KLM 7.76%, ESOP 2.44%, others 4.60% | The Star, 8 Apr 2026, quoting KQ's statement | Matches The Star. tech-ish also says "The government owns 48.9%" |
| 38 | Responding to a report of over 50%, which KQ called "not factual" | The Star: "... beyond the 50 per cent threshold is not factual," the airline said | Matches |
| — | Business Daily's report of a CMA filing showing 50.1% | Search result only, not opened | Not used as fact; **open** item in `verify` |

## Not used, and why

- **2017 debt-for-equity conversion (government stake 29.8% to 48.9%; banks 38.1%):** press only, and amounts conflict (KES 17bn, 22bn, 24.2bn, US$238m). Cut. Primary source would be KQ's 2017 circular or annual report.
- **Budget support allocations (FY2020/21 to FY2022/23):** press figures conflict (KES 20bn, 20.3bn, 26.6bn, 53.4bn). No Controller of Budget or budget document read. Cut.
- **Share price since 2017:** NSE pages render prices with JavaScript; no primary price reached. Cut.
- **Passenger number (4.6m) and H1 operating detail:** press only. Cut.
- **Disclosure:** `data/owner/holdings.json` does not exist in the repo; disclosure left as "[founder to confirm]".
