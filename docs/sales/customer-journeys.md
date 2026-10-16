# Customer journeys, by segment

Written 13 Oct 2026 by the sales and marketing pass. Read with `playbook.md`, `sequences.md`, `sales-operator.md`,
the rate card (`lib/billing/ratecard.ts`, `lib/billing/plans.ts`) and `docs/strategy/master-plan-v2.md`. Where they
disagree, `docs/strategy/decision-log.md` wins. This file changes no price, page or database row.

**Where we start (VERIFIED in `master-plan-v2.md` §1 and D-013):** 24 institutions contacted on 12–13 Oct (21 logged
as `contacted` in `deals`), 0 pilot requests, 0 trial keys, 0 real payments. Every journey below has been walked by
nobody yet. The first real buyer will show which step breaks.

**State labels.** **EXISTS** = in the code on this branch (file given). **PARTIAL** = exists but manual or with a
known gap. **MISSING** = not built. **FOUNDER** = needs a founder decision or action, not code.

## 0. The events that prove each step

Every step below names the record that shows it happened. Only these count; an opened email or a "sounds good" on a
call is not a step.

| Signal | Where it is recorded | How to read it |
|---|---|---|
| Visit to a page (by referrer or `utm:` tag) | `page_views` (via `app/api/hit/route.ts`; links tagged `?utm_source=x&utm_campaign=y` are stored as referrer `utm:x/y`) | Desk funnel row "Visitors", "Institutional pages"; SQL in `docs/desk-operator.md` §1 |
| `pricing_cta_click` | `events_daily` (`lib/track.ts`; automatic on `/pricing`, `data-track` elsewhere, e.g. `components/layout/Header.tsx`, `app/markets/bonds/page.tsx`) | FunnelPanel "Moments that matter" |
| `pilot_form_start`, `pilot_form_submit` | `events_daily` (`components/billing/PilotForm.tsx`) | FunnelPanel |
| Pilot request | `leads` (interest `licensing`, source `pilot:…`) and a `deals` row at stage `pilot` (`app/api/pilot/route.ts`) | FunnelPanel "Pilot requests" |
| Trial key issued | `data_keys` with `plan = 'trial'`, `expires_at` (migration 0035) | FunnelPanel "Trial keys issued" |
| Key used | `data_key_usage` (calls per key, day and path) | FunnelPanel "Keys with calls"; per-key table with `calls_7d`, `last_day`, `paths_30d` |
| Bond alert delivered | `key_alert_sends` (migration 0037) | SQL only |
| `download_click`, `source_click` | `events_daily` | FunnelPanel |
| `enquiry` (invoice, licensing, research, sponsorship) | `events_daily` + `leads` (`components/ui/EnquiryForm.tsx`, `components/billing/InvoiceRequestForm.tsx`) | FunnelPanel "Pilot requests" counts licensing/pilot interest |
| `checkout_start` | `events_daily` (`components/billing/PaystackCheckout.tsx`) | FunnelPanel "Checkouts started" |
| Payment | `payments` with `status = 'success'` (`lib/billing/record.ts`) | FunnelPanel "Payments". **The only revenue.** |
| Access delivered | `payments.access_sent_at`; for Team and API the key outcome (`lib/billing/paidkey.ts`, migration 0036) | Desk; sale-watch routine |
| Recurring subscription | `paid_subscriptions` (only once `PAYSTACK_PLAN_*` codes are set; none set on 13 Oct, D-015) | Desk |
| Deal stage, next step | `deals` (`af_deal_save`, migration 0033); `won` needs `signed_at` | Desk deal log |
| `newsletter_signup`, `alert_signup` | `events_daily` | FunnelPanel |
| `survey_answer` / "pay for next" | `survey_answers`; pilot form's required FX / Eurobonds / Inflation answer in `leads.message` | FunnelPanel survey totals |

Missing everywhere: **no event for a sales email sent or replied to.** The sales operator logs each touch in
`deals.notes` (see `sales-operator.md`) until a touches table exists.

---

