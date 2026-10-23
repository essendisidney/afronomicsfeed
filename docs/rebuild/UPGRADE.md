# Afronomics upgrade: from a data engine nobody sees to the reference everyone quotes

For Claude Code, in the `essendisidney/afronomicsfeed` repository. Put this file at `docs/rebuild/UPGRADE.md`.
Written 22 Oct 2026. Read it with `README.md`, `OPERATIONS.md`, `AFRONOMICS_BUILD_PLAN.md`,
`docs/rebuild/BRIEF.md`, `docs/rebuild/RECEIPTS.md`, `docs/strategy/decision-log.md`,
`docs/strategy/master-plan-v2.md`, `docs/strategy/usd-1m-plan.md` and `AGENTS.md` before writing any code.
Where this file and the decision log disagree, stop and ask the founder; do not pick one yourself.

## 0. Why this upgrade exists

The engine is ahead of the business. As of the last verified counts (13 Oct 2026, `master-plan-v2.md`):

- Bills in 10 markets, bonds in 13 issuers, Kenya rates, MMF history, the registry, the forecast ledger, Receipts,
  the Morning in two languages, Watch packs, Paystack live.
- About 70 outside readers a week, 1 newsletter subscriber, USD 0 collected, 0 pilots.
- The paid key buys almost nothing the free API does not give. Paid data access is issued by hand. Nothing renews.
- `usd-1m-plan.md` already shows the debt wedge tops out near USD 2–3m a year in any scenario.

So the upgrade adds almost no new breadth. It does five things:

1. **Make paying worth it and automatic** (the back half of the revenue path).
2. **Give the site one mission people can repeat:** nobody should pay more for money because they have less of it.
   Measure it as "shillings found": the difference between what a reader pays and the cheapest option we can show,
   worked out by code.
3. **Turn the data into reference rates** others cite and license (the Sovereign Bill Index and a new Kenya Cost of
   Credit Index), with published methods.
4. **Get found:** WhatsApp, newsrooms, widgets, search, share cards.
5. **Run it as agent desks** with written mandates, checks and logs, so people can be added later by handing them
   an existing desk.

Re-check every figure above against the database and code (read-only) before you rely on it, and report what
changed.

## 1. Rules that do not change

Everything in `README.md` "The honesty rules", `BRIEF.md` section 2 and `RECEIPTS.md` section 2 stands. In short:

- Every figure shows its source, a link and an as-of date. Code does the arithmetic; a model never produces a number
  a reader sees.
- `data/` is append-only. Corrections are new rows and are logged in `lib/corrections.ts`.
- Information, not advice: no buy, sell, hold, subscribe or switch instructions. "Shillings found" shows a
  difference; it never tells a reader to move their money.
- Never invent a person, a quote, a customer, a testimonial or a statistic.
- Least cost first: use what is already paid for (Vercel, Supabase, GitHub Actions, Resend, Paystack). No new paid
  service, plan upgrade or domain purchase without the founder's written yes.
- Release routine from `OPERATIONS.md`: plan, founder approval, branch, checks, screenshots at 390px and 1280px in
  light and dark, pull request, squash-merge only with approval (D-005). Never push to `main`, never alter
  production data except through the existing secret-gated functions, never deploy by hand.

## 2. One rule for named institutions (resolve first)

The repository currently says two different things. `README.md` and `AFRONOMICS_BUILD_PLAN.md` say "no verdict on a
named institution in public". `RECEIPTS.md`, D-019 to D-027 and the live site publish verdicts naming Safaricom,
Kenya Airways, KCB, Equity, Co-op Bank, Quickmart and Dangote. `RECEIPTS.md` says no human approves a Receipt; D-019
says each named-company verdict needs a founder tap until the first 30 run cleanly.

Before any other phase, write `docs/editorial/named-institutions.md` as a proposal for the founder, with one rule
that every file then points to. Recommend this, and let the founder change it:

- Data, sector-level and government-borrowing Receipts: fully autonomous behind the confirming agent.
- A verdict naming a company, institution or person: the confirming agent checks it, then it waits for the founder's
  one-tap approval on `/desk`, until 30 such Receipts have run with no correction. The count shows on the desk.
