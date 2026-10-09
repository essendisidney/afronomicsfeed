# Daily LinkedIn posts (AfronomicsFeed company page)

One post each weekday at about 07:25 Nairobi, from the data on main the same morning. Thursday is the T-bill result
(18:13, its own routine). Weekends: nothing.

| Day | Theme | Rotate through (pick the one not used most recently in the log) |
| --- | --- | --- |
| Mon | Africa's money this week | policy rates (data/policy_rates.json → /rates/policy); the Sovereign Bill Index, if the Monday release is out (/markets/bill-index); decisions due in the next 14 days (data/mpc_calendar.json → /rates/policy#calendar) |
| Tue | A money lesson in plain words | one lesson from /learn (English) or a Kiswahili one (content/learn/sw → /learn/sw/<slug>); state one practical point and link the lesson |
| Wed | **Story day**: one new data story, published on the site, then posted | see "Wednesday story" below; "across Africa" topics (Eurobonds, Nigeria/Ghana rates vs bills, remittances, another country's bill auction) are good story material |
| Fri | What it costs you | mobile loan costs (data/kenya/mobile_loans.json → /rates/kenya/mobile-loans); where the shilling earns most / money market funds (data/kenya/rates.json → /rates/kenya, /rates/kenya/money-market-funds); SACCO returns (data/kenya/saccos.json → /rates/kenya/saccos); what readers paid (reader report medians, only items with 3+ reports → /rates/what-readers-paid); always end Friday's post with an invitation to add yours at afronomicsfeed.com/pay |

## Wednesday story

Every Wednesday the routine writes one new brief in content/briefs/<slug>.md and publishes it before posting.

- One surprising, checkable finding from the data on main (data/*.json): a gap, a record, a turn, a comparison
  people have not seen. The title says the finding in plain words ("Kenya's one-year bill pays 0.27 points more for
  four times the wait"), not the topic.
- Same frontmatter as content/briefs/savers-lost-more-than-borrowers-gained.md: title, date, authors
  ["Afronomics Desk"], category brief, labels [Facts, Analysis], topics, institutions, sources (each the publisher's
  own document with its URL and date), asOf, summary, teaser (3 bullets with numbers), gated false, urgency, minutes,
  fileFor, soWhat, unknowns. Body: 300–600 words with short headed sections, a small table where it helps, every
  figure traceable to a source listed, the arithmetic shown, no forecasts or advice, ending with what to watch.
- Do not repeat a story topic from the last 8 weeks of content/briefs/ unless the numbers have changed.
- Publish: branch, PR, squash-merge; wait for the production deploy of that commit (Vercel deployments for the
  commit sha reach READY), then post on LinkedIn with the story link
  (https://www.afronomicsfeed.com/brief/<slug>?utm_source=linkedin&utm_medium=social&utm_campaign=story): 100–180 words,
  the finding first, 3–5 numbers, "What to watch", the link, 3–5 hashtags including #Afronomics.

## Rules

- Every figure comes from a data file on main (or the page built from it) and is checked against it before posting. Say
  whose figure it is (CBK, DMO, CBN, Bank of Ghana, World Bank, the provider). No forecasts, no buy/sell advice, no
  causal claims the data does not show. End with "Information, not advice." where money decisions are discussed.
- 80–180 words. One idea. Open with the number or the question, not with "We". Short lines, at most 5 bullets.
- Link to the page with ?utm_source=linkedin&utm_medium=social&utm_campaign=daily, also passed as submitted_url.
- 3–5 hashtags, always including #Afronomics.
- Do not repeat a topic used in the last 10 posts in the log unless its numbers changed.
- If the data for a topic is stale (older than its normal cycle) pick another topic from the same row.
- Post: Zapier LinkedInCLIAPI create_company_update (tool linkedin_create_company_update), company_id 110352967,
  allow_reserved_characters "false". Never the personal profile.
- After posting, append the date, topic, post URL and the full text to editions/social/log/<YYYY-MM>.md (branch,
  PR, squash-merge), then tell the user it went out with the link.
- Days already planned elsewhere are skipped by the routines: Fri 9, Mon 12 and Tue 13 Oct 2026.
