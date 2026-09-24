export type ManifestoPrinciple = {
  slug: string;
  label: string;
  lede: string;
  href?: string;
};

/** Product manifesto. Principles only — no invented metrics or coverage claims. */
export const manifestoPrinciples: ManifestoPrinciple[] = [
  {
    slug: "empty-until-sourced",
    label: "Empty until sourced",
    lede: "Cells stay blank or Demo until a cited print lands with as-of.",
    href: "/method",
  },
  {
    slug: "news-to-decisions",
    label: "NEWS → DECISIONS",
    lede: "The product path is news, data, context, signals, then decisions — not a headline farm.",
    href: "/layers",
  },
  {
    slug: "no-fake-checkout",
    label: "No fake checkout",
    lede: "Auth and billing stay stubs until seats are real.",
    href: "/account",
  },
  {
    slug: "append-only",
    label: "Append-only observations",
    lede: "Historical prints are never silently overwritten when the store is live.",
    href: "/ingestion",
  },
  {
    slug: "cite-or-refuse",
    label: "Cite or refuse",
    lede: "Ask and AI answers may only cite stored documents. Otherwise refuse.",
    href: "/ask",
  },
  {
    slug: "pesara",
    label: "A product of Pesara",
    lede: "House credit stays visible. No invented conglomerate claim.",
    href: "/credits",
  },
];
