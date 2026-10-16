/**
 * The inflation calculator (/rates/kenya/inflation): what a sum of Kenya shillings from one month is worth in another
 * month's prices, and what it would have earned in a 364-day Treasury bill or an average bank fixed deposit. Pure
 * arithmetic with no imports, so it runs in the browser and in tests (tests/site/test_inflation.py).
 *
 * The price index is built from data/kenya/cpi.json. From February 2019 it is KNBS's rebased CPI (February 2019 =
 * 100), level by level as published. Before that it is KNBS's previous CPI (February 2009 = 100): thirteen published
 * levels (February 2018 to February 2019), and earlier months chained back from them with the official 12-month
 * inflation rates (each month = the same month a year later / (1 + that later month's rate)). The two series are
 * spliced at February 2019, the month both publish, so no change is ever measured across two baskets.
 */

export type CpiPoint = { month: string; index: number }; // month: YYYY-MM
export type YoyRate = { month: string; rate: number }; // 12-month inflation, % (the month against the same month a year earlier)
export type BillRate = { date: string; rate: number }; // a 364-day auction: value date (YYYY-MM-DD), weighted average rate % a year
export type DepositRate = { month: string; rate: number }; // CBK weighted average deposit rate, % a year

export const WHT = 0.15; // withholding tax on interest, bills and bank deposits alike

/** Month arithmetic on YYYY-MM strings. */
export function addMonths(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

export function monthsBetween(fromYm: string, toYm: string) {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/**
 * The monthly index, oldest first: the published levels as they are, then each missing month (in a gap, or before
 * the first level) from the same month a year later, and each month after the last level from the same month a year
 * earlier, as far as the 12-month rates reach.
 */
export function buildIndex(anchor: CpiPoint[], yoy: YoyRate[]): CpiPoint[] {
  const rate = new Map(yoy.map((r) => [r.month, r.rate]));
  const idx = new Map(anchor.map((a) => [a.month, a.index]));
  const months = anchor.map((a) => a.month).sort();
  const first = months[0];
  const last = months[months.length - 1];
  // Backwards from the last level: I(m) = I(m + 12) / (1 + r(m + 12)), for gaps and then for earlier months.
  for (let m = addMonths(last, -1); ; m = addMonths(m, -1)) {
    if (idx.has(m)) continue;
    const later = addMonths(m, 12);
    const r = rate.get(later);
    const i = idx.get(later);
    if (r === undefined || i === undefined) {
      if (m < first) break;
      continue;
    }
    idx.set(m, i / (1 + r / 100));
  }
  // Forwards: I(m) = I(m - 12) × (1 + r(m)).
  for (let m = addMonths(last, 1); ; m = addMonths(m, 1)) {
    const r = rate.get(m);
    const i = idx.get(addMonths(m, -12));
    if (r === undefined || i === undefined) break;
    idx.set(m, i * (1 + r / 100));
  }
  return [...idx.entries()].map(([month, index]) => ({ month, index })).sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * One index from KNBS's two CPIs. From `link` (February 2019, the new base month) on, the rebased CPI's own levels;
 * before it, the previous CPI's levels scaled by rebased(link) / previous(link), so the two meet at the link month
 * and every change before it is the previous CPI's own.
 */
export function spliceIndex(rebased: CpiPoint[], previous: CpiPoint[], link: string): CpiPoint[] {
  const r = rebased.find((p) => p.month === link)?.index;
  const p = previous.find((x) => x.month === link)?.index;
  if (!r || !p) throw new Error(`both series need ${link}`);
  const scale = r / p;
  return [
    ...previous.filter((x) => x.month < link).map((x) => ({ month: x.month, index: x.index * scale })),
    ...rebased.filter((x) => x.month >= link),
  ].sort((a, b) => a.month.localeCompare(b.month));
}

export type Worth = {
  from: string;
  to: string;
  months: number;
  ratio: number; // index(to) / index(from)
  value: number; // `amount` from `from`, in `to` prices
  back: number; // `amount` in `to` prices, in `from` prices
  cumulativePct: number; // price rise from `from` to `to`, %
  yearlyPct: number; // the same as a compound yearly rate, %
  lostPct: number; // how much less a shilling buys at `to` than at `from`, %
};

/** What `amount` shillings in month `from` are worth in month `to` (and the reverse), from the index. Null if either month is missing. */
export function worth(amount: number, from: string, to: string, index: CpiPoint[]): Worth | null {
  const i0 = index.find((p) => p.month === from)?.index;
  const i1 = index.find((p) => p.month === to)?.index;
  if (!i0 || !i1) return null;
  const ratio = i1 / i0;
  const months = monthsBetween(from, to);
  return {
    from,
    to,
    months,
    ratio,
    value: amount * ratio,
    back: amount / ratio,
    cumulativePct: (ratio - 1) * 100,
    yearlyPct: months > 0 ? (Math.pow(ratio, 12 / months) - 1) * 100 : 0,
    lostPct: (1 - 1 / ratio) * 100,
  };
}

const dayNumber = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);

/**
 * `amount` put into 364-day Treasury bills on the 1st of `from` and rolled into a new one every 364 days until the
 * 1st of `to`, each at the latest auction's weighted average rate on or before the day it is bought, with 15% tax on
 * the interest. Interest is the discount: per shilling paid, rate × 364 / 36,500. Any days left after the last whole
 * bill earn that bill's rate pro rata. Null when there is no auction in the 120 days before a purchase.
 */
export function billGrowth(amount: number, from: string, to: string, bills: BillRate[]): number | null {
  const sorted = [...bills].sort((a, b) => a.date.localeCompare(b.date));
  const start = dayNumber(`${from}-01`);
  const end = dayNumber(`${to}-01`);
  if (end <= start) return amount;
  let value = amount;
  for (let t = start; t < end; t += 364) {
    let rate: number | null = null;
    for (const b of sorted) {
      const d = dayNumber(b.date);
      if (d > t) break;
      if (t - d <= 120) rate = b.rate;
    }
    if (rate === null) return null;
    const days = Math.min(364, end - t);
    value *= 1 + (1 - WHT) * ((rate * days) / 36500);
  }
  return value;
}

/**
 * `amount` in a bank fixed deposit from the 1st of `from` to the 1st of `to`, earning each month the CBK's weighted
 * average deposit rate for that month (or the latest month before it), compounded monthly, with 15% tax on the
 * interest. Null when the rates do not reach back to `from`.
 */
export function depositGrowth(amount: number, from: string, to: string, rates: DepositRate[]): number | null {
  const sorted = [...rates].sort((a, b) => a.month.localeCompare(b.month));
  if (!sorted.length || sorted[0].month > from) return null;
  let value = amount;
  let k = 0;
  for (let m = from; m < to; m = addMonths(m, 1)) {
    while (k + 1 < sorted.length && sorted[k + 1].month <= m) k++;
    value *= 1 + ((1 - WHT) * sorted[k].rate) / 1200;
  }
  return value;
}
