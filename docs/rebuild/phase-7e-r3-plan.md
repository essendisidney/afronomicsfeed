# Phase 7e and Receipts R3 plan: premium documents, then Pro and the full file

Written 15 Oct 2026 for `docs/rebuild/phase-7-plan.md` ("Documents people download", PR 7e) and
`docs/rebuild/RECEIPTS.md` (its Phase 8, here R3). **Status: approved 15 Oct 2026 with the four recommended answers.** PR 1 (7e) built on `rebuild/phase-7e`.

Two PRs, in this order, each merged only with your approval:
1. **7e** on `rebuild/phase-7e`: our own PDF files and Excel workbooks.
2. **R3** on `rebuild/receipts-r3`: Pro readers sign in and read the full file of a Receipt.

R3 comes second because it uses the 7e document design for the free fact sheet and the full-file PDF.

## Where we are today

- **Packs.** The committee pack, the Watch pack and their samples are HTML pages (`lib/editions/pack-html.ts`,
  `watch-html.ts`). The reader prints them to PDF in their own browser, so the file differs on every machine and
  carries nothing that marks it as ours.
- **Data downloads.** Bare CSV files with no title, source, as-of date, licence or citation. The full history of the
  gated CSVs is unlocked by a paid key and a 12-hour signed cookie (D-016, `lib/downloads.ts`).
- **Pro** is on the rate card at KES 1,500 a month and Paystack can take the payment, but there are no accounts. A Pro
  buyer gets what the desk sends them by hand.
- **The paywall** is a switch (`AFRONOMICS_PAYWALL`) that is off. D-007 says there is no consumer paywall.
- No Receipt is published yet. Quickmart is a draft.

## PR 1: 7e, premium documents

### 1. Real PDF files, made by us

- **How they are made.** A script, `scripts/make-documents.mjs`, opens each document page in the same Chromium the
  site checks use (Playwright, already a dependency) and saves a PDF with:
  - A4 by default, US Letter as a second file for overseas buyers;
  - fonts embedded (Chromium embeds the fonts it uses);
  - a tagged PDF for screen readers, and bookmarks from the headings (Playwright's `tagged` and `outline` options);
  - title, author ("Afronomics") and subject set afterwards with `pypdf` (Python, in the same workflow).
- **When they are made.** In GitHub Actions, when each edition is published:
  - the monthly committee pack and its sample;
  - the weekly index release;
  - the Watch pack sample.
  Private Watch packs for a named SACCO are made the same way, on request from the desk.
- **Where they are kept:** see decision 2.

### 2. One document design

The same type and colours as the site (Source Serif 4 and the sans, the jacaranda accent), in a print stylesheet that
every document shares (`app/documents.css`):
- **Cover:** title, edition, as-of date, and a document number, for example `AF-PACK-2026-10`.
- **Contents page** for any document over 6 pages.
- **Running header and footer** on every page: "Page 3 of 12", the document number, and "Information, not advice".
- **Charts and tables** in the site's style (the 7a chart kit), each with its source and as-of line.
- **Closing page:** method, sources, licence and how to cite.
- **Private documents:** "Prepared for <institution>. Private." on every page.

### 3. Premium data files

- **CSV:** each file opens with a short header block (lines starting with `#`): title, source, as-of date, licence and
  citation. Spreadsheet tools skip `#` lines when asked to, and the columns underneath are unchanged.
  - Risk: a script that reads our CSV with no options would now see the header lines. To protect API users,
    `/api/v1` responses stay exactly as they are; only the browser downloads gain the header.
- **Excel workbook** for every dataset, free for the latest 12 months like the CSV (your choice on 14 Oct). It has
  three sheets:
  - **Cover:** title, source, as-of date, licence and citation;
  - **Data:** frozen header row, number formats, column widths set;
  - **Notes:** one line per column, saying what it is and its unit.
  Full history in Excel follows the same paid key as the CSV.
- **How:** the `exceljs` library, used in the download route on the server only, so no extra script reaches the
  reader's phone.
- **File names:** `afronomics_<dataset>_<as-of>.csv` or `.xlsx`.

### 4. Checks

A test, `tests/site/test_documents.py`, opens every generated PDF and workbook and checks:
- the page count is in range, and each file is under 2 MB;
- every font is embedded;
- title, author and subject are set, and the PDF is tagged;
- every chart and table carries a source line;
- the workbook has its three sheets and the cover names a source and an as-of date.

A broken document fails the build. Screenshots: page 1, a chart page and the closing page of each PDF, and the
workbook's cover and data sheets.

## PR 2: R3, Pro and the full file

### 1. What is free and what is Pro

From `RECEIPTS.md`, section 5:

| Part | Access |
| --- | --- |
| Headline, lede, verdict line, the key table, the calls | Free, always |
| The full argument, all tables, history | Free on most days |
| The full file (below `<!-- full-file -->`): the model, the trackers, the full cases, follow-up alerts | Pro |
| A one-page fact sheet, and an alert for the Receipt's next date | Free with an email address |

- The verdict and the calls are never gated.
- A Pro page says what is behind it before it asks for payment.
- Pro also gets the full file as a PDF in the 7e design.

### 2. Signing in

**Recommended: a sign-in link by email, built on what we already have.**
- A reader types their email on `/account`.
- If that email has a live Pro payment in the `payments` table, we email a sign-in link. It works once and lasts
  20 minutes.
- Opening the link sets a signed cookie for 30 days. This is the same signed-cookie mechanism the paid downloads
  use (D-016), with a longer life.
- Email goes through Resend (`lib/mail.ts`), which is already set up. The free tier allows 100 emails a day, which is
  enough until about 1,000 Pro readers.
- No passwords and no new service. We store only the email's hash, the plan and when it ends; the link and the
  cookie are signed with a server-only secret (`PRO_SESSION_SECRET`, a new environment variable you add in Vercel).
- `/account` shows the plan, when it renews, and how to cancel (by email to the desk, until Paystack's own
  management link is wired).

The alternative is Supabase's own email sign-in on the existing project. It works too, but it adds a second login
system beside the paid keys, and its default emails don't carry our design.

### 3. Payment to access

- Pro payments already reach the `payments` table through the Paystack webhook. R3 adds, in migration 0042, one
  database function (`af_pro_status`) that answers "is this email Pro until when", with the same secret-gated pattern
  as the other functions. The migration needs your approval before it is applied.
- The 14-day desk trial (KES 200) counts as Pro for its 14 days.
- Team (five seats) counts as Pro for the buyer's email. The other four seats are added by the desk on request until
  a seat page is worth building.

### 4. The paywall switch

- A new switch, `RECEIPT_PAYWALL`, gates Receipt full files only. The existing `AFRONOMICS_PAYWALL` for briefs stays
  off.
- This changes D-007, so it is recorded in `docs/strategy/decision-log.md` as **D-020**: "Pro paywall on Receipt
  full files only; everything else as D-007."
- **The full file is never shown free by accident.** Until R3 is live, a published Receipt shows its free piece only,
  and the full file says "Coming with Pro" instead of its contents. So Quickmart can publish before R3 without giving
  away the full file.

### 5. Free with an email address

- The fact sheet: one A4 page, made by the 7e script from the Receipt's frontmatter (verdict, tiles, the key chart,
  the calls with their dates, sources). It is emailed, not linked, so it costs an address.
