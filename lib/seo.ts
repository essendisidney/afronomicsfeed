import type { Metadata } from "next";
import { articleHref, categoryLabel } from "./format";
import { site } from "./site";
import type { Article } from "./types";

/** Search results show about 60–65 characters of a title and 150–160 of a description before cutting them. */
export const TITLE_MAX = 65;
export const DESCRIPTION_MAX = 158;
const TITLE_SUFFIX = ` — ${site.name}`;

/**
 * A page title that fits a search result. The layout appends " — Afronomics"; when that would push a title past
 * the limit, the title is used as it is (absolute) instead. A title still too long is cut at its last
 * " — ", ":" or "," break that fits, so the head of the title (the part people search for) survives intact.
 */
export function fitTitle(title: string): string | { absolute: string } {
  if (title.length + TITLE_SUFFIX.length <= TITLE_MAX) return title;
  if (title.length <= TITLE_MAX) return { absolute: title };
  const head = title.slice(0, TITLE_MAX + 1);
  const cut = Math.max(head.lastIndexOf(" — "), head.lastIndexOf(": "), head.lastIndexOf(", "));
  const short = cut >= 25 ? title.slice(0, cut) : `${title.slice(0, title.lastIndexOf(" ", TITLE_MAX - 1))}…`;
  return short.length + TITLE_SUFFIX.length <= TITLE_MAX ? short : { absolute: short };
}

/**
 * A meta description that fits a search result: kept whole when short enough, else cut at the last full sentence
 * that fits (when that keeps most of it), else at a word with an ellipsis.
 */
export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max);
  const sentence = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (sentence >= 90) return clean.slice(0, sentence + 1);
  return `${head.slice(0, head.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "")}…`;
}

export function articleMetadata(article: Article): Metadata {
  const url = `${site.url}${articleHref(article.category, article.slug)}`;

  return {
    title: fitTitle(article.title),
    description: fitDescription(article.summary),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url,
      publishedTime: `${article.date}T06:00:00+03:00`,
      authors: article.authors,
      section: categoryLabel(article.category),
      tags: article.labels,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    description: article.summary,
    author: article.authors.map((name) => ({ "@type": "Person", name })),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}${articleHref(article.category, article.slug)}`,
    articleSection: categoryLabel(article.category),
    keywords: article.labels.join(", "),
  };
}
