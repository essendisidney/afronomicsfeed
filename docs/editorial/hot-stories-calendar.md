# Hot stories calendar

The stories most likely to be read to the end and shared, planned against dates we already know. The story engine
(docs/story-engine.md) and the daily LinkedIn routine (editions/social/DAILY.md) read this file **first**: when a dated
hook below falls in the next 3 days and its figures are on main, it takes the slot ahead of the finder's top lead.
Every rule in those two files still applies: checked figures only, a number in the headline, no advice, no figure we
cannot source. A story that fails a check is not published, however hot.

## What spreads, and why (our own numbers)

- The best-read page in the 30 days to 12 October was "Kenya's rate cuts: savers lost twice what borrowers gained":
  a number, whose money it is, and a twist. Explainers about documents had no recorded readers.
- People share a figure about **their own** money that they can repeat at the table: "KES 20,000 buys 2,666 Quickmart
  shares", not "IPO valuation multiples".
- A deadline makes a story urgent: "closes Friday", "lists Thursday", "payday this week".
- A scoreboard is the most shareable thing we own: "We said X on 15 October. Here is what happened." Win or lose, we
  publish the grade (/record).

## Headline patterns that work (fill only with checked figures)

| Pattern | Example shape |
| --- | --- |
| Your sum, their number | "KES {amount} in {product} now earns KES {x} a year less than in {year}" |
| Two prices, one thing | "{Country A} pays {x}% to borrow for a year; {Country B} pays {y}%" |
| Deadline + calculator | "{Offer} closes {day}: what KES {amount} buys, and what it pays" |
| Where it went | "Of KES {total} collected, KES {x} went to {use}" |
| We called it | "On {date} we said {call}. The result: {outcome}" |
| Payslip | "On KES {gross} a month, {deduction} takes KES {x}; your take-home falls KES {y}" |

Never: "You won't believe", "shocking", a question with no number, or a figure that is not in the source.

## The week, every week

| Day (Nairobi) | Slot | What goes out |
| --- | --- | --- |
| Mon 07:25 | Story engine + LinkedIn | Africa's money this week; any dated hook from the calendar below |
| Tue 07:25 | LinkedIn | One money lesson, linked to /learn |
| Wed 07:25 | Story engine + LinkedIn | **The hot story of the week**: the strongest dated hook, or the finder's top lead |
| Thu 18:13 | T-bill result | Weekly T-bills, with the shilling sum for KES 100,000 |
| Fri 07:25 | Story engine + LinkedIn | What it costs you; end with "add yours at afronomicsfeed.com/pay" |
| Any day | Receipt auto-post | Each newly published Receipt, one per run |

The home page rotates on its own every 3 hours (lib/rotation.ts), so each new story also gets turns as the lead.

## Dated hooks, 19 October to 18 December 2026

Dates come from our published Receipts' timelines and calls, data/mpc_calendar.json and the public holiday list.
Re-check each date against its source the day before.

| Date | Hook | Story or post | Tool / page | Status |
| --- | --- | --- | --- | --- |
| Mon 19 Oct | Dangote closes in 8 days | "What KES {amount} buys in the Dangote offer, and the custody fee" | /markets/ipo-calculator | Ready (Receipt published) |
| Tue 20 Oct | Mashujaa Day (holiday) | No post | | |
| Thu 22 Oct | T-bill result | Weekly T-bills | /markets/kenya-tbills | Routine |
| Mon 26 Oct | Dangote closes tomorrow | Deadline post: the 3 numbers from the Receipt | /receipts/2026-10-15-dangote-refinery-ipo | Ready |
| Tue 27 Oct | **Dangote offer closes** | "Closed today: what we will grade on 20 November" | /record | Ready |
| Wed 28 Oct | Payday week | **Payslip story**: what PAYE, SHIF and the Housing Levy take from common salaries | /rates/kenya/net-salary | Needs story engine |
| Thu 29 Oct | Malawi rate decision | "Across Africa" line in the T-bill post, only if the decision is out | /rates/policy | Check calendar |
| Fri 30 Oct | **Quickmart offer closes** | "Last day: KES 20,000 buys 2,666 shares; the dividend pays less than a bill after tax" | /markets/ipo-calculator | Ready |
| Wed 4 Nov | Hot story | Strongest finder lead (week of no dated hook) | | Story engine |
| Fri 6 Nov | **Quickmart results** | **Scoreboard**: "We said demand would come in below 150%. It came in at {x}%" | /record | Grade on the day |
| Thu 12 Nov | **Quickmart lists** | Listing-day scoreboard: first-day close against KES 7.50 (our 10% call) | /record | Grade at close |
| Wed 18 Nov | Ghana rate decision | "Ghana vs Kenya: what a one-year bill pays" (if the decision is out) | /rates/policy | Check calendar |
| Thu 19 Nov | South Africa rate decision | Line in the T-bill post | /rates/policy | Check calendar |
| Fri 20 Nov | **Dangote Kenyan allotment** | **Scoreboard**: Kenyan applications against the KES 39 billion target | /record | Grade on the day |
| Wed 25 Nov | Payday week | "What your November payslip paid for" (only if a rate changed; otherwise skip) | /rates/kenya/net-salary | Story engine |
| Fri 27 Nov | Black Friday | **What it costs you**: Fuliza and mobile loans as a true yearly rate | /rates/kenya/mpesa-charges, /rates/kenya/loan-cost | Ready (Fuliza Receipt published) |
| Early Dec | CBK rate decision | "What the CBK decision means for KES 100,000 saved and KES 1m borrowed" | /rates/policy | Date per CBK |
| Mon 7 Dec | School fees in January | "Saving KES {fees} by January: what to put away each week" | /rates/kenya/savings-goal | Ready |
| Tue 8 Dec | KQ cautionary notice deadline | "Renewed or withdrawn?" follow-up on the Kenya Airways Receipt | /receipts/2026-10-15-kenya-airways-bailout-bill | Check KQ's notice on the day |
| Sat 12 Dec | Jamhuri Day | No post | | |
| Fri 18 Dec | **Dangote listing** | **Scoreboard**: listed on the Nigerian Exchange by today, as called? | /record | Grade on the day |

## Held, publish only when cleared

Fuliza's true cost and the Kenya Airways bailout bill were published and posted on 17 October 2026 (D-027).

- Safaricom stake sale: waiting on the judgment and an advocate's review. When it is cleared, it takes the next
  Wednesday slot.

## Receipts still to post on LinkedIn

The Receipt auto-post routine posts one a run, oldest first: Housing Levy money trail, record infrastructure bond,
SACCO savings at risk, the shilling that stopped falling.
