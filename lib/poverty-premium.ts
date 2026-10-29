/**
 * The Kenya Poverty Premium (docs/rebuild/upgrade-U3-plan.md): the extra a low-income Kenyan pays, or forgoes, for the
 * same financial need, against the best option a better-off person can reach. One file a month, every figure computed
 * here from data files the repository already holds; a line we hold no data for is published as a gap, never filled.
 *
 * Pure functions with no imports, so the generator (scripts/poverty_premium.mjs), the page and the tests
 * (tests/site/test_poverty_premium.py, run through node's type stripping) all use the same arithmetic.
 */

export const PREMIUM_VERSION = 1;

/** Withholding tax on interest for residents: bank deposits, fund distributions and Treasury bills (lib/data/kenya-rates.ts). */
export const WHT_INTEREST = 0.15;

/** The household examples. Decision B in the plan: the founder may change these; each file records the ones it used. */
export const DEFAULT_AMOUNTS = {
  fulizaKes: 1000,
  fulizaDays: 7,
  mobileLoanKes: 5000,
  mobileLoanDays: 30,
  savingKes: 10000,
  sendUsd: 200, // the World Bank survey's own amount; the cost percentages apply to it
};
export type Amounts = typeof DEFAULT_AMOUNTS;

// ---- Inputs: the shapes of the repository's data files (only the fields used) ----

export type BankRatesInput = { source: string; rows: { month: string; savings: number; lending: number }[] };
export type TbillInput = { source_page: string; rows: { tenor: number; weighted_avg_rate: number; value_date: string; source: string }[] };
export type MmfInput = { as_of: string; rows: { name: string; manager: string; source: string; effective_annual_yield: number; period_end?: string }[] };
export type MobileLoanInput = {
  product: string;
  provider: string;
  source: string;
  read_on: string;
  basis: "flat" | "per_day" | "access_plus_daily";
  pct: number;
  daily_kes_per_1000?: number;
  days: number;
  from: boolean;
}[];
export type MpesaInput = {
  checked: string;
  sources: { fuliza: string };
  fuliza: { access_fee_pct: number; daily: { min: number; max: number; fee: number }[] };
};
export type CorridorsInput = {
  publisher: string;
  source: string;
  source_page: string;
  period: string; // e.g. "2025_1Q"
  read_at: string;
  corridors: { src: string; src_name: string; dst: string; services: number; avg_cost_pct: number; cheapest: { type: string; cost_pct: number } }[];
};

export type PremiumInputs = {
  bankRates: BankRatesInput;
  tbills: TbillInput;
  mmf: MmfInput;
  mobileLoans: MobileLoanInput;
  mpesa: MpesaInput;
  corridors: CorridorsInput;
};

// ---- Output: the monthly file ----

/** Where a figure came from: the repository file and field, the publisher, the page, and the date the figure is for. */
export type Source = { file: string; field: string; publisher: string; url: string; asOf: string };

export type Side = {
  label: string; // a category, never a verdict on a named company (D-028)
  detail: string; // what the figure is
  kind: "option" | "benchmark"; // a product a person can take, or an average nobody can take as such
  rate: number; // % a year (borrowing: cost as a simple yearly rate; saving: return after tax; sending: cost as % of the amount)
  money: number; // the cost or earnings in `currency` for the household example
  source: Source;
};

export type PremiumLine =
  | {
      id: string;
      need: "Borrowing" | "Saving" | "Sending money" | "Protection";
      status: "ok";
      title: string;
      example: string; // the household example in words
      currency: "KES" | "USD";
      low: Side; // what a low-income Kenyan typically uses
      best: Side; // the best option or benchmark a better-off person can reach
      premium: number; // money: how much more the low side costs, or how much less it earns
      premiumRatePoints: number; // the same, in percentage points of the yearly rate (or of the amount sent)
      formula: string;
      context?: Side[]; // further figures shown beside the line, not part of the premium
      note?: string;
    }
  | {
      id: string;
      need: "Borrowing" | "Saving" | "Sending money" | "Protection";
      status: "gap";
      title: string;
      missing: string; // the data we do not hold
      wouldNeed: string; // the primary source that would fill it
    };

