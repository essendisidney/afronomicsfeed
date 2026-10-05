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
import { latestByTenor, loadTbills, tenorLabel, tenors } from "@/lib/data/kenya-tbills";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { billMarkets, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";

const boardDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

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
  const tbills = latestByTenor(loadTbills().rows);

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
  // A feed that fails this hour gives no median; show nothing rather than a 0.0% that reads as a real print.
  const medianInflation = inflation ? continentalMedian(inflation) : null;
  const headline = [
    total(gdp, "Africa GDP", "/data/gdp", usd),
    pop ? total(pop, "Population", "/data/population", (n) => formatValue(pop.def, n)) : null,
    inflation && medianInflation != null
      ? { label: "Median inflation", value: formatValue(inflation.def, medianInflation), href: "/data/inflation", note: "latest print per country" }
      : null,
    total(fdi, "FDI inflows", "/data/fdi", usd),
    total(remit, "Remittances", "/data/remittances", usd),
    projects.length ? { label: "World Bank book", value: usd(sumAmounts(projects)), href: "/capital", note: `${projects.length} projects, pipeline + recent` } : null,
  ].filter((item): item is { label: string; value: string; href: string; note: string } => item !== null);

  const pipeline = projects.filter((project) => project.status === "Pipeline").slice(0, 8);
  const fastest = growth ? ranked(growth, 1).slice(0, 8) : [];
  const hottest = inflation ? ranked(inflation, 1).slice(0, 8) : [];
  const thinnest = reserves ? [...ranked(reserves, 2)].reverse().slice(0, 8) : [];

  const board = billMarkets.flatMap((market) => {
    const item = latestBills(loadBillMarket(market.slug).rows).get(364);
    if (!item) return [];
    const bps = item.previous ? Math.round((item.latest.rate - item.previous.rate) * 100) : null;
    return [{ market, rate: item.latest.rate, bps, date: item.latest.date }];
  })
    // the six markets that auctioned most recently
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const boardFx = fx ? (["KES", "NGN", "ZAR", "GHS", "EGP"] as const).flatMap((code) => (fx.rates[code] == null ? [] : [{ code, rate: fx.rates[code] }])) : [];

  return (
    <>
      <section className="on-night bg-night text-night-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-6 lg:pt-4">
            <p className="text-[14px] font-medium text-accent">{site.tagline}</p>
            <h1 className="mt-4 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
              What money costs in Africa, from the source, for everyone.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-night-soft">{site.promise}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/markets/tbills" className="rounded-full bg-accent px-5 py-2.5 text-[15px] font-semibold text-night hover:bg-gold-soft">
                Open the T-bill monitor
              </Link>
              <Link href="/rates/kenya/check" className="rounded-full border border-night-line px-5 py-2.5 text-[15px] font-medium text-night-ink hover:border-night-soft/50 hover:bg-night-2">
                Is my rate fair?
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 sm:gap-8">
              {[
                { k: "economies covered", v: 54 },
                { k: "publishers on the wire", v: publishersLive(wire) },
                { k: "headlines in 10 days", v: wire.length },
              ]
                // the wire counts are zero only when every feed failed this hour; hide them rather than show a dash
                .filter((item) => item.v > 0)
                .map((item) => (
                <div key={item.k} className="flex flex-col-reverse">
                  <dt className="text-[13px] text-night-muted">{item.k}</dt>
                  <dd className="af-board-figure text-3xl">{String(item.v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-night-line bg-night-2 p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex items-baseline justify-between px-4 pb-3 pt-3">
                <h2 className="text-[15px] font-semibold">Latest 364-day bill auctions</h2>
                <Link href="/markets/tbills" className="text-[13px] text-night-muted hover:text-night-ink">
                  All ten markets
                </Link>
              </div>
              <table className="w-full border-separate border-spacing-y-1 text-left">
                <thead className="sr-only">
                  <tr>
                    <th>Market</th>
                    <th>Rate</th>
                    <th>Change since previous auction</th>
                    <th>Auction</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((row, i) => (
                    <tr key={row.market.slug} className="af-board-row" style={{ "--i": i } as React.CSSProperties}>
                      <td className="rounded-l-2xl bg-night py-3 pl-4">
                        <Link href={row.market.href} className="flex items-center gap-3 hover:text-accent">
                          <span className="grid h-8 w-10 place-items-center rounded-lg bg-night-2 text-[12px] font-semibold tracking-wide text-night-soft">
                            {row.market.iso}
                          </span>
                          <span className="text-[15px] font-medium">{row.market.country}</span>
                        </Link>
                      </td>
                      <td className="af-board-figure bg-night py-3 text-right text-[26px] sm:text-3xl">{row.rate.toFixed(2)}%</td>
                      <td
                        className={`bg-night py-3 pl-4 text-right text-[13px] font-medium tabular-nums ${
                          row.bps == null || row.bps === 0 ? "text-night-muted" : row.bps > 0 ? "text-[#ff8a7a]" : "text-[#5cd6a8]"
                        }`}
                      >
                        {row.bps == null ? "" : row.bps === 0 ? "unch." : `${row.bps > 0 ? "+" : "−"}${Math.abs(row.bps)} bp`}
                      </td>
                      <td className="hidden rounded-r-2xl bg-night py-3 pl-4 pr-4 text-right text-[13px] text-night-muted sm:table-cell">
                        {boardDate.format(new Date(row.date))}
                      </td>
                      <td className="rounded-r-2xl bg-night pr-3 sm:hidden" />
                    </tr>
                  ))}
                </tbody>
              </table>
              {boardFx.length ? (
                <div className="mt-1 grid grid-cols-5 gap-1">
                  {boardFx.map((item) => (
                    <Link key={item.code} href={pairHref(item.code)} className="rounded-2xl bg-night px-2 py-3 text-center hover:bg-night/60 sm:px-3">
                      <span className="block text-[12px] text-night-muted">USD/{item.code}</span>
                      <span className="af-board-figure mt-0.5 block text-lg sm:text-xl">{formatFx(item.rate)}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              <p className="px-4 pb-2 pt-3 text-[12px] leading-5 text-night-muted">
                Central-bank auction results, compiled by Afronomics. Dollar rates are the daily mid-market reference.
              </p>
            </div>
          </div>
        </div>
      </section>

    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {headline.length > 0 ? (
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-6">
          {headline.map((item) => (
            <Link key={item.label} href={item.href} className="bg-surface px-4 py-4 hover:bg-paper-2">
              <p className="text-[12px] font-medium text-muted">{item.label}</p>
              <p className="mt-1 font-serif text-[1.7rem] leading-tight text-ink">{item.value}</p>
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
          {tbills.size > 0 ? (
            <div>
              <SectionTitle kicker="Afronomics dataset" title="Kenya T-bill auctions" href="/markets/kenya-tbills" hrefLabel="History →" />
              <div className="mt-3 grid grid-cols-3 gap-px bg-rule">
                {tenors.map((tenor) => {
                  const item = tbills.get(tenor);
                  const delta = item?.previous ? Math.round((item.latest.weighted_avg_rate - item.previous.weighted_avg_rate) * 100) : null;
                  return (
                    <Link key={tenor} href="/markets/kenya-tbills" className="bg-paper-2 px-3 py-3 hover:bg-paper-3">
                      <p className="font-medium text-[12px] text-muted">{tenorLabel[tenor]}</p>
                      <p className="mt-1 font-serif text-xl text-ink">{item ? `${item.latest.weighted_avg_rate.toFixed(2)}%` : "—"}</p>
                      <p className="text-[11px] text-muted">{delta == null ? "" : `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${Math.abs(delta)} bps`}</p>
                    </Link>
                  );
                })}
              </div>
              <SourceLine name="Central Bank of Kenya" href="https://www.centralbank.go.ke/bills-bonds/treasury-bills/" detail="latest auction, weighted average of accepted bids" />
              <p className="mt-2 flex flex-wrap gap-x-4 text-[12px] font-semibold">
                {tbills.get(91) ? (
                  <Link href={`/markets/kenya-tbills/${tbills.get(91)!.latest.value_date}`} className="text-forest hover:text-gold">
                    Latest auction report →
                  </Link>
                ) : null}
                <Link href="/markets/kenya-bonds" className="text-forest hover:text-gold">Bond yield curve →</Link>
                <Link href="/markets/tbills" className="text-forest hover:text-gold">Africa T-bill monitor →</Link>
                <Link href="/widgets" className="text-forest hover:text-gold">Put these rates on your site →</Link>
              </p>
            </div>
          ) : null}
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
              <p className="text-[13px] font-semibold text-ink">{region}</p>
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
                <p className="font-medium text-[12px] text-muted">
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
    </>
  );
}
