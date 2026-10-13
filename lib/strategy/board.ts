/**
 * The founder's status board on /desk: what is live, in build, parked or only an idea, and the decisions waiting on
 * the founder. Kept by hand (or by the weekly learning loop) in step with docs/strategy/decision-log.md, so the desk
 * never claims more than is true. A prototype is "build", never "live".
 */

export type Status = "live" | "build" | "parked" | "idea";
export type BoardItem = { name: string; status: Status; note: string; href?: string };

export const BOARD_UPDATED = "2026-10-13";

export const BOARD: BoardItem[] = [
  // Live: the wedge, African local-currency government debt data.
  { name: "Bond auction data: Kenya, Nigeria, Egypt, Uganda, Zambia, WAEMU (8 markets)", status: "live", note: "Official sources, checked on every run; T-bills in ten markets as short-end context", href: "/markets/bonds" },
  { name: "Frontier local-debt product page and pilot request", status: "live", note: "Coverage by GBI-EM Edge market, gaps shown; 30-day pilot", href: "/data/frontier-local-debt" },
  { name: "Debt Monitor", status: "live", note: "Latest auctions per market against their recent range", href: "/data/frontier-local-debt/monitor" },
  { name: "Weekly auction wrap", status: "live", note: "Every market's results for the week in one page", href: "/markets/auction-week" },
  { name: "East Africa hub", status: "live", note: "Kenya, Uganda and neighbours in one place", href: "/east-africa" },
  { name: "API and CSV for every bond market", status: "live", note: "Keyed API with usage per key; pilot keys are plan “trial”", href: "/data-api" },
  { name: "One rate card", status: "live", note: "Analyst $250, Team and API $1,500, Enterprise from $5,000 a month; reader plans below", href: "/pricing" },
  { name: "Founder command centre", status: "live", note: "Collected vs signed vs pipeline vs pilots; model vs reality; this board" },
  // Build.
  { name: "Morocco bond history", status: "build", note: "Newest Treasury results read; older years need paging through the Ministry's archive" },
  { name: "Outreach wave 2", status: "build", note: "6 of 25 contacted on 12 Oct (D-004 test); next 19 qualified contacts" },
  { name: "Reader tests (automated checks for each data reader)", status: "build", note: "Needed before institutional pilots scale" },
  // Parked (kept live, no investment).
  { name: "Consumer tools (pay, rent, loan-cost, price reports, chama, diaspora)", status: "parked", note: "D-001: 1 reader report in total; no building until there is traffic" },
  { name: "Tender alerts", status: "parked", note: "D-002: the regulator's open data is monthly; the live list blocks automation" },
  { name: "Consumer Pro, Pack, widgets, listings, jobs, news sections", status: "parked", note: "No buyers yet; no consumer paywall (D-007)" },
  // Ideas.
  { name: "Tunisia bond auctions (5.3% of GBI-EM Edge)", status: "idea", note: "No usable official source found (D-011); shown as a gap" },
  { name: "Licensable auction-yield index", status: "idea", note: "Enterprise and index licensing; part of the path beyond the debt wedge" },
];

export const DECISIONS: { ask: string; why: string }[] = [
  { ask: "Send or drop the Ninety One and Allan Gray drafts", why: "Two of the top-10 prospects; the D-004 test needs 25 qualified contacts by about 26 Oct (6 so far)" },
  { ask: "Outreach route: automatic sending, or drafts that you send", why: "Sets how fast wave 2 goes out and who is accountable for each note" },
  { ask: "Legal: Kenya CIS advertising rules (LN 173/2023), plus a standard data licence and pilot terms", why: "Before any paid fund listing and before the first paid licence" },
  { ask: "Repository: keep public or make private", why: "The whole dataset can be copied from a public repo; private costs about USD 20–40 a month in automation" },
  { ask: "Re-enable the weekly sprint, or keep it paused", why: "It ships code on its own; paused since 12 Oct (D-005)" },
  { ask: "Raise capital or not", why: "The debt wedge caps at about USD 2–3m a year; only the aggressive case (capital, a seller, a second dataset) passes USD 50k a month within 36 months" },
];
