export type HandoverSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited pass of a file. No handover is stored. */
export const handoverSlots: HandoverSlot[] = [
  {
    slug: "from",
    label: "From",
    status: "empty",
    lede: "A sender needs a contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "to",
    label: "To",
    status: "empty",
    lede: "A receiver needs a release. None is attached.",
    href: "/releases",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A handover record needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedHandoverCount() {
  return 0;
}
