import Link from "next/link";
import { Change } from "@/components/rates/Change";
import { FollowLink } from "@/components/rates/SeriesBits";
import { Spark } from "@/components/rates/Spark";
import { getSeries, hubSeriesIds, seriesPath } from "@/lib/data/rate-series";
import { compareHref, defaultPairs, formatValue, pointDate } from "@/lib/rate-series-core";

/** The Rates & data hub's lead: the key rates, each with its latest print, change, trend line, follow and history. */
export function KeyRates() {
  const list = hubSeriesIds.map((id) => getSeries(id)).filter((s) => s != null);
  if (!list.length) return null;
  const [a, b] = defaultPairs[0];
  return (
    <section aria-labelledby="key-rates-h" className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="key-rates-h" className="font-serif text-2xl leading-tight text-ink">
          Key rates now
        </h2>
        <Link href={compareHref(a, b)} className="inline-flex min-h-11 items-center text-[14px] font-medium text-forest underline underline-offset-2">
          Compare two series →
        </Link>
      </div>
      <ul className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const last = s.points.at(-1)!;
          return (
            <li key={s.id} className="flex flex-col bg-surface px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={seriesPath(s.id)} className="min-w-0 hover:text-forest">
                  <span className="block text-[14px] font-semibold leading-5 text-ink">{s.short}</span>
                  <span className="block text-[12px] text-muted">{s.group === "Kenya" ? "Kenya" : s.group}</span>
                </Link>
                <span className="inline-block h-7 w-[88px] shrink-0">
                  <Spark series={s} />
                </span>
              </div>
              <p className="mt-2 font-serif text-[1.75rem] leading-none text-ink">{formatValue(last.value, s.unit)}</p>
              <p className="mt-1">
                <Change series={s} />
              </p>
              <p className="mt-1 text-[12px] text-muted">
                {pointDate(last.date, s.frequency)} · {s.source.name}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <FollowLink series={s} />
                <Link href={seriesPath(s.id)} className="inline-flex min-h-11 items-center text-[13px] font-medium text-forest underline underline-offset-2">
                  History<span className="sr-only"> of {s.label}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[12px] leading-5 text-muted">
        Trend lines draw only stored prints; a series with fewer than three has none yet. Change is against the previous print. Information, not advice.
      </p>
    </section>
  );
}
