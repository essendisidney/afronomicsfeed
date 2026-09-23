import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { glossaryTerms } from "@/lib/demo/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description: "House terms for Afronomics Feed. Definitions point at method files — no invented jargon.",
};

export default function GlossaryPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Glossary" }]}
      kicker="Glossary"
      title="Words the desk uses"
      lede="Each term opens the method or product file that owns it. This is not a dictionary of modelled estimates."
    >
      <p className="text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
        {" · "}
        <Link href="/coverage" className="text-forest underline underline-offset-2">
          Coverage
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {glossaryTerms.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.layer}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.term}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="House glossary" methodology="Terms link to files. No invented definitions of prints." />
    </LayerPage>
  );
}
