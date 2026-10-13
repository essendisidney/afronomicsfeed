# The Afronomics voice

How we write for afronomicsfeed.com: briefs, long-reads, explainers, LinkedIn posts and newsletters. It sits on top
of `docs/story-engine.md` (how a data story is found and checked) and `editions/social/DAILY.md` (the posting
rhythm). Where they disagree on a rule of honesty, the stricter rule wins.

The short version: **write like a sharp columnist who happens to hold the spreadsheet.** Every sentence either
tells the reader something true they did not know or helps them use it. Every number can be traced to a file and
a publisher. Anything about the future is labelled as our view, with the dates that will prove us right or
wrong.

---

## 1. Who we are writing for

A saver in Nairobi with KES 100,000 in an M-Pesa-linked fund. A treasurer in Lagos deciding whether to roll
naira bills. A fund analyst in Abidjan comparing UMOA-Titres yields with Accra's. A diaspora nurse in Leeds
deciding where her monthly transfer should sit.

They are busy and numerate. They are not economists. They have been sold things before and can smell it.

**African-first framing.** We start from the reader's own currency and capital, not from London or New York.

- Say "Kenya's government paid 9.04% to borrow for a year", not "Kenyan yields offer EM investors a pick-up".
- Use the local currency first (KES, NGN, GHS, ZAR, EGP, XOF). Give a dollar figure only when the dollar is the point
  (Eurobonds, remittances), or as a second reference.
- "Frontier market", "risk-on", "EM allocators" are London's words for our markets. Use them only when the story is
  literally about foreign investors, and say so.
- Compare African markets with each other before comparing them with the US or Europe. Accra against Nairobi tells
  our reader more than Accra against "global peers".
- Name the central bank and the treasury as institutions with their own calendars and choices, not as weather.

## 2. How we open

Open with **a concrete scene or a number**: one person and their money, or the single figure that made us write
the piece. Never with background, history or a definition.

Good:

> At the Central Bank of Kenya's auction dated 12 October, investors bid KES 50.2bn for three-month bills. The
> government had asked for KES 8bn.

> Two years ago, KES 100,000 in Kenya's one-year Treasury bill earned KES 14,220 after tax. Today it earns
> KES 7,684.

Not:

> Interest rates are an important part of any economy. In recent years, African markets have faced a range of
> challenges...

If the first sentence could open a story about any country in any year, delete it.

The **second paragraph** says why it matters to the reader, in their currency. By the end of the third paragraph
the reader knows the finding, whose money it is, and what we will show them.

## 3. Sentences and words

- **Rhythm.** Mostly short sentences. One idea each. Then a longer one when the idea needs room to turn, so the
  reader feels the change of pace. Never three long sentences in a row.
- **Paragraphs** of one to four sentences. A one-line paragraph is allowed once per piece, for the punch.
- **Plain words.** "Borrow" not "access financing". "Rise" not "experience upward pressure". "Bids" not
  "investor appetite" when we mean bids. "Pay" not "remunerate".
- **Active voice, named actors.** "The Central Bank of Kenya accepted KES 9.6bn", not "KES 9.6bn was accepted".
- **Explain jargon once, on first use, in the same sentence**, then use the word freely:
  "bid cover (the money bid divided by the money the government asked for)". If a term needs more than a clause,
  link the explainer in `/explainers` instead.
