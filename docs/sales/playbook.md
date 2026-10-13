# Sales playbook

Written 13 Oct 2026. For the founder and for the automated sales operator (`sales-operator.md`). Prices come only
from `lib/billing/ratecard.ts` and `lib/billing/plans.ts`; this file never sets one. Where it disagrees with
`docs/strategy/decision-log.md`, the decision log wins. Journeys are in `customer-journeys.md`, email texts in
`sequences.md`, paperwork in `templates/`.

**The rules behind every line here.** Collected money is a `payments` row with `status = 'success'`; nothing else is
revenue. Never claim a feature, a market or a speed the live site does not show that day. Information, not advice:
no view on where rates are going and no recommendation to buy or sell anything.

---

## 1. What we sell, in one table (from the rate card, 13 Oct 2026)

| Product | Price | How it is bought | Who |
|---|---|---|---|
| 30-day pilot | Free, 30 days (`institutionalPilot`) | Self-serve form, key emailed to a work address | Any institution |
| Analyst | **USD 250 a month per user** (charged KES 32,250 at KES 129, D-015) | Checkout `analyst`, or invoice | One analyst: web tables and full-history downloads. **No API key** |
| Team and API | **USD 1,500 a month** (charged KES 193,500) | Checkout `data_team` (key issued automatically), or invoice | A desk: API key, full history, T-bill result alerts, bond-result email alerts, usage reporting, named contact |
| Enterprise | **From USD 5,000 a month**, by scope | Invoice only. **Founder only** | Redistribution, several teams, custom delivery, service agreement |
| Local-institution Analyst / Team (D-014) | Kenya KES 16,000 / KES 95,000; other countries per `localInstitutionPrices` | Kenya: checkout `analyst_ke` / `data_team_ke`. Elsewhere: payment link or invoice (founder) | Eligible local institutions only (§6.3) |
| Investment Committee Pack | KES 12,000 a month; with alerts KES 18,000; single pack KES 1,000 | Checkout `pack`, `pack_plus`, `pack_single` | Kenyan SACCOs, pensions, insurers, treasuries |
| Treasury benchmarking | KES 40,000 a quarter | Checkout `benchmarking` | Kenyan treasuries |
| Auction bidding support / Training / Standing report / Commissioned research | KES 75,000 / KES 200,000 a half-day / KES 25,000 a month / from KES 400,000 | Enquiry, invoice | Kenyan SACCOs and MFIs; finance teams; DFIs |
| Startup licence | KES 7,500 a month | Checkout `licence_startup` | One startup product, with attribution, no redistribution |
| Branded widget | KES 40,000 a month | Checkout `widget` | Apps and sites |
| Bulk and AI training licence | Custom (USD) | Enquiry. **Founder only** | Model builders |
| Pro / Team (readers) | KES 1,500 a month (KES 15,000 a year) / KES 6,000 for five seats (KES 60,000 a year) | Checkout `pro`, `professional`; annual by invoice (no annual checkout plan) | Individuals |
| Kenya desk trial | KES 200 for 14 days of Pro | Checkout `trial` | A Kenyan desk testing before finance is involved |
| WhatsApp auction alerts | KES 300 a month | Checkout `alerts_whatsapp` | Kenya |
| Sponsorships, listings, jobs, rates breakfast | As on the rate card | Enquiry or checkout | Banks, fund managers, brokers |

**What is free (D-016, `dataTerms`):** reading the site; quoting with "Source: Afronomics" and a link; the API and CSV
for the latest 12 months, up to 100 rows a call, for research, journalism, teaching and non-commercial apps. **Any
internal use at a fund, bank, insurer, DFI or firm is commercial use and needs a pilot key or a paid licence.**
Redistribution is Enterprise only.

## 2. Qualification (short BANT, plus fit)

Ask only what the conversation needs. A deal is **qualified** when N, A and one of B or T are known; move it to stage
`qualified` and write the four answers in one line in `deals.notes`.

