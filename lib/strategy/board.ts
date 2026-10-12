/**
 * The founder's status board on /desk: what is live, in build, parked or only an idea, and the decisions waiting on
 * the founder. Kept by hand (or by the weekly learning loop) in step with docs/strategy/decision-log.md, so the desk
 * never claims more than is true. A prototype is "build", never "live".
 */

export type Status = "live" | "build" | "parked" | "idea";
export type BoardItem = { name: string; status: Status; note: string; href?: string };

export const BOARD_UPDATED = "2026-10-12";

export const BOARD: BoardItem[] = [
  // The wedge: African local-currency government debt data.
  { name: "T-bill auction data, 10 central banks", status: "live", note: "16,276 results in standard tenors; health-checked after every run", href: "/status" },
  { name: "Kenya bond auctions", status: "live", note: "388 auctions since 2010", href: "/markets/kenya-bonds" },
  { name: "Frontier local-debt product page and pilot request", status: "live", note: "Coverage by GBI-EM Edge market; price ladder", href: "/data/frontier-local-debt" },
  { name: "Keyed API with usage per key", status: "live", note: "Pilot keys are plan “trial”", href: "/data-api" },
  { name: "Zambia bond auctions", status: "build", note: "Reader written; inspect run on GitHub before it joins the data run" },
  { name: "Egypt bond auctions", status: "build", note: "Reader written; inspect run on GitHub before it joins the data run" },
  { name: "WAEMU bonds via UMOA-Titres (Côte d’Ivoire, Senegal and 6 more)", status: "idea", note: "Next reader: one parser, eight sovereigns" },
  { name: "Nigeria FGN bond auctions (DMO)", status: "idea", note: "Monthly PDFs; after WAEMU" },
  { name: "Morocco, Tunisia, Angola", status: "idea", note: "In the index; sources not yet researched" },
  { name: "Webhooks, Excel and Sheets delivery, Python package", status: "idea", note: "Build when a pilot asks" },
  { name: "Auction-implied curves, Edge-eligible bond universe", status: "idea", note: "Derived data nobody else has" },
  // Operating systems.
  { name: "Founder command centre", status: "live", note: "Collected vs signed vs pipeline vs pilots; this board" },
  { name: "Paystack (live key)", status: "live", note: "All consumer and SME products; institutions invoiced in USD" },
  { name: "Security headers", status: "live", note: "CSP in report-only mode still to do" },
  { name: "Automated tests for data readers", status: "idea", note: "Needed before institutional pilots scale" },
  { name: "Outreach to pilot prospects", status: "build", note: "55 prospects logged; draft note awaits founder approval; founder sends" },
  // Parked (kept live, no investment).
  { name: "Tender alerts", status: "parked", note: "Regulator's open data is monthly; live list blocks automation" },
  { name: "Pay, rent, price and loan-cost reports", status: "parked", note: "1 report in total" },
  { name: "Consumer Pro, Pack, widgets, listings, jobs", status: "parked", note: "No buyers yet" },
  { name: "Chama, diaspora, learn, radio, ask, signals, news sections", status: "parked", note: "Low traffic; automated" },
  { name: "Remittance referral links", status: "parked", note: "Earns once the founder joins the affiliate programmes" },
];

export const DECISIONS: { ask: string; why: string }[] = [
  { ask: "Approve and send the pilot outreach note (you send it; nothing goes out from here)", why: "No pilot, no proof; the wedge's first test" },
  { ask: "Repository: keep public or make private", why: "The whole dataset can be copied from a public repo; private costs about USD 20–40 a month in automation" },
  { ask: "Legal: Kenya CIS advertising rules (LN 173/2023) on fund buttons and paid listings; a standard data licence and pilot terms", why: "Before the first paid licence and before any paid fund listing" },
  { ask: "Re-enable the Wednesday money sprint, or keep it paused", why: "It ships code on its own; paused since 12 Oct" },
  { ask: "Raise capital or not (base case needs about USD 1.3m before profit)", why: "Sets how fast coverage and sales can grow" },
];
