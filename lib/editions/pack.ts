import { rpcRead } from "@/lib/store";
import { auctionCalendar, demand, realYields } from "@/lib/data/bill-measures";
import { currencyName } from "@/lib/data/fx";
import { auctionCurve, loadBonds, type BondAuction } from "@/lib/data/kenya-bonds";
import { rateOptions, bankRateHistory } from "@/lib/data/kenya-rates";
import { billMarkets, latestBills, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";

/**
 * The Investment Committee Pack: the month's rates, curves, moves and calendar, assembled from the datasets
 * so a SACCO, insurer or pension scheme can table it as published. Every figure carries its source.
 */

const DAY = 86400000;

export type PackMarket = {
  market: BillMarket;
  latest: { tenor: number; rate: number; date: string }[];
  monthAgo: { tenor: number; rate: number }[];
  yearAgo: { tenor: number; rate: number }[];
  history364: { date: string; rate: number }[]; // last 12 months
};

export type Pack = {
  asOf: string; // YYYY-MM-DD
  month: string; // "October 2026"
  generatedAt: string;
  markets: PackMarket[];
  kenya: {
    curve: ReturnType<typeof auctionCurve>;
    bonds: BondAuction[]; // last 30 days
    options: ReturnType<typeof rateOptions>["options"];
    bankHistory: ReturnType<typeof bankRateHistory>;
  };
  fx: { code: string; name: string; now: number; monthAgo: number | null; changePct: number | null; asOf: string }[];
  real: Awaited<ReturnType<typeof realYields>>;
  demand: ReturnType<typeof demand>;
  calendar: ReturnType<typeof auctionCalendar>;
};

function nearest(rows: { date: string; rate: number; tenor: number }[], tenor: number, target: string) {
  const list = rows.filter((r) => r.tenor === tenor && r.date <= target);
  return list[0] ? { tenor, rate: list[0].rate } : null;
}

async function fxMonth(now: number): Promise<Pack["fx"]> {
  const history = await rpcRead("af_fx_history", { p_days: 35 }, 3600);
  if (!history.ok || !Array.isArray(history.value)) return [];
  const rows = history.value as { day: string; code: string; rate: number | string }[];
  const days = [...new Set(rows.map((r) => r.day))].sort();
  if (!days.length) return [];
  const last = days.at(-1)!;
  const target = new Date(Date.parse(last) - 30 * DAY).toISOString().slice(0, 10);
  const first = days.reduce((best, d) => (Math.abs(Date.parse(d) - Date.parse(target)) < Math.abs(Date.parse(best) - Date.parse(target)) ? d : best), days[0]);
  const at = (day: string) => new Map(rows.filter((r) => r.day === day).map((r) => [r.code, Number(r.rate)]));
  const a = at(first);
  const b = at(last);
  const codes = ["KES", "NGN", "ZAR", "GHS", "EGP", "UGX", "TZS", "ZMW", "MWK", "MZN", "RWF", "ETB", "XOF", "MAD"];
  return codes.flatMap((code) => {
    const nowRate = b.get(code);
    if (!nowRate) return [];
    const then = first !== last ? a.get(code) ?? null : null;
    return [{ code, name: currencyName(code), now: nowRate, monthAgo: then, changePct: then ? (then / nowRate - 1) * 100 : null, asOf: last }];
  });
}

export async function buildPack(now: number): Promise<Pack> {
  const asOf = new Date(now).toISOString().slice(0, 10);
  const monthAgo = new Date(now - 30 * DAY).toISOString().slice(0, 10);
  const yearAgo = new Date(now - 365 * DAY).toISOString().slice(0, 10);
  const markets: PackMarket[] = billMarkets.flatMap((market) => {
    const { rows } = loadBillMarket(market.slug);
    if (!rows.length) return [];
    const latest = [...latestBills(rows).entries()].map(([tenor, item]) => ({ tenor, rate: item.latest.rate, date: item.latest.date }));
    return [
      {
        market,
        latest,
        monthAgo: [91, 182, 364].flatMap((t) => nearest(rows, t, monthAgo) ?? []),
        yearAgo: [91, 182, 364].flatMap((t) => nearest(rows, t, yearAgo) ?? []),
        history364: rows
          .filter((r) => r.tenor === 364 && r.date >= yearAgo)
          .map((r) => ({ date: r.date, rate: r.rate }))
          .reverse(),
      },
    ];
  });
  const bonds = loadBonds().rows.filter((b) => now - Date.parse(b.value_date) <= 30 * DAY && b.kind !== "switch" && b.kind !== "buyback");
  const [real, fx] = await Promise.all([realYields(), fxMonth(now)]);
  return {
    asOf,
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(now)),
    generatedAt: new Date(now).toISOString(),
    markets,
    kenya: { curve: auctionCurve(), bonds, options: rateOptions().options, bankHistory: bankRateHistory(13) },
    fx,
    real,
    demand: demand(),
    calendar: auctionCalendar(new Date(now)),
  };
}
