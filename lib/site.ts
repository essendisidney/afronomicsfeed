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
  /** LinkedIn company page. */
  linkedinUrl: "https://www.linkedin.com/company/afronomicsfeed/",
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

/** Grouped footer columns — keep each list short enough to scan. */
export const footerGroups = [
  {
    title: "Product",
    links: [
      { href: "/about", label: "About" },
      { href: "/pro", label: "Pro" },
      { href: "/subscribe", label: "Subscribe" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/layers", label: "Layers" },
      { href: "/coverage", label: "Coverage" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Desk",
    links: [
      { href: "/account", label: "Account" },
      { href: "/graph", label: "Graph" },
      { href: "/watchlists", label: "Watchlists" },
      { href: "/alerts", label: "Alerts" },
      { href: "/packs", label: "Packs" },
      { href: "/searches", label: "Searches" },
      { href: "/calendar", label: "Calendar" },
      { href: "/reports", label: "Reports" },
      { href: "/onboarding", label: "Onboarding" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "/sources", label: "Sources" },
      { href: "/compare", label: "Compare" },
      { href: "/exports", label: "Exports" },
      { href: "/regions", label: "Regions" },
      { href: "/industries", label: "Industries" },
      { href: "/cities", label: "Cities" },
      { href: "/agencies", label: "Agencies" },
      { href: "/glossary", label: "Glossary" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/developers", label: "Developers" },
      { href: "/sdk", label: "SDK" },
      { href: "/feeds", label: "Feeds" },
      { href: "/webhooks", label: "Webhooks" },
      { href: "/embeds", label: "Embeds" },
      { href: "/integrations", label: "Integrations" },
      { href: "/templates", label: "Templates" },
      { href: "/runbooks", label: "Runbooks" },
      { href: "/status", label: "Status" },
      { href: "/changelog", label: "Changelog" },
      { href: "/golive", label: "Go live" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/advisory", label: "Advisory" },
      { href: "/press", label: "Press" },
      { href: "/brand", label: "Brand" },
      { href: "/partners", label: "Partners" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
      { href: "/newsletters", label: "Newsletters" },
      { href: "/social", label: "Social" },
      { href: "/credits", label: "Credits" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/corrections", label: "Corrections" },
      { href: "/legal/disclaimer", label: "Disclaimer" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/imprint", label: "Imprint" },
      { href: "/trust", label: "Trust" },
      { href: "/security", label: "Security" },
      { href: "/sla", label: "SLA" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/licensing", label: "Licensing" },
    ],
  },
] as const;

/** Flat list for sitemap-style consumers. Prefer footerGroups in UI. */
export const footerNav = footerGroups.flatMap((group) => [...group.links]);

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
