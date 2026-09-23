import { countries } from "./countries";

export const agencyKinds = [
  {
    slug: "central-bank",
    label: "Central bank",
    lede: "Policy rate, supervision and the official FX door. The issuing bank’s site remains the source of record.",
  },
  {
    slug: "treasury",
    label: "Treasury",
    lede: "Sovereign issuer and fiscal authority. Auction prints live on the official notice, not here.",
  },
  {
    slug: "exchange",
    label: "Exchange",
    lede: "Listing venue. Afronomics does not redistribute a live tape.",
  },
  {
    slug: "regulator",
    label: "Market regulator",
    lede: "Licensing and conduct. Notices file against the issuing authority when tagged.",
  },
  {
    slug: "statistics",
    label: "Statistics office",
    lede: "National accounts and prices. No series is stored until a primary table exists.",
  },
] as const;

export function getAgencyKind(slug: string) {
  return agencyKinds.find((item) => item.slug === slug);
}

export function agencyFileHref(kindSlug: string, countrySlug: string) {
  return `/agencies/${kindSlug}/${countrySlug}`;
}

export function agencyCountryParams() {
  return agencyKinds.flatMap((kind) => countries.map((country) => ({ kind: kind.slug, country: country.slug })));
}

const kenyaDesk: Record<string, { href: string; label: string }> = {
  "central-bank": { href: "/institutions/cbk", label: "CBK desk" },
  treasury: { href: "/institutions/treasury", label: "Treasury desk" },
  exchange: { href: "/institutions/nse", label: "NSE desk" },
  regulator: { href: "/institutions/cma", label: "CMA desk" },
};

export function kenyaDeskForAgency(kindSlug: string) {
  return kenyaDesk[kindSlug];
}

export function agencyDisplayName(kindSlug: string, countrySlug: string) {
  const country = countries.find((item) => item.slug === countrySlug);
  const kind = getAgencyKind(kindSlug);
  if (!country || !kind) return kind?.label ?? "Agency";
  if (kindSlug === "central-bank" && country.tape) return country.tape.label;
  return `${country.name} ${kind.label.toLowerCase()}`;
}
