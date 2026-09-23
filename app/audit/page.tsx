import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { auditActions, auditEvents } from "@/lib/demo/audit";

export const metadata: Metadata = {
  title: "Audit",
  description: "Editorial audit log for Afronomics. Empty until CMS writes are live.",
};

export default function AuditPage() {
  const events = auditEvents();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Audit" }]}
      kicker="Audit"
      title="Who changed the file"
      lede="Actions the CMS would log. The event store is empty — no invented publish history."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Events</p>
          <p className="mt-1 font-serif text-xl">{events.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">CMS</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/admin" className="text-forest underline underline-offset-2">
          Editorial
        </Link>
        {" · "}
        <Link href="/corrections" className="text-forest underline underline-offset-2">
          Corrections
        </Link>
        {" · "}
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          Ingestion
        </Link>
        {" · "}
        <Link href="/changelog" className="text-forest underline underline-offset-2">
          Changelog
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Action kinds</h2>
        <ul className="mt-4 space-y-3">
          {auditActions.map((action) => (
            <li key={action.slug} className="border-b border-rule pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{action.slug}</p>
              <p className="mt-1 font-serif text-xl">{action.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{action.lede}</p>
            </li>
          ))}
        </ul>
      </section>

      <Provenance source="No audit store" methodology="Empty log. No silent overwrite of filed briefs." />
    </LayerPage>
  );
}
