import { getAllArticles, toIndexItem } from "./content";
import { companies } from "./demo/companies";
import { countries } from "./demo/countries";
import { askQuestions } from "./demo/ask";
import { datasets } from "./demo/datasets";
import { techLenses } from "./demo/tech";
import { corridors, ports } from "./demo/trade";
import { industries } from "./demo/industries";
import { agencyKinds } from "./demo/agencies";
import { cities, cityCountryName } from "./demo/cities";
import { investors } from "./demo/investors";
import { personRoles } from "./demo/people";
import { articleHref, categoryLabel } from "./format";
import { nav, utilityNav } from "./site";

export type SearchHit = {
  href: string;
  title: string;
  kicker: string;
  summary: string;
};

export function buildSearchIndex(): SearchHit[] {
  const articles = getAllArticles().map(toIndexItem).map((article) => ({
    href: articleHref(article.category, article.slug),
    title: article.title,
    kicker: categoryLabel(article.category),
    summary: article.summary,
  }));

  const countryHits = countries.map((country) => ({
    href: `/countries/${country.slug}`,
    title: country.name,
    kicker: `Country · ${country.region}`,
    summary: `${country.iso} · ${country.currency} · ${country.sectors.join(", ")}`,
  }));

  const companyHits = companies.map((company) => ({
    href: `/companies/${company.slug}`,
    title: company.name,
    kicker: `Company · ${company.country}`,
    summary: company.sector,
  }));

  const corridorHits = corridors.map((corridor) => ({
    href: `/trade/${corridor.slug}`,
    title: corridor.name,
    kicker: "Trade corridor",
    summary: corridor.geography,
  }));

  const economyHits = countries.map((country) => ({
    href: `/economy/${country.slug}`,
    title: `${country.name} economy`,
    kicker: "Economy file",
    summary: `Macro file for ${country.name}. Pulse unpublished until a primary series is stored.`,
  }));

  const techHits = techLenses.map((lens) => ({
    href: `/technology/${lens.slug}`,
    title: lens.label,
    kicker: "Technology lens",
    summary: lens.lede,
  }));

  const portHits = ports.map((port) => ({
    href: `/trade/ports/${port.slug}`,
    title: port.name,
    kicker: "Port",
    summary: port.waters,
  }));

  const askHits = askQuestions.map((item) => ({
    href: `/ask/${item.slug}`,
    title: item.title,
    kicker: "Ask file",
    summary: item.lede,
  }));

  const dataHits = datasets.map((item) => ({
    href: `/data/${item.slug}`,
    title: item.name,
    kicker: "Data file",
    summary: item.lede,
  }));

  const industryHits = industries.map((item) => ({
    href: `/industries/${item.slug}`,
    title: item.label,
    kicker: "Industry",
    summary: item.lede,
  }));

  const agencyHits = agencyKinds.map((kind) => ({
    href: `/agencies/${kind.slug}`,
    title: kind.label,
    kicker: "Agency",
    summary: kind.lede,
  }));

  const cityHits = cities.map((city) => ({
    href: `/cities/${city.slug}`,
    title: city.name,
    kicker: "City",
    summary: `${city.role} · ${cityCountryName(city)}`,
  }));

  const investorHits = investors.map((investor) => ({
    href: `/investors/${investor.slug}`,
    title: investor.name,
    kicker: "Investor · EXAMPLE",
    summary: investor.lede,
  }));

  const peopleHits = personRoles.map((role) => ({
    href: `/people/${role.slug}`,
    title: role.label,
    kicker: "Role",
    summary: role.lede,
  }));

  const navHits = [...nav, ...utilityNav].map((item) => ({
    href: item.href,
    title: item.label,
    kicker: "Layer",
    summary: `Open the ${item.label} intelligence layer`,
  }));

  return [
    ...articles,
    ...countryHits,
    ...companyHits,
    ...corridorHits,
    ...economyHits,
    ...techHits,
    ...portHits,
    ...askHits,
    ...dataHits,
    ...industryHits,
    ...agencyHits,
    ...cityHits,
    ...investorHits,
    ...peopleHits,
    {
      href: "/developers",
      title: "Developers",
      kicker: "API",
      summary: "Public routes. Keys are not issued.",
    },
    {
      href: "/account",
      title: "Account",
      kicker: "Seat",
      summary: "Seat status. Sign-in and billing are not live.",
    },
    {
      href: "/pricing",
      title: "Pricing",
      kicker: "Seats",
      summary: "Free, Pro, Professional, Enterprise and Kenya desk trial.",
    },
    {
      href: "/graph",
      title: "Graph",
      kicker: "Knowledge graph",
      summary: "Kenya desk edges and entity resolution stubs.",
    },
    {
      href: "/graph/kenya",
      title: "Kenya graph desk",
      kicker: "Graph",
      summary: "Typed edges from Kenya to CBK, NSE, corridors and issuers.",
    },
    {
      href: "/watchlists",
      title: "Watchlists",
      kicker: "Seat",
      summary: "Saved watches require Auth. Templates only until then.",
    },
    {
      href: "/alerts",
      title: "Alerts",
      kicker: "Seat",
      summary: "Alert kinds for prints and filings. Delivery not live.",
    },
    {
      href: "/exports",
      title: "Exports",
      kicker: "Professional",
      summary: "Extract packages. No download without a live seat.",
    },
    {
      href: "/ask/corpus",
      title: "Ask corpus",
      kicker: "Ask",
      summary: "Document slots for retrieval. Index empty.",
    },
    {
      href: "/method/registry",
      title: "Method registry",
      kicker: "Method",
      summary: "House standards and data methods. Draft rows stay unfinished.",
    },
    {
      href: "/account/usage",
      title: "Usage",
      kicker: "Seat",
      summary: "Allowances for Ask, exports and API. Meters stay at zero.",
    },
    {
      href: "/packs",
      title: "Briefing packs",
      kicker: "Brief",
      summary: "Packaged morning and weekly shapes. Delivery not live.",
    },
    {
      href: "/sources",
      title: "Source registry",
      kicker: "Method",
      summary: "Official doors. Pending rows are not production citations.",
    },
    {
      href: "/compare",
      title: "Compare desks",
      kicker: "Countries",
      summary: "Featured desk matrix. Observation cells stay blank.",
    },
    {
      href: "/agents",
      title: "Agents",
      kicker: "Ops",
      summary: "Daily World Bank reader. A cell stays empty when the response has no number.",
    },
    {
      href: "/ingestion",
      title: "Ingestion",
      kicker: "Ops",
      summary: "Prints agent is scheduled. The other jobs stay stubbed.",
    },
    {
      href: "/feeds",
      title: "Feeds",
      kicker: "Enterprise",
      summary: "Feed catalogue. No licensed delivery yet.",
    },
    {
      href: "/status",
      title: "Status",
      kicker: "Ops",
      summary: "What is live, scaffold, or offline. No fake uptime.",
    },
    {
      href: "/searches",
      title: "Saved searches",
      kicker: "Seat",
      summary: "Search templates. Store empty until Auth.",
    },
    {
      href: "/licensing",
      title: "Licensing",
      kicker: "Enterprise",
      summary: "Licence catalogue. No fake quotes.",
    },
    {
      href: "/notifications",
      title: "Notifications",
      kicker: "Seat",
      summary: "Channels offline. Prefs require Auth.",
    },
    {
      href: "/changelog",
      title: "Changelog",
      kicker: "Product",
      summary: "Shipped shells by phase. No vanity KPIs.",
    },
    {
      href: "/audit",
      title: "Audit",
      kicker: "Editorial",
      summary: "CMS action kinds. Event store empty.",
    },
    {
      href: "/reports",
      title: "Reports",
      kicker: "Research",
      summary: "Research memo shells. Published stays zero.",
    },
    {
      href: "/calendar",
      title: "Calendar",
      kicker: "Desk",
      summary: "MPC and desk slots. Dates blank until cited.",
    },
    {
      href: "/partners",
      title: "Partners",
      kicker: "Commercial",
      summary: "Sponsor inventory empty. Editorial stays separate.",
    },
    {
      href: "/coverage",
      title: "Coverage",
      kicker: "Ops",
      summary: "Honest scaffold counts. No vanity completion score.",
    },
    {
      href: "/glossary",
      title: "Glossary",
      kicker: "Method",
      summary: "House terms linked to method files.",
    },
    {
      href: "/onboarding",
      title: "Onboarding",
      kicker: "Seat",
      summary: "New-desk path. Progress empty until Auth.",
    },
    {
      href: "/webhooks",
      title: "Webhooks",
      kicker: "Enterprise",
      summary: "Callback catalogue. Nothing armed or delivered.",
    },
    {
      href: "/regions",
      title: "Regions",
      kicker: "Countries",
      summary: "Five regional hubs. Empty cells stay empty.",
    },
    {
      href: "/runbooks",
      title: "Runbooks",
      kicker: "Editorial",
      summary: "Desk SOP shells. Empty until steps are filed.",
    },
    {
      href: "/layers",
      title: "Intelligence layers",
      kicker: "Product",
      summary: "NEWS → DATA → CONTEXT → SIGNALS → DECISIONS.",
    },
    {
      href: "/press",
      title: "Press",
      kicker: "Media",
      summary: "Media kit shells. No invented KPI downloads.",
    },
    {
      href: "/golive",
      title: "Go live",
      kicker: "Ops",
      summary: "Gates before official prints. Blocked stays blocked.",
    },
    {
      href: "/social",
      title: "Social",
      kicker: "LinkedIn",
      summary: "Company page + share intents. No fake reach.",
    },
    {
      href: "/embeds",
      title: "Embeds",
      kicker: "Enterprise",
      summary: "Widget catalogue. No iframe issued without a licence.",
    },
    {
      href: "/security",
      title: "Security",
      kicker: "Trust",
      summary: "Control list. No invented SOC 2 badge.",
    },
    {
      href: "/integrations",
      title: "Integrations",
      kicker: "Delivery",
      summary: "Slack, Teams, email doors. Nothing connected without a licence.",
    },
    {
      href: "/sla",
      title: "SLA",
      kicker: "Enterprise",
      summary: "Service commitments. No invented uptime %.",
    },
    {
      href: "/brand",
      title: "Brand",
      kicker: "Identity",
      summary: "Names and voice live on site. No fake logo ZIP.",
    },
    {
      href: "/roadmap",
      title: "Roadmap",
      kicker: "Product",
      summary: "Shipped / scaffold / blocked. No invented ship dates.",
    },
    {
      href: "/accessibility",
      title: "Accessibility",
      kicker: "Trust",
      summary: "Honest posture. No WCAG badge invent.",
    },
    {
      href: "/sdk",
      title: "SDK",
      kicker: "Developers",
      summary: "Client catalogue. No package published.",
    },
    {
      href: "/templates",
      title: "Templates",
      kicker: "Desk",
      summary: "Brief and pack outlines. No fake fills.",
    },
    {
      href: "/support",
      title: "Support",
      kicker: "Help",
      summary: "Open doors only. No fake ticket queue.",
    },
    {
      href: "/newsletters",
      title: "Newsletters",
      kicker: "Delivery",
      summary: "Digest catalogue. Nothing sent from this build.",
    },
    {
      href: "/careers",
      title: "Careers",
      kicker: "House",
      summary: "Role shapes. No invented openings.",
    },
    {
      href: "/contact",
      title: "Contact",
      kicker: "House",
      summary: "Doors only. No fake form delivery.",
    },
    {
      href: "/faq",
      title: "FAQ",
      kicker: "Help",
      summary: "Straight answers. No invented coverage claims.",
    },
    {
      href: "/legal/cookies",
      title: "Cookies",
      kicker: "Legal",
      summary: "Cookie posture. No fake consent banner.",
    },
    {
      href: "/trust",
      title: "Trust",
      kicker: "Trust",
      summary: "Method, security, SLA and go-live in one door.",
    },
    {
      href: "/credits",
      title: "Credits",
      kicker: "House",
      summary: "Pesara and stack acknowledgements. No fake partners.",
    },
    {
      href: "/manifesto",
      title: "Manifesto",
      kicker: "Product",
      summary: "Empty until sourced. Cite or refuse.",
    },
    {
      href: "/imprint",
      title: "Imprint",
      kicker: "Legal",
      summary: "Publisher notice. Empty legal fields stay empty.",
    },
    {
      href: "/syndication",
      title: "Syndication",
      kicker: "Build",
      summary: "RSS, sitemap and status doors. No invented audience.",
    },
    {
      href: "/notices",
      title: "Notices",
      kicker: "Legal",
      summary: "House notice slots. Nothing posted.",
    },
    {
      href: "/languages",
      title: "Languages",
      kicker: "Product",
      summary: "English is live. Other editions stay empty.",
    },
    {
      href: "/units",
      title: "Units",
      kicker: "Data",
      summary: "Unit words. No series stored.",
    },
    {
      href: "/correspondents",
      title: "Correspondents",
      kicker: "Company",
      summary: "Desk seats. No invented bylines.",
    },
    {
      href: "/citations",
      title: "Citations",
      kicker: "Data",
      summary: "Citation shapes. No sample print.",
    },
    {
      href: "/corridors",
      title: "Corridors",
      kicker: "Data",
      summary: "Named trade routes. No volumes stored.",
    },
    {
      href: "/identifiers",
      title: "Identifiers",
      kicker: "Data",
      summary: "Code words. No crosswalk or sample ticker.",
    },
    {
      href: "/series",
      title: "Series",
      kicker: "Data",
      summary: "Series shapes. No observation stored.",
    },
    {
      href: "/revisions",
      title: "Revisions",
      kicker: "Legal",
      summary: "Revision shapes. Nothing posted.",
    },
    {
      href: "/classifications",
      title: "Classifications",
      kicker: "Data",
      summary: "Grouping words. No code table.",
    },
    {
      href: "/releases",
      title: "Releases",
      kicker: "Desk",
      summary: "Release shapes. No date scheduled.",
    },
    {
      href: "/datelines",
      title: "Datelines",
      kicker: "Desk",
      summary: "Places only. No story filed.",
    },
    {
      href: "/borders",
      title: "Borders",
      kicker: "Data",
      summary: "Border shapes. No dwell stored.",
    },
    {
      href: "/customs",
      title: "Customs",
      kicker: "Legal",
      summary: "Customs shapes. Nothing filed.",
    },
    {
      href: "/modes",
      title: "Modes",
      kicker: "Data",
      summary: "Port, road and rail words. No tonnage.",
    },
    {
      href: "/observations",
      title: "Observations",
      kicker: "Data",
      summary: "One print. No dated observation stored.",
    },
    {
      href: "/frequencies",
      title: "Frequencies",
      kicker: "Data",
      summary: "Daily, monthly, annual. No calendar stored.",
    },
    {
      href: "/vintages",
      title: "Vintages",
      kicker: "Legal",
      summary: "Restatement shapes. Nothing posted.",
    },
    {
      href: "/lineage",
      title: "Lineage",
      kicker: "Data",
      summary: "Source chain shapes. Nothing recorded.",
    },
    {
      href: "/gaps",
      title: "Gaps",
      kicker: "Data",
      summary: "Missing-print shapes. No date stored.",
    },
    {
      href: "/periods",
      title: "Periods",
      kicker: "Data",
      summary: "Week, quarter, year. No window stored.",
    },
    {
      href: "/lags",
      title: "Lags",
      kicker: "Data",
      summary: "Publication delay shapes. Nothing stored.",
    },
    {
      href: "/benchmarks",
      title: "Benchmarks",
      kicker: "Desk",
      summary: "Reference-print shapes. No rate stored.",
    },
    {
      href: "/baskets",
      title: "Baskets",
      kicker: "Data",
      summary: "Named sets. No weight stored.",
    },
    {
      href: "/thresholds",
      title: "Thresholds",
      kicker: "Desk",
      summary: "Level shapes. No number stored.",
    },
    {
      href: "/peers",
      title: "Peers",
      kicker: "Data",
      summary: "Comparison sets. None stored.",
    },
    {
      href: "/weights",
      title: "Weights",
      kicker: "Data",
      summary: "Share shapes. No weight stored.",
    },
    {
      href: "/constituents",
      title: "Constituents",
      kicker: "Data",
      summary: "Member shapes. None stored.",
    },
    {
      href: "/horizons",
      title: "Horizons",
      kicker: "Desk",
      summary: "Short, medium, long. No forecast stored.",
    },
    {
      href: "/baselines",
      title: "Baselines",
      kicker: "Data",
      summary: "Starting-print shapes. None stored.",
    },
    {
      href: "/spreads",
      title: "Spreads",
      kicker: "Data",
      summary: "Gap shapes. No spread stored.",
    },
    {
      href: "/seasons",
      title: "Seasons",
      kicker: "Desk",
      summary: "Crop, fiscal, calendar. No window stored.",
    },
    {
      href: "/adjustments",
      title: "Adjustments",
      kicker: "Data",
      summary: "Method-change shapes. No factor stored.",
    },
    {
      href: "/footnotes",
      title: "Footnotes",
      kicker: "Desk",
      summary: "Caveat shapes. None stored.",
    },
    {
      href: "/scales",
      title: "Scales",
      kicker: "Desk",
      summary: "Level, index, log. No transform stored.",
    },
    {
      href: "/precision",
      title: "Precision",
      kicker: "Data",
      summary: "Fineness shapes. None stored.",
    },
    {
      href: "/rounding",
      title: "Rounding",
      kicker: "Desk",
      summary: "Rounding shapes. No convention stored.",
    },
    {
      href: "/crosswalks",
      title: "Crosswalks",
      kicker: "Data",
      summary: "Code-map shapes. None stored.",
    },
    {
      href: "/aliases",
      title: "Aliases",
      kicker: "Data",
      summary: "Other-name shapes. None stored.",
    },
    {
      href: "/embargoes",
      title: "Embargoes",
      kicker: "Desk",
      summary: "Hold shapes. None stored.",
    },
    {
      href: "/sessions",
      title: "Sessions",
      kicker: "Desk",
      summary: "Open, auction, close. No clock time stored.",
    },
    {
      href: "/holidays",
      title: "Holidays",
      kicker: "Data",
      summary: "Closure shapes. No date stored.",
    },
    {
      href: "/factors",
      title: "Factors",
      kicker: "Data",
      summary: "Conversion shapes. None stored.",
    },
    {
      href: "/tenors",
      title: "Tenors",
      kicker: "Desk",
      summary: "Short, medium, long. No maturity date stored.",
    },
    {
      href: "/grades",
      title: "Grades",
      kicker: "Data",
      summary: "Specification shapes. None stored.",
    },
    {
      href: "/flags",
      title: "Flags",
      kicker: "Data",
      summary: "Missing, provisional, revised. No mark stored.",
    },
    {
      href: "/windows",
      title: "Windows",
      kicker: "Data",
      summary: "Span shapes. No window stored.",
    },
    {
      href: "/cutoffs",
      title: "Cutoffs",
      kicker: "Desk",
      summary: "Stop shapes. No clock time stored.",
    },
    {
      href: "/stamps",
      title: "Stamps",
      kicker: "Data",
      summary: "As-of shapes. No date stored.",
    },
    {
      href: "/breaks",
      title: "Breaks",
      kicker: "Data",
      summary: "Split shapes. None stored.",
    },
    {
      href: "/curves",
      title: "Curves",
      kicker: "Data",
      summary: "Plot shapes. None stored.",
    },
    {
      href: "/fixes",
      title: "Fixes",
      kicker: "Desk",
      summary: "Fixing shapes. No rate stored.",
    },
    {
      href: "/lots",
      title: "Lots",
      kicker: "Data",
      summary: "Parcel shapes. None stored.",
    },
    {
      href: "/quotes",
      title: "Quotes",
      kicker: "Desk",
      summary: "Bid, ask, last. No price stored.",
    },
    {
      href: "/contracts",
      title: "Contracts",
      kicker: "Data",
      summary: "Spot, forward, swap. None stored.",
    },
    {
      href: "/samples",
      title: "Samples",
      kicker: "Data",
      summary: "Draw shapes. None stored.",
    },
    {
      href: "/indices",
      title: "Indices",
      kicker: "Data",
      summary: "Basket shapes. None stored.",
    },
    {
      href: "/manifests",
      title: "Manifests",
      kicker: "Desk",
      summary: "Cargo-list shapes. None stored.",
    },
    {
      href: "/parcels",
      title: "Parcels",
      kicker: "Data",
      summary: "Shipment shapes. None stored.",
    },
    {
      href: "/draws",
      title: "Draws",
      kicker: "Data",
      summary: "Selection shapes. None stored.",
    },
    {
      href: "/settlements",
      title: "Settlements",
      kicker: "Desk",
      summary: "Clearing shapes. None stored.",
    },
    {
      href: "/positions",
      title: "Positions",
      kicker: "Data",
      summary: "Holding shapes. None stored.",
    },
    {
      href: "/auctions",
      title: "Auctions",
      kicker: "Desk",
      summary: "Sale shapes. None stored.",
    },
    {
      href: "/ledgers",
      title: "Ledgers",
      kicker: "Build",
      summary: "Book shapes. None stored.",
    },
    ...navHits,
  ];
}

export function searchIndex(query: string, index = buildSearchIndex(), limit = 24): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, 8);
  return index
    .filter((hit) => `${hit.title} ${hit.kicker} ${hit.summary}`.toLowerCase().includes(q))
    .slice(0, limit);
}
