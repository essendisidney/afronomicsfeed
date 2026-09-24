export type Runbook = {
  slug: string;
  title: string;
  desk: string;
  status: "empty" | "outline";
  lede: string;
  hrefs: string[];
};

/** Desk SOPs. Empty until an editor files the steps. */
export const runbooks: Runbook[] = [
  {
    slug: "kenya-morning",
    title: "Kenya morning open",
    desk: "kenya",
    status: "outline",
    lede: "Check CBK door, morning file, and Kenya graph. No invented tape.",
    hrefs: ["/today", "/graph/kenya", "/sources"],
  },
  {
    slug: "mpc-read",
    title: "MPC statement read",
    desk: "kenya",
    status: "outline",
    lede: "Cite the notice, stamp as-of, leave rate cells blank until verified.",
    hrefs: ["/brief/how-to-read-a-cbk-mpc-statement", "/method"],
  },
  {
    slug: "corridor-disruption",
    title: "Corridor disruption note",
    desk: "northern-corridor",
    status: "empty",
    lede: "Would tag ports and borders. Volumes stay unpublished.",
    hrefs: ["/graph/northern-corridor", "/trade/northern-corridor", "/calendar"],
  },
  {
    slug: "export-mint-check",
    title: "Export mint check",
    desk: "product",
    status: "empty",
    lede: "Seat, as-of, provenance. Mint is offline.",
    hrefs: ["/exports", "/account/usage", "/audit"],
  },
  {
    slug: "signal-open",
    title: "Open a signal file",
    desk: "signals",
    status: "empty",
    lede: "Fact / interpretation separation. Confidence stays Low until cited.",
    hrefs: ["/signals", "/method/registry"],
  },
  {
    slug: "linkedin-crosspost",
    title: "LinkedIn cross-post",
    desk: "social",
    status: "outline",
    lede: "File the piece first. Share via /social. Link the company page. Do not invent engagement.",
    hrefs: ["/social", "/press", "/runbooks"],
  },
];

export function outlinedRunbookCount() {
  return runbooks.filter((item) => item.status === "outline").length;
}
