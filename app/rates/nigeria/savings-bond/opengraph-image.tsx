import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The FGN Savings Bond card. */
export const alt = "The FGN Savings Bond against bills and bank rates";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Rates · Nigeria", "The FGN Savings Bond, against bills and bank rates", "The Debt Management Office’s monthly offer, beside the alternatives", "africa"));
}
