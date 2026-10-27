# UI/UX audit — Afronomics Feed (October 2026, weekly pass 1)

**Scope.** 16 pages at 390px (phone) and 1280px (desktop), light and dark: `/`, `/pricing`, `/licensing`,
`/data/frontier-local-debt`, `/markets/bonds`, `/markets/bonds/kenya`, `/markets/bonds/waemu`, `/east-africa`,
`/developers`, `/data-api`, `/thank-you`, `/rates/kenya`, `/markets/kenya-tbills`, `/weekly`, `/status`, `/desk`
(the desk with the dev-only `preview-empty` key, in `next dev`).

**Method.** Production build (`next build && next start`), Playwright (Chromium) full-page screenshots, axe-core 4.10
(WCAG 2.0/2.1 A and AA plus best practice) on every page, width and theme, a tap-target scan (interactive elements
under 44px tall, inline text links exempt), a horizontal-overflow check (`scrollWidth`), CLS and LCP from
`PerformanceObserver`, a keyboard walk (Tab order and focus styles) and a phone-menu walk.

**Who it is for.** Institutional buyers (fund managers, DFIs, bank treasuries) who decide in seconds whether a data
source is serious, and African readers on phones. Ranking is by impact on **trust** (do the numbers look sourced,
dated, maintained?) and **conversion** (can an institution find the pilot and the price from anywhere?).

Screenshots live in the session scratchpad, `…/scratchpad/uiux/`: `before-<page>-<width>[-dark].png` (baseline, before
this pass) and `after-<page>-<width>[-dark].png`. Raw axe and metrics: `before-audit.json`, `after-audit.json`.
Phone menu: `before-menu-390.png`, `after-menu-390.png`.

## Baseline in numbers

| Check | Before | After |
| --- | --- | --- |
| axe violations, all 64 page × width × theme runs | every run failed `landmark-one-main` and `region` (up to 43 nodes on /pricing); 15 of 16 pages failed `landmark-no-duplicate-banner` and `landmark-unique`; `scrollable-region-focusable` on /pricing, /licensing, /developers; `empty-table-header` on /rates/kenya | only `landmark-complementary-is-top-level` (best practice) on `/` and `/east-africa`; no WCAG A/AA failures |
| Horizontal scroll at 390px | none (scrollWidth 390 on all 16) | none (390 on all 16) |
| CLS | 0.000 everywhere | 0.000 everywhere |
| LCP (local) | 0.1–0.4s static pages; 1.7–2.2s on `/weekly` and `/rates/kenya` (server-rendered, LCP is a text block) | unchanged |
| Tap targets under 44px, phone (e.g. `/pricing`) | 57 | 24, mostly 18px checkboxes inside 44px labels and inline source links |
| Colour contrast (axe) | no failures | no failures (one introduced and fixed in this pass: tinted badges) |

## Findings, ranked

Each: what is wrong, where, evidence, fix, status.

### 1. No institutional path in the header; "start a pilot" was two to four taps away on a phone
*Conversion.* The only header call to action was "Get Pro" (the reader plan), hidden below 640px. On a phone the
header showed "Search" and "Menu" only; the menu was a flat list of 20 links with "Get Pro" last and no pilot,
pricing, API or licensing entry. An institutional buyer landing on a bond page from search could not find the pilot.
Evidence: `before-header-390.png`, `before-menu-390.png`, `before-home-1280.png`.
**Fix (done):** a persistent accent "Start a 30-day pilot" in the header on every page and width ("Free pilot" on
phones, "Start a pilot" 640–1279px), linking to the pilot form (`institutionalPilot.href`) and tagged
`data-track="pricing_cta_click"`. "Pricing" sits in the section bar on desktop. The phone menu now opens with a
"For funds, banks and DFIs" block (pilot button, Pricing, Data API, Licensing, For institutions), then "Markets and
data", then "For readers" (utility links, Newsletter, Reader plans). Reader navigation is unchanged in content and
order. Evidence: `after-menu-390.png`, `after-pricing-1280.png`.

