import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { creditLines, liveCreditCount } from "@/lib/demo/credits";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Credits",
  description: "House and stack credits for Afronomics Feed. No invented vendor partnerships.",
};

export default function CreditsPage() {
  const live = liveCreditCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Credits" }]}
      kicker="Credits"
      title="Who builds the desk"
      lede={`${site.houseCredit} Stack and design acknowledgements stay factual. This page does not invent a partnership badge.`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Lines</p>
          <p className="mt-1 font-serif text-xl">{creditLines.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live on site</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/brand" className="text-forest underline underline-offset-2">
          Brand
        </Link>
        {" · "}
        <Link href="/trust" className="text-forest underline underline-offset-2">
          Trust
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {creditLines.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.status}
            </p>
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

      <Provenance source="Product credits" methodology="No credit invents a commercial partnership." />
    </LayerPage>
  );
}
