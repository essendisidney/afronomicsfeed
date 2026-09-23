import { articleJsonLd } from "@/lib/seo";
import type { Article } from "@/lib/types";

export function ArticleJsonLd({ article }: { article: Article }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
    />
  );
}
