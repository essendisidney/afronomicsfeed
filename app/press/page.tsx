import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { pressAssets, publishedPressCount } from "@/lib/demo/press";

export const metadata: Metadata = {
  title: "Press",
  description: "Media kit for Afronomics Feed. Empty assets are not available for download.",
};

export default function PressPage() {
  const published = publishedPressCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Press" }]}
      kicker="Press"
      title="Kit without invented metrics"
      lede="Assets for reporters and partners. Draft points at a live page. Empty means nothing is issued as a download."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Assets</p>
          <p className="mt-1 font-serif text-xl">{pressAssets.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Draft or linked</p>
          <p className="mt-1 font-serif text-xl">{published}</p>
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
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        {" · "}
        <Link href="/partners" className="text-forest underline underline-offset-2">
          Partners
        </Link>
        {" · "}
        <Link href="/social" className="text-forest underline underline-offset-2">
          Social
        </Link>
        {" · "}
        <Link href="/brand" className="text-forest underline underline-offset-2">
          Brand
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {pressAssets.map((asset) => (
          <li key={asset.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {asset.kind} · {asset.status}
            </p>
            {asset.href ? (
              <Link href={asset.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {asset.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{asset.label}</p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{asset.lede}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {asset.status === "empty" ? "Download — not issued" : "Open linked file"}
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No media CDN pack" methodology="No press PDF invents a KPI." />
    </LayerPage>
  );
}
