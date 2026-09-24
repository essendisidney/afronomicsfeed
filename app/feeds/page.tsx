import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { deliveredFeedEvents, feedProducts, licensedFeeds } from "@/lib/demo/feeds";

export const metadata: Metadata = {
  title: "Feeds",
  description: "Enterprise and Professional feed catalogue. Nothing is delivered without a licence.",
};

export default function FeedsPage() {
  const licensed = licensedFeeds();
  const delivered = deliveredFeedEvents();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Feeds" }]}
      kicker="Feeds"
      title="Catalogue before delivery"
      lede="Each row is a feed shape Professional or Enterprise seats would licence. This build does not push webhooks, mint CSV, or fill an inbox."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{feedProducts.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Licensed</p>
          <p className="mt-1 font-serif text-xl">{licensed.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivered</p>
          <p className="mt-1 font-serif text-xl">{delivered.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
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
        {" · "}
        <Link href="/webhooks" className="text-forest underline underline-offset-2">
          Webhooks
        </Link>
        {" · "}
        <Link href="/embeds" className="text-forest underline underline-offset-2">
          Embeds
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {feedProducts.map((feed) => (
          <li key={feed.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {feed.channel} · {feed.seat} · {feed.status}
            </p>
            <p className="mt-1 font-serif text-xl">{feed.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{feed.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Deliver — licence required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No feed queue" methodology="Catalogue only. No webhook, email or CSV is sent." />
    </LayerPage>
  );
}
