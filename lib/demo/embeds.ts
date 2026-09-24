export type EmbedProduct = {
  slug: string;
  label: string;
  format: "iframe" | "script" | "oembed";
  seat: "professional" | "enterprise";
  status: "catalogue" | "issued";
  lede: string;
};

/** Embed / widget catalogue. Nothing is issued without a licence. */
export const embedProducts: EmbedProduct[] = [
  {
    slug: "country-pulse",
    label: "Country pulse strip",
    format: "iframe",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would show Pulse cells. Values stay — until cited. White-label only.",
  },
  {
    slug: "market-board",
    label: "Market board",
    format: "iframe",
    seat: "enterprise",
    status: "catalogue",
    lede: "FX / exchange board with Demo labels preserved. No silent tape.",
  },
  {
    slug: "signal-card",
    label: "Signal card",
    format: "oembed",
    seat: "professional",
    status: "catalogue",
    lede: "Embed a published signal file. Empty until a cited signal exists.",
  },
  {
    slug: "graph-desk-snippet",
    label: "Graph desk snippet",
    format: "script",
    seat: "enterprise",
    status: "catalogue",
    lede: "Editorial edges for one desk. Status fields preserved.",
  },
];

export function issuedEmbeds() {
  return [] as { id: string; productSlug: string; issuedAt: string }[];
}
