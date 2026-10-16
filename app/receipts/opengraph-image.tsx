import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { receiptListSignature } from "@/lib/share-cards";

/** The Receipts list's card: the newest Receipt, its number and verdict. */
export const alt = "Afronomics Receipts: the latest verdict and its number";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 900;

export default function Image() {
  return renderSignature(receiptListSignature("Receipts"));
}
