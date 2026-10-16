import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { rateSignature } from "@/lib/share-cards";

/** The fund ranking's card: the top published yield after tax, the fund and its date. */
export const alt = "Kenya money market funds: the top yield after tax";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(rateSignature("mmf", "Kenya rates · money market funds", "Money market fund yields, ranked"));
}
