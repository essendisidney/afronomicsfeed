import { renderTime } from "@/lib/data/fetcher";
import type { Metadata } from "next";
import Link from "next/link";
import { CurrencyConverter } from "@/components/markets/CurrencyConverter";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { WireList } from "@/components/data/WireList";
import { IndicatorSource, RankBars, SectionTitle, SourceLine } from "@/components/data/parts";
import { countries } from "@/lib/data/countries";
import { currencyName, formatFx, loadFxQuote, pairHref } from "@/lib/data/fx";
import { formatChange } from "@/lib/data/indicators";
import { loadIndicators, ranked, readingFor } from "@/lib/data/series";
import { loadWire, wireFor } from "@/lib/data/wire";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "African currencies and markets",
  description: "Live US dollar reference rates for every African currency, a converter, annual depreciation against the dollar, lending rates, and the day’s markets headlines.",
  alternates: { canonical: `${site.url}/markets` },
};

export default async function MarketsPage() {
  const now = renderTime();
  const [fx, files, wire] = await Promise.all([loadFxQuote(), loadIndicators(["fx-official", "lending-rate", "reserves"]), loadWire()]);
  const official = files.find((file) => file.def.slug === "fx-official");
  const lending = files.find((file) => file.def.slug === "lending-rate");
  const reserves = files.find((file) => file.def.slug === "reserves");
  const currencies = [...new Set(countries.map((country) => country.currency))];
  const users = (code: string) => countries.filter((country) => country.currency === code);
  const headlines = wireFor(wire, { desk: "markets" }, 14);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Markets" }]}
      kicker="Markets"
      title="Every African currency against the dollar"
      lede={<p>Hourly mid-market reference for all African currencies, with the annual official average and how far each moved on the year.</p>}
    >
      {fx ? <CurrencyConverter quote={fx} /> : null}

      <section>
        <SectionTitle kicker="FX" title="US dollar reference rates" note="Units of local currency per US$1. Annual change uses the official period-average rate." />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Currency</th>
                <th>Used in</th>
                <th className="text-right">Live reference</th>
                <th className="text-right">Official avg (latest year)</th>
                <th className="text-right">Change on year</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((code) => {
                const rate = fx?.rates[code];
                const holder = users(code)[0];
                const reading = official && holder ? readingFor(official, holder.iso) : null;
                return (
                  <tr key={code}>
                    <td>
                      <Link href={pairHref(code)} className="font-mono text-xs hover:text-forest">
                        USD/{code}
                      </Link>
                    </td>
                    <td className="text-sm">{currencyName(code)}</td>
                    <td className="max-w-xs text-xs text-ink-soft">
                      {users(code)
                        .map((country) => country.name)
                        .join(", ")}
                    </td>
                    <td className="text-right font-mono text-sm">{rate ? formatFx(rate) : "—"}</td>
                    <td className="text-right font-mono text-xs">
                      {reading ? (
                        <>
                          {formatFx(reading.value)} <span className="text-muted">’{String(reading.year).slice(2)}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right font-mono text-xs">
                      {reading?.previous ? formatChange({ format: "rate" }, reading.previous.value, reading.value) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {fx ? <SourceLine name={fx.sourceName} href="https://www.exchangerate-api.com/" detail={`mid-market, not a dealing rate · ${fx.updated.replace(/ \+0000$/, " UTC")}`} /> : null}
        {official ? <IndicatorSource def={official.def} /> : null}
      </section>

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="The Wire" title="Markets headlines" href="/news" hrefLabel="All headlines →" />
          <WireList items={headlines} now={now} showSummary />
        </section>
        <aside className="space-y-10 lg:col-span-5">
          {lending ? (
            <div>
              <SectionTitle kicker="Rates" title="Highest bank lending rates" href="/data/lending-rate" />
              <div className="mt-4">
                <RankBars def={lending.def} readings={ranked(lending, 2)} limit={8} />
              </div>
              <IndicatorSource def={lending.def} />
            </div>
          ) : null}
          {reserves ? (
            <div>
              <SectionTitle kicker="Reserves" title="Thinnest import cover" href="/data/reserves" />
              <div className="mt-4">
                <RankBars def={reserves.def} readings={[...ranked(reserves, 2)].reverse()} limit={8} />
              </div>
              <IndicatorSource def={reserves.def} />
            </div>
          ) : null}
        </aside>
      </div>

      <NewsletterBand />
    </PageShell>
  );
}
