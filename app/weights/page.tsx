import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedWeightCount, weightSlots } from "@/lib/demo/weights";

export const metadata: Metadata = {
  title: "Weights",
  description: "Weight shapes for Afronomics Feed. No share is stored.",
};

export default function WeightsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Weights" }]}
      kicker="Weights"
      title="What a share would carry"
      lede="A slot stays empty until a member and a method exist. This page does not store a sample weight."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{weightSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedWeightCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/baskets" className="text-forest underline underline-offset-2">
          Baskets
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {weightSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Weight shapes" methodology="Stored count is zero. No share is attached." />
    </LayerPage>
  );
}
