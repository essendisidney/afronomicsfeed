import { countries } from "./countries";

export const personRoles = [
  {
    slug: "central-bank-governor",
    label: "Central-bank governor",
    lede: "The chair of the issuing bank. Name and tenure stay blank until a sourced appointment notice exists.",
    agencyKind: "central-bank",
  },
  {
    slug: "finance-minister",
    label: "Finance minister",
    lede: "The fiscal authority’s political head. The file is a role, not a biography, until a gazette is cited.",
    agencyKind: "treasury",
  },
] as const;

export function getPersonRole(slug: string) {
  return personRoles.find((item) => item.slug === slug);
}

export function personFileHref(roleSlug: string, countrySlug: string) {
  return `/people/${roleSlug}/${countrySlug}`;
}

export function personCountryParams() {
  return personRoles.flatMap((role) => countries.map((country) => ({ role: role.slug, country: country.slug })));
}
