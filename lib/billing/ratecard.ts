import type { CheckoutPlanId } from "./plans";

/**
 * The Afronomics rate card: one list that /prices, /pricing, /pack, /licensing and /advertise all read from.
 *
 * Pricing principle: every price is set in Kenyan shillings for the people who use the site most (analysts,
 * treasurers, fund managers and journalists on the continent) and is the same for a desk anywhere else. The
 * dollar figure is shown for reference. Products that only buyers abroad want are priced in dollars.
 * Institutions can pay by M-Pesa, card or bank transfer at checkout, or ask for an invoice.
 */

export const KES_PER_USD = 129;

export type RateItem = {
  id: string;
  name: string;
  /** Amount in major units of `currency`. null = custom quote. */
  amount: number | null;
  currency: "KES" | "USD";
  unit: string;
  what: string;
  /** Paystack plan id when it can be bought on the site now. */
  checkout?: CheckoutPlanId;
  /** Enquiry interest when it is invoiced instead. */
  enquiry?: string;
  href?: string;
  launch?: string;
  status?: "live" | "soon";
};

export type RateGroup = { id: string; title: string; who: string; items: RateItem[] };

export const rateCard: RateGroup[] = [
  {
    id: "readers",
    title: "Readers",
    who: "Analysts, treasurers, journalists, students and investors",
    items: [
      { id: "open", name: "Open", amount: 0, currency: "KES", unit: "", what: "Every number, headline, country file, the T-bill monitor, auction pages, the Sovereign Bill Index, CSV downloads and the Weekly. Free, with attribution.", href: "/subscribe" },
      { id: "pro", name: "Pro", amount: 1500, currency: "KES", unit: "a month", what: "The Morning note by email every weekday, auction alerts the moment each market reports, every brief in full and the full field set from the data API. One seat. KES 15,000 a year.", checkout: "pro", href: "/pricing" },
      { id: "team", name: "Team", amount: 6000, currency: "KES", unit: "a month", what: "Five Pro seats on one invoice, bulk exports and priority requests for new datasets. KES 60,000 a year.", checkout: "professional", href: "/pricing" },
      { id: "trial", name: "Kenya desk trial", amount: 200, currency: "KES", unit: "for 14 days", what: "Fourteen days of Pro, paid by M-Pesa, so a desk can try it before the finance department is involved.", checkout: "trial", href: "/pricing" },
      { id: "whatsapp", name: "Auction alerts on WhatsApp", amount: 300, currency: "KES", unit: "a month", what: "The Kenya auction result on WhatsApp within minutes of the CBK posting it, with the 91-, 182- and 364-day rates and the change. Reply to the receipt with your number.", checkout: "alerts_whatsapp" },
      { id: "sms", name: "The Sunday rates SMS", amount: 100, currency: "KES", unit: "a month", what: "One text a week: the latest bill rates, the best money-market yield after tax and the shilling. Joining list open.", enquiry: "access", status: "soon" },
    ],
  },
  {
    id: "institutions",
    title: "Institutions",
    who: "SACCOs, insurers, pension schemes, microfinance banks, fund managers and corporate treasuries",
    items: [
      { id: "pack", name: "Investment Committee Pack", amount: 12000, currency: "KES", unit: "a month", what: "Four sourced A4 pages on the first of each month with your institution on the cover: ten-market bill rates, Kenya’s yield curve, where the shilling earns most after tax, currencies and the auction calendar.", checkout: "pack", href: "/pack" },
      { id: "pack_plus", name: "Pack with alerts", amount: 18000, currency: "KES", unit: "a month", what: "The pack, plus an email the day each Kenya auction lands and the Morning note for five named people.", checkout: "pack_plus", href: "/pack" },
      { id: "pack_single", name: "Single pack", amount: 1000, currency: "KES", unit: "one month", what: "This month’s pack as a PDF, no subscription, for the analyst or student who needs it once.", checkout: "pack_single", href: "/pack" },
      { id: "benchmarking", name: "Treasury benchmarking", amount: 40000, currency: "KES", unit: "a quarter", what: "Send us your portfolio’s yields; one page shows what the same money would have earned at the auctions and in the best funds over the quarter, for the board.", checkout: "benchmarking" },
      { id: "bidding", name: "Auction bidding support", amount: 75000, currency: "KES", unit: "per engagement", what: "For SACCOs and MFIs that have never bid at a CBK auction directly: when to bid, which tenor, how to place it through DhowCSD, and a template for the committee.", enquiry: "research" },
      { id: "training", name: "Training: reading the auction, pricing the curve", amount: 200000, currency: "KES", unit: "per half-day session", what: "For up to 25 people from a finance team or an association’s members, on your premises or online, using the live data as the course material.", enquiry: "research" },
      { id: "standing", name: "Standing country or sector report", amount: 25000, currency: "KES", unit: "a month", what: "A monthly sourced PDF on one subject — Kenya debt, East African bills, Nigeria rates — built on the same engine as the pack.", enquiry: "research" },
      { id: "research", name: "Commissioned research", amount: 400000, currency: "KES", unit: "from, per piece", what: "A question answered from the data, with a written report and the workings: what the curve says about next year’s funding, how a market’s demand has moved, what a reform did to rates. About $3,000 to $15,000.", enquiry: "research", href: "/advisory" },
    ],
  },
  {
    id: "data",
    title: "Data and developers",
    who: "Fintechs, research desks, bank treasuries, DFIs, model builders and funds abroad",
    items: [
      { id: "api", name: "Open API", amount: 0, currency: "KES", unit: "", what: "Every auction dataset, the measures and the index as JSON, no key, five-minute cache, with attribution. Research, journalism, teaching and non-commercial apps.", href: "/developers" },
      { id: "licence_startup", name: "Startup licence", amount: 7500, currency: "KES", unit: "a month", what: "Commercial use inside one product: all ten auction datasets, the measures and the FX archive, an email or webhook on every new result, and a named contact. About $59.", checkout: "licence_startup", href: "/licensing" },
      { id: "licence_institution", name: "Institution licence", amount: 39000, currency: "KES", unit: "a month", what: "All datasets and the Wire archive for internal models, dashboards and client reports, full history and change notifications. About $299.", enquiry: "licensing", href: "/licensing" },
      { id: "frontier", name: "Frontier desk", amount: 249, currency: "USD", unit: "a month per desk", what: "For funds in London, New York and Dubai holding African paper: the Monday note with the index, every auction and the FX, the full API and a quarterly call with the desk. Invoiced in dollars.", enquiry: "licensing" },
      { id: "widget", name: "Branded live-rates widget", amount: 40000, currency: "KES", unit: "a month", what: "Our live T-bill, bond or FX widget on your site with your branding and no Afronomics link, updated the moment each result lands. The free widgets are the demo.", checkout: "widget", href: "/widgets" },
      { id: "bulk", name: "Bulk and AI training licence", amount: null, currency: "USD", unit: "", what: "Clean, dated, sourced African financial data for models and bulk redistribution, with the full change history. Priced by scope.", enquiry: "licensing" },
    ],
  },
  {
    id: "sponsors",
    title: "Sponsors and brands",
    who: "Banks, fund managers, brokers, fintechs and advisers who want to be seen by the people reading the numbers",
    items: [
      { id: "rates_sponsor", name: "“Where the shilling earns most” sponsor", amount: 150000, currency: "KES", unit: "a month", what: "Your name at the top of the Kenya rates comparison page and its line in the Morning: the page that competes for “best money market fund Kenya”. One sponsor.", enquiry: "sponsorship", href: "/rates/kenya", launch: "KES 100,000 for the first three months" },
      { id: "morning_sponsor", name: "Morning note sponsor line", amount: 75000, currency: "KES", unit: "a month", what: "One marked line in the daily note that treasurers open before 07:30. KES 150,000 once the list passes 2,000 subscribers; sponsors who sign at launch keep the launch rate for a year.", enquiry: "sponsorship", href: "/morning" },
      { id: "weekly_sponsor", name: "The Weekly, presenting sponsor", amount: 30000, currency: "KES", unit: "per edition", what: "Logo, one line and a link above the fold of the Monday edition on the site and in the newsletter, marked as sponsored.", enquiry: "sponsorship", href: "/weekly" },
      { id: "country_sponsor", name: "Country file sponsor", amount: 15000, currency: "KES", unit: "per country a month", what: "Sole sponsor of one of the 54 country files: the page people land on when they search a market.", enquiry: "sponsorship", href: "/countries" },
      { id: "fund_listing", name: "Verified fund listing", amount: 20000, currency: "KES", unit: "a month", what: "Your money-market or bond fund listed on the rates comparison with a verified yield, your logo and an “invest” link that we count for you.", checkout: "fund_listing", href: "/rates/kenya" },
      { id: "sacco_listing", name: "Verified SACCO listing", amount: 20000, currency: "KES", unit: "a month", what: "Your SACCO on the SACCO rates comparison with its declared dividend and deposit rates verified against your own notice, your logo and a “join” link that we count for you. Regulated SACCOs only.", checkout: "sacco_listing", href: "/rates/kenya/saccos" },
      { id: "job", name: "Jobs listing", amount: 10000, currency: "KES", unit: "per 30-day listing", what: "A treasury, risk, research or analyst role in front of the people who read the numbers. Reply to the receipt with the listing.", checkout: "job_listing" },
      { id: "breakfast", name: "The rates breakfast", amount: 750000, currency: "KES", unit: "per event", what: "Quarterly, Nairobi, sixty treasurers and investment-committee members, one sponsor, the index reading as the headline. Sponsor’s name on everything.", enquiry: "sponsorship" },
    ],
  },
];

