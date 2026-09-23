export type ResearchReport = {
  slug: string;
  title: string;
  desk: string;
  status: "empty" | "outline" | "published";
  seat: "pro" | "professional" | "enterprise";
  lede: string;
  hrefs: string[];
};

/** Research report shells. Empty until a cited brief is filed. */
export const researchReports: ResearchReport[] = [
  {
    slug: "kenya-mpc-read",
    title: "How to read a CBK MPC statement",
    desk: "kenya",
    status: "outline",
    seat: "pro",
    lede: "Method brief exists. Full memo stays behind Individual when Auth is live.",
    hrefs: ["/brief/how-to-read-a-cbk-mpc-statement", "/method"],
  },
  {
    slug: "northern-corridor-map",
    title: "Northern Corridor geography note",
    desk: "northern-corridor",
    status: "empty",
    seat: "pro",
    lede: "Corridor file is editorial. Volumes unpublished.",
    hrefs: ["/trade/northern-corridor", "/graph/northern-corridor"],
  },
  {
    slug: "climate-gap-method",
    title: "Climate finance gap method",
    desk: "climate",
    status: "outline",
    seat: "professional",
    lede: "Methodology scaffold. Gap math not production.",
    hrefs: ["/climate", "/data/pulse-methodology"],
  },
  {
    slug: "morocco-markets",
    title: "Morocco markets desk note",
    desk: "morocco",
    status: "empty",
    seat: "pro",
    lede: "BAM / Casablanca shells. Amounts stay blank until cited.",
    hrefs: ["/countries/morocco", "/graph/morocco"],
  },
  {
    slug: "enterprise-feed-spec",
    title: "Enterprise feed specification",
    desk: "product",
    status: "empty",
    seat: "enterprise",
    lede: "Pairs with /feeds catalogue. Spec not written.",
    hrefs: ["/feeds", "/licensing"],
  },
];

export function publishedReports() {
  return researchReports.filter((item) => item.status === "published");
}
