# U6 plan: Get found (for the founder's approval)

Written 22 Oct 2026 for `docs/rebuild/UPGRADE.md` U6, after the U0 audit (`upgrade-audit.md`, sections 4 and 6).
The founder asked for U6 to run alongside U7 ("run U6 and U7 alongside now"). Everything below that needs no
founder decision is built on branch `claude/upgrade-u6`; nothing is merged, deployed or sent. One pull request for
the phase, opened only when the founder says so.

## 1. What U6 is

The audit's main finding: the data and the paid back half are ahead of the audience (about 135 non-US visitor-days a
week, 0 outside citations logged, 0 press contacts). U6 makes the site easier to find, cite and follow, using only
data we already hold:

- **A.** A dated page, with its own address, for every auction we hold, in the sitemap with Dataset markup.
- **B.** A press kit at `/press`: citable figures with source and date, how to cite, method, charts, the mark, contact.
- **C.** A citation log on the desk: where we have been cited, with links, counted for the scoreboard (UPGRADE §4).
- **D.** The Morning on a WhatsApp Channel: the post format, a copy page on the desk, and a "Join on WhatsApp" slot
  that stays hidden until the founder has made the channel and set its link.

House rules that shape it: every figure comes from a data file with its publisher and date; code writes every
sentence that carries a number; pages end with "Information, not advice."; no people's contact details in the
repository (`tests/site/test_no_contacts_in_docs.py`); nothing is sent or posted by an agent.

## 2. Item by item

### A. Dated auction pages for every market (master plan v2, build item 8)

**Already built.** The audit (section 2, item 8) says only Kenya has dated bond pages; that is out of date. Pull
request #115 added them for every bond market, and bills have had them for every market since earlier phases.

| Data we hold | File | Dated page | In the sitemap | Dataset markup |
| --- | --- | --- | --- | --- |
| Kenya bonds | `data/kenya/bond_auctions.json` | `/markets/kenya-bonds/{date}` | yes (`bondDates()`) | yes |
| Zambia, Egypt, Nigeria, Uganda bonds | `data/<country>/bond_auctions.json` | `/markets/bonds/{market}/{date}` | yes (`allAuctionPaths`) | yes (`bondAuctionDatasetJsonLd`) |
| Morocco bonds | `data/morocco/auctions.json` | `/markets/bonds/morocco/{date}` | yes | yes |
| WAEMU bonds (8 issuers) | `data/waemu/auctions.json` | `/markets/bonds/waemu/{issuer}/{date}` | yes | yes |
| Kenya bills | `data/kenya/tbill_auctions.json` | `/markets/kenya-tbills/{date}` | yes | — |
| Nine other bill markets | `data/<country>/tbill_auctions.json` | `/markets/tbills/{market}/{date}` | yes | — |

Titles carry the market, the date and the headline rate ("Uganda 10-year bond auction, 7 Oct 2026: 16.85%").

**U6 adds:** `tests/site/test_auction_page_coverage.py`, which fails if a data file appears for a market that is
not in the market lists (so it would have no pages), or if the sitemap loses the dated pages; and the count of dated
pages on `/press`. **Left for the founder:** submitting the sitemap in Google Search Console and Bing Webmaster
Tools (his accounts; audit section 7).

### B. Press kit at `/press`

| Section | Data it uses | File(s) |
| --- | --- | --- |
| Citable sentences: the ASBI's latest week; Kenya's 91-, 182- and 364-day rates, each with copy buttons | Index computed from the bill files; CBK results with the PDF link per row | `lib/data/bill-index.ts`, `data/kenya/tbill_auctions.json` |
| Latest bill rate in every market, beside its policy rate as printed | Each market's latest result and source document; `policy_rates.json` (label, rate, date printed or read) | `data/<country>/tbill_auctions.json`, `data/policy_rates.json` |
| Latest bond auction in every market | The headline line of the latest auction, as on its dated page | bond files above, `components/bonds/auction.ts` |
| What the record holds | Counts of results and dated pages, from the same files | as above |
| How to cite | Credit line, the in-text phrase (as `/reference`), a dataset citation | — |
| Method | Links to `/reference`, `/method`, the index method, standards, corrections, our record, data status | — |
| Charts to republish | Chart of the week (`/charts/week.png`), the widgets, the latest Receipts' chart embeds | `lib/receipts.ts` |
| The mark | The current Laterite mark (D-026): `/icon.svg`, `/icons/icon-512.png` | `app/icon.svg`, `public/icons/` |
| Cited by | The citation log (item C); the section shows only once the log holds an entry | `data/citations.json` |
| Contact | `site.contactEmail` (desk@afronomicsfeed.com today), subject "Press" | `lib/site.ts` |

