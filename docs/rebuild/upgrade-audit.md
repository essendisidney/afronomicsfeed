# Upgrade audit (U0)

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md`. No code changed. Figures come from read-only SQL on Supabase
`ugjpcybhqwvzidcbqpik` (run 22 Oct 2026, about 07:30 UTC) and from the code on `main` at 9883a4c.

Labels: **VERIFIED** = read from the database or code today. **ESTIMATED** = reasoned from a verified figure.
**ASSUMED** = a guess written down so evidence can replace it. **NOT VERIFIED** = could not be read from here.

## 1. Current numbers

| Measure | 22 Oct 2026 | Label | Brief said (13 Oct) | Note |
| --- | --- | --- | --- | --- |
| Visitor-days, last 7 days | 309 (523 views) | VERIFIED | "about 70 outside readers a week" | `page_views` sums daily visitors, so one person on 3 days counts 3 |
| …of which from the US | 174 | VERIFIED | — | Mostly our own GitHub Actions probes, site QA and crawlers (ASSUMED: all run from US data centres). Treat as not readers |
| Visitor-days outside the US | 135 | VERIFIED | — | Kenya 41, China 21, Netherlands 12, Sweden 11, Nigeria 9, South Africa 5, Ghana 5, others ≤4 |
| Returning views, last 7 days | 140 of 523 | VERIFIED | — | Same US caveat applies |
| Institutional pages, last 7 days | 8 visitor-days | VERIFIED | 16 (13 Oct) | `/pricing`, `/for-institutions`, `/data/frontier-local-debt`, `/markets/bonds`, `/data-api`, `/licensing` |
| Email subscribers (`subscribers`, active) | 5 | VERIFIED | 1 | None is a founder or Afronomics address |
| Newsletter rows (`newsletter_subscribers`) | 0 | VERIFIED | — | Older table, unused |
| Browser push subscriptions | 1 | VERIFIED | — | `af_push_subs` |
| Rate alerts confirmed | 0 | VERIFIED | — | |
| Telegram channel members | unknown | NOT VERIFIED | — | 21 items posted (`data/telegram_state.json`); the member count is only in Telegram |
| WhatsApp Channel | none exists | VERIFIED | — | No channel link anywhere in `app/`, `components/`, `lib/` |
| Pilot requests (`leads`) | 0 real (1 row, our smoke test) | VERIFIED | 0 | |
| API keys (`data_keys`) | 0 real (2 rows, both revoked smoke-test keys) | VERIFIED | 0 | Keys used in the last 7 days: 0 |
| Deals | 35 contacted, 35 prospect, 1 lost, 0 pilot, 0 won | VERIFIED | 21 contacted | Follow-ups due 21–22 Oct are held (founder: "Dont send anything") |
| Payments | 0 real (1 row, `status = 'test'`) | VERIFIED | 0 | USD 0 collected |
| Paid keys issued / subscriptions | 0 / 0 | VERIFIED | — | `paid_key_payments`, `paid_subscriptions` |
| Bond-alert subscribers | 0 | VERIFIED | — | `key_alert_prefs`; no live keys to subscribe |
| Outside citations logged | 0 | VERIFIED | — | No citation log exists; `citations` (0 rows) is an old documents table |
| Press contacts | 0 | VERIFIED | — | `af_press` has 0 rows |
| Corrections | 0 | VERIFIED | — | `lib/corrections.ts` empty; `af_corrections` 0 rows |

**What changed since the brief's figures.** Outreach grew from 21 to 35 contacted. Subscribers went from 1 to 5.
Everything downstream of outreach (pilots, keys, payments) is still 0. "About 70 outside readers a week" can't be
checked as written: the table counts visitor-days, not people, and over half of them are US traffic that is almost
certainly ours. The fairest honest figure is **about 135 non-US visitor-days a week** (ESTIMATED as readers).

## 2. Master plan v2 gaps (section 2 and the build list): what is still open

Checked in code and in the database.

| Item | Status | Evidence |
| --- | --- | --- |
| 1. Measured latency | **Built** | `data/latency.json` written by `scripts/latency.py`; `/data/frontier-local-debt` shows it; `/status#latency`. `af_seen.source_published_at` is still empty (40 rows), but latency now comes from the file |
| 2. Bond-result alerts for key holders | **Built, no users** | Migration 0037 applied (`af_bond_alert_*` functions exist); `app/api/send/bond-alerts`; unsubscribe route. 0 recipients because 0 live keys |
| 3. Paid access without the desk | **Built, untested by a real buyer** | `lib/billing/paidkey.ts`, migrations 0036 and 0039 applied (`af_paid_key_issue/mark/reveal`). Team keys expire at the paid period plus 3 days; Analyst gets a download key |
| 4. Free and paid lines coherent | **Partly done** | `/developers` now says commercial use, "including internal use at a fund, bank or firm", needs a key. The free window is 12 months (`lib/api.ts`, D-021). Not checked: whether `/licensing`, `/data-api` and the rate card say the same thing word for word (F1) |
| 4b. Real-time data for the paid key | **Open** | Open API is cached `s-maxage=300` (5 min); keyed requests are served uncached (`lib/api.ts`). So paid keys already get fresh data; the free path does not. Worth stating on `/pricing` |
| 5. Pilot day-7 / day-23 / day-30 emails | **Open** | No cron route or function; only the desk panel note (`app/desk/PilotsPanel.tsx`). Gate: first trial key |
| 6. Renewal reminders | **Open** | Subscription renewals extend keys when Paystack plan codes exist (`paidkey.ts`); there is no 7-day / 1-day reminder for one-off payments. Plan codes: NOT VERIFIED (env) |
| 7. USD invoice | **Open** | No `lib/billing/invoice.ts` or invoice page. Gate: an institution asks |
| 8. Dated per-auction bond pages beyond Kenya | **Open** | Only `app/markets/kenya-bonds/[date]`; `app/markets/bonds/[market]` has no `[date]` |
| 9. Sheets, Excel, Python client | **Open** | `/data-api` says "Excel, Google Sheets and SFTP delivery on the enterprise plan"; no `clients/` folder |
| Usage page for key holders | **Open** | No page shows a key holder their own usage |
| Webhooks | **Open** | None sent anywhere; the Startup licence copy still mentions one (master plan §2) |
| F5 Search Console and Bing | NOT VERIFIED | Founder's account |

