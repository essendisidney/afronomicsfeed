# Pilot wave 4: local institutions (drafted 14 Oct 2026)

**Status: approved by the founder and sent 14 Oct 2026 to 9 of 10** (campaign `pilot-wave4`); deals moved to
`contacted`, follow-up 22 Oct. Britam (no published address) stays a Gmail draft for the founder.

**Why local now.** Waves 1 to 3 went to global funds, which are slow to answer cold emails. Local institutions can
pay today: Kenya at checkout in KES (M-Pesa or card), elsewhere by a USD-equivalent card link or invoice
(`lib/billing/ratecard.ts`, D-014/D-015).

**Who qualifies.** Every firm below passes the local-price rule (`docs/strategy/country-pricing.md` §4): the firm
and its ultimate parent are headquartered in the same African country. Excluded for that reason: Stanbic IBTC AM
and Pensions, Sanlam Investments EA, Old Mutual Uganda and SBG Securities Uganda, all with a South African parent.
They pay list price and belong in a later wave.

**Addresses.** Each address was found on the firm's own website by the Probe workflow on 14 Oct 2026 (runs
38544459217 and 38544740076). None was guessed. Most are general inboxes, so each email asks for it to be passed on.

| # | Deal id | Organisation | Country | Address (where found) | Route quality | Draft opens with |
|---|---|---|---|---|---|---|
| 1 | 38 | CIC Asset Management | Kenya | info@cic.co.ke (CIC group contact page) | general group inbox | unit trust and fixed income funds |
| 2 | 39 | Britam Asset Managers | Kenya | **none published** (contact pages 404) | founder: web form or a contact | fixed income and money market funds |
| 3 | 40 | ICEA LION Asset Management | Kenya | contactcentre@icealion.com (icealion.co.ke footer) | group contact centre | fixed income and money market funds |
| 4 | 23 | NSSF Kenya | Kenya | info@nssfkenya.co.ke (nssf.or.ke/contact) | listed against the Central/Eastern region office; may be slow | government securities portfolio |
| 5 | 24 | NSSF Uganda | Uganda | customerservice@nssfug.org (nssfug.org contact) | customer service | Treasury bond and bill portfolio |
| 6 | 25 | SSNIT | Ghana | contactcentre@ssnit.org.gh (ssnit.org.gh footer) | contact centre | fixed income portfolio |
| 7 | 35 | ARM Investment Managers | Nigeria | enquiries@arm.com.ng (arm.com.ng/contact-us) | general enquiries | ARM Fixed Income Fund |
| 8 | 36 | Afrinvest | Nigeria | connect@afrinvest.com (afrinvest.com footer) | customer support | fixed income funds, FGN bonds |
| 9 | 37 | Databank Group | Ghana | info@databankgroup.com (databankgroup.com header) | general inbox | fixed income funds, weekly update |
| 10 | 43 | EFG Holding (EFG Hermes) | Egypt | HermesContactCenter@efg-hermes.com (efgholding.com contact) | brokerage contact centre: weakest route | Egyptian debt research, MMFs |

Reserve: Access ARM Pensions (deal 45). The site timed out twice, so no address was found.

**What each email says** (house rules in `docs/sales/sequences.md`):

- one ask: a free 30-day pilot with an API key and the full history;
- that market's coverage, with start years taken from our data files on 14 Oct:
  - Kenya bonds 2010, bills 2011;
  - Uganda bills 2017, bonds Nov 2024;
  - Ghana bills 2018;
  - Nigeria bills 2002, FGN bonds 2013;
  - Egypt bills and bonds;
- the local price after the pilot, from the rate card;
- two links: the frontier debt page and /licensing#local;
- the opt-out line.

Local prices after the pilot, per month:

| Country | CSV downloads (Analyst) | Five seats and the API (Team) |
| --- | --- | --- |
| Kenya | KES 16,000 | KES 95,000 |
| Uganda | UGX 375,000 | UGX 2,250,000 |
| Ghana | GHS 1,500 | GHS 9,000 |
| Nigeria | NGN 175,000 | NGN 1,000,000 |
| Egypt | EGP 7,500 | EGP 45,000 |

**After sending:** move each deal to `contacted` with a dated note. Send one follow-up after 8 days if there is no
reply, then stop.

**Better routes, if the founder has them:**

- a named head of fixed income or CIO, via LinkedIn or a mutual contact, will do far better than a general inbox;
- for NSSF Kenya and SSNIT, a short letter to the CIO's office.