| | Question | Qualified when | Disqualify or park when |
|---|---|---|---|
| **N**eed | Which markets, and what do you do with the numbers (model inputs, committee papers, client research, an app)? | At least one market we cover with bond or bill data, and a weekly use | Only markets we don't cover (Tunisia, Angola, Ghana bonds, South Africa bonds): log the market as a product signal, park |
| **A**uthority | Who else decides, and who signs a data contract? | A named user and a named approver (can be the same person) | Nobody will use it weekly |
| **B**udget | Do you pay for data today, and is USD 250 / USD 1,500 a card purchase or a purchase order? | A data budget or a card limit that fits the plan | "We only use free data" and the use is non-commercial: point to the free tier, close as `lost` with reason |
| **T**iming | When does your budget year start; is there a deadline (Edge rebalancing, a committee, a report)? | A date within 90 days | No date in the next two quarters: park with a `next_date` |
| **Fit** | Will anyone outside your firm see the data or files built from it? Where are the users? Who owns the firm? | Internal use → Analyst / Team. Local eligible → local price | Redistribution → Enterprise (founder). Unclear ownership → founder before any local price |

## 3. Discovery questions, by segment

Pick three. Listen for the market list, the workflow and the approver.

- **Global EM fund (a).** Which African Edge markets do you hold or model? How do you get auction results today, and how
  long after the central bank publishes? What breaks in that process? Which fields do your models need (cut-off,
  weighted average, bid-to-cover, amounts, ISIN)? Who else on the desk would use a feed? Bloomberg or LSEG for prices
  — what do you not get from them for these markets?
- **DFI / programme (b).** What question is the programme trying to answer with auction data? Is this for a report, a
  dashboard or monitoring? Do you need to cite the source publicly? How does your procurement work below and above its
  threshold? Is there a ToR or tender we should know about?
- **Platform / redistributor (c).** Who are your clients and what do they ask for that you can't serve? Display only,
  derived data, or raw feed to clients? How do you license other data today (flat fee, revenue share)? What delivery
  (API, SFTP, Snowflake) and update frequency?
- **Kenyan institution (d).** What goes into your investment committee paper each month and who builds it? How long does
  it take? Do you bid at CBK auctions directly or through a bank? Who approves a KES 12,000 monthly subscription? Is
  the firm Kenyan-owned and are all users in Kenya (local-price eligibility)?
- **Fintech / app (e).** Where in the app would rates appear? How many users see them? Do you need our branding off?
  Who in compliance checks data sources? Any of your clients businesses (then redistribution questions apply)?
- **Reader (f).** What do you check every week? Would alerts the minute results print change anything for you?

## 4. Demo script: 5 minutes on the live site

Before the call: open each page and check today's numbers. Use the prospect's own market. If a page shows a market as
late or missing on `/status`, say so first.

| Time | Page | Say (in substance) | Show |
|---|---|---|---|
| 0:00–0:45 | `/data/frontier-local-debt` | "This is every African local-currency government auction we read, by Edge market, with honest status: what we have, from when, and what's missing." | The coverage table; the market they named; the gaps row (Tunisia, Angola, Ghana bonds) |
| 0:45–1:45 | `/markets/bonds/<their market>` | "Here is the latest auction: offered, bid, accepted, the rate, bid-to-cover, ISIN where published. Every row links to the issuer's own notice." | Click the source link: the central bank PDF opens |
| 1:45–2:30 | `/status#latency` | "This is how long after the issuer published that we had it, measured, by market." | Quote only the figures on the page; markets with fewer than 5 measured results say so |
| 2:30–3:30 | `/data-api` | "With your pilot key: full history, more than 100 rows, the same shape for every market." | The `curl` example with their market; the field list; `#terms` |
| 3:30–4:15 | `/data/frontier-local-debt/monitor` | "The monitor: the newest result in every market on one page. Key holders also get an email when a new bond result lands." | The monitor; mention bond-result emails (live since migration 0037) |
| 4:15–5:00 | `/pricing#institutions` | "Analyst is USD 250 a user, Team and API USD 1,500 a month, Enterprise from USD 5,000 for redistribution. The pilot is 30 days, free. Which markets should the key start with?" | The ladder; the pilot form. **The ask: start the pilot today, or agree the date to decide** |

Do not demo: anything parked (consumer tools, tenders), forecasts, the model in `data/strategy/model.json`, or
features that are not live (webhooks, Excel add-in, Python client, Sheets template, SFTP, Snowflake).

## 5. Objection handling: honest answers

Answer the question, give the fact, and ask one question back. If the honest answer is "we don't have that", say so
and log it in the deal as a product signal.

