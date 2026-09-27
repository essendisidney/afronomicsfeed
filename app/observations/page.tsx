import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { formatPrint, loadPrints, sortPrints } from "@/lib/agents/worldbank";
import { observationSlots } from "@/lib/demo/observations";

export const metadata: Metadata = {
  title: "Observations",
  description: "Observation shapes, plus World Bank annual values when the API returns a number.",
};

export const revalidate = 3600;

export default async function ObservationsPage() {
  const prints = sortPrints(await loadPrints());

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Observations" }]}
      kicker="Observations"
      title="What one print would carry"
      lede="Price, flow and dwell stay empty. Annual World Bank series appear below only when the response includes a finite value and a year."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{observationSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Retrieved</p>
          <p className="mt-1 font-serif text-xl">{prints.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/agents" className="text-forest underline underline-offset-2">
          Agents
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {observationSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <ul className="mt-10 space-y-3">
        {prints.map((print) => (
          <li key={`${print.indicatorSlug}-${print.iso}`} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {print.countryName} · {print.indicatorSlug} · {print.year}
            </p>
            <Link
              href={`/indicators/${print.indicatorSlug}/${print.countrySlug}`}
              className="mt-1 block font-serif text-xl hover:text-forest"
            >
              {formatPrint(print.value)} {print.unit}
            </Link>
            <a href={print.sourceUrl} className="mt-1 inline-block text-sm text-forest underline underline-offset-2">
              {print.seriesCode}
            </a>
          </li>
        ))}
      </ul>

      <Provenance
        source="World Bank Open Data"
        methodology="Retrieved count is the number of finite annual values in the latest API response. Empty shapes are not filled."
      />
    </LayerPage>
  );
}
