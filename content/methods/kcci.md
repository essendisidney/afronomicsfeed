---
title: "Afronomics Kenya Cost of Credit Index (KCCI): method"
short: KCCI
version: "0.1"
in_force_since: 2026-10-22
documented: 2026-10-22
next_review: 2027-04-22
status: Indicative, version 0
---

## Purpose

The KCCI shows what it costs to borrow in Kenya, by kind of lender, on one yardstick: the charge on KES 1,000 for
30 days, and that charge as a simple yearly rate. It is meant to be quoted ("a mobile loan costs about N times a
bank loan") and tracked month by month.

It is a **version 0, indicative** index. It covers two of the four kinds of lender it is designed for, it is not yet
overseen by an independent panel (see the governance document), and it is not built to settle contracts.

What it is not: it is not a verdict on any lender, it does not rank lenders, it is not a price a given borrower will
be offered, and it is not advice. A reading for a category comes from published figures only.

## Inputs and their sources

| Category | Input | Source | Frequency | Status in v0 |
| --- | --- | --- | --- | --- |
| Bank loans | Weighted average lending rate across commercial banks, for the month | Central Bank of Kenya, weighted average rates (`data/kenya/rates.json`) | Monthly, about six to eight weeks after the month | Included |
| Mobile loans | Each provider's own published charges for a loan, fees and excise duty included | The provider's own web page, quoted with the date read (`data/kenya/mobile_loans.json`) | Re-read at least quarterly, and when a provider changes its page | Included |
| SACCO loans | SACCOs' own published loan rates | **Not held.** SASRA publishes dividends and deposit interest, not loan pricing | — | **Gap** |
| Digital loan apps | — | We collect borrowers' own reports, which are not published prices and are not checked with the lender | — | **Excluded** pending a decision |

Only published figures with a source and a date are used. No figure is estimated, modelled or taken from memory.

## Calculation

For a reading date *t*:

1. **Bank loans.** The CBK lending average for the latest month held, if that month ended no more than **120 days**
   before *t*. The yearly rate is CBK's figure; the charge on KES 1,000 for 30 days is 1,000 × rate × 30 ÷ 365.
2. **Mobile loans.** For each product, the published charge for its term (as a share of the amount borrowed) is
   turned into a simple yearly rate: charge × 365 ÷ term days. For a product with a one-off fee plus a daily fee by
   balance band, the KES 1,000 band is used, over 30 days. A product is **counted** if its terms were read no more
   than **92 days** before *t* and the provider publishes the price itself, not a "from" or "starting at" floor.
   The reading is the **median** yearly rate of the counted products, if at least **two** are counted.
3. **SACCO loans** and **digital loan apps** print no reading in v0.

Rounding: yearly rates to two decimals, shillings to the cent; quoted to the nearest whole percent for mobile
loans.

**No single blended number in v0.** We hold no lending volumes by category, so any weights would be our choice
rather than a fact, and the blend would jump when SACCO loans are added. The KCCI is published as its category
readings, side by side.

**Comparability.** The bank figure is an interest rate that leaves out fees, so it understates the full cost of a
bank loan; the mobile figure includes every published charge. Both are simple yearly rates, without compounding.
Late fees, rollovers and early repayment are not counted in either.

## Rebasing

The KCCI is a set of rates in percent and shillings, not an index number with a base period, so there is nothing to
rebase. Adding a category or a product changes the reading from the date it is added; earlier readings are not
recomputed with it.

## Data insufficiency

- A category whose input is older than its window (120 days after the CBK month ends; 92 days after a provider's
  terms were read) prints no reading, and the page says why.
- Fewer than two counted mobile products: no mobile reading.
- Nothing is carried forward or filled in. A gap is shown as a gap.

## Errors and revisions

- **Our error** (a misread page, a wrong figure): corrected with the source, posted on `/corrections` and in the
  revision log below within one working day of finding it, with the old and new values.
- **A source restates** (CBK revises a month; a provider changes its published terms): the new figure is used from
  the date we read it, and the change is logged. A published monthly reading is kept as published.

## Publication

Version 0 is computed from the data held when the page is built and shown with the dates of its inputs. Monthly
releases, fixed and saved as published, start once the publication day is set.

## Governance and conflicts

As for the ASBI; see the governance document. In particular: no lender pays to be included or excluded, no lender
sees a reading before it is published, and categories, not named lenders, are the unit of the index. A provider's
published price may appear as an input, with its source, but the index never rates or ranks a lender.

## Review cycle

Reviewed every six months while it is version 0 (next review by 22 April 2027), and whenever a new category of input
becomes available. A change to the inputs, windows or the median rule is announced at least four weeks ahead, with
its effect on the latest reading, and gets a new version number.

## Revision log

| Date | Kind | Entry |
| --- | --- | --- |
| 22 Oct 2026 | Version 0.1 | First version. Bank loans (CBK average) and mobile loans (median of counted published charges) included. SACCO loans a gap. Loan-app reports excluded pending a decision. "From" prices shown but not counted. |

## IOSCO checklist

IOSCO's Principles for Financial Benchmarks are used as a checklist, not as a claim of compliance.

| IOSCO principle | Status in v0 |
| --- | --- |
| Design and data sufficiency (6, 7) | Partly: two of four categories; two to three mobile products |
| Hierarchy of inputs (8) | Met for what is included: regulator statistics and providers' own published prices |
| Transparency of determinations (9) | Met: every input, source and date shown with the reading |
| Methodology and changes (11, 12) | Met: this document |
| Conflicts, oversight, control framework (3, 4, 5) | As the ASBI; panel not yet appointed |
| Periodic review (10) | Policy written; six-monthly while v0 |
| Audit trail (18) | Met: data files with sources and dates in version control |
