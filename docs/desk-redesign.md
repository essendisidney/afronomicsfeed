# The desk, redesigned for 8am (13 Oct 2026)

The founder said: "I still feel like we're not getting enough from the desk." This page is the audit of `/desk` as it
stood on 13 Oct 2026, read as the founder would read it at 8am on a phone (390 px) and on a laptop (1280 px), and
the plan that the rebuild follows.

## 1. Audit: what each panel answered, what was missing, what was noise

The old desk was 20 panels long, about 14 phone screens. The first screen held eight traffic tiles. The first thing
the founder must act on (a follow-up due today, a pilot to ask for payment, a payment whose access was not sent)
first appeared on screen 5 or later, if at all.

| # | Panel (old order) | Question it answered | Verdict at 8am |
|---|---|---|---|
| 1 | Eight tiles: views, returning, LinkedIn, subscribers, alert sign-ups, downloads, API calls, leads | "Is traffic up?" | **Noise for the morning.** Vanity counts first; none is a D-004 number. Leads count gave no hint which lead is waiting. |
| 2 | Command centre: collected / recurring / contracted / pipeline; six milestone bars to USD 1m | "How far from USD 1m a month?" | Useful once a week. The four-number split (collected vs signed vs pipeline) is right. Six progress bars at 0.00% are noise until the first payment. **No "today" or "last 7 days" money.** |
| 3 | Command centre: pipeline by stage table, pilot list, deal list, a 12-field Save deal form | "Where are the deals?" | **Missing the board.** A flat list sorted by stage; next step buried in grey text; overdue dates not flagged; to move a deal one stage you had to retype its number into a 12-field form. Duplicated in panel 4. |
| 4 | Funnel: visitor → payment, 7/30 d; moments that matter; deals by stage chips; next follow-ups; key usage; surveys | "Is the funnel moving?" | Good numbers, wrong place: the **follow-ups** and the **"when to ask for payment"** flag (a pilot day turning red) are the most actionable things on the desk and sat mid-page inside a reference panel. No "days used" per key, so the D-004 test ("3 pilots used on 5+ days") could not be read anywhere. |
| 5 | Strategy board: model vs reality, moat, status board, decisions waiting | "Are we on plan? What must I decide?" | Model vs reality and the status board are weekly reading. **Decisions waiting** was a hand-kept list of six asks that did not match the founder decisions F1–F11 in the master plan and the partners paper. |
| 6 | Money panel: tiles, by product, two funnels, referrals | "What sold?" | Duplicates panel 2 and 4. Fine as reference; not a morning panel. |
| 7 | Data health: late/failed figures | "Is any data wrong?" | Right question; no latency (data/latency.json is not written yet), no count of OK figures, so "5 late" had no denominator. |
| 8 | People, not page views (3 tables) | "Who came, from where, did what?" | Reference. |
| 9 | Payments list with "mark access granted" | "Did someone pay, and did they get access?" | **Critical and buried.** A payment with access not sent is the desk operator's first escalation; here it was a small red link on screen 8. |
| 10 | API keys with issue / revoke | "Who has a key?" | Duplicates the funnel key table; no expiry, no days left. |
| 11 | Corrections, press list forms | Admin | Rare; fine at the bottom. |
| 12 | Views 30 d bars, LinkedIn 90 d, top pages, referrers, downloads/API/embeds | Traffic detail | Reference. **No answer to "did yesterday's post or story bring anyone?"**: LinkedIn visits were by page, not by post or campaign, and stories were not listed at all. |
| 13 | Latest leads, latest feedback, reader stories, reader prices | "What came in?" | **The inbox, scattered over four lists**, none with "handled", so every morning re-reads the same items. Invoice requests and pilot requests were indistinguishable from other leads. Survey notes sat in panel 4. |
| 14 | Pipelines: is the data fresh? | Data freshness | Reference; overlaps panel 7. |

### What was missing entirely

1. **A "today" answer.** Money today / 7 d / 30 d, the D-004 gate (contacts /25, pilots used on 5+ days /3, first
   payment) and a short list of what needs the founder today.
