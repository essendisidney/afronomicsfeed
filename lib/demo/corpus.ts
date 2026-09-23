export type CorpusDoc = {
  slug: string;
  title: string;
  kind: "brief" | "filing" | "methodology" | "notice";
  status: "empty" | "indexed";
  lede: string;
  href?: string;
};

/** RAG corpus slots. Empty until chunks are stored with provenance. */
export const corpusDocs: CorpusDoc[] = [
  {
    slug: "cbk-mpc-method",
    title: "How to read a CBK MPC statement",
    kind: "brief",
    status: "empty",
    lede: "Kenya desk brief exists as Markdown. Chunks are not embedded yet.",
    href: "/brief/how-to-read-a-cbk-mpc-statement",
  },
  {
    slug: "kenya-policy-rate-series",
    title: "Kenya policy-rate series",
    kind: "notice",
    status: "empty",
    lede: "Indicator cell is blank. No observation store to retrieve.",
    href: "/indicators/policy-rate/kenya",
  },
  {
    slug: "nse-issuer-window",
    title: "NSE issuer window",
    kind: "filing",
    status: "empty",
    lede: "Official door only. Afronomics does not mirror the tape.",
    href: "/institutions/nse",
  },
  {
    slug: "pulse-methodology",
    title: "Afronomics Pulse methodology",
    kind: "methodology",
    status: "empty",
    lede: "Methodology file is published. Score series is not in production.",
    href: "/data/pulse-methodology",
  },
  {
    slug: "climate-kenya",
    title: "Kenya climate capital notes",
    kind: "notice",
    status: "empty",
    lede: "Climate file is a shell until a cited facility is stored.",
    href: "/climate/kenya",
  },
  {
    slug: "northern-corridor",
    title: "Northern Corridor geography",
    kind: "methodology",
    status: "empty",
    lede: "Corridor editorial file. Volumes unpublished.",
    href: "/trade/northern-corridor",
  },
  {
    slug: "nigeria-policy-rate",
    title: "Nigeria policy-rate cell",
    kind: "notice",
    status: "empty",
    lede: "CBN door only. No observation store to retrieve.",
    href: "/indicators/policy-rate/nigeria",
  },
  {
    slug: "south-africa-markets",
    title: "South Africa markets desk",
    kind: "notice",
    status: "empty",
    lede: "JSE / SARB shells. Amounts stay blank until cited.",
    href: "/countries/south-africa",
  },
  {
    slug: "egypt-energy",
    title: "Egypt energy sector note",
    kind: "notice",
    status: "empty",
    lede: "Industry file is a shell until a cited facility is stored.",
    href: "/industries/energy/egypt",
  },
];

export function getCorpusDoc(slug: string) {
  return corpusDocs.find((item) => item.slug === slug);
}

export function indexedCorpusCount() {
  return corpusDocs.filter((item) => item.status === "indexed").length;
}
