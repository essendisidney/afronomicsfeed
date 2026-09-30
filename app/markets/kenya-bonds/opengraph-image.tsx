import { cardSize } from "@/lib/og-card";
import { bondsCard } from "@/lib/og-builders";

export const alt = "Kenya Treasury bond auctions and yield curve";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return bondsCard();
}
