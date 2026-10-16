import Link from "next/link";
import { Change } from "@/components/rates/Change";
import { Spark } from "@/components/rates/Spark";
import { seriesPath } from "@/lib/data/rate-series";
import { compareHref, defaultPairs, formatValue, pointDate, seriesChange, type RateSeries } from "@/lib/rate-series-core";

/** Opens the page's FollowSheet; without script, goes to the series page's follow section. */
export function FollowLink({ series, className = "", children }: { series: RateSeries; className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={`${seriesPath(series.id)}#follow`}
      data-follow={series.id}
      data-label={series.label}
      className={className || "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-rule px-3 text-[13px] font-semibold text-ink hover:border-forest hover:text-forest"}
    >
      {children ?? (
        <>
          <span aria-hidden="true">+</span> Follow<span className="sr-only"> {series.label}</span>
        </>
      )}
    </a>
  );
}

/** The partner a series is compared with by default: its own suggested pair, or the 91-day bill. */
export function defaultPartner(id: string) {
  const pair = defaultPairs.find(([a, b]) => a === id || b === id);
  if (pair) return pair[0] === id ? pair[1] : pair[0];
  return id === "kenya-91d" ? "kenya-cbr" : "kenya-91d";
}

/** A table cell's trend: sparkline (when there are three or more points), then the change since the last print. */
export function TrendCell({ series, period = false }: { series: RateSeries | null; period?: boolean }) {
  if (!series) return <span className="text-[12px] text-muted">—</span>;
  return (
    <span className="flex min-w-[9.5rem] items-center gap-2">
      <span className="inline-block h-7 w-[88px] shrink-0">
        <Spark series={series} />
      </span>
      <Change series={series} period={period} />
    </span>
  );
}

/**
 * The headline number tile at the top of a rate page: latest figure, its date and source, the change since the
 * previous print, a sparkline, and the Follow and Compare actions.
 */
export function HeadlineTile({ series, kicker, extra, className = "" }: { series: RateSeries; kicker?: string; extra?: React.ReactNode; className?: string }) {
  const c = seriesChange(series);
  if (!c) return null;
  const latest = c.latest;
  return (
    <div className={`rounded-2xl border border-rule bg-surface px-5 py-5 ${className}`}>
      <p className="text-[13px] font-medium text-muted">{kicker ?? series.label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-serif text-4xl leading-none tracking-[-0.02em] text-ink">{formatValue(latest.value, series.unit, series.unit === "pct" && series.frequency === "auction" ? 3 : undefined)}</p>
        <span className="inline-block h-9 w-[120px]">
          <Spark series={series} width={120} height={36} />
        </span>
      </div>
      {kicker ? <p className="mt-2 text-[14px] font-medium text-ink">{series.label}</p> : null}
      <p className="mt-1">
        <Change series={series} />
      </p>
      {extra ? <div className="mt-1 text-[12px] text-ink-soft">{extra}</div> : null}
      <p className="mt-2 text-[12px] leading-5 text-muted">
        As of {pointDate(latest.date, series.frequency)}
        {series.confirmedOn ? `, confirmed ${pointDate(series.confirmedOn, "daily")}` : ""} · Source:{" "}
        {series.source.href.startsWith("/") ? (
          <Link href={series.source.href} className="underline underline-offset-2 hover:text-forest">
            {series.source.name}
          </Link>
        ) : (
          <a href={series.source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-forest">
            {series.source.name}
          </a>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <FollowLink series={series} />
        <Link
          href={compareHref(series.id, defaultPartner(series.id))}
          className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 text-[13px] font-semibold text-ink hover:border-forest hover:text-forest"
        >
          Compare with…
        </Link>
        <Link href={seriesPath(series.id)} className="inline-flex min-h-11 items-center px-1 text-[13px] font-medium text-forest underline underline-offset-2">
          History
        </Link>
      </div>
    </div>
  );
}
