import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountrySeriesNav } from "@/components/countries/CountrySeriesNav";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { climateSlots } from "@/lib/demo/climate";
import { countryDoors, countrySeries, currencyFileHref, regionalPeers } from "@/lib/demo/country-series";
import { countries, getCountry, indicatorSlots, kenyaGraph } from "@/lib/demo/countries";
import { getAllArticles, toIndexItem } from "@/lib/content";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return countries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  return {
    title: `${country.name} intelligence`,
    description: `${country.name} Pulse, markets, capital, climate and policy file. Indicator cells unpublished until a primary series is stored.`,
    alternates: { canonical: `${site.url}/countries/${country.slug}` },
    openGraph: {
      title: `${country.name} — Afronomics`,
      description: `Country intelligence terminal for ${country.name}.`,
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  const kenyaFile = country.slug === "kenya" ? getAllArticles().slice(0, 4).map(toIndexItem) : [];
  const doors = countryDoors(country);
  const fx = currencyFileHref(country.currency);
  const peers = regionalPeers(country, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: country.name,
    identifier: country.iso,
    url: `${site.url}/countries/${country.slug}`,
  };

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/countries", label: "Countries" },
        { label: country.name },
      ]}
      kicker={`${country.region} · ${country.iso}`}
      title={`${country.name} intelligence`}
      lede={`Currency ${country.currency}. Sectors on the graph: ${country.sectors.join(", ")}. Pulse is not in production. Open a series file — do not treat an empty cell as a print.`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CountrySeriesNav countrySlug={country.slug} />

      <section id="series" className="mt-8">
        <h2 className="font-serif text-2xl">Series</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {countrySeries.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/countries/${country.slug}/${item.slug}`}
                className="block h-full border border-rule px-3 py-3 hover:border-gold"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.name}</p>
                <p className="mt-2 text-xs leading-5 text-ink-soft">{item.lede}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="pulse" className="mt-10">
        <h2 className="font-serif text-2xl">{country.name} Pulse</h2>
        <p className="mt-2 text-sm text-muted">Methodology under development. No country score is published.</p>
      </section>

      <section id="indicators" className="mt-10">
        <h2 className="font-serif text-2xl">Indicators</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {indicatorSlots.map((slot) => (
            <EmptyMetric key={slot} label={slot} />
          ))}
        </div>
      </section>

      <section id="climate" className="mt-10">
        <h2 className="font-serif text-2xl">{country.name} climate capital</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {climateSlots.map((slot) => (
            <EmptyMetric key={slot} label={slot} />
          ))}
        </div>
      </section>

      <section id="markets" className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Official doors</h2>
          {doors.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {doors.map((door) => (
                <li key={door.href}>
                  <a href={door.href} className="text-forest underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                    {door.label}
                  </a>
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{door.kind}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Official tape not linked yet.</p>
          )}
          {fx ? (
            <p className="mt-4 text-sm text-ink-soft">
              Currency file:{" "}
              <Link href={fx} className="text-forest underline underline-offset-2">
                USD/{country.currency}
              </Link>
            </p>
          ) : null}
          <Provenance source="Primary doors only" methodology="No live tape. No invented official print." />
        </div>
        <div>
          <h2 className="font-serif text-2xl">Graph</h2>
          {country.slug === "kenya" ? (
            <ul className="mt-4 space-y-1 font-mono text-[11px] text-ink-soft">
              {kenyaGraph.map((edge) => (
                <li key={`${edge.from}-${edge.to}`}>
                  {edge.from} → {edge.rel} → {edge.to}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Entity edges publish as articles and filings are tagged. Kenya is the first populated graph.
            </p>
          )}
        </div>
      </section>

      <section id="intelligence" className="mt-10">
        <h2 className="font-serif text-2xl">Latest intelligence</h2>
        {kenyaFile.length > 0 ? (
          <div className="mt-6 space-y-10">
            {kenyaFile.map((article) => (
              <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No Kenya-desk-style file is attached to this terminal yet.{" "}
            <Link href="/countries/kenya" className="text-forest underline underline-offset-2">
              See Kenya
            </Link>{" "}
            for the first populated country.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">{country.region}</h2>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {peers.map((peer) => (
            <li key={peer.slug}>
              <Link href={`/countries/${peer.slug}`} className="text-forest underline underline-offset-2">
                {peer.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
