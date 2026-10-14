# Phase 4 plan: Forecast ledger

Written 14 Oct 2026 for `docs/rebuild/BRIEF.md` (section 8, item 4). **Status: waiting for founder approval.** No
code until approved. Branch `rebuild/phase-4`; one PR; merge only with your approval.

## The honest starting point

Today shows "Our record: 70%" for Kenya Treasury bill ranges, 1,558 of 2,211 auctions. Two things about that number:

1. **It is a backtest, not a record.** `lib/data/auction-intel.ts` runs today's method over every past auction
   since 2011: the range is the latest rate plus the 10th to 90th percentile of the last 26 weekly moves. Nothing was
   published before most of those auctions. The page text says "Before each Kenya Treasury bill auction we
   publish a likely range … across 2,211 past auctions, the result landed inside our range". A reader would
   take that as a record of published forecasts. It is not one.
2. **It falls short of what the method promises.** A 10th-to-90th percentile range should contain about 80% of
   results if it is well calibrated. The backtest shows 70%, so the ranges are too narrow, and saying so is part
   of the record.

Phase 4 replaces this with a real ledger: every range is saved and publicly time-stamped before the auction it
forecasts, and graded by code when CBK publishes the result.

## What Phase 4 delivers

1. **Fix the wording now** (first commit, also offered as a separate small PR if you want it live at once). Today
   and the auction page say "Tested on past auctions" and "backtest", with the method in one line. "Our record"
   becomes "How the method has done", until the live ledger has results.
2. **The ledger: forecasts written before the auction.**
   - A new job, `forecast-log.yml`, runs every Wednesday at 09:00 Nairobi time. That is after the previous week's
     results and before bids close at 14:00 on Thursday.
   - It records the range for each tenor (91, 182 and 364 days):
     - the auction it is for;
     - the low and high of the range, and the latest rate it starts from;
     - the method version;
     - the time it was written.
   - Each row is appended to `data/forecasts/kenya-tbills.json` and committed to the public repository.
   - **The commit is the time stamp.** Anyone can check on GitHub that a range was published before the auction.
     A database row can't show that to an outsider.
   - Rows are never edited. A forecast written after bids close is refused by the job itself.
3. **Automatic grading.** When `kenya_tbills.py` adds that auction's result, a grader appends an outcome row:
   - the published weighted-average rate and CBK's link;
   - inside or outside the range, and the miss in basis points.
   - **Code only.** No model and no hand grading. A forecast with no result after 21 days is marked "no result
     published", never dropped.
4. **The "Our record" page (`/record`).**
   - **Live ledger:** every forecast next to its outcome, newest first. It shows the hit rate by tenor and in
     total, and the miss distribution.
     - It starts at zero, and says so plainly until there are results.
     - Each row links to the commit that published the forecast and to CBK's results notice.
   - **Calibration:** the share of results inside the range, against the 80% the method aims for. Shown for both
     the live ledger and the backtest.
   - **Backtest, labelled as such:** the 2,211-auction test, with the method stated. It is never added to the
     live figures.
   - **CSV** of the ledger: free, because the record is the product's credibility and should be easy to check.
   - The footer's "Our record" link and Today's block both point here.
5. **Method versions.** If the range method changes (for example to fix the 70% versus 80% gap):
   - the version number goes up;
   - old forecasts keep the version they were made with;
   - the page reports each version separately, so a better method never rewrites the past.

## Rules that matter most here

- Nothing on the record page is estimated by a model; every figure is arithmetic on published CBK results.
- A forecast is never deleted or edited after it is written; corrections are new rows that say what they correct.
- Information, not advice: a range is not a recommendation to bid at any rate.

## Not in Phase 4

- **Ranges for markets other than Kenya.** The method needs at least 28 weekly results per tenor, and only Kenya
  has a weekly series long enough. Other markets can join the ledger later, one at a time.
- Watch packs (Phase 5).

## Checks before the PR

- Tests on fixtures:
  - the job refuses a forecast written after bids close;
  - grading of inside, outside and missing results;
  - the ledger files only grow;
  - calibration arithmetic.
- The existing tests, a build, and site QA with `/record` added.
- Screenshots at 390 and 1280, light and dark, and the preview link.

## Decisions needed from you

1. **Where the ledger lives:**
   - Recommended: an append-only file in the public repository, so every forecast has a public, checkable time
     stamp.
   - Or: a Supabase table, as the brief first suggested. It is private, and an outsider can't check its time
     stamps.
2. **The wording fix:** ship it now as a small separate PR (recommended, since it is a live overclaim), or with
   the rest of Phase 4?
3. **The range method:** keep it as is and report the 70% versus 80% gap (recommended for the first ledger
   weeks), or widen the range now so it aims for 80%, as version 2?
