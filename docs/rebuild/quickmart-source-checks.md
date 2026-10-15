# Quickmart Receipt: source checks

Done 15 Oct 2026 for `content/receipts/2026-10-14-quickmart-ipo.md`. Each figure was checked against the offer documents
published at ipo.quickmart.co.ke. Page numbers are the PDF page; the printed page number is two lower.

- **Information memorandum:** dated 2 October 2026, 261 pages, SHA-256 `85ebfab8…f8ed`.
- **Offer announcement:** SHA-256 `6613cacf…d4a5`.
- **Audited 2025 accounts:** a scanned PDF with no text layer (SHA-256 `4a6d2f57…f9f6`). The 2025 figures were
  checked against the memorandum's tables instead, which quote the Reporting Accountant's Report.

The text was extracted in GitHub Actions on the branch `rebuild/quickmart-sources`, which is never merged.

## Confirmed as written

| Claim in the Receipt | Memorandum | Page |
| --- | --- | --- |
| Revenue 2021–2025 and H1 2026 (25.68 … 50.43; 27.27 KES bn) | Revenue line, KES '000 | 119 |
| Profit 2021–2025 and H1 2026 (182.6 … 1,508.6; 872.8 KES m) | Profit for the year | 119 |
| Profit per KES 100 of sales 0.71 … 2.99, 3.20 | Net profit margin 0.7% … 3.0%, 3.2% | 120 |
| Growth 35.4%, 18.5%, 13.3%, 8.0% | Worked out from the revenue line | 119 |
| Payout 39%, 174%, 109% (2022, 2023, 2025) | Dividend payout ratio | 120 |
| KES 1.1 billion advanced to the shareholder in H1 2026 | Shareholders' Advance 1,100,000 | 120 |
| Equity KES 1.9 billion at 30 June 2026 | Total Equity 1,928,654 | 121 |
| Cash KES 700 million at 30 June 2026 | Cash at end of period 700,168 | 122 |
| Bank debt KES 6.8 million | "current borrowings were KES 6.8 million" | 152 |
| Trade payables KES 8.97 billion | Payables (8,974,115) | 134 |
| Working capital negative KES 4.0 billion | Net working capital (4,051,444) | 134 |
| Payable days 89 (2024), 101 (2025), 77 (June 2026) | Gross trade payable days | 125 |
| Lease principal KES 1.61 billion in 2025 | Lease repayments (1,614,290) | 125 |
| Net finance costs KES 1.28 billion in 2025 | Net finance charges (1,284,016) | 119 |
| Every store is leased | "all stores are leased rather than owned" | 67 |
| 18 stores leased from related parties, on arm's-length terms | Related Party Transactions | 150 |
| Consultancy contracts with founder-linked firms ended July 2026 | "terminated with effect from July 2026" | 150–151 |
| Offer costs KES 575.6 million, paid by the seller | Offer expenses | 38 |
| 2026 forecast: revenue KES 58.2 billion, profit KES 2.1 billion | Projected revenue 58,204,588; net income 2,102,803 | 32, 138 |
| Forecast dividend KES 0.50 a share, 6.7% | Projected FY 2026 dividend per share; yield | 33 |
| 72 stores in 16 counties | Store network after July–August 2026 openings | 63–65 |
| Minimum 500 shares (Capital FM's 550 was wrong) | Minimum application size, in multiples of 100 | 35 |
| 5% withholding on dividends for residents | Also applies to citizens of East African Community states | 141 |

## Corrected in the Receipt

| Was | Now | Memorandum |
| --- | --- | --- |
| 2024 dividend KES 1,200 million, 106% of profit | KES 1,176.5 million, 104% | p. 120 |
| 2022 and 2025 dividends rounded (106; 1,650) | 105.9; 1,647.1 | p. 120 |
| Four-year dividends KES 3,738 million, 111% | KES 3,711.8 million, 110% | p. 120 |
| Owners took out KES 370 million more than earned | About KES 344 million (3,711.8 less 3,368.0) | p. 119–120 |
| Suppliers had KES 4.70 for every KES 1 of equity | KES 4.65 (8,974 / 1,929) | p. 121, 134 |
| Store leases "usually 10 to 12 years" | 5 to 20 years, about 10.5 years on average when signed | p. 67 |

Also changed:
- The three charts and the tables now cite the information memorandum.
- The three secondary sources (Kenya Insights, Legesi, Mwango Capital) are dropped, because nothing cites them any more.

## Still open before publishing

- The disclosure line (the founder fills in `data/owner/holdings.json`).
- The legal read of every Opinion paragraph.
