export type FrequencySlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Words a series file would use. No calendar is stored. */
export const frequencySlots: FrequencySlot[] = [
  {
    slug: "daily",
    label: "Daily",
    status: "vocabulary",
    lede: "A daily print needs a publisher and a calendar. None is stored.",
    href: "/series",
  },
  {
    slug: "monthly",
    label: "Monthly",
    status: "vocabulary",
    lede: "A monthly print needs a source and a period. This page does not invent one.",
    href: "/releases",
  },
  {
    slug: "annual",
    label: "Annual",
    status: "vocabulary",
    lede: "An annual print needs a cited year. None is attached.",
    href: "/releases",
  },
];

export function vocabularyFrequencyCount() {
  return frequencySlots.length;
}

export function storedFrequencyCount() {
  return 0;
}
