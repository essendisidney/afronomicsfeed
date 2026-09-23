import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { Provenance } from "@/components/ui/Provenance";
import {
  getSignalCategory,
  signalCategories,
  signalCategorySlug,
  signalsInCategory,
} from "@/lib/demo/signals";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return signalCategories.map((category) => ({ category: signalCategorySlug(category) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = getSignalCategory(category);
  if (!name) return {};
  return {
    title: `${name} signals`,
    description: `Afronomics ${name} signal files. Fact and interpretation stay apart.`,
    alternates: { canonical: `${site.url}/signals/categories/${category}` },
  };
}

export default async function SignalCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name = getSignalCategory(category);
  if (!name) notFound();

  const rows = signalsInCategory(name);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/signals", label: "Signals" },
        { label: name },
      ]}
      kicker="Signal category"
      title={`${name} signals`}
      lede="Empty categories are still files. A card opens when a document, calculation or model note can be separated from the desk’s interpretation."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No methodology card in this category yet. The folder exists so a sourced {name.toLowerCase()} signal has a place to land.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((signal) => (
            <li key={signal.slug} className="border border-rule p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                  {signal.country} · {signal.sector}
                </p>
                <DemoMark kind="methodology" />
              </div>
              <h2 className="mt-2 font-serif text-2xl">
                <Link href={`/signals/${signal.slug}`} className="hover:text-forest">
                  {signal.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-ink-soft">{signal.fact}</p>
            </li>
          ))}
        </ul>
      )}
      <Provenance source="Desk methodology" methodology="Categories are a filing system, not a live scoreboard." />
    </LayerPage>
  );
}
