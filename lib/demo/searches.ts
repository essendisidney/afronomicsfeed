export type SavedSearchTemplate = {
  slug: string;
  label: string;
  query: string;
  lede: string;
  hrefs: string[];
};

/** Search shapes a Pro seat would save. Store is empty until Auth. */
export const searchTemplates: SavedSearchTemplate[] = [
  {
    slug: "kenya-policy",
    label: "Kenya policy",
    query: "CBK MPC policy rate",
    lede: "Would filter country and agency files. No live search index yet.",
    hrefs: ["/search?q=CBK", "/countries/kenya", "/indicators/policy-rate/kenya"],
  },
  {
    slug: "corridor-trade",
    label: "Northern Corridor trade",
    query: "Northern Corridor ports dwell",
    lede: "Corridor and port shells. Volumes stay blank.",
    hrefs: ["/trade/northern-corridor", "/graph/northern-corridor", "/compare"],
  },
  {
    slug: "climate-capital",
    label: "Climate capital",
    query: "climate finance DFI",
    lede: "Climate and capital books. Amounts unpublished.",
    hrefs: ["/climate", "/capital", "/projects"],
  },
  {
    slug: "signal-week",
    label: "Open signals",
    query: "signal confidence",
    lede: "Published signal files only.",
    hrefs: ["/signals", "/opinion"],
  },
];

export function savedSearches() {
  return [] as { id: string; templateSlug: string; savedAt: string }[];
}
