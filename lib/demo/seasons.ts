export type SeasonSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Season words. No window is stored. */
export const seasonSlots: SeasonSlot[] = [
  {
    slug: "crop",
    label: "Crop",
    status: "vocabulary",
    lede: "A crop season needs a source and a start date. None is stored.",
    href: "/periods",
  },
  {
    slug: "fiscal",
    label: "Fiscal",
    status: "vocabulary",
    lede: "A fiscal season needs a gazette and a year. This page does not invent one.",
    href: "/calendar",
  },
  {
    slug: "calendar",
    label: "Calendar",
    status: "vocabulary",
    lede: "A calendar season needs a publisher. None is attached.",
    href: "/series",
  },
];

export function vocabularySeasonCount() {
  return seasonSlots.length;
}

export function storedSeasonCount() {
  return 0;
}
