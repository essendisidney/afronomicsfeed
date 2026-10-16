import { notFound } from "next/navigation";
import { allSeries, getSeries } from "@/lib/data/rate-series";
import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { seriesSignature } from "@/lib/share-cards";

/** A rate series' own card: its latest figure, the change since the previous print, and its source and date. */
export const alt = "An Afronomics rate: the latest figure and its change";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 1800;
export const dynamicParams = false;

export function generateStaticParams() {
  return allSeries().map((s) => ({ id: s.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSeries(id)) notFound();
  return renderSignature(seriesSignature(id));
}
