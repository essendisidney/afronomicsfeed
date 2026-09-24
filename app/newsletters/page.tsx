import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { newsletterProducts, sendingNewsletterCount } from "@/lib/demo/newsletters";

export const metadata: Metadata = {
  title: "Newsletters",
  description: "Email digest catalogue for Afronomics. Nothing is sent without a live runner.",
};

export default function NewslettersPage() {
  const sending = sendingNewsletterCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Newsletters" }]}
      kicker="Newsletters"
      title="Digests without a fake send"
      lede="Catalogue shapes for morning teasers, pro digests and event mails. This build does not fill an inbox or invent a subscriber count."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{newsletterProducts.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Sending</p>
          <p className="mt-1 font-serif text-xl">{sending}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/subscribe" className="text-forest underline underline-offset-2">
          Subscribe
        </Link>
        {" · "}
        <Link href="/notifications" className="text-forest underline underline-offset-2">
          Notifications
        </Link>
        {" · "}
        <Link href="/templates" className="text-forest underline underline-offset-2">
          Templates
        </Link>
        {" · "}
        <Link href="/support" className="text-forest underline underline-offset-2">
          Support
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {newsletterProducts.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.cadence} · {item.seat} · {item.status}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{item.label}</p>
            )}
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Send — runner offline
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No mail runner" methodology="Catalogue only. No digest invents a print." />
    </LayerPage>
  );
}
