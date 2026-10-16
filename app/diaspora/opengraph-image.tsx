import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { toolSignature } from "@/lib/share-cards";

/** The Diaspora Desk card: the page's question and what it answers. */
export const alt = "Money home, and what it earns there: the Afronomics Diaspora Desk";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(toolSignature("/diaspora"));
}
