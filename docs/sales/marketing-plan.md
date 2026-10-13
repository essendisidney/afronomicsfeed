# Marketing plan: 90 days, 12 Oct 2026 – 10 Jan 2027

Written 13 Oct 2026. Read with `docs/strategy/master-plan-v2.md` (§6 metrics), `docs/strategy/decision-log.md`
(D-004, D-012, D-014, D-016), `docs/strategy/seo-plan.md`, `docs/strategy/partners-and-revenue.md`,
`editions/social/DAILY.md` and `customer-journeys.md`. It changes no page, price or routine; where it proposes a
change to a routine or a page, the founder approves it first.

## The one rule: the D-004 gate decides the plan

Marketing in these 90 days exists to get the D-004 test a fair run, then to convert what it produces. Weeks count
from Monday 12 Oct (first outreach).

| Checkpoint | Date | D-004 / D-016 target | If missed |
|---|---|---|---|
| Week 2 | Sun 25 Oct | 25 qualified contacts (24 sent; 21 logged), ≥5 replies | Founder names and sends the missing contacts (F4) |
| Week 4 | Sun 8 Nov | ≥3 pilot keys, ≥2 weekly users; D-016: ≥3 keys used on 5+ days within 30 days | **Kill rule**: no pilot after 25 contacts → switch the plan to the Kenyan institutions track (below) |
| Week 8 | Sun 6 Dec | ≥1 payment (`payments.status = 'success'`) | No payment after 3 used pilots → kill rule → Kenyan track |
| Week 12 | Sun 3 Jan | 2 list-price licences | Founder review |
| D-014 | 12 Dec (60 days) | ≥1 local-institution pilot request from Kenya, Uganda or Nigeria | Drop the local price sheet |

**What this plan never does before the gate opens:** paid ads, new consumer features (D-001), new datasets or markets
(D-012), cold email beyond the founder's approved list, events we host, or promotion of parked products.
**Cash spend: zero**, except conference travel the founder chooses to fund.

**Two tracks.** Track A (institutional, weeks 1–13 unless killed) sells the frontier local-debt data. Track B (Kenyan
institutions: Pack, local-price Analyst, WhatsApp alerts, training) runs at low volume from week 1 because it shares
content with Track A, and becomes the main track if the kill rule fires.

## Baseline (VERIFIED 13 Oct, `master-plan-v2.md` §1)

151 outside visitor-days a week, 16 on institutional pages; 0 pilot requests; 0 trial keys; 0 checkouts in 30 days;
0 payments; 0 of 27 high-intent search queries rank.

## Channels

Each channel has one weekly metric, read from data we already collect (`page_views` referrers and `utm:` tags,
`events_daily`, `leads`, `data_keys`, `data_key_usage`, `payments`), and a target. Targets are ASSUMED; the first four
weeks replace them with evidence.

### 1. Founder-approved direct outreach (the engine)

What: the pilot note (`docs/strategy/outreach-draft.md`) to named, qualified contacts; one follow-up after 7 working
days (scheduled 21–22 Oct), then stop. The sales operator runs the sequences only for people who reply or request a
pilot (`sales-operator.md`).

| Week | Move |
|---|---|
| 1–2 | Founder sends the Ninety One draft and names 1+ more contact to reach 25 (F4). Follow-ups 21–22 Oct |
| 3–4 | Reply handling; demos (`playbook.md` §4); pilots |
| 5–8 | Day-20 and day-30 sequences; proposals; invoices |
| 9–13 | Second wave only if the gate passed: founder names 15–25 more from the 45 `prospect` deals, same rules |

**Metric:** replies, pilot keys issued and keys with calls in 7 days (FunnelPanel). **Target:** 5 replies by week 2;
3 keys by week 4; 2 keys used on 5+ days by week 4; 1 payment by week 8.

### 2. LinkedIn company page (cadence exists — keep it, add one institutional slot)

What exists (`editions/social/DAILY.md`): a post each weekday about 07:25 Nairobi (Mon "Africa's money this week",
Tue a money lesson, Wed story day, Fri "What it costs you"), the Thursday T-bill result at 18:13 (own routine), the
Wednesday story engine (`docs/story-engine.md`), and the founder's personal-angle digest.

Proposed change (founder approves an edit to `DAILY.md`; no new routine):
- **Monday rotation gains one topic: "This week's African bond auctions"** — the newest result per market from
  `data/*/…auction*.json` (the monitor page), linking `/data/frontier-local-debt/monitor?utm_source=linkedin&utm_campaign=bonds`.
  Use it at least every other Monday.