Route: `app/press/page.tsx` (figures in `app/press/figures.ts`), rebuilt hourly. Linked from the footer
(Company), the full page list and the newsroom box on `/reference`; in the sitemap; in the site QA page list.

### C. Citation log

A citation is a public fact (an outlet's published piece and its link), so the log is a **data file in the
repository, not a database table**: `data/citations.json`, appended by `scripts/log_citation.py`, which checks
every field (https link, not our own site, date not in the future, a kind from a fixed list, no email addresses) and
refuses a duplicate link. Rows are never edited or deleted; a wrong entry is withdrawn by a new row that names it.
No migration is needed. The same rules are in `lib/citations-core.ts` and tested on both sides.

- `/desk/citations` (behind the desk key): the counts (total, last 7 and 30 days, linked back, outlets), the log, and
  the command to add one.
- `/press` shows the newest 20 once there is one (decision C below).
- The weekly scoreboard line ("Outside citations", UPGRADE §4) can read `citationSummary()`; wiring it into the
  founder's Monday email belongs with U7's desk work, so it is left to that phase.

### D. WhatsApp Channel

WhatsApp Channels have no free API for posting from a server, so the **free manual route** is the plan: the founder
or the Distribution desk copies the day's post and pastes it in the WhatsApp app.

- **Post format:** the existing WhatsApp text (`morningWhatsApp`, `morningTextSw`), its link tagged
  `utm_source=whatsapp_channel`, then a "Sources:" line naming each publisher behind its figures (from the note's own
  rows) and *Information, not advice.* (Kiswahili: *Taarifa, si ushauri.*). `lib/channels.ts`,
  `lib/editions/morning-channel.ts`; also served at `/api/edition/morning?format=channel` (`&lang=sw`).
- **Desk copy page:** `/desk/whatsapp`, today's post in English and Kiswahili with a copy button and the steps to
  create the channel.
- **"Join on WhatsApp" slot** on Today (under the Morning sign-up), `/morning`, `/morning/sw` and `/sw`
  (`components/ui/WhatsAppChannel.tsx`). It renders nothing unless `WHATSAPP_CHANNEL_URL` is a real channel link
  (`https://whatsapp.com/channel/…`); the existing share row uses the same check.

### Not in this phase

- **Weekly "numbers you can use" email to the press list** (UPGRADE U6): the press list has 0 rows and outgoing email
  is on hold (D-030). The `/press` figures are the content it would carry; the send waits for a founder decision.
- **Widgets push list** (SACCOs, fintechs and blogs from the registry): a sales-desk list of organisations to
  approach. Contacts belong in the private contacts file, and approaching anyone follows `docs/sales/sales-operator.md`;
  better done with U7's Sales desk.

## 3. Checks

`npx tsc --noEmit`; `eslint` on the changed files; `python -m pytest tests/site tests/readers` (new:
`test_citations.py`, `test_channels.py`, `test_auction_page_coverage.py`); `npm run build` with `SUPABASE_URL`
pointed at a dead port as CI does; `node scripts/site-qa.mjs --serve` (with `/press` added to
`tests/site/pages.json`); screenshots of each new page at 390px and 1280px, light and dark.

Size: small to medium. No new data sources, no paid services, no schema change, no migration.

## 4. Decisions for the founder

- **A. Press contact.** Keep `desk@afronomicsfeed.com` (one inbox, as `/contact` and `/reference` say today;
  recommended), or set up a separate `press@` address.
- **B. Press-kit download.** Offer the mark files one by one, as built (recommended), or also a single zip with a
  one-page fact sheet PDF. Related: `public/brand/logo-*.png|jpg` are the old navy and red logo from before D-026;
  should they be withdrawn so nobody downloads the old look?
- **C. Show citations in public.** List outside citations on `/press` once the first is logged: outlet, headline,
  date and link only (recommended, as built), or keep them on the desk only.
- **D. WhatsApp Channel.** Create it (name suggestion: "Afronomics Morning"), set `WHATSAPP_CHANNEL_URL` in Vercel
  (Production) and redeploy. One channel in English with the Kiswahili text available on the desk (recommended), or a
  second channel for Asubuhi.
- **E. Press email.** Keep the weekly press email held until there is a press list and sending resumes (recommended).
- **F. Search engines.** Submit `https://www.afronomicsfeed.com/sitemap.xml` in Google Search Console and Bing.
