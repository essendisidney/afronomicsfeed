import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { corpusDocs, indexedCorpusCount } from "@/lib/demo/corpus";

export const metadata: Metadata = {
  title: "Ask corpus",
  description: "Document slots for Ask retrieval. The index is empty until chunks are stored with provenance.",
};

export default function AskCorpusPage() {
  const indexed = indexedCorpusCount();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/ask", label: "Ask" },
        { label: "Corpus" },
      ]}
      kicker="Ask corpus"
      title="Slots before retrieval"
      lede="Each row is a document the Ask desk would chunk. Nothing is indexed yet — questions still refuse invented numbers."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Slots</p>
          <p className="mt-1 font-serif text-xl">{corpusDocs.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Indexed</p>
          <p className="mt-1 font-serif text-xl">{indexed}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">RAG</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/ask" className="text-forest underline underline-offset-2">
          Ask
        </Link>
        {" · "}
        <Link href="/exports" className="text-forest underline underline-offset-2">
          Exports
        </Link>
        {" · "}
        <Link href="/data" className="text-forest underline underline-offset-2">
          Data
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {corpusDocs.map((doc) => (
          <li key={doc.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {doc.kind} · {doc.status}
            </p>
            {doc.href ? (
              <Link href={doc.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {doc.title}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{doc.title}</p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{doc.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="No embedding store"
        methodology="Corpus slots are editorial. Ask refuses until indexed chunks exist."
      />
    </LayerPage>
  );
}
