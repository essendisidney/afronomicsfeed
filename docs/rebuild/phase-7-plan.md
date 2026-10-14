# Phase 7 plan: a world-class interface

Written 14 Oct 2026 at the founder's request ("redo the UI of the whole site; let's compete globally on this front").
**Status: waiting for founder approval.** No code until approved. It is split into five PRs (four for pages, one for
documents), each merged only with your approval.

## The bar

Afronomics competes with the Financial Times' markets data, Bloomberg's public pages, The Economist's charts, Our
World in Data, and Koyfin-style data tools. What these sites share is not decoration:
- **the number comes first**, before any sentence;
- **a chart explains the number**, beside it, in the same style everywhere;
- **density without clutter**: many figures on a screen, each easy to read;
- **speed**: pages appear at once on a slow phone;
- **one system**: every page feels made by the same hand.

The brief's ambience ("a well-kept case file: calm, exact, evidential") stays, and so do the evidence tag, the
honesty rules, Kiswahili, dark mode and WCAG AA. This phase changes how the site looks and reads, not what it says.

## What the screenshots show today (14 Oct, 1280px and 390px)

- **Today opens with a 3-line slogan and no number.** The first figure is below the fold on a laptop and two
  screens down on a phone. A treasurer arriving at 07:30 sees words, not rates.
- **Large empty areas.** On the home page, the right half of the hero is empty, and "What changed" fills two of
  three columns. The numbers hub is a page of buttons.
- **No charts where they matter.** The T-bill monitor, the registry and the institution pages are tables only. A
  chart component exists but is used in few places.
- **Tables read poorly.**
  - Columns spread across the full width, so a figure sits far from its label.
  - Evidence tags take a line of their own under each figure.
  - There are no sticky headers and no sorting.
  - On a phone the tables don't become cards.
- **Two dark header bars** take 116px before any content, with seven controls in the top bar.
- **Headings are oversized** for a data site (64px page titles). They push the data down.

One honesty bug was also found and is fixed in Phase 6: a Kenya bond result showed a date five days in the future,
because CBK dates bond results by value date. The tag now says "for value 19 Oct 2026".

## The design system (PR 7a)

A written, tested set of parts, with a living reference page at `/desk/design` (private, so it is not indexed).

1. **Type scale.** Archivo for the interface and figures; Source Serif 4 for headlines only.
   - Page titles drop from 64px to 40px on a laptop and 30px on a phone.
   - A fixed scale of 7 sizes, so no size is set by hand.
   - Tabular figures in every table and tile.
2. **Grid and spacing.** A 12-column grid at 1280px, 4 columns at 390px, and an 8-point spacing scale. The maximum
   width stays as now; content uses it instead of leaving half empty.
3. **Colour.** Paper and ink as now. One accent: keep jacaranda, the purple brand colour (your decision 2). Up and
   down keep their own green and red, and a warning amber is added. Every pair is checked for AA contrast in light
   and dark.
4. **New components:**
   - **Stat tile:** the figure, its change, a 12-point sparkline and its evidence tag, in one compact block.
   - **Data table:**
     - sticky header and sortable columns;
     - figures aligned right on the decimal point;
     - the evidence tag as a small mark beside the figure, which opens the source on tap, instead of a separate line;
     - on a phone, each row becomes a card.
   - **Chart:** one chart system for line, bar and range charts, in one visual style. It adds:
     - an exact tooltip with the date and value;
     - a "source and as-of" line under every chart;
     - a download of the chart's data as CSV;
     - keyboard and screen-reader access (a hidden table of the same figures).

     No new chart library: the current SVG chart is extended, which keeps pages light.
   - **Header:**
     - one bar of 56px with the main navigation and search;
     - the theme, Kiswahili and Alerts move into a compact menu;
     - on a phone, the bottom of the screen gets the main sections as a tab bar.
   - **Page header:** breadcrumb, a short title, one line of context, and the figure or chart directly under it.
5. **Speed budget.** Pages must:
   - appear within 2 seconds on a slow 4G phone (Largest Contentful Paint);
   - not shift as they load (layout shift below 0.05);
   - send no more than 120 KB of JavaScript on first load for data pages.

   The budget is measured in site QA, and a page that breaks it fails the check.

## Pages, in four PRs

