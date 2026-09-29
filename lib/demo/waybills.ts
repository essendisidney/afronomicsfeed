export type WaybillSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited carriage document. No waybill is stored. */
export const waybillSlots: WaybillSlot[] = [
  {
    slug: "issue",
    label: "Issue",
    status: "empty",
    lede: "An issue needs a named carrier. None is stored.",
    href: "/releases",
  },
  {
    slug: "route",
    label: "Route",
    status: "empty",
    lede: "A route needs the corridor on the file. None is attached.",
    href: "/trade",
  },
  {
    slug: "receipt",
    label: "Receipt",
    status: "empty",
    lede: "A receipt needs a cited handover. None is stored.",
    href: "/citations",
  },
];

export function storedWaybillCount() {
  return 0;
}