**"It's too expensive." / "Can you do better on price?"**
> "Team and API is USD 1,500 a month, about USD 18,000 a year. A terminal seat is roughly USD 22,000–32,000 a year
> (third-party estimates). If one user is enough, Analyst is USD 250 a month without the API. The price is the same
> for every desk; I can't change it, but I can check the pilot covers exactly the markets you need so you can judge
> it on use." *Any discount request → founder (§6.2).*

**"We already have Bloomberg / LSEG."**
> "Keep it for prices: we don't publish secondary prices or curves and won't. What we add is the primary-auction
> record for these markets in one format — offered, bid, accepted, cut-off, bid-to-cover per tenor, with the issuer's
> notice on every row and history back to 2004 for Egypt and 2013 for Nigeria. Where does your team get WAEMU or Uganda
> auction results today?"

**"You don't cover <market>." / "Your history is short."**
> Facts to give (check `/data/frontier-local-debt` first): bonds for Kenya (from 2010), Nigeria (from 2013), Egypt (from
> 2004), Uganda (from Nov 2024), Zambia and Morocco (from Dec 2025), and seven WAEMU issuers (from Sep 2022;
> Guinea-Bissau has no rows). Bills in ten markets plus WAEMU. **Not covered: Tunisia, Angola, Ghana bonds, South
> Africa bonds.**
> "We don't have <market> today. If it decides the purchase, tell me and I'll put it to the founder with your name on
> it; the pilot answers decide what we build next. I can't promise a date." *Never promise a build or a date.*

