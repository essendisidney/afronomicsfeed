import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { visibleReceipts } from "@/lib/receipts";
import { site } from "@/lib/site";

export const dynamicParams = false;

const inSeries = (series: string) => visibleReceipts().filter((r) => r.series === series);

export function generateStaticParams() {
  return [...new Set(visibleReceipts().flatMap((r) => (r.series ? [r.series] : [])))].map((series) => ({ series }));
}

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }): Promise<Metadata> {
  const { series } = await params;
  const list = inSeries(series);
  if (!list.length) return {};
  return {
    title: `The ${series} file: every Receipt, newest first`,
    alternates: { canonical: `${site.url}/receipts/series/${series}` },
    robots: list.some((r) => r.status === "published") ? undefined : { index: false, follow: false },
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const list = inSeries(series);
  if (!list.length) notFound();
  const next = list.flatMap((r) => r.followUps).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/receipts", label: "Receipts" }, { label: `The ${series} file` }]}
      kicker="A running file"
      title={`The ${series} file`}
      lede={`Every Receipt on this subject, newest first.${next.length ? ` Next on the calendar: ${next[0].what}.` : ""}`}
    >
      <ReceiptList receipts={list} empty="" />
    </PageShell>
  );
}
