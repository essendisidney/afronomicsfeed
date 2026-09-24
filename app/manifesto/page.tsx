import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { manifestoPrinciples } from "@/lib/demo/manifesto";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Product principles for Afronomics Feed. Empty until sourced. No invented coverage.",
};

export default function ManifestoPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Manifesto" }]}
      kicker="Manifesto"
      title="How the desk holds the line"
      lede="Principles that keep Afronomics credible. This page does not invent a metric, coverage map or live print."
    >
      <p className="text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/trust" className="text-forest underline underline-offset-2">
          Trust
        </Link>
        {" · "}
        <Link href="/layers" className="text-forest underline underline-offset-2">
          Layers
        </Link>
        {" · "}
        <Link href="/credits" className="text-forest underline underline-offset-2">
          Credits
        </Link>
        {" · "}
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
      </p>

      <ol className="mt-10 list-none space-y-5">
        {manifestoPrinciples.map((item, index) => (
          <li key={item.slug} className="border-b border-rule pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-serif text-2xl hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-2xl">{item.label}</p>
            )}
            <p className="mt-2 text-sm leading-6 text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ol>

      <Provenance source="Product manifesto" methodology="Principles only. No invent of live coverage." />
    </LayerPage>
  );
}
