import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { institutionSlugs, topicSlugs } from "./taxonomy";
import type { Article, ArticleFrontmatter, Category, ContentLabel } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const CATEGORY_DIRS: Record<Category, string> = {
  brief: "briefs",
  weekly: "weekly",
  explainer: "explainers",
};

const LABELS: ContentLabel[] = ["Facts", "Analysis", "Opinion"];

function assertFrontmatter(data: unknown, filePath: string): ArticleFrontmatter {
  const fm = data as Partial<ArticleFrontmatter>;
  const missing: string[] = [];

  if (!fm.title) missing.push("title");
  if (!fm.date) missing.push("date");
  if (!Array.isArray(fm.authors) || fm.authors.length === 0) missing.push("authors");
  if (!fm.category) missing.push("category");
  if (!Array.isArray(fm.labels) || fm.labels.length === 0) missing.push("labels");
  if (!Array.isArray(fm.sources) || fm.sources.length === 0) missing.push("sources");
  if (!Array.isArray(fm.teaser) || fm.teaser.length === 0) missing.push("teaser");
  if (!fm.summary) missing.push("summary");

  if (missing.length > 0) {
    throw new Error(`Missing frontmatter in ${filePath}: ${missing.join(", ")}`);
  }

  const invalidLabels = fm.labels!.filter((label) => !LABELS.includes(label));
  if (invalidLabels.length > 0) {
    throw new Error(`Invalid labels in ${filePath}: ${invalidLabels.join(", ")}`);
  }

  for (const source of fm.sources!) {
    if (!source.name || !source.url || !source.date) {
      throw new Error(`Each source in ${filePath} needs name, url, and date.`);
    }
  }

  const articleTopics = Array.isArray(fm.topics) ? fm.topics : [];
  const articleInstitutions = Array.isArray(fm.institutions) ? fm.institutions : [];
  const unknownTopics = articleTopics.filter((topic) => !topicSlugs.includes(topic as (typeof topicSlugs)[number]));
  const unknownInstitutions = articleInstitutions.filter(
    (item) => !institutionSlugs.includes(item as (typeof institutionSlugs)[number]),
  );
  if (unknownTopics.length > 0) {
    throw new Error(`Unknown topics in ${filePath}: ${unknownTopics.join(", ")}`);
  }
  if (unknownInstitutions.length > 0) {
    throw new Error(`Unknown institutions in ${filePath}: ${unknownInstitutions.join(", ")}`);
  }

  const urgencies = ["file", "watch", "cadence", "reference"] as const;
  if (fm.urgency && !urgencies.includes(fm.urgency)) {
    throw new Error(`Invalid urgency in ${filePath}: ${fm.urgency}`);
  }

  return {
    title: fm.title!,
    date: fm.date!,
    authors: fm.authors!,
    category: fm.category!,
    labels: fm.labels!,
    sources: fm.sources!,
    teaser: fm.teaser!,
    summary: fm.summary!,
    asOf: fm.asOf,
    gated: fm.gated ?? fm.category !== "explainer",
    topics: articleTopics,
    institutions: articleInstitutions,
    urgency: fm.urgency,
    minutes: fm.minutes,
    fileFor: fm.fileFor,
    soWhat: fm.soWhat,
    unknowns: Array.isArray(fm.unknowns) ? fm.unknowns : undefined,
  };
}

function parseArticle(filePath: string, slug: string): Article {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = assertFrontmatter(data, filePath);

  return {
    ...frontmatter,
    slug,
    body: content.trim(),
  };
}

export const getArticlesByCategory = cache((category: Category): Article[] => {
  const dir = path.join(CONTENT_ROOT, CATEGORY_DIRS[category]);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      return parseArticle(path.join(dir, file), slug);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
});

export const getAllArticles = cache((): Article[] => {
  return (["brief", "weekly", "explainer"] as const)
    .flatMap((category) => getArticlesByCategory(category))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
});

export function getArticle(category: Category, slug: string): Article | null {
  return getArticlesByCategory(category).find((article) => article.slug === slug) ?? null;
}

export function getLatestArticles(limit = 3): Article[] {
  return getAllArticles().slice(0, limit);
}

export function searchArticles(query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getAllArticles().filter((article) => {
    const haystack = [
      article.title,
      article.summary,
      article.teaser.join(" "),
      article.authors.join(" "),
      article.labels.join(" "),
      article.topics?.join(" ") ?? "",
      article.institutions?.join(" ") ?? "",
      article.body,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function toIndexItem(article: Article) {
  const { body, ...item } = article;
  void body;
  return item;
}

export function getArticlesByTopic(topic: string) {
  return getAllArticles().filter((article) => article.topics?.includes(topic));
}

export function getArticlesByInstitution(institution: string) {
  return getAllArticles().filter((article) => article.institutions?.includes(institution));
}
