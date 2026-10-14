# Phase 5 plan: Watch pack

Written 14 Oct 2026 for `docs/rebuild/BRIEF.md` (section 8, item 5). **Status: waiting for founder approval.** No
code until approved. Branch `rebuild/phase-5`; one PR; merge only with your approval.

## What it is

A private pack for one SACCO's board and management, every quarter. It shows where their SACCO stands against its
peers and against SASRA's own standards, what the money markets pay this quarter, and the lessons from past failures.
It is built entirely from public data:
- the regulators' figures (Phase 3 registry);
- auction results and the forecast ledger (Phase 4);
- the casebook (Phase 2).

It reuses the Investment Committee Pack engine: A4 pages, the institution's name on the cover, print to PDF. It is
a pack *about the subscriber*, not only about the market.

## The honest limit, stated in the pack

SASRA publishes per-SACCO figures **once a year**, about nine months after year-end. A quarterly pack therefore
combines:
- the latest yearly per-SACCO figures, dated (now 31 Dec 2025);
- SASRA's **quarterly** sector totals (assets, loans, deposits, soundness ratios for all DT-SACCOs), the newest
  being June 2026;
- this quarter's market data.

The pack says so on page 1. It never implies quarterly figures for the SACCO itself. If the SACCO sends its own
quarterly returns (optional, private), those can go in a later version, clearly labelled as "from your SACCO".

## Pages

1. **Your SACCO at a glance.**
   - Licence status and size tier.
   - Total assets, gross loans and income, with growth.
   - Each figure next to the **median of its SASRA tier**, worked out by code, with source and page.
2. **Soundness against SASRA's minimums.**
   - The four prescribed ratios, each set against SASRA's prescribed level (from the report) and the tier median:
     core capital to assets (10%), core capital to deposits (8%), institutional capital to assets (8%) and
     external borrowing (25% maximum).
   - The NPL ratio next to the tier median.
   - Plain wording, for example "8.0%, at the 8% minimum", with no adjectives.
   - **This page is the only place a named SACCO is compared with the minimums, and it goes only to that SACCO**
     (brief, section 2: warnings about a named institution go privately to its board).
3. **The sector this quarter.** SASRA's latest quarterly totals for DT-SACCOs, with the change on the quarter
   before. This needs a small new reader for the quarterly report (`sasra_quarterly.py`), a six-page PDF of sector
   totals.
4. **Where surplus funds earn.**
   - T-bill and bond rates this quarter, after withholding tax.
   - The forecast ledger's ranges for the coming auctions, and its live hit rate.
   - Money market fund yields, as in the committee pack.
5. **Lessons from the casebook.** Two or three signed-off cases, each as "what happened, and the question a board
   can ask". Shown only once you have signed cases off. Until then the page says it is coming, and shows no draft
   material.

Every figure carries its source and as-of date. Information, not advice.

## Delivery and access

- **One private link per subscribing SACCO.** It uses the existing download-key system (migration 0039), so the
  pack is never public, and the key can be revoked.
- **Emailed by Resend** to the named contacts at the start of each quarter, with the PDF attached and the link.
- **The desk** gets a "Watch packs" panel: who is subscribed, when each pack was sent, and a preview for each
  SACCO.

## The sample on For institutions

Making a public sample from a real, named SACCO would publish the private page 2 comparison for an institution that
hasn't asked for it. So the sample uses a **"median large-tier SACCO"**: every figure is the median of SASRA's large
tier, worked out by code and labelled as such. It is the real layout with real numbers, but it describes no
institution.

## Price (your decision)

The rate card has the committee pack at KES 12,000 a month (KES 18,000 with alerts). Options for the Watch pack:
- **A. Add it to "Pack with alerts" for SACCO subscribers, at no extra charge.** This makes the existing offer
  stronger for the SACCO buyer, with nothing new to sell. *(Recommended to start: one product, one price, easier
  first sale.)*
- **B. A separate quarterly product.** The price is set by you, and added to the rate card so every page shows the
  same number.

No price is invented in this phase. Option B uses the number you give.

## Not in Phase 5

- Packs for banks or microfinance banks. They are the same engine, but each needs its own peer and standard pages.
  Later, if you want them.
- The SACCO's own quarterly returns (needs their consent and a private upload).
- Phase 6 (clean-up).

## Checks before the PR

- Tests on fixtures:
  - tier medians;
  - ratio-against-minimum wording, with no adjectives;
  - the quarterly sector reader;
  - the pack is refused without a valid key;
  - the sample contains no SACCO name.
- The existing tests, a build, and site QA with the sample page added.
- Screenshots of the sample pack (A4 and phone), and the preview link.

## Decisions needed from you

1. **Price:** A (in "Pack with alerts" for SACCOs, recommended) or B (separate, at your price)?
2. **The public sample:** a median large-tier SACCO (recommended), or a real SACCO with its written consent?
3. **Page 2 wording:** figures beside the minimums only (recommended), or also a one-line "meets / below the
   minimum" marker? Both are private to that SACCO.
