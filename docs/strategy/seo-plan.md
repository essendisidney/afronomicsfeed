# SEO and distribution plan: the price of money in Africa

Written 13 October 2026. Owner: search and distribution. Goal: afronomicsfeed.com is the first African domain for
money-and-markets queries (T-bills, bond auctions, policy rates, MMF yields, FX, inflation): Kenya first, then East
Africa, Nigeria, Egypt, South Africa and francophone West Africa, and worldwide for "African sovereign debt data".
Revenue comes from institutions, so `/data/frontier-local-debt` and `/markets/bonds` are the pages that matter most.

## Where we stand

In a check of 27 high-intent queries on 13 October 2026, afronomicsfeed.com did not appear once. The results go to four kinds of site:

1. **Primary sources** (CBK PDFs, dmo.gov.ng, umoatitres.org, BoU archive PDFs). They win on authority and lose on
   usability: one PDF per auction, no history, no chart, often stale in the index.
2. **News sites that write up each auction** (People Daily, Business Daily, Nairametrics, Citi Newsroom, The Citizen,
   Capmad, Financial Afrik, Ahram). They win on freshness: a new URL for every auction with the numbers in the headline.
3. **Evergreen explainers and rankings** (Serrari Group, Business Today, nashthuo, paybillke, money254). They win
   "what is the current…" and "best MMF" with long pages updated each month, with "2026" in the title.
4. **Aggregators** (Mansa Markets `/{country}/bonds`, mystocks.africa `/macro`, Trading Economics, CEIC). These are
   our direct competitors: one page per country per instrument, with a table and a date.

What we have that none of them has: every auction since 2000–2018 in one shape, a source link on every row, free CSV
and API, Dataset markup, and the same day as the publisher. What we lack: **a new URL for each auction outside Kenya
T-bills**, a figure and date in titles, any backlinks, and pages in French and Swahili.

## Query map

| Query | Our target page | Ranks now | Gap to close |
|---|---|---|---|
| kenya treasury bill rates | /markets/kenya-tbills | peopledaily.digital news, Serrari guide, CEIC | Put the date and 91/182/364 rates in the title ("Kenya T-bill rates this week: 7.56% / 7.85% / 8.48%"); one story per auction |
| 91 day t-bill rate kenya | /markets/kenya-tbills#91 (+ weekly /markets/kenya-tbills/{date}) | Business Daily, CBK bulletin PDFs | Rename the weekly page H1 "91-day T-bill rate, {date}: x%"; add an FAQ answer for each tenor |
| kenya treasury bond auction results | /markets/kenya-bonds | People Daily write-ups, CBK PDFs | Merge /markets/bonds/kenya into it (duplicate); a title for each auction page naming the bond (FXD1/2026/030) |
| kenya infrastructure bond yield (IFB) | /markets/kenya-bonds (IFB section) | Business Daily, Khusoko, Serrari | Separate /markets/kenya-bonds/infrastructure page listing every IFB with coupon and tax status |
| money market fund rates kenya | /rates/kenya/money-market-funds | businesstoday.co.ke, CNBC Africa, money254 | "This week" in the title, a weekly date-stamped table, and a monthly archive (already /best-money-market-fund/{month}) |
| best money market fund in kenya 2026 | /rates/kenya/best-money-market-fund | nashthuo, paybillke, hudumaglobal, Serrari | Year in the title; methodology box; links from the MMF stories the story engine already writes |
| CBK central bank rate | /rates/policy (Kenya row) + /countries/kenya | Capital FM, People Daily, AllAfrica | /rates/policy/kenya page with the decision history and next MPC date (data in policy_rate_history.json) |
| kenya inflation rate latest | /data/inflation, /countries/kenya | Trading Economics, Khusoko | /countries/kenya/inflation with the KNBS monthly figure (we show the World Bank annual figure only) |
| kenya shilling exchange rate today | /markets/currencies/usd-kes | Trading Economics, Pluang, Citizen Digital | Add the CBK indicative rate and a 30-day table; title "USD to KES today: {rate}" |
| uganda treasury bill rates | /markets/tbills/uganda | AllAfrica, Serrari, CEIC | Title with the latest rates; East Africa comparison link (/east-africa) |
| uganda treasury bond auction results | /markets/bonds/uganda | Eagle Online, ugbusiness, BoU PDFs | One page per auction (see action 1) |
| tanzania treasury bill auction results | /markets/tbills/tanzania | The Citizen (2019–2025 articles) | The search index shows nothing from 2026: be first with dated per-auction pages |
| nigeria fgn bond auction results | /markets/bonds/nigeria | dmo.gov.ng PDFs, Nairametrics, Channels | A monthly page "FGN bond auction results, {month} 2026" naming each bond (22.60% FGN JAN 2035…) |
| nigeria treasury bill rates (NTB) | /markets/tbills/nigeria | Nairametrics, BusinessDay | Stop rates in the title; per-auction pages already exist for ranking, so link to them from the hub |
| egypt treasury bond auction results | /markets/bonds/egypt | Ahram, Egypt Independent, Mubasher (2023 and older) | Results in the index are stale: dated pages per auction will rank. Arabic title variant later |
| egypt treasury bill yields today | /markets/tbills/egypt | Amwal Al Ghad, Bloomberg 2011 | The same: fresh dated pages win |
| south africa treasury bill rates | /markets/tbills/southafrica | Mansa Markets, CNBC Africa tables, SARB | Name "SARB weekly tender" in the copy; dated weekly pages |
| zambia government bond auction results | /markets/bonds/zambia | Zambia Monitor, Business Telegraph | Per-auction pages; yield change by tenor in the headline |
| ghana t-bill rates | /markets/tbills/ghana | Citi Newsroom, Graphic, Serrari | Titles with the rates; a weekly story when the 364-day rate moves 50 bps or more |
| WAEMU / UMOA-Titres bond auction results | /markets/bonds/waemu + /markets/bonds/waemu/{issuer} | Capmad, Financial Afrik, Mansa, umoatitres PDFs | French titles and copy ("résultats des adjudications, Sénégal"); per-issuer pages are now in the sitemap |
| résultats adjudication bons du trésor UEMOA | /markets/bonds/waemu (fr) | BCEAO and UMOA-Titres PDFs | A French version of the WAEMU pages with hreflang (fr) |
| morocco treasury auction results | /markets/bonds/morocco | Morocco World News, Hespress | Per-auction pages; French |
| central bank rates africa | /rates/policy | mystocks.africa/macro, FRED, Central Banking | Already the better page: add "{n} African central banks, updated {date}" to the title; earn links |
| african local currency bond data | /data/frontier-local-debt | OECD report, SOAS, LSE papers | A methods paper (PDF plus page) and outreach to the researchers who rank; Dataset markup is done |
| african sovereign debt data | /data/frontier-local-debt | Africa Debt Database (Kiel, Geneva), VoxEU | Be cited by them: contact the ADD authors, offer the auction-level feed; add a "compare with ADD" FAQ |
| frontier local currency bond auction data API | /data-api, /developers | Refinitiv forum, FTSE Russell, NB | A /developers page that leads with "API for African bond auctions"; list on public API directories |

