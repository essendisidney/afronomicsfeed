# Source checks: Kenya's 2024 Eurobond buyback Receipt

Receipt: `content/receipts/2026-10-15-eurobond-buyback-2024.md` (status `draft`). Checked 15 October 2026.

Research note: the desk sandbox cannot open external sites, so the pages were fetched by the GitHub Actions Probe
workflow (`scripts/probe.py`) on 15 October 2026: job 116582308486 (Capital FM, Kenya News Agency, Business Daily,
BondbloX, CBK Weekly Bulletins of 16 Feb 2024 and 9 Oct 2026), job 116583570278 (offering circular pp. 1-6), job
116584539115 (offering circular pp. 7-80), job 116583602359 (Treasury press pages, Investegate 19WX list, Kenyan Wall
Street, The Star, Business Daily, ABP FY2024/25) and job 116584427285 (three Republic of Kenya tender-result RNS on
Investegate). Page numbers below are PDF page numbers. BondbloX and Kenyan Wall Street returned 403; the Treasury's
node/982 and node/1206 pages returned only their titles (the statements sit in linked files). "Unconfirmed" rows stay
in the Receipt's `verify` list.

| Figure | Source / page | Status |
| --- | --- | --- |
| New bond: US$1.5bn 9.750% Amortising Notes due 2031 | Offering circular, PDF p. 3 (cover) | Matches |
| Issue price 97.270% | Offering circular, PDF p. 3 ("Issue Price: 97.270%") | Matches |
| Interest from 16 Feb 2024, paid 16 Feb and 16 Aug, first 16 Aug 2024 | Offering circular, PDF p. 3 | Matches |
| Three US$500m instalments, 16 Feb 2029, 2030, 2031 | Offering circular, PDF p. 3; Capital FM (three equal instalments, weighted average life six years) | Matches |
| Offering circular dated 14 Feb 2024 | Offering circular, PDF p. 4 | Matches |
| Yield 10.375% | Afronomics calculation from price, coupon and schedule: 10.3751%. CBK Weekly Bulletin 16 Feb 2024 p. 1 says "a yield of 10.3 percent"; Capital FM quotes the Treasury at 10.4% | Matches (rounded figures in both sources are consistent); text now cites both |
| Old bond: US$2bn 6.875% notes due 2024 | Offering circular, PDF p. 48 (Use of Proceeds) | Matches |
| Old bond matures 24 June 2024 | Capital FM (13 Feb 2024): "matures on June 24, 2024"; Business Daily quote: balance "falling due on Monday" (24 June). Business Daily's own text says "maturing on June 14", which conflicts with its quote | Matches (Capital FM); Receipt body attributes the date to Capital FM |
| Tender announced 7 February 2024 | Offering circular, PDF p. 48 and p. 22 | Matches |
| US$1.44bn bought back | Business Daily (24 Jun 2024) | Matches |
| US$1.48bn tendered, par plus accrued, settlement 21 Feb 2024 | BondbloX (403 to probe); 2024 RNS not in Investegate's 19WX list | Unconfirmed; "at par" removed from the body, rest attributed to BondbloX |
| Order book over US$6bn | Capital FM (13 Feb 2024): "more than $6 billion (Sh957 billion)" | Matches; Bloomberg's "over US$5bn" not checked and removed from the body |
| Balance US$560m, final interest US$19.25m, part of a US$1.2bn World Bank loan, citing CBK | Business Daily, "Monday, June 24, 2024"; settled "on Friday" (21 Jun 2024). US$560m × 6.875% / 2 = US$19.25m checks | Matches; source date corrected 25 Jun -> 24 Jun 2024 |
| ABP FY2024/25: balance from government funds plus multilateral, bilateral, syndicated loans | National Treasury ABP FY2024/25 (23-page PDF opened; paragraph not reached by the probe pattern; no date shown) | Unconfirmed (earlier search extract only); date unconfirmed |
| KES 153.20 per US$ on 15 Feb 2024 | CBK Weekly Bulletin 16 Feb 2024, PDF p. 2, Table 1 (also p. 1) | Matches |
| KES 160.57 per US$ on 2 Feb 2024 | CBK Weekly Bulletin 16 Feb 2024, PDF p. 2, Table 1 | Matches; replaces Business Daily's "record low of about KES 161", which we could not open |
| KES 129.94 per US$ on 8 Oct 2026 | CBK Weekly Bulletin 9 Oct 2026, PDF p. 2, Table 1 (also p. 1) | Matches |
| 2031 Eurobond yield 8.0999% on 8 Oct 2026; 8.1248% on 2 Oct; 7.884% on 25 Sep | CBK Weekly Bulletin 9 Oct 2026, PDF p. 4, Table 6, column "6-Year 2031" | Matches. CBK's 2031 line is the six-year bond, the 9.750% notes (CBK 16 Feb 2024 p. 1 calls the new bond "six year") |
| Chart points 14 Aug to 18 Sep 2026 | `data/eurobonds.json` (earlier CBK Weekly Bulletins, Table 6) | Matches our data file |
| Nigeria 8.747% Jan 2031 yield 7.233% on 14 Oct 2026 | `data/eurobonds.json` (Nigeria DMO) | Matches our data file |
| 2025: US$1.5bn 9.5% amortising 2034-2036, order book over US$5bn | Kenya News Agency, "February 27, 2025" | Matches; RNS confirms US$1.5bn priced 26 Feb 2025 |
| 2025: US$579.69m of the US$900m 7.000% 2027 notes bought back | RNS "Result of Tender Offer - Replacement", 4 Mar 2025 (amended from US$576.69m); settlement 10 Mar 2025 | Matches |
| Oct 2025: US$1.5bn in two series priced 2 Oct 2025; US$628.439m of US$1bn 7.250% 2028 notes accepted | RNS "Result of Tender Offer", 10 Oct 2025; settlement 14 Oct 2025 | Matches |
| Oct 2025: US$750m each, 7.875% 2033 and 8.80% 2038 | Kenyan Wall Street (403 to probe) | Unconfirmed |
| Feb 2026: US$900m 7.875% 2034, US$1.35bn 8.700% 2039 | The Star, 20 Feb 2026; RNS 26 Feb 2026 (US$2.25bn priced 19 Feb 2026) | Matches |
| Feb 2026: US$90.512m of 2028 notes and US$324.842m of the US$1.2bn 8.000% 2032 notes, US$415.4m in all | RNS "Result of Tender Offer", 26 Feb 2026 (90.512 + 324.842 = 415.354) | Matches |
| 2027 notes: about US$320m left (900 - 579.69) | RNS 4 Mar 2025 | Matches; maturity 22 May 2027 unconfirmed |
| 2028 notes: about US$281m left (1,000 - 628.439 - 90.512 = 281.049) | RNS 10 Oct 2025 and 26 Feb 2026; The Star ("due in February 2028") | Matches; day of maturity (28 Feb 2028) unconfirmed |

## Arithmetic (Afronomics)

| Figure | Working |
| --- | --- |
| Extra interest a year on US$1.5bn | 1,500 × 9.75% = 146.25; 1,500 × 6.875% = 103.125; difference 43.125 (US$m) |
| Old bond's full yearly coupon | 2,000 × 6.875% = 137.5 (US$m) |
| Cash raised and discount | 1,500 × 0.9727 = 1,459.05; 1,500 − 1,459.05 = 40.95 (US$m), before fees |
| Extra interest in shillings | 43.125 × 153.20 = 6,606.75 (KES m); 43.125 × 129.94 = 5,603.66 (KES m) |
| Lifetime coupons | 146.25 × 5 + 97.5 + 48.75 = 877.5 (US$m); × 129.94 = 114,022 (KES m) |
| Semi-annual coupon | 1,500 × 9.75% / 2 = 73.125 (US$m) |
| Yield at issue | Semi-annual cash flows per 100 face, three 33.33 instalments at years 5, 6, 7, solved for price 97.27: 10.3751% |
| Yield fall since issue | 10.375 − 8.0999 = 2.28 points |
