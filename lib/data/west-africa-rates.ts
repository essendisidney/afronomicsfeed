import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { loadSavingsBond } from "./nigeria-savings-bond";
import { latestBills, loadBillMarket } from "./sovereign-bills";
import { loadPolicyRates } from "./policy-rates";

/**
 * Benchmarks for the Nigeria and Ghana "Is my rate fair?" checks, all from the central banks' and debt offices'
 * own figures: the latest Treasury bill auction, the central bank's monthly averages for what banks pay and
 * charge (scripts/west_africa_rates.py), the policy rate and, in Nigeria, the FGN Savings Bond.
 */

type BankRow = Record<string, number | string | null | undefined> & { month: string };
type BankFile = { publisher: string; source: string; rows: BankRow[] };

const load = (country: "nigeria" | "ghana") =>
  cache((): BankFile | null => {
    const f = path.join(process.cwd(), "data", country, "bank_rates.json");
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  });
const loadNg = load("nigeria");
const loadGh = load("ghana");

export type Bench = { label: string; rate: number; note: string };

export type CountryBench = {
  country: "Nigeria" | "Ghana";
  currency: "NGN" | "GHS";
  money: string; // "₦" or "GH₵"
  asOf: string; // month of the bank averages, e.g. "August 2026"
  bankSource: { publisher: string; url: string };
  /** What a saver could earn elsewhere, best first. */
  save: Bench[];
  /** The central bank's average for what banks pay on savings deposits. */
  savingsAvg: number;
  /** What banks charge: a reference (prime or average) and, where published, the upper end. */
  lendRef: Bench;
  lendTop: Bench | null;
  policy: Bench | null;
  billIsDiscount: boolean;
};

const monthName = (m: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-01`));
const dayName = (d: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(d));
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function bills(slug: "nigeria" | "ghana", what: string): Bench[] {
  const latest = latestBills(loadBillMarket(slug).rows);
  return ([364, 182, 91] as const).flatMap((t) => {
    const b = latest.get(t)?.latest;
    return b ? [{ label: `${t}-day Treasury bill`, rate: b.rate, note: `${what}, auction of ${dayName(b.date)}` }] : [];
  });
}

function policy(slug: string): Bench | null {
  const r = loadPolicyRates().rows?.find((x) => x.market === slug);
  return r ? { label: r.label, rate: r.rate, note: `${r.publisher}${r.date_as_printed ? `, ${r.date_as_printed}` : ""}` } : null;
}

export function nigeriaBench(): CountryBench | null {
  const f = loadNg();
  const row = f?.rows.find((r) => n(r.savings) != null && n(r.prime_lending) != null);
  if (!f || !row) return null;
  const save: Bench[] = [...bills("nigeria", "CBN stop rate")];
  const bond = loadSavingsBond()?.latest;
  for (const b of bond?.bonds ?? []) save.push({ label: `FGN Savings Bond, ${b.years} years`, rate: b.rate, note: `Debt Management Office, ${bond!.offer} offer` });
  if (n(row.deposit_12m) != null) save.push({ label: "Bank 12-month deposit, average", rate: n(row.deposit_12m)!, note: `CBN, ${monthName(row.month)}` });
  return {
    country: "Nigeria",
    currency: "NGN",
    money: "₦",
    asOf: monthName(row.month),
    bankSource: { publisher: f.publisher, url: f.source },
    save: save.sort((a, b) => b.rate - a.rate),
    savingsAvg: n(row.savings)!,
    lendRef: { label: "Prime lending rate", rate: n(row.prime_lending)!, note: `CBN, ${monthName(row.month)}: what banks charge their best borrowers` },
    lendTop: n(row.max_lending) != null ? { label: "Maximum lending rate", rate: n(row.max_lending)!, note: `CBN, ${monthName(row.month)}: the average top of banks' lending rates` } : null,
    policy: policy("nigeria"),
    billIsDiscount: true,
  };
}

export function ghanaBench(): CountryBench | null {
  const f = loadGh();
  const row = f?.rows.find((r) => n(r.savings) != null && n(r.lending) != null);
  if (!f || !row) return null;
  const save: Bench[] = [...bills("ghana", "Bank of Ghana, interest-rate equivalent")];
  if (n(row.deposit_3m) != null) save.push({ label: "Bank 3-month time deposit, average", rate: n(row.deposit_3m)!, note: `Bank of Ghana, ${monthName(row.month)}` });
  return {
    country: "Ghana",
    currency: "GHS",
    money: "GH₵",
    asOf: monthName(row.month),
    bankSource: { publisher: f.publisher, url: f.source },
    save: save.sort((a, b) => b.rate - a.rate),
    savingsAvg: n(row.savings)!,
    lendRef: { label: "Average commercial bank lending rate", rate: n(row.lending)!, note: `Bank of Ghana, ${monthName(row.month)}` },
    lendTop: null,
    policy: policy("ghana"),
    billIsDiscount: false,
  };
}
