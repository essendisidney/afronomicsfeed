# Decision log

One entry per decision or experiment: what we believed, what we did to test it, what happened (with evidence), and
what we changed. Newest at the bottom. Read this first every week.

---

### D-001 · 12 Oct 2026 · Consumer tools would bring paying readers
- **Believed:** free consumer tools (pay and rent check, loan-cost scorecard, reader price reports, chama planner,
  diaspora desk) would build an audience that converts to paid.
- **Did:** built and launched them between 9 and 12 Oct.
- **Happened:** 1 reader report in total across all crowd tools; 88 people since 7 Oct; Google sent 10 views in 14
  days; USD 0 collected. (VERIFIED, our database.)
- **Changed:** these move to PARK: kept live, no more building or promotion until there is traffic. No new
  consumer features before the wedge's paid gate.

### D-002 · 12 Oct 2026 · Tender alerts as a quick paid product
- **Believed:** Kenyan SMEs would pay KES 500 a month for daily tender alerts from the regulator's open data.
- **Did:** built the reader, /tenders, alerts and Paystack payment.
- **Happened:** the regulator's OCDS file is a monthly snapshot (30 Sep; 97 open of 4,830 releases); the live list
  returns 429 to every automated request. Daily alerts can't be delivered honestly.
- **Changed:** wording corrected (no "every morning"); product moved to PARK. A request to PPRA for daily open data
  would revive it (founder action).

### D-003 · 12 Oct 2026 · "Paystack is still in test mode"
- **Believed (wrongly):** Paystack only took test payments, because the only payment recorded was a test.
- **Did:** checked the live site's key type through the tender-alert sender, without exposing the key.
- **Happened:** `paid: true`, so a live key is set. The founder had said so.
- **Changed:** state facts only after checking them. Payments are not the constraint; demand is.

### D-004 · 12 Oct 2026 · The wedge: African local-currency debt data for frontier-debt investors
- **Believe:** frontier and EM local-debt teams will pay USD 1,500 a month for a checked, same-day African
  auction feed, because JPMorgan's GBI-EM Edge (launched end-Sep 2026) puts about 44.5% of its weight on Africa.
- **Evidence so far:** the index and its weights as reported by Reuters (via Kitco), CNBC Africa and Enterprise;
  terminal prices around USD 32k a seat (NeuGroup). We cover 6 of the 7 African index markets for bills; bonds
  only for Kenya. No buyer has been asked yet.
- **Test (proposed, awaiting approval):** 25 qualified contacts by week 2 (≥ 5 replies); ≥ 3 pilot keys and
  ≥ 2 weekly users by week 4; ≥ 1 payment by week 8; 2 list-price licences by week 12.
- **Kill:** no pilot after 25 qualified contacts, or no payment after 3 used pilots. Next candidate: the pension and
  SACCO Investment Committee Pack.

### D-005 · 12 Oct 2026 · Stop shipping to production until the founder approves the plan
- **Decided:** paused the Wednesday money sprint (it merged code on its own). Built nothing new for production while
  preparing the Phase 0–2 report.
- **Waiting on:** the founder's go-ahead (see section 8 of `phase-0-2-report.md`).
### D-006 · 12 Oct 2026 · Wedge refined by competitive research: bonds first, a price ladder, all index markets
- **Believed:** the wedge was "African auction data", led by our T-bill coverage, at USD 1,500 a month.
- **Did:** five parallel research passes (`competitive-landscape.md`).
- **Happened:** GBI-EM Edge holds only bonds of more than 2.5 years; T-bills are context, not the product. Its
  African markets include Morocco (8%), Tunisia (5.3%), Côte d'Ivoire and Angola, which we did not list; Senegal is
  not confirmed. USD 1,500 a month is terminal-seat money for a feed that has Kenyan bonds only. The empty band is
  USD 3–20k a year. The buyer pool is about 100–180 institutions (E).
- **Changed:** the product page now shows every African Edge market with honest status, and a ladder (Analyst
  USD 250, Team and API USD 1,500, Enterprise from USD 5,000). Bond readers built in the order Zambia, Egypt,
  UMOA-Titres (8 WAEMU countries), Nigeria, South Africa, Uganda, then Morocco, Tunisia, Angola. 55 prospects logged.
- **Test:** pilot conversations should confirm or move the Analyst price; 10–15 portfolio-manager interviews.

### D-007 · 12 Oct 2026 · Consumer side: sponsorship and remittance referrals, not subscriptions; a legal check
- **Evidence:** Stears' consumer tier gave way to B2B (75% of revenue by 2022); Proshare asked readers for
  donations; only remittance firms run public affiliate programmes (WorldRemit about GBP 30 a customer).
