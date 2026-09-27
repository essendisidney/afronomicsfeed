export type SeriesShape = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Series shapes. No observation is attached. */
export const seriesShapes: SeriesShape[] = [
  {
    slug: "price",
    label: "Price series",
    status: "empty",
    lede: "A price needs a source, unit and as-of date. None is stored here.",
    href: "/markets",
  },
  {
    slug: "index",
    label: "Index series",
    status: "empty",
    lede: "An index needs a cited base. This page does not invent one.",
    href: "/units",
  },
  {
    slug: "flow",
    label: "Flow series",
    status: "empty",
    lede: "Trade and cargo flows stay blank until a primary series is licensed.",
    href: "/trade",
  },
];

export function storedSeriesCount() {
  return 0;
}
