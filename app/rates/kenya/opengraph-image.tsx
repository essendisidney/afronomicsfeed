import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { rateSignature } from "@/lib/share-cards";

/** Kenya rates pages without a card of their own share this one: the latest one-year bill rate and its change. */
export const alt = "Kenya rates: the latest one-year bill rate and its change";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(rateSignature("bill-364", "Kenya rates", "What money costs and earns in Kenya today"));
}
