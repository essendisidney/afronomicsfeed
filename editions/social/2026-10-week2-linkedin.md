# LinkedIn: week of 19–23 October 2026 (AfronomicsFeed company page)

Drafts, not yet posted or scheduled. Each post is re-checked against the data on main on the morning it goes out; if a
figure has changed, the post is updated before it is sent. Figures below were computed from main as of 13 Oct 2026
(commit baaccc6); the comment under each draft names the file and value used.

| When (Nairobi) | Post | Data checked |
| --- | --- | --- |
| Mon 19 Oct, 07:25 | E. One rate decision in the next two weeks | data/mpc_calendar.json, data/policy_rates.json, data/policy_rate_history.json |
| Tue 20 Oct, 07:25 | F. How a Treasury bill pays you | data/kenya/tbill_auctions.json, content/explainers/learn-treasury-bills.md |
| Wed 21 Oct, 07:25 | G. Uganda's bond yields up about 2 points in four weeks | data/uganda/bond_auctions.json, data/uganda/tbill_auctions.json |
| Thu 22 Oct, 07:25 | H. A one-year loan to East Africa's governments | data/uganda/tbill_auctions.json, data/kenya/tbill_auctions.json, data/tanzania/tbill_auctions.json, data/policy_rates.json |
| Fri 23 Oct, 07:25 | I. Where KES 100,000 earns most | data/kenya/rates.json, data/kenya/tbill_auctions.json |

Notes for whoever posts:
- Wednesday is story day in DAILY.md, which normally publishes a brief first and links it. G is written to link the
  Uganda bond page instead; if a brief is published from it, swap the link for the brief URL with utm_campaign=story.
- Thursday's 18:13 T-bill result post comes from its own routine; H is the morning slot. Drop H if only one Thursday
  post is wanted.
- Friday's /pay invitation is required by DAILY.md, so I carries a second address in plain text.

---

## E. One rate decision in the next two weeks

One African central bank is due to set its policy rate between now and 2 November, on the calendars we can read:

• Malawi: 29 October. The Reserve Bank's Policy Rate is 24.00%.

After that:
• Ghana: 18 November (now 14.00%)
• South Africa: 19 November (7.25%)
• Mozambique: 25 November (9.25%)

Kenya (7 Oct) and Tanzania (8 Oct) have already met. Each bank's website prints the same rate as before the meeting: 8.75% and 6.25%.

Nigeria, Uganda, Egypt and Zambia do not yet publish a calendar Afronomics can read, so they are not on the list. Banks can move a date; each bank's own page is the authority.

https://www.afronomicsfeed.com/rates/policy?utm_source=linkedin&utm_medium=social&utm_campaign=daily#calendar

Information, not advice.

#CentralBanks #InterestRates #Africa #Afronomics

