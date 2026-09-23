import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getInvestor, investors } from "@/lib/demo/investors";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return investors.map((investor) => ({ slug: investor.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const investor = getInvestor(slug);
  if (!investor) return {};
  return {
    title: investor.name,
    description: investor.lede,
    alternates: { canonical: `${site.url}/investors/${investor.slug}` },
  };
}

export default async function InvestorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const investor = getInvestor(slug);
  if (!investor) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/investors", label: "Investors" },
        { label: investor.name },
      ]}
      kicker="Investor · EXAMPLE"
      title={investor.name}
      lede={investor.lede}
    >
      <p className="mb-6">
        <DemoMark />
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Commitments" />
        <EmptyMetric label="Tickets" />
        <EmptyMetric label="As-of" />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/capital" className="text-forest underline underline-offset-2">
          Capital book
        </Link>
        {" · "}
        <Link href="/data" className="text-forest underline underline-offset-2">
          Data files
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>
      <Provenance source="EXAMPLE capital book" methodology="No invented real-fund name, ticket size or mandate." />
    </LayerPage>
  );
}
