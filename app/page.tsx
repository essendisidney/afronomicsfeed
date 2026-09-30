import { renderTime } from "@/lib/data/fetcher";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { ProjectTable } from "@/components/data/ProjectTable";
import { WireList } from "@/components/data/WireList";
import { Kicker, RankBars, SectionTitle, SourceLine, usd } from "@/components/data/parts";
import { getLatestArticles } from "@/lib/content";
import { countries } from "@/lib/data/countries";
import { formatFx, loadFxQuote, pairHref, tapeCodes } from "@/lib/data/fx";
import { formatValue, getIndicatorDef } from "@/lib/data/indicators";
import { loadAfricaProjects, projectsSource, sumAmounts } from "@/lib/data/projects";
import { continentalMedian, coveredTotal, loadIndicators, ranked } from "@/lib/data/series";
import { loadDataSignals } from "@/lib/data/signals";
import { loadWire, publishersLive } from "@/lib/data/wire";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 900;

const regions = ["North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa"] as const;

export default async function HomePage() {
  const now = renderTime();
  const [wire, files, projects, fx, signals] = await Promise.all([
    loadWire(),
    loadIndicators(["gdp", "gdp-growth", "inflation", "fdi", "remittances", "reserves", "population"]),
    loadAfricaProjects(),
    loadFxQuote(),
    loadDataSignals(2),
  ]);
  const file = (slug: string) => files.find((item) => item.def.slug === slug);
  const articles = getLatestArticles(4);

  const gdp = file("gdp");
  const fdi = file("fdi");
  const remit = file("remittances");
  const pop = file("population");
  const inflation = file("inflation");
  const growth = file("gdp-growth");
  const reserves = file("reserves");

  const total = (f: typeof gdp, label: string, href: string, fmt: (n: number) => string) => {
    const t = f ? coveredTotal(f) : null;
    return t ? { label: `${label} · ${t.year}`, value: fmt(t.sum), href, note: `${t.reporting} of 54 reporting` } : null;
  };
  const headline = [
    total(gdp, "Africa GDP", "/data/gdp", usd),
    pop ? total(pop, "Population", "/data/population", (n) => formatValue(pop.def, n)) : null,
    inflation
      ? { label: "Median inflation", value: formatValue(inflation.def, continentalMedian(inflation) ?? 0), href: "/data/inflation", note: "latest print per country" }
      : null,
    total(fdi, "FDI inflows", "/data/fdi", usd),
    total(remit, "Remittances", "/data/remittances", usd),
    projects.length ? { label: "World Bank book", value: usd(sumAmounts(projects)), href: "/capital", note: `${projects.length} projects, pipeline + recent` } : null,
  ].filter((item): item is { label: string; value: string; href: string; note: string } => item !== null);

  const pipeline = projects.filter((project) => project.status === "Pipeline").slice(0, 8);
  const fastest = growth ? ranked(growth, 1).slice(0, 8) : [];
  const hottest = inflation ? ranked(inflation, 1).slice(0, 8) : [];
  const thinnest = reserves ? [...ranked(reserves, 2)].reverse().slice(0, 8) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Kicker>{site.tagline}</Kicker>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            One desk for Africa’s markets, economies and capital.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">{site.promise}</p>
        </div>
        <dl className="grid grid-cols-3 gap-px bg-rule text-center lg:col-span-4">
          {[
            { k: "Economies", v: "54" },
            { k: "Publishers on the wire", v: String(publishersLive(wire) || "—") },
            { k: "Headlines, 10 days", v: String(wire.length || "—") },
          ].map((item) => (
            <div key={item.k} className="bg-paper px-2 py-3">
              <dd className="font-serif text-2xl text-ink">{item.v}</dd>
              <dt className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{item.k}</dt>
            </div>
          ))}
        </dl>
      </section>

      {headline.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 lg:grid-cols-6">
          {headline.map((item) => (
            <Link key={item.label} href={item.href} className="bg-paper-2 px-4 py-4 hover:bg-paper-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{item.label}</p>
              <p className="mt-1 font-serif text-2xl tracking-[-0.02em] text-ink">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-muted">{item.note}</p>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionTitle kicker="The Wire" title="Latest from African business media" href="/news" hrefLabel="All headlines →" />
          <WireList items={wire.slice(0, 14)} now={now} />
        </div>
        <aside className="space-y-10 lg:col-span-5">
          <div>
            <SectionTitle kicker="Markets" title="US dollar reference" href="/markets" />
            {fx ? (
              <>
                <table className="data-table mt-2">
                  <tbody>
                    {tapeCodes.flatMap((code) => {
                      const rate = fx.rates[code];
                      if (rate == null) return [];
                      return [
                        <tr key={code}>
                          <td>
                            <Link href={pairHref(code)} className="font-mono text-xs hover:text-forest">
                              USD/{code}
                            </Link>
                          </td>
                          <td className="text-right font-mono text-sm">{formatFx(rate)}</td>
                        </tr>,
                      ];
                    })}
                  </tbody>
                </table>
                <SourceLine name={fx.sourceName} href="https://www.exchangerate-api.com/" detail={`mid-market · ${fx.updated.replace(/ \+0000$/, " UTC")}`} />
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">The rate feed did not respond this hour.</p>
            )}
          </div>
          <div>
            <SectionTitle kicker="Signals" title="What moved on the latest print" href="/signals" />
            <ul className="mt-2 divide-y divide-rule">
              {signals.slice(0, 6).map((signal) => (
                <li key={signal.id} className="py-3">
                  <Link href={`/data/${signal.def.slug}`} className="text-[15px] leading-snug text-ink hover:text-forest">
                    {signal.headline}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-soft">{signal.detail}</p>
                </li>
              ))}
              {signals.length === 0 ? <li className="py-3 text-sm text-muted">Signals appear when the next annual prints load.</li> : null}
            </ul>
          </div>
        </aside>
      </section>

      <section className="mt-16">
        <SectionTitle
          kicker="Capital"
          title="Development finance heading to African boards"
          href="/capital"
          hrefLabel="Full pipeline →"
          note="World Bank Group projects in the pipeline, with expected Board dates and commitments as published."
        />
        <div className="mt-4">
          <ProjectTable projects={pipeline} />
        </div>
        <SourceLine name={projectsSource.name} href={projectsSource.url} />
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-3">
        {[
          { title: "Fastest-growing economies", def: getIndicatorDef("gdp-growth")!, rows: fastest, href: "/data/gdp-growth" },
          { title: "Highest inflation", def: getIndicatorDef("inflation")!, rows: hottest, href: "/data/inflation" },
          { title: "Thinnest import cover", def: getIndicatorDef("reserves")!, rows: thinnest, href: "/data/reserves" },
        ].map((panel) => (
          <div key={panel.title}>
            <SectionTitle kicker="League table" title={panel.title} href={panel.href} />
            <div className="mt-4">
              {panel.rows.length ? <RankBars def={panel.def} readings={panel.rows} /> : <p className="text-sm text-muted">Series did not load this hour.</p>}
            </div>
            <SourceLine name="World Bank Open Data" href={`https://data.worldbank.org/indicator/${panel.def.code}`} detail={panel.def.unit} />
          </div>
        ))}
      </section>

      <section className="mt-16">
        <SectionTitle kicker="Countries" title="Fifty-four country files" href="/countries" hrefLabel="All countries →" />
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {regions.map((region) => (
            <div key={region}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{region}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {countries
                  .filter((country) => country.region === region)
                  .map((country) => (
                    <li key={country.slug}>
                      <Link href={`/countries/${country.slug}`} className="text-ink-soft hover:text-forest">
                        {country.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {articles.length > 0 ? (
        <section className="mt-16">
          <SectionTitle kicker="Analysis" title="From the Afronomics desk" href="/brief" />
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <article key={`${article.category}-${article.slug}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {categoryLabel(article.category)} · {formatDate(article.date)}
                </p>
                <h3 className="mt-2 font-serif text-xl leading-snug">
                  <Link href={articleHref(article.category, article.slug)} className="hover:text-forest">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">{article.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <NewsletterBand />
    </div>
  );
}