2. **Escalations from the routines.** The sales operator writes `ESC` lines in deal notes and sets `next_step` to
   "Founder: …" (`docs/sales/sales-operator.md` §5); nothing on the desk surfaced them.
3. **Settings and migrations not in place.** `PAID_KEY_SECRET` (security review L-5) and `DOWNLOAD_SECRET` are
   founder actions; the desk could not say whether they were set.
4. **One-click pipeline moves** and a note per deal.
5. **"Mark handled"** for anything that came in.
6. **Content to traffic**: what was published in the last 7 days and what it brought, by utm campaign.
7. **Routines**: which scheduled routines run, when, and that their live status is not visible from the site.

### Phone vs laptop

- At 390 px, the old desk had wide tables (key usage, 7 columns) inside horizontal scroll regions and long forms
  open by default. The page itself did not scroll sideways, but the first screen was all traffic.
- At 1280 px the order was the same; the laptop just showed more traffic tiles per row.

## 2. The rebuild: one page, ordered by what needs the founder first

Top to bottom. Every panel answers one question.

| Order | Panel | The question | Data |
|---|---|---|---|
| 1 | **Today** | "Did we make money, are we passing D-004, and what three things need me today?" | `af_desk_today` (new, 0040) or `af_payments` + `af_desk_money`; deals; `af_api_keys_list`; env presence |
| 2 | **Pipeline** | "Where is each deal, what is next, and when?" One-click stage move, note, new deal. | `af_deals_list`, `af_deal_save` |
| 3 | **Inbox** | "What came in that I have not dealt with?" Newest first; mark handled. | `af_desk_inbox` / `af_desk_handle` (new, 0040), or `af_desk` + `af_desk_funnel` read-only |
| 4 | **Pilots and keys** | "Who is using a key, how much, how long is left, who do I ask for payment?" Revoke; extension steps. | `af_desk_funnel`, `af_api_keys_list`, `af_desk_today.key_days` |
| 5 | **Content** | "What did we publish this week and did it bring anyone?" | `data/story_log.json`, `editions/social/log/*.md`, `af_desk_today.campaigns` / `af_desk_audience` |
| 6 | **Data health** | "Is any figure late or wrong; how fast are we?" | `data/health.json`, `data/latency.json` when present, file freshness |
| 7 | **Routines** | "What runs on its own, and when?" (static; live status not visible server-side) | this page, master plan §6, sales operator |
| 8 | **Decisions waiting** | "What only I can decide?" F1–F11 with status. | `lib/desk/decisions.ts` (from the decision log, master plan §7, partners paper §3.4) |
| 9 | Reference (collapsed) | Command centre, funnel, strategy board, money, people, payments, traffic, reader reports, admin forms | unchanged functions |

### "Needs you today" rules (in this order)

1. A real payment whose access has not been sent (`access_sent_at` empty). Mark access granted inline.
2. Escalations: open deals whose `next_step` starts with "Founder" or whose newest note line holds `ESC`.
3. Follow-ups overdue or due today (`next_date <= today`), open deals only.
4. Inbox items not handled from the last 7 days (pilot requests and invoice requests first).
5. Pilots to ask for payment: a trial key in its last 7 days (or past day 23) with calls in the last 7 days, or used
   on 5+ days. Pilots to nudge: no calls 7 days after issue.
6. Setup: migration 0040 not applied; `PAID_KEY_SECRET` or `DOWNLOAD_SECRET` not set (presence only, never the value);
   `PAYSTACK_SECRET_KEY` not set.

The strip shows the count per rule and the first three items; each links to its panel.

### What stays the same

- The HttpOnly desk session (`/desk/session`), the same-origin check on `/desk/actions`, the cron-secret gate on every
  function. No email is logged; the new action handlers log nothing.
- Collected, contracted, pipeline and model stay separate and are never added together.
- `preview-empty` (development only) still opens the desk with no data.

### Migration to apply

`supabase/migrations/0040_desk_today.sql` (not applied): table `desk_handled`, functions `af_desk_today`,
`af_desk_inbox`, `af_desk_handle`. Safe at any time; the desk works without it and says so in "Needs you today".
