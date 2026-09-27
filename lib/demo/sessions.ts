export type SessionSlot = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Session words. No clock time is stored. */
export const sessionSlots: SessionSlot[] = [
  {
    slug: "open",
    label: "Open",
    status: "vocabulary",
    lede: "An open needs an exchange and a cited clock. None is stored.",
    href: "/markets",
  },
  {
    slug: "auction",
    label: "Auction",
    status: "vocabulary",
    lede: "An auction needs a publisher. This page does not invent one.",
    href: "/calendar",
  },
  {
    slug: "close",
    label: "Close",
    status: "vocabulary",
    lede: "A close needs a source and a date. None is attached.",
    href: "/frequencies",
  },
];

export function vocabularySessionCount() {
  return sessionSlots.length;
}

export function storedSessionCount() {
  return 0;
}