### 2. Wide tables were unreadable on phones
*Trust.* Comparison and data tables scrolled sideways with no hint that columns were hidden and with the row
label scrolling away, so a reader saw numbers without knowing which bond or plan they belonged to. Worst cases:
the pricing plan comparison (row labels broke into one word per line, the last plan column was cut off), the
`/rates/kenya` comparison ("After tax" and "Money tied up" off-screen behind a decorative bar column), the
frontier-debt coverage table ("Bill auctions" column cut), `/licensing` datasets (three `nowrap` columns).
Evidence: `before-pricing-390.png`, `before-rates_kenya-390.png`, `before-data_frontier-local-debt-390.png`.
**Fix (done):** every scrolling `.data-table` now shows a soft edge while columns are off-screen and, below 640px,
pins its first column (with a hairline) so the label stays put. New `components/ui/DataTable.tsx`: `TableScroll`
(labelled, keyboard-focusable scroll region) and `DataTable` with `mobile="cards"` (one card per row on phones).
Applied: pricing comparison (row headers, sr-only "Included" / "Not included" for ✓ and —), licensing datasets
(cards) and local prices, status lists (cards, with status badges) and publication-delay table, `/rates/kenya`
(bar column hidden on phones so the figures show). All other `overflow-x-auto > .data-table` tables (about 80)
inherit the pinned column and edge shadow from `app/globals.css` without code changes.
Evidence: `after-pricing-390.png`, `after-rates_kenya-390.png`, `after-status-390.png`, `after-licensing-390.png`.

### 3. No `<main>` landmark; header announced twice
*Trust, accessibility.* axe flagged every page: no main landmark, all content outside landmarks (`region`, up to 43
nodes), and two "banner" landmarks (the site header, plus the page header that counted as a banner because no
`<main>` wrapped it). Screen-reader users could not jump to content; the skip link targeted a plain `div`.
**Fix (done):** `SiteChrome` wraps content in `<main id="main">`; the site header is labelled "Site". axe now
reports no landmark failures except one best-practice rule (see remaining work).

### 4. Anchor links to the pilot form landed under the sticky header
*Conversion.* "Request a 30-day pilot" and "Free 30-day pilot" links point at `#pilot`; the sticky header (57px
phone, 102px desktop) covered the form's heading, and only some sections had `scroll-mt-24`.
**Fix (done):** `scroll-padding-top` on `html` (4.5rem phone, 7rem desktop) so every anchor clears the header; the 28
ad-hoc `scroll-mt-24` utilities were removed so offsets do not double up.

### 5. Form focus was nearly invisible
*Accessibility, conversion.* The pilot, invoice, subscribe, alert, search and desk forms (16 files) use
`outline-none` and show focus only as a faint ring or border colour change. Keyboard users lose their place in the
form that matters most.
**Fix (done):** every focused text field, select and textarea gets the site's 2px accent outline (light and dark),
from one rule in `globals.css`.

### 6. Tap targets below 44px across the chrome
*Phones.* Footer links (16–20px tall, ~70 links in one long column), the footer legal row (16px), section "Open →"
links (31px), citation chips (35px), survey and feedback chips (28px), pilot-form checkboxes (13px), FAQ rows
(27px), header "Search"/"Menu" (33px).
Evidence: `before-audit.json` → `small` per page.
**Fix (done):** 44px minimum on phones for all of these (relaxing to the original size from 640px, where pointers are
the norm); footer becomes two columns on phones (the long Data list spans both); checkboxes and radios are 18px
with the whole 44px label as the target; header search is a 44px icon button.

### 7. Dark mode: inverted "ink" tiles became pale slabs
*Trust (looks unfinished).* `bg-ink text-paper` tiles invert in dark mode: the CSV download tiles (`/markets/bonds/*`,
`/markets/kenya-bonds`, `/markets/kenya-tbills`), the "Request a 30-day pilot" tile on `/markets/bonds`, and the
code samples on `/data-api` became light-grey blocks on a dark page.
Evidence: `before-markets_bonds_kenya-390-dark.png`, `before-data-api-1280-dark.png`.
**Fix (done):** new `ActionTile` (in `components/ui/Card.tsx`) on the night palette with a hairline ring, so it stays
a dark tile in both themes; code samples use night too. Also: Tailwind's `dark:` variant followed only the OS
setting, not the site's theme toggle — now it follows the toggle (`@custom-variant dark`).

