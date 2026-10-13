/**
 * The founder's status board on /desk: what is live, in build, parked or only an idea. Kept by hand (or by the
 * weekly learning loop) in step with docs/strategy/decision-log.md, so the desk never claims more than is true. A prototype is "build", never "live".
 */

export type Status = "live" | "build" | "parked" | "idea";
export type BoardItem = { name: string; status: Status; note: string; href?: string };

export const BOARD_UPDATED = "2026-10-13";

/** Outreach notes sent by the founder (the deal log is updated separately). */
export const CONTACTED = { count: 21, on: "12–13 Oct 2026" };

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
  { name: "Outreach wave 2", status: "build", note: "21 of 25 contacted on 12–13 Oct (D-004 test); Ninety One draft waits on the founder; follow-ups 21–22 Oct" },
  { name: "Reader tests (automated checks for each data reader)", status: "build", note: "Needed before institutional pilots scale" },
  // Parked (kept live, no investment).
  { name: "Consumer tools (pay, rent, loan-cost, price reports, chama, diaspora)", status: "parked", note: "D-001: 1 reader report in total; no building until there is traffic" },
  { name: "Tender alerts", status: "parked", note: "D-002: the regulator's open data is monthly; the live list blocks automation" },
  { name: "Consumer Pro, Pack, widgets, listings, jobs, news sections", status: "parked", note: "No buyers yet; no consumer paywall (D-007)" },
  // Ideas.
  { name: "Tunisia bond auctions (5.3% of GBI-EM Edge)", status: "idea", note: "No usable official source found (D-011); shown as a gap" },
  { name: "Licensable auction-yield index", status: "idea", note: "Enterprise and index licensing; part of the path beyond the debt wedge" },
];

// Decisions waiting on the founder moved to lib/desk/reference.ts (F1–F11, A1–A4), shown in the desk's Decisions panel.
