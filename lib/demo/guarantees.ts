export type GuaranteeSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited security. No guarantee is stored. */
export const guaranteeSlots: GuaranteeSlot[] = [
  {
    slug: "bond",
    label: "Bond",
    status: "empty",
    lede: "A bond needs a cited contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "claim",
    label: "Claim",
    status: "empty",
    lede: "A claim needs a citation. None is attached.",
    href: "/citations",
  },
  {
    slug: "release",
    label: "Release",
    status: "empty",
    lede: "A release needs a sourced observation. None is stored.",
    href: "/observations",
  },
];

export function storedGuaranteeCount() {
  return 0;
}
