export type CustomsSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Customs shapes. No declaration or tariff line is stored. */
export const customsSlots: CustomsSlot[] = [
  {
    slug: "declaration",
    label: "Declaration",
    status: "empty",
    lede: "A declaration needs an agency and a date. None is filed here.",
    href: "/trade",
  },
  {
    slug: "tariff-line",
    label: "Tariff line",
    status: "empty",
    lede: "A tariff line needs a cited instrument. This page does not model one.",
    href: "/trade/regimes/afcfta",
  },
  {
    slug: "receipt",
    label: "Receipt",
    status: "empty",
    lede: "A customs receipt needs a publisher and a date. None is stored.",
    href: "/sources",
  },
];

export function filedCustomsCount() {
  return 0;
}
