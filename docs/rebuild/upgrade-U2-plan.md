# U2 plan: Shillings found (for the founder's approval)

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U2, after the U0 audit (`upgrade-audit.md`). **Approved by the
founder on 22 Oct 2026 ("approve U2 plan"), with decisions A to E as recommended; logged as D-029.** One pull
request for the whole phase.

## 1. What U2 is

Each money tool ends with one deterministic line: what the reader's option costs or earns, the cheapest or
best-earning option we hold for the same use, and the difference per year, with the source and date of both
sides. Every result like that is counted (anonymously) and added to a public total: **shillings found**.

House rules that shape it (UPGRADE §1, `README.md`, D-028):

- Code computes every figure; the line is built from a template, never written by a model.
- Information, not advice. The line says "The cheapest option we track costs KES X a year less", never "switch",
  "move" or "you should".
- If we do not hold a comparable option, the tool says nothing new and nothing is counted.
- A difference shown is not money moved. The counter says so wherever it appears.

## 2. Tool by tool

What "comparable" means for each tool, using only data we already hold (audit §3 and §4). "Option" means a product
a reader can actually take, with a published price. An **average** (CBK's bank lending average, SASRA's sector
dividend) is a benchmark, not an option. See decision A in §6.

| Tool | Reader's side | Comparable option we hold | Difference counted | Source and date of the comparable |
| --- | --- | --- | --- | --- |
| **Is my rate fair? (save)** `/rates/kenya/check` | Rate offered, amount | Best published money market fund after 15% tax (already computed); the 364-day T-bill after tax | Yearly KES gap to the best fund, if positive | Fund manager's published yield and read date (`data/kenya/rates.json`, `mmf_history.json`) |
| **Is my rate fair? (borrow)** | Rate, amount | **None is an option.** CBK's average lending rate is a benchmark | Shown as today, **not counted** unless decision A says otherwise | CBK, month of the average |
| **Is my rate fair?** Ghana, Nigeria | Rate offered, amount | Government bill after tax (an option a saver can buy) | Yearly gap in GHS or NGN | Bank of Ghana or CBN auction, date |
| **Mobile loans** `/rates/kenya/mobile-loans` | New: pick the product you use (M-Shwari, Tala, Fuliza), amount, how many times a year | Cheapest of the three we hold, same amount and term, on the page's existing yardstick (`mobileLoanBoard`) | Cost per loan × loans a year | Provider's published terms, read 5 Oct 2026 |
| **M-PESA and Fuliza** `/rates/kenya/mpesa-charges` | Fuliza part only: amount and days on Fuliza | Cheapest mobile loan we hold for the same amount and days | Cost difference × times a year | As above. **M-PESA send and withdraw charges: no comparable held** (we hold no other wallet's tariff), so nothing new there |
| **Loan true cost** `/rates/kenya/loan-cost` | Amount, rate, fees, term | **None is an option** (only the CBK average) | Not counted unless decision A | — |
| **Money market funds** `/rates/kenya/money-market-funds` and `/best-money-market-fund` | New: pick your fund, amount | Best published fund after tax | Yearly KES gap, if positive | As the save row |
| **Sending money home** `/rates/remittances`, `/diaspora` | New: pick the service you use (from the World Bank's list for that corridor), how often you send USD 200 | Cheapest service on the same corridor in the same survey | Cost difference per USD 200 × sends a year, in USD and in KES at the USD/KES rate already shown on Today | World Bank Remittance Prices Worldwide, survey quarter |
| SACCO rates, savings goal, debt plan, net salary, T-bill calculator, IPO helper, chama | — | No comparable option held (SACCO loan rates are a data gap; the others are not comparisons) | Nothing | — |

So five tools get a counted line in this phase (save check in three countries, mobile loans, Fuliza, MMF, sending
money home). The rest are unchanged.

### The line, worked example (illustrative wording, figures computed at run time)

> Your fund keeps 11.20% after tax. The best-earning fund we track, Example Fund, keeps 13.05% (its published yield
> on 21 Oct 2026). On KES 100,000 for a year, that is **KES 1,850 a year more**. Sources: your entry; Example Fund's
> factsheet, 21 Oct 2026. Information, not advice.

When the reader's option is already the cheapest or best we hold, the line says so and nothing is counted.

## 3. Counting it

**Migration 0046 `shillings_found`**, on the 0038 pattern (RLS on, no policies, SECURITY DEFINER functions):

- Table `found_daily(day, tool, market, currency, results, total_minor)`: one row per day, tool, market and
  currency; `results` is how many lines were shown with a positive difference, `total_minor` the sum in minor
  units (cents). **No inputs are stored**: no amount, rate, product picked, IP address, device id or path beyond
  the tool name.
- `af_found_add(tool, market, currency, minor)` adds one result. It is called by a new `POST /api/found`, never from
  the browser to the database.
- **Abuse guard:** the route recomputes the difference on the server from the same inputs and the same data files
  (the inputs are used for that one calculation and dropped), refuses a difference above a per-tool cap (decision
  C), and counts at most one result per tool per page view (as `rate_check` does today: after the reader stops
  typing for 1.5 s). Owner devices are not counted (`isOwnerDevice`, as `lib/track.ts`).
- **Kenya Data Protection Act:** nothing stored identifies a person, so the table holds no personal data. No cookie
  is set. `/legal/privacy` gets one sentence saying what is counted.
- `af_found_total(since)` returns totals by tool, market and currency for the counter and the desk.

## 4. Where it shows

- **Today and `/method#shillings-found`:** "Shillings found by readers since <start date>: KES X (and USD Y on
  sending money home)", with how it is counted and its limits: a difference shown is not money moved; one reader
  can be counted more than once; amounts are what readers typed. Currencies are never added together.
- **Share card** for each result (`lib/share.ts`, new kind `found`), in the Laterite look (D-026). By default it shows
  the tool and "the cheapest option we track costs KES X a year less" with **no personal figures**; the reader can
  tick "include my figures".
- **Founder's desk email** (`app/api/send/desk`): one weekly line, shillings found by tool, this week and in total.
- The counter shows only once the total is above zero.

## 5. Build list and checks

1. `lib/found.ts`: pure functions per tool (difference, wording, sources), with unit tests covering positive,
   zero and negative differences, a missing comparable, and caps.
2. The five tools: add the pickers named in §2 and the line, using the shared UI kit.
3. Migration 0046, `app/api/found/route.ts`, tests for the recompute and the cap.
4. Counter component on Today and `/method`; share card kind; desk email line.
5. Kiswahili for the line and the counter on `/sw` (decision D).
6. Checks: `tsc`, `eslint`, `pytest tests/site tests/readers`, `npm run build`, site QA; screenshots of each tool
   with a result at 390px and 1280px, light and dark, before and after. The migration is applied only after the
   founder approves the pull request.

Size: medium (about 2–3 days of agent work). No new data sources, no paid services.

## 6. Decisions for the founder

- **A. Averages.** Count only real options (recommended), or also count the gap to CBK's average lending rate on
  the borrow check and loan cost? Counting averages would make the counter bigger but less honest: nobody can take
  "the average bank loan".
- **B. Start date** for the public counter: the day this phase is released (recommended), with no back-filling.
- **C. Caps** per result: KES 500,000 a year on savings and loans, USD 2,000 a year on sending money home
  (recommended), so one mistyped amount cannot swamp the total.
- **D. Kiswahili:** ship the line and counter in Kiswahili on `/sw` at the same time (recommended), or English first.
- **E. Name:** "Shillings found" on Kenya pages, and "Money found" where the currency is not the shilling (cedis,
  naira, dollars)? Recommended.

### Decided (22 Oct 2026, D-029)

A. Only real options are counted; the gap to an average is shown as today and never counted. B. The counter starts
on release day, no back-filling. C. Caps: KES 500,000 a year (savings, loans; the same in GHS and NGN converted at
the day's rate we show, or left uncounted if we show none) and USD 2,000 a year (sending money home). D. Kiswahili
ships with it on `/sw`. E. "Shillings found" on Kenya pages; "Money found" elsewhere.
