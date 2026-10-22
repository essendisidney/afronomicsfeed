# Receipts: the daily verdict engine

For Claude Code. Put this file at `docs/rebuild/RECEIPTS.md` and read it with `docs/rebuild/BRIEF.md`,
`docs/story-engine.md`, `docs/editorial/voice.md` and `AGENTS.md` before writing code. Written 14 Oct 2026.
Phases 1 to 5 of the rebuild are done; this continues the numbering at Phase 6.

## 1. What a Receipt is

A Receipt is Afronomics' daily verdict on one money event in Africa: an IPO, a rate decision, a budget line, a bank's
results, a price change. It is blunt, funny where the facts allow, and right on every number. It is researched, written,
checked and published by agents every day, under an Afronomics desk byline.

The first one is in `content/receipts/2026-10-14-quickmart-ipo.md` (supplied with this brief, status `draft`). Use it
as the reference for structure, tone and length.

Every Receipt has the same parts, in this order:

1. **Lede:** two or three short lines with the headline figure and whose money it is.
2. **Verdict line:** one sentence, bold, labelled Opinion.
3. **What happened:** facts, with sources.
4. **What the numbers show:** tables built from our data or the primary documents.
5. **History:** what happened last time, linked to the casebook where a case exists.
6. **Our verdict:** the argument, labelled Opinion.
7. **Our calls:** dated, checkable predictions that go on the record.
8. **What would change our mind.**
9. **Disclosure and sign-off.**
10. **Sources.**

Below the free piece sits the **full file** (Pro): the model, the trackers, the full cases and the follow-ups.

## 2. Rules that do not change

All rules in `BRIEF.md` section 2 still apply. In addition:

- **Every number comes from a source document or our data files.** A model may write words; it never produces a figure
  a reader sees. The checker enforces this (Phase 9).
- **Labels:** every paragraph of analysis or opinion carries (Analysis) or (Opinion). Facts are (Facts).
- **No advice:** no buy, sell, hold, subscribe or switch instructions. "Information, not advice." on every Receipt.
- **Humour rules** (add these to `docs/editorial/voice.md`):
  - Humour goes on the deal, the numbers and the system, never on a person's character, family, looks or ethnicity.
  - At most one dry line per section. Facts carry the piece.
  - Every sarcastic line must still be literally true.
  - No humour about losses suffered by ordinary people (depositors, workers, suppliers).
- **Who approves what:** `docs/editorial/named-institutions.md` (D-028). Data, sector and government-borrowing
  Receipts are fully autonomous behind the confirming agent (Phase 9, step 6). A verdict naming a company,
  institution or person also needs the founder's one-tap approval on `/desk` until 30 have run with no correction,
  a 3-working-day right of reply, and an advocate's read for a live offer or anything in litigation. If the
  confirming agent is not sure, nothing about a named company or person is published that day; the pipeline
  publishes a data Receipt instead.
- **Rules for anything that names a company, institution or person:**
  - Facts about them come from primary documents (filings, offer documents, court or regulator records), or from two
    independent publications that agree.
  - No allegation of crime, fraud, dishonesty or wrongdoing unless a court or regulator has made that finding, and
    the Receipt links to it.
  - Opinion judges the deal, the price, the numbers and the decision, never the person.
  - The subject's own explanation is quoted where it has given one.
- **Disclosure:** the owner fills in `data/owner/holdings.json` once (what he or Afronomics holds, advises or is paid
  by) and keeps it current. The pipeline checks every entity against it. A match is disclosed in the Receipt, or the
  story is skipped if the owner marked it as a conflict.
- **Bylines:** Receipts are signed by the desk that wrote them, rotating by sector: Afronomics Markets Desk, Banking
  Desk, Companies Desk, Public Money Desk, Cost of Living Desk, Africa Desk. Each desk is an agent configuration,
  and its page says so. Never invent a human name, photo or biography for an agent.
