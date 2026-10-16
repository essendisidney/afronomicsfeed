import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { ComparePicker } from "@/components/rates/ComparePicker";
import { FollowSheet } from "@/components/rates/FollowSheet";
import { HeadlineTile } from "@/components/rates/SeriesBits";
import { SeriesChart, SeriesTable } from "@/components/rates/SeriesChart";
import { getSeries } from "@/lib/data/rate-series";
import { compareHref, compareRanges, defaultPairs, formatValue, pointDate, rangeStart, sharedAxis, type CompareRange } from "@/lib/rate-series-core";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().toLowerCase() || undefined;

async function pair(searchParams: Props["searchParams"]) {
  const q = await searchParams;
  const [da, db] = defaultPairs[0];
  const aId = one(q.a) ?? da;
  let bId = one(q.b) ?? (aId === da ? db : da);
  if (bId === aId) bId = aId === da ? db : da;
  const range = (compareRanges.find((r) => r.id === one(q.range))?.id ?? "1y") as CompareRange;
  return { a: getSeries(aId), b: getSeries(bId), range };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await pair(searchParams);
  if (!a || !b) return { title: "Compare two rates", robots: { index: false } };
  return {
    title: fitTitle(`${a.short} vs ${b.short}: compared`),
    description: fitDescription(`${a.label} against ${b.label} on one chart, from the stored history of each: ${a.source.name} and ${b.source.name}. Information, not advice.`),
    alternates: { canonical: `${site.url}${compareHref(a.id, b.id)}` },
  };
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b, range } = await pair(searchParams);
  if (!a || !b) notFound();
  const shared = sharedAxis(a, b);
  const end = [a.points.at(-1)!.date, b.points.at(-1)!.date].sort().at(-1)!;
  const start = rangeStart(end, range);
  const la = a.points.at(-1)!;
  const lb = b.points.at(-1)!;
  const gap = shared && a.unit === "pct" ? la.value - lb.value : null;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/numbers", label: "Rates & data" }, { label: "Compare" }]}
      kicker="Compare two series"
      title={`${a.short} vs ${b.short}`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <HeadlineTile series={a} />
        <HeadlineTile series={b} />
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle kicker="Chart" title="Side by side" note={shared ? `${a.unitLabel}, one axis.` : "Two axes: solid line on the left axis, dashed line on the right."} />
          <nav aria-label="Time range" className="flex flex-wrap gap-2">
            {compareRanges.map((r) => (
              <Link
                key={r.id}
                href={compareHref(a.id, b.id, r.id)}
                aria-current={r.id === range ? "page" : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-[13px] font-medium ${r.id === range ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft hover:border-forest hover:text-ink"}`}
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </div>
        <SeriesChart a={a} b={b} start={start} label={`${a.label} and ${b.label} from ${pointDate(start < "1900" ? [a.points[0].date, b.points[0].date].sort()[0] : start, "daily")} to ${pointDate(end, "daily")}`} />
        <p className="mt-3 max-w-2xl text-[14px] leading-6 text-ink-soft">
          {a.label} against {b.label}, each from its own stored history.{" "}
          {shared ? `Both are in ${a.unitLabel}, so they share one axis.` : `They are in different units (${a.unitLabel}; ${b.unitLabel}), so each has its own axis: ${a.short} on the left, ${b.short} on the right.`}{" "}
          Share this page and the same pair opens.
        </p>
        {gap != null ? (
          <p className="mt-3 text-[14px] text-ink">
            Latest gap: <strong>{`${gap > 0 ? "+" : gap < 0 ? "−" : ""}${Math.abs(gap).toFixed(2)} percentage points`}</strong>{" "}
            <span className="text-muted">
              ({a.short} {formatValue(la.value, a.unit)} on {pointDate(la.date, a.frequency)} minus {b.short} {formatValue(lb.value, b.unit)} on {pointDate(lb.date, b.frequency)})
            </span>
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <SectionTitle kicker="Change the pair" title="Compare with…" />
        <div className="mt-4 max-w-4xl">
          <ComparePicker a={a} b={b} range={range} editA />
        </div>
        <p className="mt-4 text-[13px] text-ink-soft">
          Suggested pairs:{" "}
          {defaultPairs.map(([x, y], i) => {
            const sx = getSeries(x);
            const sy = getSeries(y);
            if (!sx || !sy) return null;
            return (
              <span key={`${x}-${y}`}>
                {i ? <span aria-hidden="true"> · </span> : null}
                <Link href={compareHref(x, y)} className="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-2 sm:min-h-0">
                  {sx.short} vs {sy.short}
                </Link>
              </span>
            );
          })}
        </p>
      </section>

      <section className="mt-10">
        <SectionTitle kicker="Figures" title="The prints behind the chart" note="Newest first; a dash where one series has no print that day." />
        <div className="mt-4 max-w-2xl">
          <SeriesTable series={[a, b]} start={start} limit={16} />
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
        Sources:{" "}
        {[a, b].map((s, i) => (
          <span key={s.id}>
            {i ? "; " : ""}
            {s.label}, {s.source.href.startsWith("/") ? <Link href={s.source.href} className="underline underline-offset-2">{s.source.name}</Link> : <a href={s.source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{s.source.name}</a>} ({s.measure})
          </span>
        ))}
        . Each line shows only the prints Afronomics has stored; a series with fewer than three in the window is drawn as points. Information, not advice.
      </p>
      <FollowSheet />
    </PageShell>
  );
}
