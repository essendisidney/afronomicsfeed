export type LotSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A named parcel. No lot is stored. */
export const lotSlots: LotSlot[] = [
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity lot needs a cited specification. None is stored.",
    href: "/baskets",
  },
  {
    slug: "parcel",
    label: "Parcel",
    status: "empty",
    lede: "A parcel lot needs a publisher. This page does not invent one.",
    href: "/trade",
  },
  {
    slug: "grade",
    label: "Grade",
    status: "empty",
    lede: "A grade lot needs a source. None is attached.",
    href: "/grades",
  },
];

export function storedLotCount() {
  return 0;
}
