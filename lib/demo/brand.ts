export type BrandAsset = {
  slug: string;
  label: string;
  kind: "name" | "mark" | "colour" | "voice" | "credit";
  status: "live" | "draft" | "empty";
  lede: string;
  href?: string;
};

/**
 * Brand kit for partners and press.
 * Live = true on the site. Empty = not issued as a download pack.
 */
export const brandAssets: BrandAsset[] = [
  {
    slug: "product-name",
    label: "Product name",
    kind: "name",
    status: "live",
    lede: "Afronomics. Legal line: Afronomics Feed.",
    href: "/about",
  },
  {
    slug: "tagline",
    label: "Tagline",
    kind: "voice",
    status: "live",
    lede: "Africa’s Economic Intelligence Layer.",
    href: "/",
  },
  {
    slug: "house-credit",
    label: "House credit",
    kind: "credit",
    status: "live",
    lede: "A product of Pesara.",
    href: "/about",
  },
  {
    slug: "wordmark",
    label: "Wordmark file",
    kind: "mark",
    status: "empty",
    lede: "On-site mark exists. Download pack not issued.",
  },
  {
    slug: "signal-mark",
    label: "Signal mark",
    kind: "mark",
    status: "draft",
    lede: "In-chrome mark. No standalone SVG pack yet.",
  },
  {
    slug: "palette",
    label: "Colour tokens",
    kind: "colour",
    status: "draft",
    lede: "Forest, gold, rule and ink tokens in globals. No public swatch PDF.",
  },
  {
    slug: "voice",
    label: "Editorial voice",
    kind: "voice",
    status: "live",
    lede: "Facts / analysis / opinion. Empty until sourced.",
    href: "/method",
  },
];

export function liveBrandCount() {
  return brandAssets.filter((item) => item.status === "live").length;
}
