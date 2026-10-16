import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { deskSlug, desks, type DeskSlug } from "@/lib/receipts";
import { receiptListSignature } from "@/lib/share-cards";

/** A desk's card: its newest Receipt, its number and verdict. */
export const alt = "The desk's latest Receipt";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ desk: string }> }) {
  const { desk } = await params;
  return renderSignature(receiptListSignature(desks[desk as DeskSlug]?.name.replace(/^Afronomics /, "") ?? "Receipts", (r) => deskSlug(r.desk) === desk));
}
