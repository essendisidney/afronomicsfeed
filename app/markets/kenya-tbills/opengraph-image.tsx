import { cardSize } from "@/lib/og-card";
import { billMarketCard } from "@/lib/og-builders";

export const alt = "Kenya Treasury bill auction results";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return billMarketCard("kenya");
}