- **AI disclosure:** `/method` says plainly that the desks are research and writing agents working under the house
  rules, and that Afronomics Feed, as publisher, is accountable for everything published.
- **Kill switch:** the owner can send `/pull <slug>` to the Telegram bot to unpublish a Receipt at once and post a
  correction notice. He never has to, but he always can.

## 3. How to work

Same as `BRIEF.md` section 3: one phase at a time, a plan in `docs/rebuild/phase-N-plan.md`, stop for approval, a
branch and pull request per phase, preview deployments, no production merge without the founder (D-005). Least cost:
no new paid services; model calls only where words are researched or written.

## 4. Phases

### Phase 6: Receipt pages

- Content type `content/receipts/<date>-<slug>.md`. Frontmatter (extend `lib/content.ts`):
  `title, date, type (data|verdict), status (draft|checked|published), sector, entities[], verdict, labels, sources[],
  asOf, summary, calls[], followUps[], caseLinks[], series, desk, disclosure, verify[]`, and a body split by a
  `<!-- full-file -->` marker into the free part and the Pro part.
- Pages: `/receipts` (newest first, filter by sector and type) and `/receipts/[slug]`.
- Home page (`Today`): the latest published Receipt leads, with the verdict line and headline figure visible without a
  click.
- On the Receipt page, in order: the free piece; a box showing its calls, linked to `/record`; a "Go deeper" box
  listing what the full file adds, with the Pro checkout; a related free tool where one exists; an email capture
  ("Get the next chapter first").
- A **series** groups Receipts on one subject (for example `quickmart`) into a running file, newest first.
- Byline block: the desk name, linked to a desk page that lists the desk's Receipts and its calls record. No personal
  names.
- The Quickmart Receipt is the first to go through the Phase 9 confirming agent: it publishes when every item in its
  `verify` list has been checked against a primary document, and the disclosure line has been checked against
  `data/owner/holdings.json`.

### Charts and graphics (applies to every Receipt and Flash)

The standard is the best financial press in the world: every chart makes one point, is readable on a phone, and
carries its source. Charts are drawn from the data, never by a model.

- **Built from data, in code.** The Analyst chooses up to three charts per Receipt (one for a Flash) from `facts.json`
  and writes a chart spec: type, series, title and source. The site draws it with the house chart kit, extended from
  `components/data/LineChart.tsx`, `Sparkline.tsx` and `YieldCurve.tsx`. Use server-rendered SVG and no new chart
  library unless the phase plan shows it is needed.
- **The title states the finding,** not the topic. Write "Profit grew four times faster than sales", not "Quickmart
  revenue and profit".
- **The kind of chart follows the data:**
  - a level over time: line;
  - a comparison across items: bars sorted by value;
  - parts of a whole: a stacked bar, never a pie;
  - a forecast or range: a band or dot with whiskers;
  - before and after: a slope chart;
  - what moved a total: a waterfall.
- **Every chart carries:**
  - labels directly on the lines or bars instead of a legend;
  - units in the axis title;
  - the source and as-of date under it, with the evidence tag;
  - one highlight colour for the point being made, with everything else grey.
- **Phone first:** readable at 390px without zooming, with tap for exact values. It works in dark mode and has a text
  alternative for screen readers.
- **Other graphics, also drawn from data:**
  - figure tiles (the two-number summary at the top);
  - the timeline component for cases and series;
  - a "where the money goes" flow for deals like Quickmart;
  - a simple map when the story is about counties or countries.
- **Share images:** each Receipt gets a share card built by the existing `next/og` code, with the headline, the verdict
  line and the lead chart. The Distributor attaches it to the LinkedIn post, so the chart travels with the story.
- **Pro charts:** the full file can carry interactive versions (scenario sliders, longer history, downloadable data).
  The free chart is never a cut-down teaser; it makes the point in full.
