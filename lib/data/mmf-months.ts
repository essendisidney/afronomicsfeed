import { loadFundHistory, WHT_INTEREST, type FundReading } from "./kenya-rates";

/**
 * Kenya money market funds ranked month by month, from the daily readings in data/kenya/mmf_history.json.
 *
 * A fund read daily is ranked on the average of its readings in the month. A fund that publishes only a monthly
 * figure (a fact sheet: a reading with `basis` and `period_end`) is ranked on the figure for that month, which
 * arrives early the next month: until then, the month in progress shows its latest monthly figure, labelled with
 * the month it covers, and a finished month lists it as not yet published.
 */

export type MonthFund = {
  name: string;
  manager: string;
  source: string;
  gross: number; // average effective annual yield, %
  net: number; // after 15% withholding tax
  /** Readings averaged (daily funds), or null for a monthly figure. */
  days: number | null;
  /** For a monthly figure: what it is, e.g. "September 2026 average, from the monthly fact sheet". */
  basis: string | null;
  first: number; // first reading of the month (daily funds), for the month's movement
  last: number;
};

export type MonthRanking = {
  month: string; // YYYY-MM
  label: string; // "October 2026"
  complete: boolean;
  from: string; // first and last day read
  to: string;
  rows: MonthFund[];
  /** Monthly-figure funds whose figure for this month is not out yet (finished months only). */
  pending: string[];
};

const monthLabel = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01`));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** This month in Nairobi, as YYYY-MM. */
export function nairobiMonth(now = new Date()) {
  return new Date(now.getTime() + 3 * 3600_000).toISOString().slice(0, 7);
}

export function mmfMonths(history: FundReading[] = loadFundHistory(), now = new Date()): MonthRanking[] {
  const current = nairobiMonth(now);
  const monthly = (r: FundReading) => Boolean(r.basis && r.period_end);
  const daily = history.filter((r) => !monthly(r));
  const sheets = history.filter(monthly);
  const months = [...new Set(daily.map((r) => r.date.slice(0, 7)))].filter((m) => m <= current).sort().reverse();

  return months.map((month) => {
    const inMonth = daily.filter((r) => r.date.startsWith(month));
    const rows: MonthFund[] = [];
    const byFund = new Map<string, FundReading[]>();
    for (const r of inMonth) byFund.set(r.name, [...(byFund.get(r.name) ?? []), r]);
    for (const [name, rs] of byFund) {
      rs.sort((a, b) => a.date.localeCompare(b.date));
      const gross = mean(rs.map((r) => r.effective_annual_yield));
      const last = rs.at(-1)!;
      rows.push({ name, manager: last.manager, source: last.source, gross, net: gross * (1 - WHT_INTEREST), days: rs.length, basis: null, first: rs[0].effective_annual_yield, last: last.effective_annual_yield });
    }

    const complete = month < current;
    const pending: string[] = [];
    for (const name of new Set(sheets.map((r) => r.name))) {
      if (byFund.has(name)) continue;
      const own = sheets.filter((r) => r.name === name).sort((a, b) => a.date.localeCompare(b.date));
      const exact = own.filter((r) => r.period_end!.startsWith(month)).at(-1);
      // The month in progress: the newest monthly figure published so far (it can only cover an earlier month).
      const pick = exact ?? (complete ? undefined : own.at(-1));
      if (!pick) {
        if (complete && own.some((r) => r.period_end! < `${month}-01`)) pending.push(name);
        continue;
      }
      const g = pick.effective_annual_yield;
      rows.push({
        name,
        manager: pick.manager,
        source: pick.source,
        gross: g,
        net: g * (1 - WHT_INTEREST),
        days: null,
        basis: `${monthLabel(pick.period_end!.slice(0, 7))} average, from the manager’s monthly fact sheet`,
        first: g,
        last: g,
      });
    }

    const dates = inMonth.map((r) => r.date).sort();
    return {
      month,
      label: monthLabel(month),
      complete,
      from: dates[0],
      to: dates.at(-1)!,
      rows: rows.sort((a, b) => b.net - a.net),
      pending,
    };
  });
}

export const mmfMonth = (month: string) => mmfMonths().find((m) => m.month === month);
