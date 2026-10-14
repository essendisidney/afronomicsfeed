# Receipts R2 plan: editorial calls on the record

Written 14 Oct 2026 for `docs/rebuild/RECEIPTS.md` (its Phase 7, here R2). **Status: waiting for founder approval.**
No code until approved. Branch `rebuild/receipts-r2`; one PR; merge only with your approval.

## What it is

Every Receipt ends with dated calls, such as "Total demand comes in below 150% of the shares on offer". R2 puts
those calls on a public ledger that cannot be quietly edited, and grades them against the source each one names.
`/record` then shows two records side by side, each with its own hit rate:
- the T-bill ranges (Phase 4);
- the editorial calls.

The rules are the same as the T-bill ledger:
- a call is written once and never edited;
- a correction is a new row that points to the old one;
- the commit that writes a call is its public time stamp.

## 1. The ledger file

New file: `data/forecasts/editorial.json`, with the same structure as `kenya_tbills.json` (calls, then outcomes).

**Each call:**
- `id`: for example `RC-2026-10-14-quickmart-ipo-2`;
- `receipt`: the Receipt's slug;
- `written_at`: the time of the commit that published it;
- `statement`: the sentence a reader sees;
- `measure`, `comparator` and `threshold`: what is compared, and how. For example "subscription, % of shares on
  offer", `<`, 150;
- `unit`;
- `check_source`: the named source that settles it;
- `check_date`: when that source is due.

**Each outcome:**
- `call`: the id of the call it settles;
- `value`: the published figure;
- `source_url`: the document actually opened;
- `quote`: the exact words or table cell the figure comes from;
- `recorded_at`.

**Status is worked out by code, never typed by hand:**
- `open`: before the check date;
- `due`: the check date has passed and no outcome is recorded yet;
- `held` or `missed`: the recorded value compared with the threshold;
- `void`: only when the event cannot happen, for example the offer is withdrawn. A void call needs a source as well,
  and stays visible.

The outcome is always the published figure. The grade comes from comparing it with the threshold in code; nobody
makes a judgement call.

## 2. Writing calls to the ledger

- A Receipt's `calls[]` gain three fields: `measure`, `comparator` and `threshold`. The validator refuses a call
  without them, so every call is checkable by construction.
  - Calls that are not numbers get `comparator: "is"` and an expected value, for example "lists on 12 Nov 2026" or
    "offer clears its minimum".
- **When a Receipt's status becomes `published` on main**, a workflow (`calls-ledger.yml`, triggered by pushes to
  `content/receipts/`) runs `scripts/calls_ledger.py publish`. It appends the Receipt's calls and commits. That
  commit time is the public time stamp, as for the T-bill ledger.
- **No call is ever written after its own check date.** If a Receipt is published after one of its calls has
  already been settled, that call is left off the ledger and listed as "not recorded: published after the
  event". Nobody gets credit for hindsight.

## 3. Grading

- **Settled by our own data, automatically.** A call whose measure is an auction rate or a CBK decision is graded
  by `scripts/calls_ledger.py grade`. It runs in the existing twice-daily forecast-ledger job.
- **Settled by a published document**, such as offer results, an NSE closing price, or audited accounts:
  - **Until the desk agents exist (R4):** I record the outcome as a pull request that touches only
    `editorial.json`. The test refuses an outcome without a source link and the quoted figure.
  - **From R4:** the Grader agent does the same, on the check date.
- **NSE closing prices:** we have no NSE reader yet. Quickmart's listing-day call is recorded from the NSE's daily
  price list with the quote. A small NSE reader is an option for later, not part of R2.

## 4. On the site

- **`/record`:**
  - two sections: "Auction ranges" (as now) and "Editorial calls";
  - each section has its own hit rate. They are never combined, because a range and a yes/no call are different
    kinds of forecast;
  - each call shows its statement, the Receipt it came from, its status, and, once settled, the published figure
    with its source and quote;
  - "Due" calls are shown in amber with the date they were due, so an overdue call can't hide.
- **On each Receipt:** the calls box shows each call's status from the ledger, linking to its row on `/record`.
- **Today:** the record line uses the ledger, for example "5 calls open, first due 6 Nov".
- **`/api/record`:** gains the editorial calls as a CSV, under the same terms as the T-bill ledger.
- **Desk pages:** each desk shows its own calls record.

## 5. What this means for Quickmart

Its five calls are due between 6 Nov 2026 and 30 Jun 2027:

| Call | Settled by | Due |
| --- | --- | --- |
| Clears 75% and lists | Offer results and the NSE | 12 Nov 2026 |
| Demand below 150% | Offer results | 6 Nov 2026 |
| First-day close within 10% of KES 7.50 | NSE closing price | 12 Nov 2026 |
| 2026 profit below KES 2.1 billion | Audited 2026 results | 30 Jun 2027 |
| Payable days above 77 | Audited 2026 results | 30 Jun 2027 |

**If the Receipt is not published before 6 Nov**, the rule in section 2 drops the first three calls. Each has a
chance to go on the record only if Quickmart publishes before its date. The Receipt itself still needs:
- its open source checks;
- the legal read;
- the disclosure line.

None of these is part of R2, but they decide how many of its calls count.

## Checks before the PR

- **Tests:**
  - a call without a measure is refused;
  - publishing writes each call once, and a second run adds nothing;
  - a call whose date has passed is not written;
  - an outcome without a source link or quote is refused;
  - held and missed are worked out by code for each comparator;
  - a due call shows as due;
  - the two hit rates are separate.
- tsc, eslint, `pytest tests/site tests/readers`, build, and site QA including the speed budget.
- Screenshots of `/record` with both sections, at 390px and 1280px, light and dark.

## Decisions needed from you

1. **Outcome pull requests:**
   - **Recommended:** they may merge without your approval when all three hold: they touch only
     `data/forecasts/editorial.json`, every check passes, and each outcome quotes its source. This is a narrow
     exception to D-005, logged in the decision log. A grade then never waits on anyone.
   - **Alternative:** every outcome waits for your approval.
2. **Late publishing:**
   - **Recommended:** a call whose check date has passed is never written.
   - **Alternative:** write it but mark it "after the event" and leave it out of the hit rate.
3. **Void calls:**
   - **Recommended:** shown, with their source, and left out of the hit rate.
   - **Alternative:** counted as missed.
