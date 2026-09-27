import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { roundingSlots, storedRoundingCount } from "@/lib/demo/rounding";

export const metadata: Metadata = {
  title: "Rounding",
  description: "Rounding shapes for Afronomics Feed. No convention is stored.",
};

export default function RoundingPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Rounding" }]}
      kicker="Rounding"
      title="Where a print would be cut"
      lede="A slot stays empty until a publisher and a rule exist. This page does not store a sample convention."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{roundingSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedRoundingCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/precision" className="text-forest underline underline-offset-2">
          Precision
        </Link>
        {" · "}
        <Link href="/scales" className="text-forest underline underline-offset-2">
          Scales
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {roundingSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Rounding shapes" methodology="Stored count is zero. No convention is attached." />
    </LayerPage>
  );
}
