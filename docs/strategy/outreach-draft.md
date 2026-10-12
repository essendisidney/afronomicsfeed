# Outreach draft: frontier local-debt pilot (for the founder's approval; nothing has been sent)

Status: DRAFT. The founder approves the wording and sends each note personally, from their own address or
LinkedIn. Nothing here goes out automatically. Contacts are the 55 prospects in the desk's deal log (stage
"prospect"); mark a deal "contacted" when the note goes.

## Who first (10)

Ninety One, Allan Gray (Africa ex-SA Bond Fund), William Blair (EM Frontier Debt), Ashmore (Frontier Blended),
Global Evolution, TCX, AfDB AFMI, Standard Bank CIB, Absa CIB, MCB Group. Address the named portfolio manager or
analyst for the African local-debt fund where public; otherwise the EM debt team lead.

## The note (about 120 words)

Subject: African local-currency auction data, checked and same-day (30-day pilot)

> Dear {first name},
>
> With GBI-EM Edge putting about 44.5% of its weight on Africa, I thought this might be useful to your
> {fund name} team.
>
> Afronomics reads primary government debt auction results from African central banks and treasuries and
> publishes them in one format within hours: amounts offered, bid and accepted, the rate, bid-to-cover and the
> ISIN, each linked to the issuer's own notice. Bond auctions now cover Nigeria, Egypt, Morocco, Kenya, Uganda,
> Zambia and the eight WAEMU markets including Côte d'Ivoire (Nigeria back to 2013, Egypt to 2005), with bills in
> ten markets.
>
> Would a free 30-day pilot be useful: an API key, full history and alerts? The markets you choose decide what
> we build next.
>
> {founder name}, Afronomics · afronomicsfeed.com/data/frontier-local-debt

Rules: no performance claims and no advice; every figure in the note must be on the live page that day.

## Sample pack (attach on reply, not cold)

1. CSV: the last 12 months of bond auctions for the markets the prospect names (from `/api/v1/bonds/{market}`),
   plus bills from `/api/v1/tbills/{market}`.
2. A two-page monitor (PDF): for each market, the latest auctions, bid-to-cover against its 12-month range, the
   next expected auction, and sources. Generate it on request; do not send unverified figures.

## Follow-up

One follow-up after 7 working days, then stop. Log each reply in the desk (stage, next step, date). A pilot
starts when a trial key is issued on the desk (plan "trial").

## Test (from D-004)

25 qualified contacts by week 2 (at least 5 replies); at least 3 pilot keys and 2 weekly users by week 4; at least 1
payment by week 8. Kill if there is no pilot after 25 contacts.
