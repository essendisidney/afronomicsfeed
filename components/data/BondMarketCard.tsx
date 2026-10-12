import type { BondSnapshot } from "@/lib/data/sovereign-bonds";

const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthLabel = (ym: string) => new Date(`${ym}-15T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
const pct = (v: number) => `${v.toFixed(2)}%`;
const tenor = (y: number | null) => (y === null ? "—" : y < 1 ? `${Math.round(y * 12)}m` : `${Number.isInteger(y) ? y : y.toFixed(1)}y`);

/** Monthly average auction rate: one hue, last point marked, native hover titles. */
function Trend({ points }: { points: { month: string; rate: number }[] }) {
  if (points.length < 3) return null;
  const width = 240;
  const height = 48;
  const pad = 4;
  const values = points.map((p) => p.rate);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Average auction rate: ${pct(first.rate)} in ${monthLabel(first.month)} to ${pct(last.rate)} in ${monthLabel(last.month)}`}
        className="block h-12 w-full overflow-visible text-forest"
      >
        <path d={d} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={p.month} cx={x(i)} cy={y(p.rate)} r={6} fill="transparent" vectorEffect="non-scaling-stroke">
            <title>{`${monthLabel(p.month)}: ${pct(p.rate)}`}</title>
          </circle>
        ))}
        <circle cx={x(points.length - 1)} cy={y(last.rate)} r={2.5} fill="currentColor" className="text-gold" />
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted">
        <span>
          {monthLabel(first.month)} {pct(first.rate)}
        </span>
        <span>average auction rate by month</span>
        <span>
          {monthLabel(last.month)} {pct(last.rate)}
        </span>
      </figcaption>
    </figure>
  );
}

/** One market's newest bond auction and its two-year trend, for the institutional product page. */
export function BondMarketCard({ snap, label }: { snap: BondSnapshot; label?: string }) {
  const { market, latest, latestDate } = snap;
  const showIssue = latest.some((r) => r.issue && market.slug === "waemu");
  return (
    <article className="flex flex-col rounded-xl border border-rule bg-paper-2 px-4 py-4">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-ink">{label ?? market.country}</h3>
        <span className="shrink-0 text-[11px] text-muted">{market.currency}</span>
      </header>
      <p className="text-[12px] text-ink-soft">
        {market.dateKind === "settlement" ? "Latest issue, settling" : "Latest auction"} {longDate(latestDate)} · {snap.results.toLocaleString("en-US")} results since {new Date(`${snap.since}T12:00:00Z`).getUTCFullYear()}
      </p>
      <table className="mt-3 w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-muted">
            {showIssue ? <th className="pb-1 font-normal">Issuer</th> : null}
            <th className="pb-1 font-normal">Tenor</th>
            <th className="pb-1 text-right font-normal">Rate</th>
            <th className="pb-1 text-right font-normal">Bid cover</th>
          </tr>
        </thead>
        <tbody>
          {latest.map((r, i) => (
            <tr key={`${r.isin ?? r.issue ?? ""}-${r.tenor_years}-${i}`} className="border-t border-rule">
              {showIssue ? <td className="py-1 text-ink-soft">{r.issue}</td> : null}
              <td className="py-1 text-ink">{tenor(r.tenor_years)}</td>
              <td className="py-1 text-right font-mono text-ink">{pct(r.rate)}</td>
              <td className="py-1 text-right font-mono text-ink-soft">{r.bid_cover ? `${r.bid_cover.toFixed(2)}×` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Trend points={snap.monthly} />
      <p className="mt-auto flex flex-wrap gap-x-3 pt-3 text-[12px]">
        {latest[0]?.source ? (
          <a href={latest[0].source} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
            Source notice
          </a>
        ) : null}
        <a href={`/api/data/bonds/${market.slug}`} className="text-forest underline underline-offset-2">
          CSV
        </a>
        <a href={`/api/v1/bonds/${market.slug}`} className="text-forest underline underline-offset-2">
          API
        </a>
        <span className="text-muted">{market.publisher}</span>
      </p>
    </article>
  );
}
