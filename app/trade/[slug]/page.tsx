import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { corridors, getCorridor } from "@/lib/demo/trade";

export function generateStaticParams() {
  return corridors.map((corridor) => ({ slug: corridor.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) return {};
  return {
    title: corridor.name,
    description: `${corridor.name} — ${corridor.geography}. Trade volumes unpublished until sourced.`,
  };
}

export default async function CorridorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { label: corridor.name },
      ]}
      kicker="Trade corridor"
      title={corridor.name}
      lede={corridor.geography}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Trade volume" note={corridor.note} />
        <EmptyMetric label="Port dwell" />
        <EmptyMetric label="Active disruptions" />
      </div>
      <p className="mt-6 text-sm text-ink-soft">Modes on file: {corridor.modes.join(", ")}.</p>
      <Provenance source="Corridor geography is editorial" methodology="No invented throughput" />
    </LayerPage>
  );
}
