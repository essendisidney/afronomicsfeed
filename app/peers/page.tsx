import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { peerSlots, storedPeerCount } from "@/lib/demo/peers";

export const metadata: Metadata = {
  title: "Peers",
  description: "Peer shapes for Afronomics Feed. No comparison set is stored.",
};

export default function PeersPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Peers" }]}
      kicker="Peers"
      title="What a comparison set would hold"
      lede="A slot stays empty until two named files and a shared series exist. This page does not store a sample peer."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{peerSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedPeerCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/compare" className="text-forest underline underline-offset-2">
          Compare
        </Link>
        {" · "}
        <Link href="/countries" className="text-forest underline underline-offset-2">
          Countries
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {peerSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Peer shapes" methodology="Stored count is zero. No comparison set is attached." />
    </LayerPage>
  );
}
