import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { editions, liveEditionCount } from "@/lib/demo/languages";

export const metadata: Metadata = {
  title: "Languages",
  description: "Publication languages for Afronomics Feed. Empty editions stay empty until a real translation exists.",
};

export default function LanguagesPage() {
  const live = liveEditionCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Languages" }]}
      kicker="Languages"
      title="What the desk publishes in"
      lede="English is the live edition. An empty language means no edition exists. This page does not invent a translation."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Languages</p>
          <p className="mt-1 font-serif text-xl">{editions.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {editions.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.code} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Language catalogue" methodology="Only English is marked live. No machine translation is stored." />
    </LayerPage>
  );
}
