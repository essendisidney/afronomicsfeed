export type DeskTemplate = {
  slug: string;
  label: string;
  kind: "brief" | "signal" | "pack" | "export" | "memo";
  seat: "free" | "pro" | "professional" | "enterprise";
  status: "catalogue" | "issued";
  lede: string;
  href?: string;
};

/** Editorial and delivery templates. Nothing mints a filled file without a cited source. */
export const deskTemplates: DeskTemplate[] = [
  {
    slug: "morning-brief",
    label: "Morning brief shell",
    kind: "brief",
    seat: "pro",
    status: "catalogue",
    lede: "Structure for the daily file. Cells stay empty until sourced.",
    href: "/today",
  },
  {
    slug: "signal-open",
    label: "Signal open memo",
    kind: "signal",
    seat: "pro",
    status: "catalogue",
    lede: "Fact / interpretation / confidence blocks. Low until cited.",
    href: "/signals",
  },
  {
    slug: "briefing-pack",
    label: "Briefing pack outline",
    kind: "pack",
    seat: "professional",
    status: "catalogue",
    lede: "Section order for packs. Assembly queue offline.",
    href: "/packs",
  },
  {
    slug: "csv-export",
    label: "CSV export columns",
    kind: "export",
    seat: "professional",
    status: "catalogue",
    lede: "Column names only. Mint stays offline.",
    href: "/exports",
  },
  {
    slug: "desk-memo",
    label: "Desk memo",
    kind: "memo",
    seat: "enterprise",
    status: "catalogue",
    lede: "Internal memo shape. No invented distribution list.",
    href: "/runbooks",
  },
];

export function issuedTemplateCount() {
  return deskTemplates.filter((item) => item.status === "issued").length;
}
