export type ObservationSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** One dated print. No observation is attached. */
export const observationSlots: ObservationSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price needs a source, a unit and an as-of date. None is stored.",
    href: "/series",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A cargo or trade flow needs a licensed series. This slot does not invent one.",
    href: "/trade",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell print needs a named post and a date. None is attached.",
    href: "/borders",
  },
];

export function storedObservationCount() {
  return 0;
}
