import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { auctionSlots, storedAuctionCount } from "@/lib/demo/auctions";

export const metadata: Metadata = {
  title: "Auctions",
  description: "Auction shapes for Afronomics Feed. No sale is stored.",
};

export default function AuctionsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Auctions" }]}
      kicker="Auctions"
      title="What an auction would award"
      lede="A slot stays empty until a cited notice and a source exist. This page does not store a sample auction."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{auctionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedAuctionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/quotes" className="text-forest underline underline-offset-2">
          Quotes
        </Link>
        {" · "}
        <Link href="/contracts" className="text-forest underline underline-offset-2">
          Contracts
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {auctionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Auction shapes" methodology="Stored count is zero. No sale is attached." />
    </LayerPage>
  );
}
