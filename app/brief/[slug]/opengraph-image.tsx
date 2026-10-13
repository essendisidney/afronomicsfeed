import { getArticle } from "@/lib/content";
import { articleCard } from "@/lib/og-article";
import { cardSize } from "@/lib/og-card";

export const alt = "Daily Brief — Afronomics";
export const size = cardSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleCard(getArticle("brief", slug), "Daily Brief");
}