- **Checks:**
  - every plotted value is in `facts.json`;
  - the Confirmer rejects a chart whose axis starts somewhere misleading, or whose title claims more than the data
    shows;
  - the Repetition checker rejects the same chart on the same subject within 30 days unless the data has changed.

### Phase 7: Editorial calls on the record

- New ledger file `data/forecasts/editorial.json`, same rules as `kenya_tbills.json`: written once, never edited,
  corrections as new rows.
- Each call: `id, receipt, written_at, statement, measure, threshold, check_source, check_date, status`.
- Grading:
  - Where our data can settle it (an auction rate, an NSE closing price, a CBK decision), a script grades it.
  - Otherwise the Grader agent records the outcome once the checking source publishes, quoting it and linking it; the
    outcome is the published figure, never a judgement.
- `/record` shows both the T-bill ranges and the editorial calls, with hit rates kept separate.
- A Receipt's `calls[]` are written to the ledger when the Receipt publishes, with the publishing commit as the time
  stamp.

### Phase 8: Pro and the full file

- Pro already exists in `lib/billing/ratecard.ts` (KES 1,500 a month) and the `gated` mechanism exists in
  `lib/content.ts`. Reuse both.
- The full file of each Receipt is Pro. The free part, the verdict and the calls are never gated.
- Free with email: a one-page fact sheet per Receipt (generated from the frontmatter and tables) and alerts for the
  Receipt's follow-up dates. Store in the existing subscribers tables.
- Turn the paywall on for Receipt full files only; record this in `docs/strategy/decision-log.md` as a change to
  D-007.
- Login for Pro readers: the cheapest option that works with the current Paystack flow (for example Supabase email
  magic links on the existing project). Propose it in the phase plan before building.

### Phase 9: the autonomous desk

A GitHub Actions workflow, `receipt-desk.yml`, every day at 03:30 Nairobi, so the Receipt is live by 06:00, before
the Morning note (07:00). Before adding it, check the existing workflows and scheduled routines for overlap. Each
agent is a step with its own instructions file in `agents/`, and each writes its output to
`data/receipts/<slug>/` so every decision can be audited.

1. **Scout.** Reads the Wire (`lib/data/wire.ts`), regulator and exchange notices, and `story_finder.py` leads. Scores
   each event on money involved, people affected and whether our data adds something others lack. Picks the top one.
   If nothing scores high enough, it falls back to the best data Receipt.
   Before picking, it hands the shortlist to the Repetition checker (step 1a).
1a. **Repetition checker.** Compares every candidate, and later the finished draft, against everything already
    published or queued: Receipts, briefs, the Morning note, LinkedIn company-page posts (logged in
    `data/receipts/posted.json`) and the series files.
    - **Same story:** a candidate about the same event as a Receipt in the last 30 days is rejected, unless something
      new has happened (a result, a filing, a price move). In that case it becomes the next chapter of that series and
      links back to it.
    - **Same angle:** a candidate that makes the same main point about the same company, institution or sector as a
      Receipt in the last 90 days is rejected, even if the event is new.
    - **Same words:** the draft is checked against the last 60 Receipts for repeated headlines, ledes, verdict lines,
      jokes and stock phrases. Any sentence too close to an earlier one is sent back to the Writer to rewrite.
    - **Same mix:** no sector leads more than twice in a row, and no desk byline more than three days running, unless a
      big event demands it.
    - **LinkedIn:** the same check runs on the post text before the Distributor sends it, so the page never repeats a
      line, a figure-led hook or an angle.

    Every decision and its reason is logged in `data/receipts/<slug>/repetition.json`.
2. **Researcher.** Opens the primary documents and builds `facts.json`: one row per fact with value, unit, date and the
   source URL actually opened. Two independent sources for anything not from a primary document. Runs as Claude Code
   headless in the workflow, or the Anthropic API from a script, with the key in a repository secret.
