export type BenchmarkSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A reference print. No benchmark is stored. */
export const benchmarkSlots: BenchmarkSlot[] = [
  {
    slug: "policy",
    label: "Policy rate",
    status: "empty",
    lede: "A policy benchmark needs a central bank and a date. None is stored.",
    href: "/indicators/policy-rate",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX benchmark needs a publisher and a pair. This page does not invent one.",
    href: "/markets",
  },
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity benchmark needs a source and a unit. None is attached.",
    href: "/markets",
  },
];

export function storedBenchmarkCount() {
  return 0;
}
