import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { manifestSlots, storedManifestCount } from "@/lib/demo/manifests";

export const metadata: Metadata = {
  title: "Manifests",
  description: "Manifest shapes for Afronomics Feed. No cargo list is stored.",
};

export default function ManifestsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Manifests" }]}
      kicker="Manifests"
      title="What a manifest would list"
      lede="A slot stays empty until a cited list and a source exist. This page does not store a sample manifest or a volume."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{manifestSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedManifestCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/modes" className="text-forest underline underline-offset-2">
          Modes
        </Link>
        {" · "}
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {manifestSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Manifest shapes" methodology="Stored count is zero. No cargo list is attached." />
    </LayerPage>
  );
}
