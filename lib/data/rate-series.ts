import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { cpiIndex, loadCpi } from "./cpi";
import { fundSlug } from "./fund-links";
import { fundLeague, loadFundHistory, loadKenyaRates } from "./kenya-rates";
import { tenorLabel } from "./kenya-tbills";
import { loadPolicyRates } from "./policy-rates";
import { billMarkets, billTenors, loadBillMarket } from "./sovereign-bills";
import type { RateSeries, SeriesPoint } from "@/lib/rate-series-core";

/**
 * Every rate series the site can draw as a sparkline, compare and let a reader follow, read from the stored
 * history the pages already show (data/*.json). Nothing here is fetched live or filled in: a series has exactly
 * the points the files hold, and one with fewer than three gets no sparkline (lib/rate-series-core.ts).
 */

/** One point per date, ascending; a later row for the same date replaces an earlier one. */
function byDate(points: SeriesPoint[]): SeriesPoint[] {
  const map = new Map<string, number>();
  for (const p of points) if (Number.isFinite(p.value) && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) map.set(p.date, p.value);
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
}

function billSeries(): RateSeries[] {
  const out: RateSeries[] = [];
  for (const market of billMarkets) {
    const { rows } = loadBillMarket(market.slug);
    for (const tenor of billTenors) {
      const points = byDate(rows.filter((r) => r.tenor === tenor).map((r) => ({ date: r.date, value: r.rate })));
      if (!points.length) continue;
      out.push({
        id: `${market.slug}-${tenor}d`,
        label: `${market.country} ${tenorLabel[tenor]} Treasury bill`,
        short: `${market.slug === "kenya" ? "" : `${market.country} `}${tenorLabel[tenor]} bill`,
        group: market.slug === "kenya" ? "Kenya" : "Treasury bills across Africa",
        unit: "pct",
        unitLabel: "% a year",
        measure: market.rateNote,
        frequency: "auction",
        source: { name: market.publisher, href: market.sourcePage },
        href: market.href,
        sparkPoints: 26,
        points,
      });
    }
  }
  return out;
}

type PolicyHistoryRow = { first_seen: string; market: string; rate: number; source: string };

function policySeries(): RateSeries[] {
  const file = path.join(process.cwd(), "data", "policy_rate_history.json");
  const history: PolicyHistoryRow[] = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")).rows ?? []) : [];
  const current = loadPolicyRates().rows ?? [];
  const names = new Map(billMarkets.map((m) => [m.slug as string, m.country]));
  const out: RateSeries[] = [];
  for (const row of current) {
    const points = byDate(history.filter((h) => h.market === row.market).map((h) => ({ date: h.first_seen, value: h.rate })));
    if (!points.length) continue;
    const country = names.get(row.market) ?? row.market;
    const readOn = row.read_at?.slice(0, 10);
    out.push({
      id: row.market === "kenya" ? "kenya-cbr" : `${row.market}-policy`,
      label: row.market === "kenya" ? "Central Bank Rate (Kenya)" : `${country} policy rate`,
      short: row.market === "kenya" ? "CBK rate" : `${country} policy rate`,
      group: row.market === "kenya" ? "Kenya" : "Policy rates",
      unit: "pct",
      unitLabel: "% a year",
      measure: `${row.label}, as printed on the bank’s website`,
      frequency: "reading",
      source: { name: row.publisher, href: row.source },
      href: "/rates/policy",
      sparkPoints: 30,
      confirmedOn: readOn && points.at(-1)!.value === row.rate && readOn > points.at(-1)!.date ? readOn : undefined,
      note: `Afronomics stores a reading each time the rate or the bank’s printed date changes, from ${points[0].date}.`,
      points,
    });
  }
  return out;
}

/**
 * Kenya money market funds: one series per fund, and the median yield of the funds currently read, taken only on
 * days every one of them was read, so a fund joining or dropping out never moves the line by itself.
 */
