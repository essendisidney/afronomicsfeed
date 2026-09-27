export type FlagSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Quality-mark words. No flag is stored. */
export const flagSlots: FlagSlot[] = [
  {
    slug: "missing",
    label: "Missing",
    status: "vocabulary",
    lede: "A missing mark needs a cited gap. None is stored.",
    href: "/gaps",
  },
  {
    slug: "provisional",
    label: "Provisional",
    status: "vocabulary",
    lede: "A provisional mark needs a publisher. This page does not invent one.",
    href: "/revisions",
  },
  {
    slug: "revised",
    label: "Revised",
    status: "vocabulary",
    lede: "A revised mark needs a source. None is attached.",
    href: "/observations",
  },
];

export function storedFlagCount() {
  return 0;
}
