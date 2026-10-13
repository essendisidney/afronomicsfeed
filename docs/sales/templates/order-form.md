# Order form template

For one customer, one plan. The sales operator may fill sections 1–4 from the rate card and the deal; **only the
founder signs, sends with changes, or accepts any edit by the customer.** Any field marked FOUNDER is never filled
by the agent. Delete every instruction in *italics* before sending.

**Status of the licence text below:** a summary drafted from the live terms (`dataTerms` in `lib/billing/ratecard.ts`,
D-016) and `localInstitutionRule` (D-014). It is **not yet a reviewed legal contract** (founder decision F3). Until
the founder approves standard licence text, every order form goes out from the founder only.

---

**AFRONOMICS DATA — ORDER FORM**
Order {{order_ref}} *(O-<deal id>-<YYYYMMDD>)* · Date {{date}}

## 1. Parties

| | Supplier | Customer |
|---|---|---|
| Legal name | Afronomics *(FOUNDER: legal entity name)* | {{customer_legal_name}} |
| Registered address | *(FOUNDER)* | {{customer_address}} |
| Tax ID | *(FOUNDER: KRA PIN / VAT)* | {{customer_tax_id}} |
| Contact | {{sender_name}}, {{sender_email}} | {{contact_name}}, {{contact_email}} |
| Accounts payable | — | {{ap_email}} |
| Purchase order | — | {{po_number}} *(if any)* |

## 2. Order

| Item | Plan id | Users / scope | Price | Period |
|---|---|---|---|---|
| {{plan_name}} | {{plan_id}} *(analyst, data_team, analyst_ke, data_team_ke, pack, pack_plus, licence_startup, widget; Enterprise: FOUNDER)* | {{users_or_scope}} | {{plan_price}} *(copied from the rate card)* | {{start_date}} to {{end_date}} (one month) |

Markets in scope: {{markets}} — as listed on https://www.afronomicsfeed.com/data/frontier-local-debt on the order
date. Coverage may grow; the customer is not charged more for markets added during the term.

*Local-institution price: add "The customer confirms it meets the local-institution conditions in section 4.3."*

## 3. Payment

| | |
|---|---|
| Amount | {{plan_price}} {{currency}} per month, in advance |
| Method | {{method}} *(Paystack checkout at {{plan_link}} — card, M-Pesa, Pesalink — charged in KES at KES 129 to the dollar for USD-priced plans; or bank transfer against an invoice)* |
| Invoice terms | *(FOUNDER: due on receipt unless the founder agrees otherwise)* |
| Bank details | *(FOUNDER)* |
| Renewal | Monthly by payment. Nothing renews automatically unless a Paystack subscription is set up. A Team and API payment from the same email extends the existing key |
| Taxes | *(FOUNDER)* |

## 4. Licence summary

4.1 **Permitted:** internal use by the customer's named users ({{users_or_scope}}) for analysis, models, investment
committee papers and client work; quoting individual figures with the credit "Source: Afronomics" and a link.

4.2 **Not permitted without an Enterprise licence:** redistribution — passing the data, or files, feeds or databases
built from it, to clients or any third party, or reselling it; use by teams beyond those named; use for training
models or building indices for others.

4.3 **Local-institution price (if used):** the customer is incorporated, headquartered and licensed in {{country}}, its
ultimate parent is African and headquartered in {{country}}, all users are in {{country}}, the data is used for its
domestic book with no redistribution, and it is invoiced to and pays from {{country}}. A false statement moves this
order to the US-dollar list price from its first day.

4.4 **API keys:** keys are confidential to the customer. Afronomics stores only a fingerprint of each key. A leaked key
is replaced on request. A key issued at checkout stops working three days after the paid period ends; a key issued
against an invoice is revoked at the end date in section 2 unless the order is renewed.

4.5 **The data:** each row is read from the issuer's published notice and links to it. Afronomics corrects errors it
finds or is told about. Information, not advice. *(FOUNDER: warranty, liability cap, governing law, termination —
to be set in the standard licence, F3. The agent never adds or accepts terms here.)*

## 5. Signatures

| Customer | Afronomics |
|---|---|
| Name: {{signatory_name}} | Name: *(FOUNDER)* |
| Title: {{signatory_title}} | Title: Founder |
| Signature: | Signature: *(FOUNDER only)* |
| Date: | Date: |

*On countersignature: set the deal to `won` with `signed_at` = the founder's signature date; the money is reported as
contracted until it arrives, and as collected only when the founder confirms the funds.*
