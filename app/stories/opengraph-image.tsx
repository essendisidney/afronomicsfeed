import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { storiesSignature } from "@/lib/share-cards";

/** The stories list's share card. */
export const alt = "Afronomics stories: briefs, weekly notes and explainers";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(storiesSignature());
}
