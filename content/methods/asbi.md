---
title: "Afronomics African Sovereign Bill Index (ASBI): method"
short: ASBI
version: "1.0"
in_force_since: 2026-10-05
documented: 2026-10-22
next_review: 2027-10-05
status: Indicative reference rate
---

## Purpose

The ASBI answers one question: what do African governments pay to borrow for one year? It is a single weekly
number for the typical covered market, so a journalist, a treasurer or a researcher can quote the level and its
change without reading ten central banks' notices.

It is labelled an **indicative reference rate**. It is not yet overseen by an independent panel (see the
governance document), and it is not built to settle contracts.

What it is not: it is not an investable return, it does not adjust for inflation or currency, and it does not
rank or judge any government.

## Inputs and their sources

- **One input per market:** the headline rate of the most recent primary auction of the 364-day Treasury bill, as
  the central bank publishes it. The table of inputs below this method lists each market's publisher, source page
  and which rate it publishes.
- **Only primary auction results.** Reopenings, secondary-market quotes, dealer polls and estimates are not used.
  These are transaction data published by the issuer's own agent, the strongest kind of input in IOSCO's hierarchy.
  No one submits a rate to Afronomics, so there are no submitters to supervise.
- **Each rate as published, compared without adjustment.** Central banks publish different measures (a weighted
  average, a stop rate, a cut-off yield). Converting them to one basis would need data most do not publish; the
  differences are small next to the gaps between markets, and the measure each market uses is shown.
- **How the inputs are read:** each market's results are read from the publisher's own page or document by a reader
  script in `scripts/`, with the source link stored on every row in `data/<country>/tbill_auctions.json`.
  Readers are tested against the publishers' real layouts (`tests/readers`).

## Calculation

For each Monday (the **reading date**):

1. For each covered market, take the 364-day result with the latest value date on or before the reading date,
   provided that value date is no more than **120 days** before the reading date.
2. If at least **six** markets have such a result, the reading is the **simple (equal-weighted) average** of those
   rates, computed to three decimals.
3. Changes on the week, month (four weeks) and year are differences between readings, in basis points.

Formula: ASBI(t) = (1 / N) × Σ r(i, t), over the N markets with a result counted at t, N ≥ 6.

Equal weighting keeps the ASBI a measure of the typical market rather than of its largest borrowers; weighting by
debt outstanding would make it a reading of Egypt and Nigeria. Every market's contribution is published with every
reading, so anyone can re-weight it (but must then not call the result the ASBI).

The 91-day ASBI follows the same rules on three-month bills.

**Rounding.** The reading is computed to three decimals and quoted to two. Changes in basis points are computed
from the three-decimal values.

**Cut-off.** The weekly release is fixed at **07:30 Nairobi time on Monday** from the data held at that moment, and
saved as published in `editions/index/`. A result that reaches us after the cut-off is not in that week's release,
even if its value date is on or before the reading date.

## Rebasing and changes to the market set

The ASBI is a rate in percent, not an index number with a base period, so there is nothing to rebase.

The series is recomputed over its whole history from the current set of markets. Adding or removing a market
therefore changes past readings. Until history before a change can be kept fixed (chain-linking), any change to the
set of markets is:

- announced at least **four weeks** ahead on the index page and in the revision log, except when a central bank
  stops publishing;
- logged with its effect on the latest 52 readings;
- never applied to releases already published, which stay as published.

## Data insufficiency

- A market whose latest result is more than 120 days old drops out of the reading until it publishes again.
- A week with fewer than six markets prints **no reading**. The latest valid reading stays the latest, shown with
  its own date, and the release says no new reading was possible. Nothing is estimated, carried forward or filled
  in.
- If no valid reading is possible for eight weeks running, the index is suspended and the founder decides whether to
  change the method or cease it (see Cessation).

## Errors, revisions and restatements

Three things can make a past value differ from what was published, and each is handled differently.

