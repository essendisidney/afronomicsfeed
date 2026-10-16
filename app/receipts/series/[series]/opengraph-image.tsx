import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { type Receipt } from "@/lib/receipts";
import { receiptListSignature } from "@/lib/share-cards";

/** A series' card: its newest Receipt, its number and verdict. */
export const alt = "The series' latest Receipt";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  return renderSignature(receiptListSignature(`The ${series} file`, (r: Receipt) => r.series === series));
}
