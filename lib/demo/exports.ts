export const exportPackages = [
  {
    slug: "country-shell",
    label: "Country shell CSV",
    lede: "ISO, currency, sectors and official doors for one country. No invented observations.",
    seat: "professional",
    format: "CSV",
  },
  {
    slug: "capital-book",
    label: "Capital book extract",
    lede: "EXAMPLE rows only until a production book exists. Demo rows stay labelled.",
    seat: "professional",
    format: "CSV",
  },
  {
    slug: "graph-edges",
    label: "Graph edges JSON",
    lede: "Editorial edges for a desk. Status fields preserved — no silent overwrite.",
    seat: "professional",
    format: "JSON",
  },
  {
    slug: "signal-pack",
    label: "Signal pack",
    lede: "Published signal files with fact / interpretation separation.",
    seat: "enterprise",
    format: "JSON",
  },
] as const;

/** Always empty — no download is issued without a live seat. */
export function issuedExports() {
  return [] as { id: string; packageSlug: string; issuedAt: string }[];
}
