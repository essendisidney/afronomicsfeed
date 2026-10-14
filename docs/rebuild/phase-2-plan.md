# Phase 2 plan: Casebook

Written 14 Oct 2026 for `docs/rebuild/BRIEF.md` (sections 5 and 8). **Status: waiting for founder approval.** No code
until approved. Branch `rebuild/phase-2`; one PR; merge only with your approval.

## What Phase 2 delivers

1. **Case schema and validator.** One file per case in `content/cases/<id>.md`, with the frontmatter from the brief
   section 5. Two validators check every file and run in CI:
   - `lib/cases.ts` (TypeScript types and loader);
   - `scripts/case_check.py` (pytest).

   The validator refuses a case when:
   - the ID is not of the form `AF-<country>-<year>-<nn>`, or is a duplicate;
   - a required field is missing;
   - a figure in `conditions_before`, `signals_visible_before` or `who_lost` has no `source` URL or no `as_of` date;
   - a timeline event has no date or no source;
   - `labels` uses anything but Facts or Analysis;
   - a case without `signed_off` (founder's name and date) is marked `status: published`.
2. **Casebook pages.**
   - **`/casebook`:** filters by country, sector and year. Each case shows its file reference, for example
     `AF-KE-2016-01`.
   - **`/casebook/[id]`:**
     - conditions before, trigger, timeline (the shared Timeline component), who lost;
     - signals visible beforehand, the response, the lessons checklist, and sources;
     - an evidence tag on every figure.
   - **DRAFT cases:** shown only in preview deployments and on `/desk`. Production shows signed-off cases only.
3. **Three sample cases, marked DRAFT, for you to complete and sign off.** Proposed (Kenya, banking, all with public
   regulator records):
   - `AF-KE-2015-01` Imperial Bank: placed under receivership by the Central Bank of Kenya in October 2015.
   - `AF-KE-2016-01` Chase Bank (Kenya): placed under receivership in April 2016.
   - `AF-KE-2016-02` the interest-rate cap (2016 to 2019): a sector-level case, not a single institution.
4. **Navigation.** Casebook joins the main navigation once at least one case is signed off. Until then it is reachable
   from For institutions ("Casebook licence") and `/desk` only.
5. **Kiswahili Today** (deferred from Phase 1):
   - every "What changed" line in Kiswahili, at `/sw`, linked from the switch;
   - the numbers come from the same code;
   - the sentence frames are written once by hand, in the style of the existing Asubuhi templates
     (`lib/editions/morning-sw.ts`).

## How the sample cases are researched (the rules that matter most)

- **Every fact comes from a primary document:** CBK press releases and Gazette notices, KDIC statements, bank annual
  reports, CBK Bank Supervision Annual Reports, court rulings, and the parliamentary record for the rate cap. Each
  is read through the Probe workflow and quoted with its URL and date.
- **Nothing is filled from memory.** A field the documents do not support stays empty and is flagged
  `TODO(source)` for you. Amounts lost are filled only where published.
- **Named institutions:** these are historical, public, regulator-announced events. The brief's rule against public
  warnings about named institutions covers today's institutions, not past cases. The case pages describe what the
  regulators published, labelled Facts, and any reading of it is labelled Analysis.

## Not in Phase 2

- **The sentinel** (matching today's figures against `conditions_before`) and the Watching block on Today. Both need
  the institutions registry from Phase 3 to compare like with like.
- The comparator, the forecast ledger and Watch packs.

## Checks before the PR

The case validator in pytest and CI, a build, site QA with the new pages added, screenshots at 390 and 1280 in light
and dark, and the preview link.

## Decisions needed from you

1. **The three sample cases:** Imperial Bank 2015, Chase Bank 2016 and the rate cap 2016 to 2019. Approve them, or
   name others (for example a SACCO case, if you have one in mind).
2. **Drafts:** shown only in preview and on `/desk` until you sign each one off. Agree?
3. **Kiswahili Today at `/sw`:** in this phase?