3. **Analyst.** Does the arithmetic in code (ratios, after-tax returns, comparisons with our data) and adds results to
   `facts.json` with the formula used. Writes the chart specs (see "Charts and graphics").
4. **Writer.** Picks the desk byline from the sector and writes the Receipt from `facts.json` only, in the house structure and voice: blunt, plain Kenyan
   English, dry humour on the deal, short sentences, no corporate filler. It reads three past published Receipts
   first, so the voice stays the same.
5. **Calls.** Writes two to five dated, checkable calls with the measure and the source that will settle each.
6. **Confirmer (the gate).** Publishes nothing unless every check passes:
   - every figure in the draft is in `facts.json`, and every fact has an opened source;
   - labels are present, there is no advice language and no banned words;
   - the section 2 rules on named companies and people are met;
   - the holdings check is done;
   - a hostile read, as a defamation lawyer and as a rival analyst, finds nothing unsourced, overstated or aimed at a
     person;
   - the Repetition checker has passed the final draft and the LinkedIn post.

   If the gate fails twice after the writer's fixes, the story is dropped for the day and a data Receipt runs instead.
   The reasons are logged and sent to the owner on Telegram for information only.
7. **Gatekeeper.** Decides what is free and what is Pro (section 5) and splits the Receipt at the `<!-- full-file -->`
   marker.
8. **Publisher.** Merges to `main` and confirms the page answers at its live URL with the right headline. It then
   writes the calls to the ledger and adds the Receipt to the Morning note and the Telegram channel.
9. **Distributor (LinkedIn).** Posts to the Afronomics company page, never the personal profile:
   - a post of under 1,200 characters: the headline figure, the verdict line, one dry line and the link;
   - sent through a Zapier webhook to the company page (Catch Hook to LinkedIn company update for company 110352967;
     the webhook URL is a repository secret);
   - one post per Receipt, never repeating an angle already posted.
10. **Follow-up agent.** Each `followUps[]` date (results day, listing day, the next half-year result) triggers the next
    chapter of the series on that day.
11. **Grader.** Settles calls that our data can settle, and records the rest when the checking source publishes, with
    the source link.
12. **Corrections agent.** Watches the corrections inbox and replies on LinkedIn. When a fact is shown to be wrong, it
    corrects the Receipt, logs it on `/corrections` and posts the correction on LinkedIn too.

### Phase 9b: the breaking desk

The daily run covers the morning. Breaking news is caught as it happens, so Afronomics publishes first.

1. **Watcher.** A light workflow, `breaking-watch.yml`, runs every 10 minutes from 06:00 to 23:00 Nairobi and every 30
   minutes overnight. It uses no model, only plain code that looks for anything new on the official pages and feeds.
   - CBK: MPC statements, auction results, press releases.
   - NSE and CMA announcements.
   - KNBS releases, including inflation at month end.
   - EPRA's monthly pump prices on the 14th.
   - The National Treasury, the Kenya Gazette and KRA notices.
   - The Wire's publisher feeds.

   It builds on the existing collectors and `data/latency.json`.
2. **Known-event calendar.** `data/receipts/calendar.json` lists scheduled releases (MPC dates, auction Thursdays, CPI
   day, EPRA's 14th, results and listing dates from `followUps[]`). A day before each one, the Researcher
   pre-builds the background facts and a skeleton Receipt. When the release lands, only the new figures need adding.
3. **Flash.** When the Watcher finds a new release that scores high, the pipeline publishes a short Flash Receipt
   within about 15 minutes:
   - the new figure, what it was before, and whose money it touches;
   - one dry line at most;
   - facts only, taken from the official document itself; no verdict on any named person or company;
   - the full Confirmer number check and the Repetition check still apply;
   - a LinkedIn company-page post goes out with it.
4. **Full Receipt.** The full pipeline (research, verdict, calls) follows within about three hours. It publishes as
   the next chapter of the same series, not as a repeat, and the Flash page links to it.
5. **Speed on the record.** Each Flash shows how many minutes after the official release it went live, measured from
   the source's own time stamp. `/record` reports the median, the same way the auction latency is reported today.

Limits:

- No rumours, leaks or social-media claims. A story is breaking for Afronomics only when an official document or
  filing exists.
- At most three Flashes a day, so the LinkedIn page stays worth following.
- If the official document can't be read automatically (a scanned PDF, a page that won't load), no Flash. The daily
  run picks it up once it can be checked.

