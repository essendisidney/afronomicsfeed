# Phase 3 plan: Registry and Compare

Written 14 Oct 2026 for `docs/rebuild/BRIEF.md` (section 8, item 3). **Status: waiting for founder approval.** No
code until approved. Branch `rebuild/phase-3`; one PR; merge only with your approval.

## What the regulators actually publish (checked 14 Oct 2026)

Read through the Probe workflow (runs 134–142); nothing below is from memory.

| Source | Covers | Per-institution fields | How often | Format |
| --- | --- | --- | --- | --- |
| SASRA licensed list (`sasra.go.ke/download/list-of-licensed-…-2026/`) | 176 deposit-taking SACCOs, 176 non-withdrawable-deposit SACCOs, 5 restricted, 1 revoked, 1 expired | Name, address, head office, county, licence status; reasons for revocation | Yearly (Jan–Mar); 2020, 2021, 2023–2026 online | Text PDF in two newspaper-style columns |
| SASRA Supervision Annual Report (2025 edition, 274 pages, Sep 2026) | Appendices III–VIII: growth indicators, stability indices and directory for DT and NWDT SACCOs | **Not yet verified**: the appendices are on pp. 170–273, beyond what the probe can read today. Titles suggest assets, deposits and loans for every SACCO | Yearly, about 9 months after year-end | Text PDF |
| SASRA quarterly reports | Sector totals only | None | Quarterly | PDF |
| CBK microfinance directory (Feb 2026) | 14 microfinance banks | Name, contacts, date licensed, branches | A few times a year | Text PDF |
| CBK bank directory (Jul 2026) | 38 banks, 1 mortgage lender | Contacts, date licensed, **peer group (large / medium / small)**, branches | A few times a year | Text PDF |
| CBK Bank Supervision Annual Report 2025, Table 5 | All 14 microfinance banks | Gross assets, deposits, shareholders' funds, deposit and loan accounts, market-size index, peer group | Yearly | Text PDF |
| CBK report appendices i–xii | Every bank and microfinance bank | **Not yet verified** (pp. 96–107): titles say balance sheet, profit and loss, loans and bad loans, capital | Yearly | Text PDF |

What this means:
- **Per-institution figures are yearly, not quarterly.** Neither regulator publishes per-SACCO or per-MFB figures more
  often. Microfinance banks must show quarterly statements at their premises, not publish them. The registry says so
  plainly instead of implying fresher data.
- **The two big appendices still need checking** before any reader is written for them.

## What Phase 3 delivers

1. **Probe upgrade (first, small).** A `pages` option for `scripts/probe.py` (for example `170-188`), so the SASRA and
   CBK appendices can be read and their columns confirmed. If a table is a scanned image or its columns can't be read
   reliably, it is left out and listed in the PR, not guessed.
2. **Readers on the schedule**, with the same rules as the auction readers: only new rows are appended to `data/`,
   history is never rewritten, and every row keeps its source link and as-of date. Each reader has offline tests
   against saved copies of the documents.
   - `sasra_list.py`: the yearly licensed list, every schedule, with a two-column-aware parser.
   - `sasra_annual.py`: per-SACCO assets, deposits and loans from the annual report appendices (once verified).
   - `cbk_directories.py`: the bank and microfinance directories, found through CBK's own site search, which avoids
     guessing dated upload paths.
   - `cbk_bsar.py`: Table 5 and the verified appendices of the Bank Supervision Annual Report.
   - **One monthly workflow** (`registry.yml`) runs them all. It commits only when a regulator has published something
     new, and the desk's data-health panel shows when each source was last read.
3. **Registry pages.**
   - `/registry`: every licensed SACCO, microfinance bank and bank, with filters by type, county and licence status.
   - `/registry/[slug]`: one institution. It shows:
     - its licence history from each year's list;
     - its published figures by year, each with an evidence tag;
     - the casebook cases that name it, if any.
4. **Compare, rebuilt.** Peer tables from the registry:
   - SACCOs by size band;
   - microfinance banks against each other;
   - banks by CBK's own peer group.

   Columns are only the published figures, plus growth on the previous year worked out by code. There are no scores,
   no grades and no "best" labels. The existing savings tables stay linked.
5. **CSV download.** The latest year is free; the full history comes with a key, the same rule as the rest of the data.
6. **Navigation.** Compare stays in the main navigation and gains the registry. The Phase 2 checks against case
   conditions (the sentinel) can be built after this, because there are now like-for-like figures to compare.

## Rules that matter most here

- **Facts only, from the regulator.** No ratings, no warnings, no "at risk" labels on any named institution in public.
  The brief keeps warnings about a named institution private, for that institution's board only (Phase 5).
- **A SACCO's or bank's name is matched across years by code, with a manual alias file for renames and mergers**
  (for example Nufaika's revocation after a merger). Nothing is merged on a guess; unmatched names are listed in the PR.
- **Counts are shown as each document states them.** SASRA's own counts differ between its list (176) and its annual
  report (179). Both are shown with their sources, and the difference is not reconciled.

## Not in Phase 3

- The sentinel and Watching block (after this phase, once the registry exists).
- The forecast ledger (Phase 4) and Watch packs (Phase 5).
- Commercial banks' own quarterly statements, published on each bank's site. They are a later addition if you want
  them; Phase 3 uses only the regulators' documents.

## Checks before the PR

Reader tests offline, the existing tests, a build, site QA with `/registry`, one SACCO page, one microfinance bank
page and Compare added, screenshots at 390 and 1280 in light and dark, and the preview link.

## Decisions needed from you

1. **Scope:** SACCOs (both types), microfinance banks and banks (recommended, because the bank directory and peer
   groups come almost free), or SACCOs and microfinance banks only, as the brief says?
2. **History:** start with the latest two years (2024 and 2025) and backfill to 2020 in a follow-up (recommended), or
   backfill everything in this phase?
3. **Public institution pages:** one page per institution at `/registry/[slug]`, indexed by search engines
   (recommended, because people search for their SACCO by name), or the registry table only?
