import { cardSize } from "@/lib/og-card";
import { bondAuctionCard } from "@/lib/og-builders";

export const alt = "Kenya Treasury bond auction report";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return bondAuctionCard(date);
}