- **Changed:** no consumer paywall. Consumer tools stay parked except remittance referrals once you have joined
  those programmes.
- **Risk flagged:** Kenya's CIS Regulations 2023 (LN 173/2023) restrict advertising of collective investment
  schemes to licensed persons. The fund "Open an account" buttons and any paid fund listing need a lawyer's view.

### D-008 · 12 Oct 2026 · Bond coverage: Zambia and Egypt added (3 of 9 African Edge markets for bonds)
- **Did:** built readers for the Bank of Zambia (JSON:API plus results PDFs) and the Central Bank of Egypt
  (historical-data workbooks), checked on GitHub's network before scheduling.
- **Happened:** Egypt gives 1,577 bond auctions back to 2005 (fixed, zero-coupon and floating-rate), with
  required, submitted and accepted amounts, yield range and coupon. Zambia gives yields and ISINs per tenor; amounts
  parse from the newer notice PDFs only (20 of the 43 newest results), older layouts left null rather than guessed.
  (VERIFIED, inspect runs on 12 Oct.)
- **Changed:** both readers on the two-hourly schedule; `/api/v1/bonds` serves Kenya, Zambia and Egypt in one shape
  (bid-to-cover = bids / amount accepted in every market). Next: UMOA-Titres (8 WAEMU countries), then Nigeria.
- **Outreach:** a draft note and follow-up plan are in `outreach-draft.md`, waiting for the founder's approval.
  Nothing has been sent.

### D-009 · 12 Oct 2026 · WAEMU (8 markets, including Côte d'Ivoire) added through UMOA-Titres
- **Did:** mapped UMOA-Titres' issue listing (1,711 issues, 3,854 security lines since 2017) and each issue's
  results panel; built `umoa_bonds.py`, which pairs each result with its security line and drops any it cannot pair.
- **Happened (VERIFIED, live inspect on 12 Oct):** the five newest issues (Senegal, Burkina Faso, Côte d'Ivoire,
  Niger, Mali) read with tenor, coupon, bids, accepted amount, prices and weighted average yield.
- **Changed:** scheduled (250 new issue pages a run, newest first, so the history fills in about 7 runs);
  `/api/v1/bonds/waemu?issue=senegal`. Bond coverage now: Kenya, Zambia, Egypt and the 8 WAEMU markets. Next:
  Nigeria (DMO), then South Africa and Uganda.

### D-010 · 12 Oct 2026 · Nigeria and Uganda bonds added; South Africa deferred
- **Did:** Nigeria from the DMO's 144 monthly auction summaries (Feb 2013 to Sep 2026); Uganda from the Bank of
  Uganda's 112 bond notices (text, or OCR for image-only notices), each row cross-checked against the notice's own
  bid-to-cover.
- **Happened (VERIFIED, live inspect on 12 Oct):** Nigeria Jul–Sep 2026 and Feb 2013 parse fully; Uganda's 7 Oct
  2026 auction parses fully; image-only Uganda notices need the OCR the scheduled run installs.
- **Changed:** bond coverage is now Kenya, Nigeria, Uganda, Zambia, Egypt and the 8 WAEMU markets: every African
  GBI-EM Edge market except Morocco, Tunisia, Ghana (0.3%) and Angola. South Africa is deferred: it is not in Edge,
  and the Reserve Bank's results search was failing on 12 Oct. Next: Morocco (8%) and Tunisia (5.3%).

### D-011 · 12 Oct 2026 · Morocco (8% of GBI-EM Edge) added; Tunisia blocked for now
- **Did:** Bank Al-Maghrib blocks GitHub's network (CloudFront 403); the Ministry of Economy and Finance's communiqués
  page carries the Treasury's weekly "Résultat de l'adjudication" PDFs and answers. Built `morocco_bonds.py`: one line
  per security with bids (amount, average price and rate) and accepted (amount, price, TMP, previous TMP).
- **Happened (VERIFIED, live inspect on 12 Oct):** the four newest auctions parse after one fix (a missing colon);
  lines the Treasury rejected keep their bids with nothing accepted. The year filter works but each year page lists
  only its latest ~5 PDFs, so deep history needs paging (not done yet).
- **Tunisia:** the Treasury domain does not resolve and the central bank's site shows no auction results; only press
  reports found. Left as a gap, shown honestly on the product page.

