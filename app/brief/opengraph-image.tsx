import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The Daily Brief list's card (each brief has its own). */
export const alt = "The Afronomics Daily Brief";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Afronomics · Daily Brief", "What moved in African money, and why", "One brief a day, every figure linked to its source"));
}
