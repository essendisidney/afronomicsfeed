import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { brandAssets, liveBrandCount } from "@/lib/demo/brand";

export const metadata: Metadata = {
  title: "Brand",
  description: "Brand kit for Afronomics. Download packs stay empty until issued.",
};

export default function BrandPage() {
  const live = liveBrandCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Brand" }]}
      kicker="Brand"
      title="Identity without a fake download"
      lede="Names, voice and marks that already ship on the site. Empty means no asset pack is issued. Do not invent a public logo ZIP or swatch PDF."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Assets</p>
          <p className="mt-1 font-serif text-xl">{brandAssets.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live on site</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/press" className="text-forest underline underline-offset-2">
          Press
        </Link>
        {" · "}
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/social" className="text-forest underline underline-offset-2">
          Social
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {brandAssets.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.status}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{item.label}</p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Product brand catalogue" methodology="No download invents a logo pack." />
    </LayerPage>
  );
}
