# Proposal template

For the sales operator and the founder. Fill one copy per prospect (as a Gmail draft or a PDF the founder sends),
never in this file. **Rules:** every price is copied from `lib/billing/ratecard.ts` on the day of sending; every
coverage fact is copied from `/data/frontier-local-debt` the same day; no feature that is not live; no customer
names; no discount. A proposal with Enterprise, custom scope, non-standard terms or a local price outside Kenya is
**drafted by the agent and sent by the founder only**. Delete every instruction in *italics* before sending.

---

**Afronomics Data — proposal for {{organisation}}**
Prepared for {{contact_name}}, {{contact_title}} · {{date}} · Valid for 30 days · Reference {{proposal_ref}}
*(proposal_ref = `P-<deal id>-<YYYYMMDD>`)*

## 1. What you told us

*(Two or three sentences in their words from discovery: the markets, what the data feeds, who uses it, the decision
date. No adjectives.)*

{{organisation}} needs {{need}} for {{markets}}, used by {{users}} for {{use}}. The decision is due by {{decision_date}}.

## 2. What we propose

| | |
|---|---|
| Plan | {{plan_name}} *(Analyst / Team and API / Enterprise / Investment Committee Pack / Startup licence / Branded widget)* |
| Users or teams | {{users_count}} *(Analyst is per user)* |
| Markets in scope | {{markets}} — *(copy the status for each from the product page, e.g. "Egypt: bond auctions from 2004, bills from 2002")* |
| Delivery | {{delivery}} *(Team and API: API key, JSON and CSV, full history, Treasury-bill result alerts, bond-result email alerts, usage reporting, a named contact. Analyst: web tables and full-history downloads, no API. Do not list webhooks, Excel add-in, Python client, SFTP or Snowflake.)* |
| Start | {{start_date}} |
| Term | Monthly, renewing by payment; cancel any time before the next period *(Enterprise: as agreed by the founder)* |

**Not included:** *(state the gaps that matter to them, honestly)* e.g. "Tunisia, Angola, Ghana bonds and South Africa
bonds are not covered. Uganda bond history starts in November 2024; Zambia and Morocco in December 2025. We publish
primary-auction results, not secondary prices or curves."

## 3. Price

*(Copy exactly. One plan only, or two side by side if they are choosing between Analyst and Team and API.)*

| Plan | Price | Charged at checkout | Invoice |
|---|---|---|---|
| {{plan_name}} | {{plan_price}} *(e.g. USD 1,500 a month)* | {{plan_charge}} *(e.g. KES 193,500, card, M-Pesa or Pesalink, at KES 129 to the dollar)* | {{invoice_currency}} *(USD or KES; issued by the founder)* |

*Local-institution price (D-014): only after the organisation has confirmed all four eligibility points in writing;
add the line "This price applies because {{organisation}} has confirmed it is incorporated, headquartered, licensed
and ultimately owned in {{country}}, with all users there, for its domestic book, with no redistribution, and is
invoiced to and paid from {{country}}. A licence obtained on a false claim moves to the list price from the first day."*

*Annual prices appear only where the rate card states them (reader Pro KES 15,000 a year, reader Team KES 60,000 a
year). Do not offer an annual price for any institutional plan.*

## 4. Evidence you can check

- Coverage and status by market: https://www.afronomicsfeed.com/data/frontier-local-debt
- Measured time from publication to our record: https://www.afronomicsfeed.com/status#latency *(quote only figures the
  page shows today)*
- Every row links to the issuer's notice; late or missing markets are shown daily: https://www.afronomicsfeed.com/status
- {{pilot_line}} *(if they ran a pilot: "Your pilot: {{calls_total}} calls on {{days_used}} days, mainly
  {{markets_called}}." Otherwise: "A free 30-day pilot key is available before you decide.")*

## 5. Licence in brief (full terms on the order form)

Internal use by {{organisation}}'s named users for analysis, models, committee papers and client work. Quoting
figures with "Source: Afronomics". **No redistribution**: passing the data, or files and feeds built from it, to
clients or third parties needs an Enterprise licence. Information, not advice.

## 6. Next step

To start: {{next_step}} *(one of: "pay at {{plan_link}}; the key is issued automatically" / "reply with your billing
details and PO number and we send the invoice" / "sign the attached order form")*.

{{sender_name}}, Afronomics · {{sender_email}} · https://www.afronomicsfeed.com
