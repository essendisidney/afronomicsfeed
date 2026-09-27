insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'anatomy-of-a-cma-enforcement-notice', 'Anatomy of a CMA enforcement notice', 'A field guide to the usual parts of a Capital Markets Authority enforcement or public notice — parties, conduct, law, and remedy — so a desk can file the document instead of the rumour.', 'original', 'published', '2026-09-05'::timestamptz, id, $md0$The Capital Markets Authority is the statutory regulator for Kenya’s capital markets. When it publishes an enforcement-related notice, the document — not the tape, not a forwarded PDF of unknown provenance — is the source of record. Start at [cma.or.ke](https://www.cma.or.ke/).

## The four-part read

Most public notices, regardless of tone, can be annotated in four blocks:

1. **Parties.** Who is named: issuer, licensed person, director, or other. Record legal names as printed, not as the market nickname.
2. **Conduct.** What the Authority says occurred or is alleged. Keep the Authority’s verbs. “Failed to disclose” and “is investigating” are not interchangeable.
3. **Statutory hook.** Which Act, regulation, or licence condition is cited. If the notice is silent, write “hook not stated” rather than inferring one.
4. **Remedy or next step.** Fine, directive, licence action, warning, or a request for information. A “next step” is not a final order.

Those four blocks are **facts** about the notice. They are not a view on the issuer’s equity.

## What to refuse

Refuse secondary summaries that add a motive, a price implication, or a comparison to an unnamed “similar case” without citing the notice. Refuse any briefing that converts a regulator’s process into a trading slogan.

If a notice is later varied, withdrawn, or supplemented, that event belongs in the [corrections log](/corrections) or in a follow-up brief with a new as-of date. Do not silently overwrite the first file.

## Filing rule

A complete desk file has: the Authority URL, the notice date, the four-part annotation, and a one-line statement of what is still unknown. Unknowns are allowed. Invented particulars are not.

This brief describes document structure. It does not reproduce a live enforcement docket, and it does not assign outcomes to named listed companies.$md0$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Capital Markets Authority — Kenya', 'https://www.cma.or.ke/', 'Anatomy of a CMA enforcement notice', '2026-09-05'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.cma.or.ke/' and publisher = 'Capital Markets Authority — Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.cma.or.ke/' and s.publisher = 'Capital Markets Authority — Kenya'
where a.slug = 'anatomy-of-a-cma-enforcement-notice'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Capital Markets Authority — About', 'https://www.cma.or.ke/about-us/', 'Anatomy of a CMA enforcement notice', '2026-09-05'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.cma.or.ke/about-us/' and publisher = 'Capital Markets Authority — About');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.cma.or.ke/about-us/' and s.publisher = 'Capital Markets Authority — About'
where a.slug = 'anatomy-of-a-cma-enforcement-notice'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'anatomy-of-an-nse-issuer-announcement', 'Anatomy of an NSE issuer announcement', 'A method for filing a listed-issuer announcement from the exchange — headline, instrument, period, and what the notice does not say — without treating the first alert as the tape.', 'original', 'published', '2026-09-10'::timestamptz, id, $md1$A listed issuer speaks to the market through the [Nairobi Securities Exchange](https://www.nse.co.ke/). The Capital Markets Authority sets the disclosure regime; the exchange is where the notice is filed. This brief is a reading method. It does not reproduce a live announcement, and it does not carry an equity print.

## Five fields on the notice

1. **Legal name and ticker as printed.** Market nicknames do not enter the file.
2. **Notice type.** Results, trading update, board change, cautionary, rights, or “other.” Keep the exchange’s label.
3. **Period or event date.** A half-year pack and a subsequent correction are two documents.
4. **What is attached.** Full statement, extract, or a one-page notice. If the PDF is missing, write “attachment not on the page.”
5. **What is unsigned.** Forecasts, “subject to,” and items marked unaudited stay marked that way.

Those five fields are **facts** about the announcement. Inferring a capital action the notice does not name is not analysis; it is invention.

## The tape is a different window

Live prints and the index strip are not this document. Afronomics Feed does not scrape or republish NSE quotes. For the official tape, use the exchange. Any figure in our [bank forensic index](/trackers/banks) that is not copied from a cited statement is **EXAMPLE DATA**.

## Filing rule

A complete desk note has: the NSE URL, the notice date, the five fields, and a one-line list of unknowns. If CMA later publishes a related notice, it is a second primary — see [Anatomy of a CMA enforcement notice](/brief/anatomy-of-a-cma-enforcement-notice) — not a rewrite of the first file.$md1$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Nairobi Securities Exchange', 'https://www.nse.co.ke/', 'Anatomy of an NSE issuer announcement', '2026-09-10'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.nse.co.ke/' and publisher = 'Nairobi Securities Exchange');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.nse.co.ke/' and s.publisher = 'Nairobi Securities Exchange'
where a.slug = 'anatomy-of-an-nse-issuer-announcement'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Capital Markets Authority — Kenya', 'https://www.cma.or.ke/', 'Anatomy of an NSE issuer announcement', '2026-09-10'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.cma.or.ke/' and publisher = 'Capital Markets Authority — Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.cma.or.ke/' and s.publisher = 'Capital Markets Authority — Kenya'
where a.slug = 'anatomy-of-an-nse-issuer-announcement'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'how-to-read-a-cbk-mpc-statement', 'How to read a CBK Monetary Policy Committee statement', 'A desk method for reading an MPC statement as a primary document — rate line, diagnostics, and operations — without treating the headline as the whole decision.', 'original', 'published', '2026-09-08'::timestamptz, id, $md2$An MPC statement is a primary document. It is not a markets colour piece, and it is not a scoreboard. The useful habit is to read it in layers, then go back to the [Central Bank of Kenya monetary-policy page](https://www.centralbank.go.ke/monetary-policy/) for the current published figures. This brief does not reprint a rate. Official numbers live with the Bank.

## Layer one: the decision sentence

The first task is to isolate the Committee’s action in a single sentence: hold, raise, or reduce the Central Bank Rate, and by how much. That sentence is a **fact**. Everything that follows is either supporting diagnosis or an operational instruction. Mixing those three registers is how a briefing becomes noise.

If a secondary report paraphrases the sentence without linking the statement, treat the paraphrase as unverified until you have the Bank’s text.

## Layer two: the diagnostic stack

Most statements then walk through prices, activity, the external account, and credit conditions. Read this stack as the Committee’s evidence, not as a forecast you should trade. Note which variables the Committee treats as binding this month, and which it treats as watch-items. That distinction is **analysis** of the document’s structure — it is not a view on where the rate “should” go.

A practical annotation:

- Which inflation measure does the Committee emphasise?
- Does it describe food, fuel, or core separately?
- Is private-sector credit discussed as a constraint or as a residual?

## Layer three: operations and liquidity

The least-quoted paragraphs are often the ones that matter to treasurers: how the Bank describes liquidity, open-market operations, and the corridor around the policy rate. A rate decision that is not matched by operating language is incomplete. A rate hold that is matched by tighter operational language is not “nothing happened.”

Do not substitute interbank chatter for the Bank’s own description. If you need the tape of current money-market prints, use official publications — not this desk’s placeholders.

## What this brief will not do

We will not attach a directional call to the next Committee date. We will not translate the statement into portfolio language. The job of the Daily Brief is to make the primary text usable: what was decided, what evidence was cited, and which operational sentences a treasury or risk desk should file.

For the latest published Central Bank Rate and the full statement archive, use the Bank’s site. If a figure appears in an Afronomics table without a citation and an as-of stamp, treat it as unsafe.$md2$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — Monetary Policy', 'https://www.centralbank.go.ke/monetary-policy/', 'How to read a CBK Monetary Policy Committee statement', '2026-09-08'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/monetary-policy/' and publisher = 'Central Bank of Kenya — Monetary Policy');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/monetary-policy/' and s.publisher = 'Central Bank of Kenya — Monetary Policy'
where a.slug = 'how-to-read-a-cbk-mpc-statement'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — home', 'https://www.centralbank.go.ke/', 'How to read a CBK Monetary Policy Committee statement', '2026-09-08'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/' and publisher = 'Central Bank of Kenya — home');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/' and s.publisher = 'Central Bank of Kenya — home'
where a.slug = 'how-to-read-a-cbk-mpc-statement'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'how-to-read-a-cbk-supervision-circular', 'How to read a CBK Bank Supervision circular', 'A filing method for prudential circulars — addressee, effective date, obligation, and what remains a licence condition — without inventing a circular number.', 'original', 'published', '2026-09-09'::timestamptz, id, $md3$Bank Supervision circulars sit in a different register from an MPC statement. They tell licensed institutions what to file, how to measure, or which practice must change. The primary shelf is the [CBK Bank Supervision](https://www.centralbank.go.ke/bank-supervision/) page. This brief does not reprint a circular number or a ratio. Official text lives with the Bank.

## Four fields before the paraphrase

Annotate the document, then write the sentence:

1. **Addressee.** Commercial banks, mortgage finance, microfinance banks, or a narrower set. If the circular says “all institutions,” keep that phrase.
2. **Instrument.** Circular, guidance note, prudential guideline, or a letter. Do not upgrade guidance into a rule in the headline.
3. **Effective date.** Immediate, a future date, or “from the next reporting period.” A missing date is a blank, not an inference.
4. **Obligation verb.** “Shall,” “should,” “are encouraged to,” and “for information” are not interchangeable.

Those four fields are **facts** about the document. Connecting them to a listed bank’s next results pack is **analysis** only after you have the issuer’s own filing.

## What a circular is not

It is not an MPC rate decision. It is not a CMA enforcement notice. It is not a licence revocation unless the Bank says so in those words. Secondary reports that collapse “new reporting line” into “crackdown” are colour. Leave them out of the file.

## How this desk files it

A complete note has: the Bank URL, the circular’s own date, the four fields, and a one-line list of what the circular does *not* say. If a later circular amends the first, the amendment gets its own as-of stamp. We do not silently overwrite.

Any ratio, threshold, or circular number that appears in an Afronomics tracker without a CBK URL is **EXAMPLE DATA**. See the [regulatory tracker](/trackers/regulatory) for the stub format.$md3$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — Bank Supervision', 'https://www.centralbank.go.ke/bank-supervision/', 'How to read a CBK Bank Supervision circular', '2026-09-09'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/bank-supervision/' and publisher = 'Central Bank of Kenya — Bank Supervision');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/bank-supervision/' and s.publisher = 'Central Bank of Kenya — Bank Supervision'
where a.slug = 'how-to-read-a-cbk-supervision-circular'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — home', 'https://www.centralbank.go.ke/', 'How to read a CBK Bank Supervision circular', '2026-09-09'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/' and publisher = 'Central Bank of Kenya — home');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/' and s.publisher = 'Central Bank of Kenya — home'
where a.slug = 'how-to-read-a-cbk-supervision-circular'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'treasury-bill-calendar-without-the-print', 'How to read a Treasury bill calendar without inventing the print', 'A method for using CBK auction calendars and result notices as primary sources — tenors, announcement, auction, and settlement — without treating a remembered yield as a fact.', 'original', 'published', '2026-09-03'::timestamptz, id, $md4$Kenya’s Treasury bill programme is run in public. The Central Bank publishes auction information and results on its [Treasury bills pages](https://www.centralbank.go.ke/bills-bonds/treasury-bills/). The National Treasury is the issuer. This brief is a reading method. It does not carry this week’s accepted yields.

## The sequence, not the number

Treat every auction week as four dated events:

- **Announcement.** Offered tenors and the timetable. This is a fact about process.
- **Auction.** Bids are taken on the stated date. Until results are published, there is no official print.
- **Results.** Offered, bids received, amount accepted, and the weighted average rate — as the Bank prints them.
- **Settlement.** Cash and securities move on the stated settlement date. A “cheap” or “tight” colour piece that ignores settlement is incomplete.

If a chat message gives you a yield before the result notice, file it as unverified colour. Do not promote it into the brief.

## What is structural vs what is a print

Structural facts (the existence of 91-, 182-, and 364-day tenors; that CBK conducts the auction; that results are published) do not require a new number each week. Prints do. A remembered “last week’s 91-day” is not a citation.

Any yield, bid-cover, or offered amount that appears in an Afronomics tracker without a CBK URL and an as-of stamp is **EXAMPLE DATA** and must be labelled as such. See the [Debt & rates calendar](/trackers/debt) for the stub format.

## Analysis that stays inside the document

It is fair **analysis** to note whether the Bank’s result notice shows a tenor that was undersubscribed, or whether the announcement offered a different mix than the prior week — *after* you have both PDFs. It is not analysis to infer what a bank treasury “should” bid.

## Where to click

Official auction notices and results: [centralbank.go.ke](https://www.centralbank.go.ke/bills-bonds/treasury-bills/). Issuer context: [treasury.go.ke](https://www.treasury.go.ke/). The NSE tape is the wrong window for this instrument.$md4$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — Treasury bills & bonds', 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/', 'How to read a Treasury bill calendar without inventing the print', '2026-09-03'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/' and publisher = 'Central Bank of Kenya — Treasury bills & bonds');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/' and s.publisher = 'Central Bank of Kenya — Treasury bills & bonds'
where a.slug = 'treasury-bill-calendar-without-the-print'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'National Treasury', 'https://www.treasury.go.ke/', 'How to read a Treasury bill calendar without inventing the print', '2026-09-03'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.treasury.go.ke/' and publisher = 'National Treasury');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.treasury.go.ke/' and s.publisher = 'National Treasury'
where a.slug = 'treasury-bill-calendar-without-the-print'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'when-the-tbill-result-notice-posts', 'When the T-bill result notice posts: a 12-minute file', 'The habit brief: what a treasury desk files in the twelve minutes after CBK publishes a Treasury bill result notice — without inventing this week’s print.', 'original', 'published', '2026-09-10'::timestamptz, id, $md5$This is the brief a desk should reopen on result day. It is not this week’s auction colour. Official results live on the [CBK Treasury bills pages](https://www.centralbank.go.ke/bills-bonds/treasury-bills/). If the notice is not there, you do not have a print.

## The twelve minutes

1. **Confirm the URL.** Same domain as the Bank. A forwarded screenshot is not the file.
2. **Copy four fields** as printed: offered, bids received, amount accepted, weighted average rate — for each tenor the notice lists.
3. **Stamp the notice date and the settlement date.** A cheap-or-tight sentence that ignores settlement is incomplete.
4. **Write one unknown.** If a tenor is missing or the PDF is a scan you cannot read, say so. Do not interpolate.

That sequence is **facts** about process. Comparing this notice to the prior week’s notice is **analysis** only after both PDFs are filed.

## EXAMPLE DATA — format only

The following line is a **format demonstration**. It is not this week’s print.

- **91-day (EXAMPLE DATA)** — offered KES 4.0bn, accepted KES 3.1bn, weighted average 8.20%, as of an illustrative notice date.

If a figure is not copied from a named CBK notice, it does not enter the intelligence file as fact. See the [Debt & rates calendar](/trackers/debt).

## What this brief will not do

It will not guess the print before the Bank posts. It will not tell a treasury what to bid. It will not translate a tenor into portfolio language.

When the notice is up, this page is the method. The numbers stay with CBK.$md5$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — Treasury bills & bonds', 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/', 'When the T-bill result notice posts: a 12-minute file', '2026-09-10'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/' and publisher = 'Central Bank of Kenya — Treasury bills & bonds');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/bills-bonds/treasury-bills/' and s.publisher = 'Central Bank of Kenya — Treasury bills & bonds'
where a.slug = 'when-the-tbill-result-notice-posts'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'National Treasury', 'https://www.treasury.go.ke/', 'When the T-bill result notice posts: a 12-minute file', '2026-09-10'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.treasury.go.ke/' and publisher = 'National Treasury');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.treasury.go.ke/' and s.publisher = 'National Treasury'
where a.slug = 'when-the-tbill-result-notice-posts'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'listed-bank-results-week-checklist', 'Listed-bank results week: a disclosure checklist, not a scoreboard', 'A weekly method for reading listed-bank financial statements and NSE announcements as disclosures — capital, credit, funding, and costs — without turning the week into a tipsheet.', 'original', 'published', '2026-09-01'::timestamptz, id, $md6$Listed Kenyan banks report into two public systems at once: issuer disclosures on the [Nairobi Securities Exchange](https://www.nse.co.ke/) and the prudential world overseen by [CBK Bank Supervision](https://www.centralbank.go.ke/bank-supervision/). A Weekly Intelligence note should make those systems usable. It should not rank tickers or imply a portfolio action.

## The checklist

For each issuer that publishes in the week, file the following from the **statement itself**:

1. **Period and board approval.** Reporting date, comparative period, and whether figures are audited or unaudited — as labelled.
2. **Capital.** CET1 or core capital language *as the issuer prints it*, plus any board comment on dividends or capital actions. If the statement is silent, write silent.
3. **Credit.** Gross loans, loss allowances, and whatever NPL definition the issuer uses. Do not rebase someone else’s NPL into a private formula without saying so.
4. **Funding.** Customer deposits versus wholesale; any comment on liquidity ratios.
5. **Costs and income mix.** Net interest versus non-interest, and cost-to-income only if the issuer states it.
6. **Supervisory or legal items.** Contingencies, CMA or CBK matters, restatements.

That list is **analysis** of how to read a pack. It is not a model of “quality.”

## EXAMPLE DATA — do not file as fact

The following line is a **format demonstration** for the [Bank forensic index](/trackers/banks). It is not a real issuer print.

- **EXAMPLE Bank A** — cost-to-income **48.0% (EXAMPLE DATA)**, as of 30 Jun 2026. Do not file as fact.

If a figure is not copied from a named statement with a URL and a page or note reference, it does not enter the intelligence file as fact.

## What the week is not

It is not a relative-performance table for the NSE 20. Live exchange prints are not redistributed here; use [nse.co.ke](https://www.nse.co.ke/) for the tape. It is not a recommendation language exercise. Words we will not use in this series: buy, sell, hold, overweight, price target, guaranteed.

## How this desk closes the week

A closed weekly file has: the list of issuers who actually published, links to the NSE or issuer PDFs, the six-point checklist with blanks allowed, and a short note on what remains unfiled. Blanks are honest. Filled blanks are not.$md6$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Nairobi Securities Exchange', 'https://www.nse.co.ke/', 'Listed-bank results week: a disclosure checklist, not a scoreboard', '2026-09-01'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.nse.co.ke/' and publisher = 'Nairobi Securities Exchange');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.nse.co.ke/' and s.publisher = 'Nairobi Securities Exchange'
where a.slug = 'listed-bank-results-week-checklist'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya — Bank Supervision', 'https://www.centralbank.go.ke/bank-supervision/', 'Listed-bank results week: a disclosure checklist, not a scoreboard', '2026-09-01'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/bank-supervision/' and publisher = 'Central Bank of Kenya — Bank Supervision');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/bank-supervision/' and s.publisher = 'Central Bank of Kenya — Bank Supervision'
where a.slug = 'listed-bank-results-week-checklist'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Capital Markets Authority — Kenya', 'https://www.cma.or.ke/', 'Listed-bank results week: a disclosure checklist, not a scoreboard', '2026-09-01'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.cma.or.ke/' and publisher = 'Capital Markets Authority — Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.cma.or.ke/' and s.publisher = 'Capital Markets Authority — Kenya'
where a.slug = 'listed-bank-results-week-checklist'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'sasra-ira-and-the-nonbank-perimeter', 'SASRA, IRA, and the perimeter beyond commercial banks', 'A perimeter guide: deposit-taking saccos under SASRA, insurers under IRA, and why a bank-only reading of Kenya’s financial system misses binding decisions.', 'analysis', 'published', '2026-08-28'::timestamptz, id, $md7$A Kenya banking brief that only watches listed commercial banks will miss institutions that still move household savings, agricultural credit, and risk transfer. Two regulators sit immediately outside the CBK bank-licence perimeter: the [Sacco Societies Regulatory Authority (SASRA)](https://www.sasra.go.ke/) and the [Insurance Regulatory Authority (IRA)](https://www.ira.go.ke/).

This explainer is a **facts** map. It does not rank saccos or insurers, and it does not reprint supervisory ratios.

## SASRA

SASRA supervises sacco societies under its published mandate. Deposit-taking saccos are not “informal banks.” They are licensed (or authorized) entities with their own prudential and conduct file. When SASRA issues a circular, a licence action, or a sector report, that document is the primary — not a bank-sector rumour that “saccos will be next.”

Practical filing rules:

- Record the legal name of the society as SASRA prints it.
- Separate liquidity or capital language in a SASRA document from CBK bank-capital language. The words look similar; the regimes are not.
- If a sacco is not named in a public notice, do not insert it.

## IRA

IRA is the insurance supervisor. Solvency publications, conduct enforcement, and licensing updates that concern insurers belong on the IRA file. Insurance groups that own, or are owned by, banks still generate IRA documents that a bank-only desk will miss.

Do not treat an insurance product headline as a capital-markets event unless CMA or the NSE is actually in the document trail.

## Where CBK still belongs

[CBK](https://www.centralbank.go.ke/) remains the primary for commercial banks, the policy rate, and payment-system matters within its remit. Some groups are mixed: a bank, an insurer, a sacco-adjacent channel. The discipline is to cite **each** regulator for **its** instrument, not to pick the most famous logo.

## What this desk will watch in the wedge

In the first ninety days, Afronomics Feed will treat SASRA and IRA decisions as in-scope when they are public, dated, and material to Kenya’s financial-intermediation file. We will not build a consumer-product desk, and we will not turn sacco or insurance stories into personal-finance tips.

If a figure appears in our [regulatory tracker](/trackers/regulatory) without a regulator URL, treat it as **EXAMPLE DATA**.$md7$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Sacco Societies Regulatory Authority', 'https://www.sasra.go.ke/', 'SASRA, IRA, and the perimeter beyond commercial banks', '2026-08-28'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.sasra.go.ke/' and publisher = 'Sacco Societies Regulatory Authority');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.sasra.go.ke/' and s.publisher = 'Sacco Societies Regulatory Authority'
where a.slug = 'sasra-ira-and-the-nonbank-perimeter'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Insurance Regulatory Authority — Kenya', 'https://www.ira.go.ke/', 'SASRA, IRA, and the perimeter beyond commercial banks', '2026-08-28'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.ira.go.ke/' and publisher = 'Insurance Regulatory Authority — Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.ira.go.ke/' and s.publisher = 'Insurance Regulatory Authority — Kenya'
where a.slug = 'sasra-ira-and-the-nonbank-perimeter'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya', 'https://www.centralbank.go.ke/', 'SASRA, IRA, and the perimeter beyond commercial banks', '2026-08-28'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/' and publisher = 'Central Bank of Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/' and s.publisher = 'Central Bank of Kenya'
where a.slug = 'sasra-ira-and-the-nonbank-perimeter'
on conflict do nothing;
insert into public.authors (name, slug) values ('Afronomics Desk', 'afronomics-desk') on conflict (slug) do nothing;
insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select 'who-sets-what-kenya-money-markets', 'Who sets what: CBK, CMA, NSE, and the National Treasury', 'A map of institutional roles in Kenya’s banking and capital-markets system — who issues, who regulates, who operates the exchange, and who sets policy rates — so a desk does not cite the wrong primary.', 'analysis', 'published', '2026-08-20'::timestamptz, id, $md8$Kenya’s financial system is easy to flatten into “Nairobi” or “the market.” That flattening produces bad citations. This explainer separates four institutions that a banking and capital-markets desk will touch in a normal month. It describes **roles**, not this week’s prints.

## Central Bank of Kenya

The [Central Bank of Kenya](https://www.centralbank.go.ke/) is the monetary-policy authority and the prudential supervisor of commercial banks and a defined set of other institutions. The Monetary Policy Committee’s published rate and statements are CBK primary sources. Bank supervision circulars, licences, and stability publications are also CBK documents.

CBK is the wrong citation for a listed-equity enforcement action, and it is the wrong “tape” for a stock print.

## Capital Markets Authority

The [Capital Markets Authority](https://www.cma.or.ke/) is the statutory regulator of capital markets: licensing, conduct, disclosures, and enforcement in that domain. A CMA notice is the primary for market-conduct events. Paraphrases on social channels are not.

CMA is the wrong citation for the Central Bank Rate, and it is the wrong citation for a SASRA sacco directive.

## Nairobi Securities Exchange

The [Nairobi Securities Exchange](https://www.nse.co.ke/) operates the listing and trading venue for equities and listed fixed income. Official announcements and the exchange’s own market data pages are the tape. Afronomics Feed does not scrape or republish live NSE quotes. When this site shows index or FX figures, they are static placeholders with an as-of stamp and, unless cited, an **EXAMPLE DATA** label.

## The National Treasury

The [National Treasury](https://www.treasury.go.ke/) is the sovereign fiscal authority and the issuer of government securities. Auction *operations* are typically visible through CBK’s bills-and-bonds publications; issuer policy and budget documents sit with the Treasury. Cite the document you actually used.

## A short map

- **Policy rate and MPC statement** — CBK
- **Bank prudential rule** — CBK Bank Supervision
- **Listed-company disclosure or market enforcement** — NSE announcement and/or CMA
- **Live equity print** — NSE (external)
- **Sovereign bill or bond auction result** — CBK bills & bonds, then Treasury as issuer

## The 90-day wedge

Afronomics Feed’s first ninety days stay inside Kenya **banking, capital markets, and financial regulation**. That is a product choice, not a claim that other African markets do not matter. It is how we keep citations short and the file honest.

This explainer is not legal advice and not a substitute for the statutes. When a mandate is ambiguous, quote the institution’s own about page and statute list rather than inventing a bright line.$md8$, false
from public.authors where slug = 'afronomics-desk'
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Central Bank of Kenya', 'https://www.centralbank.go.ke/', 'Who sets what: CBK, CMA, NSE, and the National Treasury', '2026-08-20'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.centralbank.go.ke/' and publisher = 'Central Bank of Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.centralbank.go.ke/' and s.publisher = 'Central Bank of Kenya'
where a.slug = 'who-sets-what-kenya-money-markets'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Capital Markets Authority — Kenya', 'https://www.cma.or.ke/', 'Who sets what: CBK, CMA, NSE, and the National Treasury', '2026-08-20'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.cma.or.ke/' and publisher = 'Capital Markets Authority — Kenya');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.cma.or.ke/' and s.publisher = 'Capital Markets Authority — Kenya'
where a.slug = 'who-sets-what-kenya-money-markets'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'Nairobi Securities Exchange', 'https://www.nse.co.ke/', 'Who sets what: CBK, CMA, NSE, and the National Treasury', '2026-08-20'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.nse.co.ke/' and publisher = 'Nairobi Securities Exchange');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.nse.co.ke/' and s.publisher = 'Nairobi Securities Exchange'
where a.slug = 'who-sets-what-kenya-money-markets'
on conflict do nothing;
insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select 'The National Treasury and Economic Planning', 'https://www.treasury.go.ke/', 'Who sets what: CBK, CMA, NSE, and the National Treasury', '2026-08-20'::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = 'https://www.treasury.go.ke/' and publisher = 'The National Treasury and Economic Planning');
insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = 'https://www.treasury.go.ke/' and s.publisher = 'The National Treasury and Economic Planning'
where a.slug = 'who-sets-what-kenya-money-markets'
on conflict do nothing;
