import { formatValue, type IndicatorDef } from "./indicators";
import { loadIndicators, movers, type Mover } from "./series";

/**
 * Data signals: the largest moves on the most recent annual print, written as
 * plain sentences. Every sentence is generated from the published values and
 * links back to the series — no model writes a number here.
 */

export type DataSignal = {
  id: string;
  def: IndicatorDef;
  mover: Mover;
  headline: string;
  detail: string;
  direction: "up" | "down";
  tone: "positive" | "negative" | "neutral";
};

const SIGNAL_SERIES = ["inflation", "gdp-growth", "fdi", "reserves", "debt-service", "external-debt", "remittances", "current-account", "internet", "electricity"];

function verb(delta: number) {
  return delta >= 0 ? "rose" : "fell";
}

function describe(def: IndicatorDef, mover: Mover) {
  const from = formatValue(def, mover.previous.value);
  const to = formatValue(def, mover.value);
  const name = mover.country.name;
  return {
    headline: `${name}: ${def.short.toLowerCase()} ${verb(mover.value - mover.previous.value)} to ${to}`,
    detail: `${def.label} moved from ${from} in ${mover.previous.year} to ${to} in ${mover.year}.`,
  };
}

export async function loadDataSignals(limitPerSeries = 3): Promise<DataSignal[]> {
  const files = await loadIndicators(SIGNAL_SERIES);
  const signals = files.flatMap((file) =>
    movers(file, limitPerSeries).map((mover) => {
      const up = mover.value >= mover.previous.value;
      const good = file.def.higherIsBetter;
      const tone: DataSignal["tone"] = good === null ? "neutral" : up === good ? "positive" : "negative";
      return {
        id: `${file.def.slug}-${mover.country.slug}-${mover.year}`,
        def: file.def,
        mover,
        ...describe(file.def, mover),
        direction: up ? ("up" as const) : ("down" as const),
        tone,
      };
    }),
  );
  // Newest print first, then by size of move within the series' own scale.
  return signals.sort((a, b) => b.mover.year - a.mover.year || Math.abs(b.mover.delta) - Math.abs(a.mover.delta));
}
