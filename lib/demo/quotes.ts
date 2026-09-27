export type QuoteSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited price. No quote is stored. */
export const quoteSlots: QuoteSlot[] = [
  {
    slug: "bid",
    label: "Bid",
    status: "empty",
    lede: "A bid needs a cited price and an exchange. None is stored.",
    href: "/markets",
  },
  {
    slug: "ask",
    label: "Ask",
    status: "empty",
    lede: "An ask needs a publisher. This page does not invent one.",
    href: "/spreads",
  },
  {
    slug: "last",
    label: "Last",
    status: "empty",
    lede: "A last price needs a source. None is attached.",
    href: "/series",
  },
];

export function storedQuoteCount() {
  return 0;
}
