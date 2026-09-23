import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { ticker } from "@/lib/demo/markets";

function codeFromLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function generateStaticParams() {
  return ticker.map((row) => ({ code: codeFromLabel(row.label) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const row = ticker.find((item) => codeFromLabel(item.label) === code);
  if (!row) return {};
  return {
    title: `${row.label} market file`,
    description: `${row.label} — demonstration print only. Official door: ${row.href}`,
  };
}

export default async function CurrencyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const row = ticker.find((item) => codeFromLabel(item.label) === code);
  if (!row) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/markets", label: "Markets" },
        { label: row.label },
      ]}
      kicker="Market file"
      title={row.label}
      lede="This is not a live price. The value below is a demonstration print used to hold the layout."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Official print" note={`Demo layout shows ${row.value}`} />
        <EmptyMetric label="Change" note="No derived move without two sourced prints" />
        <EmptyMetric label="Regional peer set" />
      </div>
      <p className="mt-6 text-sm">
        Official door:{" "}
        <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
          {row.href}
        </a>
      </p>
      <Provenance source={row.href} updated="Not a live feed" methodology="No FX redistribution" />
    </LayerPage>
  );
}
