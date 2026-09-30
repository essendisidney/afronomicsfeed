import { renderTime } from "@/lib/data/fetcher";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { ProjectTable } from "@/components/data/ProjectTable";
import { WireList } from "@/components/data/WireList";
import { Kicker, SectionTitle, SourceLine, StatTile, usd } from "@/components/data/parts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getAllArticles } from "@/lib/content";
import { countries, getCountry } from "@/lib/data/countries";
import { currencyName, formatFx, loadFxQuote, pairHref } from "@/lib/data/fx";
import { deskLabels, formatValue, indicatorDefs, type Desk } from "@/lib/data/indicators";
import { officialSources } from "@/lib/data/official";
import { loadCountryProjects, projectsSource, sumAmounts } from "@/lib/data/projects";
import { loadIndicators, ranked, readingFor } from "@/lib/data/series";
import { loadCountryWire, loadWire } from "@/lib/data/wire";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return countries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  const title = `${country.name} economy, markets and data`;
  const description = `${country.name}: GDP, growth, inflation, debt, FDI, remittances, ${country.currency} exchange rate, World Bank projects and the latest business headlines — every figure sourced.`;
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/countries/${country.slug}` },
    openGraph: { title: `${country.name} — Afronomics`, description },
  };
}

const deskOrder: Desk[] = ["economy", "debt", "capital", "trade", "technology", "climate"];

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  const now = renderTime();
  const [files, projects, wire, fx] = await Promise.all([
    loadIndicators(),
    loadCountryProjects(country.iso, 30),
    loadWire(),
    loadFxQuote(),
  ]);

  const readings = files.map((file) => {
    const reading = readingFor(file, country.iso);
    const table = ranked(file, 3);
    const position = table.findIndex((row) => row.country.iso === country.iso);
    return { file, reading, rank: position >= 0 ? { position: position + 1, of: table.length } : null };
  });
  const published = readings.filter((item) => item.reading).length;

  const pipeline = projects.filter((project) => project.status === "Pipeline");
  const active = projects.filter((project) => project.status === "Active");
  const headlines = await loadCountryWire(country, wire, 12);
  const rate = fx?.rates[country.currency];
  const official = officialSources(country);
  const peers = countries.filter((item) => item.region === country.region && item.slug !== country.slug);
  const analysis = country.iso === "KE" ? getAllArticles().slice(0, 4) : [];

  const get = (slug: string) => readings.find((item) => item.file.def.slug === slug)?.reading ?? null;
  const gdp = get("gdp");
  const growth = get("gdp-growth");
  const inflation = get("inflation");
  const summary = [
    gdp ? `a ${formatValue(gdp.def, gdp.value)} economy (${gdp.year})` : null,
    growth ? `growing ${formatValue(growth.def, growth.value)} in real terms` : null,
    inflation ? `with consumer inflation at ${formatValue(inflation.def, inflation.value)}` : null,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${country.name} economic indicators`,
    description: `Annual macroeconomic, financial, trade, technology and climate indicators for ${country.name}, compiled from World Bank Open Data.`,
    url: `${site.url}/countries/${country.slug}`,
    spatialCoverage: country.name,
    creator: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: "https://data.worldbank.org/",
    license: "https://datacatalog.worldbank.org/public-licenses#cc-by",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/countries", label: "Countries" }, { label: country.name }]} />

      <header className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Kicker>
            {country.region} · {country.iso} · {country.currency}
          </Kicker>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">{country.name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            {summary.length ? `${country.name} is ${summary.join(", ")}.` : `The ${country.name} file: data, capital flows and headlines.`}{" "}
            {published} of {indicatorDefs.length} tracked series are published for this country.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-rule lg:col-span-4">
          <Link href={pairHref(country.currency)} className="bg-paper-2 px-4 py-4 hover:bg-paper-3">
            <p className="font-medium text-[12px] text-muted">USD/{country.currency}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{rate ? formatFx(rate) : "—"}</p>
            <p className="text-[11px] text-muted">{currencyName(country.currency)}</p>
          </Link>
          <a href="#capital" className="bg-paper-2 px-4 py-4 hover:bg-paper-3">
            <p className="font-medium text-[12px] text-muted">WB pipeline</p>
            <p className="mt-1 font-serif text-2xl text-ink">{pipeline.length ? usd(sumAmounts(pipeline)) : "—"}</p>
            <p className="text-[11px] text-muted">{pipeline.length} project{pipeline.length === 1 ? "" : "s"} to the Board</p>
          </a>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-rule py-2.5 font-medium text-[12px]">
        {[
          ["#data", "Data"],
          ["#news", "Headlines"],
          ["#capital", "DFI capital"],
          ["#sources", "Official sources"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="text-forest hover:text-gold">
            {label}
          </a>
        ))}
        {country.iso === "KE" ? (
          <Link href="/markets/kenya-tbills" className="text-gold hover:text-forest">
            T-bill auctions dataset →
          </Link>
        ) : null}
      </nav>

      <section id="data" className="mt-10 space-y-10">
        {deskOrder.map((desk) => {
          const items = readings.filter((item) => item.file.def.desk === desk);
          return (
            <div key={desk}>
              <SectionTitle kicker="Data" title={deskLabels[desk]} />
              <div className="mt-4 grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
                {items.map(({ file, reading, rank }) => (
                  <div key={file.def.slug} className="relative">
                    <StatTile def={file.def} reading={reading} href={`/data/${file.def.slug}#${country.iso.toLowerCase()}`} />
                    {rank ? (
                      <span className="pointer-events-none absolute right-3 top-4 font-medium text-[12px] text-muted">
                        #{rank.position} of {rank.of}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <SourceLine
          name="World Bank Open Data"
          href={`https://data.worldbank.org/country/${country.iso}`}
          detail="World Development Indicators & International Debt Statistics · rank among African countries with a recent print"
        />
      </section>

      <section id="news" className="mt-16 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionTitle kicker="The Wire" title={`${country.name} headlines`} href="/news" hrefLabel="All headlines →" />
          <WireList items={headlines} now={now} showSummary />
        </div>
        <aside className="lg:col-span-5">
          <SectionTitle kicker="Directory" title="Official sources" />
          <ul id="sources" className="mt-3 divide-y divide-rule">
            {official.map((item) => (
              <li key={item.href} className="flex items-baseline justify-between gap-3 py-2.5">
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-forest">
                  {item.name}
                </a>
                <span className="font-medium text-[12px] text-muted">{item.kind}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-3 py-2.5">
              <a href={`https://data.worldbank.org/country/${country.iso}`} target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-forest">
                World Bank country data
              </a>
              <span className="font-medium text-[12px] text-muted">Multilateral</span>
            </li>
            <li className="flex items-baseline justify-between gap-3 py-2.5">
              <a href={`https://www.imf.org/en/Countries/${country.iso}`} target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-forest">
                IMF country page
              </a>
              <span className="font-medium text-[12px] text-muted">Multilateral</span>
            </li>
          </ul>
          {analysis.length > 0 ? (
            <div className="mt-10">
              <SectionTitle kicker="Analysis" title={`${country.name} desk`} href="/brief" />
              <ul className="mt-2 divide-y divide-rule">
                {analysis.map((article) => (
                  <li key={article.slug} className="py-3">
                    <p className="font-medium text-[12px] text-muted">
                      {categoryLabel(article.category)} · {formatDate(article.date)}
                    </p>
                    <Link href={articleHref(article.category, article.slug)} className="mt-1 block font-serif text-lg leading-snug hover:text-forest">
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </section>

      <section id="capital" className="mt-16">
        <SectionTitle
          kicker="Capital"
          title={`World Bank lending to ${country.name}`}
          note={`${pipeline.length} in the pipeline · ${active.length} active · commitments as published by the Bank.`}
        />
        <div className="mt-4">
          <ProjectTable projects={[...pipeline, ...active].slice(0, 20)} showCountry={false} />
        </div>
        <SourceLine name={projectsSource.name} href={`https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=${country.iso}`} />
      </section>

      <section className="mt-16">
        <SectionTitle kicker="Compare" title={`${country.region} peers`} />
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {peers.map((peer) => (
            <li key={peer.slug}>
              <Link href={`/countries/${peer.slug}`} className="text-forest hover:text-gold">
                {peer.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NewsletterBand lede={`Get ${country.name} and 53 other economies in one Monday email: the prints that moved, new DFI approvals, and what to watch.`} />
    </div>
  );
}