## (a) Global EM / frontier local-debt fund analyst or PM

Ninety One, Ashmore, William Blair, Global Evolution, Allan Gray (Africa ex-SA), TCX. Buys **Team and API, USD 1,500 a
month** (`data_team`) or **Analyst, USD 250 a user a month** (`analyst`). Always the USD list price (D-014 rule 5).

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | GBI-EM Edge puts about 44.5% of its weight on Africa (end-Sep 2026). The analyst must model local auctions in markets they did not cover before; today that is 13 browser tabs and PDFs | — | — | — |
| 2 | Where they find us | (i) The founder's pilot note (`docs/strategy/outreach-draft.md`), sent 12–13 Oct; (ii) LinkedIn company posts; (iii) search for "<market> bond auction results" | Email; `editions/social/DAILY.md`; `/markets/bonds/[market]` | PARTIAL: outreach sent; search ranks nowhere (`docs/strategy/seo-plan.md`, 0 of 27 queries) | `page_views` referrer `utm:linkedin/…` or search engine; deal stage `contacted` |
| 3 | First visit | Lands on the product page: coverage by Edge market with honest status, latest results, the latency line, source link per row | `/data/frontier-local-debt` (`app/data/frontier-local-debt/page.tsx`), `/data/frontier-local-debt/monitor` | EXISTS | Institutional visitors (FunnelPanel) |
| 4 | Proof they need | (1) Their markets are covered, with depth of history; (2) every row links to the issuer's notice; (3) how fast; (4) the fields match their model; (5) a sample in their own format | Coverage table and `source_click` links on the product page; `/status#latency` (`app/status/page.tsx`); `/data-api` field list; CSV of the latest 12 months free | PARTIAL: **no per-prospect coverage sheet or sample pack generator** (outreach-draft "Sample pack" is manual); latency shows only markets with ≥5 measured results | `source_click`, `download_click` |
| 5 | Pilot / try | Self-serve 30-day pilot form; key emailed at once to a work address; bond-result email alerts start automatically for the key's address | `/data/frontier-local-debt#pilot` (`components/billing/PilotForm.tsx` → `app/api/pilot/route.ts`); alerts `app/api/send/bond-alerts` (migration 0037) | EXISTS | `pilot_form_submit`; `leads`; `deals` stage `pilot`; `data_keys` trial; `data_key_usage`; `key_alert_sends` |
| 6 | Pilot nurture | Day 0 human welcome, day 3 usage tip, day 7 "what to try", day 20 usage + plan, day 30 close | `sequences.md` §1–5 | MISSING as automation (master plan item 5, gated on the first trial key). The sales operator sends them from Gmail meanwhile | Touch logged in `deals.notes`; `data_key_usage` days used |
| 7 | Internal approval | Analyst wants it; PM or head of data signs off. Vendor onboarding: W-8BEN-E or tax form, bank details on letterhead, security questionnaire, data-licence terms, sometimes a DPA. Budget: often calendar-year; Q4 is when 2027 data budgets close | Proposal (`templates/proposal.md`), order form (`templates/order-form.md`), licence summary `/licensing#terms` | PARTIAL: proposal and order form are templates now; **no signed standard licence text (F3), no security note, no vendor pack** | Deal stage `proposal`; `next_step` names the approver |
| 8 | Objections | "We have Bloomberg"; "you don't have Tunisia / Ghana bonds / Angola"; "Uganda only from Nov 2024"; "one-person vendor"; "can we use the free API?" | `playbook.md` §5 | EXISTS (answers) | Objection text in `deals.notes` |
| 9 | Ask for payment | Day 20–30: "Team and API is USD 1,500 a month; card now or invoice" | `sequences.md` §4–5 | EXISTS as template | Deal `next_step` "Payment asked" |
| 10 | Payment method | Paystack card or M-Pesa at checkout, charged as KES 193,500 at KES 129 (D-015); most global funds will want a **USD invoice and wire** | `/pricing#institutions` and `#invoice` (`components/billing/InvoiceRequestForm.tsx`); `/thank-you` | PARTIAL: checkout EXISTS; **USD invoice generator MISSING** (master plan item 7); USD card collection needs Paystack USD (F2) | `checkout_start`; `payments` `success`; invoice request = `enquiry` |
| 11 | Onboarding | Key issued automatically on a Team payment, shown once on `/thank-you`, emailed with the receipt, expires at end of paid period + 3 days (#109) | `lib/billing/paidkey.ts`, `lib/billing/record.ts` `teamStep`, `app/thank-you/page.tsx`; onboarding email `sequences.md` §6 | EXISTS (key); named-contact email is a template | `payments.access_sent_at`; key outcome `issued` |
| 12 | Renewal / expansion | No Paystack plan codes set, so nothing renews (D-015). Renewal email 10 days before; expansion to more users, Enterprise for several teams | `sequences.md` §7; invoice for month 2 | MISSING: renewal reminder (master plan item 6, gated on the first payment); `PAYSTACK_PLAN_DATA_TEAM` (F2) | Second `payments` row for the same email; `paid_subscriptions` |

## (b) DFI or programme officer

AfDB AFMI, FSD Africa, IFC / World Bank J-CAP, MFW4A, TDB, EADB, OMFIF/Absa AFMI. Buys **Team and API at the USD
list price** (DFIs never get the local price, D-014), **commissioned research** (from KES 400,000, about USD 3–15k,
`research` on the rate card) or, rarely, **Enterprise** if they redistribute to programme partners.

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | A local-currency bond-market programme needs cross-country evidence; a report, board paper or ToR needs auction data; a tender opens | — | — | — |
| 2 | Where they find us | AFMI was in the first outreach wave; partner list in `docs/strategy/partners-and-revenue.md` §2.6 and §2.9 (FSD Africa, AFMI, J-CAP ranked 1–3); citations in research; LinkedIn | Founder note; `/advisory` | PARTIAL: AFMI contacted; FSD Africa and J-CAP not yet (F7 approval) | Deal stage `contacted`; referrer |
| 3 | First visit | Product page, then the methodology and coverage; research pages | `/data/frontier-local-debt`, `/advisory`, `/for-institutions` | EXISTS | Institutional visitors |
| 4 | Proof they need | Source on every row; method; a citation they can put in a report ("Source: Afronomics"); comparability with the Kiel/Geneva African Debt Database; independence | `/data-api#terms`, `/developers#terms`; `/legal/terms` | PARTIAL: **no "How to cite" page, no ADD cross-walk, no capability statement** (`partners-and-revenue.md` Part 3) | `source_click` |
| 5 | Pilot / try | Same 30-day pilot key; for research, a 2-page "state of auctions" note for their markets | `/data/frontier-local-debt#pilot`; note drafted by hand | PARTIAL (note is manual) | `data_keys`, `data_key_usage` |
| 6 | Internal approval | Procurement rules: supplier registration, three quotes above a threshold, a ToR, sometimes a competitive tender; payment 30–60 days after invoice; fiscal year often Jan–Dec (AfDB) or Jul–Jun (World Bank) | Proposal + order form; supplier registration (FSD Africa: [contact in private file]) | MISSING: **supplier registrations, capability statement, signed licence (F3)** | Deal `next_step` names the procurement step |
| 7 | Objections | "We need a tender"; "we need a contract on our template"; "we can't pay by card"; "is this neutral?" | `playbook.md` §5 | EXISTS (answers) | — |
| 8 | Ask for payment | Quote in USD on the order form, by invoice | `templates/order-form.md` | PARTIAL (template, no invoice generator) | `deals` stage `proposal` |
| 9 | Payment method | Invoice and wire; PO number on the invoice | — | MISSING: invoice generator (master plan item 7). **No desk function records a wire or invoice payment** (`app/api/desk/route.ts` calls only `af_deal_save`, `af_api_key_create/revoke`, `af_payment_access` and editorial functions), so an invoiced sale never reaches `payments` or the funnel | Today: none. The founder confirms the wire; the deal moves to `won` with `signed_at`. Needs an `af_payment_record_manual` desk function (rank 2 below) |
| 10 | Onboarding | Key issued by the desk for an invoiced Team plan (`af_api_key_create`, plan `data_api`) — note this key has **no expiry**, so the desk must revoke at term end | `docs/desk-operator.md` §5 | PARTIAL | `data_keys`; `access_sent_at` |
| 11 | Renewal / expansion | Annual programme budgets; commissioned research → standing report (KES 25,000 a month) → Team | Renewal email; proposal | MISSING (reminder) | Second payment |

## (c) Data platform / redistributor

Tellimer, Stears, Daba, Cbonds (as a customer), EnterpriseAM, Mansa-type aggregators. Buys **Enterprise, from USD
5,000 a month** (redistribution is Enterprise only, D-016). **Always the founder.**

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | Their clients ask for African local auctions; they have monthly prices, not auction-level data | — | — | — |
| 2 | Where they find us | Founder's data-licence note (F7, not yet approved); conference; they see our tables cited | `docs/strategy/partners-and-revenue.md` §1.2 line 1 | FOUNDER: F7 | Deal stage `contacted`, product `enterprise` |
| 3 | First visit | `/data-api` (feed, fields, delivery), `/licensing#terms` (redistribution = Enterprise) | `app/data-api/page.tsx`, `app/licensing/page.tsx` | EXISTS | Institutional visitors |
| 4 | Proof they need | Coverage and history depth per market; field-by-field schema; update latency; uptime; a side-by-side for Uganda, Zambia and Côte d'Ivoire against what they have | `/status`, `/status#latency`, `/data-api` | PARTIAL: **no side-by-side sheet, no uptime/SLA figure, no bulk delivery (SFTP/Snowflake)** | — |
| 5 | Pilot / try | 30-day pilot key; a full-history bulk extract on request | Pilot form; bulk CSV via key | EXISTS (key); bulk is the keyed API | `data_keys`, `data_key_usage` |
| 6 | Internal approval | Product, legal and finance. Their licence template; redistribution scope (display only? derived data? clients' internal use?); attribution; termination and tail rights; liability cap; SLA | Order form with redistribution schedule (founder fills) | MISSING: **Enterprise licence and SLA text (F3)** | Deal stage `proposal` |
| 7 | Objections | Exclusivity; revenue share instead of a fee; liability; "we'll scrape the central banks ourselves" | `playbook.md` §5 | EXISTS (answers; all escalate) | — |
| 8 | Ask, payment | Founder quotes by scope from USD 5,000 a month; invoice, wire, annual or quarterly in advance | Order form | FOUNDER | `payments` |
| 9 | Onboarding | Several keys (desk-issued), custom delivery | `af_api_key_create` | PARTIAL | `data_keys` |
| 10 | Renewal | Annual contract, auto-renew clause, notice period | Contract | FOUNDER | — |

## (d) Kenyan pension fund, SACCO, insurer or bank treasury (local price)

Eligible only under `localInstitutionRule` (D-014): incorporated, headquartered, licensed and ultimately owned in
Kenya, users in Kenya, domestic book, no redistribution, invoiced to and paid from a Kenyan entity. Buys **Analyst
KES 16,000** (`analyst_ke`), **Team and API KES 95,000** (`data_team_ke`), or the KES products: **Investment Committee
Pack KES 12,000** (`pack`), **Pack with alerts KES 18,000** (`pack_plus`), **Treasury benchmarking KES 40,000 a
quarter** (`benchmarking`), **WhatsApp alerts KES 300** (`alerts_whatsapp`), auction bidding support KES 75,000,
training KES 200,000 a half-day.

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | The monthly investment committee needs a rates paper; the treasurer must justify where surplus cash sits; a CBK auction this week | — | — | — |
| 2 | Where they find us | Search for "Kenya T-bill rates", "best money market fund Kenya"; LinkedIn Friday posts; the Morning note; WhatsApp/Telegram shares; Mwango / Business Daily citations; KBA or FMA Kenya | `/markets/kenya-tbills`, `/rates/kenya`, `/morning`, `/subscribe`, `t.me/afronomic` | EXISTS (pages); PARTIAL (no partner citations yet) | Referrer, `newsletter_signup`, `share` |
| 3 | First visit | Rates page or the pack page | `/pack` (`app/pack/page.tsx`), `/pack/sample` (`app/pack/sample/route.ts`), `/licensing#local` | EXISTS | Visitors on `/pack`, `/licensing` |
| 4 | Proof they need | A sample pack; the source of every number; that it lands on the 1st; that it is not fund promotion (CIS Regulations 2023 concern, D-007) | `/pack/sample` | EXISTS (sample); FOUNDER: CIS legal check (F3) | `download_click` |
| 5 | Pilot / try | (i) Kenya desk trial KES 200 for 14 days of Pro by M-Pesa (`trial`); (ii) the 30-day data pilot with the local-price question on the form; (iii) single pack KES 1,000 (`pack_single`) | `/pricing` trial card; `/licensing#local-pilot`; `/pack` | EXISTS | `checkout_start` (`trial`, `pack_single`); `leads` message "Local-institution price asked for: Kenya" |
| 6 | Internal approval | Investment committee or ALCO minute; procurement asks for KRA PIN, eTIMS-compliant invoice, CR12/certificate of incorporation, sometimes a supplier form; SACCOs need board approval; budget year Jul–Jun for many schemes | Order form (local price); eligibility confirmation in writing | MISSING: **eTIMS invoice capability and KRA documents pack** (FOUNDER: confirm Afronomics' KRA PIN and eTIMS status before quoting to procurement) | Deal stage `proposal` |
| 7 | Objections | "CBK publishes it free"; "Cytonn sends a free PDF"; "is this a fund ad?"; "we can't pay by card" | `playbook.md` §5 | EXISTS (answers) | — |
| 8 | Ask for payment | After pilot or sample: the KES price, M-Pesa or invoice | `sequences.md` §5 | EXISTS as template | — |
| 9 | Payment method | Paystack in KES: M-Pesa (one payment up to KES 250,000; no recurring), card, Pesalink; or invoice | `/licensing#local-invoice`, checkout plans `analyst_ke`, `data_team_ke`, `pack`, `pack_plus` | EXISTS | `checkout_start`; `payments` `success` in KES |
| 10 | Onboarding | `data_team_ke` → key automatic (#109). Pack → reply with institution name and five addresses (`nextStep`), first pack in two working days | `lib/billing/record.ts` `nextStep` | PARTIAL: pack delivery is manual | `access_sent_at` |
| 11 | Renewal / expansion | M-Pesa cannot recur; each month is a new payment. Pack → Pack with alerts → Analyst; training session; benchmarking each quarter | Renewal email 10 days before | MISSING (renewal reminder, master plan item 6) | Repeat `payments` |

Other D-014 countries (Uganda, Nigeria, Egypt, WAEMU, etc.): the local price exists on the rate card but **no checkout
plan**; payment is "a fixed US-dollar equivalent by card through a payment link the desk sends, or by invoice"
(`localInstitutionPayment`). Creating a Paystack payment link is a Paystack setting: FOUNDER.

## (e) Fintech or investing app embedding widgets or data

Ndovu, Hisa, Daba, brokers, digital banks. Buys **Startup licence KES 7,500 a month** (`licence_startup`: one
product, users see charts and figures with attribution, no redistribution) or **Branded live-rates widget KES 40,000
a month** (`widget`). Redistribution to their own B2B clients is Enterprise.

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | Users ask "what's the T-bill rate?" in-app; the app launches a T-bill or MMF product | — | — | — |
| 2 | Where they find us | Free widgets and `/embed`; `/developers`; Africa Fintech Summit (Kigali, 18–20 Nov 2026); founder note (Ndovu ranked 12 in partners §2.9) | `/widgets`, `/developers`, `/embed` | EXISTS | Referrer from their domain on `/embed/*` (excluded from visitor counts; read `page_views` by path) |
| 3 | First visit | Free widget code; the open API | `app/widgets/page.tsx`, `app/developers/page.tsx` | EXISTS | `download_click` |
| 4 | Proof they need | Uptime; update speed; their branding; terms for showing data to their users | `/status`, `/developers#terms`, `/licensing#terms` | PARTIAL: no SLA figure | — |
| 5 | Pilot / try | Free widget on a staging page (the free widget *is* the demo); 30-day pilot key for the API | `/widgets`; pilot form | EXISTS | `data_keys`; widget loads on `/embed/*` |
| 6 | Internal approval | Product owner + compliance (CMA/CBK-licensed apps check data sources and disclaimers); finance for a monthly card | Order form | PARTIAL | Deal stage `proposal`, product `widget` |
| 7 | Objections | "Free widget is enough" (it carries our link; branded removes it); "we need a webhook" | `playbook.md` §5 | PARTIAL: **the Startup licence copy promises "an email or webhook on every new result"; no webhooks exist** (master plan §2 step 4). Offer email alerts only; webhooks escalate | — |
| 8 | Ask, payment | Checkout `licence_startup` or `widget` (KES, card or M-Pesa) | `/licensing`, `/widgets` | EXISTS (checkout) | `checkout_start`, `payments` |
| 9 | Onboarding | Reply with product / site and logo; desk sends licence letter or branded embed code within two working days (`nextStep`) | `lib/billing/record.ts` | PARTIAL: **manual; per-client widget theming not built; no licence letter text (F3)** | `access_sent_at` |
| 10 | Renewal / expansion | Monthly; widget → Startup licence → Enterprise if they serve B2B clients | Renewal email | MISSING (reminder) | Repeat `payments` |

## (f) Individual reader → Pro

Kenyan analysts, treasurers, students, journalists, diaspora investors. Buys **Pro KES 1,500 a month** (`pro`;
KES 15,000 a year on the rate card), **Team KES 6,000 for five seats** (`professional`), **Kenya desk trial KES 200
for 14 days** (`trial`), **WhatsApp alerts KES 300** (`alerts_whatsapp`). D-007: no consumer paywall; the Open tier
stays free. D-001: consumer tools parked. This journey is low priority until the institutional gate.

| # | Step | What happens | Page / email / asset | State | Event |
|---|---|---|---|---|---|
| 1 | Trigger | Auction day; a rates question; a money decision | — | — | — |
| 2 | Where they find us | Search; LinkedIn; WhatsApp/Telegram shares; the Morning | `/markets/kenya-tbills`, `/rates/kenya`, `t.me/afronomic` | EXISTS | Referrer, `share` |
| 3 | First visit | Free table or brief | Market and brief pages | EXISTS | Visitors |
| 4 | Proof | Daily habit: the free Morning and Weekly | `/subscribe` | EXISTS | `newsletter_signup` |
| 5 | Try | Free alerts; KES 200 trial | `/alerts`, `/pricing` | EXISTS | `alert_signup`; `checkout_start` (`trial`) |
| 6 | Approval | Own money, or an employer reimburses (receipt in the firm's name) | `/thank-you` aside | EXISTS | — |
| 7 | Objections | "Free is enough"; "I can follow CBK on X" | `playbook.md` §5 | EXISTS | — |
| 8 | Ask, payment | Paystack KES: M-Pesa, card | `/pricing#readers` | EXISTS | `checkout_start`, `payments` |
| 9 | Onboarding | `nextStep` default: "access is set up from this address within one business day" | `lib/billing/record.ts` | PARTIAL: **Pro access is granted by hand** | `access_sent_at` |
| 10 | Renewal | One-off unless `PAYSTACK_PLAN_PRO` is set; annual "two months off" is stated on `/pricing` but **there is no annual checkout plan** | `app/pricing/page.tsx` line ~364 | MISSING: annual Pro checkout; renewal reminder | Repeat `payments` |

---

## The biggest missing steps, ranked by revenue impact

Ranked by how much collected money each one blocks in the next 90 days. Items already on the master-plan build list
keep its gate.

| Rank | Missing step | Blocks | Files to build | Gate |
|---|---|---|---|---|
| 1 | **Pilot lifecycle emails with real usage** (day 3, 7, 20, 30) and a usage summary per key | Pilot → paid for segments (a), (b), (d): the D-004 decision | new `app/api/cron/pilots/route.ts`; migration for a nudge log (`pilot_nudges`: key id, step, sent_at); `lib/billing/pilot.ts` (step definitions); texts from `sequences.md` §1–5 | First trial key (master plan item 5). Until then the sales operator sends the same texts from Gmail |
| 2 | **USD invoice and order path**: numbered PDF invoice, bank details, PO field, logged against the deal; and a standard data-licence + pilot terms page | Every global fund and DFI that will not pay a KES card charge — most of (a), all of (b), (c) | new `lib/billing/invoice.ts`; `app/desk/` invoice form; a desk function `af_payment_record_manual` (new migration) so a paid invoice becomes a `payments` row with `status = 'success'` and channel `bank_transfer`; `app/licensing/page.tsx` (licence text section); `docs/sales/templates/order-form.md` as the source | First invoice request, or founder signs off licence text (F3) — master plan item 7 |
| 3 | **Renewal reminders** (10 and 1 days before a one-off period ends) and Paystack plan codes | Month 2 for every segment; with no plan codes nothing renews | new `app/api/cron/renewals/route.ts`; `lib/billing/record.ts`; founder sets `PAYSTACK_PLAN_ANALYST`, `_DATA_TEAM`, `_ANALYST_KE`, `_DATA_TEAM_KE` (F2) | First real payment (master plan item 6) |
| 4 | **Vendor pack**: one-page security note, data-handling note, W-8BEN-E/KRA PIN/eTIMS details, company documents, capability statement | Procurement step for (a), (b), (d) | new `app/for-institutions/vendor/page.tsx` or a PDF in `public/`; `docs/sales/templates/` | First procurement request (FOUNDER supplies the company facts) |
| 5 | **Per-prospect coverage sheet and sample pack generator** (their Edge markets: history depth, last result, latency, sample CSV) | Proof step for (a) and (c) | new `app/data/frontier-local-debt/coverage/[markets]/page.tsx` or a script `scripts/sample_pack.py` reading `/api/v1/bonds/*` | Build now: supports the 24 offers already sent (D-012 allows pilot-convincing work) |
| 6 | **Pilot extension function** (`af_trial_key_extend`): today an extension means a second key via `af_trial_key_issue` after the first expires, and the customer must swap keys | Smooth extension in the playbook's one allowed concession | new migration `0039_trial_key_extend.sql` (extend `expires_at` once by ≤15 days, logged) | Founder approves the extension rule (`playbook.md` §6) |
| 7 | **Webhooks or honest copy for the Startup licence** | (e) — the copy promises a webhook we don't send | either remove "or webhook" from `ratecard.ts` `licence_startup` and `record.ts` `nextStep` (founder approves wording), or build `app/api/send/webhooks` | Founder wording decision now; build only when a buyer asks |
| 8 | **Automatic access for Pro, Analyst and the Pack** | Time-to-value for (d), (f) | `lib/billing/record.ts` (next to tender and Team grants) | After the first such payment |
| 9 | **Dated per-auction bond pages for every market** | Inbound discovery for (a), (b) | `app/markets/bonds/[market]/[date]/page.tsx`, `app/sitemap.ts` | Master plan item 8 |
| 10 | **French WAEMU pages** with hreflang | Discovery for WAEMU and francophone buyers | `app/markets/bonds/waemu/…` French variants | `seo-plan.md` action 6 |
| 11 | **Touch log** for sales emails (sent, replied) | Measuring the sequences themselves | migration: `deal_touches` (deal id, at, channel, template id, direction) + `af_deal_touch` | When `deals.notes` (4,000 characters) fills up on any deal |
