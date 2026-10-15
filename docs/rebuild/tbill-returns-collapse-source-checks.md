# Source checks: T-bill returns collapse Receipt

Receipt: `content/receipts/2026-10-15-tbill-returns-collapse.md` (status `draft`). Checked 15 October 2026.

Network note: the drafting environment cannot open centralbank.go.ke, cmarcp.or.ke, kra.go.ke or kenyalaw.org
directly. Every primary document below was read through the Probe workflow (`.github/workflows/probe.yml`); the run
id is given for each. Rows from our own data files carry the CBK source URL of the PDF they were parsed from.

## Treasury bill rates and prices

| Figure in the Receipt | Source / row / page | How checked | Status |
| --- | --- | --- | --- |
| 364-day bill 16.9899%, value date 1 Apr 2024 (issue 2498); highest 364-day rate in our file since 1 Jan 2023 | `data/kenya/tbill_auctions.json`, tenor 364, issue 2498; CBK results PDF 234245447, section B: "364 - day 16.9899 16.9890 0.0009" | Probe run 38804453970 | Matches |
| Price 85.5115 per KES 100 (1 Apr 2024) | `tbill_auctions.json` row `price_per_100`; the PDF's price line was cut off in the printed text, so checked by the CBK formula 100 / (1 + 16.9899 × 364 / 36,500) = 85.5115 | Arithmetic | Matches (file + formula) |
| 91-day bill 16.7306%, value date 25 Mar 2024 (issue 2570), the 91-day peak since 2023; price 95.9958 | CBK results PDF 715918254: "Weighted Average Interest Rate of accepted bids 16.7306% 16.9137% 16.9890%"; "Price per Kshs 100 ... 95.9958 92.2223 85.5121" | Probe run 38804453970 | Matches |
| Today's auction (results signed "October 15, 2026"), bills dated 19 Oct 2026: 91-day 8.7500%, 364-day 9.0383%; prices 97.8651 and 91.7317 | CBK results PDF 1647758237: "Weighted Average Interest Rate of accepted bids 8.7500% 8.8600% 9.0383%"; "Price per Kshs 100 ... 97.8651 95.7691 91.7317" | Probe run 38804453970 | Matches |
| 91-day bids KES 49.8bn for KES 8bn offered; 364-day bids KES 6.6bn for KES 10bn | Same PDF: "Amount Offered 8,000.00 10,000.00 10,000.00"; "Bids Received 49,796.45 12,058.22 6,643.43" | Probe run 38804453970 | Matches |
| 364-day low 8.27% and 91-day 7.40% on 13 Apr 2026 | CBK results PDF 1981948736: "Weighted Average Interest Rate of accepted bids 7.4000% 7.8293% 8.2700%"; low checked over all rows from 1 Apr 2024 in `tbill_auctions.json` | Probe run 38804453970; file scan | Matches |
| Falls of 7.95 and 7.98 points | 16.9899 − 9.0383 = 7.9516; 16.7306 − 8.75 = 7.9806 | Arithmetic | Matches |
| Chart 1 points: 16.1 (1 Jan 2024), 16.9899 (1 Apr 2024), 16.9206 (5 Aug 2024), 12.4903 (2 Dec 2024), 10.0 (2 Jun 2025), 9.3759 (1 Dec 2025), 8.27 (13 Apr 2026), 9.0383 (19 Oct 2026) | `tbill_auctions.json`, tenor 364, first auction of each month shown (13 Apr 2026 for the low) | File; first, peak, low and last points also read in the CBK PDFs above | Matches (intermediate points from file only) |
| 2024: bids KES 1.95tn, accepted KES 1.51tn; 2026 to value date 19 Oct: bids KES 1.75tn, accepted KES 1.40tn | `tbill_auctions.json`, sums of `received_kes_m` and `accepted_kes_m` by value-date year: 2024 = 1,949,418 / 1,507,318; 2026 = 1,754,796 / 1,401,089 (KES m) | File | Matches our file; completeness of 2024 (159 rows) and 2026 (126 rows) not checked against CBK annual totals |

## Saver arithmetic (KES 500,000, one bill, 15% tax)

