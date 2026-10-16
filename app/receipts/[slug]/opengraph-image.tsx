import { notFound } from "next/navigation";
import { receiptCard } from "@/lib/brand/receipt-card";
import { cardSize } from "@/lib/og-card";
import { getReceipt } from "@/lib/receipts";

/**
 * A Receipt's own share card: the cream receipt slip on the laterite field (lib/brand/receipt-card.tsx), stamped
 * "Receipt", with its headline and first two figures double-ruled, and their source. Built for the same Receipts the
 * page is (published only on production; drafts on previews), and a draft never gets one in production: getReceipt
 * respects showDrafts(), so the card 404s like the page.
 */
export const alt = "An Afronomics Receipt: the headline and its numbers";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const r = getReceipt((await params).slug);
  if (!r) notFound();
  return receiptCard(r);
}
