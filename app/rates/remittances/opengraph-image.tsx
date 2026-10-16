import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The remittances card. */
export const alt = "What it costs to send money home";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Rates · remittances", "What it costs to send money home", "Fees and exchange-rate margins on the main corridors, from the providers", "cost-of-living"));
}
