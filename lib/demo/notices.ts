export type HouseNotice = {
  slug: string;
  label: string;
  kind: "method" | "service" | "correction";
  status: "empty" | "posted";
  lede: string;
  href: string;
};

/** House notice slots. Empty until an editor posts one. No invented outages. */
export const houseNotices: HouseNotice[] = [
  {
    slug: "method-change",
    label: "Method change",
    kind: "method",
    status: "empty",
    lede: "No method revision is posted. The registry is the source when one lands.",
    href: "/method/registry",
  },
  {
    slug: "service-note",
    label: "Service note",
    kind: "service",
    status: "empty",
    lede: "No maintenance or outage note. Live, scaffold, and offline stay on the status board.",
    href: "/status",
  },
  {
    slug: "correction-pointer",
    label: "Correction",
    kind: "correction",
    status: "empty",
    lede: "Corrections publish on their own page. This slot does not invent one.",
    href: "/corrections",
  },
];

export function postedNoticeCount() {
  return houseNotices.filter((item) => item.status === "posted").length;
}
