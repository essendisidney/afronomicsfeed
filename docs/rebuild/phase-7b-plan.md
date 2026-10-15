# Phase 7b plan: a site readers come back to, and a desk that shows everything

Written 15 Oct 2026 after the founder's note: the site is not yet appealing; make it customer friendly and
something readers get excited to open; add more stories; the desk does not capture everything.
**Status: approved 15 Oct 2026 with the recommended answers.** Each part is its own PR, merged only on approval.

Founder's answers on 15 Oct:
- **Look:** closest to **Stears and Semafor**.
- **Desk:** missing all four of money and sales, readers and traffic, content and stories, and data and site health.

## Order

| Part | What | Why first |
| --- | --- | --- |
| **7b-1** | The desk cockpit | Small and quick; you see the business every morning from day one |
| **7b-2** | Sharing everywhere | Every page easy to share, with a preview that shows the number or the verdict |
| **7b-2b** | The design preview, no merge | You choose the look on real pages before it is built |
| **7b-3** | The new look across the site | Built from the preview you choose |
| **7b-4** | Reasons to come back | The habits: calls you can play, follow a subject, what changed since your last visit |
| **7b-5** | More stories | Three Receipts a week from our own data, plus your story ideas |

R3 (Pro sign-in and the full file) moves after 7b-4, so readers arrive at the new site before we ask them to pay.

## 7b-1. The desk cockpit

Today the desk has the right numbers, but most sit folded under "Reference". The new top of the desk is four lanes,
each with a green, amber or red light, the three numbers that matter and the next action. Everything else stays
below, unfolded on demand.

| Lane | What it shows | Red when |
| --- | --- | --- |
| **Money and sales** | Paid this month, all time, against the USD 1m path; pipeline by stage; trials and pilots ending this week; who to chase today | A trial ends in under 3 days with no follow-up, or a payment failed |
| **Readers and traffic** | People today, 7 and 30 days, against last week; top pages; where they came from (LinkedIn, Google, email); sign-ups and the email-to-Pro step | Visitors down more than 30% on the week, or no sign-up in 3 days |
| **Content and stories** | Receipts published, drafts waiting for you, calls due in the next 14 days, your story ideas queue, what the desk agents are writing | No Receipt in 2 days, or a call is overdue |
| **Data and site health** | Every source's age (for example, Malawi bills 16 days old today), failed workflows, the last site QA and speed results, the Morning note's send time | A source is past its normal gap, a workflow failed twice, or site QA is red |

- **New data for the lanes:**
  - a small job writes the latest GitHub Actions results to `data/ops.json`, so the desk can show failed workflows;
  - the rest is already in Supabase and `data/health.json`.
- **Story ideas box:** on the desk you type a subject and a line ("Equity Bank results, compare with KCB"); it lands in a
  queue that the content lane shows and that I write from (7b-5).
- **On the phone:** the four lights first, in one screen.

## 7b-2. Sharing everywhere

Added 15 Oct at the founder's question: "how do we ensure sharing of our work to social sites is easy all around the
website". Today a share bar exists (WhatsApp, LinkedIn, X, Facebook, Telegram, email, copy link, the phone's own share
sheet) but it is on about a dozen pages only. Receipts, the record, the casebook, market pages and Today's number tiles
have none. Every page also shares the same site-wide preview image, so a Receipt posted on LinkedIn or WhatsApp shows
neither its verdict nor its number.

1. **A share bar on every page people would share:**
   - each Receipt: under the verdict and again at the end;
   - each casebook case, each market and rates page, and `/record` (one call at a time);
   - the number tiles on Today.
   The phone's own share sheet comes first on phones, so WhatsApp is one tap.
2. **A preview card made for each page.** When a link is pasted into LinkedIn, WhatsApp, X or Facebook, the preview
   shows that page's own headline figure, drawn by the site at the moment it is shared. Every card carries the source
   and the date, and is checked so it fits each network's crop.
   - **A Receipt:** the verdict line and its key number.
   - **A market page:** the latest rate and its change.
   - **A call:** the call and its due date.
3. **Share a single number or chart.** Every number tile and chart gets a small share button, which makes an image of
   that figure with its source and date for WhatsApp or LinkedIn.