## Fixed in code on 13 October 2026 (commit 20e587c)

- Every bond page, WAEMU issuer page and Kenya bill/bond page now emits the full Dataset (license, publisher,
  catalog, variables, dateModified, CSV and JSON distribution), escaped. /markets/bonds and /markets/tbills emit a DataCatalog.
- BreadcrumbList on every page that shows breadcrumbs.
- Sitemap: 7 WAEMU issuer pages and /east-africa added; markets come from the code lists, so new markets appear on their own.
- Internal links: an auction-data block on the T-bill, bond, markets, policy, Kenya rates and MMF pages; country pages
  link their own bill/bond pages (WAEMU countries included); each market row on the homepage bond board now links that market's bond page.
- Pages no longer inherit og:title "Afronomics" from the root. The homepage now has a canonical URL and a keyword title,
  each article has a canonical URL, /morning has reciprocal hreflang to /morning/sw, and /search is noindex.

## Content clusters by country

Each cluster is a hub, a page for each instrument, a dated page for each auction, an evergreen explainer and the
stories that link them. The story engine and the auction pipeline already produce most of it, so the work is mainly naming, linking and templates.

- **Kenya (now):** hub /rates/kenya. Pages: kenya-tbills, kenya-bonds (+ new IFB page), MMF pages, policy/kenya (new),
  currencies/usd-kes. Dated pages: weekly T-bill and every bond auction (these exist). Explainers: "How to buy T-bills
  on DhowCSD", "T-bill vs MMF after tax". Swahili: /morning/sw exists; add Swahili summaries of the T-bill and MMF pages (hreflang sw).
- **East Africa (weeks 3–8):** hub /east-africa. Uganda and Tanzania bills and bonds, Rwanda when its data is in.
  Each auction gets a dated page and a one-paragraph story; a monthly "EAC T-bill league table" story.
- **Nigeria (weeks 4–10):** hub /countries/nigeria. NTB stop rates, FGN bond monthly results, savings bond, CBN MPC.
  Monthly page named for the auction month; cross-link to /rates/nigeria/savings-bond.
