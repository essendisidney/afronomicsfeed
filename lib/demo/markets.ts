import { DEMO_AS_OF } from "./status";

export type MarketKind = "currency" | "exchange" | "commodity";

export type MarketInstrument = {
  slug: string;
  label: string;
  value: string;
  href: string;
  kind: MarketKind;
  countrySlug?: string;
  fileHref: string;
  asOf: string;
  example: true;
};

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function fileHref(kind: MarketKind, slug: string) {
  if (kind === "currency") return `/markets/currencies/${slug}`;
  if (kind === "exchange") return `/markets/exchanges/${slug}`;
  return `/markets/commodities/${slug}`;
}

const rows: { label: string; value: string; href: string; kind: MarketKind; countrySlug?: string }[] = [
  { label: "USD/KES", value: "129.45", href: "https://www.centralbank.go.ke/", kind: "currency", countrySlug: "kenya" },
  { label: "USD/NGN", value: "1,375.50", href: "https://www.cbn.gov.ng/", kind: "currency", countrySlug: "nigeria" },
  { label: "USD/ZAR", value: "15.68", href: "https://www.resbank.co.za/", kind: "currency", countrySlug: "south-africa" },
  { label: "USD/GHS", value: "10.92", href: "https://www.bog.gov.gh/", kind: "currency", countrySlug: "ghana" },
  { label: "USD/EGP", value: "48.20", href: "https://www.cbe.org.eg/", kind: "currency", countrySlug: "egypt" },
  { label: "USD/TZS", value: "2,610", href: "https://www.bot.go.tz/", kind: "currency", countrySlug: "tanzania" },
  { label: "USD/UGX", value: "3,720", href: "https://www.bou.or.ug/", kind: "currency", countrySlug: "uganda" },
  { label: "USD/RWF", value: "1,350", href: "https://www.bnr.rw/", kind: "currency", countrySlug: "rwanda" },
  { label: "NSE 20", value: "1,842.10", href: "https://www.nse.co.ke/", kind: "exchange", countrySlug: "kenya" },
  { label: "NGX ASI", value: "99,850", href: "https://ngxgroup.com/", kind: "exchange", countrySlug: "nigeria" },
  { label: "JSE ALSI", value: "78,432", href: "https://www.jse.co.za/", kind: "exchange", countrySlug: "south-africa" },
  { label: "Brent", value: "82.40", href: "https://www.eia.gov/", kind: "commodity" },
];

export const instruments: MarketInstrument[] = rows.map((row) => {
  const slug = slugify(row.label);
  return {
    ...row,
    slug,
    fileHref: fileHref(row.kind, slug),
    asOf: DEMO_AS_OF,
    example: true as const,
  };
});

export const ticker = instruments;

export const currencies = instruments.filter((item) => item.kind === "currency");
export const exchanges = instruments.filter((item) => item.kind === "exchange");
export const commodities = instruments.filter((item) => item.kind === "commodity");

export const marketBoards = [
  { name: "Currencies", items: currencies },
  { name: "Exchanges", items: exchanges },
  { name: "Commodities", items: commodities },
] as const;

export function getInstrument(slug: string) {
  return instruments.find((item) => item.slug === slug);
}

export function getInstrumentByKind(kind: MarketKind, slug: string) {
  return instruments.find((item) => item.kind === kind && item.slug === slug);
}

export function peerInstruments(item: MarketInstrument) {
  return instruments.filter((row) => row.kind === item.kind && row.slug !== item.slug);
}
