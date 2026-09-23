export const companies = [
  {
    slug: "safaricom",
    name: "Safaricom",
    sector: "Telecommunications / payments",
    country: "Kenya",
    status: "Listed — profile is a scaffold",
  },
  {
    slug: "example-bank-a",
    name: "EXAMPLE Bank A",
    sector: "Banking",
    country: "Kenya",
    status: "Demo name — not a real issuer",
  },
];

export function getCompany(slug: string) {
  return companies.find((c) => c.slug === slug);
}
