export type ReceiptSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited confirmation of a lot. No receipt is stored. */
export const receiptSlots: ReceiptSlot[] = [
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a lot file. None is stored.",
    href: "/lots",
  },
  {
    slug: "mark",
    label: "Mark",
    status: "empty",
    lede: "A mark needs a stamp. None is attached.",
    href: "/stamps",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A receipt file needs a footnote. None is stored.",
    href: "/footnotes",
  },
];

export function storedReceiptCount() {
  return 0;
}
