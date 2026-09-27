import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedWindowCount, windowSlots } from "@/lib/demo/windows";

export const metadata: Metadata = {
  title: "Windows",
  description: "Window shapes for Afronomics Feed. No span of time is stored.",
};

export default function WindowsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Windows" }]}
      kicker="Windows"
      title="What a window would bound"
      lede="A slot stays empty until two dates and a source exist. This page does not store a sample window."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{windowSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedWindowCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {windowSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Window shapes" methodology="Stored count is zero. No span of time is attached." />
    </LayerPage>
  );
}
