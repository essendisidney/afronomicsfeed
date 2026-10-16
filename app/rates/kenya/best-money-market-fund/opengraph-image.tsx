import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { rateSignature } from "@/lib/share-cards";

/** The monthly ranking's card: the top published yield after tax, the fund and its date. */
export const alt = "The best Kenyan money market fund: the top yield after tax";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(rateSignature("mmf", "Kenya rates · best money market fund", "The best Kenyan money market fund this month"));
}
