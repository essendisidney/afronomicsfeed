import { countries } from "./countries";

export const climateSlots = [
  "Capital committed",
  "Capital deployed",
  "Major projects",
  "Major financiers",
  "Energy mix",
  "Climate vulnerabilities",
  "Carbon projects",
  "Green bonds",
  "Renewable capacity",
  "Funding gap",
] as const;

export const climateGap = {
  committed: "—",
  deployed: "—",
  requirement: "—",
  note: "Climate Finance Gap is methodology only until licensed project and DFI books exist.",
};

export const climateDoors = [
  { label: "Climate finance book", href: "/capital/climate-finance" },
  { label: "Green bonds", href: "/capital/green-bond" },
  { label: "Carbon", href: "/capital/carbon" },
  { label: "Infrastructure", href: "/capital/infrastructure" },
] as const;

export function climateFileHref(countrySlug: string) {
  return `/climate/${countrySlug}`;
}

export function climateCountryParams() {
  return countries.map((country) => ({ slug: country.slug }));
}
