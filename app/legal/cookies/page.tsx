import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { cookieRows, cookieRowsByStatus } from "@/lib/demo/cookies";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie posture for Afronomics Feed. No invented consent banner or tracking claim.",
};

export default function CookiesPage() {
  const used = cookieRowsByStatus("used").length;
  const planned = cookieRowsByStatus("planned").length;
  const notUsed = cookieRowsByStatus("not-used").length;

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/legal/privacy", label: "Legal" },
        { label: "Cookies" },
      ]}
      kicker="Legal"
      title="Cookies without a fake banner"
      lede="What this build does and does not set. Not-used means no cookie. Planned means it may land later. Counsel will replace this with a full notice."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Used</p>
          <p className="mt-1 font-serif text-xl">{used}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Planned</p>
          <p className="mt-1 font-serif text-xl">{planned}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Not used</p>
          <p className="mt-1 font-serif text-xl">{notUsed}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/legal/privacy" className="text-forest underline underline-offset-2">
          Privacy
        </Link>
        {" · "}
        <Link href="/legal/terms" className="text-forest underline underline-offset-2">
          Terms
        </Link>
        {" · "}
        <Link href="/security" className="text-forest underline underline-offset-2">
          Security
        </Link>
        {" · "}
        <Link href="/faq" className="text-forest underline underline-offset-2">
          FAQ
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {cookieRows.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.category} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="Cookie posture catalogue"
        methodology="No row invents a live tracking cookie or consent banner."
      />
    </LayerPage>
  );
}
