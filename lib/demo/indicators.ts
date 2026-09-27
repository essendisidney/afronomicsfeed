import { countries } from "./countries";

export const indicators = [
  {
    slug: "inflation",
    name: "Inflation",
    unit: "percent, period as published",
    geography: "Country / regional",
    note: "The prints agent reads the latest non-null World Bank annual series. A missing year stays blank.",
    countrySeries: "economy",
  },
  {
    slug: "gdp",
    name: "Gross domestic product",
    unit: "as published",
    geography: "Country",
    note: "The prints agent reads World Bank GDP (current US$) when that year is published.",
    countrySeries: "economy",
  },
  {
    slug: "policy-rate",
    name: "Policy interest rate",
    unit: "percent",
    geography: "Country",
    note: "Only the issuing central bank’s published rate is a fact.",
    countrySeries: "markets",
  },
  {
    slug: "public-debt",
    name: "Public debt",
    unit: "as published",
    geography: "Country",
    note: "The prints agent reads central government debt as a percent of GDP when World Bank publishes it.",
    countrySeries: "economy",
  },
  {
    slug: "fdi",
    name: "Foreign direct investment",
    unit: "as published",
    geography: "Country / corridor",
    note: "The prints agent reads World Bank FDI net inflows when that year is published.",
    countrySeries: "capital",
  },
] as const;

export function getIndicator(slug: string) {
  return indicators.find((item) => item.slug === slug);
}

export function indicatorCountryHref(indicatorSlug: string, countrySlug: string) {
  return `/indicators/${indicatorSlug}/${countrySlug}`;
}

export function indicatorCountryParams() {
  return indicators.flatMap((indicator) => countries.map((country) => ({ slug: indicator.slug, country: country.slug })));
}
