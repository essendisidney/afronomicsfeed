import { getAllArticles, getArticlesByCategory, toIndexItem } from "./content";
import type { Article, ArticleIndexItem } from "./types";

export function getRelatedArticles(article: Article, limit = 3): ArticleIndexItem[] {
  return getAllArticles()
    .filter((item) => item.slug !== article.slug || item.category !== article.category)
    .map((item) => ({
      item,
      score:
        (item.category === article.category ? 2 : 0) +
        item.labels.filter((label) => article.labels.includes(label)).length +
        (item.topics ?? []).filter((topic) => article.topics?.includes(topic)).length * 2 +
        (item.institutions ?? []).filter((inst) => article.institutions?.includes(inst)).length * 2,
    }))
    .sort((a, b) => b.score - a.score || (a.item.date < b.item.date ? 1 : -1))
    .slice(0, limit)
    .map(({ item }) => toIndexItem(item));
}

export function getNeighbors(article: Article): {
  newer: ArticleIndexItem | null;
  older: ArticleIndexItem | null;
} {
  const list = getArticlesByCategory(article.category);
  const index = list.findIndex((item) => item.slug === article.slug);

  return {
    newer: index > 0 ? toIndexItem(list[index - 1]) : null,
    older: index >= 0 && index < list.length - 1 ? toIndexItem(list[index + 1]) : null,
  };
}

export function getDeskLead() {
  const briefs = getArticlesByCategory("brief");
  const lead = briefs[0] ?? getAllArticles()[0];
  const supporting = getAllArticles()
    .filter((item) => item.slug !== lead?.slug || item.category !== lead?.category)
    .slice(0, 4)
    .map(toIndexItem);

  return {
    lead: lead ? toIndexItem(lead) : null,
    supporting,
  };
}
