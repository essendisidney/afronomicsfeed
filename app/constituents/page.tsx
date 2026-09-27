import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { constituentSlots, storedConstituentCount } from "@/lib/demo/constituents";

export const metadata: Metadata = {
  title: "Constituents",
  description: "Constituent shapes for Afronomics Feed. No member is stored.",
};

export default function ConstituentsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Constituents" }]}
      kicker="Constituents"
      title="What a member would name"
      lede="A slot stays empty until a named file and a date exist. This page does not store a sample member."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{constituentSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedConstituentCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/baskets" className="text-forest underline underline-offset-2">
          Baskets
        </Link>
        {" · "}
        <Link href="/companies" className="text-forest underline underline-offset-2">
          Companies
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {constituentSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Constituent shapes" methodology="Stored count is zero. No member is attached." />
    </LayerPage>
  );
}
