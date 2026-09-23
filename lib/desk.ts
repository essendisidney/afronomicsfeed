import type { ArticleFrontmatter } from "./types";

const urgencyCopy: Record<NonNullable<ArticleFrontmatter["urgency"]>, string> = {
  file: "File now",
  watch: "Watch",
  cadence: "Cadence",
  reference: "Reference",
};

export function urgencyLabel(urgency?: ArticleFrontmatter["urgency"]) {
  return urgency ? urgencyCopy[urgency] : null;
}
