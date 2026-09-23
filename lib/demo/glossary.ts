export type GlossaryTerm = {
  slug: string;
  term: string;
  layer: "facts" | "data" | "signals" | "product";
  lede: string;
  href: string;
};

/** House glossary. Definitions point at method files — no invented jargon. */
export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "facts",
    term: "Facts",
    layer: "facts",
    lede: "What a primary document says, with a source name, URL and date.",
    href: "/method",
  },
  {
    slug: "analysis",
    term: "Analysis",
    layer: "facts",
    lede: "How the desk reads structure — not a hidden recommendation.",
    href: "/method",
  },
  {
    slug: "opinion",
    term: "Opinion",
    layer: "facts",
    lede: "Signed desk judgement. Never an adjective inside a news sentence.",
    href: "/opinion",
  },
  {
    slug: "as-of",
    term: "As-of",
    layer: "data",
    lede: "The observation date on a print. Missing as-of means the cell stays blank.",
    href: "/method/registry",
  },
  {
    slug: "demo-data",
    term: "Demo Data",
    layer: "data",
    lede: "Labelled demonstration figures. Not official prints.",
    href: "/data",
  },
  {
    slug: "empty-cell",
    term: "Empty cell",
    layer: "data",
    lede: "An em dash until a cited observation exists. Not a modelled estimate.",
    href: "/compare",
  },
  {
    slug: "graph-desk",
    term: "Graph desk",
    layer: "product",
    lede: "A country or corridor node set with editorial edges.",
    href: "/graph",
  },
  {
    slug: "signal",
    term: "Signal",
    layer: "signals",
    lede: "A published file with fact / interpretation separation and confidence.",
    href: "/signals",
  },
];

export function getGlossaryTerm(slug: string) {
  return glossaryTerms.find((item) => item.slug === slug);
}
