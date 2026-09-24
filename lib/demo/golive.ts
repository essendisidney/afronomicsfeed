export type GoLiveGate = {
  id: string;
  layer: "facts" | "store" | "auth" | "delivery" | "legal" | "social";
  label: string;
  status: "blocked" | "ready" | "partial";
  lede: string;
  href: string;
};

/**
 * What must land before official prints replace empty cells.
 * Ready = surface exists. Blocked = cannot ship real data yet.
 */
export const goLiveGates: GoLiveGate[] = [
  {
    id: "official-doors",
    layer: "facts",
    label: "Official source registry",
    status: "partial",
    lede: "Linked doors exist. Pending rows are not production citations.",
    href: "/sources",
  },
  {
    id: "observation-store",
    layer: "store",
    label: "Append-only observation store",
    status: "blocked",
    lede: "No database writes for prints. SQL migration is stub only.",
    href: "/ingestion",
  },
  {
    id: "validators",
    layer: "store",
    label: "Ingestion validators + as-of",
    status: "partial",
    lede: "Validator stubs exist. Nothing is scheduled against a live queue.",
    href: "/ingestion",
  },
  {
    id: "entity-resolution",
    layer: "store",
    label: "Entity resolution jobs",
    status: "partial",
    lede: "Resolver refuses unknowns. Upserts are not scheduled.",
    href: "/graph/resolve",
  },
  {
    id: "auth-billing",
    layer: "auth",
    label: "Auth + billing seats",
    status: "blocked",
    lede: "Every visitor is Free. Checkout stubs only.",
    href: "/account",
  },
  {
    id: "ask-rag",
    layer: "store",
    label: "Ask corpus embeddings",
    status: "blocked",
    lede: "Slots exist. Index is empty. Refuse is correct.",
    href: "/ask/corpus",
  },
  {
    id: "delivery",
    layer: "delivery",
    label: "Alerts / packs / webhooks delivery",
    status: "blocked",
    lede: "Catalogues only. No email, push or callback runner.",
    href: "/webhooks",
  },
  {
    id: "republication",
    layer: "legal",
    label: "Republication vs link policy",
    status: "partial",
    lede: "Method forbids tape mirrors. Legal review still needed per source.",
    href: "/method",
  },
  {
    id: "linkedin",
    layer: "social",
    label: "LinkedIn company page link",
    status: "ready",
    lede: "Company page linked. Share intents open LinkedIn with site URLs.",
    href: "/social",
  },
  {
    id: "trust-page",
    layer: "legal",
    label: "Security / trust catalogue",
    status: "partial",
    lede: "Control list published. SOC 2 and incident response remain empty.",
    href: "/security",
  },
];

export function gatesByStatus(status: GoLiveGate["status"]) {
  return goLiveGates.filter((gate) => gate.status === status);
}
