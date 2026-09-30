import { cardSize } from "@/lib/og-card";
import { monitorCard } from "@/lib/og-builders";

export const alt = "Africa Treasury bill monitor: 364-day rates across ten markets";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return monitorCard();
}