| Figure | Working | Status |
| --- | --- | --- |
| Apr 2024: repaid 584,717; interest 84,717; tax 12,708; kept 72,009 | 500,000 × 100 / 85.5115 = 584,716.68; × 0.15 = 12,707.50; × 0.85 = 72,009.17 | Matches (arithmetic) |
| Oct 2026: repaid 545,068; interest 45,068; tax 6,760; kept 38,308 | 500,000 × 100 / 91.7317 = 545,067.84; tax 6,760.18; kept 38,307.67 | Matches (arithmetic) |
| KES 33,702 less, 47%, about KES 2,800 a month | 72,009.17 − 38,307.67 = 33,701.50; / 72,009.17 = 46.8%; / 12 = 2,808 | Matches (arithmetic) |
| 91-day: kept 17,728 (Mar 2024) and 9,271 (Oct 2026) | 500,000 × 100 / 95.9958 − 500,000 = 20,856.12 × 0.85 = 17,727.70; 500,000 × 100 / 97.8651 − 500,000 = 10,907.36 × 0.85 = 9,271.26 | Matches (arithmetic) |
| Same convention as the site's calculator | `lib/tbill-calc.ts` `quoteBill` (mode "pay", price from the auction, `TBILL_WHT = 0.15`) | Matches |

## Withholding tax

| Claim | Source | How checked | Status |
| --- | --- | --- | --- |
| 15% withholding tax on bill interest (the discount) for residents | Income Tax Act, Third Schedule para 5 (kenyalaw, version 2026-07-01): "The resident withholding tax rates shall be– ... (b) in respect of interest, discount or original issue discount arising from– (i) bearer instrument other t[han] ... twenty-five per cent; (ii) Government *** of at least two years duration and other sources, fifteen per cent; (iii) bearer bonds with a maturity of ten years and above, ten per cent". Also `lib/data/kenya-rates.ts` `WHT_INTEREST = 0.15` and `lib/tbill-calc.ts` | Probe run 38804599645. KRA FAQ page returned 403 (run 38804478501); CBK T-bills page has a "With Tax?" calculator but no rate in text | Partly confirmed: the extraction is garbled ("***"); bills appear to fall under "other sources, fifteen per cent". In `verify` |

## Central Bank Rate and MPC statements

| Claim | Source / quote | How checked | Status |
| --- | --- | --- | --- |
| CBR raised to 13.00% on 6 Feb 2024 | CBK page: "The Monetary Policy Committee raised the Central Bank Rate (CBR) to 13.00 percent at its February 6, 2024 meeting." | Probe run 38804179441 | Matches |
| First cut, to 12.75%, on 6 Aug 2024; quote "a gradual easing of the monetary policy stance" | MPC press release 6 Aug 2024, p3: "...e for a gradual easing of the monetary policy stance, while ensuring continued exchange rate stability. Therefore, the Committee decided to lower the Central Bank Rate (CBR) to 12.75 percent." | Probe run 38804478501 | Matches (Receipt quotes only the words seen in the extract) |
| Quote "anchor inflationary expectations and contain exchange rate pressures" | Same release, p1: "The MPC reviewed the outcomes of its previous decisions and measures implemented to anchor inflationary expectations and contain exchange rate pressures." | Probe run 38804179441 | Matches |
| Quote "expected to lower the fiscal deficit from 5.6 percent of GDP in FY2023/24 to 4.3 percent of GDP in FY2024/25" | Same release, p2: "the FY2024/25 Supplementary Budget I, which is expected to lower the fiscal deficit from 5.6 percent of GDP in FY2023/24 to 4.3 percent of GDP in FY2024/25" | Probe run 38804179441 | Matches |
| Cut to 8.75% on 10 Feb 2026 | MPC press release 10 Feb 2026: "decided to lower the Central Bank Rate (CBR) by 25 basis points to 8.75 percent from 9.00 percent, during its meeting held on February 10, 2026" | Probe run 38804179441 | Matches |
| Held at 8.75% on 7 Oct 2026; quote "noted the ongoing implementation of the FY2026/27 Government Budget, and the planned fiscal consolidation strategy"; lending rates 17.2% (Nov 2024) and 14.4% (Sep 2026); next meeting December 2026 | MPC press release 7 Oct 2026: "decided to maintain the Central Bank Rate (CBR) at 8.75 percent"; "Average commercial banks' lending rates stood at 14.4 percent in September 2026 compared to 14.3 percent in August, and 17.2 percent in November 2024"; "The Committee will meet again in December 2026." | Read in probe run 38804155041 (dispatched by a parallel desk agent; the log prints this URL and the full text). Also CBK Weekly Bulletin 9 Oct 2026, run 38804179441 | Matches |
| 4.25-point cut | 13.00 − 8.75 | Arithmetic | Matches |
| "Treasury planned to borrow less" | Rests on the August 2024 deficit projection and the October 2026 "planned fiscal consolidation" quote above. Whether the deficit actually fell is not claimed | | Matches as worded (a plan, not an outcome) |

