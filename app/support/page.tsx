import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { openSupportCount, supportChannels } from "@/lib/demo/support";

export const metadata: Metadata = {
  title: "Support",
  description: "Support doors for Afronomics. No fake ticket queue or response SLA.",
};

export default function SupportPage() {
  const open = openSupportCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Support" }]}
      kicker="Support"
      title="Help without a fake ticket"
      lede="Open doors point at live pages. Offline means there is no helpdesk runner. Empty means no inbox is published yet."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Channels</p>
          <p className="mt-1 font-serif text-xl">{supportChannels.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Open</p>
          <p className="mt-1 font-serif text-xl">{open}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        {" · "}
        <Link href="/sla" className="text-forest underline underline-offset-2">
          SLA
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/templates" className="text-forest underline underline-offset-2">
          Templates
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {supportChannels.map((item) => (
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

      <Provenance source="Support catalogue" methodology="No channel invents a ticket ID or response time." />
    </LayerPage>
  );
}