- Named-company Receipts send the subject the claims and a right of reply (3 working days by default) through
  `desk@`, logged on the desk. Breaking events can publish the facts-only part first.
- A live public offer, or anything in litigation, needs an advocate's read; a founder waiver is logged as its own
  decision, as D-020 and D-022 did.
- Ratings or scores of named institutions (Phase U5) follow the same gate, and the methodology is public before the
  first score is.

Update `README.md`, `AFRONOMICS_BUILD_PLAN.md` and `RECEIPTS.md` to point to that file once the founder approves it,
and add the decision to `decision-log.md`.

## 3. Phases

Each phase starts with `docs/rebuild/upgrade-UN-plan.md` and stops for approval. Keep each pull request to one phase.

### U0. Audit (no code)

Produce `docs/rebuild/upgrade-audit.md`:

- Verified current numbers: readers, returning readers, subscribers (email, push, Telegram), pilots, keys, deals,
  payments, from the database (read-only SQL) and `page_views`. Label everything VERIFIED, ESTIMATED or ASSUMED.
- Which master-plan v2 gaps (section 2 table) are still open, checked in code.
- Which consumer tools are live, parked or redirecting, and which of them already compute a "cheaper option".
- The data each phase below needs, and whether we already hold it with a source and date. Mark gaps as gaps; never
  fill them with estimates.
- The named-institutions conflict in section 2, with every file and page involved.

### U1. Make paying worth it, and automatic

Close the gaps in `master-plan-v2.md` section 2, steps 3 to 6:

- **Give the paid key real value:** data the moment it is read (no 5-minute cache), full history beyond the free
  12 months (per D-021), bond-result alerts by email and webhook, Excel and CSV bulk downloads, a usage page.
  Reconcile `/developers#terms` so "free with attribution" does not hand institutions the paid product; propose the
  wording, do not change licence terms without approval.
- **Issue access automatically** after a verified Team and API payment, with an expiry that matches the paid period.
  Analyst seats likewise.
- **Renewals:** use Paystack plan codes where set, and a renewal reminder email 7 days and 1 day before expiry when
  not. Never charge without the buyer's authorisation.
- **Pilot nurture:** day-7 and day-23 emails with the buyer's own usage and a buy link, drafted from `lib/mail.ts`
  templates.
- **USD invoice:** a printable invoice page from the existing document design, for buyers who cannot use checkout.
- Tests for each, including expiry and refused-key paths. Pilot smoke workflow updated.

### U2. Shillings found: the mission, measured

On the existing tools only (no new tools): loan true cost, M-PESA and Fuliza, mobile loans and loan apps, money
market funds, savings comparisons, SACCO rates, sending money home, "Is my rate fair?".