export function rateItem(id: string) {
  for (const g of rateCard) for (const i of g.items) if (i.id === id) return i;
  return null;
}

export function priceText(i: RateItem) {
  if (i.amount == null) return "Custom";
  if (i.amount === 0) return "Free";
  const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(i.amount);
  return i.currency === "USD" ? `$${n}` : `KES ${n}`;
}

/** "about $12" for a KES price, or "about KES 32,000" for a USD one. */
export function aboutText(i: RateItem) {
  if (!i.amount) return "";
  if (i.currency === "USD") return `about KES ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round((i.amount * KES_PER_USD) / 1000) * 1000)}`;
  const usd = i.amount / KES_PER_USD;
  const rounded = usd >= 100 ? Math.round(usd / 10) * 10 : usd >= 20 ? Math.round(usd / 5) * 5 : Math.round(usd);
  return `about $${rounded}`;
}

/** What a comparable costs elsewhere, so the shilling prices can be judged against the world. */
export const comparables = [
  { product: "Bloomberg Terminal", price: "about $2,000+ a month per seat", ours: "Pro, KES 1,500 (about $12)" },
  { product: "LSEG Workspace / Refinitiv Eikon", price: "typically $1,000+ a month per seat", ours: "Team, KES 6,000 for five seats" },
  { product: "Global data APIs (Trading Economics, CEIC)", price: "from about $50 to several thousand dollars a month", ours: "Open API free; Startup licence KES 7,500" },
  { product: "Finance newsletters on Substack", price: "$10 to $30 a month", ours: "The Morning is free; Pro adds alerts and the API" },
  { product: "A day of an analyst’s time each month on the committee pack", price: "KES 15,000 to 40,000 in salary, before mistakes", ours: "The pack, KES 12,000, sourced and on time" },
  { product: "Sponsored email line in a national business daily", price: "KES 100,000 to 300,000 a send", ours: "Morning sponsor line, KES 75,000 a month" },
];
