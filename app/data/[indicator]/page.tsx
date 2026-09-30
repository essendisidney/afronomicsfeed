import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { Sparkline } from "@/components/data/Sparkline";
import { IndicatorSource, RankBars, SectionTitle } from "@/components/data/parts";
import { deskLabels, formatChange, formatValue, getIndicatorDef, indicatorDefs, indicatorsForDesk } from "@/lib/data/indicators";
import { continentalMedian, coveredTotal, loadIndicator, movers, ranked } from "@/lib/data/series";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return indicatorDefs.map((def) => ({ indicator: def.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ indicator: string }> }): Promise<Metadata> {
  const { indicator } = await params;
  const def = getIndicatorDef(indicator);
  if (!def) return {};
  const title = `${def.short} by African country — ranking and history`;
  return {
    title,
    description: `${def.label} for all 54 African countries: latest ranking, change on the year, history since 2010 and a free CSV download. Source: World Bank (${def.code}).`,
    alternates: { canonical: `${site.url}/data/${def.slug}` },
  };
}

export default async function IndicatorPage({ params }: { params: Promise<{ indicator: string }> }) {
  const { indicator } = await params;
  const def = getIndicatorDef(indicator);
  if (!def) notFound();
  const file = await loadIndicator(def.slug);
  if (!file) notFound();

  const rows = ranked(file);
  const median = continentalMedian(file);
  const total = def.summable ? coveredTotal(file) : null;
  const moves = movers(file, 6);
  const years = file.latestYear ? Array.from({ length: 6 }, (_, index) => file.latestYear! - 5 + index) : [];
  const missing = file.series.filter((item) => !rows.some((row) => row.country.iso === item.country.iso)).map((item) => item.country);
  const related = indicatorsForDesk(def.desk).filter((item) => item.slug !== def.slug);
  const fmt = (value: number) => formatValue(def, value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${def.label} — African countries`,
    description: def.about,
    url: `${site.url}/data/${def.slug}`,
    identifier: def.code,
    temporalCoverage: `2010/${file.latestYear ?? ""}`,
    spatialCoverage: "Africa",
    creator: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: file.sourceUrl,
    license: "https://creativecommons.org/licenses/by/4.0/",
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}/api/data/${def.slug}` }],
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: def.short }]}
      kicker={`Data · ${deskLabels[def.desk]}`}
      title={def.label}
      lede={<p>{def.about}</p>}
      aside={
        <div className="grid grid-cols-2 gap-px bg-rule">
          <div className="bg-paper-2 px-4 py-4">
            <p className="font-medium text-[12px] text-muted">{total ? `Africa total · ${total.year}` : "Africa median"}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{total ? fmt(total.sum) : median != null ? fmt(median) : "—"}</p>
            <p className="text-[11px] text-muted">{total ? `${total.reporting} countries reporting` : `${rows.length} countries`}</p>
          </div>
          <a href={`/api/data/${def.slug}`} className="bg-gold px-4 py-4 text-white hover:bg-gold-soft">
            <p className="font-medium text-[12px] text-white/80">Download</p>
            <p className="mt-1 font-serif text-2xl">CSV</p>
            <p className="text-[11px] text-white/80">54 countries × every year</p>
          </a>
        </div>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="Ranking" title={`Latest print, highest to lowest`} note="Each country’s most recent value from the last three years. A small ’YY marks an older print." />
          <div className="mt-4">
            <RankBars def={def} readings={rows} limit={60} />
          </div>
        </section>
        <aside className="lg:col-span-5">
          <SectionTitle kicker="Movers" title="Biggest changes on the year" />
          <ul className="mt-2 divide-y divide-rule">
            {moves.map((move) => (
              <li key={move.country.iso} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <Link href={`/countries/${move.country.slug}`} className="hover:text-forest">
                  {move.country.name}
                </Link>
                <span className="font-mono text-xs text-ink-soft">
                  {fmt(move.previous.value)} → {fmt(move.value)}{" "}
                  <span className="text-ink">({formatChange(def, move.previous.value, move.value)})</span>
                </span>
              </li>
            ))}
            {moves.length === 0 ? <li className="py-3 text-sm text-muted">Not enough consecutive years to compute moves.</li> : null}
          </ul>
          {missing.length > 0 ? (
            <p className="mt-6 text-xs leading-5 text-muted">
              No recent print from: {missing.map((country) => country.name).join(", ")}.
            </p>
          ) : null}
          <div className="mt-8">
            <SectionTitle kicker="Related" title={deskLabels[def.desk]} />
            <ul className="mt-2 space-y-1.5 text-sm">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/data/${item.slug}`} className="text-forest hover:text-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <SectionTitle kicker="History" title={`${years[0] ?? ""}–${years.at(-1) ?? ""} by country`} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Trend since 2010</th>
                {years.map((year) => (
                  <th key={year} className="text-right">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...file.series]
                .sort((a, b) => a.country.name.localeCompare(b.country.name))
                .map((item) => {
                  const byYear = new Map(item.points.map((point) => [point.year, point.value]));
                  return (
                    <tr key={item.country.iso} id={item.country.iso.toLowerCase()}>
                      <td>
                        <Link href={`/countries/${item.country.slug}`} className="hover:text-forest">
                          {item.country.name}
                        </Link>
                      </td>
                      <td className="w-32 min-w-32">
                        <Sparkline points={item.points} format={fmt} label={`${item.country.name} ${def.short}`} height={24} />
                      </td>
                      {years.map((year) => (
                        <td key={year} className="text-right font-mono text-xs">
                          {byYear.has(year) ? fmt(byYear.get(year)!) : <span className="text-muted">—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <IndicatorSource def={def} />
      </section>
    </PageShell>
  );
}
