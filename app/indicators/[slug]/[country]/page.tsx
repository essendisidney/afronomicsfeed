import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { findPrint, formatPrint, loadPrints } from "@/lib/agents/worldbank";
import { getCountry } from "@/lib/demo/countries";
import { getIndicator, indicatorCountryParams, indicators } from "@/lib/demo/indicators";
import { site } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  return indicatorCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}): Promise<Metadata> {
  const { slug, country: countrySlug } = await params;
  const indicator = getIndicator(slug);
  const country = getCountry(countrySlug);
  if (!indicator || !country) return {};
  return {
    title: `${indicator.name} — ${country.name}`,
    description: `${indicator.name} file for ${country.name}. ${indicator.note}`,
    alternates: { canonical: `${site.url}/indicators/${indicator.slug}/${country.slug}` },
  };
}

export default async function IndicatorCountryPage({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}) {
  const { slug, country: countrySlug } = await params;
  const indicator = getIndicator(slug);
  const country = getCountry(countrySlug);
  if (!indicator || !country) notFound();

  const peers = indicators.filter((item) => item.slug !== indicator.slug);
  const print = indicator.slug === "policy-rate"
    ? undefined
    : findPrint(await loadPrints(), indicator.slug, country.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/data", label: "Data" },
        { href: `/indicators/${indicator.slug}`, label: indicator.name },
        { label: country.name },
      ]}
      kicker={`${indicator.name} · ${country.iso}`}
      title={`${indicator.name} in ${country.name}`}
      lede={
        print
          ? `${print.seriesName}. World Bank annual value for ${print.year}. This is a compiled series, not a same-day market print.`
          : `${indicator.unit}. ${indicator.note} This country cell is blank until a sourced observation is parsed.`
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {print ? (
          <>
            <div className="border border-rule bg-paper px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Latest print</p>
              <p className="mt-1 font-serif text-2xl text-ink">{formatPrint(print.value)}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">{print.unit}</p>
            </div>
            <div className="border border-rule bg-paper px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Period</p>
              <p className="mt-1 font-serif text-2xl text-ink">{print.year}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">Calendar year published by the series</p>
            </div>
            <div className="border border-rule bg-paper px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Source</p>
              <p className="mt-1 font-serif text-2xl text-ink">{print.seriesCode}</p>
              <a href={print.sourceUrl} className="mt-1 inline-block text-[11px] leading-4 text-forest underline underline-offset-2">
                World Bank Open Data
              </a>
            </div>
          </>
        ) : (
          <>
            <EmptyMetric label="Latest print" />
            <EmptyMetric label="Period" note={indicator.unit} />
            <EmptyMetric label="Source" note={country.tape ? country.tape.label : "No official door linked"} />
          </>
        )}
      </div>

      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/${indicator.countrySeries}`} className="text-forest underline underline-offset-2">
          {country.name} {indicator.countrySeries} series
        </Link>
        {country.tape ? (
          <>
            {" · "}
            <a href={country.tape.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
              {country.tape.label}
            </a>
          </>
        ) : null}
      </p>

      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/indicators/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <Provenance
        source={print ? "World Bank Open Data" : "No observation stored"}
        methodology={print ? `Series ${print.seriesCode}. Null years are omitted.` : "Append-only when a sourced series parses."}
      />
    </LayerPage>
  );
}