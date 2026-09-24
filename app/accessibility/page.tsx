import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { a11yByStatus, a11yChecks } from "@/lib/demo/accessibility";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility posture for Afronomics. No invented WCAG conformance badge.",
};

export default function AccessibilityPage() {
  const pass = a11yByStatus("pass").length;
  const partial = a11yByStatus("partial").length;
  const untested = a11yByStatus("untested").length;
  const fail = a11yByStatus("fail").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Accessibility" }]}
      kicker="Accessibility"
      title="Reach without a fake badge"
      lede="Honest posture for keyboard, contrast and semantics. Untested stays untested. This desk does not publish a WCAG AA claim."
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Pass</p>
          <p className="mt-1 font-serif text-xl">{pass}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Partial</p>
          <p className="mt-1 font-serif text-xl">{partial}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Untested</p>
          <p className="mt-1 font-serif text-xl">{untested}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Fail</p>
          <p className="mt-1 font-serif text-xl">{fail}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/security" className="text-forest underline underline-offset-2">
          Security
        </Link>
        {" · "}
        <Link href="/brand" className="text-forest underline underline-offset-2">
          Brand
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {a11yChecks.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
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
        source="Product accessibility catalogue"
        methodology="No check invents a WCAG conformance claim."
      />
    </LayerPage>
  );
}
