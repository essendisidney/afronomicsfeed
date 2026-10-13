# Legal review, October 2026

**Read this first.** This is general legal information written by Afronomics Feed's in-house AI adviser. I am not a
licensed advocate, and nothing here is legal advice on which you should act without a Kenyan advocate (and, for
Nigeria, a Nigerian legal practitioner). Its purpose is to help the founder decide what to take to an advocate, in what
order, and with which documents. Where I could not read the primary text of a law, I say so.

**Date:** 13 October 2026. **Scope:** afronomicsfeed.com (brand "Afronomics" / "Afronomics Feed", publisher named on
the site as "Pesara Limited", Nairobi). **Inputs read:** `docs/strategy/competitive-trust-audit.md`,
`docs/security/security-review-2026-10-13.md`, `docs/sales/playbook.md` and `docs/sales/templates/`,
`docs/strategy/{decision-log,country-pricing,partners-and-revenue,horizon-scan,master-plan-v2}.md`,
`lib/billing/ratecard.ts`, `lib/site.ts`, `app/legal/**`, `app/about`, `app/imprint`, `app/editorial-standards`,
`app/trust`, `app/buying`, `app/licensing`, `app/prices`, `app/developers`, `components/billing/DataTerms.tsx`,
`components/billing/PilotForm.tsx`, `lib/data/fund-links.ts`, `lib/data/fx.ts`, `data/eurobonds.json`,
`app/rates/kenya/{money-market-funds,best-money-market-fund,loan-apps}`, `components/data/MmfMonthView.tsx`, `app/jobs`.

**Labels.** **SEARCH** = read in a web-search extract of the source on 13 Oct 2026 (this environment could not open
kenyalaw.org, cma.or.ke, odpc.go.ke, kra.go.ke or exchangerate-api.com directly: the proxy refused them, so primary texts
were read only through search extracts). **REPO** = checked in this repository. **KNOWN** = widely known, not
re-checked today. **UNVERIFIED** = I could not confirm it; an advocate or the founder must.

---

## 0. Summary: the ten biggest legal risks, ranked

