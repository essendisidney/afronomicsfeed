import { countries } from "./countries";

export const projectLensFields = [
  "project",
  "country",
  "sector",
  "sponsor",
  "capital requirement",
  "development stage",
  "funding status",
  "technology",
  "expected impact",
  "potential revenue model",
  "key risks",
  "regulatory considerations",
] as const;

export const projectDisclaimer =
  "Project Lens is a discovery file, not a marketplace execution and not a bankability certificate. Criteria and evidence must be visible before any project is listed.";

export function projectFileHref(countrySlug: string) {
  return `/projects/${countrySlug}`;
}

export function projectCountryParams() {
  return countries.map((country) => ({ slug: country.slug }));
}
