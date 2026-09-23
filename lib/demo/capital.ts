import { countries } from "./countries";

export const capitalTypes = [
  "VC",
  "PE",
  "DFI",
  "Climate finance",
  "Infrastructure",
  "Sovereign",
  "Corporate debt",
  "Grant",
  "M&A",
  "Project finance",
  "Green bond",
  "Carbon",
] as const;

export type CapitalTypeName = (typeof capitalTypes)[number];

export type CapitalBook = {
  slug: string;
  name: CapitalTypeName;
  lede: string;
};

export const capitalBooks: CapitalBook[] = [
  { slug: "vc", name: "VC", lede: "Venture tickets publish only when a cited round exists. No invented valuations." },
  { slug: "pe", name: "PE", lede: "Private-equity files stay empty until a sourced close or filing is stored." },
  { slug: "dfi", name: "DFI", lede: "Development-finance commitments need the institution’s own disclosure." },
  { slug: "climate-finance", name: "Climate finance", lede: "Climate capital is a book, not a slogan. Amounts stay blank without a cited facility." },
  { slug: "infrastructure", name: "Infrastructure", lede: "Project and concession files open when a primary announcement exists." },
  { slug: "sovereign", name: "Sovereign", lede: "Sovereign issuance and IMF/treasury prints — never a modelled coupon." },
  { slug: "corporate-debt", name: "Corporate debt", lede: "Issuer debt files attach to a prospectus or exchange notice." },
  { slug: "grant", name: "Grant", lede: "Grant lines require the donor or treasury disclosure." },
  { slug: "ma", name: "M&A", lede: "Control changes need an issuer or competition-authority notice." },
  { slug: "project-finance", name: "Project finance", lede: "SPV and lender groups stay unnamed until a primary ticket exists." },
  { slug: "green-bond", name: "Green bond", lede: "Use-of-proceeds files wait for the framework and the allotment notice." },
  { slug: "carbon", name: "Carbon", lede: "Carbon tickets are methodology only until a registered issuance is cited." },
];

export type CapitalRow = {
  id: string;
  investor: string;
  amount: string;
  currency: string;
  target: string;
  country: string;
  countrySlug: string;
  sector: string;
  type: CapitalTypeName;
  stage: string;
  year: string;
};

export const capitalRows: CapitalRow[] = [
  {
    id: "demo-1",
    investor: "EXAMPLE DFI A",
    amount: "—",
    currency: "USD",
    target: "EXAMPLE grid project",
    country: "Kenya",
    countrySlug: "kenya",
    sector: "Energy",
    type: "Climate finance",
    stage: "Commitment (demo)",
    year: "2026",
  },
  {
    id: "demo-2",
    investor: "EXAMPLE FUND B",
    amount: "—",
    currency: "USD",
    target: "EXAMPLE payments company",
    country: "Nigeria",
    countrySlug: "nigeria",
    sector: "Fintech",
    type: "VC",
    stage: "Growth (demo)",
    year: "2026",
  },
  {
    id: "demo-3",
    investor: "EXAMPLE BANK C",
    amount: "—",
    currency: "USD",
    target: "EXAMPLE corridor rail",
    country: "Angola / DRC / Zambia",
    countrySlug: "angola",
    sector: "Infrastructure",
    type: "Project finance",
    stage: "Announced (demo)",
    year: "2025",
  },
];

export function getCapitalBook(slug: string) {
  return capitalBooks.find((item) => item.slug === slug);
}

export function capitalBookByName(name: string) {
  return capitalBooks.find((item) => item.name === name);
}

export function capitalFileHref(typeSlug: string, countrySlug: string) {
  return `/capital/${typeSlug}/${countrySlug}`;
}

export function capitalRowsFor(typeName: CapitalTypeName, countrySlug: string) {
  return capitalRows.filter((row) => row.type === typeName && row.countrySlug === countrySlug);
}

export function capitalCountryParams() {
  return capitalBooks.flatMap((book) => countries.map((country) => ({ type: book.slug, country: country.slug })));
}
