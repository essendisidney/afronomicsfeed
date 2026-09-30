import { renderTime } from "@/lib/data/fetcher";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { WireList } from "@/components/data/WireList";
import { SectionTitle } from "@/components/data/parts";
import { feeds, loadWire, publishersLive, wireFor, type WireDesk } from "@/lib/data/wire";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "The Wire — African business, markets and tech headlines",
  description: "Live headlines from African business, markets, technology and energy publishers, tagged by country and desk and refreshed every 15 minutes.",
  alternates: { canonical: `${site.url}/news` },
};

const desks: Array<{ desk: WireDesk; label: string }> = [
  { desk: "markets", label: "Markets" },
  { desk: "economy", label: "Economy & policy" },
  { desk: "capital", label: "Deals & capital" },
  { desk: "technology", label: "Technology" },
  { desk: "climate", label: "Energy & climate" },
  { desk: "trade", label: "Trade & logistics" },
];

export default async function NewsPage() {
  const now = renderTime();
  const wire = await loadWire();
  const countryCounts = new Map<string, { name: string; slug: string; count: number }>();
  for (const item of wire) {
    for (const country of item.countries) {
      const row = countryCounts.get(country.slug) ?? { name: country.name, slug: country.slug, count: 0 };
      row.count += 1;
      countryCounts.set(country.slug, row);
    }
  }
  const topCountries = [...countryCounts.values()].sort((a, b) => b.count - a.count).slice(0, 16);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "The Wire" }]}
      kicker="The Wire"
      title="Africa’s business news, one feed"
      lede={
        <p>
          {wire.length} headlines in the last ten days from {publishersLive(wire)} of {feeds.length} publishers, tagged by country and desk.
          Headlines link to the publisher; read the story there.
        </p>
      }
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="Latest" title="All desks" />
          <WireList items={wire.slice(0, 40)} now={now} showSummary />
        </section>
        <aside className="space-y-10 lg:col-span-5">
          <div>
            <SectionTitle kicker="In the news" title="Most-covered countries" />
            <ul className="mt-3 flex flex-wrap gap-2">
              {topCountries.map((row) => (
                <li key={row.slug}>
                  <Link href={`/countries/${row.slug}#news`} className="inline-block border border-rule px-2.5 py-1 text-sm hover:border-gold">
                    {row.name} <span className="font-mono text-[10px] text-muted">{row.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {desks.map(({ desk, label }) => (
            <div key={desk}>
              <SectionTitle kicker="Desk" title={label} />
              <WireList items={wireFor(wire, { desk }, 5)} now={now} compact />
            </div>
          ))}
          <div>
            <SectionTitle kicker="Publishers" title="On the wire" />
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {feeds.map((feed) => (
                <li key={feed.url}>
                  <a href={feed.home} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-forest">
                    {feed.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
