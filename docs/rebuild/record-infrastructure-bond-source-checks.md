# Source checks: record infrastructure bond Receipt

Receipt: `content/receipts/2026-10-15-record-infrastructure-bond.md` (status `draft`). Checked 15 October 2026.

Network note: from the drafting environment, centralbank.go.ke and most publisher sites could not be opened directly
(DNS/proxy refusal). Figures marked **Matches** were checked against our own data files, whose rows carry the CBK
source URLs. Figures that rest only on web-search copies of a document are **Unconfirmed** and sit in the Receipt's
`verify` list.

| Figure in the Receipt | Source / row / page | Status |
| --- | --- | --- |
| IFB1/2024/8.5 value date 19 Feb 2024, maturity 9 Aug 2032, tenor 8.5 years | `data/kenya/bond_auctions.json`, row issue `IFB1/2024/008.5` (CBK results PDF 84469011) | Matches |
| Offered KES 70,000m; bids KES 288,661.86m; accepted KES 240,957.57m | Same row: `offered_total_kes_m`, `received_kes_m`, `accepted_kes_m` | Matches |
| Coupon 18.4607%; weighted average rate 18.4607%; price 100.0000 | Same row: `coupon`, `weighted_avg_rate`, `price_per_100` | Matches |
| Accepted figure is face value (vs cash raised) | CBK results PDF, not opened | Unconfirmed |
| "Three times" / "three and a half times what it asked for" | 288,661.86 / 70,000 = 4.12 bid; 240,957.57 / 70,000 = 3.44 accepted. Note the file's `bid_to_cover` of 1.2 is bids / accepted (288,661.86 / 240,957.57 = 1.198), not bids / offered | Matches (arithmetic) |
| Largest single-bond acceptance in our file; highest IFB rate in our file | `bond_auctions.json`, 390 rows from 2010-03-29; next largest IFB1/2023/007 KES 213,399.35m (2023-06-19); highest IFB rate by year shown in chart 1 | Matches our file; completeness of file Unconfirmed |
| Amortisation 20% on 15 Feb 2027, 30% on 11 Feb 2030, rest on 9 Aug 2032 | CBK prospectus 2087959385 (search copy only); Kingdom Securities pre-auction note reads it as 20/30/50 | Unconfirmed |
| Coupons twice a year, first 19 Aug 2024 | CBK prospectus (search copy only) | Unconfirmed |
| Holdings up to KES 1m per CSD account repaid in full at amortisation | CBK prospectus (search copy only); not used in the arithmetic | Unconfirmed |
| Tax: IFB exempt; 15% WHT under 10 years; 10% for 10 years and over | `lib/data/kenya-rates.ts` lines 36–39 (`WHT_INTEREST`, `WHT_LONG_BOND`) | Matches |
| Yearly coupon KES 44.48bn | 240,957.57m × 0.184607 = 44,482.45m | Matches (arithmetic) |
| Half-year coupon KES 22.24bn | 44,482.45m / 2 = 22,241.23m | Matches (arithmetic) |
| KES 35.59bn a year after Feb 2027; KES 22.24bn after Feb 2030 | 44,482.45m × 0.8 = 35,585.96m; × 0.5 = 22,241.23m | Matches arithmetic; schedule Unconfirmed |
| Lifetime coupons about KES 295.8bn | 6 × 22,241.23 + 6 × 17,792.98 + 5 × 11,120.61 = 133,447.36 + 106,757.89 + 55,603.07 = 295,808.32m (17 equal half-year coupons; 20/30/50 schedule) | Matches arithmetic; schedule Unconfirmed. If 30% is of the balance outstanding (20/24/56): about KES 302.5bn |
| Total paid out about KES 536.8bn | 295,808.32m + 240,957.57m = 536,765.89m | Matches (arithmetic) |
| Bullet comparison KES 378.1bn; saving about KES 82bn | 8.5 × 44,482.45m = 378,100.86m; 378,100.86 − 295,808.32 = 82,292.54m | Matches (arithmetic) |
| Taxable equivalent 21.72% | 18.4607 / 0.85 = 21.7185 | Matches (arithmetic) |
| No taxable bond above 18.77% since 2012 | `bond_auctions.json`, max non-IFB rate from 2012-03-01 is FXD1/2023/005 at 18.7697% (2024-01-15 and 2024-01-22); taxed bonds near 18.4%: FXD1/2024/003 18.3854% (Jan 2024) | Matches our file |
| 364-day bill 16.9188% on 19 Feb 2024 | `data/kenya/tbill_auctions.json`, tenor 364, issue 2492, value date 2024-02-19 | Matches |
| 364-day bill 9.0383% on 19 Oct 2026 (latest) | `tbill_auctions.json`, tenor 364, issue 2633, value date 2026-10-19 | Matches |
| Bank deposit average 10.32% (Feb 2024) | `data/kenya/rates.json`, `bank_rates.rows` month 2024-02, `deposit` (CBK weighted average rates) | Matches |
| After-tax per KES 100,000: 18,461; 14,381; 8,772; 7,683 | 18.4607%; 16.9188% × 0.85 = 14.381%; 10.32% × 0.85 = 8.772%; 9.0383% × 0.85 = 7.683% | Matches (arithmetic) |
| Gaps of 4.1 and 9.7 points | 18.4607 − 14.381 = 4.08; 18.4607 − 8.772 = 9.69 | Matches (arithmetic) |
| IFB1/2023/6.5: 17.9327% (13 Nov 2023), reopened 18.2989% (19 Aug 2024) | `bond_auctions.json`, rows 2023-11-13 primary and 2024-08-19 reopening | Matches |
| IFB1/2023/17 reopened 14.2806% (17 Feb 2025) | `bond_auctions.json`, row 2025-02-17 | Matches |
| IFB1/2018/15 reopened 12.9934% (18 Aug 2025) | `bond_auctions.json`, row 2025-08-18 | Matches |
| 17 Aug 2026 reopenings: 12.196%, 12.6877%, 13.052% | `bond_auctions.json`, rows 2026-08-17 (IFB1/2019/016, IFB1/2021/018, IFB1/2021/021) | Matches |
| KES 15.10bn a year lower at 12.196% | (18.4607 − 12.196) × 240,957.57m / 100 = 15,095.27m | Matches (arithmetic) |
| Chart 1: highest IFB rate by year, 2016–2026 | `bond_auctions.json`, max `weighted_avg_rate` over IFB primary, reopening and tap rows per year | Matches |
| New US$1.5bn Eurobond due 2031 at 10.375%; buyback of US$2bn bond due June 2024 | Mwango Capital (12 Feb 2024) and Credendo, read via search results only | Unconfirmed |
| Purpose of proceeds | CBK prospectus, not opened | Unconfirmed (not stated in Receipt beyond "infrastructure bond") |
| Disclosure | `data/owner/holdings.json` | Unconfirmed ([CONFIRM] placeholder) |
