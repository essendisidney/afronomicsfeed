# U3 plan: the Kenya Poverty Premium (for the founder's approval)

**Approved by the founder on 22 Oct 2026 ("approve U3, U4, U6 and U7 as recommended"; D-033): every decision at its recommended option.**

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U3, after the U0 audit (`upgrade-audit.md` §3, §4, §6). The
founder said "run U3 alongside too". A first version is built on branch `claude/upgrade-u3` (no pull request yet), so
the decisions in §7 can be made against a working page. Nothing is published until the founder approves.

## 1. What U3 is

A monthly, dated file and page, `/data/poverty-premium`, that sets the price of money for a low-income Kenyan against
the best option a better-off person can reach, for the same need: borrowing, saving, sending money, and protection.

House rules that shape it (UPGRADE §1 and §5, `README.md`, D-028):

- Code computes every figure (`lib/poverty-premium.ts`); no number is written by a model or from memory.
- Every figure carries its publisher, link, date, and the repository file and field it came from.
- A line we do not hold data for is published as a **gap**, empty, with what would fill it. It is never estimated.
- Categories, not verdicts on named companies (D-028). Product names appear only as factual published prices the site
  already shows (the M-PESA overdraft on `/rates/kenya/mpesa-charges`, the mobile loan on `/rates/kenya/mobile-loans`,
  the fund on `/rates/kenya/money-market-funds`). Remittance services are not named.
- An **average** (CBK's lending rate, the World Bank's corridor average) is labelled "an average, not a product".
- Information, not advice. No "switch", "move" or "you should".
- Lines are never added together (different needs, currencies and examples).

## 2. The lines, formulas and inputs

Household examples are decision B. Tax is Kenya's 15% withholding on interest (`WHT_INTEREST`, as
`lib/data/kenya-rates.ts`).

| Line | Low side | Best side | Formula | Input file and field | Source and date (Oct 2026 file) |
| --- | --- | --- | --- | --- | --- |
| **Borrowing: a week's overdraft** (KES 1,000, 7 days) | M-PESA overdraft (Fuliza) | Bank loan, industry average (benchmark) | overdraft = amount × access fee % + daily band fee × days; bank = amount × lending rate × days ÷ 365; premium = overdraft − bank | `data/kenya/mpesa_tariffs.json` `fuliza.access_fee_pct`, `fuliza.daily`; `data/kenya/rates.json` `bank_rates.rows[0].lending` | Safaricom tariff page, checked 15 Oct 2026; CBK weighted average rates, Aug 2026 |
| **Borrowing: a month's mobile loan** (KES 5,000, 30 days) | Mobile loan, lowest published charge we hold (overdraft excluded; on a tie a firm price beats a "from" price) | Bank loan, industry average (benchmark) | loan = amount × published charge % for its term; bank as above; premium = loan − bank | `data/kenya/mobile_loans.json` `rows[].pct`, `basis`, `days`; `rates.json` as above | Provider pages read 5 Oct 2026; CBK Aug 2026 |
| **Borrowing: a SACCO loan** | — | — | **Gap** | not held | — |
| **Saving: a year's savings** (KES 10,000, one year, after tax) | Bank savings account, industry average | 364-day Treasury bill (latest auction; minimum KES 50,000 face) | earnings = amount × gross rate × 0.85; premium = bill − savings | `rates.json` `bank_rates.rows[0].savings`; `data/kenya/tbill_auctions.json` `rows[tenor=364].weighted_avg_rate` (newest `value_date`) | CBK Aug 2026; CBK auction value date 19 Oct 2026 |
| *(shown beside, not in the premium)* | Money market funds: median and highest published yield, after tax | | yield × 0.85 | `rates.json` `money_market_funds.rows[].effective_annual_yield` | Each manager's page, read 21 Oct 2026 (one fund: Sept 2026 fact sheet) |
| **Sending money home** (USD 200, one send), one row per corridor into Kenya | Average service surveyed | Cheapest service surveyed | cost = 200 × cost %; premium = average − cheapest | `data/remittances/corridors.json` `corridors[dst=KEN].avg_cost_pct`, `.cheapest.cost_pct` | World Bank RPW, survey 2025 Q1 (flagged **old**: 579 days before 31 Oct 2026) |
| **Protection: deposit cover, bank saver vs SACCO saver** | — | — | **Gap** | not held | — |

### This month's file (2026-10, computed by the generator)

| Line | Low | Best | Premium |
| --- | --- | --- | --- |
| A week's overdraft, KES 1,000 | KES 52.00 (271.14% a year) | KES 2.75 (14.34%) | **KES 49.25** more |
| A month's mobile loan, KES 5,000 | KES 450 (109.5%) | KES 58.93 (14.34%) | **KES 391.07** more |
| A year's savings, KES 10,000 | KES 300.90 (3.01% after tax) | KES 768.26 (7.68%) | **KES 467.36** less earned |
| Money market funds, beside saving | median 8.80% (KES 879.75), highest 11.40% (KES 1,139.85) | | not in the premium |
| Sending USD 200 from the UK / US / Canada / South Africa / Rwanda / Tanzania | 4.44% / 5.2% / 7.28% / 10.45% / 17.72% / 58.17% | 1.57% / 0.27% / 2.17% / 4.38% / 4.16% / 8.22% | **USD 5.74 / 9.86 / 10.22 / 12.14 / 27.12 / 99.90** |
| SACCO loan; deposit cover | | | **gaps** |

