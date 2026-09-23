import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { surfacesByState, systemSurfaces } from "@/lib/demo/status-board";

export const metadata: Metadata = {
  title: "Status",
  description: "Honest product status for Afronomics Feed. Scaffold and offline surfaces stay labelled.",
};

export default function StatusPage() {
  const live = surfacesByState("live").length;
  const scaffold = surfacesByState("scaffold").length;
  const offline = surfacesByState("offline").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Status" }]}
      kicker="Status"
      title="What is live, what is not"
      lede="Green only when the surface actually ships. Scaffold means editorial shape without a store. Offline means Auth, billing, RAG or runners are dark."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scaffold</p>
          <p className="mt-1 font-serif text-xl">{scaffold}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Offline</p>
          <p className="mt-1 font-serif text-xl">{offline}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          Ingestion
        </Link>
        {" · "}
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
        {" · "}
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {systemSurfaces.map((surface) => (
          <li key={surface.id} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{surface.state}</p>
            {surface.href ? (
              <Link href={surface.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {surface.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{surface.label}</p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{surface.note}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Product status board" methodology="No synthetic uptime. Offline stays offline." />
    </LayerPage>
  );
}
