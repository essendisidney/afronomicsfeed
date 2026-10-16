import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { toolsSignature } from "@/lib/share-cards";

/** The tools hub's share card. */
export const alt = "Afronomics tools: calculators and checkers, one question each";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(toolsSignature());
}
