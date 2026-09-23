export const site = {
  name: "Afronomics",
  legalName: "Afronomics Feed",
  tagline: "Africa’s Economic Intelligence Layer",
  line: "Markets. Money. Climate. Technology. Africa.",
  promise: "What happened. Why it matters. What changed. Who is exposed. What to watch.",
  url: "https://afronomicsfeed.com",
  houseCredit: "A product of Pesara",
  houseUrl: "https://pesara.com",
  locale: "en",
  description:
    "Structured economic, market, capital, climate and technology intelligence for Africa. News connected to data, signals and decisions — not a generic news site.",
  nseTapeUrl: "https://www.nse.co.ke/",
  cbkUrl: "https://www.centralbank.go.ke/",
  cmaUrl: "https://www.cma.or.ke/",
  sasraUrl: "https://www.sasra.go.ke/",
  iraUrl: "https://www.ira.go.ke/",
} as const;

export const nav = [
  { href: "/markets", label: "Markets" },
  { href: "/economy", label: "Economy" },
  { href: "/capital", label: "Capital" },
  { href: "/climate", label: "Climate" },
  { href: "/technology", label: "Technology" },
  { href: "/trade", label: "Trade" },
  { href: "/companies", label: "Companies" },
  { href: "/countries", label: "Countries" },
  { href: "/data", label: "Data" },
  { href: "/opinion", label: "Opinion" },
] as const;

export const utilityNav = [
  { href: "/brief", label: "Brief" },
  { href: "/signals", label: "Signals" },
  { href: "/ask", label: "Ask" },
  { href: "/terminal", label: "Terminal" },
] as const;

export const deskNav = [
  { href: "/today", label: "Morning file" },
  { href: "/brief", label: "Daily Brief" },
  { href: "/weekly", label: "Weekly" },
  { href: "/explainers", label: "Explainers" },
  { href: "/institutions", label: "Institutions" },
  { href: "/topics", label: "Topics" },
  { href: "/trackers", label: "Trackers" },
  { href: "/archive", label: "Archive" },
  { href: "/method", label: "Method" },
] as const;

export const footerNav = [
  { href: "/about", label: "About" },
  { href: "/pro", label: "Pro" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/advisory", label: "Advisory" },
  { href: "/corrections", label: "Corrections" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/account", label: "Account" },
  { href: "/graph", label: "Graph" },
  { href: "/watchlists", label: "Watchlists" },
  { href: "/alerts", label: "Alerts" },
  { href: "/exports", label: "Exports" },
  { href: "/packs", label: "Packs" },
  { href: "/sources", label: "Sources" },
  { href: "/compare", label: "Compare" },
  { href: "/feeds", label: "Feeds" },
  { href: "/status", label: "Status" },
  { href: "/searches", label: "Searches" },
  { href: "/licensing", label: "Licensing" },
  { href: "/reports", label: "Reports" },
  { href: "/changelog", label: "Changelog" },
  { href: "/calendar", label: "Calendar" },
  { href: "/partners", label: "Partners" },
  { href: "/industries", label: "Industries" },
  { href: "/agencies", label: "Agencies" },
  { href: "/cities", label: "Cities" },
  { href: "/developers", label: "Developers" },
] as const;

export const disclaimer =
  "Afronomics Feed publishes general journalism and market intelligence. It is not personalized financial advice. Nothing on this site is a recommendation to buy, sell, or hold any security, instrument, or deposit. Demonstration figures are labelled Demo Data or Methodology Under Development and are not official prints.";

export const pricing = {
  free: {
    name: "Free",
    cadence: "Always",
    price: "$0",
    detail: "Headlines, basic country pages, Morning Brief teasers, limited search.",
  },
  pro: {
    name: "Pro",
    cadence: "Monthly",
    price: "$29",
    period: "/mo",
    detail: "Deep analysis, capital and climate explorers, alerts, saved watches.",
  },
  professional: {
    name: "Professional",
    cadence: "Monthly",
    price: "$149",
    period: "/mo",
    detail: "Exports, API allowance, project lens, advanced watchlists.",
  },
  enterprise: {
    name: "Enterprise",
    cadence: "Custom",
    price: "Contact",
    detail: "Feeds, licences, research, white-label terminals.",
  },
  trial: {
    name: "14-day Kenya desk trial",
    price: "KES 500",
    detail: "Local on-ramp to Individual desk memos. Checkout not live.",
  },
} as const;
