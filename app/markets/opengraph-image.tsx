import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { rateSignature } from "@/lib/share-cards";

/** Markets pages without a card of their own (hubs, bonds, currencies, Eurobonds) share this one: the latest one-year bill rate and its change. */
export const alt = "Afronomics markets: the latest Kenya one-year bill rate and its change";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(rateSignature("bill-364", "Afronomics markets", "Africa’s markets, sourced: bills, bonds and currencies"));
}