- **Egypt (weeks 6–12):** T-bills and bonds; policy rate. Stale competitors make this the quickest win outside Kenya.
  Arabic titles later, once the English pages are indexed.
- **South Africa (weeks 8–12):** SARB weekly tender page, bond auctions once ingested; ZAR. Institutional audience: link to the frontier dataset.
- **Francophone West Africa (weeks 6–12):** WAEMU hub and 7 issuer pages in French (`/fr/marches/obligations/...`
  or `?lang=fr` with hreflang). One French story a week from umoa_bonds results. Capmad and Financial Afrik are the outlets to pitch.
- **Global institutional (all 90 days):** /data/frontier-local-debt, /markets/bonds, /data-api, /developers.
  A quarterly "African local-debt auction review" PDF (lead capture), a methods note, and citations from researchers.

## 90-day schedule

Runs on what already exists: african-auctions.yml (every two hours), kenya-quick.yml (Thursday), morning-note.yml
(07:00), weekly-edition.yml (Monday), index-release.yml (Monday) and the story engine (Mon/Wed/Fri).

| Weeks | Engineering (one PR each) | Story engine and routines | Distribution |
|---|---|---|---|
| 1–2 (13–26 Oct) | Merge this branch. Search Console: submit the sitemap, then request indexing for /markets/bonds, /data/frontier-local-debt and the 7 issuer pages. Rate-led titles on the T-bill and bond hubs. Merge /markets/bonds/kenya into /markets/kenya-bonds (canonical) | Story engine: every Kenya T-bill Thursday (kenya-quick) gets a dated story when any tenor moves ≥10 bps | Bing Webmaster and IndexNow; list /data-api on public API directories |
| 3–4 | Dated per-auction bond pages for every market (`/markets/bonds/{market}/{date}`), same pattern as kenya-bonds/[date], added to the sitemap | african-auctions run writes the lead; story_finder picks up non-Kenya auctions (Uganda, Nigeria) | Pitch the East Africa T-bill table to Business Daily and The Citizen as a cited source |
| 5–6 | /rates/policy/{country} pages from policy_rate_history.json; MPC dates as Event markup | A story on each MPC decision, the same day, with the decision and history | Contact the Africa Debt Database authors (Geneva/Kiel) and the OECD capital-markets team |
| 7–8 | French WAEMU pages with hreflang fr; /markets/kenya-bonds/infrastructure | One French WAEMU story a week from umoa_bonds | Pitch Capmad and Financial Afrik; LinkedIn company posts in French |
| 9–10 | Monthly FGN bond results page; Egypt dated pages; Swahili summaries (hreflang sw) on the T-bill and MMF pages | Monthly "EAC league table" and "Nigeria bond month" stories | Newsletter swaps with two Nigerian finance newsletters |
| 11–13 | Quarterly local-debt review page and PDF (lead form to the pilot); MMF weekly table with history | Q4 review written from the data; morning note links the review | Send the review to 50 frontier-debt desks from the outreach board; ask for citations |

## Top 10 actions remaining

1. **Dated per-auction bond pages for every market** (only Kenya has them). The news sites that rank win because they publish one URL per auction.
2. **Rate and date in the titles** of the T-bill and bond hubs and the weekly pages, generated from the data on each build.
3. **Consolidate /markets/bonds/kenya into /markets/kenya-bonds** (a permanent redirect or a canonical tag) to end the duplicate.
4. **Search Console and Bing**: submit the sitemap, request indexing for the bond and frontier pages, and watch coverage weekly.
5. **Policy-rate page for each country** from the history file, with the next MPC date.
6. **French WAEMU pages** with hreflang; francophone search is barely contested by English aggregators.
7. **Backlinks from the people who rank for "African sovereign debt data"** (ADD authors, OECD, university debt projects) and from the newsrooms that already write up each auction.
8. **The story engine's LinkedIn links** point to `https://afronomicsfeed.com/...` (a 308 redirect). Use `www` in docs/story-engine.md and the scripts.
9. **Swahili layer** for the Kenya money pages (hreflang sw), extending /morning/sw.
10. **Per-page OG images** for bond pages and the frontier dataset (T-bill pages have them; bond pages fall back to the generic card).

## How we measure

Weekly, from Search Console: impressions and average position for the 27 queries above, clicks to /markets/bonds and
/data/frontier-local-debt, and pilot requests from those pages. Targets for day 90: top 10 for every Kenya query, top 20
for Uganda, Tanzania, Nigeria, Egypt and WAEMU auction-result queries, and top 10 worldwide for "African local currency bond data".
