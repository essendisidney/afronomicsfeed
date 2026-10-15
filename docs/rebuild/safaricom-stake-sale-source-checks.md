# Source checks: Safaricom stake sale Receipt (draft)

Receipt: `content/receipts/2026-10-15-safaricom-stake-sale.md` (status `draft`). Checked 15 October 2026.

**How this was checked.** The desk machine cannot open these sites, so the pages were fetched by the GitHub Actions
Probe workflow (`.github/workflows/probe.yml`), which prints each page's HTTP status and the text around chosen
figures. Runs on 15 October 2026: job 116582237569 (figures), and runs 188, 190, 192 and 193 (publication dates from
each page's `datePublished` metadata, and further figures). "Matches" means the figure is in the text of the named
page as fetched. "Arithmetic" means our own sum from figures above it. "Corrected" means the draft said something
else and now follows the page. "Open" items are repeated in the Receipt's `verify:` list.

**Pages that could not be read** (HTTP 403, Cloudflare): Nation 5287656, Techweez (CMA exemption, 30 Jun 2026),
People Daily explainer and People Daily "Mbadi says divestiture will finance infrastructure". Claims resting only on
them were removed and the four sources dropped from the Receipt.

| # | Figure in the draft | Source (page read) | Status |
| --- | --- | --- | --- |
| 1 | Deal announced 4 December 2025 | Vodacom announcement (page dated "Thursday, 4 December 2025") | Matches |
| 2 | KES 34 a share; Vodacom buys 15% from the government and a further 5% from Vodafone; Vodacom stake 35% to 55%; Safaricom stays listed | Vodacom announcement | Matches. Corrected: draft said Vodacom "bought out Vodafone Group's share of Vodafone Kenya"; the page says "an additional 5% from Vodafone at KES34 per share" (Business Daily 5291018 says the same, at Sh68.1bn) |
| 3 | 6,009,814,200 shares, 15% | tech-ish 15 Sep 2026 ("6,009,814,200 Safaricom shares, 15 per cent of the company"); Mwango ("6.01B shares") | Matches (press). Not on Vodacom's web page; Vodacom's JSE notice not opened |
| 4 | KES 204.3bn for the 15% | Mwango; tech-ish 15 Sep; Business Daily 5291018 and 5514578; Citizen | Matches. Corrected: the draft attributed it to Vodacom's announcement, whose page does not give it; tile source moved to Mwango Capital |
| 5 | KES 40.2bn dividend advance on the retained 20% | Mwango; Business Daily 5291018, 5292462, 5514578; tech-ish; Citizen | Matches |
| 6 | KES 244.5bn total | Business Daily 5514578; tech-ish 15 Sep | Matches |
| 7 | Advance described as a loan | Mwango ("functioning as a dividend-secured loan"); Business Daily 5292462 ("the facility to lend to the government") | Matches. Corrected: attribution moved from Business Daily 5514578 (phrase not found there) to Mwango |
| 8 | Government 35% to 20%; public float 25% | Mwango (35% to 20%); tech-ish 15 Sep and The Condia (25%) | Matches |
| 9 | High Court freeze | The Standard 26 Jun 2026 (conservatory orders "issued by the High Court on May 18"); tech-ish 6 Jul says "frozen since March 2026" | Corrected to "by 18 May 2026"; first-order date open (verify) |
| 10 | Court of Appeal lifted the freeze on 26 June 2026 | The Standard (dated 26 Jun 2026; Kiage, Achode, Muchelule JJA); The Condia; tech-ish | Matches |
| 11 | CMA exemption, Regulation 5(1), 29 June 2026, from a mandatory takeover offer | tech-ish 6 Jul 2026 | Matches (press). Attribution moved from Techweez (blocked) to tech-ish. CMA notice not opened (verify) |
| 12 | One NSE block trade on 30 June 2026 | tech-ish 15 Sep and 6 Jul; Business Daily 5514578 ("on Tuesday as a block trade"; page dated 30 Jun 2026) | Matches |
| 13 | Conditions | Mwango ("retaining 2 board seats"; consult the government before expansions outside Kenya; Kenyans a majority of independent directors) | Two board seats matches. Kenyan chair and CEO, brand and three-year supplier conditions came only from People Daily (blocked): removed |
| 14 | Proceeds to the National Infrastructure Fund; not for recurrent spending | People Daily (blocked) only | Removed from the body, the "Who gains" line and the verdict |
| 15 | High Court, 15 Sep 2026: unconstitutional, null and void; shares restored | tech-ish 15 Sep (three-judge bench, Gikonyo, Aburili, Ouya); Citizen 13 Oct | Matches (press); judgment not opened (verify) |
| 16 | Grounds: public participation | Citizen 13 Oct (a public policy decision needing meaningful public participation; neither Cabinet nor National Assembly provided it); tech-ish 15 Sep | Matches (press). Articles 10 and 118 not found in any page read: not used |
| 17 | "The government and Vodacom have appealed" | The Condia (Vodacom "says it will appeal"); Citizen ("the government's intended appeal") | Corrected to what each says |
| 18 | Court of Appeal declined a stay on 13 Oct 2026 | Citizen (dated 13 Oct 2026; Kimaru, Okello, M'Inoti JJA) | Matches (press); ruling not opened (verify) |
| 19 | No appeal hearing date published | Nothing found either way | Removed |
| 20 | KES 28.20 close on 2 Dec 2025; 20.6% premium | Mwango; Business Daily 5291018 (20.6%) | Matches (press). NSE price list not opened (verify) |
| 21 | Treasury's 23.6% premium to the six-month VWAP | No page read gives it | Removed. Replaced with Mwango's 18.4% (90-day VWAP) and 33.9% (180-day VWAP) |
| 22 | SIB fair value KES 40.19; 15.4% discount; KES 37.1bn | Business Daily 5291018 | Matches |
| 23 | Treasury relied on KCB Investment Bank valuation and target prices | The Star 13 Jan 2026 | Matches |
| 24 | About KES 36.50 around the ruling | tech-ish 15 Sep ("KES 36.50 on Tuesday, up 1.8 per cent"); The Condia ("about KSh36.50") | Matches (press). Table now says 6.8% below (34 / 36.50). NSE list not opened (verify) |
| 25 | KES 33.60 close on 26 June 2026 (verify list only) and "the market was still below it in late June" | No page read gives a June price | Removed from verify list and from the verdict |
| 26 | Dividend KES 2.00 for FY26; total KES 80.13bn; final KES 1.15; interim KES 0.85 paid in March 2026 | Safaricom press release (titled 31/07/2026; web page posted 3 Aug 2026) | Matches |
| 27 | KES 1.20 for FY25; up two-thirds | Capital FM (Sh2, "66.7 percent increase") | Matches by arithmetic: 2.00 / 1.667 = 1.20 |
| 28 | Interim register closed 25 February 2026 | The Star 5 Feb 2026 | Matches |
| 29 | Final register closed 4 August 2026 | Business Daily 5514578 | Matches |
| 30 | Shares in issue 40,065,428,000 | Arithmetic: 6,009,814,200 / 0.15; and KES 80.13bn / KES 2.00 = 40.07bn | Arithmetic agrees; the Receipt's sums use the 6,009,814,200 shares directly |
| 31 | 15%: KES 7.2bn at 1.20; 12.0bn at 2.00; interim 5.1bn; final 6.9bn | Arithmetic on rows 3, 26 to 28 | Arithmetic |
| 32 | KES 16.1bn forgone | Business Daily 5514578 ("had the sale been delayed beyond August 4 ... the Treasury would have earned Sh16.1 billion from the 15 percent stake") | Corrected: draft said "on all its 35%". Now quotes Business Daily and adds our arithmetic: 16.1bn is the final on 35%; on the 15% it is 6.9bn |
| 33 | Dividend rights KES 55.7bn sold for KES 40.2bn; 27.8% discount | Business Daily 5291018 (Sh55.7bn, Sh40.2bn, "discounting ... by Sh15.5 billion") | Matches. 27.8% is arithmetic (15.5 / 55.7). Chart source moved from Nation (blocked) to this page |
| 34 | Treasury present value KES 29.3bn; "cash now beats dividends later" (Mbadi, Nation) | Nation (blocked) only | Removed from the body and the chart |
| 35 | Vodacom IRR 16.5% | Business Daily 5292462 (Shaun Biljon, group financial controller; capped at 18%) | Matches |
| 36 | "About three years" to recoup | Business Daily 5292462 ("within two or three years"; Biljon: "just over two years") | Corrected to two to three years, with Biljon's quote |
| 37 | Yield 5.9% (2.00 / 34) | Arithmetic | Arithmetic |
| 38 | One-year Treasury bill 9.04% on 12 October 2026 | Afronomics auction file, CBK results dated 12 Oct 2026 | Matches (our data file) |
| 39 | Five weeks from trade (30 June) to register close (4 August) | Arithmetic on rows 12 and 29 | Arithmetic |
| 40 | Proceeds non-refundable (new, verdict) | Citizen 13 Oct (government affidavits of 17 Sep 2026) | Matches (press) |

**Source dates** (from each page's `datePublished` or visible dateline):

| Source | Draft date | Page says | Status |
| --- | --- | --- | --- |
| Vodacom announcement | 2025-12-04 | Thursday, 4 December 2025 | Matches |
| Safaricom FY26 dividend release | 2026-07-31 | Titled 31/07/2026; posted 3 Aug 2026 | Kept 2026-07-31 (the release date) |
| Capital FM | 2026-05-07 | 2026-05-07 | Matches |
| The Star, interim dividend | 2026-02-05 | 5 February 2026 | Matches |
| Mwango Capital | 2025-12-04 | 2025-12-04 | Matches |
| Business Daily 5291018 | 2025-12-12 | 2025-12-08 | Corrected |
| The Star, Mbadi | 2026-01-13 | 13 January 2026 | Matches |
| Business Daily 5292462 | 2025-12-12 | Tuesday, 9 December 2025 | Corrected |
| The Standard 2001551360 | 2026-06-26 | 26 June 2026 | Matches |
| tech-ish, Vodacom now controls | 2026-07-06 | 6 July 2026 | Matches |
| Business Daily 5514578 | 2026-07-01 | 2026-06-30 | Corrected |
| tech-ish, High Court | 2026-09-15 | 15 September 2026 | Matches |
| The Condia | 2026-09-15 | 2026-09-15 | Matches |
| Citizen Digital | 2026-10-13 | 13 October 2026 | Matches |
| Nation 5287656, Techweez, People Daily (two) | various | Blocked (403) | Sources dropped |

**Still open** (in the Receipt's `verify:` list): case numbers and wording from both court decisions on Kenya Law;
the CMA's own exemption notice; the date of the first High Court freeze (18 May per The Standard, March per tech-ish);
and the NSE price lists for 2 December 2025 and 15 September 2026. Vodacom's JSE notice was not opened, but every
figure the Receipt takes from the deal is now attributed to a page that was read.