### D-012 · 12 Oct 2026 · Check against the prompt: building has run ahead of proof
- **Observed:** since the go-ahead, the work has been Phase 4 (build): bond coverage went from 1 to 15 markets
  (Kenya, Nigeria, Uganda, Zambia, Egypt, Morocco, 8 WAEMU). Phase 3 (prove that someone pays) has not started: 0 of
  55 prospects contacted, 0 pilots, USD 0 collected. The prompt says build what is proven; coverage was built ahead of
  proof, on the reasoning that a pilot offer with Kenya alone was too thin to test the wedge fairly.
- **Changed:** coverage is now enough to run the D-004 test. No new markets until the outreach note has gone to
  the first 10 prospects (founder action) and the first replies are in. Build work in the meantime is limited to
  what makes the pilot convincing (the "Latest results" cards, the sample pack) and keeping readers healthy.
- **Kill rule stands:** no pilot after 25 qualified contacts, or no payment after 3 used pilots.

### D-013 · 13 Oct 2026 · Outreach wave 2 sent; daily desk and sale watch running
- **Did:** 15 more pilot notes sent on 13 Oct (14 wave-2 institutions plus Allan Gray), each address confirmed on the
  institution's own page first (probe run); 5 unconfirmed addresses dropped. Claims trimmed to what the site shows
  (Morocco left out until its data landed; "alerts" removed from the pilot offer). Ninety One's send was blocked by the
  session's safety check and waits in the founder's Gmail drafts.
- **Happened (VERIFIED):** 21 institutions now "contacted" in `deals`; one follow-up each on 21–22 Oct, then stop.
  Payments: 0 real (1 test). Leads: 0.
- **Changed:** the founder delegated day-to-day management. Routines: sale watch every 2 hours (07–21 Nairobi) with
  a FIRST SALE alert; desk operator and customer support three times each weekday; weekly money sprint re-enabled.

### D-014 · 13 Oct 2026 · Country pricing approved (docs/strategy/country-pricing.md)
- **Decided by the founder:** all three recommendations.
  1. Local-institution prices in local currency at 60% of the USD list (South Africa, Egypt, Morocco), 50% (Kenya,
     Nigeria, Ghana, XOF) and 40% (Uganda, Tanzania, Rwanda, Zambia, Malawi, Mozambique), only for organisations
     incorporated, headquartered, licensed and ultimately owned in that country, users in-country, no redistribution.
     Global managers, sell-side desks (including Standard Bank and Absa CIB) and DFIs pay the USD list.
  2. Payment phase 1: one Kenyan Paystack account (KES incl. M-Pesa, and USD cards); other markets see their local
     price and pay a fixed USD equivalent by card, institutions by invoice. Local accounts (Paystack NG/GH/ZA,
     Flutterwave) only when sales in a market justify a local entity.
  3. Timing: the local-institution price sheet is offered now, with the pilot offer and on request; the
     country-priced reader page waits until the first payments. Reader prices unchanged for now (global stays USD 12).
- **Re-pricing rule:** review quarterly; re-price a market when its 30-day average FX is more than 10% off the table
  rate, at once above 20%; increases with 30 days' notice, at most every 6 months.
- **Test:** local-institution pilots requested from Kenya/Uganda/Nigeria within 60 days; if none, drop the sheet.

### D-015 · 13 Oct 2026 · Institutional checkout charged in KES
- **Decided by the founder:** Analyst and Team & API are charged in Kenyan shillings at the rate card's KES 129 to the
  dollar (KES 32,250 and KES 193,500 a month), so M-Pesa, cards and Pesalink all work. PAYSTACK_CURRENCY stays KES
  (verified 13 Oct: set to KES in Vercel for production and preview, the same as the code's default; the live test
  payment settled in KES by M-Pesa). USD list prices stay on the page.
- **Open:** confirm in the Paystack dashboard that M-Pesa accepts KES 193,500 in one payment; until Paystack plan
  codes are set (none are set in Vercel as of 13 Oct), each purchase is one month and does not renew (the page says so).

### D-016 · 13 Oct 2026 · Master plan v2 approved (docs/strategy/master-plan-v2.md)
- **Decided by the founder:** the plan and its 90-day build list, with F1 as follows. Free for everyone: reading the
  site, every table and chart, citing with credit, and the API for the latest 12 months at up to 100 rows a call. A key
  (pilot or paid) is needed for full history, bulk downloads over 100 rows, and any commercial use including internal
  use at a fund, bank or firm. Redistribution is Enterprise only (the "from KES 7,500" line goes).