- **Wednesday story: one in four on a bond market** (WAEMU in English, Egypt's depth, Nigeria's history, Uganda vs
  Kenya bid-to-cover), linking the market page with `utm_campaign=story`.
- **Never** a sales post on the company page; the product link sits under the data. No customer claims.
- Founder's personal profile: one post a week on the auction tape (the founder writes and posts; the digest supplies
  the figure).

**Metric:** visits tagged `utm:linkedin/*` to institutional pages (`/data/frontier-local-debt*`, `/markets/bonds*`,
`/pricing`, `/data-api`, `/licensing`) per week. **Target:** 10 a week by week 4, 25 by week 13 (baseline: not yet
measured — the first Monday report sets it).

### 3. Search (SEO)

What: `docs/strategy/seo-plan.md` actions, and master plan build item 8 (dated per-auction bond pages for every
market), which is "build now, after items 1–3" (all three shipped: latency, bond alerts, paid keys). Founder action
F5: submit the sitemap in Google Search Console and Bing.

| Week | Move |
|---|---|
| 1 | F5 Search Console and Bing submission (founder, 15 minutes) |
| 2–5 | Build item 8: `app/markets/bonds/[market]/[date]/page.tsx`, titles with date and main yield, in `app/sitemap.ts` (money sprint) |
| 4–8 | Title fixes from the seo-plan query map for Kenya bills and bonds (date and rates in titles) |
| 8–13 | French WAEMU pages with hreflang (seo-plan action 6) only if a francophone prospect or partner asks, or the gate passes |

**Metric:** search-engine visitors (referrer google/bing) to `/markets/bonds*` and `/data/frontier-local-debt*` per
week; Search Console impressions once F5 is done. **Target:** 5 a week by week 8, 30 by week 13; dated bond pages
indexed within 30 days of shipping.

### 4. WhatsApp and Telegram

What exists: the Telegram channel `t.me/afronomic` and bot (`app/api/telegram/route.ts`), share buttons with
WhatsApp and Telegram (`components/ui/ShareRow.tsx`), paid WhatsApp auction alerts KES 300 (`alerts_whatsapp`).
Audience: Kenyan treasurers, SACCO officers, analysts (Track B).

- Each CBK auction result (Thursday): the result card on the Telegram channel with a link to `/markets/kenya-tbills`
  tagged `utm_source=telegram&utm_campaign=tbill`.
- Once a month: the Investment Committee Pack sample (`/pack/sample`) on the channel, tagged `utm_campaign=pack`.
- No WhatsApp broadcast to anyone who has not paid or opted in; WhatsApp is sold, not pushed.

**Metric:** visits tagged `utm:telegram/*` plus referrer `t.me`/`web.whatsapp.com`; `alert_signup`; `alerts_whatsapp`
checkouts. **Target:** 20 visits a week by week 8; 3 paid WhatsApp alerts by week 13.

### 5. Our own email: the Morning and the Weekly

What exists: the free Morning note (weekdays) and the Weekly (Monday), `/subscribe`, `newsletter_signup`.

- One plain line in the Weekly, under the data: "Desks and funds: a 30-day pilot of the auction data, full history and
  API — afronomicsfeed.com/data/frontier-local-debt#pilot" tagged `utm_source=email&utm_campaign=weekly`. Founder
  approves the wording.
- No sponsorship sales until the list proves its size (rate card: KES 150,000 once past 2,000; F11).

**Metric:** `newsletter_signup` a week; visits tagged `utm:email/weekly`. **Target:** 25 sign-ups a week by week 8;
5 pilot-page visits a week from the Weekly.

### 6. Partner newsletters and media (no cash, credit and reach)

From `partners-and-revenue.md` §2.9 and `competitive-landscape.md` §4, **only after the founder approves each
partner (F7) and confirms the address on the partner's own site.** The founder sends; the operator drafts
(`sequences.md` §9).

