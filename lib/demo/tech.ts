import { countries } from "./countries";

export const startupSlots = [
  "company",
  "country",
  "founders",
  "sector",
  "year founded",
  "funding rounds",
  "investors",
  "business model",
  "status",
  "website",
] as const;

export type TechLens = {
  slug: string;
  label: string;
  lede: string;
};

export const techLenses: TechLens[] = [
  {
    slug: "fintech",
    label: "Fintech & payments",
    lede: "Rails, wallets and licensing. Rounds stay blank until a cited close exists.",
  },
  {
    slug: "climate-tech",
    label: "Climate tech",
    lede: "Hardware, software and project-adjacent tech. Not a pitch book.",
  },
  {
    slug: "digital-regulation",
    label: "Digital regulation",
    lede: "Payments, data, sandboxes and licences — filed against the issuing regulator.",
  },
  {
    slug: "data-centres",
    label: "Data centres",
    lede: "Capacity and power files open when a sourced facility exists.",
  },
  {
    slug: "telecoms",
    label: "Telecoms",
    lede: "Operators and spectrum. Issuer financials live on the company file, not here.",
  },
];

export function getTechLens(slug: string) {
  return techLenses.find((item) => item.slug === slug);
}

export function techFileHref(lensSlug: string, countrySlug: string) {
  return `/technology/${lensSlug}/${countrySlug}`;
}

export function techCountryParams() {
  return techLenses.flatMap((lens) => countries.map((country) => ({ lens: lens.slug, country: country.slug })));
}
