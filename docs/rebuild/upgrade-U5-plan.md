# U5 plan: SACCO Watch pack and member widgets, ready to sell (for the founder's approval)

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U5, after the U0 audit (`upgrade-audit.md` §4) and under the
named-institutions rule (`docs/editorial/named-institutions.md`, D-028, in force). **Status: waiting for founder
approval.** The parts that need no decision are built on branch `claude/upgrade-u5` (section 5); nothing there sets
a price, publishes a score, or contacts a SACCO. One pull request for the phase, opened only when you say so.

## 1. What U5 is

The Watch pack (phase 5) and the registry (phase 3) already exist. The audit found 0 pilots, 0 keys and 0 payments:
what is missing is a page a SACCO's CEO or board chair can be sent, a sample they can open, and something small
their members can see. U5 makes the SACCO offer complete enough to sell:

- one sales page for SACCOs, with the sample pack and a way to start;
- the Watch pack polished (year-on-year change, the middle half of the tier, a clearly marked demo SACCO);
- a member widget each SACCO can put on its own site, showing only its own regulator figures;
- the peer-comparison method written on `/method` before any score exists.

House rules that shape it (D-028, `README.md`, phase 3 and 5 plans):

- The public registry, Compare and the widgets show **the regulators' figures with no grades**.
- A SACCO set against SASRA's minimums stays **private to its own Watch pack**.
- **Any rating, score or ranking** of named SACCOs (for example a peer table that ranks) follows the named-verdict
  gate: confirming agent, then your one-tap approval on `/desk` until 30 have run clean (5 of 30 today), and its
  scoring method public on `/method` first.
- Code computes every figure. Information, not advice.

## 2. What a SACCO buys

| | What it is | Today | After U5 |
| --- | --- | --- | --- |
| **Watch pack** | A private A4 pack about one SACCO for its board, each quarter: size and results beside its SASRA tier, soundness ratios beside SASRA's prescribed levels and the tier median, the sector this quarter, where surplus funds earn after tax, the casebook | Built; private signed link from `/desk/watch`; public sample at `/watch/sample` | Adds each figure's change on the year before and the middle half of the tier (25th to 75th percentile); the sample becomes a clearly labelled **demo SACCO** with a back page that says what a subscriber receives |
| **Member widget** | A small box on the SACCO's own site: its licence status and the figures SASRA published for it, with source, date and "Information, not advice." | None | `/embed/sacco/<slug>` (iframe) and `/widgets/sacco.js` (one script tag); a labelled demo at `/embed/sacco/sample` |
| **Committee pack** | The monthly market pack (existing) | Live | Unchanged |

**Delivery.** The Watch pack link is made on `/desk/watch` and works for 120 days; it can be withdrawn in
`data/watch/revoked.json`. You send it to the SACCO's named contacts (outgoing email is on hold; nothing is sent
automatically in this phase). A PDF of a private pack is printed on your own machine with
`node scripts/make-documents.mjs --url <link> --name watch-pack --out <dir>`, never in a public workflow.

**Refresh.** Per-SACCO figures are SASRA's annual report (now the year to 31 Dec 2025), about nine months after
year-end; sector figures are SASRA's quarterly report; market figures update with each auction. The pack says so on
page 1. The widget refreshes itself when the registry reader (`registry.yml`, monthly) brings in a new SASRA report.

**Price.** Unchanged. The rate card (`lib/billing/ratecard.ts`) already includes the Watch pack in "Pack with alerts"
for SACCO subscribers (phase 5 option A). The sales page reads that line from the rate card, so it never disagrees
with `/prices`. Decision A below.

## 3. The member widget

- **Own figures only.** The SACCO's name, SASRA's licence status and list year, its SASRA size tier, and total
  assets, deposits, gross loans and total income for the latest year, each with the change on the year before
  worked out by code. No ratios against minimums, no tier median, no rank, no adjectives.
- **Source and date** on every widget: SASRA's annual report, page and as-of date, and the licensed list year.
- **"Information, not advice."** and **"Data: Afronomics"** with a link back to the SACCO's registry page.
- **Any SACCO can embed its own widget today** (the figures are public on `/registry`); nothing is sold yet. Branding
  options (decision C) come with a price only when you set one.
- Light, dark or auto theme (`?theme=`). The script version sizes the frame to its content.
- Counted like the other widgets (`/api/hit`), so the desk can see which SACCO sites carry it.

