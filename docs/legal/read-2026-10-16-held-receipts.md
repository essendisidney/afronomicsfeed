# Legal read: four held Receipts, 16 October 2026

**Read this first.** This is general legal information written by Afronomics Feed's in-house AI adviser, the same role
that wrote `docs/legal/legal-review-2026-10.md`. I am not a licensed advocate. Nothing here is legal advice to act on
without a Kenyan advocate. It is meant to help the founder decide what can go out, what changes first, and what must
go to an advocate. I say where I could not read the primary text of a law.

**Scope.** The four Receipts held by D-023 and D-024:

1. `content/receipts/2026-10-15-safaricom-stake-sale.md`
2. `content/receipts/2026-10-15-fuliza-true-cost.md`
3. `content/receipts/2026-10-15-banks-lend-to-government.md`
4. `content/receipts/2026-10-15-kenya-airways-bailout-bill.md`

**Inputs read:** `docs/rebuild/RECEIPTS.md` (section 2 rules on named companies), `docs/editorial/voice.md`,
decision log D-019, D-020 and D-022 to D-024, `app/editorial-standards/page.tsx`, `app/legal/disclaimer/page.tsx`,
`lib/site.ts` (`disclaimer`), each draft and its `docs/rebuild/<slug>-source-checks.md`.

**Labels.** **PRIMARY** = I read the text of the law itself, fetched by the Probe workflow on 16 Oct 2026 (run ids
given). **SEARCH** = read in a web-search extract only. **UNVERIFIED** = I could not confirm it; an advocate must.

**What I did not do.** I did not publish anything, change any `status`, email any company, or resolve any `verify`
item. I changed no figure. All four files stay `status: draft`.

---

## 0. Summary

| Receipt | Risk before edits | Risk after edits | Recommendation |
| --- | --- | --- | --- |
| Safaricom stake sale | **High** | **Medium** | **Hold until the judgment is read (verify item 1), then a Kenyan advocate's read.** A facts-only court report could go earlier, once item 1 is done |
| Fuliza true cost | Medium | Low-Medium | **Publish after edits and a right of reply to Safaricom** (3 working days) |
| Banks lend to government | Low | Low | **Publish after edits** (founder one-tap and disclosure); a courtesy figure check with the three banks is optional |
| Kenya Airways bailout bill | Medium-High | Medium | **Publish after a right of reply to Kenya Airways and the 4 open verify items** (3 are the original, 1 added today) |

All four still need the founder to confirm the disclosure line (each carries a `[founder to confirm]` or `[CONFIRM]`
placeholder) and the D-019 one-tap approval.

---

## 1. The law, briefly

### 1.1 Defamation Act (Cap. 36), read in full (PRIMARY: Kenya Law, as at 23 Oct 1992, Probe run 38879080633)

- **s.6**: "A fair and accurate report in any newspaper of proceedings heard before any court exercising judicial
  authority within Kenya shall be absolutely privileged."
- **s.7 and the Schedule**: qualified privilege, defeated by malice, for listed reports. Part I para 3 covers a fair and
  accurate copy of or extract from a public register. Part II para 9 covers "a copy or fair and accurate report or
  summary of any notice or other matter issued for the information of the public by or on behalf of any department of
  the government". Part II privilege is lost if the subject asks us to publish "a reasonable letter or statement by way
  of explanation or contradiction" and we refuse or neglect to (s.7(2)). The Treasury's debt reports fall here, and so
  does KQ's dispute of them.
- **s.7A, right of reply**: anyone affected by a damaging "factual inaccuracy" may write within 14 days. The correction
  must run in the next possible edition with similar prominence. Failing to publish it can increase damages (s.7A(6)).
- **s.14, justification**: the defence does not fail just because not every charge is proved, if the unproved ones do
  not materially injure reputation.
- **s.15, fair comment**: the defence does not fail just because not every fact is proved, "if the expression of
  opinion is fair comment having regard to such of the facts alleged or referred to in the words complained of as are
  proved". So the facts an Opinion rests on must be **in the piece** and **provable**. An opinion resting on an
  unverified fact (a press report, an open verify item) is the weak point.
