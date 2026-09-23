import { institutions, type TopicSlug } from "@/lib/taxonomy";
import { ticker } from "./markets";
import { countries, type CountryProfile } from "./countries";

export type CountrySeriesSlug =
  | "pulse"
  | "economy"
  | "markets"
  | "capital"
  | "climate"
  | "technology"
  | "trade"
  | "policy"
  | "companies"
  | "energy";

export type CountryDoor = {
  label: string;
  href: string;
  kind: "central-bank" | "exchange" | "treasury" | "regulator" | "stats";
};

export type CountrySeries = {
  slug: CountrySeriesSlug;
  name: string;
  lede: string;
  watches: string[];
  indicators: string[];
  deskTopics: TopicSlug[];
};

export const countrySeries: CountrySeries[] = [
  {
    slug: "pulse",
    name: "Pulse",
    lede: "A country score is not in production. This file holds the shape of the terminal until a verified series exists.",
    watches: ["Growth", "Inflation", "FX", "Debt", "Capital"],
    indicators: ["gdp", "inflation", "policy-rate", "public-debt"],
    deskTopics: [],
  },
  {
    slug: "economy",
    name: "Economy",
    lede: "National accounts, prices and the fiscal stock. Cells stay blank until a cited primary print is stored.",
    watches: ["GDP", "Inflation", "Public debt", "Fiscal"],
    indicators: ["gdp", "inflation", "public-debt"],
    deskTopics: [],
  },
  {
    slug: "markets",
    name: "Markets",
    lede: "Currency, the official exchange door, and the policy-rate file. Afronomics does not redistribute a live tape.",
    watches: ["FX", "Policy rate", "Listed market"],
    indicators: ["policy-rate"],
    deskTopics: ["treasury-bills", "money-markets", "nse-disclosures"],
  },
  {
    slug: "capital",
    name: "Capital",
    lede: "FDI, DFI books and announced commitments. The tracker is empty until a sourced flow lands.",
    watches: ["FDI", "DFI", "Commitments"],
    indicators: ["fdi"],
    deskTopics: [],
  },
  {
    slug: "climate",
    name: "Climate",
    lede: "Climate capital, energy mix and the funding gap. Methodology only — no invented project book.",
    watches: ["Committed", "Deployed", "Gap"],
    indicators: [],
    deskTopics: [],
  },
  {
    slug: "technology",
    name: "Technology",
    lede: "Funding, regulation and the startup database. No invented rounds.",
    watches: ["Funding", "Regulation", "Failures"],
    indicators: [],
    deskTopics: [],
  },
  {
    slug: "trade",
    name: "Trade",
    lede: "Corridors, ports and the trade balance. Volumes publish only from a cited customs or corridor series.",
    watches: ["Trade balance", "Corridors", "Ports"],
    indicators: [],
    deskTopics: [],
  },
  {
    slug: "policy",
    name: "Policy",
    lede: "The official doors — central bank, treasury, markets conduct. Read the primary document; do not invent the print.",
    watches: ["Monetary", "Supervision", "Conduct"],
    indicators: ["policy-rate"],
    deskTopics: ["mpc", "bank-supervision", "capital-markets-conduct"],
  },
  {
    slug: "companies",
    name: "Companies",
    lede: "Issuers and sector names on the graph. A company file opens when a disclosure is tagged — not before.",
    watches: ["Listed banks", "Issuers", "Sectors"],
    indicators: [],
    deskTopics: ["listed-banks"],
  },
  {
    slug: "energy",
    name: "Energy",
    lede: "Power, hydrocarbons and the project lens. Capacity cells stay empty until a licensed series exists.",
    watches: ["Capacity", "Projects", "Mix"],
    indicators: [],
    deskTopics: [],
  },
];

export function getCountrySeries(slug: string) {
  return countrySeries.find((item) => item.slug === slug);
}

export const countrySeriesSlugs = countrySeries.map((item) => item.slug);

const extraDoors: Partial<Record<string, CountryDoor[]>> = {
  kenya: institutions.map((item) => ({
    label: item.short,
    href: item.url,
    kind: item.slug === "treasury" ? "treasury" : item.slug === "nse" ? "exchange" : item.slug === "cbk" ? "central-bank" : "regulator",
  })),
  nigeria: [{ label: "NGX", href: "https://ngxgroup.com/", kind: "exchange" }],
  "south-africa": [
    { label: "JSE", href: "https://www.jse.co.za/", kind: "exchange" },
    { label: "National Treasury", href: "https://www.treasury.gov.za/", kind: "treasury" },
  ],
  ghana: [{ label: "GSE", href: "https://gse.com.gh/", kind: "exchange" }],
};

export function countryDoors(country: CountryProfile): CountryDoor[] {
  const doors: CountryDoor[] = [];
  if (country.tape) {
    doors.push({ label: country.tape.label, href: country.tape.href, kind: "central-bank" });
  }
  for (const door of extraDoors[country.slug] ?? []) {
    if (!doors.some((item) => item.href === door.href)) doors.push(door);
  }
  return doors;
}

export function currencyFileHref(currency: string) {
  const row = ticker.find((item) => item.label === `USD/${currency}`);
  return row?.fileHref ?? null;
}

export function regionalPeers(country: CountryProfile, limit = 4) {
  return countries.filter((item) => item.region === country.region && item.slug !== country.slug).slice(0, limit);
}

export function countrySeriesParams() {
  return countries.flatMap((country) => countrySeries.map((series) => ({ slug: country.slug, topic: series.slug })));
}
