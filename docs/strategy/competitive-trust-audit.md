# Competitive trust audit: why an institution does not yet pay us (13 Oct 2026)

The founder asked: "why are we not creditworthy or trustable?" This is the answer, ranked by how much each gap
stops an institution from paying, plus the product gaps against competitors, what was fixed in code on this
branch, and the facts only the founder can supply.

Read with `competitive-landscape.md` (who the competitors are, prices, coverage), `master-plan-v2.md` (the revenue
path and 90-day build list), `docs/design/ui-ux-audit.md` and `docs/security/security-review-2026-10-13.md`. This
doc does not repeat them.

**Labels.** **REPO** = checked in this repository on 13 Oct 2026. **SEARCH** = a web-search result on 13 Oct
(WebFetch could not reach afronomicsfeed.com, pesara.com, tellimer.com, stears.co or techcabal.com from this
environment, so competitor pages were read through search extracts). **KNOWN** = widely known about a large
vendor, not re-checked today. **UNVERIFIED** = could not be checked from here; the founder should confirm.

## 0. The short answer

An institution's buyer is not judging the data first. Before anyone opens a table, a compliance, procurement or
risk person asks five questions: **who is the company, who runs it, can we reach a real person, has anyone else
bought it, and will it still exist next year?** Today the site answers none of the five with evidence:

1. The legal entity is a name only. "A product of Pesara Limited" links to pesara.com, but nothing in the repo
   gives a registration number, registered address or country of incorporation, and a web search for "Pesara
   Limited" Kenya returns nothing; it returns **Pesapal Limited**, a well-known Kenyan payments company with a
   similar name (SEARCH). A buyer who checks will either find nothing or think of Pesapal.
2. No person is named anywhere on the site. Every article is by "Afronomics Desk". The only human name in the
   repo is the git author.
3. The pitch went out from a **gmail.com** address, while our own pilot form refuses gmail addresses as "not a
   work email" (`lib/billing/pilot.ts`). Recipients' filters and their own judgement treat that the same way.
4. Zero customers, zero press, zero track record: the repo's first commit is 30 Sep 2026, so the product is about
   two weeks old (REPO). A search for "Afronomics Feed" finds nothing of ours; it finds the **World Bank's
   AFRONOMICS podcast** (SEARCH). The name collides with a far better-known brand.
5. Procurement cannot onboard us: no company documents, no tax ID, no bank details for an invoice, no standard
   licence agreement, no SLA, no security pack.

The data work is genuinely strong (source link on every row, public freshness and latency, open corrections). That
is why the fixes below lean on making the existing evidence visible and asking the founder for the five missing
facts. None of the gaps above can be closed by code alone.

## 1. Trust audit: our site against the competitors

### 1a. How each competitor establishes trust

