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
      href: "/ingestion",
      title: "Ingestion",
      kicker: "Ops",
      summary: "Job board. Nothing scheduled against a live queue.",
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
