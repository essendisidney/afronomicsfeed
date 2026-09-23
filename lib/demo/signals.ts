export const signalCategories = [
  "Capital",
  "Currency",
  "Debt",
  "Policy",
  "Trade",
  "Climate",
  "Startup",
  "Infrastructure",
  "Energy",
  "Consumer",
  "Employment",
  "Commodity",
  "Investment",
] as const;

export type SignalCategory = (typeof signalCategories)[number];

export type Signal = {
  slug: string;
  title: string;
  country: string;
  countrySlug?: string;
  sector: string;
  category: SignalCategory;
  direction: string;
  confidence: string;
  severity: string;
  horizon: string;
  fact: string;
  interpretation: string;
  related: { label: string; href: string }[];
};

export const signals: Signal[] = [
  {
    slug: "kenya-electricity-tariff",
    title: "Policy — electricity tariff file (Kenya)",
    country: "Kenya",
    countrySlug: "kenya",
    sector: "Energy",
    category: "Policy",
    direction: "Watch",
    confidence: "Low — methodology",
    severity: "Desk file",
    horizon: "Near term",
    fact: "A tariff decision, if published, is a primary document — not a score.",
    interpretation:
      "Connect any official notice to inflation, manufacturing costs, FX, listed utilities, and household demand. Do not invent the print.",
    related: [
      { label: "Kenya policy series", href: "/countries/kenya/policy" },
      { label: "Kenya inflation cell", href: "/indicators/inflation/kenya" },
      { label: "Kenya energy series", href: "/countries/kenya/energy" },
    ],
  },
  {
    slug: "east-africa-dfi-climate",
    title: "Capital — DFI climate book (regional)",
    country: "East Africa",
    sector: "Climate",
    category: "Climate",
    direction: "Watch",
    confidence: "Low — methodology",
    severity: "Desk file",
    horizon: "Medium",
    fact: "No production climate-capital series is connected.",
    interpretation: "The Climate Capital page is the scaffold. Numbers stay blank until sourced.",
    related: [
      { label: "Climate Capital", href: "/climate" },
      { label: "Climate finance book", href: "/capital/climate-finance" },
      { label: "Kenya climate file", href: "/climate/kenya" },
    ],
  },
  {
    slug: "kenya-tbill-notice",
    title: "Debt — T-bill result notice (Kenya)",
    country: "Kenya",
    countrySlug: "kenya",
    sector: "Sovereign",
    category: "Debt",
    direction: "Watch",
    confidence: "Low — methodology",
    severity: "Desk file",
    horizon: "Near term",
    fact: "The result notice is the only official print. Until it is up, the desk holds a blank.",
    interpretation: "Chat yields are not prints. File the offered, bids, accepted amount and WAR as the Bank publishes them.",
    related: [
      { label: "Kenya markets series", href: "/countries/kenya/markets" },
      { label: "Sovereign book", href: "/capital/sovereign/kenya" },
      { label: "USD/KES file", href: "/markets/currencies/usd-kes" },
    ],
  },
];

export function getSignal(slug: string) {
  return signals.find((item) => item.slug === slug);
}

export function signalCategorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function getSignalCategory(slug: string) {
  return signalCategories.find((item) => signalCategorySlug(item) === slug);
}

export function signalsInCategory(category: SignalCategory) {
  return signals.filter((item) => item.category === category);
}
