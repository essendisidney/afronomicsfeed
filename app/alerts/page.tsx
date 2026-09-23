import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { activeAlerts, alertKinds } from "@/lib/demo/watches";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Afronomics alert kinds. Delivery is not live. No invented notifications.",
};

export default function AlertsPage() {
  const active = activeAlerts();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Alerts" }]}
      kicker="Alerts"
      title="Notify on a print, not a guess"
      lede="Alert kinds describe what would fire after a cited observation is stored. Nothing is delivered in this build."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Active alerts</p>
          <p className="mt-1 font-serif text-xl">{active.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivery</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/watchlists" className="text-forest underline underline-offset-2">
          Watchlists
        </Link>
        {" · "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        {" · "}
        <Link href="/notifications" className="text-forest underline underline-offset-2">
          Notifications
        </Link>
        {" · "}
        <Link href="/searches" className="text-forest underline underline-offset-2">
          Searches
        </Link>
        {" · "}
        <Link href="/login" className="text-forest underline underline-offset-2">
          Sign in
        </Link>
        {" · "}
        <Link href="/signals" className="text-forest underline underline-offset-2">
          Signals
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {alertKinds.map((kind) => (
          <li key={kind.slug} className="border border-rule px-4 py-3">
            <p className="font-serif text-xl">{kind.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{kind.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Subscribe — not live</p>
          </li>
        ))}
      </ul>

      <Provenance source="No alert queue" methodology="No email, push or SMS is sent. Kinds are product shape only." />
    </LayerPage>
  );
}
