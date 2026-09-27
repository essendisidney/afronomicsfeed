export type PeriodSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Window words. No period is stored. */
export const periodSlots: PeriodSlot[] = [
  {
    slug: "week",
    label: "Week",
    status: "vocabulary",
    lede: "A week needs a publisher and a start date. None is stored.",
    href: "/frequencies",
  },
  {
    slug: "quarter",
    label: "Quarter",
    status: "vocabulary",
    lede: "A quarter needs a cited year. This page does not invent one.",
    href: "/releases",
  },
  {
    slug: "year",
    label: "Year",
    status: "vocabulary",
    lede: "A year label needs a source. None is attached.",
    href: "/series",
  },
];

export function vocabularyPeriodCount() {
  return periodSlots.length;
}

export function storedPeriodCount() {
  return 0;
}