Note on run ids: run 38804179441 is the probe of the Feb 2024 page, the Aug 2024 and Feb 2026 releases and the
9 Oct 2026 bulletin (pages 1-2).

## Where savers went

| Figure | Source / quote | How checked | Status |
| --- | --- | --- | --- |
| MMFs KES 171bn on 30 Jun 2024, 67.4% of CIS assets | CMA CIS report Q2 2024: "Money Market Funds accounted for Kshs. 171 billion which makes up 67.4% of all the funds under management by Collective Investment Schemes for the quarter ended June 30"; total "254,059,658,387" | Probe run 38804545544 | Matches |
| MMFs KES 459.9bn on 30 Jun 2026 | `data/kenya/cma_mmf.json` `total_aum_kes` 459,874,570,485 (the report's MMF table total; rows sum to the same) | File, parsed from the CMA Q2 2026 PDF by `scripts/cma_mmf.py` | Matches our file. Like-for-like with the 2024 figure (dollar funds) in `verify` |
| All unit trusts KES 948.7bn on 30 Jun 2026 | CMA CIS report Q2 2026: "the total assets under management by the CIS amounted to Kshs. 948.7 billion, being an 11% increase from Kshs. 851.7 billion" | Probe run 38804184100 | Matches |
| About 2.7 times in two years | 459.87 / 171 = 2.69 | Arithmetic | Matches |
| MMF yield 10.35% (middle of five funds read 15 Oct 2026) | `data/kenya/mmf_history.json`, date 2026-10-15: 13.41, 10.37, 10.35 (Kasha Money Market Fund), 10.33, 8.43 effective annual yields, before fees and tax as published | File (read from managers' websites by our collector) | Matches our file; yields not re-read today |
| Kept KES 43,988 | 500,000 × 10.35% × 0.85 = 43,987.50 | Arithmetic | Matches |
| Bank deposits 6.91% (Aug 2026); kept KES 29,368 | `data/kenya/rates.json` `bank_rates.rows` month 2026-08 `deposit` 6.91; 500,000 × 6.91% × 0.85 = 29,367.50 | File | Matches |
| IFB1/2019/016 reopened 17 Aug 2026 at 12.196%, tax-free; KES 60,980 | `data/kenya/bond_auctions.json` row 2026-08-17 IFB1/2019/016 `weighted_avg_rate` 12.196 (CBK results PDF 1214594764); tax exemption checked in the record infrastructure bond Receipt's prospectus check; 500,000 × 12.196% = 60,980 | File; arithmetic | Matches our file |

## Other

| Item | Status |
| --- | --- |
| Calculator link `/markets/kenya-tbills/calculator` | Exists: `app/markets/kenya-tbills/calculator/page.tsx` |
| Disclosure | Unconfirmed ([founder to confirm] placeholder; in `verify`) |
| Cut: a claim that the Treasury's borrowing need actually fell | No primary figure found for actual borrowing; weekly bill offers in our file are not lower in 2026 (KES 24-28bn a week). Not stated |

## Checks run

- `python3 scripts/receipt_check.py`: 7 Receipts checked (including a parallel draft), 0 problems.
- `python3 -m pytest -q tests/site -k receipt`: 13 passed.
