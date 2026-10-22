import { toolPaths } from "./tools";

export const site = {
  name: "Afronomics",
  legalName: "Afronomics Feed",
  tagline: "The price of money in Africa",
  line: "Rates · Currencies · Inflation · for everyone",
  promise:
    "What African governments pay to borrow, what a shilling earns, what a loan should cost and what the currency buys — from the source, the day it is published, free to see and explained for anyone, across Africa.",
  /** Canonical host. The apex domain redirects here (vercel.json). */
  url: "https://www.afronomicsfeed.com",
  houseCredit: "A product of Pesara Limited",
  houseName: "Pesara Limited",
  houseUrl: "https://pesara.com",
  locale: "en",
  description:
    "The price of money in Africa: Treasury bill rates in ten markets, currencies, inflation and what they mean for a saver, a borrower and a treasury — from the central banks, the day they publish, free to see. Plus data on all 54 African economies and the headlines that move markets.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "desk@afronomicsfeed.com",
  linkedinUrl: "https://www.linkedin.com/company/afronomicsfeed/",
  telegramUrl: "https://t.me/afronomic",
} as const;

/**
 * Main navigation (RECEIPTS.md, "One site, one journey"; redesign preview): five sections, named in readers' words.
 * Stories gathers the Receipts, briefs, explainers and the Casebook; Rates & data the numbers; Tools the calculators
 * and checkers (lib/tools.ts). The hrefs are the ones the old labels (Receipts, Numbers) had, so every URL keeps
 * working. Each section also lights up on the pages it gathers: `match` lists the path prefixes it owns and the most
 * specific prefix wins (/rates/kenya/net-salary is Tools, /rates/kenya is Rates & data). For institutions sits beside
 * the navigation as a quiet link (`institutionsNav`).
 */
export const nav = [
  { href: "/", label: "Today", short: "Today", hint: "The day in 30 seconds", match: [] },
  {
    href: "/receipts",
    label: "Stories",
    short: "Stories",
    hint: "Verdicts, briefs, explainers, the Casebook",
    match: ["/receipts", "/stories", "/brief", "/weekly", "/explainers", "/news", "/archive", "/topics", "/institutions", "/casebook"],
  },
  {
    href: "/numbers",
    label: "Rates & data",
    short: "Rates",
    hint: "Bills, bonds, currencies, savings rates",
    match: ["/numbers", "/markets", "/rates", "/data", "/countries", "/prices", "/east-africa", "/charts"],
  },
  { href: "/tools", label: "Tools", short: "Tools", hint: "Calculators and checkers", match: ["/tools", ...toolPaths] },
  { href: "/compare", label: "Compare", short: "Compare", hint: "Funds, SACCOs, lenders side by side", match: ["/compare", "/registry"] },
] as const;

export const institutionsNav = {
  href: "/for-institutions",
  label: "For institutions",
  match: ["/for-institutions", "/pricing", "/licensing", "/data-api", "/developers", "/advisory", "/advertise", "/buying", "/pack", "/watch"],
} as const;

/** The section a path belongs to: the nav item whose prefix matches most specifically (Today only on "/"). */
export function sectionFor(pathname: string) {
  if (pathname === "/") return "/";
  let best: { href: string; len: number } | null = null;
  for (const item of [...nav, institutionsNav]) {
    for (const prefix of item.match) {
      if ((pathname === prefix || pathname.startsWith(`${prefix}/`)) && (!best || prefix.length > best.len)) best = { href: item.href, len: prefix.length };
    }
  }
  return best?.href ?? null;
}

export const utilityNav = [
  { href: "/morning", label: "Morning" },
  { href: "/alerts", label: "Alerts" },
  { href: "/learn", label: "Learn" },
  { href: "/sw", label: "Kiswahili" },
] as const;