- **Numbers.** Two decimals for rates (9.04%), "points" for a change in a rate (fell 0.36 points, never "fell
  0.36%"), "bn" and "m" for amounts (KES 8bn). Dates as "12 October 2026"; the weekday when it helps.
  Spell out one to nine in prose unless it is a figure in a table or a measurement.
- **Tables** when we compare more than two things. Every table has a date and a source line under it.
- **No adjectives doing a number's job.** Not "a sharp fall": "a fall of 4.5 points". If the number is not
  impressive on its own, the adjective will not save it.

## 4. Facts, analysis and our view

Every paragraph is one of three things, and the reader must be able to tell which:

| Kind | What it is | How we mark it |
|---|---|---|
| **Fact** | A figure or event from a publisher's own document, in our data files | Stated plainly, with the publisher named; the source is in the frontmatter `sources` |
| **Analysis** | What the facts mean, reasoned openly from them | "(Analysis)" in briefs; in long-reads, phrasing such as "That suggests...", "Read together, ..." |
| **Our view / scenario** | What we think could happen next | Always labelled: "Our base case", "Scenario", "Our view". Never in the indicative mood as if it were fact |

Briefs keep the `labels: [Facts, Analysis]` frontmatter and label paragraphs. Long-reads may label sections
instead of paragraphs, but a forecast is never unlabelled.

## 5. Writing about the future honestly

Readers come to us because we look ahead. That is only worth something if we are honest about how we look.

**Every forward-looking section has the same shape:**

1. **Where we start** — today's figures, dated and sourced.
2. **Base case** — what we think is most likely, in one or two sentences, with the reasoning.
3. **Upside and downside** (or "higher" and "lower" when "upside" depends on whether you are a saver or a
   borrower — say whose upside). Each is a plausible path, not a strawman.
4. **Signposts** — the dated events and the specific numbers that would tell a reader which path we are on:
   "If the one-year bill clears above 10% at any auction before the next MPC..." Use real dates from
   `data/mpc_calendar.json` and auction calendars. If a date is not published, say so; do not guess one.
5. **What would make us wrong** — one line.

Rules:

- **No invented probabilities.** Do not write "a 60% chance". Write "our base case" and "less likely".
- **Scenario numbers must come from somewhere a reader can check**: a level the series has actually reached
  (with its date), or a stated rule ("we assume the move happens evenly over the year"). Show the rule in the
  "How we worked this out" box.
- **Headlines and deks never state a forecast as fact.** "Where rates are heading" is a question the piece
  answers with scenarios; "Rates will fall" is banned.
- Scenarios about money end with **"Scenarios, not advice"** or **"Information, not advice."**
- When a scenario plays out (or does not), write the follow-up. Grading our own calls in public is the point.

## 6. Headlines and deks

- **The headline carries the finding and, where possible, a figure and whose money it is.**
  "Kenya's rate cuts: savers lost twice what borrowers gained". Not "How to read...", "Anatomy of...",
  "Everything you need to know about...".
- **The body must pay off every word of the headline in the first three paragraphs.** If the headline promises
  "KES 7,680", that figure and how we got it appear early. If we cannot pay it off, rewrite the headline.
- **The dek** (summary) is one or two sentences: the second finding plus what the piece will give the reader
  (a table, three scenarios, the dates to watch).
- Curiosity is fine; deception is not. A question headline is allowed only if the piece answers it.
- No "shocking", "you won't believe", "here's why", "this changes everything", no all-caps, no emoji in headlines.
- Length: aim for under 90 characters; a colon split ("Africa's borrowing bill: ...") is house style.

## 7. What we never do

- **Never invent.** No invented figures, quotes, people, sources, dates or "a trader told us". If we did not
  read it in a publisher's own document or our own data, it does not go in.
- **Never use a figure `data/health.json` marks late, failed or gap**, and never recompute or re-round a
  published figure differently from the data file.
- **No unsourced claims.** "Analysts expect..." needs a named analyst and a link, or it is cut. "Markets are
  pricing..." is analysis and is labelled as ours.
- **No investment advice.** We never tell a reader to buy, sell, switch, invest or hold, never promise a return,
  and never rank or praise a provider for payment. We show the numbers and what to check. Every piece about
  money decisions ends "*Information, not advice.*"
- **No hype.** No "boom", "crash", "soaring", "plunging", "skyrocketing" without the number that justifies the
  word, and usually not even then.
- **No clickbait the body does not pay off.**
- **No causal claims the data cannot show.** Our auction files show what was bid and accepted, not who bid or
  why. Say "investors bid less for the one-year bill", not "investors fear inflation", unless a publisher says so.
- **No AI-sounding filler.** See the banned list below.

### Banned phrases

Cut on sight. If a sentence needs one of these to stand up, the sentence has nothing in it.

- "In today's fast-paced world" / "in an ever-changing landscape" / "in the ever-evolving world of"
- "delve", "dive into", "let's dive in", "deep dive", "unpack"
- "navigate" (anything other than a road), "navigating the complexities"
- "landscape", "ecosystem", "tapestry", "realm", "paradigm", "synergy"
- "it's worth noting that", "it is important to note", "notably", "interestingly"
- "plays a crucial/pivotal/vital role", "a testament to", "stands as a"
- "game-changer", "unlock", "unleash", "leverage" (as a verb), "harness", "empower", "robust", "seamless"
- "not just X, but Y" / "it's not about X, it's about Y" constructions
- "In conclusion", "In summary", "Ultimately", "At the end of the day"
- "Moreover", "Furthermore", "Additionally" at the start of consecutive sentences
- "Here's the thing", "buckle up", "spoiler alert", "the elephant in the room"
- "Africa is rising", "the next frontier", "untapped potential", "the African market" (there are 54)
- "Experts say", "analysts believe", "observers note" — without names and links
- "Only time will tell", "remains to be seen" — say which date will tell
- "a perfect storm", "a double-edged sword", "a wake-up call"

## 8. Structure of a long-read (900–1,400 words)

1. Opening scene or number (Section 2).
2. The finding in one paragraph, in the reader's currency.
3. The evidence: a table and two or three short sections with plain headings that say what they show.
4. "What it means" for named readers: savers, borrowers, funds, treasurers.
5. Scenarios: base case, higher, lower, with signposts and dates (Section 5).
6. What to watch: a short dated list.
7. **"How we worked this out"** box: every figure, its data file and publisher, and the arithmetic, so a reader
   with our CSV and a calculator gets the same answer.
8. One or two links to our own pages where the reader can check the live numbers.
9. "*Information, not advice.*"

Briefs follow `docs/story-engine.md` (about 400 words, under 600).

## 9. Bylines

- **"Afronomics Desk"** on everything the desk writes, including pieces drafted with software and checked by
  an editor.
- The founder's name only on pieces the founder wrote or substantially rewrote. Never put a person's name on a
  piece they did not write, and never invent a byline.
- Guest pieces carry the guest's real name and role, and are labelled **Opinion**.

## 10. Corrections

- If a figure, date, name or attribution is wrong, we fix it in the piece **and** log it in `lib/corrections.ts`
  (shown at `/corrections`): date, piece, what was wrong, what was corrected, editor.
- A correction follows the same checks as the original (`scripts/story_check.py` where it applies).
- We do not quietly edit. We do not delete a piece to avoid correcting it.
- If a scenario we published turns out wrong, that is not a correction — it is a follow-up story, and we write it.

## 11. A last check before anything goes out

Read it aloud. Then ask:

1. Does the first sentence contain a person, a place or a number?
2. Can every figure be traced to a file in `data/` and a publisher's document?
3. Is every forecast labelled, with a dated signpost?
4. Does the body pay off the headline in the first three paragraphs?
5. Would a careful reader in Nairobi, Lagos or Abidjan feel spoken to, not spoken about?
6. Is there a banned phrase, a buy/sell instruction or a promise of return? Remove it.
7. Does it end "*Information, not advice.*"?
