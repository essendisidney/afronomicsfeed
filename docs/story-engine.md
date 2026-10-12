# Story engine

Three money stories a week, each from a real change in our own data, each checked figure by figure, each published
only after the owner approves it.

## Why

In the 30 days to 12 October 2026 our six "how to read a CBK circular" / "anatomy of a notice" briefs had no recorded
readers. "Kenya's rate cuts: savers lost twice what borrowers gained" had 13, more than any other page on the site. People read
about their own money, in their own currency, with a number in the headline. They do not read about documents.

## The run (Monday, Wednesday, Friday morning)

1. `python scripts/story_finder.py`: writes `data/story_leads.json`, candidate stories best first. Take the top
   lead whose `published` is false. If the top score is under 3, nothing moved enough to be news: stop and say so.
   Never write a weak story to fill the slot.
2. Write `content/briefs/<slug>.md` from that lead **only**. Copy the frontmatter shape of
   `content/briefs/sending-200-dollars-to-kenya-what-it-costs.md`.
   - **Headline:** the number and whose money it is ("Sending $200 home to Kenya: the cheapest service costs $3.14…").
     Never "How to read…", "Anatomy of…" or a headline without a figure.
   - **Opening:** one person and their money, in one or two sentences, then the main figure.
   - **A table** when the lead compares more than two things.
   - **"What it means":** what it means for a saver, a borrower or a sender, in the local currency sum the lead uses.
     Label each paragraph (Facts) or (Analysis).
   - **What to check:** what a reader can check or compare. Never tell anyone to buy, sell, switch or invest, and never
     promise a return.
   - **One link** to the lead's `tool.href`, and the lead's `alert` when it has one.
   - Say so when Afronomics may earn a referral fee from a provider the story names.
   - End with `*Information, not advice.*`. Keep it under 600 words; about 400 is right.
   - Print only figures that appear in the lead's facts, displayed as they are there. Small counts and dates are fine.
     Follow the lead's `notes`.
   - `sources`: the publisher's page from the lead, with a date.
3. `python scripts/story_check.py content/briefs/<slug>.md <lead id>`: fix every problem it lists until it passes.
4. Add `{date, lead, market, slug}` to `data/story_log.json`.
5. `npx next build`, then a phone-width (390 px) screenshot of `/brief/<slug>`.
6. Commit to a new branch (the session's designated branch if it has one, otherwise `story/<slug>`) and open a pull request titled `Story: <headline>`. **Do not merge it.**
   The body holds the full story text, so the owner can read it on a phone, plus a LinkedIn post of under 1,200
   characters: the headline figure, two lines, the link `https://afronomicsfeed.com/brief/<slug>`, and
   "Information, not advice."
7. Tell the owner in this session: the headline, the screenshot, and "Reply **publish** to put it live, or tell me
   what to change."

## When the owner replies

- **publish:** squash-merge the pull request. Wait for the page to answer 200 at
  `https://afronomicsfeed.com/brief/<slug>`, then post the LinkedIn text to the **company page only**: Zapier
  LinkedInCLIAPI `create_company_update`, company_id `110352967`, `allow_reserved_characters` "false". Never the
  personal profile.
- **changes:** edit, run the check again, push to the same branch, and show the new version.
- **skip:** close the pull request and leave the lead unpublished.

## Never

- Never use a figure that `data/health.json` marks late or failed. The finder already leaves those out; do not put them back.
- Never invent, round differently or recompute a number. If a figure you need is not in the lead, leave it out.
- Never rank or praise a provider for pay. The order is by the data alone.
