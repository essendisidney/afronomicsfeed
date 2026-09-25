import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { correspondentSlots, namedCorrespondentCount } from "@/lib/demo/correspondents";

export const metadata: Metadata = {
  title: "Correspondents",
  description: "Correspondent seats for Afronomics Feed. No byline is invented.",
};

export default function CorrespondentsPage() {
  const named = namedCorrespondentCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Correspondents" }]}
      kicker="Correspondents"
      title="Who would sign the desk"
      lede="A seat stays empty until a person is named. This page does not invent a byline."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Seats</p>
          <p className="mt-1 font-serif text-xl">{correspondentSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Named</p>
          <p className="mt-1 font-serif text-xl">{named}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/people" className="text-forest underline underline-offset-2">
          People
        </Link>
        {" · "}
        <Link href="/today" className="text-forest underline underline-offset-2">
          Morning file
        </Link>
        {" · "}
        <Link href="/careers" className="text-forest underline underline-offset-2">
          Careers
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {correspondentSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.desk}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Correspondent seats" methodology="Named count stays zero until a real byline is assigned." />
    </LayerPage>
  );
}
