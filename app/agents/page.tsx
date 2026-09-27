import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { runAgents } from "@/lib/agents/run";
import { formatPrint, sortPrints } from "@/lib/agents/worldbank";

export const metadata: Metadata = {
  title: "Agents",
  description: "Desk agents that read official series and leave a cell empty when the response has no number.",
};

export const revalidate = 86400;

export default async function AgentsPage() {
  const report = await runAgents();
  const prints = sortPrints(report.prints);
  const kenya = prints.filter((print) => print.iso === "KE");

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Agents" }]}
      kicker="Agents"
      title="The desk reads the publisher"
      lede="Four agents keep the desk current. The prints agent stores a number only when World Bank Open Data returns a finite value and a year. Price, flow, dwell and the policy rate stay empty."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Parsed prints</p>
          <p className="mt-1 font-serif text-xl">{report.prints.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Written this run</p>
          <p className="mt-1 font-serif text-xl">{report.store.written}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Kenya</p>
          <p className="mt-1 font-serif text-xl">{kenya.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          Ingestion
        </Link>
        {" · "}
        <Link href="/indicators/inflation/kenya" className="text-forest underline underline-offset-2">
          Kenya inflation
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        <li className="border-b border-rule pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">prints · daily</p>
          <p className="mt-1 font-serif text-xl">World Bank annual series</p>
          <p className="mt-1 text-sm text-ink-soft">
            Inflation, GDP, foreign direct investment and public debt. {report.prints.length} values parsed on this run.
            {report.store.reason ? ` ${report.store.reason}` : " Matching vintages already stored were left in place."}
          </p>
        </li>
        <li className="border-b border-rule pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">doors · daily</p>
          <p className="mt-1 font-serif text-xl">Official door check</p>
          <p className="mt-1 text-sm text-ink-soft">
            The cron asks whether each linked door responds. It does not scrape a rate from the page.
          </p>
        </li>
        <li className="border-b border-rule pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">desk · each run</p>
          <p className="mt-1 font-serif text-xl">Empty slots stay empty</p>
          <p className="mt-1 text-sm text-ink-soft">
            {report.desk.emptySlots.join(", ")} have no sourced print. {report.desk.policyRate}
          </p>
        </li>
      </ul>

      {kenya.length > 0 ? (
        <ul className="mt-10 space-y-3">
          {kenya.map((print) => (
            <li key={`${print.indicatorSlug}-${print.iso}`} className="border-b border-rule pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                {print.countryName} · {print.year} · {print.seriesCode}
              </p>
              <p className="mt-1 font-serif text-xl">
                {formatPrint(print.value)} <span className="text-base text-ink-soft">{print.unit}</span>
              </p>
              <a href={print.sourceUrl} className="mt-1 inline-block text-sm text-forest underline underline-offset-2">
                {print.seriesName}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-sm text-ink-soft">This run did not parse a Kenya value. Those cells stay blank.</p>
      )}

      <Provenance
        source="World Bank Open Data"
        methodology="Daily cron at /api/cron/agents. A cell is filled only from a finite API value. Null responses are dropped."
      />
    </LayerPage>
  );
}
