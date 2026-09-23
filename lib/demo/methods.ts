export type MethodEntry = {
  slug: string;
  title: string;
  layer: "facts" | "analysis" | "opinion" | "data" | "signals";
  status: "published" | "draft" | "empty";
  lede: string;
  href: string;
};

/** House standards and data methods. Empty rows mean the file is not written yet. */
export const methodEntries: MethodEntry[] = [
  {
    slug: "facts-analysis-opinion",
    title: "Facts · Analysis · Opinion",
    layer: "facts",
    status: "published",
    lede: "Label discipline for every piece on the desk.",
    href: "/method",
  },
  {
    slug: "corrections",
    title: "Corrections log",
    layer: "facts",
    status: "published",
    lede: "Public overwrite is forbidden. Errors get a dated note.",
    href: "/corrections",
  },
  {
    slug: "pulse",
    title: "Africa Pulse score",
    layer: "data",
    status: "draft",
    lede: "Methodology scaffold. Production series not live.",
    href: "/data/pulse-methodology",
  },
  {
    slug: "climate-gap",
    title: "Climate finance gap",
    layer: "data",
    status: "draft",
    lede: "Gap math stays methodology until licensed books exist.",
    href: "/climate",
  },
  {
    slug: "entity-resolution",
    title: "Entity resolution",
    layer: "data",
    status: "draft",
    lede: "Resolver refuses unknown labels. No invented nodes.",
    href: "/graph/resolve",
  },
  {
    slug: "signal-confidence",
    title: "Signal confidence bands",
    layer: "signals",
    status: "draft",
    lede: "Confidence stays Low until a cited print lands.",
    href: "/signals",
  },
  {
    slug: "opinion-rubrics",
    title: "Opinion rubrics",
    layer: "opinion",
    status: "published",
    lede: "Signed judgement, never a hidden adjective in a news sentence.",
    href: "/opinion",
  },
  {
    slug: "export-provenance",
    title: "Export provenance",
    layer: "data",
    status: "empty",
    lede: "CSV / JSON packages carry seat and as-of. Not issued yet.",
    href: "/exports",
  },
  {
    slug: "source-registry",
    title: "Official source registry",
    layer: "facts",
    status: "published",
    lede: "Linked doors for featured desks. Pending rows stay unverified.",
    href: "/sources",
  },
];

export function getMethodEntry(slug: string) {
  return methodEntries.find((item) => item.slug === slug);
}

export function publishedMethodCount() {
  return methodEntries.filter((item) => item.status === "published").length;
}