| PR | Pages | What changes |
| --- | --- | --- |
| **7a** | Design system, header, footer, **Today** | Today opens with a market board: Kenya 91-day bill, CBR, USD/KES, the best money market fund after tax, and the forecast range for the next auction. Each is a stat tile with a sparkline and evidence tag. Below it: "What changed" as a dense list, then the casebook and Our record. |
| **7b** | **Numbers** and its 34 market and rate pages | The hub shows each question with a live tile, not a button. The market and rate pages share one template: a page header with the figure, a chart, then the table. Template changes reach all 34 pages at once. |
| **7c** | **Registry, institution pages, Compare, Our record, Casebook, For institutions, the Watch pack sample** | An institution page opens with a profile strip and a chart of its figures beside its tier median. Compare gets a chart of peers above the table. Our record shows its hit rate as a chart over time. The casebook uses the shared timeline. For institutions shows prices as a clean rate card. |
| **7d** | **Stories, Learn, the Morning, legal pages, search, 404** | Reading pages: measure, rhythm and figures inside stories in the same style as data pages. |

## Documents people download (PR 7e)

Added 14 Oct at the founder's request: "classy premium documents if anyone is to download anything from us". The
bar is a Goldman Sachs or IMF research PDF, and an FT or World Bank data file.

**Today:**
- The committee pack, the Watch pack and their samples are web pages that the reader turns into a PDF with the
  browser's "Print". The result depends on their browser: margins, page breaks and fonts differ, and nothing marks
  the file as ours once it is saved.
- The data downloads are bare CSV files. They carry no title, no source line, no as-of date, no licence and no
  citation.

**After 7e:**
1. **Real PDF files, made by us.** We render each document once with the same Chromium the site checks run on, and
   serve that file. Nothing depends on the reader's browser any more.
   - The monthly committee pack, the weekly index release and the samples are made in GitHub Actions when each
     edition is published.
   - Private packs (the Watch pack for each SACCO) are made the same way and sent by private link.
2. **One document design**, in the same type and colour as the site:
   - a cover with the title, edition, the as-of date and a document number (for example AF-PACK-2026-10);
   - a contents page for documents over 6 pages;
   - running headers and footers: "Page 3 of 12", the document number, and "Information, not advice";
   - charts and tables in the site's style, each with its source and as-of line;
   - a closing page with the method, sources, licence and how to cite;
   - for private documents, "Prepared for <institution>, private" on every page.
3. **Files that behave like professional ones:**
   - embedded fonts;
   - PDF title, author and subject set;
   - tagged PDF for screen readers;
   - bookmarks for each section;
   - A4, plus US Letter for overseas buyers;
   - under 2 MB.
4. **Premium data files.** Every dataset can be downloaded as CSV as now, and as an **Excel workbook** with three
   sheets:
   - a cover sheet with the title, source, as-of date, licence and citation;
   - the data, with frozen headers, number formats and column widths set;
   - notes per column.

   CSV files gain a short header block naming the source, as-of date, licence and citation. File names follow one
   rule: `afronomics_<dataset>_<as-of>.csv` or `.xlsx`.
5. **Checks.** A test opens every generated PDF and workbook. It checks the page count, that fonts are embedded,
   the metadata, that every chart and table carries a source line, and that the workbook sheets are present. A
   broken document fails the build.

## Checks for every PR

Each PR is checked with tests, build, site QA and the speed budget. It comes with screenshots of every changed page
at 390px and 1280px, light and dark, beside the same page before.

## How we judge "global standard"

Before 7a is built, I'll show you a **design preview**: Today and one market page, built in the real site on a preview
branch with live data, at phone and laptop sizes, placed beside the FT and Bloomberg equivalents. You approve the
direction there, before it is rolled out to 100 pages.

## Not in Phase 7

- New data or new products.
- A new logo or brand name (the wordmark only gets spacing fixes, unless you ask).
- Any change to figures, sources or the honesty rules.

## Decisions needed from you

1. **Order:** 7a (Today and the system) first, then 7b, 7c, 7d (recommended), or start with the paid pages (7c)
   to help sales first?
2. **Accent colour:** keep jacaranda purple (recommended: it is already the brand), or choose a new accent in the
   design preview?
3. **Preview first:** approve a design preview of 2 pages before roll-out (recommended), or go straight to 7a?
4. **Documents first?** 7e can run in parallel with 7a, since it touches separate files. I recommend doing it
   **second**, right after 7a. The Watch pack and committee pack are what institutions pay for, so they should not wait until the end.
5. **Excel downloads:** free for the latest 12 months like the CSV (recommended: Excel is the format institutions
   use, and a polished free file advertises the paid one), or for paid keys only?
