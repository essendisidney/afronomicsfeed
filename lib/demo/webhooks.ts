export type WebhookEndpoint = {
  slug: string;
  label: string;
  event: string;
  seat: "professional" | "enterprise";
  status: "catalogue" | "armed";
  lede: string;
};

/** Webhook catalogue. Nothing is delivered without a live key and licence. */
export const webhookEndpoints: WebhookEndpoint[] = [
  {
    slug: "signal-published",
    label: "Signal published",
    event: "signal.published",
    seat: "enterprise",
    status: "catalogue",
    lede: "Fires only after a cited signal file opens. Queue offline.",
  },
  {
    slug: "edge-verified",
    label: "Graph edge verified",
    event: "graph.edge_verified",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would push when an edge status becomes verified. Jobs not scheduled.",
  },
  {
    slug: "export-ready",
    label: "Export ready",
    event: "export.ready",
    seat: "professional",
    status: "catalogue",
    lede: "Mint is offline. No callback invents a download.",
  },
  {
    slug: "pack-assembled",
    label: "Pack assembled",
    event: "pack.assembled",
    seat: "enterprise",
    status: "catalogue",
    lede: "Morning pack assembly. Delivery queue not live.",
  },
];

export function deliveredWebhooks() {
  return [] as { id: string; endpointSlug: string; at: string }[];
}

export function armedWebhooks() {
  return webhookEndpoints.filter((item) => item.status === "armed");
}