1. **Late results.** A result that arrives after the Monday cut-off, with a value date on or before the reading
   date, enters the recomputed series. This is a revision, not an error. The **value of record is the published
   Monday release**; the recomputed series is labelled as such on the page and in the API. Every difference
   between a release and the recomputed value is listed automatically in the revision log, with the markets that
   moved.
2. **A central bank restates a result.** The data file is corrected, with the restated source, and the change is
   logged on the market's page. Releases stay as published; the revision log shows the effect.
3. **Our error** (a misread document, a wrong date, a code fault). If it moved a published reading by **one basis
   point or more**, a correction is posted on `/corrections` and in the revision log within one working day of
   finding it, saying what was wrong, the published and corrected values, and the cause. The release file is not
   overwritten; the correction is added next to it. Errors below one basis point are fixed and logged without a
   notice.

## Governance and conflicts

- **Administrator:** Afronomics. The founder owns the method and approves any change to it.
- **Calculation:** automated, by the code in `lib/data/bill-index.ts`, from the data files above. No person enters
  or adjusts a reading by hand. Each release is saved and committed with a timestamp.
- **Oversight:** the oversight function and its terms are set out in the governance document. Until its members are
  appointed, the ASBI stays labelled indicative.
- **Conflicts:** Afronomics takes no payment to include, exclude or weight a market, and no market or government
  is consulted on its reading before it is published. Anyone who can change the method, the code or the data
  declares any holding in, or trading of, Treasury bills of a covered market, and any other interest in a reading;
  the declarations are kept with the governance document.
- **Licensing** does not give any licensee a say in the method or early access to a reading.

## Review cycle

- The method is reviewed at least **once a year** (next review by 5 October 2027), and whenever a central bank
  changes what it publishes, a market stops publishing, or a covered market is added.
- A review checks the method against this document, the IOSCO checklist below, the revision log, and any
  complaints. Its result is logged in the revision log, even when nothing changes.
- A material change (to the inputs, the formula, the minimum number of markets or the staleness window) is
  announced at least four weeks before it takes effect, with the reason and its effect on recent readings, and
  gets a new version number.

## Cessation

If the ASBI has to stop, Afronomics gives at least three months' notice on the index page and to everyone who holds
a licence, keeps the full series and every release online, and says what, if anything, users could use instead.

## Complaints

A complaint about a reading or the method goes through `/corrections` or the contact page. It gets an answer within
five working days, and the complaint and the answer are logged (without the complainant's details) in the revision
log.

## IOSCO checklist

IOSCO's Principles for Financial Benchmarks (2013) are used here as a checklist, not as a claim of compliance.
Nobody has audited the ASBI against them.

| IOSCO principle | Where it is covered | Status |
| --- | --- | --- |
| 1. Overall responsibility of the administrator | Governance and conflicts | Met |
| 2. Oversight of third parties | No third party computes or submits | Not applicable |
| 3. Conflicts of interest | Governance and conflicts | Policy written; first declarations due |
| 4. Control framework | Calculation; release saved and committed | Partly: no second person checks a release |
| 5. Internal oversight | Governance document | Not yet: panel members not appointed |
| 6. Design of the benchmark | Purpose; calculation | Met |
| 7. Data sufficiency | Inputs; data insufficiency | Met |
| 8. Hierarchy of data inputs | Inputs: primary auction results only | Met |
| 9. Transparency of determinations | Every contribution published with every reading | Met |
| 10. Periodic review | Review cycle | Policy written; first review due by Oct 2027 |
| 11. Content of the methodology | This document | Met |
| 12. Changes to the methodology | Review cycle; rebasing | Met |
| 13. Transition and cessation | Cessation | Policy written |
| 14. Submitter code of conduct | No submitters | Not applicable |
| 15. Internal controls over data collection | Reader scripts, tests, source link on every row | Met |
| 16. Complaints | Complaints | Policy written |
| 17. Audits | None yet | Not yet |
| 18. Audit trail | Releases, data files and code kept in version control | Met |
| 19. Cooperation with regulators | Not regulated as a benchmark today | Not applicable today |
