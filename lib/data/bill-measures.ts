import { billMarkets, loadBillMarket, type BillMarket, type BillRow } from "./sovereign-bills";
import { loadIndicator, readingFor } from "./series";

/**
 * Measures Afronomics derives from the auction datasets. Each is computed from the published results
 * with a stated method; nothing here is a forecast.
 */

const DAY = 86_400_000;

export type RealYield = {
  market: BillMarket;
  nominal: number;
  nominalDate: string;
  inflation: number | null;
  inflationYear: number | null;
  real: number | null;
};

/** 364-day rate at the latest auction less the latest annual consumer-price inflation print (World Bank). */
export async function realYields(): Promise<RealYield[]> {
  const inflation = await loadIndicator("inflation");
  return billMarkets.flatMap((market) => {
    const latest = loadBillMarket(market.slug).rows.find((r) => r.tenor === 364);
    if (!latest) return [];
    const cpi = inflation ? readingFor(inflation, market.iso) : null;
    return [
      {
        market,
        nominal: latest.rate,
        nominalDate: latest.date,
        inflation: cpi?.value ?? null,
        inflationYear: cpi?.year ?? null,
        real: cpi ? latest.rate - cpi.value : null,
      },
    ];
  });
}

export type Demand = {
  market: BillMarket;
  window: { from: string; to: string; auctions: number };
  basis: "offered" | "accepted";
  ratio: number;
  previous: number | null;
};

function auctionsIn(rows: BillRow[], from: string, to: string) {
  return rows.filter((r) => r.date > from && r.date <= to);
}

/** Median over auctions of (bids / base) per auction date, all tenors pooled within a date. Implausible
 * ratios (outside 0.05x-50x, typically a unit slip in the source) are left out. */
function ratio(rows: BillRow[], basis: "offered" | "accepted") {
  const byDate = new Map<string, { bids: number; base: number }>();
  for (const r of rows) {
    const denom = basis === "offered" ? r.offered : r.accepted;
    if (r.received == null || denom == null || denom <= 0) continue;
    const e = byDate.get(r.date) ?? { bids: 0, base: 0 };
    e.bids += r.received;
    e.base += denom;
    byDate.set(r.date, e);
  }
  const ratios = [...byDate.values()].map((e) => e.bids / e.base).filter((x) => x >= 0.05 && x <= 50).sort((x, y) => x - y);
  if (!ratios.length) return null;
  const mid = Math.floor(ratios.length / 2);
  return ratios.length % 2 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2;
}

/**
 * Demand at recent auctions: bids received as a multiple of the amount offered (all tenors of an auction together),
 * the median across auctions in the last 90 days, against the 90 days before. Where a central bank does not publish the amount offered, bids are
 * measured against the amount accepted instead (marked).
 */
export function demand(): Demand[] {
  return billMarkets.flatMap((market) => {
    const { rows } = loadBillMarket(market.slug);
    if (!rows.length) return [];
    const to = rows[0].date;
    const mid = new Date(Date.parse(to) - 90 * DAY).toISOString().slice(0, 10);
    const from = new Date(Date.parse(to) - 180 * DAY).toISOString().slice(0, 10);
    const recent = auctionsIn(rows, mid, to);
    const prior = auctionsIn(rows, from, mid);
    const basis: "offered" | "accepted" = recent.some((r) => r.offered != null && r.received != null) ? "offered" : "accepted";
    const now = ratio(recent, basis);
    if (now == null) return [];
    return [
      {
        market,
        window: { from: mid, to, auctions: new Set(recent.map((r) => r.date)).size },
        basis,
        ratio: now,
        previous: ratio(prior, basis),
      },
    ];
  });
}

export type NextAuction = {
  market: BillMarket;
  last: string;
  cadenceDays: number;
  expected: string;
};

/**
 * The next auction each market is likely to hold, from the rhythm of its last twelve auctions
 * (the most common gap between them). Central banks publish official calendars; this is a guide.
 */
export function auctionCalendar(today = new Date()): NextAuction[] {
  const now = today.toISOString().slice(0, 10);
  return billMarkets
    .flatMap((market) => {
      const dates = [...new Set(loadBillMarket(market.slug).rows.map((r) => r.date))].sort().slice(-13);
      if (dates.length < 4) return [];
      const gaps = dates.slice(1).map((d, i) => Math.round((Date.parse(d) - Date.parse(dates[i])) / DAY));
      const counts = new Map<number, number>();
      for (const g of gaps) if (g > 0 && g <= 35) counts.set(g, (counts.get(g) ?? 0) + 1);
      const cadence = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
      if (!cadence) return [];
      const last = dates.at(-1)!;
      let next = Date.parse(last) + cadence * DAY;
      while (new Date(next).toISOString().slice(0, 10) < now) next += cadence * DAY;
      return [{ market, last, cadenceDays: cadence, expected: new Date(next).toISOString().slice(0, 10) }];
    })
    .sort((a, b) => a.expected.localeCompare(b.expected));
}