Not in U5: the loan-cost and savings-comparison calculators white-labelled for a SACCO's members (UPGRADE U5,
second bullet). They need a SACCO's own loan and deposit rates, which we do not hold (audit §4, "SACCO loan rates
are not held"). Proposed for after the first SACCO asks, with figures from that SACCO's own published notice.

## 4. Onboarding and delivery flow

1. A SACCO lands on `/for-institutions/saccos` (linked from `/for-institutions`): what the Watch pack is, the demo
   pack (HTML and PDF), the member widget with its embed code, and the price line from the rate card.
2. It starts in one of two existing ways: the **enquiry form** on that page (interest "pack", recorded as a lead for
   the desk), or the **30-day pilot** form (`/pricing?from=sacco-watch#pilot`), attributed to this page.
3. The desk replies (a person, not an automation), picks the SACCO on `/desk/watch` and sends its private pilot link.
4. The SACCO puts the member widget on its site with one line of HTML.
5. If it buys "Pack with alerts", the pack is renewed each quarter with a fresh link.

No new tables, no migration, no email automation.

## 5. Built on `claude/upgrade-u5` (needs no decision)

1. **Plan** (this file).
2. **Watch pack polish** (`lib/watch.ts`, `lib/editions/watch-html.ts`): change on the year before for each size
   figure; the tier's middle half beside its median; the sample renamed "Demo SACCO (sample)" with a banner on the
   cover and a back page "What a subscribing SACCO receives". The sample is still the large-tier median, so it
   describes no institution (phase 5 decision 2; D-028 rule 6). The public PDF is reprinted by the Monday
   `documents.yml` run.
3. **Member widget**: `lib/embeds-sacco.ts`, `app/embed/sacco/[slug]/route.ts`, `public/widgets/sacco.js`.
4. **`/method/peer-comparison`**: how tier medians and the middle half are worked out, what is compared and what
   is not, why no score is published, and the gate any future score must pass. Linked from `/method`. **No scores.**
5. **Sales page** `/for-institutions/saccos`, and a line on `/for-institutions` pointing to it.
6. Tests (`tests/site/test_sacco_u5.py`), site QA pages, sitemap entries.

## 6. Decisions for the founder

- **A. Price.** Keep the Watch pack inside "Pack with alerts" for SACCOs at the rate-card price (recommended: no
  change, one price), or a separate quarterly Watch pack at a price you set. No price is set or changed in U5.
  The member widget is free for a SACCO to embed today; if you want to charge for a branded version, give the price
  and it goes into the rate card under its own line.
- **B. Peer benchmarking table that ranks** (UPGRADE U5, first bullet: "rates vs tier median"). Options:
  1. **Do not ship a ranking** (recommended for now). The private pack keeps the tier median and middle half, with
     no position, rank or score. Nothing new needs the gate.
  2. Ship a **private** position line in each SACCO's own pack ("12th of 39 large-tier SACCOs by total assets",
     the order SASRA itself prints). Private, so outside the public gate, but it is a ranking: your call.
  3. Ship a **public** peer table that ranks or scores named SACCOs. This is a rating of named institutions under
     D-028 rule 5: each release goes through the confirming agent and your one-tap approval until 30 run clean,
     and a scoring method must be written and published on `/method` first (the new `/method/peer-comparison`
     section says no score is published and would be extended). Not recommended until a SACCO buyer asks for it.
- **C. Widget branding.** "Data: Afronomics" with a link stays on every widget (UPGRADE U5). Choose:
  1. Free widget as built: SACCO's name as the title, Afronomics colours, "Data: Afronomics" link (recommended).
  2. Also a paid branded version (the SACCO's colours and logo, "Data: Afronomics" kept), priced by you.
- **D. Sales page wording**: the page names no SACCO and makes no claim about any; it can go live with the pull
  request. Approve as built, or ask for changes.
- **E. Employer pack** (UPGRADE U5, third bullet): proposal only until a buyer asks (recommended), as UPGRADE says.

## 7. Checks

`npx tsc --noEmit`, `eslint` on changed files, `python -m pytest tests/site tests/readers`, `npm run build` with
`SUPABASE_URL` pointed at a dead port (as CI does), `node scripts/site-qa.mjs --serve`, and screenshots of the sales
page, the demo pack and the widget at 390px and 1280px, light and dark.
