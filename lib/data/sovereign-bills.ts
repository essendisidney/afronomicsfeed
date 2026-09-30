import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { loadTbills } from "./kenya-tbills";

/**
 * Treasury bill auctions across African markets in one shape. Each market keeps its own extractor
 * (scripts/<country>_tbills.py) and file; this module normalises them for pages, the monitor and CSVs.
 */

export type BillTenor = 91 | 182 | 364;
export const billTenors: BillTenor[] = [91, 182, 364];

export type BillRow = {
  tenor: BillTenor;
  date: string; // value (issue) date, YYYY-MM-DD
  rate: number; // the market's headline rate, % p.a.
  offered: number | null; // local currency, millions (per tenor where published)
  received: number | null;
  accepted: number | null;
  source: string;
};

export type BillMarket = {
  slug: "kenya" | "nigeria" | "ghana" | "uganda" | "tanzania";
  country: string;
  iso: string;
  currency: string;
  publisher: string;
  sourcePage: string;
  rateLabel: string;
  rateNote: string;
  href: string;
};

export const billMarkets: BillMarket[] = [
  {
    slug: "kenya",
    country: "Kenya",
    iso: "KE",
    currency: "KES",
    publisher: "Central Bank of Kenya",
    sourcePage: "https://www.centralbank.go.ke/bills-bonds/treasury-bills/",
    rateLabel: "Weighted average rate",
    rateNote: "weighted average rate of accepted bids",
    href: "/markets/kenya-tbills",
  },
  {
    slug: "nigeria",
    country: "Nigeria",
    iso: "NG",
    currency: "NGN",
    publisher: "Central Bank of Nigeria",
    sourcePage: "https://www.cbn.gov.ng/rates/GovtSecurities.html",
    rateLabel: "Stop rate",
    rateNote: "stop (issue) rate at the primary auction",
    href: "/markets/tbills/nigeria",
  },
  {
    slug: "ghana",
    country: "Ghana",
    iso: "GH",
    currency: "GHS",
    publisher: "Bank of Ghana",
    sourcePage: "https://www.bog.gov.gh/gog_auction_results/",
    rateLabel: "Interest rate",
    rateNote: "weighted average interest-rate equivalent",
    href: "/markets/tbills/ghana",
  },
  {
    slug: "uganda",
    country: "Uganda",
    iso: "UG",
    currency: "UGX",
    publisher: "Bank of Uganda",
    sourcePage: "https://www.bou.or.ug/bouwebsite/FinancialMarkets/tbillsauctionresults.html",
    rateLabel: "Money-market yield",
    rateNote: "money-market yield at the cut-off price",
    href: "/markets/tbills/uganda",
  },
  {
    slug: "tanzania",
    country: "Tanzania",
    iso: "TZ",
    currency: "TZS",
    publisher: "Bank of Tanzania",
    sourcePage: "https://www.bot.go.tz/TBills?lang=en",
    rateLabel: "Weighted average yield",
    rateNote: "weighted average yield of successful bids",
    href: "/markets/tbills/tanzania",
  },
];

export function getBillMarket(slug: string) {
  return billMarkets.find((market) => market.slug === slug);
}

const FILES = {
  nigeria: path.join(process.cwd(), "data", "nigeria", "tbill_auctions.json"),
  ghana: path.join(process.cwd(), "data", "ghana", "tbill_auctions.json"),
  uganda: path.join(process.cwd(), "data", "uganda", "tbill_auctions.json"),
  tanzania: path.join(process.cwd(), "data", "tanzania", "tbill_auctions.json"),
};

function readJson(file: string): { updated_at?: string; rows?: Record<string, unknown>[] } | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const n = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export const loadBillMarket = cache((slug: BillMarket["slug"]): { rows: BillRow[]; updatedAt: string | null } => {
  if (slug === "kenya") {
    const file = loadTbills();
    return {
      updatedAt: file.updatedAt,
      rows: file.rows.map((row) => ({
        tenor: row.tenor,
        date: row.value_date,
        rate: row.weighted_avg_rate,
        offered: row.offered_kes_m,
        received: row.received_kes_m,
        accepted: row.accepted_kes_m,
        source: row.source,
      })),
    };
  }
  const raw = readJson(FILES[slug]);
  if (!raw?.rows) return { rows: [], updatedAt: null };
  const cur = { nigeria: "ngn", ghana: "ghs", uganda: "ugx", tanzania: "tzs" }[slug];
  const rows: BillRow[] = raw.rows.flatMap((r) => {
    const tenor = Number(r.tenor) as BillTenor;
    const date = String(r.value_date ?? "");
    const rate = slug === "nigeria" ? n(r.stop_rate) : n(r.weighted_avg_rate);
    if (!billTenors.includes(tenor) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || rate == null) return [];
    return [
      {
        tenor,
        date,
        rate,
        offered: n(r[`offered_${cur}_m`]),
        received: n(r[`received_${cur}_m`]),
        accepted: n(r[`accepted_${cur}_m`]),
        source: String(r.source ?? ""),
      },
    ];
  });
  rows.sort((a, b) => b.date.localeCompare(a.date) || a.tenor - b.tenor);
  return { rows, updatedAt: raw.updated_at ?? null };
});

export function latestBills(rows: BillRow[]) {
  const out = new Map<BillTenor, { latest: BillRow; previous?: BillRow }>();
  for (const tenor of billTenors) {
    const list = rows.filter((row) => row.tenor === tenor);
    if (list[0]) out.set(tenor, { latest: list[0], previous: list[1] });
  }
  return out;
}

export function billHistory(rows: BillRow[], since?: string) {
  const byDate = new Map<string, Record<string, number | null>>();
  for (const row of rows) {
    if (since && row.date < since) continue;
    const entry = byDate.get(row.date) ?? { "91": null, "182": null, "364": null };
    entry[String(row.tenor)] = row.rate;
    byDate.set(row.date, entry);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, values }));
}

export function billWeeks(rows: BillRow[], limit = 52) {
  const weeks = new Map<string, BillRow[]>();
  for (const row of rows) weeks.set(row.date, [...(weeks.get(row.date) ?? []), row]);
  return [...weeks.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([date, list]) => {
      const sum = (key: "offered" | "received" | "accepted") => {
        const values = list.map((row) => row[key]).filter((v): v is number => v != null);
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
      };
      return { date, rows: list.sort((a, b) => a.tenor - b.tenor), offered: sum("offered"), received: sum("received"), accepted: sum("accepted"), source: list[0]?.source };
    });
}

export function billsCsv(market: BillMarket, rows: BillRow[], updatedAt: string | null) {
  const header = ["value_date", "tenor_days", `rate_pct (${market.rateNote})`, `offered_${market.currency.toLowerCase()}_m`, `received_${market.currency.toLowerCase()}_m`, `accepted_${market.currency.toLowerCase()}_m`, "source"];
  const cell = (v: unknown) => (v == null ? "" : String(v));
  return [
    `# ${market.country} Treasury bill auctions, one row per tenor per auction`,
    `# Source: ${market.publisher} (${market.sourcePage}). Compiled by Afronomics (afronomicsfeed.com). Updated ${updatedAt ?? "n/a"}. Amounts in ${market.currency} millions.`,
    header.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => [r.date, r.tenor, r.rate, r.offered, r.received, r.accepted, `"${r.source}"`].map(cell).join(",")),
  ].join("\n");
}