### 8. Inconsistent buttons, cards and badges
*Trust.* Primary actions were `bg-ink` on one form and `bg-forest` on the next, 36–48px tall, in 12.5–14px text;
cards used four paddings; status was plain coloured text on `/status` and a tinted pill on `/pricing`.
**Fix (done, partly applied):** `components/ui/Button.tsx` (`primary`, `accent`, `secondary`, `night`; 44px on
phones), `Card.tsx` (`default`, `emphasis`, `muted`, plus `ActionTile`), `Badge.tsx` (neutral, accent, up, down,
warn; coloured text on the plain surface so 11px text passes 4.5:1), `Stat.tsx` (`Stat`, `StatGroup`; tabular figures,
source line under the number). Applied to the pilot and invoice forms, institutional buy buttons, reader-plan
buttons, pricing cards, status page. Not yet applied site-wide (see remaining work).

### 9. Empty states read as broken on the home page
*Trust.* When an upstream feed misses an hour, the home page shows several bare modules in a row ("Series did not
load this hour", "The rate feed did not respond this hour", "No publisher headlines in this window") and the FX tape
disappears. On a first visit an institution reads this as a broken product. (In this sandbox no external feed is
reachable, so the screenshots exaggerate it; in production it happens only on a failed hour.)
Evidence: `before-home-1280.png` (right column).
**Fix (not done):** hide a module whose data failed, or collapse failures into one quiet line ("Three feeds did not
update this hour — see data status"), linking to `/status`.

### 10. Reader-plan and institutional pricing share one page without a clear split on phones
*Conversion.* `/pricing` runs USD institutional tiers, two forms, an FAQ, KES reader tiers, a comparison table and
three essays in one 11,000px column on a phone. The in-page chips help but scroll away.
**Fix (partly done):** chips are now 44px; the comparison table reads on a phone. **Next:** a sticky two-tab switch
("Institutions" / "Readers") on phones, and move the invoice form behind a disclosure under the pilot form.

### Other observations (lower impact)
- **Trust signals near numbers are strong**: source line, compiled-by, dates and "Information, not advice" sit under
  nearly every figure block, and `/status` publishes lateness openly. Keep this pattern; the new `Stat` has a
  `source` slot for it.
- **`/thank-you` without parameters** ("No payment was taken") is a dead end with two text links; add the pilot
  and reader-plan buttons.
- **Breadcrumb links** are 21px tall; acceptable under WCAG 2.5.8 (spacing exception) but small for thumbs.
- **Chart legibility**: the bank-rates and bond-history charts at 390px have 8–9px axis labels (`/rates/kenya`,
  `/markets/bonds/kenya`); raise to 11px and drop every other tick on phones.
- **Performance**: no layout shift anywhere; one CSS file; no raster images on most pages. `/weekly` loads a
  1200×630 chart PNG at 358px wide without `loading="lazy"`; `/weekly` and `/rates/kenya` LCP (1.7–2.2s locally) is
  server render time, worth caching.
- **Focus order** is logical (skip link, logo, search, utilities, pilot, sections); focus outline is 2px accent.

## What changed in code (this pass)

- `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/SiteChrome.tsx`,
  `components/brand/Wordmark.tsx` — navigation, landmark, tap targets.
- New `components/ui/Button.tsx`, `Card.tsx`, `Badge.tsx`, `Stat.tsx`, `DataTable.tsx`.
- `app/globals.css` — dark variant, field focus, scroll padding, phone tables, checkbox size, row headers.
- `app/pricing`, `app/licensing`, `app/status`, `app/rates/kenya`, `app/markets/bonds`, `app/markets/kenya-bonds`,
  `app/markets/kenya-tbills`, `app/data-api`, `app/developers`, `components/bonds/BondMarketView.tsx`,
  `components/data/HealthList.tsx`, `components/data/parts.tsx`, `components/billing/*`, `components/ui/CiteBlock.tsx`,
  `CopyCitation.tsx`, `MicroSurvey.tsx`, `PageFeedback.tsx`.
- No prices, figures or claims changed. Copy edits: CSV tile title "CSV download" → "The table as CSV" (the
  kicker already said "Download"); menu group labels; header CTA labels.

## Remaining for the next weekly pass

1. Home empty states (finding 9).
2. `/pricing` phone tabs for Institutions / Readers (finding 10).
3. Roll `Button`, `Card`, `Badge`, `Stat` out to the remaining pages (31 hand-rolled `bg-ink` buttons and tiles, and
   5 remaining `rounded-full border border-rule px-3 py-1` chips under 44px on phones).
4. Convert the remaining `<aside>` blocks inside `<main>` to sections, or accept the best-practice warning.
5. Chart axis labels on phones; lazy-load the weekly chart.
6. `/thank-you` dead end.
7. Add a Playwright check to CI: `scrollWidth <= 390` and axe on the 16 pages above, so regressions are caught.

---

# Weekly pass 2: 15 October 2026 (ISO week 42, slice m–r)

**Scope.** (a) Header, phone menu and tab bar, footer, Today, `/pricing` (with `#pilot` and the pilot form),
`/data/frontier-local-debt`, `/markets/bonds`. (b) Pages changed in the last 7 days, led by `/receipts`, the Receipt
page (`/receipts/2026-10-14-quickmart-ipo`, a draft shown on preview builds), `/record`, `/pack`, `/for-institutions`,
`/registry`, `/compare`, `/casebook`. (c) This week's slice: `/markets/*`, `/morning`, `/numbers`, `/pack`, `/pricing`,
`/rates/*`, `/record`, `/receipts`, `/registry`, `/reference`. All at 390px and 1280px, light and dark, on a production
build (`next build`, `SUPABASE_URL` pointed at a dead port, as in CI), read as an institutional buyer and as a Kenyan
reader on a phone. (d) `scripts/site-qa.mjs` with its speed pass.

Screenshots: session scratchpad, `…/scratchpad/uiux-2026-10-15/` (`before-<page>-<width>[-dark].png`,
`after-…`, plus `before-menu-390.png` / `after-menu-390.png`).

## Baseline

| Check | Before | After |
| --- | --- | --- |
| Site QA (64 pages × 4 variants, 938–1,079 links) | **FAIL**: `/registry` largest content 2,856 ms on slow 4G (budget 2,500) | **PASS** (`/registry` 1,716 ms, shift 0.016) |
| `/registry` HTML | 1.39 MB (412 rows, each with an evidence tag) | 0.46 MB (100 rows a page) |
| `/registry` at 390px | 45,353px tall | 13,498px |
| `/compare` at 390px | 17,376px (figures broke as "KES 75.27 / bn") | 13,897px |
| Footer at 390px | fifth column alone on the left, half the width | spans both columns, links in two |

## Findings, ranked (trust and conversion first)

1. **`/registry` failed the speed budget and was a 45,000px scroll on a phone.** Every one of 412 institutions was
   rendered at once. *Fixed:* 100 rows a page, A to Z, with numbered pages above and below the table (each page's
   name range in its label); the CSV and Excel downloads still give the full list. On a phone the kind chips sit in
   one sideways row and the downloads on their own line: wrapped, they re-flowed when the web font arrived late,
   which alone pushed layout shift to 0.102 once the page got faster.
2. **Stale and contradictory copy an institution would catch.** The Open reader tier promised "the DFI pipeline,
   signals" (both removed; `/signals` redirects to `/`); the app manifest still said "DFI pipelines"; `/markets/tbills`
   said "Every market's full record is a free download" while every download says "latest 12 months free; full
   history with a key". *Fixed* (removed or corrected; no price or figure changed).
3. **Timing overclaims.** "The moment they land / it lands" on `/pack`, `/for-institutions` (twice) and the
   `/markets/tbills` alert box: the data is read by scheduled jobs and `/status` publishes lateness. The Morning was
   "Africa's markets before 7am" on `/morning`, `/subscribe` and in search, but the job starts at 07:00 Nairobi, and
   Today and `/pricing` already said "before 07:30". *Fixed:* claims removed or reworded ("Get each result by alert");
   the Morning says "before 07:30" everywhere.
4. **Breadcrumbs disagreed with the navigation.** 78 pages began "Home /", 12 "Today /", and on a phone a Receipt's
   long title wrapped onto its own line behind a stray "/". *Fixed in `components/ui/Breadcrumbs.tsx`:* the first
   crumb is always "Today"; a current-page crumb over 28 characters (it repeats the h1) is hidden below 640px.
5. **Figures broke across lines in tables** ("KES 75.27 / bn" on `/compare`, `/registry` and other `.data-table`s on
   phones). *Fixed:* `td[data-num]` never wraps (`app/globals.css`); the table scrolls sideways as designed.
6. **Bond market cards on `/data/frontier-local-debt` mixed links and notes in one cramped row** (24px link targets,
   "CSV and API: latest 12 months free" wedged between links). *Fixed:* links on one row, 44px on phones (Source
   notice · CSV · API, then the full-history link), publisher and the free-tier note as one quiet line beneath.
7. **The lead chart's reference label ran through a bar** ("100%: the whole year's profit" over the 2023 bar on Today
   and the Receipt). *Fixed:* the label has a halo in the card colour (`components/charts/BarChart.tsx`).
8. **Tap targets under 44px** in this week's pages: `/morning` (Kiswahili, low-data and WhatsApp links, 14px tall),
   `/receipts` filter chips (36px). *Fixed* (44px on phones, as before from 640px).
9. **Footer on phones:** the fifth column (Company) sat alone in the left half under four paired columns. *Fixed:* an
   odd last column spans both phone columns with its links in two (176px shorter on every page).
10. **Smaller label and hierarchy fixes.** Phone menu "Pro" → "Reader plans"; the tab bar's "More" lights up while the
    menu is open; `/pricing` "Why this cheap" → "Why the price is low"; `/record` section headings used two weights
    (`font-serif` 600 and `t-h2`), now all `t-h2`; `/markets/bonds` Kenya card read "19 Oct 2026 / settles" under
    "Newest settlement", now "still to settle"; `/morning` title shortened to stay under 65 characters.

## Left, and why

- **Body font swaps in late on slow phones (known).** Archivo (`display: optional`) still arrives after first paint
  under the slow-4G profile and re-flows text: `/receipts` 0.058, `/rates/kenya` 0.078, `/registry` 0.016 after this
  pass. Font strategy is out of scope for this pass; the registry fix only removes the wrapping that amplified it.
- **USD approximations disagree:** Team reader plan is "About $49" on `/pricing` (`lib/site.ts`, hard-coded) and
  "about $45" on `/for-institutions` (computed from `KES_PER_USD = 129` in `lib/billing/ratecard.ts`). Prices and
  conversions are the founder's call; one source for both is the fix.
- **Draft Receipt on Today in preview builds.** Production hides drafts (`VERCEL_ENV`), so readers never see it, but
  every preview and this QA run show "Draft, not public" as Today's lead. Worth a production-like QA run with
  `AF_HIDE_DRAFTS=1` to see Today's real empty state.
- **`/reference` promises "Reply within the hour on a working day"**; everywhere else the desk says one working day.
  A service promise, not a layout defect: for the founder.
- **Breadcrumb links are 21px tall** (WCAG 2.5.8 spacing exception; QA does not count them). Raising them would add a
  44px row to every page head on phones; better done in the 7b redesign.
- **`/pricing` is still one 10,000px column on a phone** (previous pass, finding 10); the Institutions/Readers switch
  belongs with the 7b template work. `docs/rebuild/phase-7b-plan.md` does not exist yet on `main`.
- **Pinned first columns are wide on some phone tables** (`/receipts/<slug>` "Who gets the money", `/reference`
  definitions): the 8rem minimum plus long labels leaves one figure column visible. A per-table `mobile="cards"`
  (`components/ui/DataTable.tsx`) would read better.
- **`/data/frontier-local-debt` Kenya card lists two "30y" rows** (two different bonds of the same tenor) with no
  issue code; a buyer cannot tell them apart. Needs the bond name in the row (data shape), not a style change.

## Changed in code

`app/registry/page.tsx`, `components/ui/Breadcrumbs.tsx`, `app/globals.css`, `components/data/BondMarketCard.tsx`,
`components/charts/BarChart.tsx`, `components/layout/Footer.tsx`, `components/layout/Header.tsx`,
`app/morning/page.tsx`, `app/receipts/page.tsx`, `app/record/page.tsx`, `app/markets/bonds/page.tsx`,
`app/markets/tbills/page.tsx`, `app/pack/page.tsx`, `app/for-institutions/page.tsx`, `app/pricing/page.tsx`,
`app/subscribe/page.tsx`, `app/manifest.ts`, `lib/site.ts`, `lib/search.ts`.

Checks: `npx tsc --noEmit -p .`, `npx eslint` on changed files, `python3 -m pytest -q tests/site` (98 passed, 2
skipped), `next build`, `scripts/site-qa.mjs --serve` PASS including the speed pass.

---

# Weekly pass 3: 22 October 2026 (ISO week 43, slice s–z)

**Scope.** (a) Header, phone menu and tab bar, footer, Today, `/pricing` (with the pilot form), the pilot path
(`/data/frontier-local-debt#pilot`, `/thank-you`), `/data/frontier-local-debt`, `/markets/bonds`. (b) Pages changed in
the last 7 days, led by the Redesign v3 work (PR #216, 21 Oct): `components/home/FrontPage.tsx` (board, lead story,
story columns, tool tiles), `components/ui/ToolIcon.tsx`, `components/layout/SectionNav.tsx`, `app/(home)/page.tsx`,
`app/tools/page.tsx`, `app/globals.css`; plus `/markets/kenya-tbills` (and its calculator), the `/rates/kenya/*`
calculators, `/record`, `/morning`, `/markets/tbills`, `/markets/ipo-calculator`, `/for-institutions`, `/explainers`,
`/diaspora`, `/receipts`, `/legal/privacy`. (c) Slice s–z (the fourth of a–f, g–l, m–r, s–z): `/search`, `/status`,
`/stories`, `/subscribe`, `/sw`, `/thank-you`, `/tools`, `/topics`, `/trust`, `/weekly`, `/widgets`. All at 390px and
1280px, light and dark, on a production build with `SUPABASE_URL` pointed at a dead port. (d) The latest Site QA run on
`main` (run 39726693313, 22 Oct 05:12 UTC) passed; its artifact could not be downloaded from this sandbox, so
`scripts/site-qa.mjs --serve` was run locally.

Screenshots: session scratchpad, `…/scratchpad/uiux-2026-10-22/` (`before-…`, `after-…`, `week-…` for the pages of
(b) audited once, `before-menu-390.png` / `after-menu-390.png`).

## Baseline

| Check | Before | After |
| --- | --- | --- |
| Site QA (78 pages × 4 variants, 1,062 links) | PASS, but the two "dark" variants rendered **light** (finding 1) | PASS with real dark runs |
| axe WCAG A/AA, horizontal scroll at 390px | none on the 44 pages audited, both themes | none |
| Today at 390px | 7,257px; Tools block five rows of 90px tiles | 7,153px; five rows of 56px tiles |
| Phone menu: first sight of the pilot | below the fold, after reader links and the theme switch | first screen, under the five sections |

## Findings, ranked (trust and conversion first)

1. **The QA gate's dark runs were not dark.** The theme follows the reader's clock (`lib/theme.ts`), not
   `prefers-color-scheme`, so emulating the scheme did nothing: every daytime CI run checked light twice. *Fixed:*
   `scripts/site-qa.mjs` sets the theme the way a reader does (`af-theme` in localStorage) for each variant; noted in
   `docs/qa.md`. All 78 pages pass in true dark.
2. **The pilot fell below the fold of the phone menu again** (Redesign v3 ordered Sections, For readers, Theme, then
   the institutional block). *Fixed* (`components/layout/Header.tsx`): the "For boards, banks, SACCOs and funds" block
   follows the sections on phones; on desktop it stays in the right column and no longer stretches to the row height.
3. **Timing claims for the Morning drifted back to "7:00"** (`/morning` "In your inbox at 7:00" and its newsletter band,
   the `/subscribe` kicker, the shared `NewsletterBand` and `FollowUp`, the subscribe success message). The job starts
   at 07:00 Nairobi, so mail cannot be in the inbox at 7:00; the title and Today already say "before 07:30". *Fixed:*
   "before 07:30" everywhere on the site.
4. **Internal jargon and stale labels in reader copy.** `/topics` opened with "A short shelf for the ninety-day wedge";
   `/subscribe` linked "Pro" (renamed Reader plans last week); the topic label read "Saccos" where every other surface
   says "SACCOs". *Fixed.*
5. **Today's figure board cut the source to "Central …" on phones** (date and publisher on one 11px line). *Fixed:* date
   and publisher on two lines; every cell keeps the same height, so nothing shifts.
6. **"See all →" floated above its section head** on every Today section (centred in a 44px box beside a
   bottom-aligned head). *Fixed:* bottom-aligned with the head.
7. **Tool tiles were bulky on phones and left two orphans on desktop.** The icon sat above the title (90px tiles, 450px
   for ten links); on desktop ten tiles in four columns left a half row. *Fixed:* icon beside the title on phones (56px
   tiles); five across on desktop when the count fills the rows.
8. **The institutional band on Today hid its price on phones and melted into the dark page.** *Fixed:* the "from USD
   250 a month; Kenyan institutions from KES 16,000" line (rate-card figures, unchanged) shows at every width, and the
   band has the night hairline ring used by `ActionTile`.
9. **Today's first-visit line was truncated on phones** ("…what changed si…"). *Fixed:* a shorter invitation that fits.
10. **`/thank-you` without a payment was a dead end** (carried over from pass 1). *Fixed:* "Back to pricing" and "Start a
    free 30-day pilot" buttons, invoice link at 44px.
11. **Tap targets and cramped tables.** `/explainers`, `/weekly`, `/topics/*` cards had 20px topic chips and full-width
    21px "Read →" links with identical names. *Fixed:* chips 36px on phones (28px from 640px), "Read" 44px on phones with
    the title for screen readers. The `/morning` results table broke "91-day", "+155 bps" and dates over two lines; now
    one line each (the table scrolls with its edge shadow).

## Left, and why

- **Welcome email still says "every weekday at 7:00"** (`lib/welcome-email.ts`): email copy, outside a UI pass.
- **"Five minutes on 54 economies"** for the Weekly (`/subscribe`, `/weekly` description): its sections are Kenya-led
  auctions, currencies, prints and capital; whether it spans 54 economies is an editorial call.
- **`/markets/bonds` pilot tile: "Every market, delivered daily"**: a pilot is an API key over data read every two hours
  on weekdays; "delivered daily" reads as a push feed. Worth rewording with the founder.
- **Header on phones has no pilot or "For institutions" entry** (search and Menu only, by the v3 design). Finding 2 puts
  the pilot on the menu's first screen rather than adding a third control to the bar.
- **Lead-story source line truncates** ("Safaricom, Fuliza page (charge…") at both widths; the full source is in the
  chart foot and on the Receipt. A two-line source needs the board's fixed-height treatment.
- **`/stories` filter chips**: "NSE disclosures" sits alone on a second row at 1280px. Cosmetic.
- **Table date links on `/markets/kenya-tbills`** (14px tall, about 60 rows): inline table links, exempt in QA; a
  whole-row link would be the fix.
- Carried over: `/pricing` Institutions/Readers switch on phones; Egypt's two "1.5y" and Kenya's two "30y" rows without
  issue codes; USD approximations from two sources; breadcrumb height.

## Changed in code

`scripts/site-qa.mjs`, `docs/qa.md`, `components/layout/Header.tsx`, `components/home/FrontPage.tsx`,
`components/home/SinceLastVisit.tsx`, `app/(home)/page.tsx`, `app/morning/page.tsx`, `app/subscribe/page.tsx`,
`app/topics/page.tsx`, `app/thank-you/page.tsx`, `lib/taxonomy.ts`, `components/ui/ArticleCard.tsx`,
`components/ui/TopicChips.tsx`, `components/ui/FollowUp.tsx`, `components/ui/SubscribeForm.tsx`,
`components/data/NewsletterBand.tsx`. No prices or figures changed; the only claims changed are timing claims made
consistent with the 07:00 job.

Checks: `npx tsc --noEmit -p .`, `npx eslint` on changed files, `python3 -m pytest -q tests/site` (219 passed, 13
skipped), `next build`, `scripts/site-qa.mjs --serve` PASS (78 pages × 4 variants, 1,062 links, speed pass in budget).
