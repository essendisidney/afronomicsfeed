import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { buildIndex, spliceIndex, type CpiPoint, type YoyRate } from "@/lib/inflation";

/**
 * Kenya's consumer price index, copied by hand from KNBS releases and the CBK's inflation table into
 * data/kenya/cpi.json: the rebased CPI (February 2019 = 100) and the previous one (February 2009 = 100), with the
 * 12-month rates used to fill months the releases do not print. lib/inflation.ts builds and splices the two.
 */

type Series = { base: string; levels: (CpiPoint & { source: string })[]; twelve_month_rates: (YoyRate & { source?: string })[] };

export type CpiFile = {
  dataset: string;
  checked: string;
  note: string;
  sources: { name: string; url: string }[];
  link_month: string;
  rebased: Series;
  previous: Series;
};

export const loadCpi = cache((): CpiFile => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "kenya", "cpi.json"), "utf8")) as CpiFile);

/** The spliced monthly index, oldest first, on the rebased CPI's scale. */
export const cpiIndex = cache((): CpiPoint[] => {
  const f = loadCpi();
  const strip = (s: Series) => [s.levels.map(({ month, index }) => ({ month, index })), s.twelve_month_rates.map(({ month, rate }) => ({ month, rate }))] as const;
  const [rl, rr] = strip(f.rebased);
  const [pl, pr] = strip(f.previous);
  return spliceIndex(buildIndex(rl, rr), buildIndex(pl, pr), f.link_month);
});
