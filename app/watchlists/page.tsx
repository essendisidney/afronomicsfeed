import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { savedWatches, watchTemplates } from "@/lib/demo/watches";

export const metadata: Metadata = {
  title: "Watchlists",
  description: "Saved Afronomics watches. Requires a signed-in seat. Nothing is stored yet.",
};

export default function WatchlistsPage() {
  const saved = savedWatches();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Watchlists" }]}
      kicker="Watchlists"
      title="What you are watching"
      lede="Templates show the shape of a watch. Saving requires Auth and a Pro seat. This page does not invent a list."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Signed in</p>
          <p className="mt-1 font-serif text-xl">No</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Saved watches</p>
          <p className="mt-1 font-serif text-xl">{saved.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Seat</p>
          <p className="mt-1 font-serif text-xl">Free</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/login" className="text-forest underline underline-offset-2">
          Sign in
        </Link>
        {" · "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        {" · "}
        <Link href="/alerts" className="text-forest underline underline-offset-2">
          Alerts
        </Link>
        {" · "}
        <Link href="/pro" className="text-forest underline underline-offset-2">
          Pro
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Templates</h2>
        <p className="mt-2 text-sm text-ink-soft">Open the files. Saving is not live.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {watchTemplates.map((item) => (
            <li key={item.slug} className="border border-rule px-4 py-3">
              <p className="font-serif text-xl">{item.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {item.hrefs.map((href) => (
                  <li key={href}>
                    <Link href={href} className="text-forest underline underline-offset-2">
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Save — auth required</p>
            </li>
          ))}
        </ul>
      </section>

      <Provenance source="No watchlist store" methodology="Empty until a signed-in Pro seat exists. No fake saves." />
    </LayerPage>
  );
}
