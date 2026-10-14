import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptView } from "@/components/receipts/ReceiptView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getReceipt, isPublic, visibleReceipts } from "@/lib/receipts";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return visibleReceipts().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = getReceipt((await params).slug);
  if (!r) return {};
  const url = `${site.url}/receipts/${r.slug}`;
  return {
    title: fitTitle(r.title),
    description: fitDescription(r.verdict ? `${r.verdict} ${r.summary}` : r.summary),
    alternates: { canonical: url },
    openGraph: { title: r.title, description: r.summary, url, type: "article", publishedTime: r.date },
    robots: isPublic(r) ? undefined : { index: false, follow: false },
  };
}

export default async function ReceiptPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = getReceipt((await params).slug);
  if (!r) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={[{ href: "/", label: "Today" }, { href: "/receipts", label: "Receipts" }, { label: r.title }]} />
      <div className="mt-6">
        <ReceiptView r={r} />
      </div>
    </div>
  );
}
