import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { toolSignature } from "@/lib/share-cards";

/** This page's share card: its question (lib/share-cards.ts). */
export const alt = "Call it: guess Kenya's Treasury bill rates before the CBK auction";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(toolSignature("/markets/kenya-tbills/call-it"));
}
