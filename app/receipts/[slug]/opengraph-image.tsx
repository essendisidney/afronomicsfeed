import { notFound } from "next/navigation";
import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { getReceipt } from "@/lib/receipts";
import { receiptSignature } from "@/lib/share-cards";

/**
 * A Receipt's own share card: its desk, headline, first figure, verdict, and that figure's source and date. Built for
 * the same Receipts the page is (published only on production; drafts on previews), and a draft never gets one in
 * production: getReceipt respects showDrafts(), so the card 404s like the page.
 */
export const alt = "An Afronomics Receipt: the verdict and its number";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const r = getReceipt((await params).slug);
  if (!r) notFound();
  return renderSignature(receiptSignature(r));
}
