import Link from "next/link";
import { formatChange, formatValue, type IndicatorDef } from "@/lib/data/indicators";
import { indicatorPageUrl, type Reading } from "@/lib/data/series";
import { Sparkline } from "./Sparkline";

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{children}</p>;
}

export function SectionTitle({
  kicker,
  title,
  href,
  hrefLabel = "Open →",
  note,
}: {
  kicker: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-2">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 className="mt-1 font-serif text-xl text-ink sm:text-2xl">{title}</h2>
        {note ? <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">{note}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold">
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** One line of provenance under any number block. */
export function SourceLine({ name, href, detail }: { name: string; href: string; detail?: string }) {
  return (
    <p className="mt-3 font-mono text-[10px] leading-5 tracking-[0.04em] text-muted">
      Source:{" "}
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-forest">
        {name}
      </a>
      {detail ? ` · ${detail}` : null}
    </p>
  );
}

export function StatTile({
  def,
  reading,
  href,
}: {
  def: IndicatorDef;
  reading: Reading | null;
  href?: string;
}) {
  const body = (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
        {def.short}
        {reading ? ` · ${reading.year}` : ""}
      </p>
      {reading ? (
        <>
          <p className="mt-2 font-serif text-3xl tracking-[-0.03em] text-ink">{formatValue(def, reading.value)}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {reading.previous
              ? `${formatChange(def, reading.previous.value, reading.value)} vs ${reading.previous.year}`
              : def.unit}
          </p>
          <div className="mt-3">
            <Sparkline points={reading.points} format={(value) => formatValue(def, value)} label={def.short} />
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">Not published by source</p>
      )}
    </>
  );
  const className = "block bg-paper-2 px-4 py-4 transition-colors hover:bg-paper-3";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Horizontal ranked bars for one indicator. Bars share one hue; values in ink. */
export function RankBars({
  def,
  readings,
  limit = 10,
  highlightIso,
}: {
  def: IndicatorDef;
  readings: Reading[];
  limit?: number;
  highlightIso?: string;
}) {
  const rows = readings.slice(0, limit);
  const max = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
  return (
    <ol className="space-y-1.5">
      {rows.map((row, index) => (
        <li key={row.country.iso} className="grid grid-cols-[1.5rem_8.5rem_1fr_4.5rem] items-center gap-2 text-sm sm:grid-cols-[1.5rem_10rem_1fr_5rem]">
          <span className="font-mono text-[10px] text-muted">{index + 1}</span>
          <Link
            href={`/countries/${row.country.slug}`}
            className={`truncate hover:text-forest ${row.country.iso === highlightIso ? "font-semibold text-ink" : "text-ink-soft"}`}
          >
            {row.country.name}
          </Link>
          <span className="h-2 bg-paper-3" title={`${row.country.name}, ${row.year}: ${formatValue(def, row.value)}`}>
            <span
              className={`block h-2 rounded-r ${row.value < 0 ? "bg-gold" : "bg-forest"}`}
              style={{ width: `${Math.max(2, (Math.abs(row.value) / max) * 100)}%` }}
            />
          </span>
          <span className="text-right font-mono text-xs text-ink">
            {formatValue(def, row.value)}
            {row.year !== rows[0]?.year ? <span className="text-muted"> ’{String(row.year).slice(2)}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function IndicatorSource({ def, iso }: { def: IndicatorDef; iso?: string }) {
  return <SourceLine name="World Bank Open Data" href={indicatorPageUrl(def, iso)} detail={`${def.code} · ${def.unit}`} />;
}

export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.max(1, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function usd(value: number) {
  return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 border border-dashed border-rule px-4 py-4 text-sm text-muted">{children}</p>;
}