export const footerGroups = [
  {
    title: "Sections",
    links: [
      { href: "/", label: "Today" },
      { href: "/receipts", label: "Stories: the Receipts" },
      { href: "/numbers", label: "Rates & data" },
      { href: "/tools", label: "Tools and calculators" },
      { href: "/compare", label: "Compare" },
      { href: "/casebook", label: "Casebook" },
      { href: "/stories", label: "Briefs and explainers" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "/data/frontier-local-debt", label: "Frontier local debt data (institutions)" },
      { href: "/data/frontier-local-debt/monitor", label: "African Local-Currency Debt Monitor" },
      { href: "/markets/bonds", label: "Government bond auctions, by market" },
      { href: "/markets/auction-week", label: "This week in African debt auctions" },
      { href: "/east-africa", label: "East Africa rates today" },
      { href: "/markets/kenya-bonds", label: "Kenya bonds and yield curve" },
      { href: "/markets/tbills", label: "T-bill monitor" },
      { href: "/markets/kenya-tbills/auction", label: "Kenya auction: likely rates, did my bid win?" },
      { href: "/markets/kenya-tbills/call-it", label: "Call it: guess this week's T-bill rates" },
      { href: "/markets/kenya-tbills/calculator", label: "Treasury bill calculator" },
      { href: "/markets/ipo-calculator", label: "IPO calculator" },
      { href: "/markets/bill-index", label: "Sovereign Bill Index" },
      { href: "/markets/borrowing-costs", label: "Borrowing costs" },
      { href: "/markets/waemu-demand", label: "WAEMU auction demand" },
      { href: "/markets/eurobonds", label: "Eurobond yields" },
      { href: "/rates/policy", label: "Policy rates" },
      { href: "/rates/kenya", label: "Kenya rates compared" },
      { href: "/rates/kenya/money-market-funds", label: "Money market funds" },
      { href: "/rates/kenya/best-money-market-fund", label: "Best money market fund this month" },
      { href: "/rates/kenya/saccos", label: "SACCO rates" },
      { href: "/chama", label: "Chama Money Hub" },
      { href: "/rates/kenya/mobile-loans", label: "Mobile loan costs" },
      { href: "/rates/kenya/mpesa-charges", label: "M-PESA and Fuliza charges" },
      { href: "/rates/kenya/net-salary", label: "Net salary calculator" },
      { href: "/rates/kenya/loan-cost", label: "Loan true-cost calculator" },
      { href: "/rates/kenya/savings-goal", label: "Savings goal planner" },
      { href: "/rates/kenya/debt-plan", label: "Debt payoff planner" },
      { href: "/rates/kenya/inflation", label: "Inflation calculator" },
      { href: "/rates/kenya/loan-apps", label: "Is this loan app licensed?" },
      { href: "/rates/remittances", label: "Cost of sending money home" },
      { href: "/rates/what-readers-paid", label: "What readers paid" },
      { href: "/rates/kenya/check", label: "Is my rate fair? Kenya" },
      { href: "/rates/nigeria/check", label: "Is my rate fair? Nigeria" },
      { href: "/rates/ghana/check", label: "Is my rate fair? Ghana" },
      { href: "/countries", label: "54 country files" },
      { href: "/data", label: "Data hub" },
      { href: "/developers", label: "Open data API" },
      { href: "/data-api", label: "Afronomics Data (licensed API)" },
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
      { href: "/markets/bill-index/release", label: "ASBI weekly release" },
      { href: "/weekly", label: "Weekly" },
      { href: "/explainers", label: "Explainers" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/editorial-standards", label: "Editorial standards" },
      { href: "/trust", label: "Trust & data security" },
      { href: "/for-institutions", label: "For institutions" },
      { href: "/buying", label: "Buying for an institution" },
      { href: "/pricing", label: "Pricing" },
      { href: "/prices", label: "Price guide" },
      { href: "/pack", label: "Committee pack" },
      { href: "/advisory", label: "Research & advisory" },
      { href: "/advertise", label: "Advertise" },
      { href: "/subscribe", label: "Newsletter" },
      { href: "/press", label: "Press kit" },
      { href: "/contact", label: "Contact" },
      { href: "/corrections", label: "Corrections" },
    ],
  },
] as const;

/** Every page, grouped (site search reads this; the footer shows the shorter footerColumns below). */
export const footerNav = footerGroups.flatMap((group) => [...group.links]);

/** The footer: five balanced columns of short labels (rebuild brief, section 6). Full page list stays in footerGroups for search. */
export const footerColumns = [
  {
    title: "Rates & data",
    links: [
      { href: "/numbers", label: "All rates & data" },
      { href: "/markets/tbills", label: "T-bills" },
      { href: "/markets/bonds", label: "Bond auctions" },
      { href: "/markets/kenya-bonds", label: "Kenya bonds" },
      { href: "/rates/policy", label: "Policy rates" },
      { href: "/markets/eurobonds", label: "Eurobonds" },
      { href: "/data/inflation", label: "Inflation" },
      { href: "/countries", label: "Country files" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/compare", label: "All comparisons" },
      { href: "/rates/kenya", label: "Kenya rates" },
      { href: "/rates/kenya/money-market-funds", label: "Money market funds" },
      { href: "/rates/kenya/saccos", label: "SACCOs" },
      { href: "/rates/kenya/loan-apps", label: "Loan app checker" },
      { href: "/rates/kenya/mobile-loans", label: "Mobile loan costs" },
      { href: "/rates/remittances", label: "Sending money home" },
      { href: "/rates/what-readers-paid", label: "What readers paid" },
    ],
  },
  {
    title: "Stories",
    links: [
      { href: "/receipts", label: "All stories" },
      { href: "/stories", label: "Briefs & explainers" },
      { href: "/weekly", label: "Weekly" },
      { href: "/casebook", label: "Casebook" },
      { href: "/morning", label: "The Morning" },
      { href: "/morning/sw", label: "Asubuhi" },
      { href: "/alerts", label: "Alerts" },
      { href: "/tools", label: "Tools & calculators" },
      { href: "/chama", label: "Chama hub" },
    ],
  },
  {
    title: "For institutions",
    links: [
      { href: "/for-institutions", label: "Overview" },
      { href: "/data/frontier-local-debt", label: "Local debt data" },
      { href: "/data/frontier-local-debt/monitor", label: "Debt Monitor" },
      { href: "/data-api", label: "Data API" },
      { href: "/licensing", label: "Licensing" },
      { href: "/pricing", label: "Pricing" },
      { href: "/buying", label: "Buying guide" },
      { href: "/trust", label: "Trust & security" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/editorial-standards", label: "Standards" },
      { href: "/status", label: "Data status" },
      { href: "/developers", label: "Developers" },
      { href: "/advisory", label: "Research & advisory" },
      { href: "/advertise", label: "Advertise" },
      { href: "/subscribe", label: "Newsletter" },
      { href: "/press", label: "Press" },
      { href: "/contact", label: "Contact" },
      { href: "/widgets", label: "Widgets" },
    ],
  },
] as const;

/** The house line under the columns (rebuild brief, section 6): Method · Our record · Corrections · Learn · About · Kiswahili. */
export const footerLine = [
  { href: "/method", label: "Method" },
  { href: "/record", label: "Our record" },
  { href: "/corrections", label: "Corrections" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/sw", label: "Kiswahili" },
] as const;

export const disclaimer =
  "Afronomics publishes data, journalism and market intelligence for information only. It is not investment, legal or tax advice, and nothing here is a recommendation to buy, sell or hold any security. Third-party data remains the property of its publisher and is shown with attribution; headlines link to the original publisher.";

export const pricing = {
  free: {
    name: "Open",
    price: "$0",
    period: "",
    detail: "The Wire, all 54 country files, the data hub with history and CSV downloads, the Morning on the site and the weekly newsletter.",
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
