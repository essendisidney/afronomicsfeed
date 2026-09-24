import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { armedWebhooks, deliveredWebhooks, webhookEndpoints } from "@/lib/demo/webhooks";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Enterprise webhook catalogue for Afronomics. Nothing is delivered without a live key.",
};

export default function WebhooksPage() {
  const armed = armedWebhooks();
  const delivered = deliveredWebhooks();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Webhooks" }]}
      kicker="Webhooks"
      title="Callbacks without a fake ping"
      lede="Endpoints describe what would fire after a cited print or verified edge. This build does not arm a URL or invent delivery history."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{webhookEndpoints.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Armed</p>
          <p className="mt-1 font-serif text-xl">{armed.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivered</p>
          <p className="mt-1 font-serif text-xl">{delivered.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
        {" · "}
        <Link href="/account/usage" className="text-forest underline underline-offset-2">
          Usage
        </Link>
        {" · "}
        <Link href="/integrations" className="text-forest underline underline-offset-2">
          Integrations
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {webhookEndpoints.map((hook) => (
          <li key={hook.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {hook.event} · {hook.seat} · {hook.status}
            </p>
            <p className="mt-1 font-serif text-xl">{hook.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{hook.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Arm — key required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No webhook runner" methodology="Catalogue only. No callback invents a print." />
    </LayerPage>
  );
}