function fundSeries(): RateSeries[] {
  const league = fundLeague();
  const out: RateSeries[] = [];
  for (const f of league) {
    out.push({
      id: `kenya-mmf-${fundSlug(f.name)}`,
      label: f.name,
      short: f.name.replace(/ Money Market Fund| Fixed Income Fund/, "").replace(/\s*\(.*\)$/, ""),
      group: "Kenya money market funds",
      unit: "pct",
      unitLabel: "% a year",
      measure: f.basis ?? "effective annual yield as the manager publishes it, before fees and tax",
      frequency: "daily",
      source: { name: f.manager, href: f.source },
      href: "/rates/kenya/money-market-funds",
      sparkPoints: 30,
      points: byDate(f.points),
    });
  }
  const panel = new Set(league.map((f) => f.name));
  if (panel.size) {
    const days = new Map<string, number[]>();
    for (const r of loadFundHistory()) if (panel.has(r.name)) days.set(r.date, [...(days.get(r.date) ?? []), r.effective_annual_yield]);
    const points: SeriesPoint[] = [];
    for (const [date, values] of days) {
      if (values.length !== panel.size) continue;
      const s = [...values].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      points.push({ date, value: s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 1000) / 1000 });
    }
    out.unshift({
      id: "kenya-mmf",
      label: "Kenya money market funds, median yield",
      short: "Money market funds (median)",
      group: "Kenya",
      unit: "pct",
      unitLabel: "% a year",
      measure: `median effective annual yield of the ${panel.size} funds Afronomics reads, on days all ${panel.size} were read`,
      frequency: "daily",
      source: { name: "Fund managers’ own websites", href: "/rates/kenya/money-market-funds" },
      href: "/rates/kenya/money-market-funds",
      sparkPoints: 30,
      note: "Each fund’s yield is read from its manager’s site; a day is left out when any fund in the panel was not read.",
      points: byDate(points),
    });
  }
  return out;
}

function bankSeries(): RateSeries[] {
  const bank = loadKenyaRates().bank_rates;
  if (!bank?.rows?.length) return [];
  const make = (key: "deposit" | "savings" | "lending", label: string): RateSeries => ({
    id: `kenya-bank-${key}`,
    label: `Kenya banks: average ${label} rate`,
    short: `Bank ${label} rate`,
    group: "Kenya",
    unit: "pct",
    unitLabel: "% a year",
    measure: `weighted average ${label} rate across commercial banks`,
    frequency: "monthly",
    source: { name: "Central Bank of Kenya", href: bank.source },
    href: "/rates/kenya",
    sparkPoints: 24,
    points: byDate(bank.rows.map((r) => ({ date: `${r.month}-01`, value: r[key] }))),
  });
  return [make("deposit", "deposit"), make("savings", "savings"), make("lending", "lending")];
}

function cpiSeries(): RateSeries[] {
  const f = loadCpi();
  // The rebased CPI's own published levels only (not the spliced or back-filled months).
  const levels = f.rebased.levels.map((l) => ({ date: `${l.month}-01`, value: l.index }));
  if (!levels.length || !cpiIndex().length) return [];
  return [
    {
      id: "kenya-cpi",
      label: "Kenya consumer price index",
      short: "Consumer prices (CPI)",
      group: "Kenya",
      unit: "index",
      unitLabel: `index, ${f.rebased.base}`,
      measure: "KNBS consumer price index, all items",
      frequency: "monthly",
      source: { name: "Kenya National Bureau of Statistics", href: f.sources[0]?.url ?? "https://www.knbs.or.ke/cpi-and-inflation-rates/" },
      href: "/rates/kenya/inflation",
      sparkPoints: 24,
      points: byDate(levels),
    },
  ];
}

export const allSeries = cache((): RateSeries[] => {
  const list = [...billSeries(), ...policySeries(), ...fundSeries(), ...bankSeries(), ...cpiSeries()];
  return list.filter((s) => s.points.length > 0);
});

export function getSeries(id: string): RateSeries | null {
  return allSeries().find((s) => s.id === id) ?? null;
}

/** The series the Rates & data hub leads with, in order. */
export const hubSeriesIds = ["kenya-91d", "kenya-364d", "kenya-cbr", "kenya-mmf", "kenya-bank-savings", "kenya-bank-lending", "nigeria-364d", "ghana-91d", "southafrica-policy"];

export function seriesPath(id: string) {
  return `/rates/series/${id}`;
}
