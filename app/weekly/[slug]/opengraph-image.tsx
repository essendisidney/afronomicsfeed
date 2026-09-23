import { getArticle } from "@/lib/content";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Weekly Intelligence";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle("weekly", slug);
  return ogImage({
    kicker: "Weekly Intelligence",
    title: article?.title ?? "Afronomics Feed",
  });
}
