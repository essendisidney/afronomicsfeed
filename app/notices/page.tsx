import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { houseNotices, postedNoticeCount } from "@/lib/demo/notices";

export const metadata: Metadata = {
  title: "Notices",
  description: "House notices for Afronomics Feed. Empty slots stay empty until an editor posts one.",
};

export default function NoticesPage() {
  const posted = postedNoticeCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Notices" }]}
      kicker="Notices"
      title="What the house has posted"
      lede="A slot is empty until an editor posts it. This page does not invent an outage, a method change, or a correction."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Slots</p>
          <p className="mt-1 font-serif text-xl">{houseNotices.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Posted</p>
          <p className="mt-1 font-serif text-xl">{posted}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/corrections" className="text-forest underline underline-offset-2">
          Corrections
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/changelog" className="text-forest underline underline-offset-2">
          Changelog
        </Link>
        {" · "}
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {houseNotices.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.status}
            </p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="House notices" methodology="Posted count is zero until a notice is written. No synthetic incidents." />
    </LayerPage>
  );
}