| # | Risk | Level | Where | Fix (owner) |
|---|---|---|---|---|
| 1 | **Promoting collective investment schemes.** "Open an account" buttons on every Kenyan money market fund, a monthly "Best money market fund in Kenya" ranking and a monthly ranking email, with a built-in path to paid fund referrals. The CIS Regulations 2023 restrict who may advertise a scheme and require trustee approval of adverts | **High** | `app/rates/kenya/money-market-funds/page.tsx`, `components/data/MmfMonthView.tsx`, `lib/data/fund-links.ts`, `app/go/fund/[slug]` | Do not set any `AFF_FUND_*` referral until an advocate signs off; consider removing "Open an account" (keep the source link); ask CMA for a no-objection view (§2) |
| 2 | **Licensing data we have no right to license.** The licensing page offers the FX archive (from ExchangeRate-API, whose free feed forbids redistribution) and "the Wire archive" (other publishers' headlines and excerpts) as licensable datasets; the Nigeria Eurobond prices are the DMO's re-publication of Bloomberg data | **High** | `app/licensing/page.tsx`, `lib/data/fx.ts`, `data/eurobonds.json` | Wording fixed on this branch; take both out of any paid licence until rights are cleared; never put Eurobond prices in the API or a licence (§4) |
| 3 | **No identifiable contracting party.** The site names "Pesara Limited" with no registration number or address, the footer © names "Afronomics Feed" (a brand), and a web search finds no Pesara Limited. Contracts, invoices, KRA and ODPC registration all hang on this | **High** | `lib/site.ts`, `components/layout/Footer.tsx`, `app/imprint/page.tsx` | Founder confirms the entity on BRS; one legal name everywhere (§7) |
| 4 | **Data protection gaps.** Probable duty to register with the ODPC (direct marketing; registration exemption uncertain); no retention schedule; newsletter is single opt-in and silently re-subscribes people who unsubscribed (security review M-4); cross-border transfers (Vercel, Supabase, Resend, Paystack, GitHub) described only in general terms; no data processing agreement for institutional customers | **High** | `app/legal/privacy/page.tsx`, `af_subscribe_v2`, security review L-2/M-4 | Register; fix opt-in; publish retention; name processors and transfer basis (§1) |
| 5 | **Defamation and data-protection exposure from naming lenders.** Borrower-reported cost and "contacted friends or family" percentages per named lender; "no longer on the list" stated as unlicensed | **Medium-High** | `app/rates/kenya/loan-apps/**` | Right-of-reply and "unverified report" wording added on this branch; adopt a written moderation and takedown procedure (§3) |
| 6 | **Selling commercial data licences on web-page terms only.** No signed agreement, no liability cap in a contract, no warranty disclaimer an institution has accepted; the terms page contradicted the licence terms (fixed on this branch) | **High (commercial)** | `app/legal/terms/page.tsx`, `lib/billing/ratecard.ts`, `docs/sales/templates/order-form.md` | Starting drafts in `docs/legal/templates/`; advocate review (§5) |
| 7 | **Tax set-up.** VAT registration once turnover reaches the threshold; eTIMS invoices; withholding tax deducted by foreign and Kenyan payers; "KRA PIN on request" promised on `/prices` without the PIN in hand | **Medium** | `app/prices/page.tsx`, `lib/billing/*` | Tax agent engagement before the first invoice (§6) |
| 8 | **Brand conflict.** "AFRONOMICS" is a World Bank podcast series (since 2017) and "Afronomicslaw" a US non-profit; "AFROECONOMICS" is a registered US mark for financial advice. No KIPI filing for our name | **Medium** | brand | KIPI search, then file in classes 35, 36, 41, 42 (or rebrand early) (§7) |
| 9 | **Consumer terms.** Renewal statements were inconsistent (fixed); no stated refund or cancellation-window policy; no "copy of the internet agreement" sent after purchase | **Medium** | `app/legal/terms`, `app/prices`, receipt emails in `lib/billing/record.ts` | Founder decides a refund rule; receipt links the terms in force (§6) |
| 10 | **Sponsorship and grants without a written independence clause** (F9); job-listing claims overstated verification (fixed) | **Medium** | `app/advertise`, `app/jobs/page.tsx` | Adopt the F9 clause in §9 before the first sponsor conversation |

Lower: AI disclosure (Low, already good, §8); employment and contractor IP (Low today, Medium on first hire, §10);
Nigeria SEC and NDPA (Low-Medium, §2.4 and §1.8).

---

## 1. Kenya Data Protection Act, 2019 and the ODPC

### 1.1 Registration as a data controller (and processor)

**What the law says.** The Act requires data controllers and processors to register with the Data Commissioner
(s.18). The Data Protection (Registration of Data Controllers and Data Processors) Regulations, 2021 exempt from
*mandatory* registration entities with annual turnover or revenue below KES 5 million **and** fewer than 10 employees,
but the exemption does not apply to processing for purposes listed in the Third Schedule, which law-firm summaries say
include **direct marketing**, financial services, education, health, telecoms and others (SEARCH:
[Regulations PDF on odpc.go.ke](https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-REGISTRATION-OF-DATA-CONTROLLERS-AND-DATA-PROCESSORS-REGULATIONS-2021.pdf),
[ODPC guidance note](https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Registration-of-Data-Controllers-and-Data-Processors.pdf),
[Bowmans](https://www.bowmanslaw.com/insights/data-protection/kenya-snapshot-analysis-of-the-data-protection-regulations-the-next-stage-in-data-protection-compliance-in-kenya/),
[Oraro](https://www.oraro.co.ke/data-protection-the-coming-into-force-of-various-data-protection-regulations-and-what-you-need-to-know/)).
Sources disagree on whether the two exemption conditions are joined by "and" or "or" (UNVERIFIED: the advocate should
read regulation 13). Fees reported for micro and small entities: **KES 4,000** to register, KES 2,000 to renew every
two years (SEARCH: [Michalsons](https://www.michalsons.com/blog/register-with-the-kenyan-office-of-the-data-protection-commissioner/58735);
ODPC [FAQ](https://www.odpc.go.ke/faqs/)). The ODPC's maximum administrative fine is KES 5 million or 1% of the previous
year's turnover, whichever is lower (s.63; SEARCH: [Citizen Digital on two KES 5m fines](https://citizen.digital/article/govt-slaps-two-companies-with-ksh10m-fine-for-abusing-customer-phone-data-n317818)).

**What we do today.** We send a newsletter, the Morning note, rate and tender alerts and a monthly fund-ranking email
(`app/legal/privacy/page.tsx`); we hold pilot and sales leads with "next follow-up" dates and a CRM of 21 contacted
institutions (`deals`, decision log D-013). That is direct marketing within the ordinary meaning. Revenue today is
near zero, so the turnover test is met; the Third Schedule carve-out is what likely removes the exemption.
**Registration status: UNVERIFIED** (trust audit §5 item 13).

**Fix.** Register on the ODPC portal under the legal entity (cost KES 4,000, under an hour once the entity's documents
are in hand). Even if an advocate says we are exempt, registration is cheap and is the first thing a DFI's vendor form
asks for. Put the certificate number on `/legal/privacy` and `/trust`.

### 1.2 Privacy notice adequacy

**What the law says.** Section 29 requires a controller, before collecting, to tell the data subject: their rights, the
fact of collection, the third parties who receive it and the safeguards, the controller's contact details, any transfer
outside Kenya, the safeguards adopted, and the consequences of not providing data (SEARCH:
[Act on odpc.go.ke](https://www.odpc.go.ke/wp-content/uploads/2024/02/TheDataProtectionAct__No24of2019.pdf); s.29 contents
from memory: **UNVERIFIED** against the text).

**What we do today.** `/legal/privacy` is good on what we collect and why. Gaps:
- It does not name the **controller** (the legal entity and its address); only an email.
- It says data "may be processed outside Kenya under appropriate safeguards" without naming the processors or
  countries. `/trust` does name them (Vercel, Supabase, Paystack, Resend, GitHub), so the notice should too.
- **Retention**: only alert data has a stated period; leads, subscribers, payments (including the raw Paystack
  payload), deals and key emails are kept indefinitely (security review L-2).
- It does not mention that an **AI assistant** (a third-party model provider) reads enquiries; it says "tools we
  control", which understates a third-party processor.
- No **Data Protection Officer** or named contact person; not mandatory for us (s.24 makes a DPO optional for most
  controllers, KNOWN, UNVERIFIED for our case), but naming a person helps.

**Fix (founder supplies facts, then code).** Add a "Who we are" block (entity, registration number, address, ODPC
registration number), a processor table (name, purpose, country, transfer safeguard), a retention table, and one line
on the AI assistant naming the provider. Draft retention to propose: unconfirmed alert requests 7 days (already),
stopped alerts 30 days (already), leads with no deal 24 months (security review), payment records 7 years (KNOWN:
Kenyan tax record-keeping is generally 5 years under the Tax Procedures Act; 7 years is a common safe choice,
UNVERIFIED), server logs 30-90 days (depends on Vercel plan, UNVERIFIED).

### 1.3 Lawful basis

**What the law says.** Processing needs a lawful basis (s.30: consent, contract, legal obligation, vital interests,
public interest, legitimate interests and others, KNOWN). Commercial use of personal data, including direct marketing,
needs consent or a written-law authority plus a "simplified opt-out mechanism" (s.37 and the Data Protection (General)
Regulations, 2021, regs 14-15; SEARCH: [CIPIT](https://cipit.org/?p=1957),
[Oraro on direct marketing](https://www.oraro.co.ke/?p=76850)).

**What we do today.** The notice relies on consent for newsletters and alerts, contract for pilots and payments, and
legitimate interest for counts and logs: correct in outline. **But** the newsletter is single opt-in and re-subscribes
anyone who previously unsubscribed whenever someone types their address (security review M-4). That breaks the opt-out
requirement and makes "consent" unprovable. Cold outreach emails to named people at institutions (the 21 contacted
institutions) rely on legitimate interest for a business-to-business approach; Kenya has no clear B2B carve-out like
the UK's PECR distinction (UNVERIFIED), so keep every outreach one-to-one, relevant, with an opt-out line, and log it.

**Fix.** Make the newsletter double opt-in and never clear `unsubscribed_at` without a confirmation click (M-4, a code
change the security review left to the founder). Add an opt-out line to every outreach template in
`docs/sales/sequences.md`.

### 1.4 Data subject rights

**Law.** Rights to be informed, access, object, correction, deletion, data portability and not to be subject to solely
automated decisions with significant effects (ss.26, 31-38; KNOWN). Requests must be met within prescribed periods in
the General Regulations (UNVERIFIED: commonly cited as 7-14 days for different rights).
**Today.** One email route ("Privacy"). No procedure, no log.
**Fix.** A one-page internal procedure: log each request in `deals` or a sheet; reply within 7 days; delete from
Supabase tables and Resend audiences; note what is kept for tax. Low cost.

### 1.5 Cross-border transfer (Vercel, Supabase, Resend, Paystack, GitHub)

**Law.** Part VI (ss.48-50): a controller may transfer personal data outside Kenya only with proof of appropriate
safeguards, an adequacy decision, necessity (for example, for a contract with the data subject) or consent for
sensitive data; s.50 lets the Cabinet Secretary require some processing to be done in Kenya for strategic interests
(SEARCH: [DLA Piper Africa](https://dlapiperafrica.com/en/kenya/insights/2019/Data-Protection-Act-2019.html),
[Afriwise](https://www.afriwise.com/blog/navigating-east-africas-data-protection-framework-a-guide-for-investors-in-kenya-uganda-and-tanzania)).
The General Regulations add detail on transfer safeguards (UNVERIFIED).
**Today.** Data sits with Supabase (project region UNVERIFIED; check the dashboard), Vercel (US/EU), Resend (US),
Paystack (Nigeria/South Africa, a Stripe company), GitHub (US). No transfer record exists.
**Fix.** (a) Record, for each processor, its region and the safeguard: their standard data processing addendum (each
of Vercel, Supabase and Resend publishes a DPA with standard contractual clauses, KNOWN; accept or download each one and
file it); (b) state "necessary for the contract you asked for" as the basis for payment and key data; (c) list them in
the notice. Cost: an afternoon.

### 1.6 Breach notification

**Law.** Notify the Data Commissioner within **72 hours** of becoming aware of a breach likely to risk data subjects'
rights, and notify affected people without undue delay; processors must tell the controller within 48 hours (s.43;
SEARCH: [Afriwise on breaches](https://www.afriwise.com/blog/a-few-insights-on-navigating-data-breaches-in-kenya-under-the-kenyan-data-protection-law)).
**Today.** No incident runbook. The security review's C-1 (Next.js RCE) was the kind of event that would have triggered
the duty had it been exploited.
**Fix.** One page: who decides, how to assess, the ODPC form, the 72-hour clock, template email to users. Store in
`docs/security/`.

### 1.7 Institutional customers will ask for a DPA

A bank or fund that gives us named users' emails for keys is a controller sharing data with us; their procurement will
ask for a data processing agreement (customer journeys row 7). Add a short DPA schedule to the licence (see
`docs/legal/templates/data-licence-agreement.md`, Schedule 3).

### 1.8 Other countries' data laws (where we sell)

Nigeria's Data Protection Act 2023 applies to controllers outside Nigeria that process data of people in Nigeria; only
"data controllers of major importance" must register with the NDPC (threshold set by NDPC; one guide cites 200 data
subjects in six months, UNVERIFIED) (SEARCH: [KPMG review](https://assets.kpmg.com/content/dam/kpmg/ng/pdf/nigeria-data-protection-act2023_kpmg-review.pdf),
[Hogan Lovells](https://www.hoganlovells.com/en/publications/key-changes-brought-by-the-nigerian-data-protection-act-2023)).
**Risk: Low** while Nigerian subscribers are few. GDPR applies if we target EU readers; we do not today.

---

## 2. Capital Markets Authority: funds, rankings and the advice boundary

### 2.1 Advertising collective investment schemes (LN 173/2023)

**What the law says.** The Capital Markets (Collective Investment Schemes) Regulations, 2023 (Legal Notice 173 of 2023,
commenced 27 October 2023) govern CIS, including money market funds. Search extracts of the regulations say a scheme
advertisement must be issued by a licensed person, must be **approved by the scheme's trustee** and must comply with
the advertising Part, and that an "intermediary service platform provider" must get **CMA approval of any advertisement
or promotional material at least 48 hours** before publication (SEARCH:
[LN 173/2023 on kenyalaw.org](https://kenyalaw.org/kl/fileadmin/pdfdownloads/LegalNotices/2023/LN173_2023.pdf),
[Kenya Law consolidated](https://new.kenyalaw.org/akn/ke/act/ln/2023/173/eng@2023-12-15)). The 2001 regulations required
a warning that prices and income "may go down as well as up"; I could not confirm the 2023 wording (UNVERIFIED). A
CMA-linked guidance note treats websites and fund fact sheets "sent to more than one party" as advertisements (SEARCH:
[guidance on performance reporting](https://mman.co.ke/sites/default/files/downloadfiles/Guidance%20to%20Collective%20Investment%20Schemes%20on%20Investment%20Performance%20Measurement%20and%20Reporting%20(1).pdf)).
Decision D-007 already flagged this.

**What we do today.**
- `/rates/kenya/money-market-funds` ranks every fund by published yield after tax and gives each an **"Open an
  account"** button through `/go/fund/<slug>`, which counts the click and goes to the manager's home page, or to a
  manager's referral link if `AFF_FUND_<SLUG>` is set (`lib/data/fund-links.ts`). The page says a manager "may in future
  pay Afronomics".
- `/rates/kenya/best-money-market-fund` (and `/[month]`) titled "Best money market fund in Kenya" with a "Leading this
  month" box, a share card, and a monthly email "with the top five funds after tax" (`MmfMonthView.tsx`).
- Good existing safeguards: every yield from the manager's own page; ranking by one stated measure; "not a promise";
  "Information, not advice"; no payment for placement (`/editorial-standards#independence`).

**Analysis.** Neutral reporting of public yields by a publisher is very unlikely, on its own, to be "advertising a
scheme". Three features push towards it: (1) a call-to-action button per fund ("Open an account"); (2) a commercial
link with the manager (a referral fee), which would make us an unlicensed intermediary promoting the scheme for reward;
(3) "Best" in headlines and a recurring email naming "top" funds. The 48-hour approval rule for intermediary platforms
shows the CMA regulates third-party promotion, not only managers.

**Fix.**
1. **Now (no code needed):** do not set any `AFF_FUND_*` environment variable; do not accept any payment, listing fee
   or sponsorship from a fund manager whose fund is in the table (partners doc line 6 already says "ask one bank or
   fund manager not in the MMF table").
2. **Done on this branch:** "Best ... by yield" in the title and share text; "Past yields are not a guide to future
   returns, and a ranking by one measure is not a rating or a recommendation" beside both tables; a rankings paragraph
   on `/legal/disclaimer`; the fund-link disclosure added to `/editorial-standards` and `/about#funding`.
3. **Recommended, founder decision:** rename the button "Open an account" to "Manager's site" (a neutral link) until the
   advocate's view. This changes conversion tracking (`partner_click`), so I have not done it.
4. **Advocate:** a written opinion on (a) whether the table plus a neutral link is an "advertisement", (b) whether a
   referral fee makes us an intermediary needing a CMA licence or approval, (c) the exact warning text required.
   Option: a short letter to the CMA (corporate@cma.or.ke, partners doc row 28) asking for a no-objection view. Cost:
   ESTIMATE KES 30,000-80,000 for an opinion from a capital-markets advocate (no public fee schedule found).

### 2.2 Investment advice and the licence boundary (Kenya)

**What the law says.** Under the Capital Markets Act (Cap. 485A) s.2, an "investment adviser" includes a person who,
for remuneration, carries on the business of advising others on securities **or who, "as part of a regular business,
issues or promulgates analyses or reports concerning securities"**; acting as one requires a CMA licence (SEARCH:
[Kenya Law, Act as at 11 Dec 2025](https://kenyalaw.org/akn/ke/act/1989/17/eng@2025-12-11),
[2012 revised edition](https://nifca.go.ke/assets/CapitalMarketsAct_Cap485A-Dyiw_m_K.pdf)). The US Advisers Act has an
express exclusion for "bona fide" publications of general and regular circulation ([15 USC 80b-2](https://www.law.cornell.edu/uscode/text/15/80b-2);
*Lowe v SEC*); **I found no confirmed equivalent exclusion in the Kenyan Act** (UNVERIFIED). CMA describes advisers as
making recommendations or securities analysis "for a fee ... through written publications" (SEARCH:
[Capital FM](https://capitalfm.africa/cma-licenses-afg-wealth-kenya-as-an-investment-adviser/)).

**What we do today.** We publish government-securities auction results, bond and bill data, MMF yields, and paid
products (Pro, the Investment Committee Pack, alerts, Analyst/Team licences). Government securities are "securities"
for this purpose (KNOWN). Our copy repeatedly says "information, not advice" and "no buy, sell or hold
recommendations" (`lib/site.ts` `disclaimer`, `/editorial-standards`).

**Analysis.** The risk is the second limb ("regular business ... analyses or reports concerning securities") read
literally: it could catch a paid data and analysis service. The mitigants are that we report facts (auction results,
published yields) rather than recommend, we do not manage money, and we do not tailor to a person. Risk rises with:
anything that reads like a view on what to buy ("cheap", "attractive entry", "best", "should"), model portfolios,
personalised answers, or price targets. **Level: Medium.**

**Fix.**
- House rule (add to `docs/story-engine.md` checker and the editorial standards): no imperative investment language,
  no "attractive / cheap / rich / buy", no forecasts of a specific security's price or yield presented as a call.
- Keep "Information, not advice" on every paid product and email footer (check the Morning note and the IC Pack
  templates).
- Advocate question: does Afronomics need a CMA investment-adviser licence, or fall outside it, given the facts above?
  Ask in the same opinion as §2.1.

### 2.3 Alerts

T-bill and bond result alerts report published results. Low risk provided they never add a call to action. The MMF
monthly email is the exception (top five funds): treat it as part of §2.1.

### 2.4 Nigeria SEC and other markets

Nigeria's Investments and Securities Act 2025 (assented 31 Mar 2025) replaced ISA 2007; the SEC's public notice says
only registered entities may promote investment services, offer investment advisory services or solicit funds (SEARCH:
[SEC public notice](https://home.sec.gov.ng/for-investors/keep-track-of-circulars/public-notice-unregistered-online-investment-schemes/),
[Mondaq overview](https://webiis10.mondaq.com/nigeria/commoditiesderivativesstock-exchanges/1624678/an-overview-of-the-nigerian-investment-and-securities-act-2025)).
We publish Nigerian auction results (DMO, CBN), the savings bond and Eurobond prices, but rank no Nigerian funds and take
no money from issuers. **Level: Low** while that holds. Do not add Nigerian fund rankings or referral links without a
Nigerian lawyer's view. South Africa (FAIS Act), Egypt (FRA), Morocco (AMMC) and WAEMU (AMF-UMOA) have their own adviser
regimes (KNOWN, not researched): the same rule applies (facts, no recommendations, no issuer money).

---

## 3. Central Bank of Kenya: the loan-app checker and borrower cost reports

### 3.1 The regulatory facts we rely on

Since the Central Bank of Kenya (Amendment) Act 2021, non-deposit-taking digital lenders need a CBK digital credit
provider (DCP) licence; the CBK (Digital Credit Providers) Regulations 2022 ban contacting a borrower's contacts,
accessing phonebooks, and publishing borrowers' information to shame them, and bar reporting debts under KES 1,000 to
CRBs (SEARCH: [People Daily](https://peopledaily.digital/business/digital-lenders-dealt-a-blow-in-new-cbk-regulations),
[Kenyans.co.ke](https://www.kenyans.co.ke/news/74121-cbk-blocks-mobile-loan-apps-harassing-kenyans-calls),
[Business Daily 2025](https://www.businessdailyafrica.com/bd/economy/debt-shaming-back-as-digital-lenders-defy-cbk-5094888)).
Our page statements on licensing are consistent with this.

### 3.2 Defamation risk for named lenders

**What the law says.** Defamation is civil (criminal defamation in Penal Code s.194 was struck down in 2017). The
Defamation Act (Cap. 36) provides qualified privilege for certain newspaper reports (s.7), a **right of reply** (s.7A)
and **fair comment** (s.15); case law requires fair comment to be on true facts and on a matter of public interest, and
privilege is defeated by malice (SEARCH: [Defamation Act on Kenya Law](https://new.kenyalaw.org/akn/ke/act/1970/10/eng@1992-10-23),
[Carter-Ruck guide](https://www.carter-ruck.com/law-guides/defamation-and-privacy-law-in-kenya/),
[Standard v Chelule 2018](https://new.kenyalaw.org/akn/ke/judgment/kehc/2018/1071/eng@2018-12-20)). The Media Council
Act 2013 Code of Conduct includes an "opportunity to reply" (SEARCH: [code PDF](https://kuj.or.ke/rt_upl/simple-file-list/Media-Code-of-Conduct.pdf)).
Whether s.7 privilege extends to an online publication is untested (UNVERIFIED).

**What we do today.**
- Licensed/not-licensed status from the CBK directory, with the date and a link: a fair and accurate report of a
  public register. **Low** risk, provided we are accurate. The "No longer on the list" section asserted, of a named
  company, that it "is not licensed by the Central Bank to lend"; a name can drop for a rename or a directory error.
- A **scorecard** per named lender: median cost per KES 1,000 and the percentage of reporters who say the lender
  "contacted their friends or family" (an allegation of unlawful conduct under the DCP Regulations), shown once five
  anonymous borrowers report it, "checked only for range" (`app/rates/kenya/loan-apps/page.tsx`,
  `[lender]/page.tsx`). Anonymous, unverified reports alleging illegal conduct by a named company are the highest-risk
  item here: fair comment protects opinion on true facts, not unverified factual allegations. **Medium-High.**

**Done on this branch.** Title changed from "What each licensed lender really costs" to "What borrowers say each
licensed lender costs"; an explicit "not verified with the lender; describes borrowers' experience, not a finding by
Afronomics or the CBK" note; a right-of-reply line with the contact address on both pages; the "No longer on the list"
note now says a name can drop for a lapsed or revoked licence, a change of name or a directory error, and invites the
lender to write.

**Further fixes (founder and code).**
1. Written moderation rule: minimum 5 reports (exists); add a rate limit per lender per day (exists per IP, UNVERIFIED
   for per lender); remove reports that are statistical outliers; keep raw reports private.
2. Before the first lender's scorecard goes live, email the lender (CBK directory address) with the figures and a
   7-day window to respond; publish any response beside the figures. Log it.
3. A takedown procedure: on a lawyer's letter, suspend the specific cell within 24 hours pending review (not the page).
4. Consider showing the "contacted friends or family" column only as an aggregate across all lenders until a lender
   has, say, 20 reports. Founder decision.
5. Data protection: the report form must not collect borrower names or phone numbers; the privacy notice already says
   only a daily one-way code is kept.

---

## 4. Data rights: official publications, vendors, scraping, our own database

### 4.1 Reusing official publications

| Source | What we found | Risk |
|---|---|---|
| **Central Bank of Kenya** | No general terms of use found. Discussion papers say they "shall not be reproduced, sold or distributed without prior consent"; the careers portal reserves copyright (SEARCH: [CBK discussion papers](https://www.centralbank.go.ke/discussion-papers/), [careers terms](https://careers.centralbank.go.ke/terms)) | Facts (rates, amounts) are not copyright; reproducing whole documents is. We extract figures and link. **Low-Medium** |
| **Central Bank of Nigeria** | Legal page: copying permitted "provided that CBN is stated expressly as the source" (SEARCH: [cbn.gov.ng/Legal](https://www.cbn.gov.ng/Legal.html)) | **Low** with attribution |
| **Nigeria DMO** | Footer "Copyright © Debt Management Office Nigeria. All Rights Reserved"; no reuse licence found (SEARCH) | Auction results are facts; see Eurobonds below |
| **Nigeria DMO Eurobond prices** | `data/eurobonds.json` note: "its stated source: Bloomberg" (REPO). Bloomberg's data licences prohibit redistribution to third parties without a distribution licence (SEARCH: [Bloomberg BDRSL disclosure](https://assets.bbhub.io/professional/sites/27/BDRSL-Data-Fees-Public-Disclosure-2026-FINAL.pdf)) | Displaying the DMO's public page figures with credit: **Low-Medium**. Putting them in a paid API, CSV or licence: **High**. Today they are on `/markets/eurobonds` only, not in `/api/v1` (REPO) |
| **World Bank Open Data** | CC BY 4.0, attribution required (KNOWN; credited on `/imprint`) | **Low** |
| **ExchangeRate-API (FX)** | Open-access endpoint: attribution required; caching and commercial *use* allowed; **"not allowed to re-distribute"** (SEARCH: [docs/free](https://www.exchangerate-api.com/docs/free)) | We list an "African FX reference archive" on `/licensing` as licensable. **High** |
| **Wire headlines** | Third-party headlines and RSS excerpts; copyright stays with the publishers | Showing a headline and link: **Low**. Licensing the archive as an "NLP corpus": **High** |
| **Fund managers' yields** | Read from managers' public pages and fact sheets | Facts; **Low**. Respect robots.txt and terms |
| **UMOA-Titres, BoZ, CBE, BoU, BAM etc.** | Not researched one by one (UNVERIFIED) | Facts extracted with links: **Low** |

**General rule.** Copyright protects expression, not facts: a single rate or amount is free to report; a whole PDF,
table layout or commentary is not. Kenya's Copyright Act protects "tables and compilations of data" as literary works
if original (SEARCH: [Copyright Act 2001 on WIPO Lex](https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ke/ke039en.pdf)).

**Done on this branch.** `/licensing` now says the FX archive comes from a third-party feed whose terms do not allow
redistribution (reference inside the buyer's own work only), and that the Wire licence covers our tags, dates and links,
not the publishers' text. `/imprint` now says third-party data is reproduced "subject to each publisher's terms of
use" instead of "under each publisher's licence" (many publishers grant no licence).

**Further fixes.**
1. Founder decision: take the FX archive and the Wire archive off the licensable list altogether, or replace the FX
   source with central banks' own published reference rates (licensable as facts) or a paid FX feed with redistribution
   rights.
2. Never add Eurobond prices to `/api/v1`, CSVs or the IC Pack without a Bloomberg distribution licence; keep the
   "stated source: Bloomberg" note on the page.
3. Keep a `docs/legal/source-terms.md` register (one row per publisher: terms URL, date checked, reuse position). I did
   not create it; it needs the per-source checks this environment could not run.
4. Scraping: follow robots.txt, identify the bot in the User-Agent with a contact URL, and keep request rates low. Kenya
   has no specific anti-scraping statute; the Computer Misuse and Cybercrimes Act 2018 criminalises unauthorised access
   (KNOWN), which is not engaged by reading public pages, but bypassing a login or a block would be.

### 4.2 Protecting our compiled dataset

**Law.** Kenya has no EU-style sui generis database right (KNOWN: none found in the Copyright Act). Protection comes
from (1) copyright in an original selection and arrangement of data (s.2 "literary work"; originality threshold
UNVERIFIED in case law), (2) **contract** (licence terms the user accepts), (3) technical measures (keys, rate limits:
`lib/api.ts`), and (4) confidentiality for non-public data.
**Fix.** The licence (§5) must do the work: a contractual restriction on redistribution and on building competing
datasets, an audit right, and an injunction clause. Add a click-through acceptance at key issue (pilot form and
checkout) so web terms are contractually binding: "By using the key you accept the [licence terms]". Keep dated copies
of the terms (git history does this).

### 4.3 Attribution

The site uses "Source: Afronomics" (dataTerms) in some places and "Source: Afronomics, compiled from [publisher]" in
the old terms page. The terms page now points to the licensing terms. Recommended single form: **"Source: Afronomics,
from [publisher]"** with a link; the API's `attribution` field (`app/developers/page.tsx`) should carry exactly that.
Founder decision; not changed.

---

## 5. Commercial: the data licence and the sales templates

### 5.1 What we have

- Web terms: `dataTerms` in `lib/billing/ratecard.ts` (free / keyed / Enterprise), shown on `/developers`,
  `/licensing`, `/data-api`, `/buying`; `/legal/terms` (short, Kenyan law).
- `docs/sales/templates/proposal.md` and `order-form.md`.
- **Inconsistency fixed on this branch:** `/legal/terms` let anyone "download our CSV files and reuse the data with
  attribution", which contradicted D-016 (commercial use needs a key; redistribution Enterprise only). It now states
  the D-016 rule and links `/licensing`. It also said "Paid plans renew monthly until cancelled", which contradicted
  D-015 (single-period payments unless a Paystack plan is set) and the checkout copy; fixed, and the same fix made on
  `/prices`.

### 5.2 What an institution's legal team will expect

Grant (scope, users, purpose, territory); restrictions (no redistribution, no resale, no competing product, no model
training for third parties, no removal of attribution); derived data (what they may keep and publish); redistribution
schedule (Enterprise); confidentiality of keys; fees, invoicing, taxes and withholding gross-up; accuracy and the
**warranty disclaimer** (as-is, publisher-sourced, may be revised); **liability cap** (typically fees paid in the
previous 12 months) and exclusion of indirect loss; IP ownership; data protection (DPA schedule); **service levels only
for Enterprise**; term, renewal and termination (for breach, for convenience on notice, insolvency); effect of
termination (delete data within 30 days, keep derived outputs already published); anti-bribery and sanctions;
assignment; notices; entire agreement; **governing law Kenya; disputes by negotiation then arbitration (Nairobi Centre
for International Arbitration) or the Kenyan courts**; counterparts and e-signature.

### 5.3 Review of the sales templates

`proposal.md`: sound and honest (no feature that is not live; gaps stated; local-price eligibility). Changes to
recommend (not made: these are sales documents the founder controls):
- Section 5 "Licence in brief" should end: "The licence is the Afronomics Data Licence Agreement (version and date);
  this proposal is not an offer capable of acceptance." This stops a proposal becoming a contract with no terms.
- Add the supplier's legal entity under the signature.
- "Valid for 30 days" is fine; add "prices exclude VAT and any taxes, which are added where applicable" once the VAT
  position is known (§6).

`order-form.md`: good structure. Gaps: Parties says "Afronomics" (a brand, not a legal person); 4.5 leaves warranty,
liability, law and termination to "F3"; there is no clause incorporating standard terms; payment terms and taxes
blank; no withholding-tax gross-up. The new draft agreement in `docs/legal/templates/data-licence-agreement.md` is
written so that the order form becomes its Schedule 1: add one line to the order form, "This order is governed by the
Afronomics Data Licence Agreement [version], which the customer accepts by signing", once the advocate approves.

### 5.4 Drafts produced

- `docs/legal/templates/data-licence-agreement.md`: a full starting draft (Analyst, Team and API, Enterprise), with an
  order-form schedule, a redistribution schedule and a short DPA.
- `docs/legal/templates/pilot-terms.md`: 30-day pilot key terms, short enough to link from the pilot email.

Both are marked **DRAFT FOR ADVOCATE REVIEW** and must not be sent or published until reviewed. ESTIMATE for advocate
review of both: KES 50,000-150,000 (no public fee schedule found; the Advocates (Remuneration) Order sets scale fees
for some work, UNVERIFIED for this).

---

## 6. Consumer protection, payments and tax

### 6.1 Consumer Protection Act 2012 and Competition Act

**Law.** The Consumer Protection Act 2012 (Cap. 501) ss.31-33 cover internet agreements: disclosure before agreement,
a **written copy of the agreement delivered after the agreement**, and a right to cancel up to 7 days after receiving
the copy if the supplier failed the disclosure duties; s.75 requires a refund on a valid cancellation (SEARCH:
[sheriaplex s.16](https://sheriaplex.com/kenya-acts/5390-section-16-rescinding-agreement), [2022 revision PDF](https://globalfoodlaws.georgetown.edu/wp-content/uploads/2026/05/Kenya_2022_Consumer-Protection-Act_EN.pdf)).
The Competition Act s.55 prohibits false or misleading representations, including on price; the CAK has fined banks and
SACCOs for it (GT Bank KES 33.18m) (SEARCH: [Citizen Digital](https://www.citizen.digital/article/cak-fines-gt-bank-ksh3318m-over-false-representation-n377985)).
A pending High Court petition attacks telcos' subscription auto-renewals without clear opt-in (SEARCH:
[Business Daily](https://www.businessdailyafrica.com/bd/corporate/companies/safaricom-telkom-airtel-face-court-action-over-subscription-5056970)).

**Today.** Prices shown in KES with a USD reference; checkout says whether a plan renews (`InstitutionalBuy.tsx`,
`thank-you`), and the receipt states "Nothing renews automatically" for one-off payments: good. Gaps: `/legal/terms` and
`/prices` contradicted this (fixed on this branch); no refund policy anywhere; the receipt does not link the terms in
force; "Annual billing takes two months off everything monthly" on `/prices` conflicts with the proposal template's
"Do not offer an annual price for any institutional plan" (a pricing representation; founder to reconcile);
`/prices` meta description still says "data licences from KES 7,500", which D-016 removed (founder to confirm and fix).

**Fix.** (1) Founder picks a refund rule; suggestion: "If a paid period has just started and you have not used the key
or downloads, ask within 7 days for a full refund; otherwise no refunds for part-periods." Publish it on `/legal/terms`.
(2) Receipt email includes a link to the terms version in force (`lib/billing/record.ts`). (3) Never enable Paystack
auto-renewal without the checkout naming the amount, period and how to cancel (Paystack sends a "Manage subscription"
link in the activation and reminder emails: SEARCH, [Paystack support](https://support.paystack.com/en/articles/2124226)).

### 6.2 Paystack

Paystack's merchant terms require the merchant to display refund and cancellation policies and correct business
details (KNOWN for card schemes generally; Paystack's own text UNVERIFIED, not reached). The Paystack account must be
in the legal entity's name with KYC documents matching BRS. One Kenyan Paystack account takes KES (M-Pesa) and USD cards
(D-014).

### 6.3 VAT, eTIMS, SEP/DST

- **VAT registration** is required once taxable supplies reach KES 5 million in 12 months; the Finance Bill 2024
  proposed KES 8 million and I could not confirm whether that was enacted (SEARCH: [Rödl on Finance Bill 2024](https://roedl.com/insights/kenya-finance-bill-2024);
  UNVERIFIED as to current law). Voluntary registration is possible and lets us recover input VAT on Vercel etc.
- **Exported services** (used and consumed outside Kenya) are zero-rated again from 1 July 2023 (SEARCH:
  [PwC Finance Act insights](https://www.pwc.com/ke/en/publications/finance-act-insights/value-added-tax.html)), so a
  licence to a London fund would be zero-rated, to a Nairobi bank 16%. Keep evidence of where the customer uses the
  service.
- **eTIMS**: KRA requires business expenses to be supported by eTIMS invoices to be deductible, which is why Kenyan
  institutional buyers will ask for an eTIMS invoice (KNOWN from the Finance Act 2023 rules; extent of mandate for
  non-VAT-registered sellers UNVERIFIED). Register on eTIMS (free, KRA iTax) before the first Kenyan invoice.
- **SEP tax** (which replaced DST from 27 Dec 2024) applies to *non-resident* digital providers (SEARCH:
  [EY](https://globaltaxnews.ey.com/news/2025-0233), [BDO EA](https://bdo-ea.com/en-gb/insights/understanding-significant-economic-presence-tax-a-shift-from-digital-service-tax-in-kenya)).
  A Kenyan-resident company does not pay SEP; it pays corporation tax (and, below thresholds, may qualify for turnover
  tax: UNVERIFIED for a company of our type). **Not relevant to us** except if we ever sell through a foreign entity.

### 6.4 Withholding tax on payments to us

- A **Kenyan** institution paying us for "management or professional" services may withhold 5% (resident rate) and give
  a certificate; data licences may be argued to be royalties (resident WHT 5%) (SEARCH: [KRA WHT rates](https://www.kra.go.ke/helping-tax-payers/faqs/more-about-withholding-tax),
  [PwC](https://taxsummaries.pwc.com/Kenya/Corporate/Withholding-taxes)). The licence should say fees are paid without
  deduction unless law requires it, and the payer must provide the certificate (credit against our tax).
- **Foreign** payers (Nigeria, South Africa) may withhold under their own law on payments to a Kenyan supplier for
  royalties or services; treaty relief needs a KRA tax residence certificate. Price for this (gross-up clause in the
  licence).
- **US payers and the W-8BEN-E.** A US fund paying a foreign company asks for a W-8BEN-E to document foreign status.
  The US and Kenya have **no comprehensive income tax treaty** (KNOWN, UNVERIFIED here); services performed wholly
  outside the US are generally not US-source and not subject to US withholding, but royalties for data used in the US can
  be US-source and attract 30% withholding without a treaty (KNOWN general rule, UNVERIFIED for data licences). The
  characterisation (service vs royalty) matters: have a tax adviser fill the first W-8BEN-E, including the FATCA status
  (likely "active NFFE").

---

## 7. Corporate and brand

### 7.1 The entity

- **"Pesara Limited"**: the site names it as publisher; the trust audit found no public trace and found the similar
  Pesapal Limited (REPO, SEARCH). The founder must confirm on eCitizen BRS: registration number (PVT-...), date,
  registered office, directors, shareholders; download the CR12. If it is not registered, register a private limited
  company under the Companies Act 2015 before any contract, invoice, ODPC or Paystack change (eCitizen BRS: name search,
  reservation, incorporation; fees UNVERIFIED, commonly cited around KES 10,000-15,000 plus stamp duty).
- **"Afronomics Feed" / "Afronomics"**: if a company trades under a name other than its registered name, register the
  business name (Registration of Business Names Act) on BRS (KNOWN; the exact current statute and fee UNVERIFIED). Then
  footer, terms, invoices and contracts read: "Pesara Limited, trading as Afronomics" (or whichever is true).
- **Four names in use** (`lib/site.ts`: `name: "Afronomics"`, `legalName: "Afronomics Feed"`, `houseName`, domain): once
  confirmed, set `site.legalName` to the registered company name; the © line should name the company.
- **Domain.** Confirm afronomicsfeed.com is registered to the company (or the founder personally, with a written
  assignment to the company), with registrar lock and 2FA; renew for several years. Trust audit item 15.

### 7.2 Trademark

**Facts.** The World Bank runs "AFRONOMICS - A Podcast Series" since 2017, now hosted by its Chief Economist for Africa
(SEARCH: [worldbank.org](https://www.worldbank.org/en/news/series/afronomics-a-podcast-series)); "Afronomicslaw" is a
US non-profit blog on international economic law (SEARCH: [afronomicslaw.org](https://afronomicslaw.org/about)); a US
mark "AFROECONOMICS" (reg. 4767468, 2015) covers financial advice (SEARCH: [Justia](https://trademarks.justia.com/863/69/afroeconomics-86369551.html)).
No registered "AFRONOMICS" mark was found in searches (UNVERIFIED: KIPI, WIPO Global Brand Database and USPTO not
searched directly).

**Analysis.** The World Bank is unlikely to sue a small Kenyan publisher, but (a) it may object to a registration in
class 41 (publishing, podcasts) or 35/36, (b) the confusion hurts search and trust (audit gap 7), and (c) without a
registration we cannot stop a copycat. **Medium.**

**Fix.**
1. Search KIPI (official search, small fee) and WIPO Global Brand Database for AFRONOMICS in classes 9, 35, 36, 41, 42.
2. If clear in Kenya, file "AFRONOMICS" (word) and the logo in classes 41 (online publishing, news), 42 (providing data
   via online databases, SaaS), 35 (business information, market research) and 36 (financial information). Avoid
   "advice" wording in the specification. Local fees reported: application about KES 4,000 for the first class (some
   sources KES 6,000), publication KES 3,000, registration about KES 5,000 per class (SEARCH:
   [KIPI fees Dec 2025](https://www.kipi.go.ke/sites/default/files/2026-01/DEC2025_2.pdf),
   [Huduma Global](https://hudumaglobal.com/blog/register-trademark-kenya-online-kipi-process-costs); conflicting,
   UNVERIFIED). ESTIMATE all-in for four classes with an agent: KES 60,000-120,000; 6-12 months to registration.
3. If the search shows conflict, consider "Afronomics Feed" as the mark, or a rebrand now while the brand is two weeks old.

---

## 8. AI and content

**Today (REPO).** `/editorial-standards#ai` says: no figure is produced by a language model; short data stories are
drafted by an AI model and checked by an automated figure checker; correspondence and social posts are drafted with
an AI assistant; "Ask the data" uses fixed rules. This is a clear and accurate disclosure (checked against
`docs/story-engine.md` per the trust audit). **Gaps:** (1) the article page itself does not say a story was AI-drafted;
(2) no image policy; (3) the privacy notice does not name the AI provider as a processor (§1.2).

**Law.** Kenya launched a National AI Strategy 2025-2030 in March 2025; there is no AI statute yet; the Kenya Robotics
and AI Society Bill 2023 was proposed and criticised (SEARCH: [Citizen Digital](https://www.citizen.digital/news/kenya-launches-national-ai-strategy-with-ksh152b-implementation-budget-n359983),
[Capital FM](https://capitalfm.africa/kenya-moves-to-regulate-ai-but-who-will-call-the-shots/)). I found no Media
Council of Kenya AI guidelines (UNVERIFIED). The Competition Act s.55 and the Consumer Protection Act still apply to
misleading content.

**Fix.**
- Add a one-line label on AI-drafted stories ("Drafted with an AI model from our data and checked against it; see how
  we use AI") in `components/article/ArticleTemplate.tsx` driven by front-matter. Code change; founder to approve.
- Image policy, to add to `/editorial-standards` once the founder confirms practice: "We do not publish AI-generated
  images presented as photographs of real people, places or events. Illustrations and charts made with software are
  labelled as such. Photographs are credited and used under licence." Not added, because whether any current image is
  AI-generated is a fact only the founder can confirm (the site appears to use generated OG cards and charts, not
  photographs: `opengraph-image.tsx`, `/share/card`).

---

## 9. Sponsorship, advertising and grants: the F9 independence clause

**Law.** Kenya's Media Council Code requires separation of advertising and editorial (SEARCH: code PDF above); the
Competition Act s.55 bars misleading representations; the CIS rules (§2.1) bar fund promotion by unlicensed persons.
Funders such as the Gates Foundation require "creative and editorial independence" in media partnerships (SEARCH:
[Gates media partnerships](https://gatesfoundation.org/our-work/programs/global-policy-and-advocacy/global-media-partnerships)).

**Today.** `/editorial-standards#independence` and `/advertise` promise labelled sponsorship, no payment for coverage,
no pre-publication review. No contract clause exists (partners doc F9).

**Draft F9 clause (for every sponsorship, presenting-sponsor, grant or partnership agreement; advocate to review):**

> **Editorial and data independence.**
> (a) Afronomics alone decides what it publishes, including all data, rankings, tables, charts, analysis, headlines and
> the timing of publication. The [Sponsor/Funder] has no right to see, review, approve, edit, delay or prevent any
> content before or after publication, except to correct a factual error about the [Sponsor/Funder] itself, which
> Afronomics will consider under its published corrections policy.
> (b) No payment under this agreement buys inclusion in, exclusion from or a position in any data set, ranking, league
> table or comparison. Rankings are ordered by published figures alone.
> (c) Sponsored material will be labelled "Sponsored" or "Presented by [name]" and kept visually separate from data and
> editorial content. Afronomics will disclose the [sponsorship/grant] on the relevant pages and on its funding page.
> (d) Afronomics may report on the [Sponsor/Funder], its competitors and its sector, including critically, and this is not
> a breach of this agreement.
> (e) The [Sponsor/Funder] will not hold itself out as endorsing, or being endorsed by, Afronomics data beyond the agreed
> credit line.
> (f) Where the [Sponsor/Funder] is a regulated financial firm whose products appear in our data (including a fund
> manager, bank, lender or money-transfer provider), Afronomics may decline the arrangement, and in any case will not
> run sponsored content that promotes a specific investment product.
> (g) For grants: funds are restricted to the agreed project; reporting covers outputs and spending only; the Funder
> acquires no right over editorial content or data, and Afronomics retains all intellectual property unless the
> agreement says otherwise in writing.
> (h) Breach of (a) or (b) by the [Sponsor/Funder] entitles Afronomics to terminate at once and keep fees paid for
> the period already run.

Also: publish a sponsor and funder list on `/about#funding` as soon as the first one signs.

---

## 10. Employment and contractors (writers, photographers, developers)

**Law.** Under the Kenya Copyright Act, copyright vests first in the author; works made in the course of employment
under a contract of service, and commissioned works, are deemed transferred to the employer or commissioner subject to
contrary agreement (s.31; from memory, **UNVERIFIED** against the text: only the section heading was retrieved,
[WIPO Lex](https://www.wipo.int/wipolex/en/text/506082)); an assignment of copyright must be in writing (s.33,
UNVERIFIED). Moral rights remain with authors. The Employment Act 2007 governs employees (contracts in writing for
engagements over three months, KNOWN); misclassifying a regular, controlled worker as a contractor risks NSSF, SHIF and
PAYE liability.

**Fix.** Every freelance writer, photographer or developer signs a short contract before work starts. Starting text
(advocate to review):

> **Intellectual property.** The Contributor assigns to [Company] with full title guarantee all copyright and other
> intellectual property rights in everything the Contributor creates for [Company] under this agreement (the
> "Work"), throughout the world, from creation. To the extent any right cannot be assigned, the Contributor grants
> [Company] an exclusive, perpetual, irrevocable, royalty-free, worldwide licence to use, adapt, sublicense and
> publish it. The Contributor waives, to the extent the law allows, moral rights in the Work, except the right to be
> credited where [Company] credits contributors. The Contributor confirms the Work is original, does not infringe
> anyone's rights, and that any third-party material (including photographs and AI-generated material) is disclosed in
> writing with its licence. The Contributor will not present AI-generated images as real photographs.
> **Confidentiality and data.** The Contributor keeps confidential [Company]'s non-public information and any personal
> data it sees, and uses it only for the Work.

Photographers commonly refuse assignment; accept an exclusive licence for editorial use with credit instead.

---

## 11. Site changes made on this branch (wording only)

| File | Change | Why |
|---|---|---|
| `app/legal/terms/page.tsx` | Free reuse limited to research, journalism, teaching and non-commercial apps; commercial use needs a key, redistribution needs Enterprise; links `/licensing`. Renewal paragraph now matches checkout (a plan renews only if checkout shows it renewing; stop any time) | Contradicted D-016 and D-015 |
| `app/prices/page.tsx` | "Monthly items renew until you say stop" replaced with the same accurate renewal statement | Contradicted checkout and D-015 |
| `app/legal/disclaimer/page.tsx` | New paragraph: rankings order figures by one stated measure, are not ratings or recommendations, and past yields are not a guide to future returns | CIS and advice boundary |
| `components/data/MmfMonthView.tsx`, `lib/share-card.tsx` | "Best money market fund in Kenya **by yield**"; past-performance and "not a rating or recommendation" line | Overclaim; CIS advertising |
| `app/rates/kenya/money-market-funds/page.tsx` | Same past-performance line | CIS advertising |
| `app/editorial-standards/page.tsx` | Disclosure that fund "Open an account" links are counted and may in future earn a referral fee, and how it would be shown | Undisclosed in the standards |
| `app/about/page.tsx` | Funding list mentions possible fund referral fees | Consistency |
| `app/rates/kenya/loan-apps/page.tsx` | "really costs" to "What borrowers say each licensed lender costs"; reports "not verified with the lender ... not a finding by Afronomics or the CBK"; right of reply with contact; "No longer on the list" caveat (lapsed/revoked, rename, directory error) | Defamation |
| `app/rates/kenya/loan-apps/[lender]/page.tsx` | Same caveat and right-of-reply on the removed-lender notice and the cost section | Defamation |
| `app/jobs/page.tsx` | Removed "institutions that use/read Afronomics" and the audience claim; the verification line now matches `/jobs/post` (checked after it goes live, not before); "a genuine employer will not ask you to pay to apply" | Overclaims; internal contradiction |
| `app/licensing/page.tsx` | FX archive: third-party feed, no redistribution, reference inside own work only. Wire archive: headlines remain publishers' copyright; licence covers our tags, dates and links | Licensing rights we do not hold |
| `app/imprint/page.tsx` | "reproduced under each publisher's licence" to "subject to each publisher's terms of use" | Overclaim |
| `components/billing/PilotForm.tsx` | Link to the privacy notice at the point of collection | DPA s.29 notice at collection |

No company fact (registration number, address, person, customer, licence status) was added.

---

## 12. Founder legal checklist (one page, by urgency)

Costs are public figures where found, otherwise marked ESTIMATE. "Time" is elapsed time.

| # | Do | Why | Cost | Time |
|---|---|---|---|---|
| 1 | **Confirm Pesara Limited on eCitizen BRS** (number, office, directors, CR12); if not registered, incorporate before signing anything; decide the one name used everywhere | Every contract, invoice, ODPC, KRA and Paystack record depends on it | Search free-low; incorporation ESTIMATE KES 10,000-25,000 | 1 day (exists) / 1-2 weeks (new) |
| 2 | **Do not switch on any fund referral (`AFF_FUND_*`) or take money from any fund manager**; decide whether to rename "Open an account" to "Manager's site" | CIS Regulations 2023 | Nil | Today |
| 3 | **Take the FX archive and Wire archive out of paid licences**; never put Eurobond prices in the API/CSV | No redistribution rights | Nil | Today |
| 4 | **Register with the ODPC** as data controller | DPA s.18, direct-marketing carve-out | KES 4,000 (micro/small) | 1-2 weeks |
| 5 | **KRA PIN for the company, eTIMS registration**, decide voluntary VAT registration with a tax agent; until the PIN exists, remove "KRA PIN on request" from `/prices` | Invoices to Kenyan institutions | eTIMS free; tax agent ESTIMATE KES 15,000-40,000 setup | 1-2 weeks |
| 6 | **Advocate opinion (one engagement)**: (a) CIS advertising and referral fees, (b) investment-adviser licence boundary, (c) review `data-licence-agreement.md` and `pilot-terms.md`, (d) F9 clause | Top risks 1, 6, 10 | ESTIMATE KES 80,000-200,000 | 2-4 weeks |
| 7 | **Newsletter double opt-in** and honour unsubscribes (security review M-4); add opt-out line to outreach | DPA s.37 and regs | Dev time | 1 day |
| 8 | **Privacy notice v2**: controller identity, processor table with countries, retention table, AI provider; accept and file Vercel/Supabase/Resend DPAs | DPA ss.29, 48-49 | Nil | 1 day after item 1 |
| 9 | **Breach runbook** (72-hour ODPC notice) | DPA s.43 | Nil | Half a day |
| 10 | **Lender scorecard procedure**: notify each lender before its figures go live, publish replies, takedown within 24h on complaint | Defamation | Nil | Before the first scorecard row |
| 11 | **Refund rule** on `/legal/terms`; receipt links the terms version | Consumer Protection Act ss.31-33, 75 | Nil | 1 hour |
| 12 | **Trademark search** (KIPI, WIPO) then file AFRONOMICS in 35, 36, 41, 42, or rebrand | World Bank podcast conflict | ESTIMATE KES 60,000-120,000 for 4 classes with agent | Search 1-2 weeks; registration 6-12 months |
| 13 | **Business name** registration for "Afronomics"/"Afronomics Feed" if trading under it | Registration of Business Names Act | Low (UNVERIFIED fee) | Days |
| 14 | **Domain**: confirm the registrant is the company; lock; renew 5 years | Asset protection | Registrar fees | 1 hour |
| 15 | **W-8BEN-E** with a tax adviser before the first US payer | US withholding | Included in item 5 or ESTIMATE KES 10,000-30,000 | 1 week |
| 16 | **Contributor IP contract** before any freelance writer or photographer | Copyright Act s.31/33 | Nil (template §10) | Before first hire |
| 17 | **Founder holdings and trading policy** (one line on `/editorial-standards`) | Conflicts, advice boundary | Nil | 1 hour |
| 18 | **AI label on AI-drafted stories; image policy** | Transparency | Dev time | 1 day |

**Things to change on the site now (beyond this branch):** remove "KRA PIN on request" (`app/prices/page.tsx`) until
the PIN exists; fix the `/prices` meta "data licences from KES 7,500" (D-016) and reconcile "Annual billing takes two
months off everything monthly" with the institutional "no annual price" rule; name the legal entity on `/imprint`,
`/legal/privacy`, `/legal/terms` and the footer once item 1 is done.
