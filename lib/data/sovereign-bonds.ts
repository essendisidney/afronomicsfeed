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
  slug: "kenya" | "zambia" | "egypt" | "nigeria" | "uganda" | "morocco" | "waemu";
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
  {
    slug: "nigeria",
    country: "Nigeria",
    currency: "NGN",
    publisher: "Debt Management Office, Nigeria",
    sourcePage: "https://www.dmo.gov.ng/fgn-bonds/auction",
    rateNote: "marginal (stop) rate, percent per annum; uniform-price auctions, so every successful bid pays it",
  },
  {
    slug: "uganda",
    country: "Uganda",
    currency: "UGX",
    publisher: "Bank of Uganda (for the Ministry of Finance)",
    sourcePage: "https://www.bou.or.ug/bouwebsite/FinancialMarkets/tbondsauctionresults.html",
    rateNote: "yield at the cut-off price, percent per annum",
  },
  {
    slug: "morocco",
    country: "Morocco",
    currency: "MAD",
    publisher: "Direction du Trésor et des Finances Extérieures (Ministry of Economy and Finance)",
    sourcePage: "https://www.finances.gov.ma/fr/Pages/communiques.aspx",
    rateNote: "weighted average rate (TMP) of accepted bids, percent per annum; lines of 2 years or more where the Treasury accepted bids",
  },
  {
    slug: "waemu",
    country: "WAEMU (Benin, Burkina Faso, Côte d’Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo)",
    currency: "XOF",
    publisher: "UMOA-Titres (for the eight WAEMU treasuries)",
    sourcePage: "https://www.umoatitres.org/fr/emissions/",
    rateNote: "weighted average yield of accepted bids, percent per annum; Treasury bonds (OAT) only; the issuing country is in the issue field",
  },
];

const WAEMU_NAMES: Record<string, string> = {
  benin: "Benin",
  "burkina-faso": "Burkina Faso",
  "cote-divoire": "Côte d’Ivoire",
  "guinea-bissau": "Guinea-Bissau",
  mali: "Mali",
  niger: "Niger",
  senegal: "Senegal",
  togo: "Togo",
};

export const getBondMarket = (slug: string) => bondMarkets.find((m) => m.slug === slug) ?? null;

type Raw = Record<string, unknown>;
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const s = (v: unknown) => (typeof v === "string" && v ? v : null);

function readFile(slug: string): { updated: string | null; rows: Raw[] } {
  const file = path.join(process.cwd(), "data", slug, slug === "waemu" || slug === "morocco" ? "auctions.json" : "bond_auctions.json");
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
  if (slug === "nigeria") {
    const out: BondRow[] = rows.flatMap((r) => {
      const rate = n(r.marginal_rate);
      const date = s(r.auction_date);
      if (rate === null || !date) return [];
      return [
        {
          date,
          isin: null,
          issue: s(r.bond),
          tenor_years: n(r.tenor_years),
          maturity: s(r.maturity),
          type: s(r.type),
          offered_m: n(r.offered_ngn_m),
          received_m: n(r.subscription_ngn_m),
          accepted_m: n(r.allotted_market_ngn_m),
          bid_cover: n(r.bid_cover),
          rate,
          min_rate: n(r.bid_low),
          max_rate: n(r.bid_high),
          coupon: n(r.coupon),
          source: s(r.source) ?? "",
        },
      ];
    });
    return { updatedAt: updated, rows: out.sort((a, b) => b.date.localeCompare(a.date)) };
  }
  if (slug === "morocco") {
    const out: BondRow[] = rows.flatMap((r) => {
      const rate = n(r.rate);
      const date = s(r.auction_date);
      const years = n(r.tenor_years);
      if (rate === null || !date || years === null || years < 2 || !n(r.accepted_mad_m)) return [];
      const bids = n(r.bids_mad_m);
      const accepted = n(r.accepted_mad_m);
      return [
        {
          date,
          isin: s(r.isin),
          issue: null,
          tenor_years: years,
          maturity: s(r.maturity),
          type: null,
          offered_m: null,
          received_m: bids,
          accepted_m: accepted,
          bid_cover: bids && accepted ? Math.round((bids / accepted) * 100) / 100 : null,
          rate,
          min_rate: null,
          max_rate: null,
          coupon: n(r.coupon),
          source: s(r.source) ?? "",
        },
      ];
    });
    return { updatedAt: updated, rows: out.sort((a, b) => b.date.localeCompare(a.date)) };
  }
  if (slug === "uganda") {
    const out: BondRow[] = rows.flatMap((r) => {
      const rate = n(r.yield);
      const date = s(r.auction_date);
      if (rate === null || !date) return [];
      return [
        {
          date,
          isin: s(r.isin),
          issue: null,
          tenor_years: n(r.tenor_years),
          maturity: s(r.maturity),
          type: null,
          offered_m: n(r.offered_ugx_m),
          received_m: n(r.tendered_ugx_m),
          accepted_m: n(r.accepted_ugx_m),
          bid_cover: n(r.bid_cover),
          rate,
          min_rate: null,
          max_rate: null,
          coupon: n(r.coupon),
          source: s(r.source) ?? "",
        },
      ];
    });
    return { updatedAt: updated, rows: out.sort((a, b) => b.date.localeCompare(a.date)) };
  }
  if (slug === "waemu") {
    const out: BondRow[] = rows.flatMap((r) => {
      const rate = n(r.weighted_yield);
      const date = s(r.operation_date);
      if (r.instrument !== "OAT" || rate === null || !date) return [];
      const months = n(r.months);
      return [
        {
          date,
          isin: null,
          issue: WAEMU_NAMES[String(r.country)] ?? s(r.country),
          tenor_years: months ? Math.round((months / 12) * 10) / 10 : null,
          maturity: s(r.maturity),
          type: null,
          offered_m: null, // UMOA-Titres gives the amount sought for the whole issue, not per bond
          received_m: n(r.bids_xof_m),
          accepted_m: n(r.accepted_xof_m),
          bid_cover: n(r.bid_cover),
          rate,
          min_rate: null,
          max_rate: null,
          coupon: n(r.coupon),
          source: s(r.source) ?? "",
        },
      ];
    });
    return { updatedAt: updated, rows: out.sort((a, b) => b.date.localeCompare(a.date)) };
  }
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
