import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { embedProducts, issuedEmbeds } from "@/lib/demo/embeds";

export const metadata: Metadata = {
  title: "Embeds",
  description: "Embed and widget catalogue for Afronomics. Nothing is issued without a licence.",
};

export default function EmbedsPage() {
  const issued = issuedEmbeds();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Embeds" }]}
      kicker="Embeds"
      title="Widgets without a fake snippet"
      lede="Catalogue shapes for Professional and Enterprise embeds. This build does not mint iframe codes or pretend a white-label key was issued."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{embedProducts.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Issued</p>
          <p className="mt-1 font-serif text-xl">{issued.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
        {" · "}
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
        {" · "}
        <Link href="/social" className="text-forest underline underline-offset-2">
          Social
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {embedProducts.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.format} · {item.seat} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Issue — licence required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No embed CDN" methodology="Catalogue only. No iframe invents a print." />
    </LayerPage>
  );
}
