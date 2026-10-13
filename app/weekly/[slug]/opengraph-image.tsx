import { getArticle } from "@/lib/content";
import { articleCard } from "@/lib/og-article";
import { cardSize } from "@/lib/og-card";

export const alt = "Weekly Intelligence — Afronomics";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleCard(getArticle("weekly", slug), "Weekly Intelligence");
}
