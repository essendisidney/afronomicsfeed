export type Company = {
  slug: string;
  name: string;
  sector: string;
  country: string;
  countrySlug: string;
  status: string;
  example: boolean;
  exchangeHref?: string;
  door?: { label: string; href: string };
};

export const companies: Company[] = [
  {
    slug: "safaricom",
    name: "Safaricom",
    sector: "Telecommunications / payments",
    country: "Kenya",
    countrySlug: "kenya",
    status: "Listed — profile is a scaffold",
    example: false,
    exchangeHref: "/markets/exchanges/nse-20",
    door: { label: "NSE issuer window", href: "https://www.nse.co.ke/" },
  },
  {
    slug: "equity-group",
    name: "Equity Group",
    sector: "Banking",
    country: "Kenya",
    countrySlug: "kenya",
    status: "Listed — profile is a scaffold",
    example: false,
    exchangeHref: "/markets/exchanges/nse-20",
    door: { label: "NSE issuer window", href: "https://www.nse.co.ke/" },
  },
  {
    slug: "kcb-group",
    name: "KCB Group",
    sector: "Banking",
    country: "Kenya",
    countrySlug: "kenya",
    status: "Listed — profile is a scaffold",
    example: false,
    exchangeHref: "/markets/exchanges/nse-20",
    door: { label: "NSE issuer window", href: "https://www.nse.co.ke/" },
  },
  {
    slug: "mtn-nigeria",
    name: "MTN Nigeria",
    sector: "Telecommunications",
    country: "Nigeria",
    countrySlug: "nigeria",
    status: "Listed — profile is a scaffold",
    example: false,
    exchangeHref: "/markets/exchanges/ngx-asi",
    door: { label: "NGX", href: "https://ngxgroup.com/" },
  },
  {
    slug: "standard-bank",
    name: "Standard Bank Group",
    sector: "Banking",
    country: "South Africa",
    countrySlug: "south-africa",
    status: "Listed — profile is a scaffold",
    example: false,
    exchangeHref: "/markets/exchanges/jse-alsi",
    door: { label: "JSE", href: "https://www.jse.co.za/" },
  },
  {
    slug: "example-bank-a",
    name: "EXAMPLE Bank A",
    sector: "Banking",
    country: "Kenya",
    countrySlug: "kenya",
    status: "Demo name — not a real issuer",
    example: true,
  },
];

export function getCompany(slug: string) {
  return companies.find((c) => c.slug === slug);
}

export function companiesInCountry(countrySlug: string) {
  return companies.filter((item) => item.countrySlug === countrySlug);
}
