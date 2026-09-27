import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedThresholdCount, thresholdSlots } from "@/lib/demo/thresholds";

export const metadata: Metadata = {
  title: "Thresholds",
  description: "Threshold shapes for Afronomics Feed. No level is stored.",
};

export default function ThresholdsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Thresholds" }]}
      kicker="Thresholds"
      title="What a level would mark"
      lede="A slot stays empty until a series, a unit and a level exist. This page does not store a sample number."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{thresholdSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedThresholdCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/alerts" className="text-forest underline underline-offset-2">
          Alerts
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {thresholdSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Threshold shapes" methodology="Stored count is zero. No level is attached." />
    </LayerPage>
  );
}
