import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { methodEntries, publishedMethodCount } from "@/lib/demo/methods";

export const metadata: Metadata = {
  title: "Method registry",
  description: "House standards and data methods on Afronomics. Empty rows are not written yet.",
};

export default function MethodRegistryPage() {
  const published = publishedMethodCount();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/method", label: "Method" },
        { label: "Registry" },
      ]}
      kicker="Method registry"
      title="Standards before volume"
      lede="Each row is a house method or data standard. Draft and empty mean the file is not production — the desk does not invent a finished methodology."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Entries</p>
          <p className="mt-1 font-serif text-xl">{methodEntries.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Published</p>
          <p className="mt-1 font-serif text-xl">{published}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Collector</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method essay
        </Link>
        {" · "}
        <Link href="/corrections" className="text-forest underline underline-offset-2">
          Corrections
        </Link>
        {" · "}
        <Link href="/data" className="text-forest underline underline-offset-2">
          Data
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {methodEntries.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.layer} · {item.status}
            </p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.title}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="House method index"
        methodology="Registry lists shape, not a claim that every method is finished."
      />
    </LayerPage>
  );
}
