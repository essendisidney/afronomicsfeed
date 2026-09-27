export type ScaleSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Scale words. No transformed print is stored. */
export const scaleSlots: ScaleSlot[] = [
  {
    slug: "level",
    label: "Level",
    status: "vocabulary",
    lede: "A level scale needs a unit and a source. None is stored.",
    href: "/units",
  },
  {
    slug: "index",
    label: "Index",
    status: "vocabulary",
    lede: "An index scale needs a publisher and a base. This page does not invent one.",
    href: "/baselines",
  },
  {
    slug: "log",
    label: "Log",
    status: "vocabulary",
    lede: "A log scale needs a cited method. None is attached.",
    href: "/series",
  },
];

export function vocabularyScaleCount() {
  return scaleSlots.length;
}

export function storedScaleCount() {
  return 0;
}
