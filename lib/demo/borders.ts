export type BorderSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Border shapes. No post, dwell or disruption is stored. */
export const borderSlots: BorderSlot[] = [
  {
    slug: "post",
    label: "Named post",
    status: "empty",
    lede: "A border post needs a cited name and a pair of countries. None is stored.",
    href: "/corridors",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell time needs a source and an as-of date. This slot stores no hours.",
    href: "/trade",
  },
  {
    slug: "disruption",
    label: "Disruption",
    status: "empty",
    lede: "A closure or queue needs a dated note. None is posted.",
    href: "/status",
  },
];

export function recordedBorderCount() {
  return 0;
}
