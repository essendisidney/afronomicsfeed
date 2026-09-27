import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { ingestionJobs, jobsByStatus } from "@/lib/demo/ingestion";

export const metadata: Metadata = {
  title: "Ingestion",
  description: "Ops board for Afronomics jobs. The World Bank prints agent runs daily. Other jobs stay stubbed.",
};

export default function IngestionPage() {
  const blocked = jobsByStatus("blocked").length;
  const stubs = jobsByStatus("stub").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Ingestion" }]}
      kicker="Ingestion"
      title="One scheduled reader"
      lede="The prints agent runs daily and keeps a cell empty when World Bank returns no number. The remaining jobs are still stub, idle or blocked."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Jobs</p>
          <p className="mt-1 font-serif text-xl">{ingestionJobs.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scheduled</p>
          <p className="mt-1 font-serif text-xl">{jobsByStatus("scheduled").length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stub / blocked</p>
          <p className="mt-1 font-serif text-xl">{stubs + blocked}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/admin" className="text-forest underline underline-offset-2">
          Editorial
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
        {" · "}
        <Link href="/agents" className="text-forest underline underline-offset-2">
          Agents
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {ingestionJobs.map((job) => (
          <li key={job.id} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {job.id} · {job.cadence} · {job.status}
              {job.desk ? ` · ${job.desk}` : ""}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{job.note}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Prints agent" methodology="Daily cron reads World Bank Open Data. Other jobs do not run. No silent fill of an empty cell." />
    </LayerPage>
  );
}
