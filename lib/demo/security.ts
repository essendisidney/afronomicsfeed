export type SecurityControl = {
  slug: string;
  label: string;
  layer: "transport" | "access" | "data" | "ops" | "compliance";
  status: "ready" | "partial" | "blocked" | "empty";
  lede: string;
  href?: string;
};

/**
 * Enterprise trust catalogue.
 * Ready = true for this build. Empty = not claimed. Never invent a badge.
 */
export const securityControls: SecurityControl[] = [
  {
    slug: "https",
    label: "Transport encryption",
    layer: "transport",
    status: "ready",
    lede: "Public site served over HTTPS on the production host.",
  },
  {
    slug: "auth-sessions",
    label: "Auth and sessions",
    layer: "access",
    status: "blocked",
    lede: "No signed-in seats. Checkout and Auth remain stubs.",
    href: "/account",
  },
  {
    slug: "rls",
    label: "Row-level security",
    layer: "data",
    status: "partial",
    lede: "Schema stubs include RLS. No live tenant store yet.",
    href: "/ingestion",
  },
  {
    slug: "append-only",
    label: "Append-only observations",
    layer: "data",
    status: "partial",
    lede: "Product rule is set. Write path is not live.",
    href: "/method",
  },
  {
    slug: "secrets",
    label: "No client service role",
    layer: "ops",
    status: "ready",
    lede: "Service credentials are never shipped to the browser.",
    href: "/developers",
  },
  {
    slug: "audit-log",
    label: "Audit trail",
    layer: "ops",
    status: "empty",
    lede: "Audit shell exists. No events are recorded yet.",
    href: "/audit",
  },
  {
    slug: "soc2",
    label: "SOC 2 / ISO claim",
    layer: "compliance",
    status: "empty",
    lede: "No certificate is asserted. Do not invent a badge.",
  },
  {
    slug: "incident",
    label: "Incident response",
    layer: "ops",
    status: "empty",
    lede: "Runbook not published. Contact via advisory when live.",
    href: "/advisory",
  },
];

export function controlsByStatus(status: SecurityControl["status"]) {
  return securityControls.filter((item) => item.status === status);
}
