# U4 plan: Reference rates others can cite and license (for the founder's approval)

**Approved by the founder on 22 Oct 2026 ("approve U3, U4, U6 and U7 as recommended"; D-033): every decision at its recommended option.**

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U4, after the U0 audit (`upgrade-audit.md` §3, §4 and §6). The
founder asked for U4 to run alongside U2, U3, U6 and U7 ("run U4 alongside too"). One pull request for the whole
phase, from branch `claude/upgrade-u4`. **Not yet approved.** A first build is on the branch so the founder can see
it; nothing is merged, deployed or priced.

## 1. What U4 is

Two Afronomics numbers that others can quote, cite and license with confidence, because the method, the revision
rules and the governance are published:

- **ASBI**, the Afronomics African Sovereign Bill Index (exists since 5 Oct 2026, `/markets/bill-index`, weekly
  releases in `editions/index/`). Missing: a method document, a revision log and a governance file.
- **KCCI**, a new Kenya Cost of Credit Index (v0): what it costs to borrow KES 1,000 for 30 days, by kind of lender,
  from data we hold with sources and dates.

House rules that shape it (UPGRADE §1 and §5, `README.md`, D-028):

- Both are labelled **indicative reference rates** until the founder appoints an oversight panel. The panel's role,
  terms and conflicts policy are written; the member list is blank. Nobody is named who has not agreed.
- IOSCO's Principles for Financial Benchmarks are used as a **checklist**, not claimed as compliance.
- No figure from memory or a model. A missing input is shown as a gap.
- Categories, not companies (D-028). A provider's published price may be an input, with its source, but the index
  never rates or ranks a lender.
- No prices are set or changed. Terms text only.

## 2. Sovereign Bill Index (ASBI)

### What is published

| Piece | File | Shown on |
| --- | --- | --- |
| Method v1.0: purpose, inputs and sources, formula, cut-off, rebasing and changes to the market set, data insufficiency, errors/revisions/restatements, governance and conflicts, review cycle, cessation, complaints, IOSCO checklist (19 principles with an honest status each) | `content/methods/asbi.md` | `/markets/bill-index/method` |
| Revision log (hand entries) | `content/methods/asbi-revisions.md` | same page, `#revisions` |
| Release vs recomputed series (automatic) | `lib/index-revisions.ts` (pure, tested), `lib/data/index-releases.ts` | same page, table under the log |
| Governance and oversight (shared with KCCI) | `content/methods/governance.md`; `docs/governance/oversight.md` points to it | both method pages, `#governance` |
| How to cite and licence terms | `lib/reference-rates.ts`, `components/data/ReferenceTerms.tsx` | both method pages and the KCCI page, `#cite` |

### What the work found

- **The live series silently revises past weeks.** The chart and `/api/v1/index` recompute every week from the
  auctions held today. Results that reach us after the Monday 07:30 cut-off (Ghana, Uganda, South Africa, Malawi so
  far) move past readings. The release of 5 Oct 2026 printed **12.331%**; the same week now recomputes to
  **12.382% (+5.1 bps)**, mostly Uganda's 1 October result arriving late. 12 Oct: 12.372% → 12.371%. 19 Oct:
  12.368% → 12.365%. None is an error. The method makes the **Monday release the value of record** (decision B), and
  the method page lists every difference automatically.
- **Data-insufficiency gap in the code.** If the current week had fewer than six markets, the series came back empty
  and the index page, release and API would have shown nothing. Fixed in `lib/data/bill-index.ts`: the latest valid
  reading stays the latest, with its own date. No published value changes (no release has had fewer than six).
- The method in force is unchanged otherwise: equal weights, 364-day primary results, 120-day staleness, six-market
  minimum, three decimals.

## 3. Kenya Cost of Credit Index (KCCI) v0

`lib/cost-of-credit.ts` (pure, no imports, unit-tested in `tests/site/test_cost_of_credit.py`), fed by
`lib/data/cost-of-credit.ts` from `data/kenya/rates.json` and `data/kenya/mobile_loans.json` only. Page
`/rates/kenya/cost-of-credit`, method `/rates/kenya/cost-of-credit/method` (`content/methods/kcci.md`).

