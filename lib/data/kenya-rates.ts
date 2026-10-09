import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { auctionCurve } from "./kenya-bonds";
import { latestByTenor, loadTbills } from "./kenya-tbills";

/**
 * Where a shilling earns most: every place a saver or treasurer can put money, on one scale, with the tax
 * each one carries. Sources are the Central Bank of Kenya (bills, bonds, bank rates) and each fund manager's
 * own published yield (scripts/kenya_rates.py).
 */

export type RateOption = {
  group: "Government" | "Money market funds" | "Banks";
  name: string;
  gross: number; // % p.a. as published
  tax: number; // withholding tax rate applied to the return, as a fraction
  net: number; // after withholding tax
  asOf: string; // YYYY-MM-DD or YYYY-MM
  basis: string; // what the figure is
  lockIn: string; // how long the money is tied up
  source: string;
  publisher: string;
};

type RatesFile = {
  updated_at?: string;
  bank_rates?: { source: string; rows: { month: string; deposit: number; savings: number; lending: number; overdraft: number }[] };
  money_market_funds?: { as_of: string; rows: { name: string; manager: string; source: string; daily_yield: number | null; effective_annual_yield: number; basis?: string; period_end?: string }[]; unread?: { name: string; status: string }[] };
};

const FILE = path.join(process.cwd(), "data", "kenya", "rates.json");

export const loadKenyaRates = cache((): RatesFile => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {}));

// Kenya withholding tax on interest: 15% for residents on bank deposits, fund distributions and bills;
// bonds of ten years or more carry 10%; infrastructure bonds (IFB) are exempt.
const WHT_INTEREST = 0.15;
const WHT_LONG_BOND = 0.1;

export function rateOptions(): { options: RateOption[]; unread: { name: string; status: string }[]; updatedAt: string | null } {
  const file = loadKenyaRates();
  const options: RateOption[] = [];
  const bills = latestByTenor(loadTbills().rows);
  for (const [tenor, item] of bills) {
    options.push({
      group: "Government",
      name: `${tenor}-day Treasury bill`,
      gross: item.latest.weighted_avg_rate,
      tax: WHT_INTEREST,
      net: item.latest.weighted_avg_rate * (1 - WHT_INTEREST),
      asOf: item.latest.value_date,
      basis: "weighted average rate at the latest auction",
      lockIn: `${tenor} days`,
      source: item.latest.source,
      publisher: "Central Bank of Kenya",
    });
  }
  // One bond per maturity bucket (the most recent auction nearest 2, 5, 10, 15 and 20+ years), so the
  // table shows the shape of the curve rather than every issue.
  const bonds = auctionCurve().filter((p) => p.kind !== "T-bill");
  const picked = new Set<string>();
  for (const target of [2, 5, 10, 15, 22]) {
    const near = [...bonds].filter((p) => !picked.has(p.label)).sort((a, b) => Math.abs(a.years - target) - Math.abs(b.years - target))[0];
    if (near && Math.abs(near.years - target) <= 4) picked.add(near.label);
  }
  for (const p of bonds.filter((b) => picked.has(b.label)).sort((a, b) => a.years - b.years)) {
    const infrastructure = /^IFB/i.test(p.label);
    const tax = infrastructure ? 0 : p.years >= 10 ? WHT_LONG_BOND : WHT_INTEREST;
    options.push({
      group: "Government",
      name: `${infrastructure ? "Infrastructure bond" : "Treasury bond"} ${p.label}`,
      gross: p.rate,
      tax,
      net: p.rate * (1 - tax),
      asOf: p.date,
      basis: "weighted average rate at the latest auction",
      lockIn: `${p.years.toFixed(1)} years to maturity`,
      source: p.source,
      publisher: "Central Bank of Kenya",
    });
  }
  for (const f of file.money_market_funds?.rows ?? []) {
    options.push({
      group: "Money market funds",
      name: f.name,
      gross: f.effective_annual_yield,
      tax: WHT_INTEREST,
      net: f.effective_annual_yield * (1 - WHT_INTEREST),
      asOf: f.period_end ?? (file.money_market_funds?.as_of ?? "").slice(0, 10),
      basis: f.basis ?? "effective annual yield published by the manager",
      lockIn: "none; usually 2 to 3 days to withdraw",
      source: f.source,
      publisher: f.manager,
    });
  }
  const bank = file.bank_rates?.rows?.[0];
  if (bank) {
    options.push(
      {
        group: "Banks",
        name: "Bank fixed deposit, industry average",
        gross: bank.deposit,
        tax: WHT_INTEREST,
        net: bank.deposit * (1 - WHT_INTEREST),
        asOf: bank.month,
        basis: "weighted average deposit rate across commercial banks",
        lockIn: "by agreement, typically 3 to 12 months",
        source: file.bank_rates!.source,
        publisher: "Central Bank of Kenya",
      },
      {
        group: "Banks",
        name: "Bank savings account, industry average",
        gross: bank.savings,
        tax: WHT_INTEREST,
        net: bank.savings * (1 - WHT_INTEREST),
        asOf: bank.month,
        basis: "weighted average savings rate across commercial banks",
        lockIn: "none",
        source: file.bank_rates!.source,
        publisher: "Central Bank of Kenya",
      },
    );
  }
  options.sort((a, b) => b.net - a.net);
  return { options, unread: file.money_market_funds?.unread ?? [], updatedAt: file.updated_at ?? null };
}

