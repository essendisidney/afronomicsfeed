import { getNeighbors, getRelatedArticles } from "@/lib/relations";
import type { Article } from "@/lib/types";
import { ArticleTemplate } from "./ArticleTemplate";

export function ArticlePage({ article }: { article: Article }) {
  const related = getRelatedArticles(article);
  const { newer, older } = getNeighbors(article);
  return <ArticleTemplate article={article} related={related} newer={newer} older={older} />;
}