### Phase 10: rotation across sectors

Once Phase 9 runs cleanly for two weeks, add the weekday rotation: Monday government money, Tuesday banks and SACCOs,
Wednesday cost of living, Thursday markets, Friday companies and Africa, Saturday a lesson, Sunday a casebook story.
The rotation is a preference for the pick step, not a rule; a big event always wins.

### Phase 11: one site, one journey

Receipts, Flashes, Pro and the desks must feel like one site, not a set of features bolted on. A reader should find
anything within three taps and always know what to do next.

**Navigation.** Phase 1 set the navigation as Today · Compare · Casebook · Numbers · Stories · For institutions.
Receipts now overlap with Stories, so propose this in the phase plan:

- Main navigation, five items: **Today · Receipts · Numbers · Compare · Casebook**.
- **Receipts** absorbs Stories: Receipts and Flashes first, then briefs, weekly notes and explainers, all filterable
  by sector, desk, country and free or Pro.
- Top right: **Search**, **Pro** (or "My account" when signed in), and **For institutions** as a quiet link.
- On phones: a bottom bar with Today, Receipts, Numbers, Search and Account, reachable with one thumb.
- Kiswahili switch and dark mode stay where readers already find them.

**The home page: the first screen on a phone.** Without scrolling, a reader sees today's verdict: one story, one
blunt line and the number that matters. From top to bottom:

1. **Header:** the Afronomics wordmark, Search, Pro (or Account) and the Kiswahili switch. Nothing else.
2. **Flash bar:** only when an official release has produced a Flash in the last few hours. One line: what broke, and
   "N min after <source>". Hidden on quiet days, so it never becomes wallpaper.
