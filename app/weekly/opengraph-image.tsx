import { cardSize } from "@/lib/og-card";
import { monitorCard } from "@/lib/og-builders";

export const alt = "The Afronomics Weekly: Africa's week in numbers";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return monitorCard("The Afronomics Weekly", "Africa's week in numbers: government borrowing rates across ten markets");
}