<!-- Figures (main, 13 Oct 2026):
- data/mpc_calendar.json (updated 2026-10-06): banks.malawi.meetings announce 2026-10-29 (RBM quote "decision will be
  announced on 29th October 2026"); ghana announce 2026-11-18; southafrica announce 2026-11-19; mozambique 2026-11-25;
  kenya start 2026-10-07; tanzania announce 2026-10-08. not_published: nigeria, uganda, egypt, zambia.
  Window 19 Oct to 2 Nov holds only Malawi.
- data/policy_rates.json (updated 2026-10-12T21:31Z): malawi 24.0 (printed "Mar 2026"), ghana 14.0, southafrica 7.25,
  mozambique 9.25, kenya 8.75 (printed "07/10/2026"), tanzania 6.25 (printed "4th Quarter 2026").
- data/policy_rate_history.json: first readings 2026-10-06 were kenya 8.75 (printed "11/08/2026") and tanzania 6.25
  (printed "3rd Quarter 2026"), so both rates read the same before and after their October meetings.
- Re-check on the morning: a new mpc_calendar entry inside 19 Oct to 2 Nov changes the first line. -->

---

## F. How a Treasury bill pays you

KSh 91,734.30 bought a KSh 100,000 one-year Treasury bill on 12 October.

That is how a T-bill pays: you pay less than its face value now and receive the full amount when it matures.

From the Central Bank of Kenya's auction (364-day bill, value date 12 Oct 2026):
• Price: KSh 91.7343 for every KSh 100
• Return a year later: KSh 8,265.70 before tax
• After 15% withholding tax: about KSh 7,026
• The CBK states this as 9.04% a year
• Minimum: KSh 50,000, bought directly through the CBK's DhowCSD portal or app

In Kiswahili, a Treasury bill is "hati ya hazina".

The four-minute lesson, with the tax and how to buy:
https://www.afronomicsfeed.com/explainers/learn-treasury-bills?utm_source=linkedin&utm_medium=social&utm_campaign=daily

Information, not advice.

#Kenya #TreasuryBills #PersonalFinance #Afronomics

<!-- Figures (main, 13 Oct 2026):
- data/kenya/tbill_auctions.json, row tenor 364, issue 2632, value_date 2026-10-12: price_per_100 91.7343,
  weighted_avg_rate 9.0352 (shown 9.04%). Source: CBK results PDF dated 12-10-2026.
  Cost of KSh 100,000 face = 91.7343 x 1,000 = KSh 91,734.30; return = 100,000 - 91,734.30 = KSh 8,265.70;
  after 15% tax = 8,265.70 x 0.85 = KSh 7,025.85 (about KSh 7,026).
- 15% withholding tax, KSh 50,000 minimum and DhowCSD: content/explainers/learn-treasury-bills.md, quoting CBK
  (centralbank.go.ke/securities, /dhowcsd). "hati ya hazina": glossary in app/learn/page.tsx.
- Re-check on the morning: if a newer 364-day result is on main (19 Oct), the lesson example still holds; update the
  date and figures only if switching to the newer auction. -->

---

## G. Uganda's bond yields up about 2 points in four weeks

Uganda's government paid about 2 percentage points more to borrow for 3, 10 and 20 years on 7 October than when it sold the same bonds on 9 September.

Bank of Uganda results, yield at the cut-off price:
• 3-year: 12.00% → 14.00% (+2.00 points)
• 10-year: 15.00% → 16.85% (+1.85)
• 20-year: 15.00% → 16.925% (+1.925)

The amounts changed too. On 9 Sep the Bank accepted UGX 620.1bn of the UGX 990bn offered, from UGX 2,075.1bn of bids. On 7 Oct it accepted UGX 1,039.1bn, from UGX 1,458.6bn of bids.

The one-year bill moved the same way: 11.50% on 1 Oct, from 11.00% on 3 Sep.

What to watch: the next sale of the 2-, 5-, 15- and 25-year bonds, last sold on 23 Sep at 12.00% to 16.25%.

Every Uganda bond auction, linked to the Bank of Uganda's notice:
https://www.afronomicsfeed.com/markets/bonds/uganda?utm_source=linkedin&utm_medium=social&utm_campaign=daily

Information, not advice.

#Uganda #Bonds #EastAfrica #Afronomics

<!-- Figures (main, 13 Oct 2026):
- data/uganda/bond_auctions.json (updated 2026-10-07), field "yield":
  2026-10-07: 3-year UG12G0609291 14.0; 10-year UG12K1405378 16.85; 20-year UG12L1608466 16.925.
  2026-09-09: same ISINs, 12.0; 15.0; 15.0. Changes +2.00, +1.85, +1.925 points (200, 185, 192.5 bp, matching the
  auction-week wrap and the /east-africa "what changed" lines).
  Offered 230,000 + 330,000 + 430,000 = UGX 990,000m on both dates.
  9 Sep: tendered 498,841.2 + 440,672.0 + 1,135,538.7 = 2,075,051.9m; accepted 249,041.2 + 266,022.0 + 105,003.7 = 620,066.9m.
  7 Oct: tendered 237,849.0 + 361,387.2 + 859,389.9 = 1,458,626.1m; accepted 210,491.0 + 228,244.2 + 600,389.9 = 1,039,125.1m.
  23 Sep (2/5/15/25-year): yields 12.0, 13.74, 15.25, 16.25.
- data/uganda/tbill_auctions.json, 364-day: value_date 2026-10-01 weighted_avg_rate 11.501; 2026-09-03 10.999.
- Caution: the 9 Sep and 23 Sep rows are marked read_by "ocr"; check them against the Bank of Uganda PDFs
  (Press_Release_Report_for_the_3_YR_10_YR_20_YR_T_Bonds_09_SEP_2026) before posting.
- Re-check on the morning: a Uganda bond auction on or after 14 Oct would add newer figures. -->

---

## H. A one-year loan to East Africa's governments

What does it pay to lend to an East African government for a year? The latest one-year Treasury bill auctions:

• Uganda: 11.50% (bills dated 1 Oct, Bank of Uganda)
• Kenya: 9.04% (12 Oct, Central Bank of Kenya)
• Tanzania: 6.28% (7 Oct, Bank of Tanzania)

Against about a month earlier: Uganda up 0.50 points (from 11.00% on 3 Sep), Kenya down 0.03 (9.07%, 14 Sep), Tanzania down 0.19 (6.47%, 9 Sep).

Policy rates: Kenya 8.75%, Tanzania 6.25%. The Bank of Uganda's rate is not yet readable as text on its website, so we leave it out rather than guess.

The rates are not measured the same way: Kenya and Tanzania publish a weighted average of accepted bids, Uganda the yield at the cut-off price.

Kenya, Uganda and Tanzania on one page, each figure linked to its notice:
https://www.afronomicsfeed.com/east-africa?utm_source=linkedin&utm_medium=social&utm_campaign=daily

Information, not advice.

#EastAfrica #TreasuryBills #InterestRates #Afronomics

<!-- Figures (main, 13 Oct 2026), as computed by lib/data/east-africa.ts for /east-africa:
- data/uganda/tbill_auctions.json, 364-day: 2026-10-01 weighted_avg_rate 11.501; 2026-09-03 10.999 (+0.502).
- data/kenya/tbill_auctions.json, 364-day: 2026-10-12 weighted_avg_rate 9.0352; 2026-09-14 9.0665 (-0.0313).
- data/tanzania/tbill_auctions.json, 364-day: 2026-10-07 weighted_avg_rate 6.2839; 2026-09-09 6.4735 (-0.1896).
- data/policy_rates.json: kenya 8.75, tanzania 6.25; "unread": uganda "not yet readable as text".
- Re-check on the morning: Kenya's 19 Oct result and any newer Uganda (about 14 Oct) or Tanzania (about 21 Oct) bill
  auction will replace these figures; recompute the month-earlier comparison the same way (newest result at least
  four weeks earlier). -->

---

## I. Where KES 100,000 earns most

KES 100,000 left for a year earns very different amounts depending on where it sits.

At the rates published now, before tax:
• Bank savings accounts, average: 3.54% (CBK, August), about KES 3,540
• Bank deposits, average: 6.91% (CBK, August)
• 91-day Treasury bill: 8.76% (CBK, 12 Oct)
• Money market funds, yearly yield as each manager publishes it: CIC 8.43%, Madison 10.41%, Kasha 10.76%

Fund yields are re-read every weekday and move; a bill's rate is set at its weekly auction.

Every rate, with the page it was read from:
https://www.afronomicsfeed.com/rates/kenya?utm_source=linkedin&utm_medium=social&utm_campaign=daily

Information, not advice.

What did you pay or earn this month? Add yours at afronomicsfeed.com/pay

#Kenya #Savings #MoneyMarketFunds #Afronomics

<!-- Figures (main, 13 Oct 2026):
- data/kenya/rates.json (updated 2026-10-12T21:31Z), bank_rates (CBK weighted averages), month 2026-08:
  savings 3.54, deposit 6.91. 100,000 x 3.54% = KES 3,540.
- data/kenya/rates.json money_market_funds (as_of 2026-10-12T21:31Z), effective_annual_yield: CIC 8.43,
  Madison 10.41, Kasha (Orient) 10.76. Etica 10.33 is a September average net of fees and Zimele 13.41 is a fixed
  income fund, so both are left out of the like-for-like list.
- data/kenya/tbill_auctions.json, 91-day, value_date 2026-10-12: weighted_avg_rate 8.7615 (8.76%).
- Re-check on the morning: fund yields are re-read every weekday; CBK September bank averages may land; Kenya's
  19 Oct 91-day result replaces 8.76%. -->
