export type SampleSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited draw from a series. No sample is stored. */
export const sampleSlots: SampleSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price sample needs a cited observation. None is stored.",
    href: "/observations",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow sample needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell sample needs a source. None is attached.",
    href: "/gaps",
  },
];

export function storedSampleCount() {
  return 0;
}
