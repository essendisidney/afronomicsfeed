import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { gatesByStatus, goLiveGates } from "@/lib/demo/golive";

export const metadata: Metadata = {
  title: "Go live",
  description: "Honest gates before Afronomics ships official prints. Blocked means real data cannot land yet.",
};

export default function GoLivePage() {
  const blocked = gatesByStatus("blocked").length;
  const partial = gatesByStatus("partial").length;
  const ready = gatesByStatus("ready").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Go live" }]}
      kicker="Go live"
      title="What must land before real prints"
      lede="The site is live as an intelligence shell. Official numbers wait on stores, validators and legal doors — not on inventing a ticker. Autonomous ingest is allowed only when a cited print passes validation."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Blocked</p>
          <p className="mt-1 font-serif text-xl">{blocked}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Partial</p>
          <p className="mt-1 font-serif text-xl">{partial}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Ready</p>
          <p className="mt-1 font-serif text-xl">{ready}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/layers" className="text-forest underline underline-offset-2">
          Layers
        </Link>
        {" · "}
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          Ingestion
        </Link>
        {" · "}
        <Link href="/social" className="text-forest underline underline-offset-2">
          Social
        </Link>
        {" · "}
        <Link href="/security" className="text-forest underline underline-offset-2">
          Security
        </Link>
        {" · "}
        <Link href="/roadmap" className="text-forest underline underline-offset-2">
          Roadmap
        </Link>
        {" · "}
        <Link href="/trust" className="text-forest underline underline-offset-2">
          Trust
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {goLiveGates.map((gate) => (
          <li key={gate.id} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {gate.layer} · {gate.status}
            </p>
            <Link href={gate.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {gate.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{gate.lede}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12 max-w-2xl">
        <h2 className="font-serif text-2xl">Autonomy with credibility</h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Autonomy is safe for fetch → validate → append-only store → publish with source + as-of.
          Autonomy is not safe for inventing a missing print, paraphrasing a tape, or writing opinion
          without a signed desk. Empty cells remain the default until a gate flips.
        </p>
      </section>

      <Provenance source="Go-live gate list" methodology="Blocked stays blocked. No fake green lights." />
    </LayerPage>
  );
}
