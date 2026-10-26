# Named institutions: one rule

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` section 2. **Status: in force since 22 Oct 2026 (D-028).** This
file is the one rule; `README.md`, `AFRONOMICS_BUILD_PLAN.md`, `docs/rebuild/BRIEF.md` and `docs/rebuild/RECEIPTS.md`
point here. Section 1 records the conflict it resolved.

## 1. The conflict today

The repository says two different things about publishing a judgement on a named company, institution or person.

| Says "no verdict on a named institution in public" | Says named-company verdicts are allowed |
| --- | --- |
| `README.md`, "The honesty rules" (line 87) | `docs/rebuild/RECEIPTS.md` section 2 ("Rules for anything that names a company…") |
| `AFRONOMICS_BUILD_PLAN.md` section 4 (line 91) | D-019 (named-company verdicts allowed; one-tap approval for the first 30; a lawyer's read for a live offer) |
| `docs/rebuild/BRIEF.md` section 2 ("Warnings about a named institution go only to that institution's own board") | D-020, D-022 (legal read waived for Quickmart and Dangote), D-025, D-027 (published without a right of reply) |
| `docs/rebuild/phase-3-plan.md` (registry: "no ratings, no warnings … on any named institution") | The live site: 5 published Receipts that name companies (below) |
| `docs/rebuild/phase-5-plan.md` (Watch pack stays private) | |

There is a second conflict about approval:

- `RECEIPTS.md` section 2: "Fully autonomous. No human approves a Receipt."
- D-019: "until the first 30 have run cleanly, each needs the founder's one-tap approval."
- D-027 skipped the right of reply that the in-house legal read (`docs/legal/read-2026-10-16-held-receipts.md`)
  recommended for Fuliza and Kenya Airways.

### Named-company Receipts as of 22 Oct 2026 (VERIFIED in `content/receipts/`)

| Receipt | Names | Status | How it was released |
| --- | --- | --- | --- |
| Quickmart IPO (14 Oct) | Quickmart | published | Founder approval; live offer; lawyer's read waived (D-020) |
| Dangote refinery IPO (15 Oct) | Dangote | published | Founder one tap; live offer; lawyer's read waived (D-022) |
| Banks lend to government (15 Oct) | KCB, Equity, Co-op Bank | published | Founder approval after in-house legal read (D-025) |
| Fuliza true cost (15 Oct) | Safaricom, NCBA, KCB, Sidian | published | Founder approval; right of reply skipped (D-027) |
| Kenya Airways bailout bill (15 Oct) | Kenya Airways | published | Founder approval; right of reply skipped (D-027) |
| Safaricom stake sale (15 Oct) | Safaricom, Vodacom | **draft** | Held: in litigation; needs an advocate's read (D-023, D-025, D-027) |

So 5 named-company verdicts have run toward the D-019 count of 30, all with the founder's approval. Corrections
logged: **0** (`lib/corrections.ts` is empty; `af_corrections` has 0 rows). The other 6 published Receipts are data,
sector or government-borrowing verdicts.

## 2. The proposed rule

One rule, which `README.md`, `AFRONOMICS_BUILD_PLAN.md`, `BRIEF.md` and `RECEIPTS.md` would each point to instead of
restating it.

1. **Data, sector-level and government-borrowing Receipts** are fully autonomous behind the confirming agent. No
   human approval. (This is what D-023 and D-024 already did in practice, with the founder approving; under this rule
   the confirming agent is the gate.)
2. **A verdict naming a company, institution or person** is checked by the confirming agent, then waits for the
   founder's one-tap approval on `/desk`, until **30 such Receipts have run with no correction**. The count shows on
   the desk. It starts at **5** (the five above). A correction resets nothing but is shown next to the count, and the
   founder decides whether the gate should restart.
3. **Right of reply.** A named-company Receipt sends the subject the factual claims and a right of reply through
   `desk@`, and waits **3 working days** by default. The send, the date and any reply are logged on the desk. A reply
   is quoted on the Receipt the same day. For a breaking event, the facts-only part (Facts paragraphs, no Analysis or
   Opinion) may publish first; the verdict follows after the reply window.
4. **Live public offers and anything in litigation** need an advocate's read before publishing. If the founder
   waives it, the waiver is logged as its own decision, as D-020 and D-022 were.
5. **Ratings or scores of named institutions** (UPGRADE U5, for example a peer table that ranks) follow the same
   gate, and the scoring method is public on `/method` before the first score is published.
6. **Unchanged:** the public registry and Compare show the regulators' figures with no grades; a SACCO set against
   SASRA's minimums stays private to its own Watch pack; casebook entries describe past, regulator-announced events
   (`phase-2-plan.md`). Every RECEIPTS.md section 2 rule on sources, allegations, opinion and disclosure still applies.

### What this changes in practice

- D-027's choice (no right of reply) would no longer be the default; the founder could still waive it per Receipt,
  logged as a decision.
- "No human approves a Receipt" (RECEIPTS.md) becomes true for data and sector Receipts only.
- The desk needs two small additions: the named-verdict count (5 of 30) and a right-of-reply log. Both are UPGRADE
  U7 items; until they exist, the count and log live in this file's section 1 table.

## 3. Decided (22 Oct 2026, D-028)

1. **Rule approved as written** by the founder ("approve the rule").
2. **The count starts at 5**, as section 2 rule 2 says: the five named-company Receipts already published with the
   founder's approval. 5 of 30, 0 corrections.
3. **No courtesy right-of-reply emails** to Safaricom or Kenya Airways for the Receipts already published: the founder
   has not asked for them, and outgoing email is on hold. Rule 3 applies to new named-company Receipts.
4. **The Safaricom stake-sale Receipt stays held** until an advocate has read it (rule 4).

Until the desk shows the named-verdict count and a right-of-reply log (UPGRADE U7), keep them in the section 1 table
above.
