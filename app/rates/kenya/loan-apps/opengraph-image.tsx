import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The loan app checker's card (each lender's page shares it). */
export const alt = "Is this loan app licensed? The CBK list, searchable";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Check before you sign", "Is this loan app licensed?", "Every digital lender on the Central Bank of Kenya’s licensed list", "banking"));
}
