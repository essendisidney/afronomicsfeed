export type HorizonSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Horizon words. No forecast is stored. */
export const horizonSlots: HorizonSlot[] = [
  {
    slug: "short",
    label: "Short",
    status: "vocabulary",
    lede: "A short horizon needs a publisher and a window. None is stored.",
    href: "/periods",
  },
  {
    slug: "medium",
    label: "Medium",
    status: "vocabulary",
    lede: "A medium horizon needs a cited method. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "long",
    label: "Long",
    status: "vocabulary",
    lede: "A long horizon needs a source and an end date. None is attached.",
    href: "/benchmarks",
  },
];

export function vocabularyHorizonCount() {
  return horizonSlots.length;
}

export function storedHorizonCount() {
  return 0;
}
