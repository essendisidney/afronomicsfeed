import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { homeSignature } from "@/lib/share-cards";

/** Today's share card: the lead story's headline, its number and its verdict (the root card stays the site-wide one for pages without their own). */
export const alt = "Afronomics today: the lead story and its number";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 900;

export default function Image() {
  return renderSignature(homeSignature());
}
