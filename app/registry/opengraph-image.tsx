import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The registry's card (each institution's page shares it). */
export const alt = "Is this SACCO or bank licensed? The regulators' lists";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Check before you sign", "Is this SACCO or bank on the licensed list?", "Every licensed SACCO, bank and microfinance bank, from the regulators’ own lists", "banking"));
}
