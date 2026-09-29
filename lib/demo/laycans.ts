export type LaycanSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited window for a call. No laycan is stored. */
export const laycanSlots: LaycanSlot[] = [
  {
    slug: "open",
    label: "Open",
    status: "empty",
    lede: "An opening needs a window file. None is stored.",
    href: "/windows",
  },
  {
    slug: "close",
    label: "Close",
    status: "empty",
    lede: "A closing needs a cutoff. None is attached.",
    href: "/cutoffs",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A laycan record needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedLaycanCount() {
  return 0;
}
