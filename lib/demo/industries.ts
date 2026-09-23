import { countries } from "./countries";

export const industries = [
  {
    slug: "banking",
    label: "Banking & finance",
    lede: "Issuers, books and the official tape. Ratios stay blank until a cited statement exists.",
    aliases: ["Banks", "Banking", "Finance", "Capital markets"],
  },
  {
    slug: "energy",
    label: "Energy",
    lede: "Power, hydrocarbons and renewables. Capacity cells unpublished until a licensed series is stored.",
    aliases: ["Energy", "Oil", "Oil & gas", "Power", "LNG", "Renewables"],
  },
  {
    slug: "mining",
    label: "Mining",
    lede: "Metals and extractives. Output stays unnamed without a primary print.",
    aliases: ["Mining", "Gold", "Copper", "Uranium", "Phosphates"],
  },
  {
    slug: "agriculture",
    label: "Agriculture",
    lede: "Crops, livestock and softs. No invented harvest or price.",
    aliases: ["Agriculture", "Cocoa", "Livestock"],
  },
  {
    slug: "telecoms",
    label: "Telecoms",
    lede: "Operators and spectrum. Issuer financials live on the company file.",
    aliases: ["Telecoms", "ICT"],
  },
  {
    slug: "logistics",
    label: "Logistics & ports",
    lede: "Corridors and gateways. Volumes stay blank until a customs or port series is stored.",
    aliases: ["Logistics", "Ports", "Suez / trade"],
  },
  {
    slug: "infrastructure",
    label: "Infrastructure",
    lede: "Projects and concessions. Amounts need a cited facility.",
    aliases: ["Infrastructure"],
  },
  {
    slug: "tourism",
    label: "Tourism",
    lede: "Arrivals and receipts unpublished until a national series is stored.",
    aliases: ["Tourism"],
  },
  {
    slug: "consumer",
    label: "Consumer",
    lede: "Retail and household demand. Activity proxies stay methodology until sourced.",
    aliases: ["Consumer", "Retail"],
  },
  {
    slug: "fintech",
    label: "Fintech",
    lede: "Rails and licensing. Rounds stay blank until a cited close exists.",
    aliases: ["Fintech"],
  },
  {
    slug: "insurance",
    label: "Insurance",
    lede: "Licences and solvency. Filed against the issuing regulator when tagged.",
    aliases: ["Insurance"],
  },
  {
    slug: "industry",
    label: "Industry",
    lede: "Manufacturing and services. Output cells empty until a cited series exists.",
    aliases: ["Industry", "Services", "Apparel", "Timber", "Aviation", "Water", "Real estate", "Remittances"],
  },
] as const;

export function getIndustry(slug: string) {
  return industries.find((item) => item.slug === slug);
}

export function industryFileHref(industrySlug: string, countrySlug: string) {
  return `/industries/${industrySlug}/${countrySlug}`;
}

export function industriesForCountry(countrySlug: string) {
  const country = countries.find((item) => item.slug === countrySlug);
  if (!country) return [];
  return industries.filter((industry) => country.sectors.some((sector) => (industry.aliases as readonly string[]).includes(sector)));
}

export function countriesForIndustry(industrySlug: string) {
  const industry = getIndustry(industrySlug);
  if (!industry) return [];
  return countries.filter((country) => country.sectors.some((sector) => (industry.aliases as readonly string[]).includes(sector)));
}

export function industryForCompanySector(sector: string) {
  const lower = sector.toLowerCase();
  if (lower.includes("bank")) return getIndustry("banking");
  if (lower.includes("telecom") || lower.includes("payment")) return getIndustry("telecoms");
  if (lower.includes("energ") || lower.includes("oil") || lower.includes("power")) return getIndustry("energy");
  if (lower.includes("min")) return getIndustry("mining");
  if (lower.includes("agri") || lower.includes("cocoa")) return getIndustry("agriculture");
  if (lower.includes("fintech")) return getIndustry("fintech");
  if (lower.includes("insur")) return getIndustry("insurance");
  return industries.find((item) => item.aliases.some((alias) => lower.includes(alias.toLowerCase())));
}

export function industryCountryParams() {
  return industries.flatMap((industry) => countries.map((country) => ({ slug: industry.slug, country: country.slug })));
}