| Competitor | How it earns trust (what a buyer sees) | Label |
|---|---|---|
| **Bloomberg** | 40+ years, a listed-company-scale brand, named editors and reporters on every story, public editorial standards, every institution already holds a terminal, formal vendor security pack and contracts | KNOWN |
| **Reuters** | The Trust Principles (1941): independence, integrity, freedom from bias, written into Thomson Reuters' charter documents; Data and AI Ethics Principles | SEARCH ([Trust Principles](https://thomsonreuters.com/en/about-us/trust-principles.html), [AI principles](https://www.thomsonreuters.com/content/dam/ewp-m/documents/thomsonreuters/en/pdf/other/our-data-and-ai-ethics-principles-infographic-version-1.2-tr4814728.pdf)) |
| **Financial Times** | A written editorial code (independence, fairness, conflicts of interest, accuracy), a complaints commissioner, staff share-trading rules | SEARCH ([journalism.co.uk](https://www.journalism.co.uk/ft-editor-says-paper-s-code-is-model-for-journalism/), [Endpoints/FT](https://endpoints.news/?p=442838)) |
| **Tellimer** | A named founder and CEO (Duncan Wales, ex-ICAP, Clifford Chance), a London address (39 Sloane Street), history back to Exotix (1999) | SEARCH ([CB Insights](https://www.cbinsights.com/company/tellimer), [MarketScreener](https://de.marketscreener.com/insider/SRUTI-PATEL-A0GVH7)) |
| **Stears** | Four named founders (Preston Ideh CEO), LSE/Oxford origin story, disclosed funding (USD 0.6m 2020, USD 3.3m 2022, MaC Venture Capital), named clients (UNDP, EIB, InfraCredit), a public track record (2019 election database used by 2m+ people) | SEARCH ([TechCabal 2022](https://techcabal.com/2022/10/11/nigerian-data-and-intelligence-company-stears-raises-3-3-million-to-solve-africas-data-dearth/), [Future Africa](https://future.africa/news-insights/stears-is-building-a-media-and-data-network-for-africans-to-make-better-decisions)) |
| **TechCabal** | Public "Editorial Standards and Policies" (updated Aug 2025): independence from the business side, conflict-of-interest disclosure, separation of sponsored content, corrections; a public statement disclosing an advertiser conflict (Flutterwave, 2022) | SEARCH ([standards](https://techcabal.com/standards-and-policies/), [statement](https://techcabal.com/2022/04/19/editorial-statement-techcabal/)) |
| **Business Daily (NMG)** | Owned by Nation Media Group, an NSE-listed company; print masthead; named editors and reporters | KNOWN |
| **Trading Economics** | "Data based on official sources, not third-party providers"; 196 countries; a long-lived brand; a library-guide citation (Columbia) | SEARCH ([about](https://tradingeconomics.com/about-te.aspx), [Columbia guide](https://guides.library.columbia.edu/EconIndicator/INTL)) |
| **Cbonds** | Founded 2000, named founder and CEO, offices in 10+ countries, quarterly verification of league-table data with arrangers and legal advisers, 160+ exchange and 150+ OTC sources | SEARCH ([cbonds.com/about](https://cbonds.com/about/), [Wikipedia](https://www.wikipedia.org/wiki/Cbonds)) |
| **S&P DJI** | Published methodologies, index committees, written restatement and recalculation policies (materiality, how far back, committee approval) | SEARCH ([iBoxx recalculation policy](https://spglobal.com/spdji/en/documents/methodologies/iboxx-recalculation-policy.pdf), [IAS restatement policy](https://spglobal.com/spdji/en/documents/additionalinfo/IAS-Index-Restatement-Policy.pdf)) |

What they share: **a named legal entity with an address, named people, years of history or named funders, and
written policies.** Our written policies are now in place (section 3). The rest needs the founder.

### 1b. Our site, item by item (checked in code and a local production build)

| Item | Before this branch | After this branch | Source |
|---|---|---|---|
| About page with legal entity | Mission prose; "published from Nairobi by Pesara Limited" | Adds a publisher fact table (publisher, city, site, contact, governing law, data-protection law), coverage counted from the data files, funding disclosure, links to every policy. **Still no registration number, address or people: none exist in the repo** | `app/about/page.tsx` |
| Founder/team names and photos | None anywhere | None (not invented). Needed from founder | — |
| Contact address and phone | Email only (`desk@afronomicsfeed.com`, overridable by `NEXT_PUBLIC_CONTACT_EMAIL`) | Unchanged. Postal address and phone needed from founder. **UNVERIFIED** whether the desk@ mailbox receives mail (no MX check possible from here) | `lib/site.ts` |
| Editorial independence policy | Fragments on `/method`, `/advertise`, `/about` | **New `/editorial-standards`**: sourcing, independence, no paid placement in rankings, sponsorship and referral disclosure, labels and bylines, AI use, corrections, complaints | `app/editorial-standards/page.tsx` |
| Corrections policy and log | `/corrections` showed only an empty article log, no policy; the data corrections log lived separately on `/reference` | Policy added; links to and counts the data corrections log (`af_corrections`) | `app/corrections/page.tsx` |
| Methodology per dataset | `/method` (macro layers), `/reference` (bill definitions), market pages | Plus `/trust#datasets`: every bill and bond dataset with its official source page, result count, first year and latest date, generated from the data files | `app/trust/page.tsx` |
| Data licence terms | `DataTerms` (free / keyed / Enterprise) on `/developers`, `/licensing`, `/data-api` | Also on `/buying`. **No downloadable licence agreement** (F3 in master plan) | `lib/billing/ratecard.ts` |
| Privacy | `/legal/privacy`, Kenya DPA 2019, thorough | Unchanged; linked from the new pages. No retention schedule (security review L-2), now stated openly on `/trust` | — |
| Security/trust page for institutions | None | **New `/trust`**: provenance table, collection method and schedule, freshness and latency, corrections, 9 security practices (each true per the 13 Oct review), sub-processors (Vercel, Supabase, Paystack, Resend, GitHub), and an explicit "not yet in place" list (no SOC 2/ISO 27001, no uptime figure, no retention schedule, CSP report-only) | `app/trust/page.tsx` |
| Uptime and incident history | None | Still none: no uptime monitor exists. Stated on `/trust` rather than implied | — |
| Latency measurement | `/status#latency` (p50/p90 per market) | Surfaced as a headline stat on `/trust` | `lib/data/latency.ts` |
| Conflicts of interest | None | Advertiser and referral conflicts covered on `/editorial-standards`. **Personal holdings and trading policy for the founder: needed from founder** (not written, because it would be a promise only they can make) | — |
| Funding disclosure | One paragraph | `/about#funding` lists every revenue line; Organization JSON-LD now carries `ownershipFundingInfo`. **Ownership and investors: needed from founder** | `app/about/page.tsx`, `lib/seo/schema.ts` |
| Advertising/sponsorship disclosure | `/advertise` standards; referral notes on `/send-money` | Consolidated on `/editorial-standards` | — |
| Terms of service | `/legal/terms` (short, Kenyan law) | Unchanged | — |
| Status page | `/status` (freshness, latency) | Linked from every new page and the new source lines | — |
| Source links on every figure | Strong on market pages (row-level); **weak on the T-bill monitor and bond index** (no publisher links) | `SourceNote` added to `/markets/tbills` and `/markets/bonds`: each publisher linked to its results page, plus the date of the last freshness check | `components/ui/SourceNote.tsx` |
| "As of" on every number | Strong on most pages; the Sovereign Bill Index headline number had no reading date | Reading date added to the index headline | `app/markets/bill-index/page.tsx` |
| Bylines | All 21 articles by "Afronomics Desk" | Explained on `/editorial-standards`; a named editor needs the founder | `content/**` |
| Customer logos, testimonials, press | None | None (not invented) | — |
| Domain age | Repo starts 30 Sep 2026 (REPO); WHOIS not reachable from here | — | **UNVERIFIED** |
| HTTPS and security headers | HSTS 2 years, nosniff, referrer, permissions, frame options, CSP report-only (REPO, `next.config.ts`) | Plus `/.well-known/security.txt` (RFC 9116) | `app/.well-known/security.txt/route.ts` |
| Consistent company name | **Four names in use**: "Afronomics" (`site.name`), "Afronomics Feed" (`site.legalName`, footer ©, LinkedIn page), "Pesara Limited" (house), and the domain "afronomicsfeed". The footer © names "Afronomics Feed", which is a brand, not a legal entity | Not changed: the founder must say which entity holds copyright and signs contracts | `lib/site.ts`, `components/layout/Footer.tsx` |
| Professional email | Outreach sent from a gmail.com address; the site publishes desk@afronomicsfeed.com; transactional mail sends from morning@afronomicsfeed.com through Resend (domain verified there, per `lib/mail.ts`) | Not fixable in code. See 1d | — |
| Procurement readiness | `/prices` says "pro-forma, supplier letter and KRA PIN on request"; invoice request form | **New `/buying`**: four-step path, plans from the rate card, currencies and methods, vendor-form handling, licence in brief, service levels (SLA only on Enterprise, stated) | `app/buying/page.tsx` |

### 1c. Trust gaps ranked by how much they block an institution from paying

| Rank | Gap | Why it blocks payment | Who fixes | Effort |
|---|---|---|---|---|
| 1 | **No verifiable legal entity** (registration number, registered address, country, director) | Vendor onboarding cannot open a supplier record; KYC on a payee fails; a DFI or fund cannot sign a licence with an unidentifiable counterparty | Founder | Hours, if Pesara Limited is registered; weeks if it is not |
| 2 | **Outreach from gmail.com; no working @afronomicsfeed.com mailbox confirmed** | Cold mail from a free address lands in spam or is ignored by institutional filters; the recipient reads "side project". It contradicts our own work-email rule | Founder | 1 day |
| 3 | **No named people** (founder name, photo, bio, LinkedIn profile) | Buyers buy from a person; "Afronomics Desk" reads as anonymous, and anonymity reads as risk | Founder | 1 hour |
| 4 | **Cannot be invoiced** (no bank details, tax ID, W-8BEN-E for US payers, numbered invoice) | Global funds and DFIs pay by invoice in USD, not by card in KES (`country-pricing.md`); without these the deal stops at accounts payable | Founder, then code (master plan item 7) | 2–3 days |
| 5 | **No licence agreement or order form** | Legal will not approve "terms on a web page" for commercial data use; Enterprise needs an SLA document | Founder with a lawyer | 1–2 weeks |
| 6 | **Zero references: no customer, testimonial, press mention or citation** | Every competitor shows logos or named clients; we can show none. Only pilots fix this. Do not invent | Founder (pilots) | Ongoing |
| 7 | **Brand confusion**: "Afronomics" = World Bank podcast; "Pesara" ≈ Pesapal | Search for us finds someone else; due diligence takes longer or stops | Founder (positioning, consistent naming) | Low, ongoing |
| 8 | **Four company names in use** | A contract, an invoice and a website that name different entities is a classic fraud signal | Founder decides; code follows (`lib/site.ts`) | 1 hour |
| 9 | **No security pack** (completed standard questionnaire, retention schedule, enforced CSP, uptime monitor, incident log) | Larger buyers' vendor-risk teams need a filled questionnaire; small buyers accept `/trust` | Code + founder | 1 week |
| 10 | **Brand-new domain and company footprint** (repo from 30 Sep 2026; no Companies House-style record found) | Age is a proxy for survival; a buyer worries the data stops next year | Time; partners; a public advisory board or data partnership (Kiel ADD) | Months |
| 11 | No phone or postal address | Lower than the above; some vendor forms require it | Founder | Hours |
| 12 | No conflicts/holdings disclosure for the founder | A fund will ask whether the publisher trades the bills it reports | Founder | 1 hour |

### 1d. Email: what to set up (founder, about one day)

The gmail.com sender hurts twice. **Deliverability:** since 2024 Gmail and Yahoo require bulk senders to
authenticate with SPF, DKIM and DMARC, and corporate gateways (Mimecast, Proofpoint, Microsoft Defender) score
unaligned or free-mail senders down; a cold note from a free address to a fund is far more likely to be filtered.
**Credibility:** an institution reads "@gmail.com" as an individual, not a supplier, and our own pilot form rejects
those addresses.

1. Create a real mailbox on the domain: `firstname@afronomicsfeed.com` (and keep `desk@` as a shared alias), on
   Google Workspace or Microsoft 365. Confirm `desk@afronomicsfeed.com`, the address printed on every page,
   actually receives mail.
2. DNS on afronomicsfeed.com: **MX** for the mailbox provider; **SPF** as one TXT record that includes the mailbox
   provider and Resend (e.g. `v=spf1 include:_spf.google.com include:<resend's include> ~all`; Resend usually sets
   SPF on a `send.` subdomain, so check its dashboard); **DKIM** for both the mailbox provider and Resend;
   **DMARC** at `_dmarc.afronomicsfeed.com`: start at `v=DMARC1; p=none; rua=mailto:dmarc@afronomicsfeed.com`,
   move to `p=quarantine` after two clean weeks.
3. Send every outreach and follow-up from the domain mailbox, with a signature: name, title, company (the legal
   entity), afronomicsfeed.com, phone, LinkedIn. Reply to the 21 contacted institutions' follow-ups from the new
   address (the follow-up routines on 21–22 Oct should use it).
4. Point the founder's LinkedIn profile at the company page, and the company page at the same legal name.

### 1e. Procurement readiness checklist (what a buyer's AP and vendor-risk team will ask for)

| Item | Have it? | Note |
|---|---|---|
| Certificate of incorporation / registration number | No (not in repo) | Founder |
| Registered address and postal address | No | Founder |
| KRA PIN certificate and VAT status | Claimed "on request" on `/prices`; not in repo | Founder: confirm it exists before the claim stays |
| W-8BEN-E (US payers) | No | Founder, with an accountant: a Kenyan company's treaty status |
| Bank details letter (USD and KES accounts) | No | Founder |
| Numbered invoice template | No | Code (master plan item 7) once bank details exist |
| Standard data licence / order form | No (web terms only) | Founder + lawyer (F3) |
| SLA | Enterprise "service agreement" promised; no document | Founder + lawyer |
| Data-security questionnaire answers | Now drafted in public on `/trust` | Fill a standard SIG-Lite or CAIQ-Lite once and keep it |
| Data-protection: DPA (processing agreement), retention schedule, ODPC registration | Privacy notice yes; DPA, retention and ODPC registration not found in repo | Founder (Kenya's ODPC registration applies to many data controllers; **UNVERIFIED** whether we are registered) |
| Insurance (professional indemnity) | Not found | Optional for small deals; some DFIs ask |

## 2. Product gaps against competitors, ranked by revenue impact

`competitive-landscape.md` already maps coverage and price. This ranks what we lack by how much revenue it holds
back now, given 21 pilot offers out and USD 0 collected.

| Rank | Gap | Who has it | Revenue logic | Files / next owner |
|---|---|---|---|---|
| 1 | **Invoice path in USD** (numbered PDF invoice, bank details, PO field) | Every B2B vendor | Global funds and DFIs pay by invoice; this is the payment step, not a feature | `lib/billing/invoice.ts` (new), `app/pricing/page.tsx#invoice` (master plan item 7); blocked on founder facts |
| 2 | **Pilot lifecycle and renewals** (day 7/23/30 emails, renewal links) | Stears, Tellimer (account managers) | Pilot to paid is where D-004 is decided; month 2 is the first repeat revenue | master plan items 5–6 |
| 3 | **Edge-market gaps**: Tunisia, Ghana bonds, Angola, South Africa bonds; short Uganda/Zambia/Morocco history | Terminals, Cbonds | The first objection from a global PM | `scripts/*_bonds.py`, `lib/data/sovereign-bonds.ts` |
| 4 | **Workflow delivery**: Excel add-in or Sheets template, Python client, MCP connector, Snowflake | Cbonds (Excel), Trading Economics (Excel/Python), Briter (MCP) | Raises Analyst to Team upgrades; analysts live in spreadsheets | `app/data-api/page.tsx`, new `clients/python/` (master plan item 9) |
| 5 | **Named analyst content with bylines** (a weekly auction note signed by a person) | Bloomberg, Reuters, FT, Stears, Business Daily | Signed research is what institutions forward internally; it also fixes trust gap 3 | `content/briefs/`, `components/article/ArticleTemplate.tsx` |
| 6 | **WhatsApp channel** for auction results | Kenyan market (CBK on X, Mwango community) | The Kenyan local wedge (IC Pack, KES 300 alerts) reaches treasurers on WhatsApp first | Telegram exists (`scripts/telegram_post.py`); add a WhatsApp Channel (manual first) |
| 7 | **Newsletter growth and double opt-in** | TechCabal, Mwango (3,000+ Substack), Stears | Owned audience drives inbound pilots; double opt-in (security review M-4) protects deliverability | `app/api/subscribe`, migration |
| 8 | **French and Arabic pages** for WAEMU, Morocco, Egypt | Sika Finance, Financial Afrik, EnterpriseAM | WAEMU in English is our edge; French pages reach its local buyers | `seo-plan.md` action 6 |
| 9 | **Secondary prices and curves** | Bloomberg, LSEG, FMDQ, exchanges | Large, but licensed: do not build; offer auction-implied curves | — |
| 10 | **Mobile app** | Bloomberg, Business Daily, Stears | Low for institutions; the PWA and push alerts cover it | `app/manifest.ts`, `public/sw.js` |
| 11 | Community and events | TechCabal (events), Mwango (podcast) | Brand and trust more than direct revenue | — |
| 12 | Uptime monitoring and published uptime | Vendors with SLAs | Needed for Enterprise SLA; cheap (an external monitor) | new `/status` section |

Speed: we publish a measured median delay per market on `/status#latency`, which no competitor found does. Depth:
19,180 results in the published bill and bond datasets (as counted on `/trust` at build on 13 Oct; the landscape's
"about 22,300" counts every auction file, including rows not yet on a page) in one schema with a source link per row is ahead of every free source and of Trading
Economics on auction detail (`competitive-landscape.md` §3). Coverage and depth are not the reason we are not paid;
trust and the payment path are.

## 3. What was fixed on this branch

| Change | Files |
|---|---|
| About page: publisher fact table (facts in the repo only), live coverage counts, funding disclosure (`#funding`), links to every policy | `app/about/page.tsx` |
| New Editorial standards page: sourcing, independence, no paid placement in data or rankings, sponsorship and referral disclosure, labels and bylines, AI use (true to `docs/story-engine.md` and `lib/ask.ts`), corrections, complaints | `app/editorial-standards/page.tsx` |
| New Trust and data security page: provenance table generated from `billMarkets`/`bondMarkets`, collection schedule (from the workflows), freshness and latency stats, corrections and change history, nine security practices verified against the 13 Oct review, sub-processors, and what is not yet in place | `app/trust/page.tsx` |
| New Buying for an institution page: four steps, plans from `institutionalLadder`, currencies and methods (KES 129 conversion from `KES_PER_USD`), vendor forms and questionnaires, `DataTerms`, service levels | `app/buying/page.tsx` |
| Corrections page: written policy, link to and count of the data corrections log (`af_corrections`), canonical URL, ISR every 15 minutes | `app/corrections/page.tsx` |
| Source lines with publisher links and last freshness check on the T-bill monitor and the bond index | `components/ui/SourceNote.tsx`, `app/markets/tbills/page.tsx`, `app/markets/bonds/page.tsx` |
| Reading date on the Sovereign Bill Index headline | `app/markets/bill-index/page.tsx` |
| `/.well-known/security.txt` (RFC 9116) | `app/.well-known/security.txt/route.ts` |
| Footer (Company group) links to Editorial standards, Trust and data security, Buying for an institution; sitemap and `llms.txt` entries | `lib/site.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` |
| Organization JSON-LD: `publishingPrinciples` and `ethicsPolicy` → `/editorial-standards`, `ownershipFundingInfo` → `/about#funding`, `actionableFeedbackPolicy` → `/corrections` | `lib/seo/schema.ts` |

Nothing invented: no person, customer, number, credential or address was added. Where a fact is missing, the page
leaves it out (no placeholders) and it is listed in section 5.

## 4. What agents should fix next (with files)

1. **When the founder supplies section 5 facts:** add registration number, registered address, phone and the
   founder's name, title, photo and short bio to `app/about/page.tsx` (publisher table and a "Who runs it"
   section), `app/imprint/page.tsx`, and `organizationJsonLd()` in `lib/seo/schema.ts` (`founder`, `address`,
   `legalName`, `taxID`). Set `site.legalName` in `lib/site.ts` to the actual legal entity and fix the footer ©
   line in `components/layout/Footer.tsx`. Put the bio photo in `public/brand/`.
2. **Named byline**: add the founder (or named editor) as author on new briefs; extend
   `components/article/ArticleTemplate.tsx` to link authors to an `/about#team` anchor.
3. **USD invoice** (master plan item 7) once bank details exist: `lib/billing/invoice.ts`, `app/pricing/page.tsx`.
4. **Licence and order form page** once the lawyer's text exists: `app/licensing/agreement/page.tsx` (new), linked
   from `/buying#licence`.
5. **Uptime monitor**: an external check on `/` and `/api/v1/tbills` every 5 minutes, results to
   `data/uptime.json`, shown on `/status` and `/trust`. Remove "no published uptime figure" from `/trust` only then.
6. **Retention schedule and purge** (security review L-2): migration plus a line on `/legal/privacy` and `/trust`.
7. **Enforce the CSP's non-script directives** (security review L-9): `next.config.ts`; then update the `/trust`
   list.
8. **Source lines on the remaining aggregate pages** that lack publisher links: `app/markets/auction-week/page.tsx`
   (text only), `app/markets/borrowing-costs/page.tsx` (links to our own page, not publishers). Reuse
   `components/ui/SourceNote.tsx`.
9. **Remove or substantiate "KRA PIN on request"** on `app/prices/page.tsx` if the founder cannot supply it.
10. **Home page empty states** (UI audit finding 9): a visitor who lands on failed modules reads "broken".

## 5. Facts and documents needed from the founder

Nothing below has been published. Each unlocks a specific gap.

| # | Fact or document | Unlocks | Where it goes |
|---|---|---|---|
| 1 | Is **Pesara Limited** registered? Registration number, country, date, registered office address, directors | Trust gaps 1 and 8; procurement | About, imprint, JSON-LD, invoices |
| 2 | Which entity **holds copyright, signs contracts and receives payment** (Pesara Limited or another)? Is "Afronomics Feed" a registered business name? | Gap 8: one name everywhere | `lib/site.ts`, footer ©, terms |
| 3 | What is **pesara.com** today (live site, parked, redirect)? It is the footer link | Gap 1 | `lib/site.ts` `houseUrl` |
| 4 | **Founder name as it should appear, title, one-paragraph bio, photo, LinkedIn profile URL** (git history shows "Sidney Essendi"; not published without consent) | Gap 3; bylines | About `#team`, articles |
| 5 | **A @afronomicsfeed.com mailbox** for the founder; confirm `desk@afronomicsfeed.com` receives mail; SPF, DKIM, DMARC set (section 1d) | Gap 2 | DNS; outreach |
| 6 | Postal address and a business phone number (or a WhatsApp Business number) | Gap 11 | About, contact, invoices |
| 7 | **KRA PIN** and VAT registration status | Procurement; the existing `/prices` claim | Invoices; vendor forms |
| 8 | **Bank details** for USD and KES (account name must match the legal entity) | Invoice path | Invoice template |
| 9 | **W-8BEN-E** (with an accountant) for US-based payers | US funds | Vendor packs |
| 10 | **Ownership and funding**: who owns the company; any investors, grants or loans (or "founder-owned, no outside investors") | Funding disclosure, gap 10 | About `#funding` |
| 11 | **Holdings and conflicts**: does the founder hold or trade the securities we report? A one-line policy | Gap 12 | Editorial standards |
| 12 | **Data licence agreement and order form** (lawyer) and an Enterprise SLA template | Gap 5 | `/licensing`, `/buying` |
| 13 | Registration with Kenya's **Office of the Data Protection Commissioner**, if required for us | Procurement; privacy | Privacy notice |
| 14 | **Permission to name any pilot or customer** once one exists, and a one-line quote | Gap 6 | About, for-institutions |
| 15 | Domain registration date and registrar (for answering "how old is this?") | Gap 10 | Internal |

## 6. Verification on this branch

`npx tsc --noEmit` and `eslint` on the changed files pass; `npx next build` passes. New pages checked at 390px and
1280px for horizontal overflow (`scrollWidth`) on a local `next start`; screenshots are in the session scratchpad,
`…/scratchpad/trust/`. Nothing was pushed, deployed or emailed.
