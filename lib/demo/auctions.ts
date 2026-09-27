export type AuctionSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited sale. No auction is stored. */
export const auctionSlots: AuctionSlot[] = [
  {
    slug: "notice",
    label: "Notice",
    status: "empty",
    lede: "An auction notice needs a publisher release. None is stored.",
    href: "/releases",
  },
  {
    slug: "bid",
    label: "Bid",
    status: "empty",
    lede: "A bid needs a quoted file. This page does not invent one.",
    href: "/quotes",
  },
  {
    slug: "award",
    label: "Award",
    status: "empty",
    lede: "An award needs a contract. None is attached.",
    href: "/contracts",
  },
];

export function storedAuctionCount() {
  return 0;
}
