import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The SACCO returns card. */
export const alt = "What Kenyan SACCOs pay their members";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Kenya rates · SACCOs", "What SACCOs pay their members", "Dividends and interest on deposits, beside the bank and Treasury bill alternatives", "banking"));
}
