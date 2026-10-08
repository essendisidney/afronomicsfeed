# Daily LinkedIn posts (AfronomicsFeed company page)

One post each weekday at about 07:25 Nairobi, from the data on main the same morning. Thursday is the T-bill result
(18:13, its own routine). Weekends: nothing.

| Day | Theme | Rotate through (pick the one not used most recently in the log) |
| --- | --- | --- |
| Mon | Africa's money this week | policy rates (data/policy_rates.json → /rates/policy); the Sovereign Bill Index, if the Monday release is out (/markets/bill-index); decisions due in the next 14 days (data/mpc_calendar.json → /rates/policy#calendar) |
| Tue | A money lesson in plain words | one lesson from /learn (English) or a Kiswahili one (content/learn/sw → /learn/sw/<slug>); state one practical point and link the lesson |
| Wed | Across Africa | Eurobond yields, Nigeria and Kenya (data/eurobonds.json → /markets/eurobonds); Nigeria or Ghana bank rates vs bills (data/nigeria|ghana/bank_rates.json → /rates/nigeria/check, /rates/ghana/check); cost of sending money home (data/remittances/corridors.json → /rates/remittances); one other country's latest bill auction (data/<country>/tbill_auctions.json → /markets/tbills/<country>) |
| Fri | What it costs you | mobile loan costs (data/kenya/mobile_loans.json → /rates/kenya/mobile-loans); where the shilling earns most / money market funds (data/kenya/rates.json → /rates/kenya, /rates/kenya/money-market-funds); SACCO returns (data/kenya/saccos.json → /rates/kenya/saccos); what readers paid (reader report medians, only items with 3+ reports → /rates/what-readers-paid); always end Friday's post with an invitation to add yours at afronomicsfeed.com/pay |

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
