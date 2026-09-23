import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountrySeriesNav } from "@/components/countries/CountrySeriesNav";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { agencyFileHref } from "@/lib/demo/agencies";
import { citiesInCountry } from "@/lib/demo/cities";
import { climateSlots } from "@/lib/demo/climate";
import { countryDoors, countrySeries, currencyFileHref, regionalPeers } from "@/lib/demo/country-series";
import { countries, getCountry, indicatorSlots } from "@/lib/demo/countries";
import { edgesForDesk, getGraphNode } from "@/lib/demo/graph";
import { industriesForCountry, industryFileHref } from "@/lib/demo/industries";
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
  const deskEdges = country.slug === "kenya" ? edgesForDesk("kenya") : [];

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

      <p className="mt-6 text-sm">
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          Economy file
        </Link>
        {" · "}
        <Link href={`/climate/${country.slug}`} className="text-forest underline underline-offset-2">
          Climate capital
        </Link>
        {" · "}
        <Link href={`/technology/fintech/${country.slug}`} className="text-forest underline underline-offset-2">
          Fintech
        </Link>
        {" · "}
        <Link href={`/projects/${country.slug}`} className="text-forest underline underline-offset-2">
          Project Lens
        </Link>
        {" · "}
        <Link href={agencyFileHref("central-bank", country.slug)} className="text-forest underline underline-offset-2">
          Central bank
        </Link>
        {industriesForCountry(country.slug)
          .slice(0, 2)
          .map((item) => (
            <span key={item.slug}>
              {" · "}
              <Link href={industryFileHref(item.slug, country.slug)} className="text-forest underline underline-offset-2">
                {item.label}
              </Link>
            </span>
          ))}
        {citiesInCountry(country.slug).map((city) => (
          <span key={city.slug}>
            {" · "}
            <Link href={`/cities/${city.slug}`} className="text-forest underline underline-offset-2">
              {city.name}
            </Link>
          </span>
        ))}
      </p>

      <section id="climate" className="mt-10">
        <h2 className="font-serif text-2xl">
          <Link href={`/climate/${country.slug}`} className="hover:text-forest">
            {country.name} climate capital
          </Link>
        </h2>
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
          {deskEdges.length > 0 ? (
            <>
              <ul className="mt-4 space-y-1 font-mono text-[11px] text-ink-soft">
                {deskEdges.slice(0, 8).map((edge) => {
                  const from = getGraphNode(edge.from);
                  const to = getGraphNode(edge.to);
                  return (
                    <li key={edge.id}>
                      {from?.label ?? edge.from} → {edge.rel} → {to?.label ?? edge.to}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-sm">
                <Link href="/graph/kenya" className="text-forest underline underline-offset-2">
                  Open Kenya graph desk
                </Link>
              </p>
            </>
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