- The next-chapter alert: an email on each call's check date with the outcome, once it is recorded.
- The email goes into the existing `subscribers` table (source `receipt:<slug>`). The alert dates go in one small new
  table, `receipt_alerts` (email hash, Receipt, call id, sent at), in the same migration 0042, following the
  `key_alert_prefs` pattern from migration 0037.

### 6. Checks

- **Tests:**
  - a signed-out reader sees the free piece and the Pro box, never the full file's text, in the HTML or in any API;
  - a Pro reader sees the full file and the PDF link;
  - an expired, reused or tampered link or cookie is refused;
  - a payment for another plan does not unlock Pro;
  - the verdict and the calls are present for everyone;
  - with `RECEIPT_PAYWALL` off, the full file says "Coming with Pro".
- tsc, eslint, `pytest tests/site tests/readers`, build, site QA and the speed budget.
- Playwright run of the journey "LinkedIn reader → Receipt → pay → sign in → full file", using a test payment row
  that is removed afterwards.
- Screenshots at 390px and 1280px, light and dark: a Receipt signed out, the same Receipt signed in, `/account`, and
  the sign-in email.

## What you need to do, and when

| What | Needed for | When |
| --- | --- | --- |
| Approve this plan | Both PRs | Now |
| Create the Paystack Pro plan and add `PAYSTACK_PLAN_PRO` (already on the outstanding list) | R3 payments | Before R3 merges |
| Add `PRO_SESSION_SECRET` in Vercel (I'll give the exact steps; you choose the value) | R3 sign-in | Before R3 merges |
| Approve migration 0042 | R3 | When the R3 PR opens |
| Turn on `RECEIPT_PAYWALL` | R3 live | After R3 merges, on your word |

## Decisions needed from you

1. **Sign-in for Pro readers:**
   - **Recommended:** the emailed sign-in link built on our own signed cookie (section 2), no new service.
   - **Alternative:** Supabase's email sign-in.
2. **Where the PDFs are kept:**
   - **Recommended:** public documents (samples, the index release, the public pack) committed under
     `public/documents/`, the latest edition of each plus its archive. They are small and few. Private Watch packs
     and Pro full-file PDFs go in a private Supabase Storage bucket and are sent as links that expire after 7 days.
   - **Alternative:** everything in Supabase Storage, which keeps the repository lighter but adds a step to every
     public download.
3. **CSV header block:**
   - **Recommended:** browser downloads get the header block; the `/api/v1` API stays unchanged, so no API user's
     script breaks.
   - **Alternative:** a header-free CSV everywhere, with the source and licence only in the Excel cover sheet.
4. **The Friday deep Receipt and Receipts over 1,200 words** (RECEIPTS.md, section 5, says the full argument is Pro
   on these):
   - **Recommended:** not in R3. Gate only the full file for now, so the first Receipts are read as widely as
     possible, and revisit once the desk publishes daily (R4).
   - **Alternative:** apply that rule from the start.
