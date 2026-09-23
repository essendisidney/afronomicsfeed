export const indicators = [
  {
    slug: "inflation",
    name: "Inflation",
    unit: "percent, period as published",
    geography: "Country / regional",
    note: "National statistics agencies and central banks are the primary doors. No series is stored yet.",
  },
  {
    slug: "gdp",
    name: "Gross domestic product",
    unit: "as published",
    geography: "Country",
    note: "Awaiting a licensed national-accounts or World Bank / IMF observation table.",
  },
  {
    slug: "policy-rate",
    name: "Policy interest rate",
    unit: "percent",
    geography: "Country",
    note: "Only the issuing central bank’s published rate is a fact.",
  },
  {
    slug: "public-debt",
    name: "Public debt",
    unit: "as published",
    geography: "Country",
    note: "Sovereign stock and service figures require a cited fiscal or IMF print.",
  },
  {
    slug: "fdi",
    name: "Foreign direct investment",
    unit: "as published",
    geography: "Country / corridor",
    note: "UNCTAD / national investment authorities — not modelled here.",
  },
] as const;

export function getIndicator(slug: string) {
  return indicators.find((item) => item.slug === slug);
}
