import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { recordSignature } from "@/lib/share-cards";

/** The record's card: the next call to be settled, its due date and the source that settles it. */
export const alt = "Afronomics record: the next call due and its date";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 900;

export default function Image() {
  return renderSignature(recordSignature());
}
