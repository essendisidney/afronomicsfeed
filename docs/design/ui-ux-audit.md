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
