import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { activeLicences, licenceProducts, openQuotes } from "@/lib/demo/licensing";

export const metadata: Metadata = {
  title: "Licensing",
  description: "Enterprise licence catalogue for Afronomics. No fake quotes or active seats.",
};

export default function LicensingPage() {
  const active = activeLicences();
  const quotes = openQuotes();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Licensing" }]}
      kicker="Licensing"
      title="Enterprise shape, no fake quote"
      lede="Products describe what an Enterprise seat would licence. This build does not open a quote or activate a white-label embed."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{licenceProducts.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Open quotes</p>
          <p className="mt-1 font-serif text-xl">{quotes.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Active</p>
          <p className="mt-1 font-serif text-xl">{active.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
        {" · "}
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {licenceProducts.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.seat} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Quote — contact only
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No CRM" methodology="Catalogue only. No invented quote IDs." />
    </LayerPage>
  );
}
