import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * African government Eurobond yields, each read from the government's own daily or weekly publication
 * (scripts/eurobonds.py -> data/eurobonds.json).
 */

export type Eurobond = {
  id: string;
  coupon: number | null; // not printed by every publisher
  maturity: string; // "2027-11", or "2028" where only the year is printed
  size: string | null;
  price: number | null;
  yield: number;
};

export type EurobondCountry = {
  country: string;
  publisher: string;
  source_page: string;
  note: string;
  latest: { date: string; source: string; bonds: Eurobond[] };
  history: { date: string; yields: Record<string, number> }[];
  bulletins?: string[];
};

type File = { read_at: string; countries: Record<string, EurobondCountry> };

const FILE = path.join(process.cwd(), "data", "eurobonds.json");

export const loadEurobonds = cache((): File | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

/** The yield on the same bond on the newest day at least `days` before the latest, if one was read. */
function earlier(c: EurobondCountry, id: string, days: number): number | null {
  const cutoff = new Date(Date.parse(c.latest.date) - days * 86_400_000).toISOString().slice(0, 10);
  const day = c.history.find((h) => h.date <= cutoff && h.yields[id] != null);
  return day ? day.yields[id] : null;
}

/** The previous day read for this country (not the latest), for "change on the day". */
function previousDay(c: EurobondCountry) {
  return c.history.find((h) => h.date < c.latest.date) ?? null;
}

export type EurobondRow = Eurobond & { years: number; dayChange: number | null; monthChange: number | null };

export function eurobondTable(c: EurobondCountry): EurobondRow[] {
  const prev = previousDay(c);
  const at = Date.parse(c.latest.date);
  return [...c.latest.bonds]
    .sort((a, b) => a.maturity.localeCompare(b.maturity))
    .map((b) => {
      const p = prev?.yields[b.id];
      const m = earlier(c, b.id, 28);
      return {
        ...b,
        years: (Date.parse(b.maturity.length === 4 ? `${b.maturity}-07-01` : `${b.maturity}-15`) - at) / (365.25 * 86_400_000),
        dayChange: p != null ? b.yield - p : null,
        monthChange: m != null ? b.yield - m : null,
      };
    });
}

/** How a bond is named: "6.500% due Nov 2027", or "2028 bond" where the publisher prints only the year. */
export const bondLabel = (b: Pick<Eurobond, "coupon" | "maturity">) =>
  b.coupon != null ? `${b.coupon.toFixed(3)}% due ${maturityLabel(b.maturity)}` : `${b.maturity} bond`;

/** Simple average yield across a country's bonds on each day read, oldest first, for the trend line. */
export function averageSeries(c: EurobondCountry): { date: string; avg: number; n: number }[] {
  return [...c.history]
    .reverse()
    .map((h) => {
      const v = Object.values(h.yields);
      return { date: h.date, avg: v.reduce((s, x) => s + x, 0) / v.length, n: v.length };
    })
    .filter((x) => x.n > 0);
}

export const maturityLabel = (ym: string) =>
  ym.length === 4
    ? ym
    : new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));
