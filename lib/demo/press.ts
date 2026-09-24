export type PressAsset = {
  slug: string;
  label: string;
  kind: "boilerplate" | "logo" | "factsheet" | "contact";
  status: "empty" | "draft";
  lede: string;
  href?: string;
};

/** Media kit. Empty means the asset is not published for download. */
export const pressAssets: PressAsset[] = [
  {
    slug: "boilerplate",
    label: "Boilerplate",
    kind: "boilerplate",
    status: "draft",
    lede: "One-paragraph product description. Not a press release inventing metrics.",
    href: "/about",
  },
  {
    slug: "wordmark",
    label: "Wordmark",
    kind: "logo",
    status: "draft",
    lede: "See brand kit. Download pack still not issued.",
    href: "/brand",
  },
  {
    slug: "coverage-factsheet",
    label: "Coverage factsheet",
    kind: "factsheet",
    status: "empty",
    lede: "Would mirror /coverage. No vanity completion PDF.",
    href: "/coverage",
  },
  {
    slug: "method-note",
    label: "Method note for reporters",
    kind: "factsheet",
    status: "draft",
    lede: "Facts / analysis / opinion discipline.",
    href: "/method",
  },
  {
    slug: "press-contact",
    label: "Press contact",
    kind: "contact",
    status: "empty",
    lede: "Use advisory for institutional contact. No fake inbox.",
    href: "/advisory",
  },
];

export function publishedPressCount() {
  return pressAssets.filter((item) => item.status !== "empty").length;
}
