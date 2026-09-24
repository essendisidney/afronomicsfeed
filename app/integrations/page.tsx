import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { connectedIntegrations, integrationChannels } from "@/lib/demo/integrations";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Slack, Teams, email and automation doors for Afronomics. Nothing is connected without a licence.",
};

export default function IntegrationsPage() {
  const connected = connectedIntegrations();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Integrations" }]}
      kicker="Integrations"
      title="Delivery doors without a fake ping"
      lede="Catalogue shapes for workspace, email and automation delivery. This build does not arm a Slack bot, Teams connector or Zap."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{integrationChannels.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Connected</p>
          <p className="mt-1 font-serif text-xl">{connected.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/webhooks" className="text-forest underline underline-offset-2">
          Webhooks
        </Link>
        {" · "}
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/embeds" className="text-forest underline underline-offset-2">
          Embeds
        </Link>
        {" · "}
        <Link href="/notifications" className="text-forest underline underline-offset-2">
          Notifications
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {integrationChannels.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.seat} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Connect — licence required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No integration runner" methodology="Catalogue only. No bot invents a print." />
    </LayerPage>
  );
}
