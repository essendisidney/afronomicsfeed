import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { datasets, getDataset } from "@/lib/demo/datasets";
import { indicators } from "@/lib/demo/indicators";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return datasets.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dataset = getDataset(slug);
  if (!dataset) return {};
  return {
    title: dataset.name,
    description: dataset.lede,
    alternates: { canonical: `${site.url}/data/${dataset.slug}` },
  };
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dataset = getDataset(slug);
  if (!dataset) notFound();
  const peers = datasets.filter((item) => item.slug !== dataset.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/data", label: "Data" },
        { label: dataset.name },
      ]}
      kicker="Data file"
      title={dataset.name}
      lede={dataset.lede}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Latest observation" />
        <EmptyMetric label="As-of" />
        <EmptyMetric label="Source URL" />
      </div>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Indicator doors</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {indicators.map((item) => (
            <li key={item.slug}>
              <Link href={`/indicators/${item.slug}`} className="text-forest underline underline-offset-2">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ul className="mt-8 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/data/${item.slug}`} className="text-forest underline underline-offset-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No observation stored" methodology="Share, embed and CSV attach only after a cited series exists." />
    </LayerPage>
  );
}
