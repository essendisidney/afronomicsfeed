import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/**
 * The compare page's card. An Open Graph image file cannot read the page's query string, so the card names what the
 * page does rather than one pair.
 */
export const alt = "Compare any two rates, on one chart, from their publishers";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Rates · Compare", "Compare any two rates, on one chart", "Treasury bills, policy rates, funds and inflation, each from its publisher", "markets"));
}