**"How good is the data?" / "What if it's wrong?"**
> "Every row links to the issuer's own notice, so you can check any figure in one click. Where a notice is ambiguous
> or a field is missing we leave it empty rather than guess (Zambia's older notices, for example). `/status` shows
> late or missing markets every day, and corrections are logged publicly. If you find an error, reply with the row and
> we fix it and tell you."

**"You're a small vendor. What if you disappear?"**
> "Fair question. We're small: one founder and automated readers that run every two hours. Three things limit your
> risk: it's monthly, so you're never more than a month committed; the source of every row is public, so nothing you've
> built on is a black box; and you can download the full history while licensed." *Do not offer escrow, source code,
> continuity terms or SLAs: founder.*

**"Can't we just use your free API?"**
> "For research, journalism or teaching, yes. Internal use at a fund, bank or firm is commercial use and needs a key —
> that's the same answer on `/developers#terms`, `/licensing` and `/data-api`. The free tier is also the latest 12
> months and 100 rows a call."

**"We need to go through procurement."**
> "Of course. What do they need from us — a W-8BEN-E or tax form, company documents, a security questionnaire, your
> contract template? I'll send what we have and get the rest to you by <date>. Meanwhile the pilot can start, so your
> team has a view when procurement asks." *Send the order form; anything on their paper → founder.*

**"Send me a contract / can you sign our MSA?"** → founder (§6.2). Reply: "I'll pass it to the founder, who handles
contracts; you'll hear back by <date + 2 working days>."

**"Do you have SOC 2 / a DPA / a security questionnaire answer?"**
> "We don't have SOC 2. We hold your contact details, the payment record and per-key call counts; API keys are stored
> only as a fingerprint, never in clear. I'll get the founder to answer your questionnaire." *Escalate; do not fill in a questionnaire.*

**"Can you add webhooks / Excel / Python / SFTP?"**
> "Not today. Key holders get an email when a new bond result lands; the API returns JSON and CSV. If it's a
> requirement, tell me how you'd use it and I'll put it to the founder." *Note: the Startup licence copy mentions
> webhooks; none exist yet. Do not confirm one.*

**Kenyan institution: "CBK publishes this for free." / "Cytonn sends us a PDF."**
> "It does — and we link to CBK on every row. What the pack adds is the comparison across ten markets, the yield
> curve and where the shilling earns most after tax, on four pages on the 1st with your institution on the cover. Here
> is a sample: `/pack/sample`."

**Kenyan institution: "Is this promoting a fund?"**
> "No. We rank money-market funds by yield after tax only and sell no fund. The pack is information, not advice." *Any
> question about the CIS Regulations 2023 → founder.*

## 6. Negotiation guardrails

These are what an automated agent may do on its own. **Everything not listed in 6.1 escalates.** The founder approves
this section before the sales operator acts on it (`sales-operator.md` §0).

### 6.1 The agent MAY, without the founder

1. **Quote any rate-card price exactly**, in the currency the rate card states, with the KES amount checkout will
   charge (D-015: USD list × 129). Never round, discount, bundle or "estimate" a price.
2. **Offer the free 30-day pilot** (`institutionalPilot.days = 30`) to any institution, through the self-serve form or a
   desk-issued key for a webmail address after confirming the organisation (`docs/desk-operator.md` §5). System
   limits stand: one live key per email, three trial keys per domain in 90 days.
3. **Offer one 15-day extension, once per organisation**, if the pilot key was used on **at least 5 distinct days**
   (`select count(distinct day) from data_key_usage where key_id = …`). *Proposed here; not yet on the rate card or in
   the decision log — founder approval required before first use.* Mechanism today: after the 30-day key expires,
   issue a new key with `af_trial_key_issue(…, p_days => 15)` and send it; the customer swaps keys. Log it in the deal.
4. **Annual billing, only where the rate card states an annual price:** Pro KES 15,000 a year and reader Team KES
   60,000 a year ("two months off", `/pricing`). There is no annual checkout plan, so an annual purchase needs an
   invoice: the agent quotes, the founder invoices. **The rate card states no annual price for Analyst, Team and API,
   Enterprise, the local-institution ladder, the Pack, licences or widgets** — the agent offers none (the 10× annual
   in `country-pricing.md` §3 is a proposal, not on the rate card).
5. **Local-institution price (D-014), only when the organisation confirms in writing all four of
   `localInstitutionRule`:** (1) incorporated, headquartered and licensed in the country, as a pension scheme or
   administrator, SACCO, bank, insurer, MFI, broker/dealer or local fund manager; (2) ultimate parent African and
   headquartered in the same country; (3) all users in that country, domestic book, no redistribution; (4) invoiced to
   and paid from a local entity and account. Kenya: send `/licensing#local` and the `analyst_ke` / `data_team_ke`
   checkout. **Never** for global or regional asset managers, sell-side desks (including Standard Bank and Absa CIB),
   DFIs, or subsidiaries of non-African groups. Any doubt → founder. Other countries → founder (payment link or invoice).
6. **Point a buyer to the cheaper fitting product on the rate card** (Analyst instead of Team; the Pack instead of
   Analyst for a Kenyan committee; the KES 200 desk trial; a KES 1,000 single pack).
7. **Send public material**: the latest-12-month CSV, `/pack/sample`, product pages, the order-form template filled with
   rate-card prices and standard terms (§7).
8. **Move a deal between `prospect`, `contacted`, `qualified`, `pilot`, `proposal` and `lost`**, with a reason.
9. **Mark `won`** only with `signed_at`: for a checkout purchase, the payment date of a `payments` row with
   `status = 'success'` (the checkout terms are the agreement — *founder to confirm this rule*); for an order form, the
   date the founder countersigned.

### 6.2 The agent MUST escalate to the founder (and say so to the customer)

| Topic | Examples | What the agent says |
|---|---|---|
| **Enterprise, always** | Several teams, custom delivery, service agreement, anything from USD 5,000 | "The founder handles Enterprise; you'll hear back by <date>." |
| **Any price not on the rate card** | Discounts of any size, "first month free", bundles, price matching, multi-year, a local price for an ineligible or unclear firm, non-Kenya local payment | "Prices are the same for every desk; I've asked the founder about your request." |
| **Free time beyond 6.1** | A second extension, a pilot over 45 days, free months after purchase | — |
| **Contract terms** | Their MSA or paper, payment terms (net 30/60/90), auto-renewal, notice periods, termination, governing law | — |
| **Liability and indemnity** | Caps, warranties of accuracy or completeness, indemnities, insurance certificates | Never accept any warranty of accuracy |
| **Service levels** | Uptime, latency or delivery guarantees, credits | Quote only the measured figure on `/status#latency`, as a fact, never a promise |
| **Exclusivity, MFN, non-compete** | "Don't sell to X", "lowest price guarantee" | — |
| **Redistribution and derived data** | Showing data to clients, reselling, files or feeds to third parties, AI training, index creation | Enterprise / bulk licence: founder |
| **Legal and compliance** | DPA, GDPR, Kenya Data Protection Act requests, CIS Regulations 2023, security questionnaires, SOC 2, sanctions or KYC questions | — |
| **Invoices and POs** | Issuing an invoice, accepting a PO, vendor registration forms, tax forms, bank details | Founder issues every invoice until `lib/billing/invoice.ts` exists |
| **Product promises** | A market, field, delivery format (webhook, Excel, SFTP) or date | "I can't promise a date; I've logged it with your name." |
| **Refunds, disputes, complaints, data corrections** | — | Corrections go to the desk log (`docs/desk-operator.md` §2) |
| **Key actions beyond issuing a trial** | Revoking, re-issuing a paid key, issuing a key with no expiry | — |
| **Partners, press, competitors, government** | Tellimer, Stears, Cbonds, Daba, journalists, regulators, central banks | — |
| **Anyone the founder has not approved to contact** | New cold contacts | Never contact (see `sales-operator.md` §4) |

## 7. Closing

### 7.1 Payment link or invoice?

| Buyer | Default | Why |
|---|---|---|
| Can pay by card or M-Pesa, plan has a checkout, amount ≤ KES 250,000 (M-Pesa limit) | **Checkout** on the plan's page: `/pricing#institutions` (`analyst`, `data_team`), `/licensing#local` (`analyst_ke`, `data_team_ke`), `/pack`, `/widgets`, `/licensing` (`licence_startup`) | Fastest; Team key is automatic |
| Global fund or DFI wanting USD, a PO, or bank transfer | **Invoice** (founder issues; `/pricing#invoice` records the request as a lead) | Paystack charges KES unless `PAYSTACK_CURRENCY=USD` (F2) |
| Local price outside Kenya | Payment link or invoice (founder) | No checkout plan exists |
| Enterprise, research, training, bulk | Invoice (founder) | Custom scope |

The agent sends the checkout link with the plan named, the price in the rate card's currency and the KES amount
charged. It never builds a Paystack link or changes a Paystack setting.

### 7.2 Purchase orders

1. Ask for the PO number, the billing entity's legal name and address, tax ID, and the accounts-payable email.
2. Record them in one line in `deals.notes` (no personal data beyond what the desk already holds), stage `proposal`,
   `next_step` "Founder: invoice against PO <number>", `next_date` tomorrow.
3. Escalate to the founder with the filled order form (`templates/order-form.md`). The founder signs, invoices and
   decides whether access starts on PO or on payment.
4. When the founder confirms the money is in, log the deal `won` with `signed_at`. Until a desk function records
   manual payments, an invoiced sale does not appear in `payments`: report it as **contracted**, and as collected only
   when the founder confirms the funds by date and amount.

### 7.3 Receipt and access

| Plan | What happens | Agent's job |
|---|---|---|
| Team and API (`data_team`, `data_team_ke`) | **Automatic (#109):** one key per payment reference, shown once on `/thank-you`, emailed with the receipt, valid to the end of the paid period + 3 days; a renewal payment by the same email extends it (`lib/billing/paidkey.ts`) | Check `access_sent_at` within 2 hours; if the outcome is `manual` or the email failed, escalate at once. Send the onboarding email (`sequences.md` §6) the same day |
| Analyst (`analyst`, `analyst_ke`) | Receipt confirms the seat; **the desk sends full-history downloads within one working day** (manual) | Escalate the delivery to the founder the same day; send onboarding email |
| Pack, Pack with alerts, single pack | Receipt asks for the institution name and up to five addresses; first pack within two working days (manual) | Chase the reply; pass details to the founder |
| Startup licence, widget, listings | Receipt asks for details; licence letter or embed code within two working days (manual) | Same. Do not promise a webhook |
| Pro, reader Team, trial, WhatsApp | Receipt; access set up by hand within a business day | Same |
| Invoiced plans | Founder issues the key (`af_api_key_create`, no expiry) and sets a revoke date | Put the term end in the deal's `next_date` |

### 7.4 After the close

- Deal `won` (with `signed_at`), `value_usd_month` only if the price was paid or signed, `next_step` "Onboarding check",
  `next_date` +7 days.
- Ask, at day 14, "who else on your team would use it?" (expansion), and at renewal minus 10 days send the renewal
  note (`sequences.md` §7).
- Never describe a pilot, a verbal yes or an invoice sent as a customer.
