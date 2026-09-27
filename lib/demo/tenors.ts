export type TenorSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Maturity words. No date is stored. */
export const tenorSlots: TenorSlot[] = [
  {
    slug: "short",
    label: "Short",
    status: "vocabulary",
    lede: "A short tenor needs a cited maturity. None is stored.",
    href: "/horizons",
  },
  {
    slug: "medium",
    label: "Medium",
    status: "vocabulary",
    lede: "A medium tenor needs a publisher. This page does not invent one.",
    href: "/markets",
  },
  {
    slug: "long",
    label: "Long",
    status: "vocabulary",
    lede: "A long tenor needs a source and a date. None is attached.",
    href: "/frequencies",
  },
];

export function storedTenorCount() {
  return 0;
}
