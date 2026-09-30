import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, SourceLine } from "@/components/data/parts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { countries } from "@/lib/data/countries";
import { formatFx, loadFxQuote } from "@/lib/data/fx";
import { formatValue } from "@/lib/data/indicators";
import { loadIndicators, readingFor } from "@/lib/data/series";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All 54 African economies",
  description: "Every African country side by side: GDP, growth, inflation, GDP per capita, external debt and exchange rates, with a full file for each.",
  alternates: { canonical: `${site.url}/countries` },
};

const regions = ["North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa"] as const;
const columns = ["gdp", "gdp-growth", "inflation", "gdp-per-capita", "external-debt"] as const;

export default async function CountriesPage() {
  const [files, fx] = await Promise.all([loadIndicators([...columns]), loadFxQuote()]);
  const fileFor = (slug: string) => files.find((file) => file.def.slug === slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Countries" }]} />
      <header className="mt-6 max-w-3xl">
        <Kicker>Country files</Kicker>
        <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">All 54 African economies</h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">
          Latest published figure for each country, the live US dollar reference, and a full file behind every name: 22 series with
          history, World Bank lending, official sources and headlines.
        </p>
      </header>

      {regions.map((region) => (
        <section key={region} className="mt-12">
          <h2 className="border-b border-rule pb-2 font-serif text-2xl">{region}</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  {columns.map((slug) => (
                    <th key={slug} className="text-right">
                      {fileFor(slug)?.def.short ?? slug}
                    </th>
                  ))}
                  <th className="text-right">USD rate</th>
                </tr>
              </thead>
              <tbody>
                {countries
                  .filter((country) => country.region === region)
                  .map((country) => (
                    <tr key={country.slug}>
                      <td>
                        <Link href={`/countries/${country.slug}`} className="font-medium hover:text-forest">
                          {country.name}
                        </Link>
                      </td>
                      {columns.map((slug) => {
                        const file = fileFor(slug);
                        const reading = file ? readingFor(file, country.iso) : null;
                        return (
                          <td key={slug} className="text-right font-mono text-xs">
                            {reading && file ? (
                              <>
                                {formatValue(file.def, reading.value)}
                                <span className="text-muted"> ’{String(reading.year).slice(2)}</span>
                              </>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-right font-mono text-xs">
                        {fx?.rates[country.currency] ? `${formatFx(fx.rates[country.currency])} ${country.currency}` : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <SourceLine name="World Bank Open Data" href="https://data.worldbank.org/" detail="’YY marks the year of the latest print · FX: ExchangeRate-API mid-market" />
    </div>
  );
}
