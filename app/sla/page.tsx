import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { contractedSlaCount, slaCommitments } from "@/lib/demo/sla";

export const metadata: Metadata = {
  title: "SLA",
  description: "Service commitments for Afronomics seats. No invented uptime percentages.",
};

export default function SlaPage() {
  const contracted = contractedSlaCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "SLA" }]}
      kicker="SLA"
      title="Commitments without a fake nine"
      lede="Enterprise buyers ask for uptime and response windows. This desk lists shapes only. No measured 99.9% is published until a contracted seat and monitoring exist."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{slaCommitments.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Contracted</p>
          <p className="mt-1 font-serif text-xl">{contracted}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/security" className="text-forest underline underline-offset-2">
          Security
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
        {" · "}
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {slaCommitments.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.tier} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="Product SLA catalogue"
        methodology="No commitment invents a measured uptime percentage."
      />
    </LayerPage>
  );
}
