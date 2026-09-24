import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";

export const metadata: Metadata = {
  title: "Developers",
  description: "Public API routes on Afronomics Feed. Keys are not issued.",
};

const routes = [
  {
    method: "GET",
    path: "/api/countries",
    note: "Country metadata only. No invented prints.",
  },
  {
    method: "GET",
    path: "/api/signals",
    note: "Signal methodology. Empty until a cited print exists.",
  },
  {
    method: "GET",
    path: "/api/capital-flows",
    note: "Empty book. Demo rows are not served.",
  },
  {
    method: "GET",
    path: "/api/graph",
    note: "Desk, node and edge counts. No invented upserts.",
  },
  {
    method: "GET",
    path: "/api/status",
    note: "Honest live / scaffold / offline counts.",
  },
  {
    method: "GET",
    path: "/api/meta",
    note: "This catalogue.",
  },
];

export default function DevelopersPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Developers" }]}
      kicker="Developers"
      title="The public surface"
      lede="Six routes, no keys. Anything that would invent an official print stays unpublished."
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">Keys are not issued.</p>
      <ul className="divide-y divide-rule border border-rule">
        {routes.map((route) => (
          <li key={route.path} className="grid gap-1 px-4 py-3 sm:grid-cols-[5rem_1fr_2fr] sm:items-baseline">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{route.method}</span>
            <Link href={route.path} className="font-mono text-sm text-forest underline underline-offset-2">
              {route.path}
            </Link>
            <p className="text-sm text-ink-soft">{route.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        Dataset files:{" "}
        <Link href="/data" className="text-forest underline underline-offset-2">
          /data
        </Link>
        . Question files:{" "}
        <Link href="/ask" className="text-forest underline underline-offset-2">
          /ask
        </Link>
        . Usage meters:{" "}
        <Link href="/account/usage" className="text-forest underline underline-offset-2">
          /account/usage
        </Link>
        . Feeds:{" "}
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          /feeds
        </Link>
        . Webhooks:{" "}
        <Link href="/webhooks" className="text-forest underline underline-offset-2">
          /webhooks
        </Link>
        . Embeds:{" "}
        <Link href="/embeds" className="text-forest underline underline-offset-2">
          /embeds
        </Link>
        . Security:{" "}
        <Link href="/security" className="text-forest underline underline-offset-2">
          /security
        </Link>
        . Integrations:{" "}
        <Link href="/integrations" className="text-forest underline underline-offset-2">
          /integrations
        </Link>
        . SLA:{" "}
        <Link href="/sla" className="text-forest underline underline-offset-2">
          /sla
        </Link>
        . Roadmap:{" "}
        <Link href="/roadmap" className="text-forest underline underline-offset-2">
          /roadmap
        </Link>
        . SDK:{" "}
        <Link href="/sdk" className="text-forest underline underline-offset-2">
          /sdk
        </Link>
        . Status:{" "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          /status
        </Link>
        . Onboarding:{" "}
        <Link href="/onboarding" className="text-forest underline underline-offset-2">
          /onboarding
        </Link>
        .
      </p>
      <Provenance source="Live route catalogue" methodology="No invented payloads. Keys are not issued." />
    </LayerPage>
  );
}