4. **Share a line.** In a Receipt, selecting a sentence offers "Share this line", with the link to that paragraph.
5. **The words come ready.** Each network gets its own text: short for WhatsApp, longer for LinkedIn, under 280
   characters for X, and in Kiswahili on Kiswahili pages.
6. **We can see what shares bring.** Every shared link carries its network and page, so the desk's readers lane shows
   which shares bring readers and sign-ups.
7. **Checked on every change.** Site QA fails a page that is missing its share bar, its title, its description or its
   preview card, or whose card is the wrong size.

## 7b-2b. The design preview (no merge)

Built on a preview branch with live data:
- **Pages:** Today, the Quickmart Receipt and a market page, each at phone and laptop size.
- **Two looks to choose from:** both are in the Stears and Semafor spirit and keep Source Serif headlines and our tabular figures.

**Look A, "Paper":**
- warm off-white paper, ink-black type and a strong signature colour per section (markets, banking, companies, public money, cost of living, Africa);
- big typographic covers, no stock photos;
- a magazine grid on laptop.

**Look B, "Night desk":**
- a deep navy masthead and live-number strip, with white story cards under it;
- a bolder jacaranda for actions;
- the feel of a trading-floor briefing.

**Common to both:**
- **Semafor's structure for every Receipt:** The news · The numbers · Our view · The other side · What would change our mind. Each block has its own label and colour, so a reader can skim it in 20 seconds.
- **Stears' data cards:** one big number, a short line on what it means and a small chart, shareable as an image on LinkedIn and WhatsApp.
- **Motion:** only where it helps, such as numbers counting into place and a live dot on figures from today. Readers who ask for less motion get none.

You pick A or B (or "A with B's masthead"). I build only the one you pick.

## 7b-3. The new look across the site

The chosen look on every page, including the documents from 7e. The checks:
- same speed budgets as now (largest content 2.5 s on a phone, layout shift 0.1, script 175 KB);
- the full site QA at 390px and 1280px, light and dark;
- screenshots of every changed template, before and after.

## 7b-4. Reasons to come back

Each gives a reader a reason to open Afronomics again tomorrow. None is a gimmick: every one rests on real data.

1. **"Call it" before every Kenya auction.**
   - What a reader does: enters their guess for Thursday's 91-day, 182-day and 364-day rates before bids close; on Thursday evening the result comes in.
   - How it's scored: each guess against the CBK result and against our own published range.
   - The board: a weekly and all-time leaderboard of first names or handles, which readers choose to show.
   - What it needs: only an email address, so it also grows the Morning list.
2. **What changed since your last visit.**
   - A strip on Today: "Since Tuesday: 364-day bill −3 bps, Quickmart offer closes in 6 days, 1 new Receipt."
   - It is kept in your browser, with no sign-in.
3. **Follow a subject.**
   - Readers can follow a company, a market or a series ("Quickmart", "Kenya bills").
   - Followers get an email the day something changes on it.
   - This uses the existing alerts tables.
4. **Countdowns on Today.** The next dates that matter, each with our call beside it ("6 Nov: Quickmart offer results. Our call: demand below 150%").
5. **The Friday quiz.** Five questions from the week's numbers. Your score shows against everyone else's, and it's shareable on LinkedIn.
6. **Share cards:** built in 7b-2 (sharing everywhere).

## 7b-5. More stories

- **Three Receipts a week from our own data**, until the R4 desk agents take over. Each goes through the same checks as Quickmart, and you approve it with one tap (D-019). The first three:
  1. this Thursday's T-bill auction;
  2. money market fund yields after the rate cuts;
  3. whatever is top of your ideas queue.
- **Your ideas:** anything you put in the desk's ideas box, I research and draft.

## Decisions needed from you

1. **Order:**
   - **Recommended:** as above (desk first, then the preview, the look, the habits and stories, then R3).
   - **Alternative:** R3 first, to start charging sooner.
2. **"Call it" leaderboard names:**
   - **Recommended:** a handle the reader chooses, shown only if they opt in.
   - **Alternative:** no public leaderboard, only the reader's own score.
3. **Stories this week:**
   - **Recommended:** the three above, starting with Thursday's auction.
   - **Alternative:** you name the first three.
