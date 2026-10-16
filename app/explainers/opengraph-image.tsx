import { cardSize } from "@/lib/og-card";
import { renderSignature } from "@/lib/og-signature";
import { sectionSignature } from "@/lib/share-cards";

/** The explainers list's card (each explainer has its own). */
export const alt = "Afronomics explainers";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderSignature(sectionSignature("Afronomics · Explainers", "How African money works, explained from the source", "Bills, bonds, currencies and the rates you pay"));
}
