import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { deskLabels } from "@/lib/data/indicators";
import { loadDataSignals, type DataSignal } from "@/lib/data/signals";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Signals — the biggest moves in African data",
  description: "The largest year-on-year moves in inflation, growth, FDI, reserves, debt service and more across 54 African economies, generated from published data.",
  alternates: { canonical: `${site.url}/signals` },
};

const toneClass: Record<DataSignal["tone"], string> = {
  positive: "text-forest",
  negative: "text-gold",
  neutral: "text-ink-soft",
};

export default async function SignalsPage() {
  const signals = await loadDataSignals(4);
  const bySeries = new Map<string, DataSignal[]>();
  for (const signal of signals) bySeries.set(signal.def.slug, [...(bySeries.get(signal.def.slug) ?? []), signal]);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Signals" }]}
      kicker="Signals"
      title="What changed in the latest prints"
      lede={
        <p>
          For each tracked series we compare every country’s newest annual value with the year before and surface the largest moves.
          Every sentence is generated from the published figures and links to the full table.
        </p>
      }
    >
      <div className="grid gap-12 md:grid-cols-2">
        {[...bySeries.entries()].map(([slug, list]) => (
          <section key={slug}>
            <SectionTitle kicker={deskLabels[list[0].def.desk]} title={list[0].def.label} href={`/data/${slug}`} />
            <ul className="mt-2 divide-y divide-rule">
              {list.map((signal) => (
                <li key={signal.id} className="py-3">
                  <p className="flex items-baseline gap-2">
                    <span aria-hidden className={`font-mono text-xs ${toneClass[signal.tone]}`}>
                      {signal.direction === "up" ? "▲" : "▼"}
                    </span>
                    <Link href={`/countries/${signal.mover.country.slug}`} className="text-[15px] leading-snug text-ink hover:text-forest">
                      {signal.headline}
                    </Link>
                  </p>
                  <p className="mt-0.5 pl-5 text-xs text-ink-soft">{signal.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {signals.length === 0 ? <p className="text-sm text-muted">The source did not return data this hour.</p> : null}
      <SourceLine name="World Bank Open Data" href="https://data.worldbank.org/" detail="▲▼ direction of the move; colour marks whether it is usually read as an improvement" />
    </PageShell>
  );
}