## 3. Consumer tools: live, parked, and which already show a cheaper option

From `lib/tools.ts`, the pages and their components.

| Tool | Route | State | Shows a cheaper or better option today? |
| --- | --- | --- | --- |
| Is my rate fair? (Kenya) | `/rates/kenya/check` | Live | **Yes, partly**: compares the reader's rate with the best we hold and shows the gap (`FairRate.tsx`) |
| Is my rate fair? (Ghana, Nigeria) | `/rates/ghana/check`, `/rates/nigeria/check` | Live | Yes, partly (`CountryFairRate.tsx`) |
| Loan true cost | `/rates/kenya/loan-cost` | Live | No: shows the cost of one loan, no comparison |
| M-PESA and Fuliza charges | `/rates/kenya/mpesa-charges` | Live | No |
| Mobile loans | `/rates/kenya/mobile-loans` | Live (page) | Ranks the 3 products we hold by cost ("cheapest"), but not against the reader's own loan |
| Loan apps (reader reports) | `/rates/kenya/loan-apps` | Live | No; reports are unverified by design (legal review) |
| Money market funds | `/rates/kenya/money-market-funds`, `/best-money-market-fund` | Live | League table with the highest yield; not against the reader's fund |
| SACCOs | `/rates/kenya/saccos` | Live | No |
| Savings goal | `/rates/kenya/savings-goal` | Live | No |
| Debt plan | `/rates/kenya/debt-plan` | Live | No (orders the reader's own loans) |
| Net salary | `/rates/kenya/net-salary` | Live | Not applicable |
| Sending money home | `/rates/remittances` (was `/send-money`), `/diaspora` | Live | **Yes**: cheapest service per corridor (`DiasporaSendPicker.tsx`) |
| Chama planner | `/chama` | Live until end of October, then parked | Shows where the money earns most |
| T-bill calculator, IPO helper, Call it | `/markets/...` | Live | Not applicable |

So U2 has a head start on three tools (fair rate, remittances, mobile loans). The rest need the comparison written.

## 4. The data each phase needs, and whether we hold it

| Phase | Needs | Held? | Gap |
| --- | --- | --- | --- |
| U1 | Payments, keys, usage, Paystack plans | Tables yes; plan codes NOT VERIFIED | Invoice numbering and bank details (founder) |
| U2 | Comparable options per tool, with source and date | Bank averages (CBK, `data/kenya/rates.json`), MMF yields (`cma_mmf.json`, `mmf_history.json`), SACCO industry averages (SASRA 2025), mobile loans (3 rows), M-PESA tariffs, remittance corridors (World Bank RPW) | **SACCO loan rates are not held** (only dividends and deposit interest). Loan apps are reader reports, not published prices, so they can't be the "cheapest option" side. Mobile loans: only 3 products |
| U3 Poverty Premium (Kenya) | Borrowing: Fuliza/mobile loan vs bank/SACCO loan | Fuliza and mobile loans yes; bank lending average yes (CBK); SACCO loan rate **no** | SACCO loan rates |
| | Saving: bank savings vs MMF vs T-bill after tax | Yes (CBK averages, MMF, T-bills) | — |
| | Sending: cheapest vs average for USD 200 | Yes (`data/remittances/corridors.json`) | — |
| | Protection: deposit cover, bank vs SACCO | **No dataset.** Figures appear only inside the SACCO Receipt | KDIC cover limit and SASRA's deposit guarantee status need a primary-source file |
| U4 Sovereign Bill Index | Weekly index, release, method | Index and releases yes (`/markets/bill-index`, `editions/index/`) | No IOSCO-style method document, revision log or governance file |
| U4 Kenya Cost of Credit Index | Mobile loans, loan apps, CBK lending, SACCO loans | Partly | SACCO loan rates; loan apps are unverified reports (unsuitable for an index without a method decision) |
| U5 | SASRA and CBK figures per institution | Yes (`data/registry/`, Watch pack) | Peer table that ranks needs the named-institutions rule (section 5) |
| U6 | Morning WhatsApp text, auction data, press list | Text yes; press list **0 rows** | Press contacts; WhatsApp Channel (founder creates it; free) |
| U7 | Desk runs, logs | Desk exists (`/desk`, cockpit) | Per-desk mandate files and run logs |

## 5. The named-institutions conflict

Written up with every file and page involved in `docs/editorial/named-institutions.md`, with a proposed rule and
four questions for the founder. In short: `README.md`, `AFRONOMICS_BUILD_PLAN.md` and `BRIEF.md` say no public verdict
on a named institution; `RECEIPTS.md`, D-019 to D-027 and five live Receipts do the opposite.

## 6. Recommended order for U1 to U7

The audit's main finding: **the paid back half (U1) is mostly built and has never been used; what is missing is
people.** 0 pilots, 0 keys, 0 payments, about 135 non-US visitor-days a week, 8 on institutional pages.
So the order puts reach and the mission first, and leaves the rest of U1 behind the master plan's existing gates.

1. **U2 Shillings found** on the three tools that already compare (fair rate, remittances, mobile loans), then loan
   cost and M-PESA. It gives the site its repeatable line and a share card per result. Smallest new data need.
2. **U6 Get found**: dated bond pages for every market (master plan item 8), the WhatsApp Channel (founder creates
   it), `/press` and a citation log on the desk. This is the only phase aimed at the actual bottleneck.
3. **U3 Poverty Premium (Kenya v1)**, once a primary-source deposit-cover file and SACCO loan rates are added (or
   shipped with those lines marked as gaps). It's the strongest thing to pitch to newsrooms, so it feeds U6.
4. **U7 Desks**: mandate files and run logs. Mostly writing; it also gives the named-verdict count and right-of-reply
   log that section 5 needs.
5. **U4 Reference rates**: the Sovereign Bill Index method document first (the index exists); the Cost of Credit
   Index only after U3 settles the SACCO-loan and loan-app questions.
6. **U5 SACCOs and institutions**: after the named-institutions rule is approved, because the peer table ranks.
7. **U1 remainder** (pilot emails, renewal reminders, invoice, usage page, Sheets): each starts at the gate already in
   the master plan (first trial key, first payment, first invoice request). The renewal reminder should be ready
   before the first paid month ends.

## 7. What I could not verify

- Telegram members, Search Console and Bing status, and the Paystack plan codes (env values).
- Whether the US visitor-days include any real readers (no way to separate them in `page_views`).
- Whether `/licensing`, `/data-api` and the rate card match `/developers` word for word on internal use (not read
  line by line in this pass).
