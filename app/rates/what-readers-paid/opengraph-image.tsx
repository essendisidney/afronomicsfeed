import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The reader-reported rates card. */
export const alt = "What readers were really charged";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Rates · what readers paid", "What readers were really charged", "Loan and savings rates readers reported, beside the published averages", "cost-of-living"));
}