| Category | Input | Rule | Reading on 22 Oct 2026 |
| --- | --- | --- | --- |
| Bank loans | CBK weighted average lending rate, latest month | Counts for 120 days after the month ends | **14.34% a year; KES 11.79 per KES 1,000 for 30 days** (CBK, August 2026) |
| Mobile loans | Providers' own published charges, fees and excise included, KES 1,000 for 30 days, simple yearly rate | Median of products read within 92 days with a full price; at least two; a "from" price is shown, not counted | **170.33% a year; KES 140 per KES 1,000 for 30 days** (median of two products, terms read 5 Oct 2026; a third, published as "from 0.3% a day", is shown, not counted) |
| SACCO loans | — | **Gap.** We hold no published SACCO loan rates (SASRA publishes dividends and deposit interest only) | None |
| Digital loan apps | — | **Excluded** pending decision A: our loan-app figures are borrowers' unverified reports, not published prices | None |

No single blended number in v0: we hold no lending volumes to weight one, and it would jump when SACCO loans come
in. The page shows each category, every input with its source and date, the gaps, and "Information, not advice."

## 4. Build list and checks

Done on the branch (first build, for review):

1. Method, revision log and governance documents; `/markets/bill-index/method`; link from `/markets/bill-index`;
   API `method` link points to the method page.
2. KCCI module, loader, page and method page; nav entry under Kenya rates; sitemap; site QA page list.
3. Tests: `tests/site/test_cost_of_credit.py` (yardstick, windows, minimums, gaps, alphabetical not ranked, reading
   from today's files), `tests/site/test_index_revisions.py` (late result, dropped market, saved releases readable).

After approval (not done):

4. `/api/v1/cost-of-credit` and a CSV, under the existing free/keyed terms (UPGRADE U4 last bullet).
5. Monthly KCCI release saved as published (`editions/kcci/`), on the publication day the founder picks (decision
   E). This needs a new scheduled workflow, so it waits for approval.
6. One line on `/licensing` pointing to the reference-rate terms. Left out now because `/licensing` carries prices
   and U6 may touch it.
7. SACCO loan rates: a `data/kenya/sacco_loans.json` of SACCOs' own published loan rates with links and dates (shared
   need with U3). The KCCI SACCO line fills when at least three are held (proposed).
8. Chain-linking for the ASBI, so adding or removing a market no longer changes history.

Checks run on the branch: `tsc`, `eslint` on changed files, `pytest tests/site tests/readers`, the new unit tests,
`npm run build` with Supabase on a dead port, site QA `--serve`, screenshots at 390px and 1280px in light and dark.

Size: small to medium. No new data sources, no paid services, no schema change, no migration.

## 5. Decisions for the founder

- **A. Loan apps in the KCCI.** Keep borrowers' reports out (recommended), until a method exists to verify them
  (for example, a report counts only with a loan statement), or let them in as a separate, labelled "reported"
  line that never mixes with published prices?
- **B. Value of record for the ASBI.** The frozen Monday release (recommended, as IOSCO practice), with later results
  listed as revisions; or the recomputed series, with the releases treated as provisional?
- **C. Licence terms wording** (`lib/reference-rates.ts`): benchmark use (contracts, settlement, fund performance,
  products that track the index) only by a separate written licence. Should Afronomics offer benchmark licences at
  all while the indices are indicative and there is no panel? Recommended: not until the panel exists; the terms
  text can stay as written. **Any price for a benchmark licence is yours to set; none is proposed here.**
- **D. Names.** "Afronomics African Sovereign Bill Index (ASBI)" (unchanged) and "Afronomics Kenya Cost of Credit
  Index (KCCI)" (recommended), or another name for the new one?
- **E. KCCI publication day.** Monthly, on the first working day of the month (recommended), or the Monday after CBK
  posts a new monthly lending average?
- **F. "From" prices.** Show but do not count a provider's "from" price (recommended), or count it as a floor?
- **G. Oversight panel.** Three seats, two independent, two-year terms, unpaid or a fixed fee not linked to readings
  or licence income (as written in the governance file). Agree the shape; names only once people agree in writing.
  Any fee is yours to set.
- **H. Your conflicts declaration** as method owner (the governance file shows it as "Due").
