import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { trustByStatus, trustSurfaces } from "@/lib/demo/trust";

export const metadata: Metadata = {
  title: "Trust",
  description: "Trust center for Afronomics Feed. Method, security, SLA and legal doors — no invented audits.",
};

export default function TrustPage() {
  const live = trustByStatus("live").length;
  const scaffold = trustByStatus("scaffold").length;
  const blocked = trustByStatus("blocked").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Trust" }]}
      kicker="Trust"
      title="One door for how we hold the line"
      lede="Method, security, SLA, cookies and go-live gates in one place. Live means the page ships. Scaffold means honest shape. Blocked means official prints cannot land yet."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scaffold</p>
          <p className="mt-1 font-serif text-xl">{scaffold}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Blocked</p>
          <p className="mt-1 font-serif text-xl">{blocked}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/security" className="text-forest underline underline-offset-2">
          Security
        </Link>
        {" · "}
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/faq" className="text-forest underline underline-offset-2">
          FAQ
        </Link>
        {" · "}
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/manifesto" className="text-forest underline underline-offset-2">
          Manifesto
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {trustSurfaces.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Trust center index" methodology="No surface invents a passed audit or live print." />
    </LayerPage>
  );
}