export type PremiumFile = {
  dataset: string;
  version: number;
  month: string; // YYYY-MM the file is for
  generatedAt: string; // ISO timestamp
  compiledBy: string;
  amounts: Amounts;
  taxRate: number;
  lines: PremiumLine[];
  oldInputs: { id: string; asOf: string; ageDays: number }[]; // inputs older than OLD_DAYS on the file's date
  notice: string;
};

/** An input older than this on the day the file is made is labelled "old" on the page. */
export const OLD_DAYS = 183;

// ---- Arithmetic ----

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Simple interest cost of borrowing `amount` for `days` at `ratePct` a year (CBK's average is a simple yearly rate). */
export const simpleCost = (amount: number, ratePct: number, days: number) => (amount * ratePct * days) / (100 * 365);

/** A term cost as a simple yearly rate, % (no compounding, so it sits beside a bank's quoted rate). */
export const yearlyRate = (cost: number, amount: number, days: number) => (amount > 0 && days > 0 ? (cost / amount) * (365 / days) * 100 : 0);

/** After-tax return, % a year, from a gross yearly rate. */
export const afterTax = (grossPct: number, tax = WHT_INTEREST) => grossPct * (1 - tax);

/** Fuliza: the one-off access fee plus the published daily fee for the balance band, for `days` days. */
export function fulizaCost(mpesa: MpesaInput, amount: number, days: number): number | null {
  const band = mpesa.fuliza.daily.find((b) => amount >= b.min && amount <= b.max);
  if (!band) return null;
  return (amount * mpesa.fuliza.access_fee_pct) / 100 + band.fee * days;
}

/** A mobile loan's cost for `amount` over its own term, as the provider publishes it (lib/data/mobile-loans.ts). */
export function mobileLoanCost(row: MobileLoanInput[number], amount: number): number {
  const termPct = row.basis === "flat" ? row.pct : row.basis === "per_day" ? row.pct * row.days : row.pct + ((row.daily_kes_per_1000 ?? 0) * row.days) / 10;
  return (amount * termPct) / 100;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** "2025_1Q" → "2025-03-31", the last day of the survey quarter. */
export function quarterEnd(period: string): string {
  const m = /^(\d{4})_([1-4])Q$/.exec(period);
  if (!m) return period;
  const ends = ["03-31", "06-30", "09-30", "12-31"];
  return `${m[1]}-${ends[Number(m[2]) - 1]}`;
}

/** "2026-08" → "2026-08-31". A full date passes through. */
export function monthEnd(month: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(month)) return month.slice(0, 10);
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

const daysBetween = (fromIso: string, toIso: string) => Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

// ---- The file ----

export function buildPremium(inputs: PremiumInputs, opts: { month: string; generatedAt: string; amounts?: Partial<Amounts> }): PremiumFile {
  const a: Amounts = { ...DEFAULT_AMOUNTS, ...(opts.amounts ?? {}) };
  const lines: PremiumLine[] = [];
  const bank = inputs.bankRates.rows[0] ?? null; // newest month first, as scripts/kenya_rates.py writes it
  const bankSource = (field: string): Source => ({
    file: "data/kenya/rates.json",
    field,
    publisher: "Central Bank of Kenya",
    url: inputs.bankRates.source,
    asOf: bank ? bank.month : "",
  });

  // Borrowing 1: a week on the M-PESA overdraft against the bank average lending rate.
  const fuliza = fulizaCost(inputs.mpesa, a.fulizaKes, a.fulizaDays);
  if (bank && fuliza !== null) {
    const bankCost = simpleCost(a.fulizaKes, bank.lending, a.fulizaDays);
    const lowRate = yearlyRate(fuliza, a.fulizaKes, a.fulizaDays);
    lines.push({
      id: "borrow-overdraft-week",
      need: "Borrowing",
      status: "ok",
      title: "A week's overdraft on the phone",
      example: `KES ${fmt(a.fulizaKes)} for ${a.fulizaDays} days`,
      currency: "KES",
      low: {
        label: "M-PESA overdraft (Fuliza)",
        detail: `one-off ${inputs.mpesa.fuliza.access_fee_pct}% access fee plus the published daily fee for the balance band, excise included`,
        kind: "option",
        rate: r2(lowRate),
        money: r2(fuliza),
        source: { file: "data/kenya/mpesa_tariffs.json", field: "fuliza.access_fee_pct, fuliza.daily", publisher: "Safaricom", url: inputs.mpesa.sources.fuliza, asOf: inputs.mpesa.checked },
      },
      best: {
        label: "Bank loan, industry average",
        detail: "weighted average lending rate across commercial banks, charged for the same days",
        kind: "benchmark",
        rate: r2(bank.lending),
        money: r2(bankCost),
        source: bankSource("bank_rates.rows[0].lending"),
      },
      premium: r2(fuliza - bankCost),
      premiumRatePoints: r2(lowRate - bank.lending),
      formula: "overdraft = amount × access fee % + daily band fee × days; bank = amount × average lending rate × days ÷ 365; premium = overdraft − bank",
      note: "The bank figure is an average, not a loan anyone can take for a week; a bank loan needs time, a credit check and often security.",
    });
  }

  // Borrowing 2: a month's mobile loan (the cheapest we hold, the overdraft excluded) against the bank average.
  const loans = inputs.mobileLoans
    .filter((l) => l.basis !== "access_plus_daily")
    .map((l) => ({ row: l, cost: mobileLoanCost(l, a.mobileLoanKes) }))
    .sort((x, y) => x.cost - y.cost || Number(x.row.from) - Number(y.row.from) || x.row.product.localeCompare(y.row.product));
  const cheapest = loans[0];
  if (bank && cheapest) {
    const days = cheapest.row.days;
    const bankCost = simpleCost(a.mobileLoanKes, bank.lending, days);
    const lowRate = yearlyRate(cheapest.cost, a.mobileLoanKes, days);
    lines.push({
      id: "borrow-mobile-loan-month",
      need: "Borrowing",
      status: "ok",
      title: "A month's mobile loan",
      example: `KES ${fmt(a.mobileLoanKes)} for ${days} days`,
      currency: "KES",
      low: {
        label: "Mobile loan, the lowest published charge we track",
        detail: `${cheapest.row.product}: ${cheapest.row.from ? "the lowest rate the provider says it charges (“from”)" : "the provider's published charge"}, over its ${days}-day term`,
        kind: "option",
        rate: r2(lowRate),
        money: r2(cheapest.cost),
        source: { file: "data/kenya/mobile_loans.json", field: `rows[product=${cheapest.row.product}].pct`, publisher: cheapest.row.provider, url: cheapest.row.source, asOf: cheapest.row.read_on },
      },
      best: {
        label: "Bank loan, industry average",
        detail: "weighted average lending rate across commercial banks, charged for the same days",
        kind: "benchmark",
        rate: r2(bank.lending),
        money: r2(bankCost),
        source: bankSource("bank_rates.rows[0].lending"),
      },
      premium: r2(cheapest.cost - bankCost),
      premiumRatePoints: r2(lowRate - bank.lending),
      formula: "mobile loan = amount × published charge % for its term; bank = amount × average lending rate × days ÷ 365; premium = mobile loan − bank",
      note: `${loans.length} mobile loans held; the lowest charge is used, so the premium is the least a mobile borrower pays over the average.`,
    });
  }

  lines.push({
    id: "borrow-sacco-loan",
    need: "Borrowing",
    status: "gap",
    title: "A SACCO loan",
    missing: "SACCO loan rates. We hold SACCO dividends and interest on deposits, not what SACCOs charge borrowers.",
    wouldNeed: "Loan rates published by SACCOs or by SASRA, read from the primary page and dated.",
  });

  // Saving: a year's savings in a bank savings account against a 364-day Treasury bill, after tax.
  const bill364 = [...inputs.tbills.rows].filter((r) => r.tenor === 364).sort((x, y) => y.value_date.localeCompare(x.value_date))[0];
  const funds = inputs.mmf.rows.filter((f) => Number.isFinite(f.effective_annual_yield));
  if (bank && bill364) {
    const lowNet = afterTax(bank.savings);
    const bestNet = afterTax(bill364.weighted_avg_rate);
    const context: Side[] = [];
    const fundMedian = median(funds.map((f) => f.effective_annual_yield));
    const fundAsOf = (f: MmfInput["rows"][number]) => f.period_end ?? inputs.mmf.as_of.slice(0, 10);
    if (fundMedian !== null) {
      const newest = funds.map(fundAsOf).sort().at(-1) ?? "";
      context.push({
        label: "Money market fund, median published yield",
        detail: `middle of the ${funds.length} funds whose yield we read, after tax`,
        kind: "benchmark",
        rate: r2(afterTax(fundMedian)),
        money: r2((a.savingKes * afterTax(fundMedian)) / 100),
        source: { file: "data/kenya/rates.json", field: "money_market_funds.rows[].effective_annual_yield", publisher: "each fund manager", url: "/rates/kenya/money-market-funds", asOf: newest },
      });
      const top = [...funds].sort((x, y) => y.effective_annual_yield - x.effective_annual_yield)[0];
      context.push({
        label: "Money market fund, highest published yield",
        detail: `${top.name}, after tax`,
        kind: "option",
        rate: r2(afterTax(top.effective_annual_yield)),
        money: r2((a.savingKes * afterTax(top.effective_annual_yield)) / 100),
        source: { file: "data/kenya/rates.json", field: `money_market_funds.rows[name=${top.name}].effective_annual_yield`, publisher: top.manager, url: top.source, asOf: fundAsOf(top) },
      });
    }
    lines.push({
      id: "save-year",
      need: "Saving",
      status: "ok",
      title: "A year's savings",
      example: `KES ${fmt(a.savingKes)} for a year, after ${WHT_INTEREST * 100}% withholding tax`,
      currency: "KES",
      low: {
        label: "Bank savings account, industry average",
        detail: "weighted average savings rate across commercial banks, after tax",
        kind: "benchmark",
        rate: r2(lowNet),
        money: r2((a.savingKes * lowNet) / 100),
        source: bankSource("bank_rates.rows[0].savings"),
      },
      best: {
        label: "364-day Treasury bill",
        detail: "weighted average rate at the latest auction, after tax; the Central Bank's minimum is KES 50,000 face value",
        kind: "option",
        rate: r2(bestNet),
        money: r2((a.savingKes * bestNet) / 100),
        source: { file: "data/kenya/tbill_auctions.json", field: "rows[tenor=364].weighted_avg_rate", publisher: "Central Bank of Kenya", url: bill364.source, asOf: bill364.value_date },
      },
      premium: r2((a.savingKes * (bestNet - lowNet)) / 100),
      premiumRatePoints: r2(bestNet - lowNet),
      formula: "earnings = amount × gross yearly rate × (1 − 15% tax); premium = Treasury bill earnings − bank savings earnings",
      context,
      note: "A saver with less than KES 50,000 cannot buy the bill. Money market funds are shown beside it; we do not hold their minimum deposits.",
    });
  }

  // Sending money home: per corridor into Kenya, the average service against the cheapest, on the survey's USD 200.
  const corridorAsOf = quarterEnd(inputs.corridors.period);
  const kenya = inputs.corridors.corridors.filter((c) => c.dst === "KEN").sort((x, y) => x.src_name.localeCompare(y.src_name));
  for (const c of kenya) {
    const avg = (a.sendUsd * c.avg_cost_pct) / 100;
    const low = (a.sendUsd * c.cheapest.cost_pct) / 100;
    const src = (field: string): Source => ({ file: "data/remittances/corridors.json", field, publisher: inputs.corridors.publisher, url: inputs.corridors.source_page, asOf: corridorAsOf });
    lines.push({
      id: `send-${c.src.toLowerCase()}-ken`,
      need: "Sending money",
      status: "ok",
      title: `Sending home from ${c.src_name}`,
      example: `USD ${fmt(a.sendUsd)} sent once`,
      currency: "USD",
      low: { label: "Average service surveyed", detail: `average fee plus exchange-rate margin across the ${c.services} services surveyed`, kind: "benchmark", rate: r2(c.avg_cost_pct), money: r2(avg), source: src(`corridors[src=${c.src},dst=KEN].avg_cost_pct`) },
      best: { label: "Cheapest service surveyed", detail: `the lowest-cost service in the same survey (${c.cheapest.type.toLowerCase()})`, kind: "option", rate: r2(c.cheapest.cost_pct), money: r2(low), source: src(`corridors[src=${c.src},dst=KEN].cheapest.cost_pct`) },
      premium: r2(avg - low),
      premiumRatePoints: r2(c.avg_cost_pct - c.cheapest.cost_pct),
      formula: "cost = USD 200 × cost % (fee plus exchange-rate margin); premium = average service cost − cheapest service cost",
    });
  }

  lines.push({
    id: "protect-deposit-cover",
    need: "Protection",
    status: "gap",
    title: "Deposit cover: a bank saver against a SACCO saver",
    missing: "A dated, primary-source file of the deposit cover limit for bank deposits and the protection, if any, for SACCO deposits.",
    wouldNeed: "The Kenya Deposit Insurance Corporation's published cover limit and SASRA's or the law's statement on SACCO deposits, each read from the primary page.",
  });

  // Inputs older than OLD_DAYS on the last day of the file's month.
  const fileDay = monthEnd(opts.month);
  const seen = new Map<string, string>();
  for (const l of lines) {
    if (l.status !== "ok") continue;
    for (const s of [l.low, l.best, ...(l.context ?? [])]) {
      const key = `${s.source.file}#${s.source.field.replace(/\[.*$/, "")}`;
      const d = monthEnd(s.source.asOf);
      if (!seen.has(key) || d < seen.get(key)!) seen.set(key, d);
    }
  }
  const oldInputs = [...seen]
    .map(([id, asOf]) => ({ id, asOf, ageDays: daysBetween(asOf, fileDay) }))
    .filter((x) => x.ageDays > OLD_DAYS)
    .sort((x, y) => x.id.localeCompare(y.id));

  return {
    dataset: "Kenya Poverty Premium",
    version: PREMIUM_VERSION,
    month: opts.month,
    generatedAt: opts.generatedAt,
    compiledBy: "Afronomics (afronomicsfeed.com)",
    amounts: a,
    taxRate: WHT_INTEREST,
    lines,
    oldInputs,
    notice: "Every figure is computed by code from the published sources named on each line. Information, not advice.",
  };
}

// ---- CSV ----

const q = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const CSV_HEADER = [
  "month",
  "line",
  "need",
  "status",
  "example",
  "currency",
  "low_label",
  "low_rate_pct",
  "low_money",
  "low_publisher",
  "low_as_of",
  "low_source",
  "best_label",
  "best_kind",
  "best_rate_pct",
  "best_money",
  "best_publisher",
  "best_as_of",
  "best_source",
  "premium_money",
  "premium_rate_points",
  "formula",
];

/** One row per line; a gap is a row with status "gap" and empty figures. */
export function premiumCsv(file: PremiumFile): string {
  const rows = [CSV_HEADER.join(",")];
  for (const l of file.lines) {
    if (l.status === "gap") {
      rows.push([file.month, l.id, l.need, "gap", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", `not held: ${l.missing}`].map(q).join(","));
      continue;
    }
    rows.push(
      [
        file.month,
        l.id,
        l.need,
        "ok",
        l.example,
        l.currency,
        l.low.label,
        l.low.rate,
        l.low.money,
        l.low.source.publisher,
        l.low.source.asOf,
        l.low.source.url,
        l.best.label,
        l.best.kind,
        l.best.rate,
        l.best.money,
        l.best.source.publisher,
        l.best.source.asOf,
        l.best.source.url,
        l.premium,
        l.premiumRatePoints,
        l.formula,
      ]
        .map(q)
        .join(","),
    );
  }
  return rows.join("\n") + "\n";
}
