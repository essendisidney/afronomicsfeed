import { getArticle } from "@/lib/content";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Daily Brief";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle("brief", slug);
  return ogImage({
    kicker: "Daily Brief",
    title: article?.title ?? "Afronomics Feed",
  });
}