- Each tool ends with a deterministic line: what the reader's option costs or earns, the cheapest or best-earning
  option we hold for the same use, and the difference per year in KES (or the market's currency), with the source
  and date of both sides. If we do not hold a comparable option, say nothing.
- Wording is information, not advice: "The cheapest option we track costs KES X a year less", never "switch".
- Log each result as an anonymous event (tool, market, difference, date; no inputs that identify a person) in a new
  numbered Supabase migration. Respect consent and the Kenya Data Protection Act; follow `migration 0038` patterns.
- A public counter on Today and `/method`: "Shillings found by readers since <date>", with how it is counted and its
  limits (a difference shown is not money moved).
- A share card for each result in the Laterite look (D-026), with no personal figures unless the reader chooses.
- Weekly line in the founder's desk email: shillings found, by tool.

### U3. The Poverty Premium file (Kenya v1)

A monthly, dated page and CSV at `/data/poverty-premium` that sets the price of money for a small user against a
large one, from data we already hold or can read from primary sources:

- Borrowing: a week of Fuliza or a mobile loan vs a bank or SACCO loan, as a yearly rate with fees.
- Saving: bank savings average vs money market fund vs T-bill, after tax.
- Sending: the cheapest vs average cost to send USD 200 home, by corridor.
- Protection: deposit cover for a bank saver vs a SACCO saver, as the law and the regulator state it.

Every line is code-computed with source and date. Publish `/method#poverty-premium` before the page. Add it to the
Morning on its release day and to the institutions pack as a sample. Other countries only after Kenya v1 has been
cited at least five times (count citations on the desk).

### U4. Reference rates others can cite and license

- **Sovereign Bill Index:** a public methodology document modelled on IOSCO's Principles for Financial Benchmarks
  (data sufficiency, calculation, revisions, conflicts, governance), its revision log, and a licensing line on
  `/licensing`.
- **Kenya Cost of Credit Index** (indicative): from `lib/data/mobile-loans.ts`, `loan-apps.ts`, CBK bank lending
  averages and SACCO loan rates where published. Monthly, with method, source list and revision rules.
- Label both "indicative reference rates" until the founder adds an oversight panel. Create
  `docs/governance/oversight.md` with the role, terms and conflicts policy, and leave the members blank. Never name
  anyone who has not agreed.
- API endpoints and CSV for both, under the existing licence terms.

### U5. SACCOs and institutions at home

The founder's strongest door is Kenyan SACCOs, MFIs and banks.

- **Watch pack to sales-ready:** a one-page offer, a public sample (exists), a pilot link issued from the desk, and
  a peer benchmarking table (rates vs tier median) using only SASRA and CBK figures.
- **Member widget:** the loan-cost and savings-comparison widgets white-labelled for an institution's own site, with
  "Data: Afronomics" kept. Pricing proposal in `lib/billing/ratecard.ts` for approval; do not change live prices.
- **Employer pack:** net salary, loan true cost and debt plan as a staff page an employer can link to. Proposal only
  until a buyer asks.

### U6. Get found

- **WhatsApp Channel:** the Morning and Asubuhi WhatsApp text already exist; add a publishing step and a channel link
  on Today, `/morning` and `/sw`. If posting needs a paid API, stop and give the founder the free manual route.
- **Newsroom kit:** `/press` with embeddable charts, the latest figures, citation wording and a contact; a weekly
  "numbers you can use" email to the press list.
- **Search:** dated per-auction pages for every bond market (only Kenya has them), sitemap entries, Dataset markup.
- **Citation tracking:** a desk table where the founder or an agent logs each outside citation with its link.
- **Widgets push:** a list of SACCOs, fintechs and finance blogs from the registry for the sales desk to approach.

### U7. Run it as desks

Write `docs/desks/<desk>.md` for each agent desk: Data, Receipts (with the sector bylines in `RECEIPTS.md`),
Confirming, Distribution, Sales, QA and Compliance. Each file has the mandate, inputs, the checks it must pass before
anything goes out, what needs the founder, what it logs and where, and how a human would take it over.

- One run log per desk on `/desk` (what ran, what was published, what was held and why).
- A repetition check across Receipts, briefs and LinkedIn posts before anything is queued.
- A founder queue on `/desk`: one-tap approvals, held items, replies received, decisions to log.
- Nothing in this phase gives an agent the power to spend money, sign anything, or email a new person without the
  rules in `docs/sales/sales-operator.md`.

## 4. The scoreboard

Add to the desk command centre, and to the founder's Monday email:

| Measure | Why |
| --- | --- |
| Shillings found, this week and in total | The mission |
| Outside citations and widget embeds | Being the reference |
| Returning readers a week; Morning, WhatsApp, Telegram and push subscribers | Reach that stays |
| Pilots started and used; Watch pack pilots | Demand |
| Payments (only `payments.status = 'success'`) and monthly recurring revenue | Money |
| Corrections this month | Trust |

## 5. What not to do

- No new countries or datasets before the gates in `usd-1m-plan.md` (D-012), except what U3 and U4 need for Kenya.
- No consumer subscriptions or hard paywall (D-007, D-021).
- No advertising next to rankings or ratings, and no institution paying to be rated.
- No race for breaking news; publish fast where we hold the source (auctions, rates), and leave the rest.
- No AI chatbot, no "financial health score", no personalised advice.
- No figures from memory or from a model. If a source is missing, show the gap.

## 6. Start

Read the files listed at the top. Then do section 2 and U0 only, write both documents, and stop for the founder.
Report what you verified, what you could not, and the order you recommend for U1 to U7 based on what the audit found.
