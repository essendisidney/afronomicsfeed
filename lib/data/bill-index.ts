import { billMarkets, loadBillMarket, type BillMarket, type BillTenor } from "./sovereign-bills";

/**
 * The Afronomics African Sovereign Bill Index (ASBI): what African governments pay to borrow for one year,
 * in one number. Each Monday it is the simple average of the latest 364-day Treasury bill auction rate in
 * every covered market, a result counting for up to 120 days after its auction. Equal weighting keeps the
 * index a measure of the typical market rather than of Egypt and Nigeria; the per-market contributions are
 * published alongside so anyone can re-weight it.
 */

const DAY = 86400000;
const STALE_DAYS = 120;
const MIN_MARKETS = 6;

export type IndexPoint = { date: string; value: number; markets: number };
export type IndexContribution = { market: BillMarket; rate: number; date: string; weekAgo: number | null; monthAgo: number | null };

function mondayOnOrBefore(iso: string) {
  const d = new Date(iso);
  const dow = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - dow * DAY).toISOString().slice(0, 10);
}

function rateOn(rows: { tenor: BillTenor; date: string; rate: number }[], tenor: BillTenor, date: string) {
  const cutoff = new Date(Date.parse(date) - STALE_DAYS * DAY).toISOString().slice(0, 10);
  const row = rows.find((r) => r.tenor === tenor && r.date <= date && r.date >= cutoff);
  return row ?? null;
}

export function billIndexSeries(tenor: BillTenor = 364, weeks = 600): IndexPoint[] {
  const data = billMarkets.map((m) => ({ market: m, rows: loadBillMarket(m.slug).rows }));
  const today = new Date().toISOString().slice(0, 10);
  const start = mondayOnOrBefore(today);
  const points: IndexPoint[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const date = new Date(Date.parse(start) - i * 7 * DAY).toISOString().slice(0, 10);
    const rates = data.map((d) => rateOn(d.rows, tenor, date)?.rate).filter((r): r is number => r != null);
    if (rates.length < MIN_MARKETS) break;
    points.push({ date, value: Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 1000) / 1000, markets: rates.length });
  }
  return points.reverse();
}

export function billIndexLatest(tenor: BillTenor = 364) {
  const series = billIndexSeries(tenor);
  const latest = series.at(-1);
  if (!latest) return null;
  const at = (weeksBack: number) => series.at(-1 - weeksBack) ?? null;
  const yearAgo = series.find((p) => p.date <= new Date(Date.parse(latest.date) - 364 * DAY).toISOString().slice(0, 10) && Date.parse(latest.date) - Date.parse(p.date) <= 371 * DAY) ?? series.filter((p) => Date.parse(latest.date) - Date.parse(p.date) >= 364 * DAY).at(-1) ?? null;
  const contributions: IndexContribution[] = billMarkets.flatMap((market) => {
    const rows = loadBillMarket(market.slug).rows;
    const now = rateOn(rows, tenor, latest.date);
    if (!now) return [];
    const w = rateOn(rows, tenor, new Date(Date.parse(latest.date) - 7 * DAY).toISOString().slice(0, 10));
    const m = rateOn(rows, tenor, new Date(Date.parse(latest.date) - 28 * DAY).toISOString().slice(0, 10));
    return [{ market, rate: now.rate, date: now.date, weekAgo: w?.rate ?? null, monthAgo: m?.rate ?? null }];
  });
  const high = series.reduce((a, b) => (b.value > a.value ? b : a));
  const low = series.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    tenor,
    latest,
    weekAgo: at(1),
    monthAgo: at(4),
    yearAgo,
    series,
    contributions: contributions.sort((a, b) => b.rate - a.rate),
    high,
    low,
    bpsWeek: at(1) ? Math.round((latest.value - at(1)!.value) * 100) : null,
    bpsMonth: at(4) ? Math.round((latest.value - at(4)!.value) * 100) : null,
    bpsYear: yearAgo ? Math.round((latest.value - yearAgo.value) * 100) : null,
  };
}

export const indexName = "Afronomics African Sovereign Bill Index";
export const indexShort = "ASBI";
