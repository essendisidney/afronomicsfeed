export type FeedProduct = {
  slug: string;
  label: string;
  channel: "json" | "csv" | "webhook" | "email";
  seat: "professional" | "enterprise";
  status: "catalogue" | "licensed";
  lede: string;
};

/** Enterprise feed shapes. Nothing is delivered without a licence. */
export const feedProducts: FeedProduct[] = [
  {
    slug: "country-shell-json",
    label: "Country shell JSON",
    channel: "json",
    seat: "professional",
    status: "catalogue",
    lede: "ISO, currency, sectors and official doors. No invented observations.",
  },
  {
    slug: "signal-stream",
    label: "Signal stream",
    channel: "webhook",
    seat: "enterprise",
    status: "catalogue",
    lede: "Webhook on published signal files only. Empty until a cited print lands.",
  },
  {
    slug: "graph-desk-edges",
    label: "Graph desk edges",
    channel: "json",
    seat: "professional",
    status: "catalogue",
    lede: "Editorial edges for one desk. Status fields preserved.",
  },
  {
    slug: "morning-pack-email",
    label: "Morning pack email",
    channel: "email",
    seat: "enterprise",
    status: "catalogue",
    lede: "Assembled from the morning file. Delivery queue not live.",
  },
  {
    slug: "capital-book-csv",
    label: "Capital book CSV",
    channel: "csv",
    seat: "enterprise",
    status: "catalogue",
    lede: "EXAMPLE rows stay labelled. Production book not connected.",
  },
];

export function licensedFeeds() {
  return feedProducts.filter((item) => item.status === "licensed");
}

export function deliveredFeedEvents() {
  return [] as { id: string; feedSlug: string; at: string }[];
}
