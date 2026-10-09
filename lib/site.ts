export const site = {
  name: "Afronomics",
  legalName: "Afronomics Feed",
  tagline: "The price of money in Africa",
  line: "Rates · Currencies · Inflation · for everyone",
  promise:
    "What African governments pay to borrow, what a shilling earns, what a loan should cost and what the currency buys — from the source, the day it is published, free to see and explained for anyone, in ten markets and counting.",
  /** Canonical host. The apex domain redirects here (vercel.json). */
  url: "https://www.afronomicsfeed.com",
  houseCredit: "A product of Pesara Limited",
  houseName: "Pesara Limited",
  houseUrl: "https://pesara.com",
  locale: "en",
  description:
    "The price of money in Africa: Treasury bill rates in ten markets, currencies, inflation and what they mean for a saver, a borrower and a treasury — from the central banks, the minute they publish, free to see, cited by institutions. Plus every African economy’s data and the headlines that move markets.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "desk@afronomicsfeed.com",
  linkedinUrl: "https://www.linkedin.com/company/afronomicsfeed/",
} as const;

/** The price of money first. Economy, Capital, Climate, Technology and Trade stay live, linked from the footer. */
export const nav = [
  { href: "/markets/tbills", label: "T-bills" },
  { href: "/markets/kenya-bonds", label: "Bonds" },
  { href: "/rates/kenya", label: "Savings & loans" },
  { href: "/markets", label: "Currencies" },
  { href: "/data/inflation", label: "Inflation" },
  { href: "/countries", label: "Countries" },
  { href: "/data", label: "Data" },
  { href: "/learn", label: "Learn" },
  { href: "/news", label: "Wire" },
  { href: "/brief", label: "Analysis" },
] as const;

export const utilityNav = [
  { href: "/rates/what-readers-paid", label: "What did you pay?" },
  { href: "/morning", label: "Morning" },
  { href: "/alerts", label: "Alerts" },
  { href: "/weekly", label: "Weekly" },
  { href: "/signals", label: "Signals" },
  { href: "/reference", label: "Reference" },
] as const;

export const footerGroups = [
  {
    title: "Coverage",
    links: [
      { href: "/news", label: "The Wire" },
      { href: "/markets", label: "Markets & FX" },
      { href: "/economy", label: "Economy" },
      { href: "/capital", label: "Capital & DFI flows" },
      { href: "/climate", label: "Climate & energy" },
      { href: "/technology", label: "Technology" },
      { href: "/trade", label: "Trade" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "/markets/tbills", label: "T-bill monitor" },
      { href: "/markets/bill-index", label: "Sovereign Bill Index" },
      { href: "/markets/borrowing-costs", label: "Borrowing costs" },
      { href: "/markets/eurobonds", label: "Eurobond yields" },
      { href: "/rates/policy", label: "Policy rates" },
      { href: "/rates/kenya", label: "Kenya rates compared" },
      { href: "/rates/kenya/money-market-funds", label: "Money market funds" },
      { href: "/rates/kenya/best-money-market-fund", label: "Best money market fund this month" },
      { href: "/rates/kenya/saccos", label: "SACCO rates" },
      { href: "/rates/kenya/mobile-loans", label: "Mobile loan costs" },
      { href: "/rates/remittances", label: "Cost of sending money home" },
      { href: "/rates/what-readers-paid", label: "What readers paid" },
      { href: "/rates/kenya/check", label: "Is my rate fair? Kenya" },
      { href: "/rates/nigeria/check", label: "Is my rate fair? Nigeria" },
      { href: "/rates/ghana/check", label: "Is my rate fair? Ghana" },
      { href: "/countries", label: "54 country files" },
      { href: "/data", label: "Data hub" },
      { href: "/developers", label: "Data API" },
      { href: "/signals", label: "Signals" },
      { href: "/widgets", label: "Free widgets" },
      { href: "/licensing", label: "Data licensing" },
      { href: "/method", label: "Sources & method" },
      { href: "/status", label: "Data status" },
      { href: "/reference", label: "The reference" },
    ],
  },
  {
    title: "Analysis",
    links: [
      { href: "/brief", label: "Briefs" },
      { href: "/morning", label: "The Morning" },
      { href: "/morning/sw", label: "Asubuhi (Kiswahili)" },
      { href: "/alerts", label: "Alerts" },
      { href: "/ask", label: "Ask the data" },
      { href: "/radio", label: "Radio bulletin" },
      { href: "/markets/bill-index/release", label: "ASBI weekly release" },
      { href: "/weekly", label: "Weekly" },
      { href: "/explainers", label: "Explainers" },
      { href: "/archive", label: "Archive" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/for-institutions", label: "For institutions" },
      { href: "/pricing", label: "Pricing" },
      { href: "/prices", label: "Price guide" },
      { href: "/jobs", label: "Jobs" },
      { href: "/pack", label: "Committee pack" },
      { href: "/advisory", label: "Research & advisory" },
      { href: "/advertise", label: "Advertise" },
      { href: "/subscribe", label: "Newsletter" },
      { href: "/contact", label: "Contact" },
      { href: "/corrections", label: "Corrections" },
    ],
  },
] as const;

export const footerNav = footerGroups.flatMap((group) => [...group.links]);

export const disclaimer =
  "Afronomics publishes data, journalism and market intelligence for information only. It is not investment, legal or tax advice, and nothing here is a recommendation to buy, sell or hold any security. Third-party data remains the property of its publisher and is shown with attribution; headlines link to the original publisher.";

export const pricing = {
  free: {
    name: "Open",
    price: "$0",
    period: "",
    detail: "The Wire, all 54 country files, the data hub with history and CSV downloads, the DFI pipeline, signals and the weekly newsletter.",
  },
  pro: {
    name: "Pro",
    price: "KES 1,500",
    period: "/mo",
    detail: "About $12. Every brief and weekly analysis in full, the Morning note, auction alerts the moment each market reports, and the full field set from the data API.",
  },
  professional: {
    name: "Team",
    price: "KES 6,000",
    period: "/mo",
    detail: "About $49. Five Pro seats on one invoice, bulk exports, and priority requests for new datasets.",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "",
    detail: "Licensed data feeds, embedded widgets, white-label country files and commissioned research.",
  },
  trial: {
    name: "Kenya desk trial",
    price: "KES 200",
    detail: "Fourteen days of Pro for the price of a lunch, paid by M-Pesa or card through Paystack.",
  },
} as const;
