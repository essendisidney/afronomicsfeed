import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { mobileLoansSignature } from "@/lib/share-cards";

/** The mobile loans card: the lowest published charge for KES 1,000. */
export const alt = "What a mobile loan really costs in Kenya";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(mobileLoansSignature());
}
