export const site = {
  name: "Afronomics",
  legalName: "Afronomics Feed",
  tagline: "Africa’s economic intelligence, sourced",
  line: "Markets · Economy · Capital · Climate · Technology",
  promise: "Every African market, economy and capital flow in one place — each number linked to the publisher that printed it.",
  /** Canonical host. The apex domain redirects here (vercel.json). */
  url: "https://www.afronomicsfeed.com",
  houseCredit: "A Pesara company",
  houseUrl: "https://pesara.com",
  locale: "en",
  description:
    "Live data, headlines and development-finance flows for all 54 African economies. Currencies, growth, inflation, debt, FDI, climate and technology — every figure sourced and downloadable.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "desk@afronomicsfeed.com",
  linkedinUrl: "https://www.linkedin.com/company/afronomicsfeed/",
} as const;

export const nav = [
  { href: "/news", label: "Wire" },
  { href: "/markets", label: "Markets" },
  { href: "/economy", label: "Economy" },
  { href: "/capital", label: "Capital" },
  { href: "/climate", label: "Climate" },
  { href: "/technology", label: "Technology" },
  { href: "/trade", label: "Trade" },
  { href: "/countries", label: "Countries" },
  { href: "/data", label: "Data" },
  { href: "/brief", label: "Analysis" },
] as const;

export const utilityNav = [
  { href: "/weekly", label: "Weekly" },
  { href: "/signals", label: "Signals" },
  { href: "/method", label: "Sources" },
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
      { href: "/markets/borrowing-costs", label: "Borrowing costs" },
      { href: "/countries", label: "54 country files" },
      { href: "/data", label: "Data hub" },
      { href: "/developers", label: "Data API" },
      { href: "/signals", label: "Signals" },
      { href: "/widgets", label: "Free widgets" },
      { href: "/licensing", label: "Data licensing" },
      { href: "/method", label: "Sources & method" },
    ],
  },
  {
    title: "Analysis",
    links: [
      { href: "/brief", label: "Briefs" },
      { href: "/weekly", label: "Weekly" },
      { href: "/explainers", label: "Explainers" },
      { href: "/archive", label: "Archive" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
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
    price: "$29",
    period: "/mo",
    detail: "Every brief and weekly analysis in full, plus country and indicator alerts by email as they launch.",
  },
  professional: {
    name: "Team",
    price: "$149",
    period: "/mo",
    detail: "Five Pro seats on one invoice, bulk exports, and priority requests for new datasets.",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "",
    detail: "Licensed data feeds, embedded widgets, white-label country files and commissioned research.",
  },
  trial: {
    name: "Kenya desk trial",
    price: "KES 500",
    detail: "Fourteen days of Pro, paid locally by M-Pesa or card through Paystack.",
  },
} as const;
