import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { activePartnerCount, partnerSurfaces } from "@/lib/demo/partners";

export const metadata: Metadata = {
  title: "Partners",
  description: "Partner and sponsor surfaces for Afronomics. Inventory is empty and kept separate from editorial.",
};

export default function PartnersPage() {
  const active = activePartnerCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Partners" }]}
      kicker="Partners"
      title="Paid stays off the news sentence"
      lede="Sponsor and partner slots are product shape only. This build ships zero inventory — editorial files never carry a hidden advertiser adjective."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Surfaces</p>
          <p className="mt-1 font-serif text-xl">{partnerSurfaces.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Active</p>
          <p className="mt-1 font-serif text-xl">{active}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
        {" · "}
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        {" · "}
        <Link href="/legal/disclaimer" className="text-forest underline underline-offset-2">
          Disclaimer
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {partnerSurfaces.map((surface) => (
          <li key={surface.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {surface.kind} · {surface.status}
            </p>
            <p className="mt-1 font-serif text-xl">{surface.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{surface.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="No ad server"
        methodology="Partner inventory is empty. Editorial and paid stay separate."
      />
    </LayerPage>
  );
}
