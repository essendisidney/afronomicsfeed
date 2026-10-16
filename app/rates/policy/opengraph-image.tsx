import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { rateSignature } from "@/lib/share-cards";

/** The policy rates card: the CBK rate and when it was set. */
export const alt = "Central bank policy rates: Kenya's latest";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(rateSignature("cbr", "Policy rates", "Central bank policy rates across Africa"));
}
