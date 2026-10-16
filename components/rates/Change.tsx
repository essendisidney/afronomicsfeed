import { changePeriod, seriesChange, type RateSeries } from "@/lib/rate-series-core";

const glyph = { up: "▲", down: "▼", flat: "■" } as const;
const word = { up: "up", down: "down", flat: "unchanged" } as const;
const tone = { up: "text-up", down: "text-down", flat: "text-muted" } as const;

/**
 * The change since the previous print, e.g. "▲ +12 bps vs 12 Oct auction". Direction is carried by the arrow and
 * the sign as well as the colour, and spelled out for screen readers. A rise is not called good or bad: for a
 * saver a higher rate helps, for a borrower it hurts.
 */
export function Change({ series, period = true, className = "" }: { series: RateSeries; period?: boolean; className?: string }) {
  const c = seriesChange(series);
  if (!c?.direction || !c.previous || !c.text) return <span className={`text-[12px] text-muted ${className}`}>First print</span>;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1 text-[12px] leading-5 ${className}`}>
      <span className="whitespace-nowrap font-semibold text-ink">
        <span aria-hidden="true" className={tone[c.direction]}>
          {glyph[c.direction]}{" "}
        </span>
        <span className="sr-only">{word[c.direction]} </span>
        {c.direction === "flat" ? "unchanged" : c.text}
      </span>
      {period ? <span className="whitespace-nowrap text-muted">{changePeriod(series, c.previous)}</span> : null}
    </span>
  );
}