## 3. The gaps

1. **SACCO loan rates.** We hold SASRA dividends and deposit interest, not what SACCOs charge borrowers. Would need
   loan rates published by SACCOs or SASRA, read from the primary page and dated. (Also blocks the U4 Cost of Credit
   Index.)
2. **Deposit cover, bank vs SACCO.** No dataset. The figures that appear in the SACCO Receipt text are **not** used.
   Would need a dated primary-source file: KDIC's published cover limit and the statement (law or SASRA) on what
   protects SACCO deposits.
3. **Remittance data is old.** Our reader holds the World Bank survey to 2025 Q1. The line is published with an "old
   data" label until `scripts/remittance_prices.py` picks up a newer quarter.
4. **M-PESA balance earns nothing**, which is the real alternative for many small savers, but no file says so; the
   saving line uses the bank savings average instead.
5. **Minimum deposits for money market funds** are not held, so funds are context only.

## 4. How it is built and refreshed

- `lib/poverty-premium.ts`: pure functions, no imports. `buildPremium(inputs, {month, generatedAt, amounts})` returns
  the file; `premiumCsv(file)` the CSV. Unit tests: `tests/site/test_poverty_premium.py` (each formula on hand-made
  inputs, tie-breaks, gaps never filled, missing bank data drops dependent lines, old-input flag, CSV, and every
  committed month adds up and names a source).
- `scripts/poverty_premium.mjs` (node with type stripping, no network) reads the data files and writes
  `data/kenya/poverty_premium/YYYY-MM.json` and `.csv`. **A month's file, once written, is kept**; `--force` rewrites
  it for a correction (logged at `/corrections`).
- `.github/workflows/poverty-premium.yml`: the 1st of each month, 07:41 Nairobi, runs the script and the tests and
  commits a new month (same commit-and-retry pattern as `remittances.yml`). Its inputs are refreshed by the existing
  workflows (`kenya_rates.py` for CBK averages and funds, `kenya-quick.yml` for bills, `remittances.yml`); the M-PESA
  and mobile-loan files are read by hand when a provider changes its page.
- `/data/poverty-premium` shows the latest file as written (it never recomputes), each figure's source and date, gaps,
  an "old data" label, the method section (`#method`), every month's CSV/Excel, and "Information, not advice."
- `/api/data/poverty-premium[?month=YYYY-MM][&format=xlsx]`: free CSV/Excel under the existing licence line.
- Added to `tests/site/pages.json` (site QA) and the sitemap. No schema change, no migration, no new data source.

Not done on this branch (each touches a file another phase is editing, or needs the founder): `/method#poverty-premium`
(U2 is editing `/method`), a Morning line on release day, the institutions pack sample, a link from `/data` and
`/rates/kenya`, Kiswahili.

## 5. Size

Small: built in one pass. Filling the two gaps is separate data work (two primary-source readers or hand-read files).

## 6. Checks run

`tsc`, `eslint` on changed files, `pytest tests/site tests/readers`, the new tests, `next build` with Supabase pointed
at a dead port, site QA (`--serve`), and screenshots at 390px and 1280px, light and dark.

## 7. Decisions for the founder

- **A. Name.** "The Kenya Poverty Premium" (recommended; it is UPGRADE's name), or a softer "The cost of being
  small"?
- **B. Household examples.** KES 1,000 for 7 days on the overdraft, KES 5,000 for 30 days on a mobile loan, KES 10,000
  saved for a year, USD 200 sent once (recommended: small, common amounts; USD 200 is the World Bank's own basis).
- **C. Publish with gaps.** Release now with the SACCO-loan and deposit-cover lines marked as gaps and the remittance
  line marked old (recommended), or wait for the two primary-source files?
- **D. Saving comparator.** The 364-day T-bill (recommended: the clearest "needs KES 50,000" barrier), or the median
  money market fund (open to small savers; would make it a knowledge gap rather than an access gap)?
- **E. A headline total.** None (recommended) until the gaps are filled; lines are different needs and currencies.
- **F. Kiswahili.** English first, `/sw` summary in the following month (recommended), or both at release?
- **G. Where it lives.** `/data/poverty-premium` as UPGRADE says (built), with `/method#poverty-premium` added after U2
  merges, and links from `/data` and `/rates/kenya`.
- **H. Monthly workflow.** Turn on the scheduled workflow with the merge (recommended), or regenerate by hand for the
  first three months.
