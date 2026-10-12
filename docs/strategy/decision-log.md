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