3. **Today's Receipt:**
   - the desk, "Receipt" and the time;
   - the headline in the serif face;
   - the verdict line, marked "Our verdict";
   - two figure tiles that make the point at a glance (for Quickmart: "To the sellers KES 15bn", "To the company
     KES 0");
   - its lead chart, when it has one;
   - one button: "Read the Receipt, free".
4. **Numbers that moved:** four live figures from our own data (for example 91-day bill, one-year bill, CBK rate,
   inflation), each with its evidence tag and linking to its Numbers page.
5. **Our record:** one line, such as "5 calls open, first graded 6 Nov", linking to `/record`.
6. **Email sign-up:** "Get tomorrow's Receipt before 06:00". One field, one button.
7. **Below the first screen:** the latest Receipts and Flashes, a casebook story, and a quiet For institutions band.
8. **Bottom bar on phones:** Today, Receipts, Numbers, Search, Account.

Not on the home page: carousels, a list of ten headlines, banner ads, pop-ups, or a Pro sales pitch above the fold.
Pro is offered at the end of a Receipt, after the reader has seen the value. On desktop the same order holds, in two
columns: the Receipt on the left, and the Numbers and Record on the right.

**Subject pages: one place per subject.** Every company, institution, sector and country mentioned gets one page that
gathers everything Afronomics has on it: Receipts newest first, the running series, its numbers, its casebook entries
and the calls about it with their grades. For example, `/subject/quickmart` holds the IPO Receipt, the results Flash,
the payment-days tracker and the five calls. Every name in a Receipt links to its subject page.

**The main journeys, each tested end to end:**

| Who | Arrives from | What they should reach, in at most three taps |
| --- | --- | --- |
| LinkedIn reader | A company-page post | The Receipt, then the subject page or the next chapter, then the email sign-up or Pro |
| Returning reader | The home page | Today: the new Flash or Receipt at the top, "since your last visit" under it |
| Saver | Search or a shared link | The free tools (rate check, compare a dividend with a T-bill), with the Receipt that explains them |
| Pro subscriber | Email or the site | The full file, their saved subjects, alerts, and an account page to manage payment |
| Institution | For institutions, or a paywall from a work email | Board Watch, data and API, pricing, a sample, and a contact form |
| Journalist or researcher | Search | The Numbers page with source and as-of date, the CSV, and how to cite |

**Rules for every page:**

- Every page ends with at most three clear next steps: a related Receipt, the subject page, and one action (sign up,
  try a tool, or go Pro). No dead ends.
- Breadcrumbs on every page below the top level.
- Search covers everything: Receipts, subjects, numbers, cases and tools. It understands company names, tickers and
  Kiswahili terms, and shows the subject page first.
- The paywall never hides the verdict or the calls. Pro pages tell the reader what's behind them before asking for
  money. Paying by M-Pesa takes no more than three steps, and the reader lands back where they were.
- Every Receipt and Flash shows its desk, time published, minutes after the source (for Flashes), and "updated"
  when changed.
- One design language across all pages: the same evidence tag, tables, timeline and buttons from Phase 1.

**Checks before the pull request:**

- An automated crawl proves every page is reachable within three clicks from Today and that no page lacks next steps.
- Each journey in the table is run as a Playwright test at 390px and 1280px, light and dark.
- Five real readers, one per journey, try a set task each. Record where they got stuck and fix it before merging.
  This is the one step that needs people; the owner or the sales agent can recruit them.

## 5. Free, paid and how the money comes in

The Gatekeeper follows these rules:

| Part | Access |
| --- | --- |
| Headline, lede, verdict line, the key table, the calls | Free, always: this is what gets shared |
| The full argument, all tables, history | Free on most days; Pro on the Friday deep Receipt and on any Receipt over 1,200 words |
| The full file: models, trackers, full cases, follow-up alerts | Pro |
| Fact sheet and next-chapter alert | Free with an email address |

Revenue lines, all automatic:

1. **Pro subscriptions:** KES 1,500 a month or KES 15,000 a year by M-Pesa or card (already on the rate card). The Pro
   box sits under every verdict.
2. **Sponsorship:** one clearly labelled sponsor line on the Morning note and the daily Receipt page, sold by the
   existing sales operator. A sponsor never appears on a Receipt about itself or a competitor.
3. **Institutions:** readers from banks, funds and SACCOs who hit the paywall see the Team and data offers. The sales
   operator follows up leads from work email addresses.
4. **Referrals:** disclosed referral fees where a Receipt links a free tool to a provider, ranked by data alone (D-007).

The funnel to measure on the desk is LinkedIn post, then Receipt read, then email, then Pro.

As an assumption to test, not a forecast: if 2% of regular readers subscribe, 1,000 Pro subscribers (KES 1.5 million a
month) needs about 50,000 regular readers. The desk reports the real conversion rate weekly.

## 6. Done means

- A reader from LinkedIn reaches the Receipt, the subject page and Pro in three taps or fewer, and every journey
  test passes.
- Official releases are on the site and the LinkedIn page within about 15 minutes, with the delay shown.
- No Receipt or LinkedIn post repeats an earlier story, angle, headline or joke; the repetition log shows why each
  one passed.
- Every day by 06:00 a new Receipt is live and posted on the Afronomics LinkedIn page, with no human step.
- Nothing publishes that fails the confirmer; every figure is in its facts file, and the checker proves it on every
  run.
- A reader can land from LinkedIn, read the verdict free, see the calls on `/record`, and pay for Pro with M-Pesa.
- Every call is on `/record` and graded.
- The owner can pull any Receipt from his phone with one message.
