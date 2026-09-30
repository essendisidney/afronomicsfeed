import { cardSize } from "@/lib/og-card";
import { billMarketCard } from "@/lib/og-builders";

export const alt = "Treasury bill auction results";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  return billMarketCard(country);
}
