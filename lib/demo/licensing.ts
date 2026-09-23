export type LicenceProduct = {
  slug: string;
  label: string;
  seat: "enterprise";
  status: "catalogue" | "quoted" | "active";
  lede: string;
};

/** Enterprise licence shapes. No fake quote or active seat. */
export const licenceProducts: LicenceProduct[] = [
  {
    slug: "terminal-white-label",
    label: "White-label terminal",
    seat: "enterprise",
    status: "catalogue",
    lede: "Branded monitor chrome. No embed is issued in this build.",
  },
  {
    slug: "research-licence",
    label: "Research redistribution",
    seat: "enterprise",
    status: "catalogue",
    lede: "Licence to redistribute cited Afronomics files. Legal review not started.",
  },
  {
    slug: "feed-bundle",
    label: "Feed bundle",
    seat: "enterprise",
    status: "catalogue",
    lede: "Pairs with /feeds catalogue. Delivery queue offline.",
  },
  {
    slug: "desk-secondment",
    label: "Desk secondment",
    seat: "enterprise",
    status: "catalogue",
    lede: "Analyst hours against a country desk. Contact only — no fake booking.",
  },
];

export function activeLicences() {
  return [] as { id: string; productSlug: string; startedAt: string }[];
}

export function openQuotes() {
  return [] as { id: string; productSlug: string; openedAt: string }[];
}
