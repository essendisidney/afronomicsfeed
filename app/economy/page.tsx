import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { countries, featuredCountrySlugs, getCountry, indicatorSlots } from "@/lib/demo/countries";
import { indicators } from "@/lib/demo/indicators";
import { pulseComponents } from "@/lib/demo/pulse";

export const metadata: Metadata = {
  title: "Economy",
  description: "Africa economic intelligence — Pulse, indicators and country files. No invented scores.",
};

export default function EconomyPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Economy" }]}
      kicker="Economy"
      title="The macro file, not a scorecard theatre"
      lede="Growth, inflation, rates, debt, trade and FDI sit here once a primary series is stored. Afronomics Pulse remains methodology until then."
    >
      <section>
        <h2 className="font-serif text-2xl">Africa Pulse</h2>
        <div className="mt-4 grid grid-cols-2 gap-px bg-rule sm:grid-cols-5">
          {pulseComponents.map((item) => (
            <div key={item.key} className="bg-paper px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{item.label}</p>
              <p className="mt-1 font-serif text-2xl">{item.reading}</p>
              <p className="mt-1 text-[11px] text-muted">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Indicator doors</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {indicators.map((item) => (
            <li key={item.slug} className="border border-rule p-4">
              <Link href={`/indicators/${item.slug}`} className="font-serif text-xl hover:text-forest">
                {item.name}
              </Link>
              <p className="mt-2 text-sm text-ink-soft">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Featured files</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {featuredCountrySlugs.map((slug) => {
            const country = getCountry(slug);
            if (!country) return null;
            return (
              <article key={slug} className="border border-rule p-4">
                <p className="font-mono text-[10px] uppercase text-gold">{country.iso}</p>
                <h3 className="mt-1 font-serif text-2xl">
                  <Link href={`/economy/${slug}`} className="hover:text-forest">
                    {country.name}
                  </Link>
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {indicatorSlots.slice(0, 4).map((slot) => (
                    <EmptyMetric key={slot} label={slot} />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">All economy files</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <li key={country.slug}>
              <Link href={`/economy/${country.slug}`} className="block border border-rule px-3 py-3 hover:border-gold">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
                <p className="mt-1 font-serif text-lg">{country.name}</p>
                <p className="mt-1 text-xs text-muted">{country.currency} · no sourced print</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