export function bankRateHistory(months = 60) {
  return (loadKenyaRates().bank_rates?.rows ?? []).slice(0, months).reverse();
}

/** Benchmarks for the "Is my rate fair?" check, from the same sources as the comparison table. */
export function fairBench() {
  const { options } = rateOptions();
  const bill91 = options.find((o) => o.name === "91-day Treasury bill");
  const bill364 = options.find((o) => o.name === "364-day Treasury bill");
  const funds = options.filter((o) => o.group === "Money market funds").sort((a, b) => b.net - a.net);
  const bank = loadKenyaRates().bank_rates?.rows?.[0];
  if (!bill91 || !bill364 || !bank) return null;
  return {
    asOf: bank.month,
    bill91Net: bill91.net,
    bill364Net: bill364.net,
    bill364Gross: bill364.gross,
    bestFundNet: funds[0]?.net ?? bill364.net,
    bestFundName: funds[0]?.name ?? "364-day Treasury bill",
    depositAvg: bank.deposit,
    savingsAvg: bank.savings,
    lendingAvg: bank.lending,
    overdraftAvg: bank.overdraft,
  };
}

type FundReading = { date: string; name: string; manager: string; source: string; daily_yield: number | null; effective_annual_yield: number; basis?: string };

const HISTORY_FILE = path.join(process.cwd(), "data", "kenya", "mmf_history.json");

/** Every fund yield read, one row per fund per Nairobi day (scripts/kenya_rates.py), oldest first. */
export const loadFundHistory = cache((): FundReading[] =>
  fs.existsSync(HISTORY_FILE)
    ? (JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")).rows as FundReading[]).sort((a, b) => a.date.localeCompare(b.date))
    : [],
);

export type FundRow = {
  name: string;
  manager: string;
  source: string;
  gross: number; // latest effective annual yield, % before fees and tax
  net: number; // after 15% withholding tax
  daily: number | null;
  /** How the yield is published when it is not the manager's current daily figure (e.g. a month's average from a fact sheet). */
  basis: string | null;
  readOn: string; // last day the yield was read
  firstRead: string;
  /** First day of the current run of identical readings: the yield has not moved since then. */
  unchangedSince: string;
  points: { date: string; value: number }[];
};

/** The money market fund league table: latest yield per fund, ranked by what a saver keeps after tax. */
export function fundLeague(): FundRow[] {
  // Only funds read cleanly on the latest run: a fund whose page stopped answering, or showed conflicting
  // figures, drops out of the table (and is named under it) rather than standing on an old reading.
  const current = new Set((loadKenyaRates().money_market_funds?.rows ?? []).map((f) => f.name));
  const byFund = new Map<string, FundReading[]>();
  for (const r of loadFundHistory()) if (current.has(r.name)) byFund.set(r.name, [...(byFund.get(r.name) ?? []), r]);
  const rows: FundRow[] = [];
  for (const [name, readings] of byFund) {
    const last = readings[readings.length - 1];
    let since = last.date;
    for (let i = readings.length - 2; i >= 0 && readings[i].effective_annual_yield === last.effective_annual_yield; i--) since = readings[i].date;
    rows.push({
      name,
      manager: last.manager,
      source: last.source,
      gross: last.effective_annual_yield,
      net: last.effective_annual_yield * (1 - WHT_INTEREST),
      daily: last.daily_yield,
      basis: last.basis ?? null,
      readOn: last.date,
      firstRead: readings[0].date,
      unchangedSince: since,
      points: readings.map((r) => ({ date: r.date, value: r.effective_annual_yield })),
    });
  }
  return rows.sort((a, b) => b.net - a.net);
}

export function fundHistoryCsv() {
  const lines = ["date,fund,manager,effective_annual_yield_pct,daily_yield_pct,source"];
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  for (const r of [...loadFundHistory()].reverse()) {
    lines.push([r.date, q(r.name), q(r.manager), r.effective_annual_yield, r.daily_yield ?? "", r.source].join(","));
  }
  return lines.join("\n") + "\n";
}
