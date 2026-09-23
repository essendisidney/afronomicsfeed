import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { currentSeat } from "@/lib/demo/entitlements";
import { issuedKeys, usageMeters } from "@/lib/demo/usage";

export const metadata: Metadata = {
  title: "Usage",
  description: "Seat allowances for Ask, exports, API and watches. Meters stay at zero until Auth is live.",
};

export default function AccountUsagePage() {
  const seat = currentSeat();
  const meters = usageMeters();
  const keys = issuedKeys();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/account", label: "Account" },
        { label: "Usage" },
      ]}
      kicker="Usage"
      title="Allowances without a fake counter"
      lede="Meters describe what a seat would count. This build does not invent consumption or pretend a key was issued."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Seat</p>
          <p className="mt-1 font-serif text-xl">{seat.label}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">API keys</p>
          <p className="mt-1 font-serif text-xl">{keys.length}</p>
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
        <Link href="/exports" className="text-forest underline underline-offset-2">
          Exports
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {meters.map((meter) => (
          <li key={meter.id} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{meter.unit}</p>
            <p className="mt-1 font-serif text-xl">{meter.label}</p>
            <p className="mt-2 font-mono text-sm">
              {meter.used}
              {" / "}
              {meter.limit === null ? "—" : meter.limit}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{meter.note}</p>
          </li>
        ))}
      </ul>

      <Provenance source="No usage store" methodology="Zeros are honest. No synthetic burn-down." />
    </LayerPage>
  );
}
