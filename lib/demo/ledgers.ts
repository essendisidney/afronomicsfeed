export type LedgerSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited book of entries. No ledger is stored. */
export const ledgerSlots: LedgerSlot[] = [
  {
    slug: "entry",
    label: "Entry",
    status: "empty",
    lede: "A ledger entry needs a cited observation. None is stored.",
    href: "/observations",
  },
  {
    slug: "balance",
    label: "Balance",
    status: "empty",
    lede: "A balance needs a baseline. This page does not invent one.",
    href: "/baselines",
  },
  {
    slug: "close",
    label: "Close",
    status: "empty",
    lede: "A close needs a period. None is attached.",
    href: "/periods",
  },
];

export function storedLedgerCount() {
  return 0;
}
