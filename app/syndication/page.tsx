import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { publishedChannelCount, syndicationChannels } from "@/lib/demo/syndication";

export const metadata: Metadata = {
  title: "Syndication",
  description: "Public RSS, sitemap, and status doors for Afronomics Feed. No invented audience or uptime.",
};

export default function SyndicationPage() {
  const published = publishedChannelCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Syndication" }]}
      kicker="Syndication"
      title="What machines can read"
      lede="Published means the door exists. Catalogue means a licensed shape that is not delivered. This page does not invent subscribers, crawl volume, or uptime."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Channels</p>
          <p className="mt-1 font-serif text-xl">{syndicationChannels.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Published</p>
          <p className="mt-1 font-serif text-xl">{published}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/rss.xml" className="text-forest underline underline-offset-2">
          RSS
        </Link>
        {" · "}
        <Link href="/feeds" className="text-forest underline underline-offset-2">
          Feeds
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {syndicationChannels.map((item) => (
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

      <Provenance
        source="Syndication catalogue"
        methodology="Published channels are routes that exist. No audience or uptime figure is stored."
      />
    </LayerPage>
  );
}