| Week | Partner | Offer | Track |
|---|---|---|---|
| 2–3 | Business Daily markets desk | A clean CSV of each CBK print within an hour, credit "Source: Afronomics" | B (and A for Kenya bonds) |
| 2–3 | Mwango Capital | Co-branded weekly rates box, sponsor swap, no cash | B |
| 3–4 | AfDB AFMI, FSD Africa, IFC J-CAP | Free pilot key and a 2-page "state of auctions" note for their markets; FSD supplier registration | A (DFI) |
| 4–6 | Tellimer, Daba, Stears | Data-licence conversation: 30-day pilot key + side-by-side for Uganda, Zambia, Côte d'Ivoire (Enterprise, founder) | A (platforms) |
| 5–8 | EnterpriseAM (Egypt), Financial Afrik (WAEMU, French) | Auction summary for their newsletter with credit | A |
| 6–10 | Kiel/Geneva African Debt Database authors | Citation link-up: "ADD to 2024, Afronomics from 2024" | A (credibility) |

**Metric:** partner conversations started (deals with segment `media`/`research`/`dfi` moved to `contacted` with
founder approval) and referrer visits from partner domains. **Target:** 4 conversations by week 6; 1 recurring credit
or citation by week 13.

### 7. Conferences

| Event | Date | Move | Decision |
|---|---|---|---|
| AFSIC – Investing in Africa, London | 13–14 Oct 2026 | Missed this year; note 2027 dates | — |
| Africa Fintech Summit, Kigali | 18–20 Nov 2026 | Attend if the founder funds travel; pitch widget and Startup-licence pilots to apps (journey e); QR to `/widgets?utm_source=event&utm_campaign=afs2026` | Founder: go / no go by 30 Oct |
| LMA–ICMA Annual Africa Summit, Cape Town | 17–18 Mar 2027 | Ask now for a speaker or data-partner slot (founder email, week 3–4): "What 22,000 African auctions say about borrowing costs" | Founder approves the ask |
| Africa CEO Forum, Abidjan | 3–4 May 2027 | Outside 90 days; French note later | — |

**Metric:** meetings booked at or from an event; pilots tagged `utm:event/*`. **Target:** 5 meetings and 2 pilot
requests from Kigali if attended; a reply from LMA–ICMA by week 10.

### 8. Kenyan institutions (Track B; main track if the kill rule fires)

What exists: `/pack`, `/pack/sample`, `/licensing#local`, Kenya local prices, the KES 200 desk trial, benchmarking,
training (`playbook.md` §1). Moves: the Friday LinkedIn "What it costs you" post links the pack sample once a month;
Telegram monthly pack sample; Business Daily / Mwango credit; one free pilot training session offered to the KBA
Centre for Research or Strathmore (founder approves; `partners-and-revenue.md` line 4). If the kill rule fires (week 4
or 8): the founder names 25 Kenyan schemes, SACCOs and treasuries for a pack note, same D-004-style test (25 contacts,
3 trials, 1 payment in 8 weeks).

**Metric:** `/pack` visitors, `pack_single` / `pack` / `trial` checkouts, local-price questions on the pilot form.
**Target:** 1 Kenyan local-institution pilot or pack purchase by week 9 (D-014 test).

## The weekly scorecard (the sales operator's Friday report and the Monday growth report)

| # | Metric | Source | Baseline | Wk 4 | Wk 8 | Wk 13 |
|---|---|---|---|---|---|---|
| 1 | **Collected payments** (count, amount) | `payments` `success` | 0 | 0 | ≥1 | ≥2 list-price licences (by wk 12) |
| 2 | Qualified contacts sent (cumulative) | `deals` stage ≥ `contacted` | 21 logged / 24 sent | 25 | 25 (+ wave 2 if gate passed) | 40–50 |
| 3 | Pilot requests / keys issued (cumulative) | `leads`, `data_keys` trial | 0 / 0 | 3 / 3 | 6 / 5 | 10 / 8 |
| 4 | Keys used on 5+ days | `data_key_usage` | 0 | 2 | 3 | 5 |
| 5 | Institutional visitor-days a week | `page_views` | 16 | 40 | 60 | 80 |
| 6 | `pricing_cta_click` / `pilot_form_start` a week | `events_daily` | not yet counted | 10 / 3 | 15 / 5 | 25 / 8 |
| 7 | `checkout_start` a week | `events_daily` | 0 | 0–1 | 1–2 | 2–3 |
| 8 | Tagged visits by channel (`utm:linkedin`, `utm:email`, `utm:telegram`, `utm:event`, search) | `page_views` | — | read | read | read |
| 9 | "Pay for next" answers (FX / Eurobonds / Inflation) | pilot form, `survey_answers` | 0 | read | 3 of one kind = signal | — |

Collected, contracted, pipeline and model figures are reported on separate lines and never added together.
