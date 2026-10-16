import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { toolSignature } from "@/lib/share-cards";

/** This tool's share card: its question and the example the calculator opens with (lib/share-cards.ts). */
export const alt = "Kenya loan true cost calculator: any quote as its true yearly rate";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(toolSignature("/rates/kenya/loan-cost"));
}
