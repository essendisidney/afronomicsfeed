import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SourceLine } from "@/components/data/parts";
import { deskLabels, formatValue, indicatorsForDesk, type Desk } from "@/lib/data/indicators";
import { continentalMedian, loadIndicators, ranked } from "@/lib/data/series";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Africa data hub",
  description: "22 economic, financial, trade, technology and climate indicators for all 54 African countries, ranked, with history since 2010 and free CSV downloads.",
  alternates: { canonical: `${site.url}/data` },
};

const desks: Desk[] = ["economy", "debt", "capital", "trade", "technology", "climate"];

export default async function DataHubPage() {
  const files = await loadIndicators();

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Data" }]}
      kicker="Data hub"
      title="Africa, in comparable numbers"
      lede={
        <p>
          {files.length} indicators across 54 economies, 2010 to the latest print. Each series opens a ranked table with history and a CSV you
          can cite. Values are published by the World Bank from national and international sources; we compile, rank and date them.
        </p>
      }
    >
      <section className="mb-12 border border-gold/40 bg-paper-2 px-5 py-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Afronomics datasets</p>
        <p className="mt-2 font-serif text-2xl">
          <Link href="/markets/kenya-tbills" className="hover:text-forest">
            Kenya Treasury bill auctions →
          </Link>
        </p>
        <p className="mt-1 text-sm text-ink-soft">Every Central Bank of Kenya auction result, read from the CBK’s notices into one table with a free CSV.</p>
      </section>
      <div className="space-y-12">
        {desks.map((desk) => (
          <section key={desk}>
            <h2 className="border-b border-rule pb-2 font-serif text-2xl">{deskLabels[desk]}</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Indicator</th>
                    <th className="text-right">Africa median</th>
                    <th>Highest</th>
                    <th>Lowest</th>
                    <th className="text-right">Countries</th>
                    <th className="text-right">Latest year</th>
                  </tr>
                </thead>
                <tbody>
                  {indicatorsForDesk(desk).map((def) => {
                    const file = files.find((item) => item.def.slug === def.slug);
                    const rows = file ? ranked(file) : [];
                    const median = file ? continentalMedian(file) : null;
                    const top = rows[0];
                    const bottom = rows.at(-1);
                    return (
                      <tr key={def.slug}>
                        <td>
                          <Link href={`/data/${def.slug}`} className="font-medium hover:text-forest">
                            {def.label}
                          </Link>
                        </td>
                        <td className="text-right font-mono text-xs">{median != null ? formatValue(def, median) : "—"}</td>
                        <td className="text-xs">{top ? `${top.country.name} · ${formatValue(def, top.value)}` : "—"}</td>
                        <td className="text-xs">{bottom ? `${bottom.country.name} · ${formatValue(def, bottom.value)}` : "—"}</td>
                        <td className="text-right font-mono text-xs">{rows.length || "—"}</td>
                        <td className="text-right font-mono text-xs">{file?.latestYear ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      <SourceLine name="World Bank Open Data" href="https://data.worldbank.org/" detail="Licence CC BY 4.0 · rankings use each country’s print from the last three years" />
    </PageShell>
  );
}