- **Build now:** (1) measured publication latency per market, (2) bond-result email alerts for key holders,
  (3) API key issued automatically on a Team payment, expiring with the paid period, (4) one set of free/paid terms
  across /developers, /licensing, /data-api and the rate card. The money sprint routine is pointed at this list and the
  D-004 numbers (F6).
- **Gated:** items 5–10 wait for their evidence (first pilot key, first payment, a request, or the D-004 result).
- **Test:** within 30 days, at least 3 pilot keys used on 5+ days; if 0 after 25 contacts, the D-004 kill rule applies.

### D-017 · 13 Oct 2026 · Sales guardrails approved; sales operator switched on
- **Decided by the founder ("approve sales guardrails"):** (A1) the email texts in `docs/sales/sequences.md` are
  approved, so the sales operator may send them (not only draft) to people allowed by `docs/sales/sales-operator.md`
  §2: those who requested a pilot, hold a key, paid, or replied. (A3) One 15-day pilot extension per organisation,
  only if its key was used on at least 5 distinct days. (A4) A deal is set to `won` automatically when a real checkout
  payment (status <> 'test') arrives, with the payment date as `signed_at`.
- **Unchanged guardrails (`docs/sales/playbook.md` §6):** rate-card prices only; the local-institution price only after
  written confirmation of the D-014 eligibility points; Enterprise, discounts, contract terms, liability, exclusivity,
  redistribution, legal, invoices/POs, refunds, new cold contacts and anything uncertain go to the founder.
- **Operational:** weekday sales-operator routine 09:23 Nairobi plus a Friday pipeline report. If Gmail sending is
  blocked by the session's safety check, the operator saves a draft and lists it for the founder.
- **Test:** by 13 Nov, at least 3 pilots used on 5+ days and 1 payment; if 0 pilots after 25 contacts, D-004's kill
  rule applies.

### D-018 · 14 Oct 2026 · Rebuild brief adopted; Phase 1 (Shell) approved and released
- **Decided by the founder:** the rebuild brief (`docs/rebuild/BRIEF.md`) is the plan for the front of the site and
  the Desk layer; the data engine stays. Phase 1 plan approved "with your recommendations": hubs link to existing
  pages (no mass move of addresses), Casebook stays out of the navigation until Phase 2 ships real cases, parked
  routes redirect permanently except `/chama` (live until end of October), Kiswahili Today in Phase 2.
- **Released:** PR #129 merged 14 Oct after build, tests and site QA passed and the founder said "release it".
- **Next:** Phase 2 (Casebook) plan in `docs/rebuild/phase-2-plan.md`, for approval before any code.

### D-019 · 14 Oct 2026 · Receipts adopted; interface standard; editorial calls ledger rules
- **Decided by the founder:** `docs/rebuild/RECEIPTS.md` is the plan for the daily verdict (phases R1 to R6), built
  together with the interface redesign (`docs/rebuild/phase-7-plan.md`). Phase 7a and Receipts R1 approved with the
  recommendations and released as PR #137. Named-company verdicts are allowed under RECEIPTS.md section 2; until the
  first 30 have run cleanly, each needs the founder's one-tap approval, and a Receipt on a live public offer gets a
  Kenyan securities lawyer's read first.
- **Speed budget:** layout shift budget set to 0.1 (Google's "good" threshold) instead of the plan's 0.05;
  `/rates/kenya`, `/registry` and `/receipts` come under 0.05 in 7b.
- **Editorial calls ledger (R2, `docs/rebuild/receipts-r2-plan.md`):**
  - A narrow exception to D-005: a pull request may merge without the founder's approval when it touches only
    `data/forecasts/editorial.json`, every check passes, and each outcome it adds quotes its source and links to it.
  - A call whose check date has passed when its Receipt is published is never written (no credit for hindsight); it
    is listed as not recorded.
  - A void call (the event could not happen) stays visible with its source and is left out of the hit rate.

### D-020 · 15 Oct 2026 · Quickmart Receipt published; legal read waived by the founder
- **Decided by the founder:** publish the Quickmart IPO Receipt as written, without the Kenyan securities lawyer's
  read that D-019 requires for a verdict on a live offer. The founder takes responsibility for its Opinion paragraphs.
  This waiver is for this Receipt only; the D-019 rule stands for later ones.
- **Disclosure confirmed by the founder:** Afronomics and its founder hold no Quickmart shares and earn nothing from
  the offer.
- **Checks done first:** every figure checked against the information memorandum (`docs/rebuild/quickmart-source-checks.md`).
- **Until R3:** the full file shows as "Coming with Pro", listing what it will hold; nothing is sold as already
  delivered. (The R3 paywall decision becomes D-021.)
