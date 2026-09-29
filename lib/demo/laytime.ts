export type LaytimeSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited allowance for cargo work. No allowance is stored. */
export const laytimeSlots: LaytimeSlot[] = [
  {
    slug: "start",
    label: "Start",
    status: "empty",
    lede: "A start needs a period. None is stored.",
    href: "/periods",
  },
  {
    slug: "stop",
    label: "Stop",
    status: "empty",
    lede: "A stop needs a cutoff. None is attached.",
    href: "/cutoffs",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "An allowance record needs an observation. None is stored.",
    href: "/observations",
  },
];

export function storedLaytimeCount() {
  return 0;
}
