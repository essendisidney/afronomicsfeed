import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { edgesForDesk, graphDesks, graphEdges, graphNodes } from "@/lib/demo/graph";
import { scheduledJobs } from "@/lib/ingestion/jobs";

export const metadata: Metadata = {
  title: "Graph",
  description: "Afronomics knowledge graph — featured and EAC desks. No invented relationships.",
};

export default function GraphPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Graph" }]}
      kicker="Knowledge graph"
      title="Entities connected by a source"
      lede="Edges are editorial scaffolds until a filing or article tags them. Resolution jobs do not invent nodes."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Desks</p>
          <p className="mt-1 font-serif text-xl">{graphDesks.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Nodes</p>
          <p className="mt-1 font-serif text-xl">{graphNodes.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Edges</p>
          <p className="mt-1 font-serif text-xl">{graphEdges.length}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Desks</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {graphDesks.map((desk) => {
            const edges = edgesForDesk(desk.slug);
            return (
              <li key={desk.slug}>
                <Link href={`/graph/${desk.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
                  <p className="font-serif text-xl">{desk.label}</p>
                  <p className="mt-1 text-sm text-ink-soft">{desk.lede}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {edges.length} edges · {desk.nodeIds.length} nodes
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Entity resolution</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Try a known label. Unknown names stay unresolved — the desk does not invent entities.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/graph/resolve" className="text-forest underline underline-offset-2">
            Open resolver
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Ingestion jobs</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Listed on the ops board. Nothing is scheduled against a live queue.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/ingestion" className="text-forest underline underline-offset-2">
            Open ingestion
          </Link>
          {" · "}
          <Link href="/sources" className="text-forest underline underline-offset-2">
            Sources
          </Link>
          {" · "}
          <Link href="/compare" className="text-forest underline underline-offset-2">
            Compare
          </Link>
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {scheduledJobs.slice(0, 4).map((job) => (
            <li key={job.id} className="border-b border-rule pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                {job.id} · {job.cadence} · {job.status}
              </p>
              <p className="mt-1 text-ink-soft">{job.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <Provenance
        source="Desk scaffold (featured + UG · TZ corridors)"
        methodology="No silent overwrite. No invented edges."
      />
    </LayerPage>
  );
}
