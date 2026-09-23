import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { exportPackages, issuedExports } from "@/lib/demo/exports";

export const metadata: Metadata = {
  title: "Exports",
  description: "Professional and Enterprise extract packages. No download is issued without a live seat.",
};

export default function ExportsPage() {
  const issued = issuedExports();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Exports" }]}
      kicker="Exports"
      title="Extracts with a seat, or nothing"
      lede="Packages describe what a Professional or Enterprise seat would download. This build does not mint files or pretend a checkout succeeded."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Issued downloads</p>
          <p className="mt-1 font-serif text-xl">{issued.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Billing</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {exportPackages.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.format} · {item.seat}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Download — not issued</p>
          </li>
        ))}
      </ul>

      <Provenance source="No export queue" methodology="No CSV or JSON is generated. Packages are product shape only." />
    </LayerPage>
  );
}
