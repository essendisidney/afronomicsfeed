import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { controlsByStatus, securityControls } from "@/lib/demo/security";

export const metadata: Metadata = {
  title: "Security",
  description: "Trust and security controls for Afronomics. No invented compliance badges.",
};

export default function SecurityPage() {
  const ready = controlsByStatus("ready").length;
  const partial = controlsByStatus("partial").length;
  const blocked = controlsByStatus("blocked").length;
  const empty = controlsByStatus("empty").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Security" }]}
      kicker="Security"
      title="Trust without a fake badge"
      lede="Enterprise buyers need an honest control list. Ready means true for this build. Empty means not claimed. Nothing here invents SOC 2 or a passed pen-test."
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Ready</p>
          <p className="mt-1 font-serif text-xl">{ready}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Partial</p>
          <p className="mt-1 font-serif text-xl">{partial}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Blocked</p>
          <p className="mt-1 font-serif text-xl">{blocked}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Empty</p>
          <p className="mt-1 font-serif text-xl">{empty}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
        {" · "}
        <Link href="/sla" className="text-forest underline underline-offset-2">
          SLA
        </Link>
        {" · "}
        <Link href="/audit" className="text-forest underline underline-offset-2">
          Audit
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {securityControls.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.layer} · {item.status}
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

      <Provenance
        source="Product trust catalogue"
        methodology="No control invents a compliance certification."
      />
    </LayerPage>
  );
}
