# Source checks: Kenya's 2024 Eurobond buyback Receipt

Receipt: `content/receipts/2026-10-15-eurobond-buyback-2024.md` (status `draft`). Checked 15 October 2026.

Research note: in this session the web could be searched but pages could not be opened (the fetch tool and direct
downloads were blocked). Every "Matches" below therefore rests on a search-engine extract of the named document, or on
our own data files and arithmetic. A row is "Matches" only where a primary document's extract, or two independent
publications, gave the same figure. Everything else is "Unconfirmed" and is listed in the Receipt's `verify` list.

| Figure | Source / page | Status |
| --- | --- | --- |
| New bond: US$1.5bn 9.750% Amortising Notes due 2031 | Offering circular, RNS PDF 1867D_1-2024-2-14 (cover / terms) | Matches |
| Issue price 97.270% | Offering circular (terms); also Mwango Capital, Credendo | Matches |
| Interest from 16 Feb 2024, paid 16 Feb and 16 Aug, first 16 Aug 2024 | Offering circular (terms of the notes, interest) | Matches |
| Three US$500m instalments, 16 Feb 2029, 2030, 2031; weighted average life 6 years | Offering circular (redemption); Treasury via Capital FM | Matches |
| Yield 10.375% | Bloomberg (13 Feb 2024), BondbloX; Afronomics calculation from price, coupon and schedule gives 10.3751% | Matches (by our arithmetic and two reports); Treasury press statement not opened |
| Old bond: US$2bn 6.875% notes due 24 June 2024 | Offering circular (use of proceeds); Capital FM (maturity 24 June 2024) | Matches |
| Tender announced 7 February 2024 | Offering circular (use of proceeds) | Matches |
| US$1.48bn tendered, US$1.44bn accepted (cap raised from US$1.4bn), par plus accrued, settlement 21 Feb 2024 | BondbloX; Business Daily (US$1.44bn bought back) | Unconfirmed against the RNS result notice |
| Order book over US$6bn | Capital FM (13 Feb 2024), Khusoko; Bloomberg said over US$5bn | Unconfirmed (sources differ) |
| Balance US$560m paid June 2024, final interest US$19.25m, World Bank money | Business Daily citing CBK; US$560m × 6.875% / 2 = US$19.25m checks | Unconfirmed (funding and date differ in ABP FY2024/25 and other reports) |
| Remaining balance "about US$0.5bn" funded from government funds and multilateral, bilateral, syndicated loans | National Treasury, Annual Borrowing Plan FY2024/25 | Matches (search extract); publication date unconfirmed |
| KES 153.20 per US$ on 15 Feb 2024 | CBK Weekly Bulletin, 16 Feb 2024 (exchange-rate table) | Unconfirmed (search extract only) |
| Record low of about KES 161 in Feb 2024 | Business Daily | Unconfirmed |
| KES 129.94 per US$ on 8 Oct 2026 | CBK Weekly Bulletin, 9 Oct 2026 (search extract) | Unconfirmed against the PDF |
| 2031 Eurobond yield 8.0999% on 8 Oct 2026; 7.28% on 14 Aug 2026; chart points | `data/eurobonds.json` (CBK Weekly Bulletin Table 6) | Matches our data file; mapping of CBK's "2031" line to the 9.750% notes unconfirmed |
| Nigeria 8.747% Jan 2031 yield 7.233% on 14 Oct 2026 | `data/eurobonds.json` (Nigeria DMO) | Matches our data file |
| 2025: US$1.5bn 9.5% due 2036, order book over US$5bn | Kenya News Agency (27 Feb 2025) | Unconfirmed against Treasury release |
| 2025: US$579.69m of the US$900m 7.000% 2027 notes bought back | Republic of Kenya RNS "Result of Tender Offer - Replacement" (extract) | Matches (extract) |
| Oct 2025: 7.875% 2033 and 8.80% 2038, US$750m each; US$628.44m of 2028 notes bought back | Kenyan Wall Street; Mwango Capital | Unconfirmed against RNS |
| Feb 2026: US$900m 7.875% 2034, US$1.35bn 8.700% 2039 | Government Spokesperson (X); The Star; Kahawatungu | Matches (two reports) |
| Feb 2026: US$415.4m bought back (US$90.512m of 2028 notes) | RNS 26 Feb 2026 (2028 figure); Annual Borrowing Plan FY2026/27 (total) | Matches (extracts) |
| 2027 notes mature 22 May 2027, about US$320m left (900 − 579.69) | Arithmetic from the RNS; maturity date not opened | Unconfirmed |
| 2028 notes mature 28 Feb 2028, about US$281m left (1,000 − 628.44 − 90.512) | Arithmetic from reports; maturity date not opened | Unconfirmed |

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