- **Important limit.** s.2 defines "newspaper" as a paper "printed for sale" and published at intervals of 36 days or
  less. **A website is very likely not a "newspaper"**, so the statutory privileges in s.6 and s.7 may not protect us
  at all. We would rely on the common law (fair and accurate report of court proceedings, the public-interest defence
  in case law, fair comment) and on accuracy. Whether s.6 or s.7 reaches online publication is UNVERIFIED; an advocate
  should say. In practice: write as if no statutory privilege applies.
- Limitation: 12 months from publication (s.20, amending the Limitation of Actions Act).
- Malice indicators a court looks for: refusing to give the subject a chance to respond, ignoring a known denial,
  words that go beyond the facts, and imputing motive. The edits below remove these.

### 1.2 Contempt and sub judice (Safaricom only)

- The **Contempt of Court Act, 2016 was declared invalid in full** by the High Court in *Kenya Human Rights Commission
  v Attorney General & another* (Petition 87 of 2017, Mwita J, 9 Nov 2018), for lack of public participation and for
  encroaching on judicial independence (SEARCH: [Kenya Law](https://new.kenyalaw.org/akn/ke/judgment/kehc/2018/9656),
  [Capital FM](https://capitalfm.africa/entire-contempt-of-court-act-nullified-by-constitutional-court/)). Kenya Law's
  consolidated text still prints the Act with a footnote recording that. I found no appeal reversing it (UNVERIFIED).
- What replaces it: the superior courts' inherent power to punish contempt, which the judgment treats as not needing
  a statute. The common-law sub judice rule (a publication that creates a real risk of prejudice to pending
  proceedings) therefore still applies, now without a statutory test. Whether s.5 of the Judicature Act (repealed by
  the 2016 Act) revived is UNVERIFIED.
- **Weighing.** Article 50 (fair hearing) against articles 33 and 34 (expression, media freedom). Any restriction must
  meet article 24. The risk of prejudice is lowest where judges, not a jury, decide, and **lowest of all on appeal**.
  Kenyan courts have still punished commentary on pending cases (SEARCH:
  [Nairobi Law Monthly](https://nairobilawmonthly.com/dignity-of-the-court-vs-freedom-of-expression/),
  [Oraro](https://oraro.co.ke/?p=59022)).
- **Practical rule for a case before the Court of Appeal:**
  - Safe: an accurate account of what each court decided, from the judgment itself, saying that an appeal is pending.
    Each party's stated position, attributed. Commentary on the commercial terms (price, dividend advance) that the
    appeal does not turn on.
  - Avoid: any view on whether the High Court was right (public participation); predictions of the appeal's outcome;
    anything that reads as urging the court one way; anything suggesting a court order will not be obeyed; any
    comment on judges or parties' motives.
- **Is a price verdict risky while validity is litigated?** The appeal is about process (public participation), not
  price, so a verdict on price does not, on its face, prejudge the issue. Two cautions. The remedy (restoring shares,
  refunding KES 204.3bn, dividends paid) is live, and value may become relevant to it. And a verdict that the price was
  "soft" can be quoted by a party. Keeping the verdict to the terms and saying plainly that we take no view on legality
  reduces, but does not remove, the risk. That is why I recommend an advocate's read before this one goes out.

### 1.3 Capital Markets Act (Cap. 485A) and the advice boundary

- **s.2 "investment adviser"** (PRIMARY: Kenya Law, as at 4 Nov 2025, Probe runs 38879083319 and 38879248304):
  anyone who, "for remuneration", carries on the business of advising others concerning securities, or "as part of a
  regular business, issues or promulgates analyses or reports concerning securities".
- **Correction to the October review (§2.2).** The definition does have a **newspaper exclusion**. Paragraph (vi)
  excludes "a person who is the proprietor of a newspaper **and holder of a permit issued under the Books and
  Newspapers Act (Cap. 111)**", where the paper goes only to subscribers and purchasers for value, the analysis is
  published only through that paper, no commission or other consideration is received for it, and it is "solely
  incidental" to the newspaper business. Afronomics holds no such permit as far as I know (UNVERIFIED), and it
  publishes online and partly free. **The exclusion probably does not cover us as things stand.** Advocate question:
  can a digital publisher use it, or get the same position another way?
- **s.32J** (false or misleading statements inducing securities transactions) is in Part VI on market abuse. I read
  only its heading in the contents, not its wording (UNVERIFIED). The general shape of such offences is a false or
  misleading statement made knowingly or recklessly that is likely to induce dealing. Accurate figures from filings,
  with opinion labelled as opinion, are the defence in practice.
- **Applied to these four.** None tells anyone to buy, sell or hold. `scripts/receipt_check.py` blocks that language,
  and "Information, not advice." is on every free piece. That label helps, but it does not change the nature of a
  statement. Two things raised risk:
  - (a) a dated **call on a listed share's price** (Safaricom above KES 34 on 31 March 2027). This is a price forecast
    on a named security, which the October review's house rule bans. **Removed.**
  - (b) forward calls on issuers' dividends and losses while one issuer (KQ) has a **cautionary notice** out. These are
    lower risk because they rest only on public information and are labelled; they are flagged for the advocate, not
    removed.
- **Price sensitivity.** Every fact in these drafts is already public (filings, court reports, published tariffs).
  Nothing is inside information. KQ's cautionary notice of 9 Oct 2026 is the reason to be exact and attributed there.

### 1.4 Data Protection Act, 2019

Individuals named across the four:

- Public officeholders: Treasury CS John Mbadi; the judges in the press accounts are not named in the drafts.
- Senior executives speaking publicly in their role: Vodacom's Shaun Biljon to analysts; Allan Kilavuka, added today,
  quoting a public statement.
- No private individuals. The Safaricom petitioners are deliberately **not** named, and should stay unnamed.

The Act has an exemption for journalism (the section number and exact conditions are UNVERIFIED). Processing a
public role-holder's public statements for news is low risk. **Low** for all four.

### 1.5 Right of reply and fairness

- The Media Council's Code of Conduct (Second Schedule, Media Council Act 2013) asks for comment from anyone portrayed
  unfavourably, and for prompt correction (SEARCH:
  [MCK code](https://www.mediacouncil.or.ke/sites/default/files/regulations/CODE%20OF%20CONDUCT%20FOR%20MEDIA%20PRACTICE%20FV%20revised.doc)).
  A 2025 Code of Media Practice (Legal Notice 88 of 2025) also requires "a fair opportunity for individuals or
  organisations to respond" (SEARCH: [Kenya Law](https://new.kenyalaw.org/akn/ke/act/ln/2025/88/eng@2025-08-01)).
  Which code is now in force, and whether it binds a digital publisher that is not accredited, is UNVERIFIED.
- RECEIPTS.md section 2 already requires "The subject's own explanation is quoted where it has given one."
- Defamation Act s.7(2) and s.7A make offering a reply, and printing one, part of the defence.

---

## 2. Safaricom stake sale: **High, Medium after edits**

**Why high.**

- The sale is in active litigation: High Court judgment of 15 Sep 2026; Court of Appeal refused a stay on 13 Oct 2026,
  confirmed in [The Standard, 13 Oct 2026](https://standardmedia.co.ke/crime-and-justice/article/2001560024/court-of-appeal-rejects-state-vodacom-bid-to-suspend-ruling-nullifying-safaricom-sale)
  (Probe run 38879132028, `datePublished` 2026-10-13).
- Every statement about both decisions rests on press reports, not the judgment (verify item 1).
- The CMA exemption that the "no offer to minorities" line depends on rests on one press source (verify item 2).
- The draft had a call that in effect bet against a subsisting court order being carried out.

| # | Problem sentence (as drafted) | Why | Safer wording (applied) |
| --- | --- | --- | --- |
| S1 | Title: "…and a court that says undo it" | Colloquial gloss of a court order in a pending case; reads as a one-sided account | "…and a High Court ruling now under appeal" |
| S2 | Verdict: "KES 34 beat the market on the day, but it was a soft price for control, and the dividend advance was dear money." (front matter, lede, verdict) | Opinion on the Treasury's decision; fair in substance, but must read unmistakably as opinion | "In our view, KES 34 beat the market on the day but was a low price for control, and the dividend advance was dear money." |
| S3 | Summary: "It handed over control without a takeover offer, and the High Court has since declared the sale void." | Omits that the ruling is under appeal; the no-offer point rests on a press report of a CMA exemption | "Under a regulator's exemption reported in the press, it handed over control without a takeover offer. The High Court has since declared the sale void; the government and Vodacom intend to appeal." |
| S4 | "Then, on 15 September, the High Court declared the whole sale void." | Fair report should say the matter is still live | "…declared the sale void. The government and Vodacom intend to appeal, and the case is still before the courts." |
| S5 | Court paragraph, from tech-ish and Citizen only | Without the judgment, accuracy of the report is unproven; s.6-type privilege needs a *fair and accurate* report | Added: "We have not yet read the judgment itself; this account is taken from press reports of it." Also says the 13 Oct ruling was on a stay, not the appeal |
| S6 | "the minority shareholders on the NSE got no offer at all. A premium of a fifth over a December close is the least the state could have asked for that." | "Got no offer at all" omits that the regulator exempted it (per the press); "the least the state could have asked" is a hard verdict on the Treasury | "under the exemption tech-ish reports the CMA granted, the minority shareholders on the NSE were not made an offer. In our view, a premium of a fifth over a December close is a modest price for control." |
| S7 | "the buyer also skipped the offer to everyone else" | "Skipped" imputes that Vodacom avoided a legal duty; on the reported facts it was exempted by the CMA | "under the reported exemption, the other shareholders were not made an offer" |
| S8 | "Vodacom gets control of Safaricom." | Present tense contradicts a subsisting High Court order to restore the shares (stay refused) | "The sale gave Vodacom control of Safaricom; the High Court has since ordered the shares restored, and that order is the subject of the intended appeals." |
| S9 | "And the High Court has found that the process lacked the public participation the constitution requires, a finding the government is challenging. If that challenge fails, someone has to work out how KES 244.5 billion already paid goes back." | Folds the litigated issue into our verdict and speculates on the remedy (refund), which is live and disputed | Replaced with: "This verdict is on the price and the terms, not on whether the sale was lawful. That question is for the Court of Appeal, and we take no view on it." The attributed non-refundable line is kept |
| S10 | "What would change our mind: … Or a Court of Appeal judgment that the public consultation was enough." | Signals a view on the merits of the appeal | Removed; the KCB valuation line tied to "a higher value for control" |
| S11 | Call: "No court order returns the 15% to the government in 2026: the state's stake is still reported at 20% on 31 December 2026" | A court order to return the shares **already exists**. This is a public bet that it will not be carried out; it could be read as anticipating non-compliance or as comment on the litigation | **Removed** |
| S12 | Call: "Safaricom's shares close above the KES 34 sale price on 31 March 2027" | A price forecast on a listed security; CMA advice boundary (October review §2.2 house rule) | **Removed** |
| S13 | Full file: "If the appeal fails: what the High Court's order means…" | Frames the Pro product around a litigation outcome | "The court record: what the High Court's order says…, on the judgment's own wording, once we have read it." |

Kept, and why:

- "dear money" and the 16.5% IRR: these rest on Vodacom's own figure to analysts, quoted and attributed. Fair comment
  on stated facts.
- Business Daily's "leaving about KES 37.1 billion on the table": attributed to a named source.
- The two dividend calls (interim at least KES 0.85; full year at least KES 2.00): forecasts of an issuer's
  distributions. Lower risk; listed for the advocate.

**Before publication.**

1. Resolve verify item 1: read both decisions on Kenya Law, record the case numbers, and check every sentence about
   the grounds and orders against the text. Rewrite to the judgment's own words where they differ.
2. Resolve verify item 2 (CMA exemption notice). If the CMA notice cannot be found, keep the attribution as written.
3. **Kenyan advocate** (litigation or media) reads the final text before release. This is the D-019 legal read; it
   should not be waived for this one.
4. Right of reply: email Safaricom, Vodacom and the National Treasury press offices with the factual paragraphs and the
   verdict; give 3 working days; quote any reply. The Treasury is the party whose decision is judged.
5. Founder confirms the disclosure (no Safaricom shares) and one-tap approval.

**Recommendation: hold until the judgment is read and an advocate has read the text.** If the founder wants something
out sooner: a facts-only court report (the deal terms and the two decisions, from the judgment, no verdict, no calls)
is defensible once step 1 is done.

---

## 3. Fuliza true cost: **Medium, Low-Medium after edits**

**Why medium.** The facts are strong: Safaricom's own tariff table, quoted; its audited results booklet; arithmetic
shown. The risk is in implying that Safaricom presents the price misleadingly ("makes it look cheap", "trap", "does
not tell anyone"). That is an imputation of unfair or deceptive practice, which no regulator or court has found and
which the piece does not prove. The 584% headline is also open to a "sensational" attack. The editor already cut the
compounded rates for that reason.

| # | Problem sentence | Why | Safer wording (applied) |
| --- | --- | --- | --- |
| F1 | Verdict: "Fuliza is priced in shillings a night, which makes it look cheap; added up, Safaricom's own fees on a KES 1,000 balance work out at 231% to 584% a year, sixteen to forty times the average bank loan." | "Makes it look cheap" imputes intent; "Safaricom's own fees" is loose (the booklet says it runs Fuliza with NCBA, KCB and Sidian); "bank loan" compares a fee rate with an interest rate | "Fuliza is priced in shillings a night, which is accurate but hard to add up; worked out as simple yearly rates, the published fees on a KES 1,000 balance come to 231% to 584% a year, sixteen to forty times the average bank loan rate." |
| F2 | "Safaricom's own price list says you pay KES 52." | The price list gives tariffs, not the KES 52 total (our sum) | "by Safaricom's own price list the charges come to KES 52" |
| F3 | "As a yearly rate it is 271%." | Must be clear that this is our arithmetic and a simple rate | "As a simple yearly rate, by our arithmetic, it is 271%." |
| F4 | "it does not tell anyone that a month on KES 1,000 costs nineteen percent" | An unverified factual claim about what customers are told | "on its own it does not show that…" |
| F5 | "The band steps add a trap of their own" | "Trap" imputes design to ensnare | "a cliff of their own"; and the paragraph now says the 584% figure is one night, mostly the one-off 1% fee, and 30 nights is 231% (balance for fair comment) |
| F6 | "Evidence that Fuliza customers see the total cost and a yearly rate before each draw." | Implies they are not shown it (a possible disclosure breach) without our having checked | "…are shown the total cost and a yearly rate before each draw; we have not tested what the M-PESA menu shows, and Safaricom is welcome to tell us." |

**Other points.**

- NCBA, KCB and Sidian are named only as Fuliza's lenders, quoting the booklet, with no adverse imputation. Low.
- CMA: the calls on Fuliza disbursements, ticket size and the tariff are about operating metrics, not share prices. Low.
- Accuracy note, not legal: the T-bill source is the CBK results PDF "DATED 19-10-2026". That is the value date; the
  source `date:` is 19 Oct, after the Receipt's 15 Oct `asOf`. Set it to the auction date when the desk next touches it.

**Before publication.**

1. Right of reply: email Safaricom's press office with the six-band table, the four worked cases, the method line
   ("cost ÷ amount × 365 ÷ nights") and the verdict line. Ask specifically what the M-PESA menu shows before a draw.
   Give 3 working days and quote any reply.
2. Founder confirms the disclosure and one-tap approval.

**Recommendation: publish after the edits and the right of reply.** No advocate needed unless Safaricom objects in
writing.

---

## 4. Banks lend to government: **Low**

**Why low.** Every bank figure comes from the bank's own audited statements and the CBK's annual report, with exact
line references in the source checks. The opinion is about the system ("The question is structural"), not about any
bank's conduct. Naming Equity as "the striking one" is a fair description of its own audited numbers. These are the
subsidiary banks (KCB Bank Kenya, Equity Bank (Kenya), Co-op). The listed holding companies are not judged.

| # | Problem sentence | Why | Safer wording (applied) |
| --- | --- | --- | --- |
| B1 | "This is not a story about greedy bankers. A bank that can earn a steady return from the state, with almost no credit-loss provisions…" | Introduces "greedy" even in denial; "almost no credit-loss provisions" is an unsourced factual claim | "This is not a story about bad bankers. … with far less credit risk to provide for and no collateral to chase…" |
| B2 | "banks will keep close to a third of their balance sheet in its paper" | 29.9% is the sourced figure; "close to a third" overstates, and "will" reads as a stated fact about the future | "we expect banks to keep about 30% of their assets in its paper" |

No CMA concern: nothing on share prices, and "sensible for a bank" is a view on behaviour, not a recommendation. No
individuals named.

**Before publication.** The founder confirms the disclosure (it also covers Kenya government securities) and gives
one-tap approval. Optional courtesy step: send the three-bank table to each bank's investor-relations or press office
for a figure check, with 2 working days. This is good practice, not required, since every figure is from their own
audited filings.

**Recommendation: publish after the edits.**

---

## 5. Kenya Airways bailout bill: **Medium-High, Medium after edits**

**Why medium-high.**

- It repeats the Treasury's statement that a guarantee was called "as a result of loan payment defaults". That is an
  allegation about a company's credit. It is privileged at most as a fair report of a government publication (Schedule
  Part II para 9, if s.7 applies to us at all), and that privilege is subject to "explanation or contradiction".
- **Kenya Airways has publicly disputed the Treasury's default figures**, and the draft left that out. D-024 asked for
  it to be added. Leaving out a known denial is a classic malice indicator.
- KQ has a cautionary notice out (9 Oct 2026), so accuracy on price-relevant facts matters more.
- The half-year 2026 loss, used in the verdict, rests on two press reports (verify item 1).

**KQ's dispute, now added.** The source is ch-aviation, ["Kenya Airways disputes Treasury's EXIM Bank default
claim"](https://www.ch-aviation.com/news/120924-kenya-airways-disputes-treasurys-exim-bank-default-claim). I read the
page through Probe run 38879132028 (HTTP 200).

- It reports that CEO Allan Kilavuka "disputed reports the airline has defaulted on a USD841 million loan" cited in
  the Treasury's FY2021/22 debt report.
- It quotes him: "The value you quote for the US EXIM facility is not correct. USD485 million is what relates to the US
  EXIM guaranteed debt", and says the airline "has requested GOK … support on the guaranteed loan to avert the
  possibility of the loan going into default".
- The page shows "01Nov" with no year in the captured text. 2022 is inferred and added as a new verify item.
- The East African interview it quotes returned 403.

| # | Problem sentence | Why | Safer wording (applied) |
| --- | --- | --- | --- |
| K1 | "Kenya Airways owes KES 132 billion more than it owns." (lede and chart title) | Negative equity is liabilities over assets; "owes" implies debt only (liabilities include other items) | "Kenya Airways' liabilities exceed its assets by KES 132 billion." / chart: "…liabilities exceed its assets by KES 132bn" |
| K2 | "KES 167 billion of public money, already lent or about to be: more than the airline's whole revenue for 2025" | The US$350m is approved subject to agreements and approvals; the comparison figure is total income, not revenue | "…already lent or approved, subject to agreements and approvals: more than the airline's whole income for 2025" |
| K3 | Verdict: "…lender of last resort: it pays the airline's aircraft loan…" | States as fact a characterisation KQ has contested; the Treasury says it took the loan onto its books | "In our view the state is no longer just … lender of last resort: it has taken over the airline's guaranteed aircraft loan…" |
| K4 | Treasury default paragraph, with no response | Known denial omitted (see above) | New (Facts) paragraph quoting KQ's dispute, attributed to ch-aviation; "The figures in the table below are the Treasury's." |
| K5 | "That is at least KES 32.0 billion in two years" | Should be visibly the Treasury's numbers | "On the Treasury's figures, that is at least KES 32.0 billion…" |
| K6 | "…and the payer of the aircraft loan." | Same | "…and, on the Treasury's account, the payer of the guaranteed aircraft loan." |
| K7 | "…and its half-year loss for 2026 was larger than a year earlier." | Opinion rests on an unverified fact (verify item 1); fair comment needs proved facts (s.15) | "…and press reports of its unaudited results put its half-year loss for 2026 above the year before. The airline puts 2025 down mainly to the grounding of three Dreamliners, which it says was driven by global supply chain constraints and limited engine availability." (the subject's own explanation, per RECEIPTS.md section 2) |

Kept: "lender of last resort", "Turning loans into shares changes the label on that money", and "nobody outside can
say what the taxpayer is getting". These are opinion on the policy, based on facts stated in the piece.

The three calls (negative equity at end-2026, a bigger 2026 loss, conversion not done by 30 June 2027) are forecasts
on a listed issuer under a cautionary notice. They are labelled, rest on public facts and give no trading instruction.
**Medium-low**, listed for the advocate.

**Before publication.**

1. Resolve the open verify items: H1 2026 figures from the filing (OCR the scanned PDF or get KQ's text), the 48.90%
   shareholding, the two publication dates, and the ch-aviation year (new).
2. Right of reply: email Kenya Airways corporate communications with the Treasury-payments table, the default sentence
   and the verdict. Ask whether its 2022 position still stands and whether it disputes the FY2022/23 and FY2024/25
   figures. Give 3 working days and quote any reply in place of or beside the 2022 quote.
3. Founder confirms the disclosure and one-tap approval.

**Recommendation: publish after the right of reply and the verify items.** An advocate is not essential if KQ does not
object. Get one if KQ disputes the facts in writing.

---

## 6. For the founder and the advocate

**Founder.**

- Confirm four disclosures.
- Decide whether to send the right-of-reply emails (Safaricom/Vodacom/Treasury; Safaricom for Fuliza; KQ). I sent
  none. A one-paragraph template: what we will publish, the figures, the date, a 3-working-day window, "we will quote
  your response".
- Do not waive the legal read for Safaricom.

**Advocate questions (one opinion can cover all):**

1. After *KHRC v AG* (2018), what is the test for contempt by publication while an appeal is pending, and does the
   edited Safaricom text pass it?
2. Do Defamation Act s.6 and s.7 privileges extend to an online-only publication?
3. Can Afronomics fall within the s.2 "investment adviser" newspaper exclusion in the CMA Act (Books and Newspapers Act
   permit), or otherwise outside the definition? This updates October review §2.2.
4. The wording of CMA Act s.32J, and whether dated forecasts of a listed issuer's dividend or loss raise any issue
   while it has a cautionary notice out.
5. Which Media Council code now applies (2013 Second Schedule or LN 88/2025), and does it bind us?
6. The Data Protection Act's journalism exemption: section and conditions.

## 7. Changes made on branch `legal/read-2026-10-16`

Wording only, in the four drafts. No figure changed. `status: draft` kept. No verify item removed; one added (KQ). Two
calls removed from the Safaricom draft (S11, S12). One source added to the KQ draft (ch-aviation).
`python3 scripts/receipt_check.py` and `python3 -m pytest -q tests/site -k receipt` pass.
