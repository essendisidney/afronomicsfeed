export type CorrespondentSlot = {
  slug: string;
  desk: string;
  status: "empty" | "named";
  lede: string;
  href: string;
};

/** Desk seats. No name is invented. */
export const correspondentSlots: CorrespondentSlot[] = [
  {
    slug: "kenya",
    desk: "Kenya",
    status: "empty",
    lede: "No byline is assigned. The morning file stays the desk.",
    href: "/today",
  },
  {
    slug: "east-africa",
    desk: "East Africa",
    status: "empty",
    lede: "No named correspondent for this region.",
    href: "/regions/east-africa",
  },
  {
    slug: "west-africa",
    desk: "West Africa",
    status: "empty",
    lede: "No named correspondent for this region.",
    href: "/regions/west-africa",
  },
  {
    slug: "southern-africa",
    desk: "Southern Africa",
    status: "empty",
    lede: "No named correspondent for this region.",
    href: "/regions/southern-africa",
  },
  {
    slug: "north-africa",
    desk: "North Africa",
    status: "empty",
    lede: "No named correspondent for this region.",
    href: "/regions/north-africa",
  },
  {
    slug: "central-africa",
    desk: "Central Africa",
    status: "empty",
    lede: "No named correspondent for this region.",
    href: "/regions/central-africa",
  },
];

export function namedCorrespondentCount() {
  return correspondentSlots.filter((item) => item.status === "named").length;
}
