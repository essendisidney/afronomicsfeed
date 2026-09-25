import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { citationSlots, filledCitationCount } from "@/lib/demo/citations";

export const metadata: Metadata = {
  title: "Citations",
  description: "Citation shapes for Afronomics Feed. No sample print is stored.",
};

export default function CitationsPage() {
  const filled = filledCitationCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Citations" }]}
      kicker="Citations"
      title="What a citation needs"
      lede="A slot stays empty until a publisher, title and date exist. This page does not store a sample print."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{citationSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Filled</p>
          <p className="mt-1 font-serif text-xl">{filled}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
        {" · "}
        <Link href="/corrections" className="text-forest underline underline-offset-2">
          Corrections
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {citationSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Citation shapes" methodology="Filled count is zero. No sample document is attached." />
    </LayerPage>
  );
}
