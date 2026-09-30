import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { Sparkline } from "@/components/data/Sparkline";
import { IndicatorSource, SectionTitle, SourceLine } from "@/components/data/parts";
import { countries } from "@/lib/data/countries";
import { codeFromSlug, currencyName, formatFx, loadFxQuote, pairSlug } from "@/lib/data/fx";
import { formatChange } from "@/lib/data/indicators";
import { loadIndicator, readingFor } from "@/lib/data/series";
import { site } from "@/lib/site";

export const revalidate = 3600;

const codes = [...new Set(countries.map((country) => country.currency))];

export function generateStaticParams() {
  return codes.map((code) => ({ code: pairSlug(code) }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const currency = codeFromSlug(code);
  if (!currency || !codes.includes(currency)) return {};
  return {
    title: `USD/${currency} — ${currencyName(currency)} exchange rate`,
    description: `Live US dollar to ${currencyName(currency)} reference rate, annual official average since 2010, and a converter.`,
    alternates: { canonical: `${site.url}/markets/currencies/${pairSlug(currency)}` },
  };
}

export default async function CurrencyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const currency = codeFromSlug(code);
  if (!currency || !codes.includes(currency)) notFound();
  const [fx, official] = await Promise.all([loadFxQuote(), loadIndicator("fx-official")]);
  const holders = countries.filter((country) => country.currency === currency);
  const reading = official && holders[0] ? readingFor(official, holders[0].iso) : null;
  const rate = fx?.rates[currency];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: `USD/${currency}` }]}
      kicker={`Currency · ${currencyName(currency)}`}
      title={`USD/${currency}`}
      lede={
        <p>
          {rate ? `One US dollar buys ${formatFx(rate)} ${currency} at the latest mid-market reference.` : "The live reference did not respond this hour."}{" "}
          Legal tender in {holders.map((country) => country.name).join(", ")}.
        </p>
      }
    >
      <div className="grid gap-px bg-rule sm:grid-cols-3">
        <div className="bg-paper-2 px-5 py-5">
          <p className="font-medium text-[12px] text-muted">Live reference</p>
          <p className="mt-1 font-serif text-4xl text-ink">{rate ? formatFx(rate) : "—"}</p>
          <p className="text-[11px] text-muted">{fx ? fx.updated.replace(/ \+0000$/, " UTC") : ""}</p>
        </div>
        <div className="bg-paper-2 px-5 py-5">
          <p className="font-medium text-[12px] text-muted">Official average · {reading?.year ?? "—"}</p>
          <p className="mt-1 font-serif text-4xl text-ink">{reading ? formatFx(reading.value) : "—"}</p>
          <p className="text-[11px] text-muted">
            {reading?.previous ? `${formatChange({ format: "rate" }, reading.previous.value, reading.value)} vs ${reading.previous.year}` : ""}
          </p>
        </div>
        <div className="bg-paper-2 px-5 py-5">
          <p className="font-medium text-[12px] text-muted">Since 2010 (annual average)</p>
          {reading ? <Sparkline points={reading.points} format={formatFx} label={`USD/${currency}`} /> : <p className="mt-2 text-sm text-muted">—</p>}
        </div>
      </div>
      {fx ? <SourceLine name={fx.sourceName} href="https://www.exchangerate-api.com/" detail="mid-market reference, not a dealing rate" /> : null}
      {official ? <IndicatorSource def={official.def} iso={holders[0]?.iso} /> : null}

      <section className="mt-12">
        <SectionTitle kicker="Countries" title={`Where the ${currencyName(currency)} is used`} />
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {holders.map((country) => (
            <li key={country.slug}>
              <Link href={`/countries/${country.slug}`} className="text-forest hover:text-gold">
                {country.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
