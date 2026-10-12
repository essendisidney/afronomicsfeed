import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { loadBonds } from "./kenya-bonds";

/**
 * Government bond auctions across African markets, in one shape. Each market's reader writes its own file
 * (scripts/kenya_bonds.py, zambia_bonds.py, egypt_bonds.py) with the publisher's own fields; this maps them to common
 * columns. Amounts are in millions of the local currency; a field the publisher does not give is null.
 */

export type BondRow = {
  date: string;
  isin: string | null;
  issue: string | null;
  tenor_years: number | null;
  maturity: string | null;
  type: string | null;
  offered_m: number | null;
  received_m: number | null;
  accepted_m: number | null;
  bid_cover: number | null;
  rate: number;
  min_rate: number | null;
  max_rate: number | null;
  coupon: number | null;
  source: string;
};

export type BondMarket = {
  slug: "kenya" | "zambia" | "egypt";
  country: string;
  currency: string;
  publisher: string;
  sourcePage: string;
  rateNote: string;
};

export const bondMarkets: BondMarket[] = [
  {
    slug: "kenya",
    country: "Kenya",
    currency: "KES",
    publisher: "Central Bank of Kenya",
    sourcePage: "https://www.centralbank.go.ke/bills-bonds/treasury-bonds/",
    rateNote: "weighted average rate of accepted bids, percent per annum",
  },
  {
    slug: "zambia",
    country: "Zambia",
    currency: "ZMW",
    publisher: "Bank of Zambia",
    sourcePage: "https://www.boz.zm/markets-securities/bonds",
    rateNote: "cut-off yield by tenor, percent per annum; amounts at face value",
  },
  {
    slug: "egypt",
    country: "Egypt",
    currency: "EGP",
    publisher: "Central Bank of Egypt (for the Ministry of Finance)",
    sourcePage: "https://www.cbe.org.eg/en/auctions/egp-t-bonds-fixed-coupon/historical-data",
    rateNote: "weighted average yield of accepted bids, percent per annum; fixed-coupon, zero-coupon and floating-rate bonds",
  },
];

export const getBondMarket = (slug: string) => bondMarkets.find((m) => m.slug === slug) ?? null;

type Raw = Record<string, unknown>;
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const s = (v: unknown) => (typeof v === "string" && v ? v : null);

function readFile(slug: string): { updated: string | null; rows: Raw[] } {
  const file = path.join(process.cwd(), "data", slug, "bond_auctions.json");
  if (!fs.existsSync(file)) return { updated: null, rows: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { updated?: string; rows?: Raw[] };
    return { updated: raw.updated ?? null, rows: raw.rows ?? [] };
  } catch {
    return { updated: null, rows: [] };
  }
}

export const loadBondMarket = cache((slug: BondMarket["slug"]): { updatedAt: string | null; rows: BondRow[] } => {
  if (slug === "kenya") {
    const k = loadBonds();
    const rows = k.rows.map((r) => ({
      date: r.value_date,
      isin: null,
      issue: r.issue,
      tenor_years: r.tenor_years,
      maturity: r.maturity,
      type: r.kind,
      offered_m: r.offered_total_kes_m,
      received_m: r.received_kes_m,
      accepted_m: r.accepted_kes_m,
      bid_cover: r.bid_to_cover,
      rate: r.weighted_avg_rate,
      min_rate: null,
      max_rate: null,
      coupon: r.coupon,
      source: r.source,
    }));
    return { updatedAt: k.updatedAt, rows: rows.sort((a, b) => b.date.localeCompare(a.date)) };
  }
  const { updated, rows } = readFile(slug);
  const out: BondRow[] = rows.flatMap((r) => {
    const rate = slug === "zambia" ? n(r.yield) : n(r.weighted_avg_yield);
    const date = slug === "zambia" ? s(r.auction_date) : s(r.issue_date);
    if (rate === null || !date) return [];
    return [
      slug === "zambia"
        ? {
            date,
            isin: s(r.isin),
            issue: s(r.tender),
            tenor_years: n(r.tenor_years),
            maturity: null,
            type: null,
            offered_m: n(r.offered_zmw_m),
            received_m: n(r.bid_face_zmw_m),
            accepted_m: n(r.allocated_face_zmw_m),
            bid_cover: n(r.bid_cover),
            rate,
            min_rate: null,
            max_rate: null,
            coupon: n(r.coupon),
            source: s(r.notice) ?? s(r.source) ?? "",
          }
        : {
            date,
            isin: s(r.isin),
            issue: s(r.kind),
            tenor_years: n(r.tenor_years),
            maturity: s(r.maturity),
            type: s(r.type),
            offered_m: n(r.offered_egp_m),
            received_m: n(r.received_egp_m),
            accepted_m: n(r.accepted_egp_m),
            bid_cover: n(r.bid_cover),
            rate,
            min_rate: n(r.min_yield),
            max_rate: n(r.max_yield),
            coupon: n(r.coupon),
            source: s(r.source) ?? "",
          },
    ];
  });
  return { updatedAt: updated, rows: out.sort((a, b) => b.date.localeCompare(a.date)) };
});
