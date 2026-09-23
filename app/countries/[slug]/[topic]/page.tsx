import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountrySeriesNav } from "@/components/countries/CountrySeriesNav";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import {
  countryDoors,
  countrySeries,
  countrySeriesParams,
  currencyFileHref,
  getCountrySeries,
  regionalPeers,
} from "@/lib/demo/country-series";
import { getCountry } from "@/lib/demo/countries";
import { getIndicator } from "@/lib/demo/indicators";
import { getAllArticles, getArticlesByTopic, toIndexItem } from "@/lib/content";
import { site } from "@/lib/site";
import { getTopic } from "@/lib/taxonomy";

export function generateStaticParams() {
  return countrySeriesParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}): Promise<Metadata> {
  const { slug, topic } = await params;
  const country = getCountry(slug);
  const series = getCountrySeries(topic);
  if (!country || !series) return {};
  return {
    title: `${country.name} ${series.name}`,
    description: `${country.name} ${series.name.toLowerCase()} file. ${series.lede}`,
    alternates: { canonical: `${site.url}/countries/${country.slug}/${series.slug}` },
    openGraph: {
      title: `${country.name} ${series.name} — Afronomics`,
      description: series.lede,
    },
  };
}

export default async function CountrySeriesPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic } = await params;
  const country = getCountry(slug);
  const series = getCountrySeries(topic);
  if (!country || !series) notFound();

  const doors = countryDoors(country);
  const fx = currencyFileHref(country.currency);
  const peers = regionalPeers(country);
  const deskRaw =
    country.slug === "kenya"
      ? series.deskTopics.length > 0
        ? series.deskTopics.flatMap((deskTopic) => getArticlesByTopic(deskTopic))
        : series.slug === "pulse" || series.slug === "economy"
          ? getAllArticles()
          : []
      : [];
  const desk = deskRaw
    .filter((article, index, all) => all.findIndex((item) => item.category === article.category && item.slug === article.slug) === index)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${country.name} ${series.name}`,
    url: `${site.url}/countries/${country.slug}/${series.slug}`,
    isPartOf: `${site.url}/countries/${country.slug}`,
  };

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/countries", label: "Countries" },
        { href: `/countries/${country.slug}`, label: country.name },
        { label: series.name },
      ]}
      kicker={`${country.iso} · ${series.name}`}
      title={`${country.name} ${series.name.toLowerCase()}`}
      lede={series.lede}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CountrySeriesNav countrySlug={country.slug} active={series.slug} />

      <section className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-serif text-2xl">What this file watches</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {series.watches.map((watch) => (
              <EmptyMetric key={watch} label={watch} />
            ))}
          </div>
          {series.indicators.length > 0 ? (
            <ul className="mt-5 space-y-1.5 text-sm text-ink-soft">
              {series.indicators.map((indicatorSlug) => {
                const indicator = getIndicator(indicatorSlug);
                if (!indicator) return null;
                return (
                  <li key={indicator.slug}>
                    <Link href={`/indicators/${indicator.slug}`} className="text-forest underline underline-offset-2">
                      {indicator.name}
                    </Link>
                    <span className="text-muted"> — {indicator.note}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <aside className="lg:col-span-5">
          <h2 className="font-serif text-2xl">Official doors</h2>
          {doors.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {doors.map((door) => (
                <li key={door.href}>
                  <a
                    href={door.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest underline underline-offset-2"
                  >
                    {door.label}
                  </a>
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{door.kind}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No official door is linked for this state yet. Do not treat a remembered print as a fact.
            </p>
          )}
          {fx ? (
            <p className="mt-4 text-sm text-ink-soft">
              Currency file:{" "}
              <Link href={fx} className="text-forest underline underline-offset-2">
                USD/{country.currency}
              </Link>{" "}
              — demonstration print only.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">USD/{country.currency} is not on the demonstration tape.</p>
          )}
          {series.deskTopics.length > 0 && country.slug === "kenya" ? (
            <ul className="mt-5 space-y-1.5 text-sm text-ink-soft">
              {series.deskTopics.map((deskTopic) => {
                const topic = getTopic(deskTopic);
                if (!topic) return null;
                return (
                  <li key={topic.slug}>
                    Kenya desk:{" "}
                    <Link href={`/topics/${topic.slug}`} className="text-forest underline underline-offset-2">
                      {topic.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <Provenance source="No observation stored" methodology="Country series opens a file. It does not invent a print." />
        </aside>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Latest intelligence</h2>
        {desk.length > 0 ? (
          <div className="mt-6 space-y-10">
            {desk.map((article) => (
              <ArticleCard key={`${article.category}-${article.slug}`} article={toIndexItem(article)} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            {country.slug === "kenya"
              ? "This series has no tagged Kenya-desk note yet."
              : "No Kenya-desk-style file is attached to this terminal yet."}{" "}
            <Link href="/countries/kenya" className="text-forest underline underline-offset-2">
              See Kenya
            </Link>
            .
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">{country.region}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {peers.map((peer) => (
            <li key={peer.slug}>
              <Link href={`/countries/${peer.slug}/${series.slug}`} className="block border border-rule px-3 py-2 hover:border-gold">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {peer.iso} · {series.name}
                </p>
                <p className="mt-1 font-serif text-lg">{peer.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
