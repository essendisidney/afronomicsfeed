export type CrosswalkSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A map between codes. No crosswalk is stored. */
export const crosswalkSlots: CrosswalkSlot[] = [
  {
    slug: "industry",
    label: "Industry",
    status: "empty",
    lede: "An industry crosswalk needs two cited code lists. None is stored.",
    href: "/classifications",
  },
  {
    slug: "region",
    label: "Region",
    status: "empty",
    lede: "A region crosswalk needs a publisher. This page does not invent one.",
    href: "/regions",
  },
  {
    slug: "corridor",
    label: "Corridor",
    status: "empty",
    lede: "A corridor crosswalk needs named endpoints. None is attached.",
    href: "/corridors",
  },
];

export function storedCrosswalkCount() {
  return 0;
}
