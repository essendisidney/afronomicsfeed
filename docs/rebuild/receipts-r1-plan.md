# Receipts R1 plan: Receipt pages (and how Receipts fit the rebuild)

Written 14 Oct 2026 for `docs/rebuild/RECEIPTS.md`. **Status: waiting for founder approval.** No code until approved.

## 1. Numbering

`RECEIPTS.md` numbers its work from Phase 6. Phase 6 is already the clean-up (PR #135), and Phase 7 is the
interface and documents plan (`phase-7-plan.md`). To keep one sequence without two "Phase 6"s, the Receipts phases
are called **R1 to R6**:

| RECEIPTS.md | Here | What |
| --- | --- | --- |
| Phase 6 | **R1** | Receipt pages |
| Phase 7 | **R2** | Editorial calls on the record |
| Phase 8 | **R3** | Pro and the full file |
| Phase 9 | **R4** | The autonomous desk |
| Phase 9b | **R4b** | The breaking desk |
| Phase 10 | **R5** | Rotation across sectors |
| Phase 11 | **R6** | One site, one journey |

## 2. Recommended order

Receipts and the interface redesign touch the same places: the navigation, Today, the chart kit and the documents.
Building them separately would mean building the home page twice. So:

1. **Phase 6 (clean-up):** merge PR #135 when you approve it.
2. **Phase 7a + R1 together:**
   - the design system;
   - Receipt pages;
   - the new navigation **Today · Receipts · Numbers · Compare · Casebook**;
   - Today rebuilt around the latest Receipt, as `RECEIPTS.md` section R6 describes.

   The Receipt is the page the redesign is judged on.
3. **R2 (calls on the record).** This is small, and the Quickmart calls need it before 6 November.
4. **7e (premium documents) with R3 (Pro).** The free fact sheet and the Pro full file are documents.
5. **R4 (autonomous desk), then R4b, R5, and 7b to 7d alongside.**
6. **R6 checks.** The journey tests and the five real readers close it all.

## 3. R1 scope

As `RECEIPTS.md` Phase 6 describes. In brief:
- **Content type** `content/receipts/<date>-<slug>.md`:
  - the frontmatter it lists, validated like the casebook: a Receipt with a missing source, label or as-of date
    fails the build;
  - the body split at `<!-- full-file -->`.
- **Pages:**
  - `/receipts`, newest first, filterable by sector and type;
  - `/receipts/[slug]`;
  - series pages (`/receipts/series/quickmart`);
  - a page per desk.
- **The Receipt page, in order:**
  - the free piece;
  - its calls (linked to `/record` once R2 lands);
  - "Go deeper" with the Pro checkout;
  - a related free tool;
  - "Get the next chapter first".
- **Charts:** the house chart kit as Phase 7a builds it, drawn from the Receipt's figures only. Each chart has a
  title that states the finding, one highlight colour, its source and as-of date, and a text alternative.
- **Labels** (Facts), (Analysis) and (Opinion) are styled, not just typed. "Information, not advice." closes every
  Receipt.
- **Drafts never show in public**, the same as the casebook: draft Receipts are visible only on the desk preview.

## 4. Things you need to decide before anything publishes

These come from reading `RECEIPTS.md` beside the rules already in force. I would rather raise them now than after a
Receipt is live.

1. **Verdicts on named companies.** The current house rule (Phase 5, and our honesty rules) is "no verdicts on a
   named institution in public". Receipts reverse that on purpose for companies. That is your call to make. It
   should be written into the decision log as a change, with the guard rails from `RECEIPTS.md` section 2.
2. **An open public offer.** The Quickmart offer is open until 30 October. A published verdict on a security during
   its offer period could be treated by the Capital Markets Authority as investment research or advice, whatever
   the disclaimer says. **I recommend a short check with a Kenyan securities lawyer before the first Receipt on a
   live offer is published.** The draft's own `verify` list already asks for a "legal read of every Opinion
   paragraph".
3. **"Fully autonomous, no human approves."** I can build the gate as strict as `RECEIPTS.md` asks. **I recommend
   your one-tap approval (a Telegram button) for the first 30 verdict Receipts on named companies.** After that,
   the gate runs alone if its record is clean. Data Receipts and Flashes can be autonomous from day one.
4. **One line in the Quickmart draft breaks the brief's own rule.** The Tuskys row says "reported causes included
   internal fraud". The brief allows no allegation of fraud unless a court or regulator found it and the Receipt
   links to the finding. That line needs that link, or rewording to what was found (for example the Competition
   Authority's order on supplier payments, which is already cited).
5. **Secondary sources.** Several figures come from Kenya Insights, Legesi and Mwango Capital rather than the offer
   documents: trade payables, payment days, leases and growth by year. The `verify` list says so. Each must be
   checked against the information memorandum before publishing.
6. **The disclosure line.** It still says "[Confirm before publishing]". `data/owner/holdings.json` needs filling in
   first.
7. **Paywall.** Decision D-007 (12 Oct) says "no consumer paywall". R3 changes that for full files only, as
   `RECEIPTS.md` says. It will be recorded as a change to D-007 when R3 is planned, not now.

## 5. What I fixed in the draft

- The dividend after tax: a 6.7% yield less 5% withholding tax is **6.33%**. It read "about 6.4%"; it now reads
  "about 6.3%".
- I checked every other figure against its stated inputs and our auction file, and all of them hold:
  - the sellers' takes;
  - fees at 3.8%;
  - the lock-up shares;
  - price-to-earnings of 19.9, 14.3 and 15.8 times equity;
  - margins and growth by year;
  - the 15% growth and 41% second-half profit the forecast needs;
  - the dividend payout table (111%, KES 370 million);
  - the one-year bill at 9.04%, which is 7.68% after tax (it matches `data/kenya/tbill_auctions.json`).

## 6. Checks before the PR

- Validator tests for the Receipt frontmatter, the free/Pro split and the labels.
- A test that every figure in a Receipt's tables also appears in its sources list or facts file.
  - In R1 this is a warning, because `facts.json` arrives with R4.
  - The Quickmart Receipt's figures are listed by hand in `data/receipts/quickmart/facts.json` from the draft,
    each with its source.
- tsc, eslint, tests, build and site QA, with `/receipts` and the Quickmart page (as a desk preview) added.
- Screenshots at 390px and 1280px, light and dark.

## Decisions needed from you

1. **Order:** Phase 7a and R1 together (recommended), or R1 alone first in today's design?
2. **Named-company verdicts:** confirm the change to the "no verdicts on named institutions" rule.
3. **Legal check** before the first Receipt on a live offer (recommended), yes or no?
4. **Your one-tap approval** for the first 30 named-company verdicts (recommended), or fully autonomous from the start?
5. **The Tuskys line:** link the finding, or reword it?
